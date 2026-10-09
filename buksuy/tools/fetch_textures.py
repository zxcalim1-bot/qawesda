#!/usr/bin/env python3
"""
Качает CC0-текстуры (Poly Haven, ambientCG) и пережимает их в webp для игры.

    python3 tools/fetch_textures.py [папка-кэша]

Результат — src/assets/tex/<имя>_c.webp (цвет, AO уже вмешан), _n.webp (нормали, OpenGL)
и для слоёв земли _h.webp (высота, нужна для смешивания слоёв).
Скачанные оригиналы лежат в кэше, повторный запуск ничего не качает.
"""
import io
import json
import os
import sys
import urllib.request
import zipfile

from PIL import Image, ImageChops

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'src', 'assets', 'tex')
CACHE = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, '.texcache')

# имя в игре: (источник, id, размер, нужна ли карта высот)
TEXTURES = {
    # слои земли
    'grass': ('acg', 'Grass004', 1024, True),
    'forest': ('ph', 'forest_leaves_02', 1024, True),
    'mud': ('ph', 'brown_mud_02', 1024, True),
    'rock': ('ph', 'mossy_rock', 1024, True),
    'snow': ('ph', 'snow_02', 1024, True),
    'sand': ('ph', 'coast_sand_01', 1024, True),
    'scree': ('ph', 'gray_rocks', 1024, True),
    'dirt': ('ph', 'park_dirt', 1024, True),
    # дороги
    'asphalt': ('ph', 'asphalt_02', 1024, False),
    'gravel': ('ph', 'rocky_trail', 1024, False),
    # кора
    'bark_pine': ('ph', 'pine_bark', 512, False),
    'bark_spruce': ('ph', 'bark_brown_02', 512, False),
    # постройки и железо
    'siding': ('ph', 'weathered_plank_siding', 1024, False),
    'planks': ('ph', 'weathered_planks', 512, False),
    'slate': ('ph', 'corrugated_iron', 512, False),
    'tin': ('ph', 'rusty_corrugated_iron', 512, False),
    'concrete': ('ph', 'concrete_wall_008', 1024, False),
    'brick': ('ph', 'red_brick_03', 512, False),
    'plaster': ('ph', 'worn_plaster_wall', 512, False),
    'rusty': ('ph', 'rusty_metal_02', 512, False),
    'paintmetal': ('ph', 'green_metal_rust', 512, False),
    'rust': ('ph', 'rust_coarse_01', 512, False),
    # одежда
    'denim': ('ph', 'denim_fabric', 512, False),
    'plaid': ('ph', 'fabric_pattern_05', 512, False),
    'jersey': ('ph', 'cotton_jersey', 512, False),
}


def fetch(url):
    os.makedirs(CACHE, exist_ok=True)
    name = os.path.join(CACHE, url.split('/')[-1].replace('?', '_').replace('=', '_'))
    if not os.path.exists(name):
        print('  качаю', url)
        req = urllib.request.Request(url, headers={'User-Agent': 'buksuy-texture-fetch'})
        with urllib.request.urlopen(req) as r, open(name, 'wb') as f:
            f.write(r.read())
    with open(name, 'rb') as f:
        return f.read()


def polyhaven(asset_id):
    files = json.loads(fetch(f'https://api.polyhaven.com/files/{asset_id}'))

    def pick(*keys):
        for k in keys:
            if k in files:
                return Image.open(io.BytesIO(fetch(files[k]['1k']['jpg']['url'])))
        return None

    return {
        'color': pick('Diffuse', 'diff', 'col_01'),
        'normal': pick('nor_gl'),
        'ao': pick('AO', 'ao'),
        'height': pick('Displacement', 'disp'),
    }


def ambientcg(asset_id):
    z = zipfile.ZipFile(io.BytesIO(fetch(f'https://ambientcg.com/get?file={asset_id}_1K-JPG.zip')))

    def pick(suffix):
        for n in z.namelist():
            if n.endswith(suffix):
                return Image.open(io.BytesIO(z.read(n)))
        return None

    return {
        'color': pick('_Color.jpg'),
        'normal': pick('_NormalGL.jpg'),
        'ao': pick('_AmbientOcclusion.jpg'),
        'height': pick('_Displacement.jpg'),
    }


def main():
    os.makedirs(OUT, exist_ok=True)
    for name, (src, asset_id, size, want_height) in TEXTURES.items():
        print(name, '<-', asset_id)
        maps = polyhaven(asset_id) if src == 'ph' else ambientcg(asset_id)
        color = maps['color'].convert('RGB').resize((size, size), Image.LANCZOS)
        if maps['ao'] is not None:
            # AO вмешиваем в цвет наполовину — отдельную карту не таскаем
            ao = maps['ao'].convert('L').resize((size, size), Image.LANCZOS)
            ao = ao.point(lambda v: int(255 * (0.5 + 0.5 * v / 255)))
            color = ImageChops.multiply(color, Image.merge('RGB', (ao, ao, ao)))
        color.save(os.path.join(OUT, f'{name}_c.webp'), 'WEBP', quality=80, method=6)
        normal = maps['normal'].convert('RGB').resize((size, size), Image.LANCZOS)
        normal.save(os.path.join(OUT, f'{name}_n.webp'), 'WEBP', quality=82, method=6)
        if want_height and maps['height'] is not None:
            h = maps['height'].convert('L').resize((size, size), Image.LANCZOS)
            h.save(os.path.join(OUT, f'{name}_h.webp'), 'WEBP', quality=80, method=6)
    total = sum(os.path.getsize(os.path.join(OUT, f)) for f in os.listdir(OUT))
    print(f'готово, {total / 1e6:.1f} МБ')


if __name__ == '__main__':
    main()
