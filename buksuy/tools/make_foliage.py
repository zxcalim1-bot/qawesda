#!/usr/bin/env python3
"""
Собирает текстуры листвы из сканов настоящих листьев (ambientCG LeafSet005, CC0)
и рисует хвою и берёзовую кору.

    python3 tools/make_foliage.py [папка-кэша]

Пишет в src/assets/tex/: leaves_birch.webp, branch_spruce.webp, tuft_pine.webp (с альфой)
и bark_birch_c.webp / bark_birch_n.webp.
"""
import io
import math
import os
import random
import sys
import zipfile

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import fetch_textures  # noqa: E402

OUT = fetch_textures.OUT
if len(sys.argv) > 1:
    fetch_textures.CACHE = sys.argv[1]


def leaf_sprites():
    data = fetch_textures.fetch('https://ambientcg.com/get?file=LeafSet005_1K-JPG.zip')
    z = zipfile.ZipFile(io.BytesIO(data))

    def img(suffix):
        name = next(n for n in z.namelist() if n.endswith(suffix))
        return Image.open(io.BytesIO(z.read(name)))

    color = img('_Color.jpg').convert('RGB')
    alpha = img('_Opacity.jpg').convert('L')
    rgba = color.copy()
    rgba.putalpha(alpha)
    # два отдельных листа; черешок снизу
    boxes = [(457, 40, 690, 412), (770, 30, 1008, 432)]
    return [rgba.crop(b) for b in boxes]


def box_blur(a, r):
    """Box blur по обеим осям через кумулятивные суммы (PIL не умеет float-картинки)."""
    for axis in (0, 1):
        pad = [(0, 0)] * a.ndim
        pad[axis] = (r + 1, r)
        c = np.cumsum(np.pad(a, pad, mode='edge'), axis=axis)
        hi = np.take(c, range(2 * r + 1, c.shape[axis]), axis=axis)
        lo = np.take(c, range(0, c.shape[axis] - 2 * r - 1), axis=axis)
        a = (hi - lo) / (2 * r + 1)
    return a


def dilate(im):
    """Заливает прозрачные пиксели цветом ближайших листьев — иначе в мипмапах по краям тёмная кайма."""
    a = np.asarray(im).astype(np.float32) / 255
    rgb, al = a[..., :3], a[..., 3]
    solid = (al > 0.05).astype(np.float32)
    pre = np.concatenate([rgb * solid[..., None], solid[..., None]], -1)
    out = rgb.copy()
    done = solid > 0
    for r in (1, 2, 4, 8, 16, 32, 64):
        b = box_blur(pre, r)
        ok = (~done) & (b[..., 3] > 1e-4)
        out[ok] = b[ok, :3] / b[ok, 3:4]
        done |= ok
    res = np.concatenate([np.clip(out, 0, 1), al[..., None]], -1)
    return Image.fromarray((res * 255).astype(np.uint8), 'RGBA')


def tint(sprite, k, warm=0.0):
    a = np.asarray(sprite).astype(np.float32)
    a[..., 0] = a[..., 0] * k * (1 + warm * 0.35)
    a[..., 1] = a[..., 1] * k * (1 + warm * 0.12)
    a[..., 2] = a[..., 2] * k * (1 - warm * 0.2)
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8), 'RGBA')


def birch_cluster(size, leaves, rnd):
    """Ветка берёзы с листьями, вид сбоку. Основание — середина нижнего края."""
    S = size * 2
    im = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    tips = []

    def twig(x, y, ang, length, width, depth):
        steps = 8
        for i in range(steps):
            nx = x + math.cos(ang) * length / steps
            ny = y - math.sin(ang) * length / steps
            d.line([(x, y), (nx, ny)], fill=(96, 84, 70, 255), width=max(1, int(width)))
            x, y = nx, ny
            ang += rnd.uniform(-0.1, 0.1)
            width *= 0.88
            if i > 1:
                tips.append((x, y, ang))
            # боковые веточки по всей длине, а не только на конце
            if depth < 3 and i > 0 and rnd.random() < 0.6:
                side = rnd.choice((-1, 1))
                twig(x, y, ang + side * rnd.uniform(0.5, 1.1), length * rnd.uniform(0.35, 0.6), width, depth + 1)

    twig(S / 2, S - 4, math.pi / 2 + rnd.uniform(-0.15, 0.15), S * 0.62, 9, 0)
    rnd.shuffle(tips)
    n = len(tips)
    for i, (x, y, ang) in enumerate(tips):
        for _ in range(2):
            sp = rnd.choice(leaves)
            h = rnd.uniform(0.06, 0.085) * S
            w = h * sp.width / sp.height * 1.3
            leaf = sp.resize((max(2, int(w)), max(2, int(h))), Image.LANCZOS)
            depth = i / n
            leaf = tint(leaf, 0.6 + depth * 0.55 + rnd.uniform(-0.06, 0.06), warm=rnd.uniform(-0.25, 0.45))
            rot = math.degrees(ang) - 90 + rnd.choice((-1, 1)) * rnd.uniform(25, 85)
            leaf = leaf.rotate(rot, resample=Image.BICUBIC, expand=True)
            px = int(x + rnd.uniform(-S * 0.02, S * 0.02) - leaf.width / 2)
            py = int(y + rnd.uniform(-S * 0.02, S * 0.02) - leaf.height / 2)
            im.alpha_composite(leaf, (max(0, min(S - leaf.width, px)), max(0, min(S - leaf.height, py))))
    return im.resize((size, size), Image.LANCZOS)


def spruce_frond(w, h, rnd):
    """Еловая лапа сверху: от левого края (ствол) вправо, густая, с веточками второго порядка."""
    S = 2
    W, H = w * S, h * S
    im = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    dark = [(22, 42, 28), (27, 50, 31), (33, 58, 36), (25, 47, 37), (38, 64, 40)]
    young = [(66, 94, 50), (78, 106, 56)]

    def needles(x0, y0, x1, y1, length, young_tip):
        segs = int(math.hypot(x1 - x0, y1 - y0) / (1.6 * S)) + 1
        ang = math.atan2(y1 - y0, x1 - x0)
        for i in range(segs):
            t = i / segs
            x, y = x0 + (x1 - x0) * t, y0 + (y1 - y0) * t
            for side in (-1, 1, rnd.choice((-1, 1))):
                a = ang + side * rnd.uniform(0.45, 1.25)
                ln = length * (0.55 + 0.45 * math.sin(math.pi * min(1, t * 0.85 + 0.15))) * rnd.uniform(0.75, 1.15)
                c = rnd.choice(young if (young_tip and t > 0.8) else dark)
                k = rnd.uniform(0.8, 1.25)
                d.line([(x, y), (x + math.cos(a) * ln, y + math.sin(a) * ln)],
                       fill=(int(c[0] * k), int(c[1] * k), int(c[2] * k), 255), width=S + 1)

    def branch(x0, y0, ang, length, nl, depth):
        steps = 9
        x, y = x0, y0
        for i in range(steps):
            t = i / steps
            nx, ny = x + math.cos(ang) * length / steps, y + math.sin(ang) * length / steps
            needles(x, y, nx, ny, nl * (1.05 - t * 0.4), i >= steps - 2)
            d.line([(x, y), (nx, ny)], fill=(74, 58, 42, 255), width=max(1, int(S * (3 - depth) * (1 - t * 0.6))))
            if depth < 2 and i > 0:
                for side in (-1, 1):
                    if rnd.random() < 0.15:
                        continue
                    sl = length * (0.3 if depth == 0 else 0.38) * (1 - t) ** 0.7 * rnd.uniform(0.75, 1.05)
                    branch(nx, ny, ang + side * rnd.uniform(0.55, 0.8), sl, nl * 0.85, depth + 1)
            x, y = nx, ny
            ang += rnd.uniform(-0.05, 0.05)

    branch(0, H / 2, rnd.uniform(-0.03, 0.03), W * 0.97, H * 0.045, 0)
    return im.resize((w, h), Image.LANCZOS)


def pine_tuft(size, rnd):
    """Пучок сосновой хвои: несколько веточек с «ёршиками» на концах."""
    S = size * 2
    im = Image.new('RGBA', (S, S), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    cols = [(58, 84, 38), (66, 92, 42), (48, 72, 34), (78, 100, 48)]
    cx, cy = S / 2, S - 6
    for _ in range(rnd.randint(4, 6)):
        ang = math.pi / 2 + rnd.uniform(-1.0, 1.0)
        ln = S * rnd.uniform(0.25, 0.45)
        ex, ey = cx + math.cos(ang) * ln, cy - math.sin(ang) * ln
        d.line([(cx, cy), (ex, ey)], fill=(110, 72, 48, 255), width=5)
        # ёршик хвои
        for k in range(260):
            t = rnd.uniform(0.45, 1.0)
            px, py = cx + (ex - cx) * t, cy + (ey - cy) * t
            a = ang + rnd.uniform(-1.6, 1.6)
            nl = S * rnd.uniform(0.07, 0.13)
            c = rnd.choice(cols)
            kk = rnd.uniform(0.75, 1.15)
            d.line([(px, py), (px + math.cos(a) * nl, py - math.sin(a) * nl)],
                   fill=(int(c[0] * kk), int(c[1] * kk), int(c[2] * kk), 255), width=3)
    return im.resize((size, size), Image.LANCZOS)


def birch_bark(size, rnd):
    """Белая кора с тёмными чечевичками и пятнами. Тайлится по обеим осям."""
    base = np.full((size, size, 3), (226, 223, 214), np.float32)
    noise = np.random.default_rng(3).normal(0, 1, (size // 8, size // 8))
    noise = np.asarray(Image.fromarray(((noise * 20) + 128).clip(0, 255).astype(np.uint8)).resize((size, size), Image.BICUBIC)).astype(np.float32) - 128
    base += noise[..., None] * 0.35
    im = Image.fromarray(base.clip(0, 255).astype(np.uint8))
    hmap = Image.new('L', (size, size), 200)
    d, dh = ImageDraw.Draw(im), ImageDraw.Draw(hmap)

    def wrap(fn):
        for ox in (-size, 0, size):
            for oy in (-size, 0, size):
                fn(ox, oy)

    for _ in range(260):
        x, y = rnd.uniform(0, size), rnd.uniform(0, size)
        w, h = rnd.uniform(6, 34), rnd.uniform(1.5, 4)
        g = int(rnd.uniform(40, 90))

        def dash(ox, oy):
            d.ellipse([x + ox - w / 2, y + oy - h / 2, x + ox + w / 2, y + oy + h / 2], fill=(g, g - 4, g - 8))
            dh.ellipse([x + ox - w / 2, y + oy - h / 2, x + ox + w / 2, y + oy + h / 2], fill=120)
        wrap(dash)
    for _ in range(9):
        x, y = rnd.uniform(0, size), rnd.uniform(0, size)
        r = rnd.uniform(10, 26)
        pts = [(x + math.cos(a) * r * rnd.uniform(0.6, 1.3), y + math.sin(a) * r * rnd.uniform(0.3, 0.7)) for a in np.linspace(0, 6.28, 9)]

        def patch(ox, oy):
            d.polygon([(px + ox, py + oy) for px, py in pts], fill=(30, 28, 26))
            dh.polygon([(px + ox, py + oy) for px, py in pts], fill=90)
        wrap(patch)
    im = im.filter(ImageFilter.GaussianBlur(0.6))
    h = np.asarray(hmap.filter(ImageFilter.GaussianBlur(1.2))).astype(np.float32) / 255
    gx = np.roll(h, -1, 1) - np.roll(h, 1, 1)
    gy = np.roll(h, -1, 0) - np.roll(h, 1, 0)
    n = np.stack([-gx * 3, gy * 3, np.ones_like(h)], -1)
    n /= np.linalg.norm(n, axis=-1, keepdims=True)
    nrm = Image.fromarray(((n * 0.5 + 0.5) * 255).astype(np.uint8))
    return im, nrm


def atlas(cells, cols, rows, cw, ch):
    out = Image.new('RGBA', (cols * cw, rows * ch), (0, 0, 0, 0))
    for i, c in enumerate(cells):
        out.alpha_composite(c, ((i % cols) * cw, (i // cols) * ch))
    return out


def save(im, name):
    im = dilate(im)
    im.save(os.path.join(OUT, name), 'WEBP', quality=85, alpha_quality=90, method=6)
    print(name, os.path.getsize(os.path.join(OUT, name)) // 1024, 'КБ')


def main():
    rnd = random.Random(19)
    leaves = leaf_sprites()
    save(atlas([birch_cluster(512, leaves, rnd) for _ in range(4)], 2, 2, 512, 512), 'leaves_birch.webp')
    save(atlas([spruce_frond(1024, 512, rnd) for _ in range(2)], 1, 2, 1024, 512), 'branch_spruce.webp')
    save(atlas([pine_tuft(512, rnd) for _ in range(4)], 2, 2, 512, 512), 'tuft_pine.webp')
    c, n = birch_bark(512, rnd)
    c.save(os.path.join(OUT, 'bark_birch_c.webp'), 'WEBP', quality=82, method=6)
    n.save(os.path.join(OUT, 'bark_birch_n.webp'), 'WEBP', quality=85, method=6)
    print('кора берёзы готова')


if __name__ == '__main__':
    main()
