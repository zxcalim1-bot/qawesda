"""Python port of com.pyolympiad.engine.text (TextNormalizer, Transliterator, Skeleton).

The search index stores skeleton forms produced here, while queries are expanded by the
Kotlin engine on the watch — both implementations must agree. A fixture written by
build_content.py is verified by the Kotlin unit test SkeletonParityTest.
"""
import re

APOSTROPHES = set("'’‘ʻʼ`´ʹ′")


def normalize(s):
    out = []
    for ch in s:
        if ch in APOSTROPHES:
            out.append("'")
        elif ch in "ёЁ":
            out.append("е")
        elif ch in "≤⩽":
            out.append("<=")
        elif ch in "≥⩾":
            out.append(">=")
        elif ch == "≠":
            out.append("!=")
        elif ch in "×·∙":
            out.append("*")
        elif ch in "−–—":
            out.append("-")
        elif ch in "«»“”„":
            out.append('"')
        elif ch in " \t":
            out.append(" ")
        else:
            out.append(_lower_char(ch))
    return re.sub(r"[ ]{2,}", " ", "".join(out)).strip()


def _lower_char(ch):
    # Kotlin Char.lowercaseChar() maps one char to one char; Python lower() may expand
    # ("İ" -> "i̇"), so keep the original in that case.
    low = ch.lower()
    return low if len(low) == 1 else ch


MULTI = [
    ("shch", "щ"), ("sch", "щ"), ("shh", "щ"),
    ("zh", "ж"), ("kh", "х"), ("ch", "ч"), ("sh", "ш"), ("ts", "ц"), ("tz", "ц"),
    ("yo", "ё"), ("jo", "ё"), ("yu", "ю"), ("ju", "ю"), ("ya", "я"), ("ja", "я"),
    ("ck", "к"), ("ph", "ф"), ("iy", "ий"), ("yy", "ый"), ("ij", "ий"), ("yj", "ый"),
]
SINGLE = {
    "a": "а", "b": "б", "v": "в", "g": "г", "d": "д", "e": "е", "z": "з", "i": "и", "j": "й", "k": "к",
    "l": "л", "m": "м", "n": "н", "o": "о", "p": "п", "r": "р", "s": "с", "t": "т", "u": "у", "f": "ф",
    "h": "х", "c": "ц", "x": "кс", "w": "в", "q": "к", "'": "ь",
}
VOWELS_LAT = set("aeiouy")


def latin_to_cyrillic(word):
    w = "".join(_lower_char(c) for c in word)
    out = []
    i = 0
    while i < len(w):
        if i == 0 and w.startswith("ye"):
            out.append("е")
            i += 2
            continue
        matched = False
        for lat, cyr in MULTI:
            if w.startswith(lat, i):
                if lat in ("iy", "yy", "ij", "yj") and i + len(lat) != len(w):
                    continue
                out.append(cyr)
                i += len(lat)
                matched = True
                break
        if matched:
            continue
        ch = w[i]
        if ch == "y":
            prev = w[i - 1] if i > 0 else " "
            out.append("й" if prev in VOWELS_LAT else ("й" if i == 0 else "ы"))
            i += 1
            continue
        out.append(SINGLE.get(ch, ch))
        i += 1
    return "".join(out)


def is_cyrillic(ch):
    return "Ѐ" <= ch <= "ӿ"


def skel_cyrillic(word):
    out = []
    last = " "
    for raw in "".join(_lower_char(c) for c in word):
        ch = {"ё": "е", "э": "е", "й": "и", "ы": "и", "щ": "ш"}.get(raw, raw)
        if raw in "ъь'":
            continue
        if ch == last:
            continue
        out.append(ch)
        last = ch
    return "".join(out)


def skel_latin(word):
    out = []
    last = " "
    for raw in "".join(_lower_char(c) for c in word):
        if raw in "'-":
            continue
        if raw == last:
            continue
        out.append(raw)
        last = raw
    return "".join(out)


def skeleton_forms(word):
    if not word:
        return []
    if any(is_cyrillic(c) for c in word):
        return [skel_cyrillic(word)]
    lat = skel_latin(word)
    cyr = skel_cyrillic(latin_to_cyrillic(word))
    return [lat] if lat == cyr else [lat, cyr]


WORD = re.compile(r"[^\W_]+", re.UNICODE)


def index_skeletons(text):
    """Skeleton forms for the FTS 'skel' column: Cyrillic words -> Cyrillic skeleton,
    Latin words -> Latin skeleton (queries add the translit form on their side)."""
    out = []
    seen = set()
    for w in WORD.findall(normalize(text)):
        if len(w) < 2:
            continue
        s = skel_cyrillic(w) if any(is_cyrillic(c) for c in w) else skel_latin(w)
        if s and s not in seen:
            seen.add(s)
            out.append(s)
    return " ".join(out)
