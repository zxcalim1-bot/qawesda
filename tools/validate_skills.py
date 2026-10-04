#!/usr/bin/env python3
"""Validates the solver skill catalog in app/src/main/assets/solver/skills/*.md.

For every skill:
  * every method compiles;
  * every method is run on every sample input;
  * all methods must print the same answer (whitespace-insensitive, floats with tolerance);
  * if a sample has an expected answer ("sample: in => out"), it must match;
  * match/boost/avoid concepts must exist in lexicon.tsv;
  * {PARAM} placeholders are substituted with their defaults.

Usage: python3 tools/validate_skills.py [skill_id ...]
"""
import os
import re
import subprocess
import sys
from concurrent.futures import ThreadPoolExecutor

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ASSETS = os.path.join(ROOT, "app", "src", "main", "assets", "solver")


def parse(text):
    skills = []
    cur = None
    method = None
    code = None
    for raw in text.split("\n"):
        if code is not None:
            if raw.strip() == "```":
                method["code"] = "\n".join(code) + "\n"
                code = None
            else:
                code.append(raw)
            continue
        line = raw.rstrip()
        if line.startswith("# skill:"):
            cur = {"id": line[len("# skill:"):].strip(), "fields": {}, "methods": []}
            skills.append(cur)
            method = None
        elif line.startswith("#") and not line.startswith("##"):
            continue
        elif line.startswith("## "):
            method = {"title": line[3:].strip(), "fields": {}, "code": ""}
            cur["methods"].append(method)
        elif line.strip().startswith("```python"):
            code = []
        elif not line.strip():
            continue
        elif ":" in line:
            k, v = line.split(":", 1)
            k, v = k.strip(), v.strip()
            if method is not None:
                method["fields"][k] = v
            else:
                cur["fields"].setdefault(k, []).append(v)
        else:
            raise ValueError("unparsed line in %s: %r" % (cur and cur["id"], line))
    return skills


def concepts_of_expr(expr):
    return [t for t in re.findall(r"[A-Z_0-9]+", expr) if t not in ("TRUE", "FALSE")]



def run_code(code, stdin, timeout=10):
    """Runs code in a fresh interpreter (isolated, with a time limit)."""
    try:
        p = subprocess.run([sys.executable, "-c", code], input=stdin, capture_output=True,
                           text=True, timeout=timeout, encoding="utf-8")
    except subprocess.TimeoutExpired:
        return "TIMEOUT", ""
    if p.returncode != 0:
        err = p.stderr.strip().splitlines()
        return (err[-1] if err else "exit %d" % p.returncode), p.stdout
    return "OK", p.stdout


def same(a, b):
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


def params_of(skill):
    out = {}
    for line in skill["fields"].get("param", []):
        name, rhs = line.split("=", 1)
        name, rhs = name.strip(), rhs.strip()
        m = re.search(r"num\(([^)]*)\)\s*default\s*(\S+)", rhs)
        m2 = re.match(r"^(\S+)\s+if\s+(\S+)\s+else\s+(\S+)$", rhs)
        if m:
            out[name] = m.group(2)
        elif m2:
            out[name] = m2.group(3)
        else:
            out[name] = rhs
    return out


def sub(s, params):
    for k, v in params.items():
        s = s.replace("{%s}" % k, v)
    return s


def main(argv):
    skills_dir = os.path.join(ASSETS, "skills")
    text = "\n".join(open(os.path.join(skills_dir, name), encoding="utf-8").read()
                     for name in sorted(os.listdir(skills_dir)) if name.endswith(".md"))
    lexicon = set()
    for line in open(os.path.join(ASSETS, "lexicon.tsv"), encoding="utf-8"):
        if line.strip() and not line.startswith("#"):
            lexicon.add(line.split("\t")[0])
    # Concepts produced by QueryParser itself rather than by lexicon words.
    lexicon |= {"RANGE", "UPTO", "N_ITEMS"}
    skills = parse(text)
    only = set(argv)
    ids = set()
    errors = []
    total_runs = 0
    for s in skills:
        if s["id"] in ids:
            errors.append("duplicate skill id %s" % s["id"])
        ids.add(s["id"])
        if only and s["id"] not in only:
            continue
        f = s["fields"]
        for key in ("title", "match", "understood", "input_desc", "output_desc", "algorithm", "why"):
            if key not in f:
                errors.append("%s: missing field %s" % (s["id"], key))
        for c in concepts_of_expr(" ".join(f.get("match", []))) + [
            x.strip() for k in ("boost", "avoid") for v in f.get(k, []) for x in re.split(r"[;,]", v) if x.strip()
        ]:
            if c not in lexicon:
                errors.append("%s: unknown concept %s" % (s["id"], c))
        if len(s["methods"]) < 2:
            errors.append("%s: only %d method(s)" % (s["id"], len(s["methods"])))
        params = params_of(s)
        samples = f.get("sample", [])
        if not samples:
            errors.append("%s: no samples" % s["id"])
        approaches = set()
        for m in s["methods"]:
            for key in ("role", "time", "memory", "idea"):
                if key not in m["fields"]:
                    errors.append("%s / %s: missing %s" % (s["id"], m["title"], key))
            if m["fields"].get("role") not in ("beginner", "short", "efficient", "alternative", "pythonic"):
                errors.append("%s / %s: bad role %r" % (s["id"], m["title"], m["fields"].get("role")))
            if not m["code"].strip():
                errors.append("%s / %s: no code" % (s["id"], m["title"]))
            key = re.sub(r"\s+", "", m["code"])
            if key in approaches:
                errors.append("%s / %s: duplicate code" % (s["id"], m["title"]))
            approaches.add(key)
            try:
                compile(sub(m["code"], params), "<%s>" % s["id"], "exec")
            except SyntaxError as e:
                errors.append("%s / %s: SyntaxError %s" % (s["id"], m["title"], e))
        for sample in samples:
            if "=>" in sample:
                inp, exp = sample.split("=>", 1)
                inp, exp = inp.rstrip(), exp.strip()
            else:
                inp, exp = sample, None
            inp = sub(inp.replace("\\n", "\n"), params)
            if exp is not None:
                exp = sub(exp.replace("\\n", "\n"), params)
            outs = []
            with ThreadPoolExecutor(max_workers=8) as pool:
                results = list(pool.map(lambda m: run_code(sub(m["code"], params), inp + "\n"), s["methods"]))
            for m, (status, out) in zip(s["methods"], results):
                total_runs += 1
                if status != "OK":
                    errors.append("%s / %s on %r: %s" % (s["id"], m["title"], inp, status))
                    continue
                outs.append((m["title"], out))
            if outs:
                ref = exp if exp is not None else outs[0][1]
                for title, out in outs:
                    if not same(out, ref):
                        errors.append("%s / %s on %r: got %r expected %r" % (s["id"], title, inp, out.strip()[:200], ref.strip()[:200]))
    for e in errors:
        print("ERROR", e)
    print("skills: %d, runs: %d, errors: %d" % (len(skills), total_runs, len(errors)))
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
