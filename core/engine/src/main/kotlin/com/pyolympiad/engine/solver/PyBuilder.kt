package com.pyolympiad.engine.solver

/** Tiny helper for emitting correctly indented Python code. */
class PyBuilder {
    private val imports = LinkedHashSet<String>()
    private val helpers = LinkedHashMap<String, String>()
    private val lines = ArrayList<String>()
    private var depth = 0

    fun import(stmt: String): PyBuilder { imports += stmt; return this }

    /** Adds a helper definition once (keyed by name). */
    fun helper(name: String, code: String): PyBuilder { helpers.putIfAbsent(name, code.trimIndent()); return this }

    fun line(s: String = ""): PyBuilder {
        if (s.isEmpty()) lines += "" else lines += "    ".repeat(depth) + s
        return this
    }

    fun lines(vararg s: String): PyBuilder { s.forEach { line(it) }; return this }

    fun block(header: String, body: PyBuilder.() -> Unit): PyBuilder {
        line(header)
        depth++
        body()
        depth--
        return this
    }

    fun build(): String {
        val out = StringBuilder()
        if (imports.isNotEmpty()) {
            imports.sorted().forEach { out.append(it).append('\n') }
            out.append('\n')
        }
        for (h in helpers.values) {
            out.append(h).append("\n\n\n")
        }
        lines.forEach { out.append(it).append('\n') }
        return out.toString().trimEnd() + "\n"
    }
}

fun py(body: PyBuilder.() -> Unit): PyBuilder = PyBuilder().apply(body)

object CodeNormalizer {
    /** Normal form used to detect duplicate solutions: no comments, no blank lines, no spaces. */
    fun key(code: String): String = code.lines()
        .map { it.substringBefore("  #").trim() }
        .filter { it.isNotEmpty() && !it.startsWith("#") }
        .joinToString("\n") { it.replace(" ", "") }
}
