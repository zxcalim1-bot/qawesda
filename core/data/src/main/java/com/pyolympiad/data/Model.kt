package com.pyolympiad.data

import org.json.JSONArray
import org.json.JSONObject

data class EntrySummary(
    val id: String,
    val kind: String,
    val category: String,
    val title: String,
    val summary: String,
    val level: Int,
    val lang: String,
) {
    val domain: Domain? get() = Domain.ofId(id)
}

/** A rendered block of an entry section. */
sealed class Block {
    data class Paragraph(val text: String) : Block()
    data class Bullets(val items: List<String>) : Block()
    data class Code(val code: String, val lang: String, val input: String?, val output: String?, val error: String?) : Block()
}

data class Section(val heading: String, val blocks: List<Block>)

data class TaskTest(val input: String, val output: String, val hidden: Boolean)
data class TaskSolution(val title: String, val code: String, val explain: String, val time: String, val memory: String)

data class TaskData(
    val statement: String,
    val input: String,
    val output: String,
    val constraints: String,
    val hints: List<String>,
    val solutions: List<TaskSolution>,
    val explain: String,
    val tests: List<TaskTest>,
    val topic: String,
)

data class QuizData(
    val type: String,
    val question: String,
    val code: String,
    val options: List<String>,
    val answer: Int,
    val explain: String,
    val variants: List<String>,
)

data class ErrorData(
    val exception: String,
    val wrong: String,
    val wrongOut: String,
    val fixed: String,
    val fixedOut: String,
)

data class Entry(
    val summary: EntrySummary,
    val source: String,
    val sections: List<Section>,
    val signature: String?,
    val fields: Map<String, String>,
    val task: TaskData?,
    val quiz: QuizData?,
    val error: ErrorData?,
    val related: List<EntrySummary>,
    val referencedBy: List<EntrySummary>,
) {
    val id: String get() = summary.id
    val title: String get() = summary.title
}

data class Category(val kind: String, val name: String, val count: Int)

data class SearchHit(val entry: EntrySummary, val score: Double)

internal object EntryParser {

    fun parse(summary: EntrySummary, source: String, json: String, related: List<EntrySummary>, backlinks: List<EntrySummary>): Entry {
        val o = JSONObject(json)
        val sections = o.optJSONArray("sections")?.let { parseSections(it) } ?: emptyList()
        val fields = HashMap<String, String>()
        for (k in listOf("complexity", "memory", "url", "lang", "license", "install", "version", "aliases")) {
            o.optString(k, "").takeIf { it.isNotEmpty() }?.let { fields[k] = it }
        }
        return Entry(
            summary = summary,
            source = source,
            sections = sections,
            signature = o.optString("sig", "").takeIf { it.isNotEmpty() },
            fields = fields,
            task = o.optJSONObject("task")?.let { parseTask(it) },
            quiz = o.optJSONObject("quiz")?.let { parseQuiz(it) },
            error = o.optJSONObject("error")?.let { parseError(it) },
            related = related,
            referencedBy = backlinks,
        )
    }

    fun parseSections(arr: JSONArray): List<Section> = (0 until arr.length()).map { i ->
        val s = arr.getJSONObject(i)
        val blocks = s.optJSONArray("b") ?: JSONArray()
        Section(s.optString("h"), (0 until blocks.length()).mapNotNull { j -> parseBlock(blocks.getJSONObject(j)) })
    }

    private fun parseBlock(b: JSONObject): Block? = when {
        b.has("p") -> Block.Paragraph(b.getString("p"))
        b.has("ul") -> b.getJSONArray("ul").let { a -> Block.Bullets((0 until a.length()).map { a.getString(it) }) }
        b.has("code") -> Block.Code(
            code = b.getString("code").trimEnd('\n'),
            lang = b.optString("lang", "text"),
            input = b.optString("in", "").takeIf { it.isNotEmpty() },
            output = b.optString("out", "").takeIf { it.isNotEmpty() }?.trimEnd('\n'),
            error = b.optString("err", "").takeIf { it.isNotEmpty() },
        )
        else -> null
    }

    private fun strings(a: JSONArray?): List<String> = if (a == null) emptyList() else (0 until a.length()).map { a.getString(it) }

    private fun parseTask(t: JSONObject) = TaskData(
        statement = t.optString("statement"),
        input = t.optString("input"),
        output = t.optString("output"),
        constraints = t.optString("constraints"),
        hints = strings(t.optJSONArray("hints")),
        solutions = t.optJSONArray("solutions")?.let { a ->
            (0 until a.length()).map { i ->
                val s = a.getJSONObject(i)
                TaskSolution(s.optString("title"), s.optString("code"), s.optString("explain"), s.optString("time"), s.optString("memory"))
            }
        } ?: emptyList(),
        explain = t.optString("explain"),
        tests = t.optJSONArray("tests")?.let { a ->
            (0 until a.length()).map { i ->
                val s = a.getJSONObject(i)
                TaskTest(s.optString("in"), s.optString("out"), s.optBoolean("hidden", false))
            }
        } ?: emptyList(),
        topic = t.optString("topic"),
    )

    private fun parseQuiz(q: JSONObject) = QuizData(
        type = q.optString("type"),
        question = q.optString("question"),
        code = q.optString("code"),
        options = strings(q.optJSONArray("options")),
        answer = q.optInt("answer", 0),
        explain = q.optString("explain"),
        variants = strings(q.optJSONArray("variants")),
    )

    private fun parseError(e: JSONObject) = ErrorData(
        exception = e.optString("exception"),
        wrong = e.optString("wrong"),
        wrongOut = e.optString("wrong_out"),
        fixed = e.optString("fixed"),
        fixedOut = e.optString("fixed_out"),
    )
}
