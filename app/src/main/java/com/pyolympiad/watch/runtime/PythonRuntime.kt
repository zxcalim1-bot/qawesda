package com.pyolympiad.watch.runtime

import android.content.Context
import com.chaquo.python.Python
import com.chaquo.python.android.AndroidPlatform
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import kotlinx.coroutines.withContext
import org.json.JSONArray
import org.json.JSONObject

data class RunResult(
    val status: String,
    val stdout: String,
    val stderr: String,
    val error: String?,
    val message: String?,
    val line: Int?,
    val elapsedMs: Int,
) {
    val ok: Boolean get() = status == "OK"
    val statusRu: String
        get() = when (status) {
            "OK" -> "Выполнено"
            "SYNTAX_ERROR" -> "Синтаксическая ошибка"
            "RUNTIME_ERROR" -> "Ошибка выполнения"
            "TIMEOUT" -> "Превышено время"
            "OUTPUT_LIMIT" -> "Слишком большой вывод"
            "EXIT" -> "Завершено с кодом"
            else -> status
        }
}

data class SyntaxCheck(val ok: Boolean, val error: String?, val message: String?, val line: Int?, val offset: Int?, val text: String?)

data class JudgeTestResult(val ok: Boolean, val status: String, val stdout: String, val expected: String, val error: String?, val message: String?, val line: Int?, val elapsedMs: Int)

data class JudgeResult(val passed: Int, val total: Int, val results: List<JudgeTestResult>) {
    val allPassed: Boolean get() = total > 0 && passed == total
}

/**
 * The embedded CPython 3.11 (Chaquopy). Runs fully offline on the watch.
 * Calls are serialized: only one program runs at a time.
 */
class PythonRuntime(private val context: Context) {

    private val mutex = Mutex()

    @Volatile
    var startError: String? = null
        private set

    private fun module() = run {
        startError?.let { throw IllegalStateException("Python не запустился: $it") }
        runCatching {
            if (!Python.isStarted()) Python.start(AndroidPlatform(context))
            Python.getInstance().getModule("pyolymp_runner")
        }.getOrElse {
            // A failed start (missing native libraries) is permanent for this process: fail fast later.
            startError = it.message ?: it.javaClass.simpleName
            throw it
        }
    }

    suspend fun warmUp(): Boolean = withContext(Dispatchers.Default) {
        runCatching { module(); true }.getOrDefault(false)
    }

    private suspend fun call(fn: String, payload: JSONObject): JSONObject = mutex.withLock {
        withContext(Dispatchers.Default) {
            JSONObject(module().callAttr(fn, payload.toString()).toString())
        }
    }

    suspend fun version(): String = runCatching { call("version_json", JSONObject()).optString("version") }.getOrDefault("?")

    suspend fun run(code: String, stdin: String, timeoutSec: Double = 5.0): RunResult {
        val o = call("run_json", JSONObject().put("code", code).put("stdin", stdin).put("timeout", timeoutSec))
        return parseRun(o)
    }

    suspend fun check(code: String): SyntaxCheck {
        val o = call("check_json", JSONObject().put("code", code))
        return SyntaxCheck(
            o.optBoolean("ok"), o.optString("error").ifEmpty { null }, o.optString("message").ifEmpty { null },
            o.optInt("line", -1).takeIf { it > 0 }, o.optInt("offset", -1).takeIf { it > 0 }, o.optString("text").ifEmpty { null },
        )
    }

    suspend fun judge(code: String, tests: List<Pair<String, String>>, timeoutSec: Double = 3.0): JudgeResult {
        val arr = JSONArray()
        tests.forEach { (i, o) -> arr.put(JSONObject().put("in", i).put("out", o)) }
        val o = call("judge_json", JSONObject().put("code", code).put("tests", arr).put("timeout", timeoutSec))
        val res = o.getJSONArray("results")
        return JudgeResult(o.getInt("passed"), o.getInt("total"), (0 until res.length()).map { k ->
            val r = res.getJSONObject(k)
            JudgeTestResult(
                r.optBoolean("ok"), r.optString("status"), r.optString("stdout"), r.optString("expected"),
                r.optString("error").ifEmpty { null }?.takeIf { it != "null" }, r.optString("message").ifEmpty { null }?.takeIf { it != "null" },
                r.optInt("line", -1).takeIf { it > 0 }, r.optInt("elapsed_ms"),
            )
        })
    }

    /** Runs each program on each input; returns outputs[program][input]. */
    suspend fun batch(programs: List<String>, inputs: List<String>, timeoutSec: Double = 3.0): List<List<RunResult>> {
        val o = call(
            "batch_json",
            JSONObject().put("programs", JSONArray(programs)).put("inputs", JSONArray(inputs)).put("timeout", timeoutSec),
        )
        val rows = o.getJSONArray("outputs")
        return (0 until rows.length()).map { i ->
            val row = rows.getJSONArray(i)
            (0 until row.length()).map { j -> parseRun(row.getJSONObject(j)) }
        }
    }

    private fun parseRun(o: JSONObject) = RunResult(
        status = o.optString("status"),
        stdout = o.optString("stdout"),
        stderr = o.optString("stderr"),
        error = o.optString("error").takeIf { it.isNotEmpty() && it != "null" },
        message = o.optString("message").takeIf { it.isNotEmpty() && it != "null" },
        line = o.optInt("line", -1).takeIf { it > 0 },
        elapsedMs = o.optInt("elapsed_ms"),
    )

    companion object {
        /** Whitespace-insensitive output comparison with float tolerance (same as the judge). */
        fun sameOutput(a: String, b: String): Boolean {
            val x = a.trim().split(Regex("\\s+")).filter { it.isNotEmpty() }
            val y = b.trim().split(Regex("\\s+")).filter { it.isNotEmpty() }
            if (x.size != y.size) return false
            for (i in x.indices) {
                if (x[i] == y[i]) continue
                val dx = x[i].toDoubleOrNull() ?: return false
                val dy = y[i].toDoubleOrNull() ?: return false
                if (Math.abs(dx - dy) > 1e-6 * maxOf(1.0, Math.abs(dx), Math.abs(dy))) return false
            }
            return true
        }
    }
}
