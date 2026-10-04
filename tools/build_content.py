#!/usr/bin/env python3
"""Builds the offline knowledge databases shipped in app/src/main/assets.

Sources:
  content/<domain>/**.md      curated entries (Russian), see tools/kmd.py for the format
  CPython 3.11 itself         introspection of builtins, built-in types, exceptions and the
                              standard library (signatures + docstrings, PSF License)
  pydoc_data.topics           the official Python Language Reference topics (PSF License)
  installed third-party libs  optional: introspection of public APIs (their own licenses)

Every Python example is executed and its real output stored; tasks are judged against
their tests; quiz answers for "what does it print / which type / which error" are computed
by running the code; error examples must actually raise the declared exception; "check:"
fields must resolve to real Python objects. The build fails on any mismatch.

Output: one SQLite database per domain with an FTS4 index (unicode61, prefix 2/3) and a
manifest (assets/db_manifest.json) used by the app to install/update databases lazily.

Usage:
  python3 tools/build_content.py              # build everything
  python3 tools/build_content.py --check      # validate only, do not write databases
  python3 tools/build_content.py --no-extlibs # skip third-party introspection
"""
import argparse
import builtins
import hashlib
import importlib
import inspect
import json
import keyword
import os
import re
import sqlite3
import subprocess
import sys
import warnings
from concurrent.futures import ThreadPoolExecutor

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import kmd  # noqa: E402
import textnorm  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CONTENT = os.path.join(ROOT, "content")
ASSETS = os.path.join(ROOT, "app", "src", "main", "assets")
CACHE = os.path.join(ROOT, "tools", ".cache")

SCHEMA_VERSION = 1

DOMAINS = {
    "python": "python/python.db",
    "libraries": "libraries/libraries.db",
    "algorithms": "algorithms/algorithms.db",
    "tasks": "tasks/tasks.db",
    "errors": "errors/errors.db",
    "tests": "tests/tests.db",
    "github": "github/github.db",
}

# id prefix -> domain (used to route generated entries and to resolve links in the app)
PREFIX_DOMAIN = {
    "py": "python", "lib": "libraries", "ext": "libraries", "algo": "algorithms",
    "task": "tasks", "err": "errors", "quiz": "tests", "gh": "github",
}

LEVELS = {"beginner": 1, "easy": 2, "medium": 3, "hard": 4, "very_hard": 5, "olympiad": 6}

SCHEMA = """
CREATE TABLE meta(key TEXT PRIMARY KEY, value TEXT NOT NULL);
CREATE TABLE entry(
    rowid INTEGER PRIMARY KEY,
    id TEXT NOT NULL UNIQUE,
    kind TEXT NOT NULL,
    category TEXT NOT NULL,
    title TEXT NOT NULL,
    summary TEXT NOT NULL,
    level INTEGER NOT NULL DEFAULT 0,
    lang TEXT NOT NULL DEFAULT 'ru',
    source TEXT NOT NULL DEFAULT 'curated',
    sort_key INTEGER NOT NULL DEFAULT 0,
    data TEXT NOT NULL
);
CREATE INDEX entry_kind ON entry(kind, category, sort_key);
CREATE TABLE category(
    kind TEXT NOT NULL,
    name TEXT NOT NULL,
    sort_key INTEGER NOT NULL,
    count INTEGER NOT NULL,
    PRIMARY KEY(kind, name)
) WITHOUT ROWID;
CREATE TABLE relation(
    src TEXT NOT NULL,
    dst TEXT NOT NULL,
    PRIMARY KEY(src, dst)
) WITHOUT ROWID;
CREATE INDEX relation_dst ON relation(dst);
CREATE VIRTUAL TABLE entry_fts USING fts4(content="", title, keywords, body, skel, tokenize=unicode61, prefix="2,3");
"""


class BuildError(Exception):
    pass


ERRORS = []


def fail(msg):
    ERRORS.append(msg)


# ----------------------------------------------------------------------------- running code

def run_python(code, stdin="", timeout=20):
    """Runs code in a fresh python3.11 interpreter. Returns (status, stdout, exception_type)."""
    try:
        p = subprocess.run([sys.executable, "-X", "utf8", "-c", code], input=stdin, capture_output=True,
                           text=True, timeout=timeout, encoding="utf-8")
    except subprocess.TimeoutExpired:
        return "TIMEOUT", "", None
    exc = None
    if p.returncode != 0:
        lines = [l for l in p.stderr.strip().splitlines() if l.strip()]
        last = lines[-1] if lines else ""
        m = re.match(r"^([A-Za-z_][\w.]*)(?::|$)", last)
        exc = m.group(1).split(".")[-1] if m else "Error"
        return "ERROR", p.stdout, (exc, last)
    return "OK", p.stdout, None


def same_output(a, b):
    x, y = a.split(), b.split()
    if len(x) != len(y):
        return False
    for p, q in zip(x, y):
        if p == q:
            continue
        try:
            fp, fq = float(p), float(q)
        except ValueError:
            return False
        if abs(fp - fq) > 1e-6 * max(1.0, abs(fp), abs(fq)):
            return False
    return True


class Runner:
    """Collects code executions and runs them in parallel."""

    def __init__(self):
        self.jobs = []

    def add(self, code, stdin, callback):
        self.jobs.append((code, stdin, callback))

    def run(self):
        if not self.jobs:
            return
        with ThreadPoolExecutor(max_workers=max(4, (os.cpu_count() or 2) * 2)) as pool:
            results = list(pool.map(lambda j: run_python(j[0], j[1]), self.jobs))
        for (code, stdin, cb), res in zip(self.jobs, results):
            cb(*res)
        self.jobs = []


# ----------------------------------------------------------------------------- rendering

def plain_text(blocks):
    out = []
    for b in blocks:
        if "p" in b:
            out.append(b["p"])
        elif "ul" in b:
            out.extend(b["ul"])
        elif "code" in b:
            out.append(b["code"])
    return "\n".join(out)


def render_sections(entry, runner, skip=()):
    """Turns entry sections into JSON blocks; schedules execution of python code blocks."""
    sections = []
    for heading, blocks in entry.sections:
        if heading in skip:
            continue
        out = []
        i = 0
        while i < len(blocks):
            b = blocks[i]
            if "code" in b:
                block = {"code": b["code"], "lang": b["lang"]}
                stdin = ""
                if i + 1 < len(blocks) and "code" in blocks[i + 1] and blocks[i + 1]["lang"] == "in":
                    stdin = blocks[i + 1]["code"]
                    block["in"] = stdin
                    i += 1
                if b["lang"] == "python" and b["mode"] not in ("norun",):
                    expect_error = b["mode"] == "error"

                    def cb(status, stdout, exc, block=block, expect_error=expect_error, where=entry.where()):
                        if status == "TIMEOUT":
                            fail("%s: example timed out" % where)
                            return
                        if expect_error:
                            if status != "ERROR":
                                fail("%s: example marked 'error' did not raise" % where)
                                return
                            block["err"] = exc[1]
                            if stdout.strip():
                                block["out"] = stdout[-2000:]
                        else:
                            if status != "OK":
                                fail("%s: example raised %s\n%s" % (where, exc[1] if exc else status, block["code"]))
                                return
                            if stdout.strip():
                                block["out"] = stdout[:2000]
                    runner.add(b["code"], stdin, cb)
                out.append(block)
            else:
                out.append(dict(b))
            i += 1
        sections.append({"h": heading, "b": out})
    return sections


# ----------------------------------------------------------------------------- checks

def resolve(path):
    """Resolves 'math.isqrt', 'str.split', 'sorted', 'collections.Counter.most_common'."""
    parts = path.split(".")
    if hasattr(builtins, parts[0]):
        obj = getattr(builtins, parts[0])
        rest = parts[1:]
    else:
        obj = None
        rest = []
        for i in range(len(parts), 0, -1):
            try:
                obj = importlib.import_module(".".join(parts[:i]))
                rest = parts[i:]
                break
            except Exception:
                continue
        if obj is None:
            raise AttributeError(path)
    for p in rest:
        obj = getattr(obj, p)
    return obj


def check_entry(e):
    for path in e.listval("check"):
        if path.startswith("keyword:"):
            kw = path.split(":", 1)[1]
            if not (keyword.iskeyword(kw) or keyword.issoftkeyword(kw)):
                fail("%s: '%s' is not a Python keyword" % (e.where(), kw))
            continue
        try:
            resolve(path)
        except Exception:
            fail("%s: check '%s' does not exist in Python %d.%d" % (e.where(), path, *sys.version_info[:2]))


# ----------------------------------------------------------------------------- entries -> rows

class Row:
    __slots__ = ("id", "kind", "category", "title", "summary", "level", "lang", "source", "sort_key", "data",
                 "keywords", "body", "links")

    def __init__(self, **kw):
        for k in self.__slots__:
            setattr(self, k, kw.get(k))
        self.links = self.links or []
        self.keywords = self.keywords or ""
        self.body = self.body or ""
        self.level = self.level or 0
        self.lang = self.lang or "ru"
        self.source = self.source or "curated"
        self.sort_key = self.sort_key or 0


def level_of(e):
    lv = e.get("level", "")
    if lv.isdigit():
        return int(lv)
    return LEVELS.get(lv.lower(), 0)


def generic_row(e, runner, order):
    kind = e.get("kind")
    if not kind:
        fail("%s: missing kind" % e.where())
        kind = "topic"
    check_entry(e)
    data = {"sections": render_sections(e, runner)}
    for key in ("sig", "complexity", "memory", "url", "lang", "license", "install", "version", "aliases"):
        v = e.get(key)
        if v:
            data[key] = v
    tags = e.listval("tags")
    body = "\n".join(plain_text(b) for _, b in e.sections)
    return Row(
        id=e.id, kind=kind, category=e.get("category", "Разное"), title=e.get("title", e.id),
        summary=e.get("summary", ""), level=level_of(e), lang=e.get("language", "ru"),
        source=e.get("source", "curated"), sort_key=int(e.get("order", order)), data=data,
        keywords=" ".join(tags + [e.get("sig", ""), e.id.split(":")[-1]] + e.listval("aliases")),
        body=body, links=e.listval("related"),
    )


def io_pairs(blocks, where, require_out=True):
    pairs = []
    pending = None
    for b in blocks or []:
        if "code" not in b:
            continue
        if b["lang"] == "in":
            if pending is not None:
                pairs.append((pending, None))
            pending = b["code"]
        elif b["lang"] == "out":
            if pending is None:
                fail("%s: ```out without ```in" % where)
                continue
            pairs.append((pending, b["code"]))
            pending = None
    if pending is not None:
        pairs.append((pending, None))
    if require_out and any(o is None for _, o in pairs):
        fail("%s: example without expected output" % where)
    return pairs


def task_row(e, runner, order):
    where = e.where()
    statement = e.section("Условие")
    if statement is None:
        fail("%s: task without 'Условие'" % where)
    examples = io_pairs(e.section("Примеры"), where)
    if not examples:
        fail("%s: task without examples" % where)
    tests = io_pairs(e.section("Тесты"), where, require_out=False)
    gen = [b["code"] for b in (e.section("Генератор") or []) if "code" in b and b["lang"] == "python"]
    if gen:
        # The generator prints a JSON list of input strings; expected outputs come from the solutions.
        status, stdout, exc = run_python(gen[0])
        if status != "OK":
            fail("%s: test generator failed: %s" % (where, exc[1] if exc else status))
        else:
            try:
                generated = json.loads(stdout)
                assert isinstance(generated, list) and all(isinstance(x, str) for x in generated)
            except Exception:
                fail("%s: test generator must print a JSON list of strings" % where)
                generated = []
            tests += [(g if g.endswith("\n") else g + "\n", None) for g in generated]
    if sum(len(i) for i, _ in tests) > 24000:
        fail("%s: hidden tests are too large (%d bytes)" % (where, sum(len(i) for i, _ in tests)))
    hints_blocks = e.section("Подсказки") or []
    hints = []
    for b in hints_blocks:
        hints.extend(b.get("ul", []))
    if len(hints) < 3:
        fail("%s: task needs 3 hints, has %d" % (where, len(hints)))
    solutions = []
    for heading, blocks in e.sections:
        if not heading.startswith("Решение"):
            continue
        title = heading.split(":", 1)[1].strip() if ":" in heading else "Решение"
        code = next((b["code"] for b in blocks if "code" in b and b["lang"] == "python"), None)
        if code is None:
            fail("%s: solution '%s' without code" % (where, title))
            continue
        meta = {}
        text = []
        for b in blocks:
            if "p" in b:
                found = re.findall(r"@(\w+):\s*([^@]+)", b["p"])
                if found:
                    for k, v in found:
                        meta[k] = v.strip()
                else:
                    text.append(b["p"])
            elif "ul" in b:
                text.extend(b["ul"])
        solutions.append({"title": title, "code": code, "explain": "\n".join(text),
                          "time": meta.get("time", ""), "memory": meta.get("memory", "")})
    if not solutions:
        fail("%s: task without solutions" % where)
    all_tests = [{"in": i, "out": o} for i, o in examples] + [{"in": i, "out": o, "hidden": True} for i, o in tests]

    # Judge every solution on every test; fill missing expected outputs from the first solution.
    for ti, t in enumerate(all_tests):
        outs = {}

        def cb_factory(si, ti=ti, outs=outs):
            def cb(status, stdout, exc):
                if status != "OK":
                    fail("%s: solution '%s' failed on test %d: %s" % (where, solutions[si]["title"], ti + 1, exc[1] if exc else status))
                    return
                outs[si] = stdout
                if len(outs) == len(solutions):
                    ref = all_tests[ti]["out"]
                    if ref is None:
                        ref = outs[0]
                        all_tests[ti]["out"] = ref.rstrip("\n") + "\n"
                    for k, o in outs.items():
                        if not same_output(o, ref):
                            fail("%s: solution '%s' wrong on test %d: got %r expected %r" % (
                                where, solutions[k]["title"], ti + 1, o.strip()[:120], ref.strip()[:120]))
            return cb
        for si, s in enumerate(solutions):
            runner.add(s["code"], t["in"], cb_factory(si))

    explain = e.section("Объяснение") or []
    data = {
        "task": {
            "statement": plain_text(statement or []),
            "input": plain_text(e.section("Входные данные") or []),
            "output": plain_text(e.section("Выходные данные") or []),
            "constraints": plain_text(e.section("Ограничения") or []),
            "hints": hints,
            "solutions": solutions,
            "explain": plain_text(explain),
            "tests": all_tests,
            "topic": e.get("category", ""),
        }
    }
    body = "\n".join([plain_text(statement or []), plain_text(explain)])
    return Row(
        id=e.id, kind="task", category=e.get("category", "Разное"), title=e.get("title", e.id),
        summary=e.get("summary", plain_text(statement or [])[:140]), level=level_of(e), sort_key=int(e.get("order", order)),
        data=data, keywords=" ".join(e.listval("tags")), body=body, links=e.listval("related"),
        source=e.get("source", "curated"),
    )


QUIZ_TYPES = ("output", "error", "type", "choose_code", "algorithm", "complexity", "fact")


def stable_shuffle(items, seed):
    rnd = int(hashlib.sha1(seed.encode()).hexdigest(), 16)
    items = list(items)
    for i in range(len(items) - 1, 0, -1):
        j = rnd % (i + 1)
        rnd //= (i + 1)
        items[i], items[j] = items[j], items[i]
    return items


def quiz_row(e, runner, order):
    where = e.where()
    qtype = e.get("type", "")
    if qtype not in QUIZ_TYPES:
        fail("%s: unknown quiz type %r" % (where, qtype))
    question = e.get("q", "")
    code_blocks = [b for b in (e.section("Код") or []) if "code" in b and b["lang"] == "python"]
    # One-line programs may be given inline as "code:" ("\n" separates lines).
    code = code_blocks[0]["code"] if code_blocks else e.get("code", "").replace("\\n", "\n")
    stdin_blocks = [b for b in (e.section("Код") or []) if "code" in b and b["lang"] == "in"]
    stdin = stdin_blocks[0]["code"] if stdin_blocks else e.get("stdin", "").replace("\\n", "\n")
    explain = plain_text(e.section("Пояснение") or []) or e.get("explain", "")
    wrong = [w.strip() for w in e.get("wrong", "").split("|") if w.strip()]
    quiz = {"type": qtype, "question": question, "code": code, "explain": explain}
    row = Row(id=e.id, kind="quiz", category=e.get("category", "basics"), title=e.get("title", question[:60]),
              summary=question, level=level_of(e), sort_key=int(e.get("order", order)),
              data={"quiz": quiz}, keywords=" ".join(e.listval("tags")), body=question + "\n" + code + "\n" + explain,
              links=e.listval("related"))

    def finish(correct):
        opts = [correct] + [w for w in wrong if w != correct]
        if len(opts) < 3:
            fail("%s: quiz needs at least 2 distinct wrong options" % where)
        if any(w == correct for w in wrong):
            fail("%s: a wrong option equals the correct answer %r" % (where, correct))
        opts = stable_shuffle(opts, e.id)
        quiz["options"] = opts
        quiz["answer"] = opts.index(correct)

    if qtype == "output":
        def cb(status, stdout, exc):
            if status != "OK":
                fail("%s: output-quiz code failed: %s" % (where, exc[1] if exc else status))
                return
            finish(stdout.rstrip("\n").replace("\n", " ⏎ ") if stdout.count("\n") > 1 else stdout.strip())
        runner.add(code, stdin, cb)
    elif qtype == "error":
        def cb(status, stdout, exc):
            finish(exc[0] if status == "ERROR" else "Ошибки нет")
        runner.add(code, stdin, cb)
    elif qtype == "type":
        expr = e.get("expr", "")
        quiz["code"] = expr
        def cb(status, stdout, exc):
            if status != "OK":
                fail("%s: type-quiz expression failed: %s" % (where, exc[1] if exc else status))
                return
            finish(stdout.strip())
        runner.add("print(type(%s).__name__)" % expr, "", cb)
    elif qtype == "choose_code":
        variants = [b["code"] for b in (e.section("Варианты") or []) if "code" in b and b["lang"] == "python"]
        expect = e.get("expect", "").replace("\\n", "\n")
        ans = int(e.get("answer", "0")) - 1
        if not variants or not (0 <= ans < len(variants)):
            fail("%s: choose_code needs variants and a valid answer" % where)
            return row
        quiz["variants"] = variants
        results = {}

        def factory(k):
            def cb(status, stdout, exc):
                results[k] = (status, stdout)
                if len(results) == len(variants):
                    for idx, (st, out) in results.items():
                        good = st == "OK" and same_output(out, expect)
                        if idx == ans and not good:
                            fail("%s: the correct variant %d does not print %r (got %r)" % (where, idx + 1, expect, out))
                        if idx != ans and good:
                            fail("%s: wrong variant %d also prints the expected output" % (where, idx + 1))
            return cb
        for k, v in enumerate(variants):
            runner.add(v, stdin, factory(k))
        letters = ["Вариант %d" % (k + 1) for k in range(len(variants))]
        quiz["options"] = letters
        quiz["answer"] = ans
    else:
        opts = [o.strip() for o in e.get("options", "").split("|") if o.strip()]
        ans = e.get("answer", "")
        if ans.isdigit():
            idx = int(ans) - 1
        else:
            idx = opts.index(ans) if ans in opts else -1
        if not opts or not (0 <= idx < len(opts)):
            fail("%s: quiz needs options and a valid answer" % where)
            return row
        correct = opts[idx]
        shuffled = stable_shuffle(opts, e.id)
        quiz["options"] = shuffled
        quiz["answer"] = shuffled.index(correct)
    return row


def error_row(e, runner, order):
    where = e.where()
    exc_name = e.get("exception", e.get("title", ""))
    wrong = [b for b in (e.section("Неправильный код") or []) if "code" in b and b["lang"] == "python"]
    fixed = [b for b in (e.section("Исправленный код") or []) if "code" in b and b["lang"] == "python"]
    if not wrong or not fixed:
        fail("%s: error entry needs 'Неправильный код' and 'Исправленный код'" % where)
    data = {"sections": render_sections(e, runner, skip=("Неправильный код", "Исправленный код")), "error": {}}
    err = data["error"]
    err["exception"] = exc_name

    def stdin_after(section):
        bl = e.section(section) or []
        ins = [b for b in bl if "code" in b and b["lang"] == "in"]
        return ins[0]["code"] if ins else ""

    if wrong:
        err["wrong"] = wrong[0]["code"]
        wrong_in = stdin_after("Неправильный код")

        def cb_w(status, stdout, exc):
            if status != "ERROR":
                fail("%s: wrong code does not raise (%s)" % (where, status))
                return
            if exc[0] != exc_name and exc_name not in exc[1]:
                fail("%s: wrong code raises %s, expected %s" % (where, exc[0], exc_name))
            err["wrong_out"] = (stdout + exc[1]).strip()[-600:]
        runner.add(wrong[0]["code"], wrong_in, cb_w)
    if fixed:
        err["fixed"] = fixed[0]["code"]
        fixed_in = stdin_after("Исправленный код")

        def cb_f(status, stdout, exc):
            if status != "OK":
                fail("%s: fixed code still fails: %s" % (where, exc[1] if exc else status))
                return
            err["fixed_out"] = stdout.strip()[:600]
        runner.add(fixed[0]["code"], fixed_in, cb_f)
    # Practice task inside an error entry is just text + optional code.
    body = "\n".join(plain_text(b) for _, b in e.sections)
    return Row(id=e.id, kind="error", category=e.get("category", "Исключения"), title=e.get("title", exc_name),
               summary=e.get("summary", ""), level=level_of(e), sort_key=int(e.get("order", order)), data=data,
               keywords=" ".join(e.listval("tags") + [exc_name]), body=body, links=e.listval("related"))


# ----------------------------------------------------------------------------- introspection

STDLIB_MODULES = [
    # numbers and math
    "math", "cmath", "decimal", "fractions", "random", "statistics", "numbers",
    # data types
    "collections", "collections.abc", "heapq", "bisect", "array", "enum", "dataclasses", "types", "copy",
    "pprint", "reprlib", "graphlib", "weakref",
    # functional
    "itertools", "functools", "operator",
    # text
    "string", "re", "textwrap", "difflib", "unicodedata", "stringprep",
    # binary / encodings
    "struct", "codecs", "base64", "binascii", "hashlib", "hmac", "secrets", "zlib", "gzip", "bz2", "lzma",
    "zipfile", "tarfile",
    # files and os
    "pathlib", "os", "os.path", "io", "shutil", "glob", "fnmatch", "tempfile", "filecmp", "stat", "sys",
    "platform", "errno", "fileinput", "linecache",
    # formats
    "json", "csv", "configparser", "tomllib", "pickle", "shelve", "sqlite3", "xml.etree.ElementTree",
    "html", "html.parser", "plistlib",
    # time
    "time", "datetime", "calendar", "zoneinfo",
    # concurrency
    "threading", "multiprocessing", "concurrent.futures", "subprocess", "sched", "queue", "contextvars",
    "asyncio",
    # networking / internet
    "socket", "ssl", "select", "selectors", "urllib.parse", "urllib.request", "http", "http.client",
    "http.server", "email", "email.message", "mimetypes", "ipaddress", "uuid", "smtplib", "ftplib",
    # dev tools
    "typing", "unittest", "unittest.mock", "doctest", "pdb", "timeit", "cProfile", "pstats", "trace",
    "traceback", "warnings", "logging", "logging.handlers", "argparse", "getopt", "inspect", "dis", "ast",
    "tokenize", "keyword", "token", "symtable", "importlib", "importlib.util", "importlib.resources",
    "pkgutil", "site", "sysconfig", "gc", "atexit", "abc", "contextlib", "code", "codeop",
    "venv", "zipimport", "compileall", "py_compile", "locale", "gettext", "shlex", "signal", "resource",
]

BUILTIN_TYPES = [str, list, tuple, dict, set, frozenset, int, float, complex, bool, bytes, bytearray, range,
                 memoryview, slice]


def first_paragraph(doc):
    if not doc:
        return ""
    para = doc.strip().split("\n\n")[0]
    return " ".join(l.strip() for l in para.splitlines())[:300]


def safe_sig(obj):
    try:
        return str(inspect.signature(obj))
    except Exception:
        return None


def doc_entry(entry_id, kind, category, title, obj, sig_name, lang="en", source="cpython-docstring", extra_sections=None, max_doc=4000):
    doc = inspect.getdoc(obj) or ""
    sig = safe_sig(obj) if callable(obj) else None
    sig_text = (sig_name + sig) if sig else None
    sections = []
    if sig_text:
        sections.append({"h": "Сигнатура", "b": [{"code": sig_text + "\n", "lang": "text"}]})
    if doc:
        text = doc if len(doc) <= max_doc else doc[:max_doc].rsplit("\n", 1)[0] + "\n…"
        sections.append({"h": "Официальная документация (EN)", "b": [{"code": text + "\n", "lang": "text"}]})
    if extra_sections:
        sections.extend(extra_sections)
    if not sections:
        return None
    return Row(id=entry_id, kind=kind, category=category, title=title, summary=first_paragraph(doc) or title,
               lang=lang, source=source, data={"sections": sections, **({"sig": sig_text} if sig_text else {})},
               keywords=" ".join([title, title.split(".")[-1]]), body=(sig_text or "") + "\n" + doc[:max_doc])


def public_names(mod):
    names = getattr(mod, "__all__", None)
    if names is None:
        names = [n for n in dir(mod) if not n.startswith("_")]
    out = []
    for n in names:
        try:
            v = getattr(mod, n)
        except Exception:
            continue
        if inspect.ismodule(v):
            continue
        out.append((n, v))
    return out


def introspect_stdlib():
    rows = []
    warnings.simplefilter("ignore")
    for modname in STDLIB_MODULES:
        try:
            mod = importlib.import_module(modname)
        except Exception:
            continue
        rows.append(doc_entry("lib:" + modname, "module", "Модули стандартной библиотеки", modname, mod, modname,
                              max_doc=6000) or Row(id="lib:" + modname, kind="module", category="Модули стандартной библиотеки",
                                                   title=modname, summary=modname, data={"sections": []}, lang="en",
                                                   source="cpython-docstring"))
        for name, obj in public_names(mod):
            if inspect.ismodule(obj):
                continue
            own = getattr(obj, "__module__", modname) or modname
            if inspect.isclass(obj) or inspect.isfunction(obj) or inspect.isbuiltin(obj) or callable(obj):
                if own and not (own == modname or own.lstrip("_") == modname or own.startswith(modname.split(".")[0])):
                    # re-exported from another module: keep only if documented under this name
                    pass
                r = doc_entry("lib:%s.%s" % (modname, name), "member", modname, "%s.%s" % (modname, name), obj,
                              "%s.%s" % (modname, name), max_doc=2500)
                if r:
                    rows.append(r)
                if inspect.isclass(obj) and not issubclass(obj, BaseException):
                    for mname, mobj in sorted(vars(obj).items()):
                        if mname.startswith("_") or not callable(mobj) and not isinstance(mobj, (property, classmethod, staticmethod)):
                            continue
                        target = getattr(obj, mname, mobj)
                        r = doc_entry("lib:%s.%s.%s" % (modname, name, mname), "member", modname,
                                      "%s.%s.%s" % (modname, name, mname), target, "%s.%s" % (name, mname), max_doc=1500)
                        if r:
                            rows.append(r)
            elif isinstance(obj, (int, float, str, bytes, tuple, frozenset)) and len(repr(obj)) < 200:
                rows.append(Row(id="lib:%s.%s" % (modname, name), kind="member", category=modname,
                                title="%s.%s" % (modname, name), summary="Константа: %s = %s" % (name, repr(obj)[:120]),
                                lang="en", source="cpython", data={"sections": [{"h": "Значение", "b": [{"code": "%s.%s == %r\n" % (modname, name, obj), "lang": "text"}]}]},
                                keywords=name, body=name))
    return [r for r in rows if r]


def introspect_builtins():
    rows = []
    for name in dir(builtins):
        if name.startswith("_"):
            continue
        obj = getattr(builtins, name)
        if inspect.isclass(obj) and issubclass(obj, BaseException):
            chain = " → ".join(c.__name__ for c in obj.__mro__ if c is not object)
            extra = [{"h": "Иерархия", "b": [{"p": chain}]}]
            r = doc_entry("py:exception:" + name, "exception", "Встроенные исключения", name, obj, name, extra_sections=extra)
        elif callable(obj):
            r = doc_entry("py:builtin:" + name, "builtin", "Встроенные функции и классы", name + "()", obj, name)
        else:
            r = Row(id="py:builtin:" + name, kind="builtin", category="Встроенные константы", title=name,
                    summary="Встроенная константа %s" % name, lang="en", source="cpython",
                    data={"sections": [{"h": "Значение", "b": [{"code": "%s  # %r\n" % (name, obj), "lang": "text"}]}]},
                    keywords=name, body=name)
        if r:
            rows.append(r)
    for t in BUILTIN_TYPES:
        for mname, mobj in sorted(vars(t).items()):
            if mname.startswith("_"):
                continue
            r = doc_entry("py:method:%s.%s" % (t.__name__, mname), "method", "Методы %s" % t.__name__,
                          "%s.%s()" % (t.__name__, mname), getattr(t, mname), "%s.%s" % (t.__name__, mname))
            if r:
                rows.append(r)
    for kw in keyword.kwlist + keyword.softkwlist:
        rows.append(Row(id="py:keyword:" + kw, kind="keyword", category="Ключевые слова", title=kw,
                        summary="Ключевое слово Python «%s»" % kw, lang="en", source="cpython",
                        data={"sections": []}, keywords=kw, body=kw))
    return rows


LANGREF_RU = {
    "if": "Инструкция if", "for": "Цикл for", "while": "Цикл while", "try": "Инструкция try", "with": "Инструкция with",
    "function": "Определение функций (def)", "class": "Определение классов", "import": "Инструкция import",
    "lambda": "Лямбда-выражения", "assignment": "Присваивание", "augassign": "Составное присваивание (+= …)",
    "slicings": "Срезы", "subscriptions": "Индексация", "comparisons": "Сравнения", "booleans": "Логические операции",
    "binary": "Бинарные арифметические операции", "unary": "Унарные операции", "power": "Возведение в степень",
    "operator-summary": "Приоритет операторов", "string-methods": "Методы строк", "typesseq": "Последовательности",
    "typesseq-mutable": "Изменяемые последовательности", "typesmapping": "Словари (mapping)", "specialnames": "Специальные методы",
    "exceptions": "Исключения", "execmodel": "Модель выполнения", "naming": "Имена и связывание", "formatstrings": "Синтаксис форматирования строк",
    "strings": "Строковые литералы", "numbers": "Числовые литералы", "integers": "Целочисленные литералы",
    "floating": "Литералы с плавающей точкой", "identifiers": "Идентификаторы", "keywords": "Ключевые слова",
    "global": "Инструкция global", "nonlocal": "Инструкция nonlocal", "return": "Инструкция return",
    "yield": "Инструкция yield", "raise": "Инструкция raise", "assert": "Инструкция assert", "pass": "Инструкция pass",
    "break": "Инструкция break", "continue": "Инструкция continue", "del": "Инструкция del", "async": "Корутины (async)",
    "await": "Выражение await", "match": "Сопоставление с образцом (match)", "lists": "Списки (литералы)",
    "dict": "Словари (литералы)", "conditional": "Условные выражения", "calls": "Вызовы", "attribute-access": "Доступ к атрибутам",
    "context-managers": "Менеджеры контекста", "sequence-types": "Типы-последовательности", "numeric-types": "Числовые типы",
    "truth": "Истинность значений", "types": "Иерархия типов", "objects": "Объекты, значения и типы",
    "bltin-code-objects": "Объекты кода", "bltin-type-objects": "Объекты типов", "with": "Инструкция with",
    "in": "Проверки принадлежности (in)", "is": "Проверки тождества (is)", "else": "Ветка else", "elif": "Ветка elif",
    "def": "Инструкция def", "assert": "Инструкция assert",
}


def langref_rows():
    rows = []
    try:
        from pydoc_data.topics import topics
    except Exception:
        return rows
    for i, (name, text) in enumerate(sorted(topics.items())):
        title = LANGREF_RU.get(name, name)
        rows.append(Row(id="py:langref:" + name, kind="langref", category="Справочник языка (официальный, EN)",
                        title=title + ("" if title == name else " — " + name), summary=text.strip().split("\n")[0][:200],
                        lang="en", source="python-docs", sort_key=i,
                        data={"sections": [{"h": "Python Language Reference", "b": [{"code": text.strip() + "\n", "lang": "text"}]}]},
                        keywords=name + " " + title, body=text))
    return rows


EXTERNAL = {
    # import name: (display name, modules or classes to introspect)
    "numpy": ("NumPy", ["numpy", "numpy.linalg", "numpy.random", "numpy.ndarray"]),
    "pandas": ("Pandas", ["pandas", "pandas.DataFrame", "pandas.Series"]),
    "matplotlib": ("Matplotlib", ["matplotlib.pyplot"]),
    "requests": ("Requests", ["requests", "requests.Session", "requests.Response"]),
    "bs4": ("BeautifulSoup", ["bs4", "bs4.BeautifulSoup", "bs4.element.Tag"]),
    "flask": ("Flask", ["flask", "flask.Flask"]),
    "django": ("Django", ["django.shortcuts", "django.http", "django.urls"]),
    "fastapi": ("FastAPI", ["fastapi", "fastapi.FastAPI"]),
    "pygame": ("Pygame", ["pygame", "pygame.display", "pygame.draw", "pygame.event", "pygame.Surface", "pygame.Rect", "pygame.time"]),
    "PIL": ("Pillow", ["PIL.Image", "PIL.ImageDraw", "PIL.ImageFilter"]),
    "cv2": ("OpenCV", ["cv2"]),
    "sklearn": ("Scikit-learn", ["sklearn.model_selection", "sklearn.linear_model", "sklearn.metrics", "sklearn.preprocessing", "sklearn.tree", "sklearn.cluster", "sklearn.neighbors", "sklearn.ensemble"]),
    "torch": ("PyTorch", ["torch", "torch.nn", "torch.optim", "torch.Tensor"]),
    "tensorflow": ("TensorFlow", ["tensorflow", "tensorflow.keras.layers", "tensorflow.keras.models"]),
    "sqlalchemy": ("SQLAlchemy", ["sqlalchemy", "sqlalchemy.orm"]),
    "selenium": ("Selenium", ["selenium.webdriver", "selenium.webdriver.common.by"]),
    "pytest": ("pytest", ["pytest"]),
}


def introspect_external(limit_per_target=400):
    rows = []
    found = []
    warnings.simplefilter("ignore")
    for top, (display, targets) in EXTERNAL.items():
        try:
            m = importlib.import_module(top)
        except Exception:
            continue
        version = getattr(m, "__version__", "")
        found.append((top, display, version))
        for target in targets:
            obj = None
            try:
                obj = importlib.import_module(target)
            except Exception:
                try:
                    obj = resolve(target)
                except Exception:
                    obj = None
            if obj is None:
                continue
            names = public_names(obj) if inspect.ismodule(obj) else [(n, getattr(obj, n, None)) for n in sorted(vars(obj)) if not n.startswith("_")]
            count = 0
            for name, v in names:
                if v is None or inspect.ismodule(v) or not callable(v):
                    continue
                r = doc_entry("ext:%s.%s" % (target, name), "extmember", display, "%s.%s" % (target, name), v,
                              "%s.%s" % (target.split(".")[-1], name), source="%s %s docstring" % (display, version), max_doc=1200)
                if r:
                    rows.append(r)
                    count += 1
                if count >= limit_per_target:
                    break
    return rows, found


# ----------------------------------------------------------------------------- main build

def load_curated(runner):
    rows = {d: [] for d in DOMAINS}
    for domain in DOMAINS:
        folder = os.path.join(CONTENT, domain)
        if not os.path.isdir(folder):
            continue
        files = []
        for dirpath, _, names in os.walk(folder):
            files.extend(os.path.join(dirpath, n) for n in names if n.endswith(".md"))
        order = 0
        for path in sorted(files):
            for e in kmd.parse_file(path):
                order += 1
                kind = e.get("kind", "")
                try:
                    if kind == "task":
                        r = task_row(e, runner, order)
                    elif kind == "quiz":
                        r = quiz_row(e, runner, order)
                    elif kind == "error":
                        r = error_row(e, runner, order)
                    else:
                        r = generic_row(e, runner, order)
                except Exception as ex:  # noqa
                    fail("%s: %s" % (e.where(), ex))
                    continue
                rows[domain].append(r)
    return rows


def merge(curated, generated):
    """Curated rows win; generated documentation is appended to a curated row with the same id."""
    by_id = {r.id: r for r in curated}
    out = list(curated)
    for g in generated:
        c = by_id.get(g.id)
        if c is None:
            by_id[g.id] = g
            out.append(g)
            continue
        extra = [s for s in g.data.get("sections", []) if s["h"] in ("Официальная документация (EN)", "Сигнатура", "Иерархия", "Python Language Reference")]
        if extra:
            c.data.setdefault("sections", []).extend(extra)
            if "sig" not in c.data and g.data.get("sig"):
                c.data["sig"] = g.data["sig"]
            c.body += "\n" + g.body
            c.keywords += " " + g.keywords
    return out


def write_db(domain, rows, out_path):
    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    tmp = out_path + ".tmp"
    if os.path.exists(tmp):
        os.remove(tmp)
    conn = sqlite3.connect(tmp)
    conn.execute("PRAGMA page_size=4096")
    conn.execute("PRAGMA journal_mode=DELETE")
    conn.executescript(SCHEMA)
    rows = sorted(rows, key=lambda r: (r.kind, r.category, r.sort_key, r.title.lower(), r.id))
    cats = {}
    for i, r in enumerate(rows, 1):
        data = json.dumps(r.data, ensure_ascii=False, separators=(",", ":"))
        conn.execute("INSERT INTO entry(rowid,id,kind,category,title,summary,level,lang,source,sort_key,data) VALUES (?,?,?,?,?,?,?,?,?,?,?)",
                     (i, r.id, r.kind, r.category, r.title, r.summary or "", r.level, r.lang, r.source, r.sort_key, data))
        skel = textnorm.index_skeletons(" ".join([r.title, r.keywords, r.summary or ""]))
        title = textnorm.normalize(r.title)
        conn.execute("INSERT INTO entry_fts(docid,title,keywords,body,skel) VALUES (?,?,?,?,?)",
                     (i, title, textnorm.normalize(r.keywords + " " + (r.summary or "")), r.body[:20000], skel))
        key = (r.kind, r.category)
        if key not in cats:
            cats[key] = [len(cats), 0]
        cats[key][1] += 1
        for dst in r.links:
            conn.execute("INSERT OR IGNORE INTO relation(src,dst) VALUES (?,?)", (r.id, dst))
    for (kind, name), (sk, cnt) in cats.items():
        conn.execute("INSERT INTO category(kind,name,sort_key,count) VALUES (?,?,?,?)", (kind, name, sk, cnt))
    digest = hashlib.sha1()
    for r in rows:
        digest.update(r.id.encode())
        digest.update(json.dumps(r.data, ensure_ascii=False, sort_keys=True).encode())
    meta = {"schema": str(SCHEMA_VERSION), "domain": domain, "entries": str(len(rows)), "content_hash": digest.hexdigest(),
            "python": "%d.%d" % sys.version_info[:2]}
    for k, v in meta.items():
        conn.execute("INSERT INTO meta(key,value) VALUES (?,?)", (k, v))
    conn.execute("INSERT INTO entry_fts(entry_fts) VALUES('optimize')")
    conn.commit()
    conn.execute("VACUUM")
    conn.close()
    os.replace(tmp, out_path)
    return meta


def write_skeleton_fixture(rows_by_domain):
    """Words and their skeleton forms, checked by the Kotlin SkeletonParityTest."""
    words = set()
    for rows in rows_by_domain.values():
        for r in rows[:400]:
            for w in textnorm.WORD.findall(textnorm.normalize(r.title + " " + r.keywords)):
                if len(w) >= 2:
                    words.add(w)
    words |= {"chetnyh", "cifr", "stroka", "slovar", "funkciya", "yig'indi", "o'rtacha", "чётных", "сумма", "summa", "щука", "shchuka"}
    path = os.path.join(ROOT, "core", "engine", "src", "test", "resources", "skeleton_fixture.tsv")
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        for w in sorted(words)[:3000]:
            f.write("%s\t%s\n" % (w, "|".join(textnorm.skeleton_forms(w))))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--check", action="store_true", help="validate only")
    ap.add_argument("--no-extlibs", action="store_true", help="skip third-party introspection")
    ap.add_argument("--no-introspection", action="store_true", help="curated content only (fast)")
    args = ap.parse_args()

    if sys.version_info[:2] != (3, 11):
        print("warning: building with Python %d.%d; the watch runs Python 3.11" % sys.version_info[:2])

    runner = Runner()
    curated = load_curated(runner)
    print("curated entries:", {d: len(r) for d, r in curated.items()})
    runner.run()

    generated = {d: [] for d in DOMAINS}
    ext_found = []
    if not args.no_introspection:
        generated["python"] += introspect_builtins()
        generated["python"] += langref_rows()
        generated["libraries"] += introspect_stdlib()
        if not args.no_extlibs:
            ext_rows, ext_found = introspect_external()
            generated["libraries"] += ext_rows
        print("generated entries:", {d: len(r) for d, r in generated.items() if r}, "external:", ext_found)

    all_ids = set()
    final = {}
    for domain in DOMAINS:
        final[domain] = merge(curated[domain], generated[domain])
        ids = [r.id for r in final[domain]]
        dup = {i for i in ids if ids.count(i) > 1} if len(ids) < 5000 else set()
        for d in dup:
            fail("duplicate id %s" % d)
        all_ids.update(ids)
        for r in final[domain]:
            pref = r.id.split(":")[0]
            if PREFIX_DOMAIN.get(pref) != domain:
                fail("entry %s is in domain %s but its prefix maps to %s" % (r.id, domain, PREFIX_DOMAIN.get(pref)))

    # Dangling links are allowed only to known prefixes (the app hides links it cannot resolve),
    # but report curated links to missing entries to keep the graph healthy.
    missing = set()
    for domain in DOMAINS:
        for r in curated[domain]:
            for l in r.links:
                if l not in all_ids:
                    missing.add(l)
    if missing:
        print("note: %d links point to entries that do not exist yet (hidden in the app): %s" % (
            len(missing), ", ".join(sorted(missing)[:40])))

    if ERRORS:
        for e in ERRORS:
            print("ERROR:", e)
        print("%d error(s)" % len(ERRORS))
        return 1
    if args.check:
        print("check OK")
        return 0

    manifest = {"schema": SCHEMA_VERSION, "python": "%d.%d" % sys.version_info[:2], "databases": [],
                "external_libraries": [{"module": m, "name": n, "version": v} for m, n, v in ext_found]}
    total = hashlib.sha1()
    for domain, rel in DOMAINS.items():
        path = os.path.join(ASSETS, rel)
        meta = write_db(domain, final[domain], path)
        size = os.path.getsize(path)
        manifest["databases"].append({"domain": domain, "path": rel, "entries": int(meta["entries"]), "size": size,
                                      "hash": meta["content_hash"]})
        total.update(meta["content_hash"].encode())
        print("%-10s %6d entries %8.1f KB" % (domain, int(meta["entries"]), size / 1024))
    manifest["version"] = total.hexdigest()[:16]
    with open(os.path.join(ASSETS, "db_manifest.json"), "w", encoding="utf-8") as f:
        json.dump(manifest, f, ensure_ascii=False, indent=1)
    write_skeleton_fixture(final)
    print("manifest version", manifest["version"])
    return 0


if __name__ == "__main__":
    sys.exit(main())
