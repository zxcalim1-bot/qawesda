package com.pyolympiad.engine.analyzer

/**
 * A tolerant Python tokenizer. Unlike CPython's tokenizer it never stops at the first
 * error: unterminated strings and unbalanced brackets are recorded as diagnostics and
 * tokenizing continues, so the analyzer can explain several problems at once.
 */
enum class PyTok { NAME, NUMBER, STRING, OP }

data class PyToken(
    val type: PyTok,
    val text: String,
    /** 1-based line and 0-based column of the first character. */
    val line: Int,
    val col: Int,
    /** Bracket depth before this token. */
    val depth: Int,
    /** For STRING: the string prefix in lower case ("", "f", "rb", ...). */
    val prefix: String = "",
)

data class LexError(val line: Int, val col: Int, val kind: String, val message: String)

/** One logical line: tokens joined across brackets/backslashes, with its indentation. */
data class LogicalLine(
    val tokens: List<PyToken>,
    val startLine: Int,
    val endLine: Int,
    val indent: String,
    val comment: String?,
) {
    val first: PyToken? get() = tokens.firstOrNull()
    val firstText: String get() = first?.text ?: ""
    val indentWidth: Int get() = indent.fold(0) { acc, c -> if (c == '\t') (acc / 8 + 1) * 8 else acc + 1 }
    val endsWithColon: Boolean get() = tokens.lastOrNull()?.let { it.type == PyTok.OP && it.text == ":" } == true
}

class PythonLexer(source: String) {

    private val src = source.replace("\r\n", "\n").replace('\r', '\n')
    val lines: List<String> = src.split('\n')
    val tokens = ArrayList<PyToken>()
    val comments = ArrayList<PyToken>()
    val errors = ArrayList<LexError>()
    val logical = ArrayList<LogicalLine>()

    private data class Bracket(val ch: Char, val line: Int, val col: Int)

    private val ops3 = setOf("**=", "//=", ">>=", "<<=", "...", "!==", "===")
    private val ops2 = setOf(
        "==", "!=", "<=", ">=", "**", "//", "<<", ">>", "+=", "-=", "*=", "/=", "%=", "&=", "|=", "^=",
        "->", ":=", "&&", "||", "++", "--", "<>", "@=",
    )

    fun run(): PythonLexer {
        var pos = 0
        var line = 1
        var col = 0
        val n = src.length
        val stack = ArrayList<Bracket>()
        var atLineStart = true
        var cur = ArrayList<PyToken>()
        var curStart = 0
        var curIndent = ""
        var curComment: String? = null

        fun advance(k: Int) {
            repeat(k) {
                if (pos < n) {
                    if (src[pos] == '\n') { line++; col = 0 } else col++
                    pos++
                }
            }
        }

        fun flush(endLine: Int) {
            if (cur.isNotEmpty()) logical += LogicalLine(cur, curStart, endLine, curIndent, curComment)
            cur = ArrayList()
            curComment = null
        }

        while (pos < n) {
            if (atLineStart && stack.isEmpty()) {
                // Indentation of a new logical line; skip blank and comment-only lines.
                var j = pos
                while (j < n && (src[j] == ' ' || src[j] == '\t' || src[j] == '\u000c')) j++
                if (j >= n) break
                if (src[j] == '\n') { advance(j - pos + 1); continue }
                if (src[j] == '#') {
                    val end = src.indexOf('\n', j).let { if (it < 0) n else it }
                    comments += PyToken(PyTok.OP, src.substring(j, end), line, j - pos, 0)
                    advance(end - pos)
                    if (pos < n) advance(1)
                    continue
                }
                curIndent = src.substring(pos, j)
                curStart = line
                advance(j - pos)
                atLineStart = false
                continue
            }
            atLineStart = false
            val c = src[pos]
            when {
                c == '\n' -> {
                    val endLine = line
                    advance(1)
                    if (stack.isEmpty()) {
                        flush(endLine)
                        atLineStart = true
                    }
                }
                c == ' ' || c == '\t' || c == '\u000c' -> advance(1)
                c == '#' -> {
                    val end = src.indexOf('\n', pos).let { if (it < 0) n else it }
                    val text = src.substring(pos, end)
                    comments += PyToken(PyTok.OP, text, line, col, stack.size)
                    if (curComment == null) curComment = text
                    advance(end - pos)
                }
                c == '\\' && pos + 1 < n && src[pos + 1] == '\n' -> {
                    // Explicit line joining: the newline is consumed, the logical line continues.
                    advance(2)
                }
                isIdentStart(c) -> {
                    var j = pos
                    while (j < n && isIdentPart(src[j])) j++
                    val word = src.substring(pos, j)
                    if (j < n && (src[j] == '"' || src[j] == '\'') && word.lowercase() in STRING_PREFIXES) {
                        readString(word.lowercase(), stack.size, line, col, pos) { tok, consumed ->
                            cur += tok
                            advance(consumed)
                        }
                    } else {
                        cur += PyToken(PyTok.NAME, word, line, col, stack.size)
                        advance(j - pos)
                    }
                }
                c.isDigit() || (c == '.' && pos + 1 < n && src[pos + 1].isDigit()) -> {
                    var j = pos
                    while (j < n) {
                        val d = src[j]
                        val ok = d.isLetterOrDigit() || d == '_' || d == '.' ||
                            ((d == '+' || d == '-') && j > pos && (src[j - 1] == 'e' || src[j - 1] == 'E') &&
                                !src.substring(pos, j).startsWith("0x", ignoreCase = true))
                        if (!ok) break
                        j++
                    }
                    cur += PyToken(PyTok.NUMBER, src.substring(pos, j), line, col, stack.size)
                    advance(j - pos)
                }
                c == '"' || c == '\'' -> readString("", stack.size, line, col, pos) { tok, consumed ->
                    cur += tok
                    advance(consumed)
                }
                else -> {
                    val three = if (pos + 3 <= n) src.substring(pos, pos + 3) else ""
                    val two = if (pos + 2 <= n) src.substring(pos, pos + 2) else ""
                    val op = when {
                        three in ops3 -> three
                        two in ops2 -> two
                        else -> c.toString()
                    }
                    when {
                        op.length == 1 && c in "([{" -> {
                            cur += PyToken(PyTok.OP, op, line, col, stack.size)
                            stack += Bracket(c, line, col)
                        }
                        op.length == 1 && c in ")]}" -> {
                            val expected = "([{"[")]}".indexOf(c)]
                            when {
                                stack.isEmpty() -> errors += LexError(line, col, "SyntaxError", "unmatched '$c'")
                                stack.last().ch != expected -> {
                                    val open = stack.removeAt(stack.size - 1)
                                    errors += LexError(line, col, "SyntaxError",
                                        "closing parenthesis '$c' does not match opening parenthesis '${open.ch}' on line ${open.line}")
                                }
                                else -> stack.removeAt(stack.size - 1)
                            }
                            cur += PyToken(PyTok.OP, op, line, col, stack.size)
                        }
                        else -> {
                            if (op == "$" || op == "?" || op == "`") {
                                errors += LexError(line, col, "SyntaxError", "invalid character '$op'")
                            }
                            cur += PyToken(PyTok.OP, op, line, col, stack.size)
                        }
                    }
                    advance(op.length)
                }
            }
        }
        flush(line)
        for (b in stack) errors += LexError(b.line, b.col, "SyntaxError", "'${b.ch}' was never closed")
        tokens += logical.flatMap { it.tokens }
        return this
    }

    private fun isIdentStart(c: Char) = c.isLetter() || c == '_' || (c.code > 127 && Character.isUnicodeIdentifierStart(c))
    private fun isIdentPart(c: Char) = c.isLetterOrDigit() || c == '_' || (c.code > 127 && Character.isUnicodeIdentifierPart(c))

    /** Reads a (possibly triple-quoted, possibly prefixed) string literal starting at [start]. */
    private inline fun readString(prefix: String, depth: Int, line: Int, col: Int, start: Int, emit: (PyToken, Int) -> Unit) {
        val n = src.length
        val q = start + prefix.length
        val quote = src[q]
        val triple = src.startsWith("$quote$quote$quote", q)
        var j = q + if (triple) 3 else 1
        while (j < n) {
            val ch = src[j]
            if (ch == '\\' && j + 1 < n) { j += 2; continue }
            if (!triple && ch == '\n') break
            if (triple && src.startsWith("$quote$quote$quote", j)) {
                emit(PyToken(PyTok.STRING, src.substring(start, j + 3), line, col, depth, prefix), j + 3 - start)
                return
            }
            if (!triple && ch == quote) {
                emit(PyToken(PyTok.STRING, src.substring(start, j + 1), line, col, depth, prefix), j + 1 - start)
                return
            }
            j++
        }
        errors += LexError(line, col, "SyntaxError", if (triple) "unterminated triple-quoted string literal" else "unterminated string literal")
        emit(PyToken(PyTok.STRING, src.substring(start, j), line, col, depth, prefix), j - start)
    }

    companion object {
        val STRING_PREFIXES = setOf("r", "u", "b", "f", "br", "rb", "fr", "rf")
    }
}
