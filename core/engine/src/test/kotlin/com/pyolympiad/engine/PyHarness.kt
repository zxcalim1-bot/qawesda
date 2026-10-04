package com.pyolympiad.engine

import java.io.File
import java.util.Base64
import java.util.concurrent.TimeUnit

/**
 * Executes many Python snippets in one python3 process (fast) and returns
 * (status, stdout) for each. Tests that need it are skipped when python3 is missing.
 */
object PyHarness {

    data class Job(val code: String, val stdin: String)
    data class Result(val ok: Boolean, val output: String, val error: String?)

    private val python: String = System.getProperty("pyolymp.python") ?: "python3"

    val available: Boolean by lazy {
        runCatching {
            val p = ProcessBuilder(python, "--version").redirectErrorStream(true).start()
            p.waitFor(10, TimeUnit.SECONDS) && p.exitValue() == 0
        }.getOrDefault(false)
    }

    private const val RUNNER = """
import sys, io, base64
def run(code, stdin):
    out = io.StringIO()
    old_in, old_out = sys.stdin, sys.stdout
    sys.stdin = io.StringIO(stdin)
    sys.stdout = out
    status = "OK"
    try:
        exec(compile(code, "<solution>", "exec"), {"__name__": "__main__"})
    except SystemExit:
        pass
    except BaseException as e:
        status = "ERR " + type(e).__name__ + ": " + str(e)
    finally:
        sys.stdin, sys.stdout = old_in, old_out
    return status, out.getvalue()
res = []
for line in open(sys.argv[1], encoding="utf-8"):
    line = line.strip()
    if not line:
        continue
    c, i = line.split(" ")
    status, out = run(base64.b64decode(c).decode(), base64.b64decode(i).decode())
    res.append(base64.b64encode(status.encode()).decode() + " " + base64.b64encode(out.encode()).decode())
open(sys.argv[2], "w", encoding="utf-8").write("\n".join(res) + "\n")
"""

    fun run(jobs: List<Job>): List<Result> {
        if (jobs.isEmpty()) return emptyList()
        val dir = File(System.getProperty("java.io.tmpdir"), "pyharness-" + System.nanoTime()).apply { mkdirs() }
        val script = File(dir, "runner.py").apply { writeText(RUNNER.trimIndent()) }
        val input = File(dir, "jobs.txt")
        val output = File(dir, "out.txt")
        val enc = Base64.getEncoder()
        input.bufferedWriter().use { w ->
            for (j in jobs) {
                w.write(enc.encodeToString(j.code.toByteArray()) + " " + enc.encodeToString(j.stdin.toByteArray()))
                w.newLine()
            }
        }
        val p = ProcessBuilder(python, script.path, input.path, output.path).redirectErrorStream(true).start()
        val log = p.inputStream.bufferedReader().readText()
        check(p.waitFor(600, TimeUnit.SECONDS)) { "python timed out" }
        check(p.exitValue() == 0) { "runner failed: $log" }
        val dec = Base64.getDecoder()
        val results = output.readLines().filter { it.isNotBlank() }.map { line ->
            val (s, o) = line.split(" ")
            val status = String(dec.decode(s))
            Result(status == "OK", String(dec.decode(o)), if (status == "OK") null else status)
        }
        dir.deleteRecursively()
        return results
    }

    /** Whitespace-insensitive comparison with a tolerance for floats (like most judges). */
    fun same(a: String, b: String): Boolean {
        val x = a.trim().split(Regex("\\s+")).filter { it.isNotEmpty() }
        val y = b.trim().split(Regex("\\s+")).filter { it.isNotEmpty() }
        if (x.size != y.size) return false
        for (i in x.indices) {
            if (x[i] == y[i]) continue
            val dx = x[i].toDoubleOrNull()
            val dy = y[i].toDoubleOrNull()
            if (dx == null || dy == null) return false
            if (Math.abs(dx - dy) > 1e-9 * maxOf(1.0, Math.abs(dx), Math.abs(dy))) return false
        }
        return true
    }
}
