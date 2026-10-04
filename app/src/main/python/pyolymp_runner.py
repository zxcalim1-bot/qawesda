"""Code runner for the Offline Python Olympiad Assistant (runs inside the embedded CPython 3.11).

All entry points take and return JSON strings so the Kotlin side stays simple:
  run_json({"code", "stdin", "timeout"})          -> {"status", "stdout", "stderr", "error", "line", "elapsed_ms"}
  check_json({"code"})                            -> {"ok", "error", "message", "line", "offset", "text"}
  judge_json({"code", "tests": [{"in","out"}], "timeout"}) -> {"passed", "total", "results": [...]}
  batch_json({"programs": [code...], "inputs": [stdin...], "timeout"}) -> {"outputs": [[run result...]...]}

Time limit: a trace function checks the clock on every executed line and raises
TimeLimitExceeded (a BaseException, so `except Exception` in user code cannot swallow it).
Long single C-level operations (e.g. 10 ** 10 ** 8) cannot be interrupted this way.
"""
import builtins
import io
import json
import sys
import time
import traceback

MAX_OUTPUT = 200_000


class TimeLimitExceeded(BaseException):
    pass


class LimitedOutput(io.StringIO):
    def write(self, s):
        if self.tell() + len(s) > MAX_OUTPUT:
            super().write(s[: max(0, MAX_OUTPUT - self.tell())])
            raise OutputLimitExceeded()
        return super().write(s)


class OutputLimitExceeded(BaseException):
    pass


def _error_line(tb, filename="<solution>"):
    line = None
    for frame in traceback.extract_tb(tb):
        if frame.filename == filename:
            line = frame.lineno
    return line


def _run(code, stdin, timeout):
    out = LimitedOutput()
    err = io.StringIO()
    old = (sys.stdin, sys.stdout, sys.stderr)
    deadline = time.monotonic() + timeout
    result = {"status": "OK", "error": None, "message": None, "line": None}

    def tracer(frame, event, arg):
        if time.monotonic() > deadline:
            raise TimeLimitExceeded()
        return tracer

    start = time.monotonic()
    try:
        compiled = compile(code, "<solution>", "exec")
    except SyntaxError as e:
        return {"status": "SYNTAX_ERROR", "stdout": "", "stderr": "", "error": type(e).__name__,
                "message": e.msg, "line": e.lineno, "offset": e.offset, "text": (e.text or "").rstrip("\n"),
                "elapsed_ms": 0}
    globs = {"__name__": "__main__", "__builtins__": builtins}
    old_limit = sys.getrecursionlimit()
    sys.stdin, sys.stdout, sys.stderr = io.StringIO(stdin), out, err
    sys.setrecursionlimit(max(old_limit, 3000))
    sys.settrace(tracer)
    try:
        exec(compiled, globs)
    except TimeLimitExceeded:
        result.update(status="TIMEOUT", error="TimeLimitExceeded", message="Превышено время %.1f с" % timeout)
    except OutputLimitExceeded:
        result.update(status="OUTPUT_LIMIT", error="OutputLimit", message="Слишком большой вывод")
    except SystemExit as e:
        if e.code not in (None, 0):
            result.update(status="EXIT", error="SystemExit", message=str(e.code))
    except RecursionError as e:
        result.update(status="RUNTIME_ERROR", error="RecursionError", message=str(e), line=_error_line(e.__traceback__))
    except MemoryError:
        result.update(status="RUNTIME_ERROR", error="MemoryError", message="Недостаточно памяти")
    except BaseException as e:  # noqa: B902 - report every user exception
        result.update(status="RUNTIME_ERROR", error=type(e).__name__, message=str(e), line=_error_line(e.__traceback__))
        err.write("".join(traceback.format_exception_only(type(e), e)))
    finally:
        sys.settrace(None)
        sys.stdin, sys.stdout, sys.stderr = old
        sys.setrecursionlimit(old_limit)
    result["stdout"] = out.getvalue()
    result["stderr"] = err.getvalue()[-4000:]
    result["elapsed_ms"] = int((time.monotonic() - start) * 1000)
    return result


def run_json(payload):
    p = json.loads(payload)
    return json.dumps(_run(p["code"], p.get("stdin", ""), float(p.get("timeout", 5.0))), ensure_ascii=False)


def check_json(payload):
    p = json.loads(payload)
    try:
        compile(p["code"], "<solution>", "exec")
        return json.dumps({"ok": True})
    except SyntaxError as e:
        return json.dumps({"ok": False, "error": type(e).__name__, "message": e.msg, "line": e.lineno,
                           "offset": e.offset, "text": (e.text or "").rstrip("\n")}, ensure_ascii=False)


def _same(a, b):
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


def judge_json(payload):
    p = json.loads(payload)
    timeout = float(p.get("timeout", 3.0))
    results = []
    passed = 0
    for t in p["tests"]:
        r = _run(p["code"], t.get("in", ""), timeout)
        ok = r["status"] == "OK" and _same(r["stdout"], t.get("out", ""))
        passed += ok
        results.append({"ok": ok, "status": r["status"], "stdout": r["stdout"][-2000:], "expected": t.get("out", ""),
                        "error": r.get("error"), "message": r.get("message"), "line": r.get("line"),
                        "elapsed_ms": r.get("elapsed_ms", 0)})
        if r["status"] == "SYNTAX_ERROR":
            break
    return json.dumps({"passed": passed, "total": len(p["tests"]), "results": results}, ensure_ascii=False)


def batch_json(payload):
    """Runs every program on every input (used to verify generated solution methods)."""
    p = json.loads(payload)
    timeout = float(p.get("timeout", 3.0))
    outputs = []
    for code in p["programs"]:
        row = []
        for stdin in p["inputs"]:
            r = _run(code, stdin, timeout)
            row.append({"status": r["status"], "stdout": r["stdout"][-4000:], "error": r.get("error"),
                        "message": r.get("message")})
        outputs.append(row)
    return json.dumps({"outputs": outputs}, ensure_ascii=False)


def version_json(payload="{}"):
    import platform
    return json.dumps({"version": sys.version.split()[0], "implementation": platform.python_implementation(),
                       "platform": sys.platform})
