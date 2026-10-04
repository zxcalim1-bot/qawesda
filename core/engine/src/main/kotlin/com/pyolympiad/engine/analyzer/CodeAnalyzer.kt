package com.pyolympiad.engine.analyzer

import com.pyolympiad.engine.text.Fuzzy

enum class Severity(val titleRu: String, val rank: Int) {
    ERROR("Ошибка", 0), WARNING("Предупреждение", 1), PERFORMANCE("Эффективность", 2), STYLE("Стиль", 3)
}

data class Issue(
    val severity: Severity,
    val line: Int,
    val code: String,
    /** Python exception that this problem produces, e.g. "SyntaxError", or null. */
    val pythonError: String?,
    val title: String,
    val cause: String,
    val explanation: String,
    val fix: String?,
)

data class Complexity(val time: String, val memory: String, val reasons: List<String>)

data class CodeStats(
    val lines: Int,
    val logicalLines: Int,
    val functions: List<String>,
    val loops: Int,
    val maxLoopDepth: Int,
    val usesInput: Boolean,
    val imports: List<String>,
)

data class AnalysisReport(
    val issues: List<Issue>,
    val fixedCode: String?,
    val appliedFixes: List<String>,
    val complexity: Complexity,
    val stats: CodeStats,
    val recommendations: List<String>,
) {
    val errors: Int get() = issues.count { it.severity == Severity.ERROR }
    val warnings: Int get() = issues.count { it.severity == Severity.WARNING }

    val summary: String
        get() = when {
            issues.isEmpty() -> "Ошибок не найдено. Сложность: ${complexity.time}."
            errors > 0 -> "Найдено ошибок: $errors, предупреждений: $warnings."
            warnings > 0 -> "Ошибок нет, предупреждений: $warnings."
            else -> "Ошибок нет; есть советы по эффективности и стилю."
        }
}

/**
 * Static analyzer for Python source code (beginner/olympiad oriented).
 * Works fully offline in pure Kotlin. On the device its syntax verdict is combined with
 * CPython's own compile() from the embedded runtime.
 */
class CodeAnalyzer {

    fun analyze(code: String): AnalysisReport {
        val first = analyzeOnce(code)
        val (fixed, applied) = Fixer(code, first.second).apply()
        var fixedCode: String? = null
        if (applied.isNotEmpty() && fixed != code) {
            val after = analyzeOnce(fixed).first
            val beforeErrors = first.first.count { it.severity == Severity.ERROR }
            val afterErrors = after.count { it.severity == Severity.ERROR }
            if (afterErrors < beforeErrors || (afterErrors == beforeErrors && after.size < first.first.size)) fixedCode = fixed
        }
        val ctx = first.second
        return AnalysisReport(
            issues = first.first.sortedWith(compareBy({ it.severity.rank }, { it.line })),
            fixedCode = fixedCode,
            appliedFixes = if (fixedCode != null) applied else emptyList(),
            complexity = ComplexityEstimator(ctx).estimate(),
            stats = ctx.stats(),
            recommendations = recommendations(ctx, first.first),
        )
    }

    private fun analyzeOnce(code: String): Pair<List<Issue>, Ctx> {
        val lex = PythonLexer(code).run()
        val ctx = Ctx(code, lex)
        val issues = ArrayList<Issue>()
        Checks(ctx, issues).runAll()
        return issues.distinctBy { Triple(it.line, it.code, it.title) } to ctx
    }

    private fun recommendations(ctx: Ctx, issues: List<Issue>): List<String> {
        val out = ArrayList<String>()
        if (issues.any { it.code == "input-not-converted" }) out += "Переводите ввод в числа сразу: n = int(input()), a = list(map(int, input().split()))."
        if (ctx.loopDepthMax >= 2) out += "Вложенные циклы дают O(n²) и больше: при n ≥ 10⁴ подумайте о сортировке, словаре, префиксных суммах или двух указателях."
        if (ctx.inputInLoop) out += "Если строк ввода очень много, читайте всё сразу: import sys; data = sys.stdin.read().split()."
        if (issues.any { it.code == "list-membership-in-loop" }) out += "Проверка x in список — O(n); для частых проверок используйте множество set."
        if (issues.any { it.code == "pop0" }) out += "Для очереди используйте collections.deque: popleft() работает за O(1)."
        if (issues.any { it.severity == Severity.STYLE }) out += "Стиль кода описан в PEP 8: 4 пробела отступа, имена переменных и функций в snake_case, классы в CapWords."
        if (ctx.functions.isEmpty() && ctx.logical.size > 25) out += "Разбейте длинную программу на функции — её будет проще читать и тестировать."
        if (out.isEmpty()) out += "Проверьте программу на крайних случаях: минимальные и максимальные значения, пустой ввод, отрицательные числа."
        return out
    }
}

// ============================================================================ context

internal class Ctx(val code: String, val lex: PythonLexer) {
    val logical: List<LogicalLine> = lex.logical
    val lines: List<String> = lex.lines

    val builtins = BUILTINS
    val defined = HashMap<String, Int>()          // name -> first definition line
    val definedLines = HashMap<String, MutableList<Int>>()
    val used = HashMap<String, MutableList<Int>>() // name -> lines where used
    val functions = ArrayList<String>()
    val imports = ArrayList<String>()
    var starImport = false
    val varKind = HashMap<String, String>()        // last simple kind: input, int, float, list, str, none
    val inputVars = HashMap<String, Int>()          // var assigned from bare input() -> line
    var loopDepthMax = 0
    var loops = 0
    var inputInLoop = false

    /** Indentation depth (number of enclosing blocks) of each logical line. */
    val blockDepth = IntArray(logical.size)
    /** For each logical line: the indices of enclosing block header lines. */
    val parents = Array(logical.size) { emptyList<Int>() }

    init {
        computeBlocks()
        collectNames()
    }

    private fun computeBlocks() {
        val stack = ArrayList<Pair<Int, Int>>() // (indentWidth, headerIndex)
        for ((i, l) in logical.withIndex()) {
            val w = l.indentWidth
            while (stack.isNotEmpty() && stack.last().first >= w) stack.removeAt(stack.size - 1)
            blockDepth[i] = stack.size
            parents[i] = stack.map { it.second }
            if (l.endsWithColon) stack += w to i
        }
    }

    fun isLoopHeader(i: Int): Boolean = logical[i].firstText.let { it == "for" || it == "while" } ||
        (logical[i].firstText == "async" && logical[i].tokens.getOrNull(1)?.text == "for")

    fun enclosingLoops(i: Int): List<Int> = parents[i].filter { isLoopHeader(it) }

    fun enclosingFunction(i: Int): Int? = parents[i].lastOrNull { logical[it].firstText == "def" || (logical[it].firstText == "async" && logical[it].tokens.getOrNull(1)?.text == "def") }

    private fun define(name: String, line: Int) {
        if (name !in defined) defined[name] = line
        definedLines.getOrPut(name) { ArrayList() }.add(line)
    }

    private fun use(name: String, line: Int) {
        used.getOrPut(name) { ArrayList() }.add(line)
    }

    private fun collectNames() {
        for ((li, l) in logical.withIndex()) {
            val t = l.tokens
            val base = t.first().depth
            val loopsAround = enclosingLoops(li).size
            if (isLoopHeader(li)) {
                loops++
                loopDepthMax = maxOf(loopDepthMax, loopsAround + 1)
            }
            when (l.firstText) {
                "def" -> {
                    t.getOrNull(1)?.takeIf { it.type == PyTok.NAME }?.let { define(it.text, l.startLine); functions += it.text }
                    // parameters
                    val open = t.indexOfFirst { it.text == "(" }
                    if (open >= 0) {
                        val d = t[open].depth + 1
                        for (k in open + 1 until t.size) {
                            val tok = t[k]
                            if (tok.depth < d) break
                            if (tok.type == PyTok.NAME && tok.depth == d) {
                                val prev = t[k - 1].text
                                if (prev == "(" || prev == "," || prev == "*" || prev == "**") define(tok.text, l.startLine)
                            }
                        }
                    }
                }
                "class" -> t.getOrNull(1)?.takeIf { it.type == PyTok.NAME }?.let { define(it.text, l.startLine) }
                "import" -> {
                    var k = 1
                    while (k < t.size) {
                        if (t[k].type == PyTok.NAME) {
                            val start = t[k].text
                            var end = k
                            while (end + 2 < t.size && t[end + 1].text == "." && t[end + 2].type == PyTok.NAME) end += 2
                            if (end + 2 < t.size && t[end + 1].text == "as") {
                                define(t[end + 2].text, l.startLine); k = end + 3
                            } else {
                                define(start, l.startLine); k = end + 1
                            }
                            imports += start
                        } else k++
                    }
                }
                "from" -> {
                    val imp = t.indexOfFirst { it.text == "import" }
                    if (imp > 0) {
                        imports += t.subList(1, imp).joinToString("") { it.text }
                        var k = imp + 1
                        while (k < t.size) {
                            val tok = t[k]
                            if (tok.text == "*") starImport = true
                            if (tok.type == PyTok.NAME) {
                                if (k + 2 < t.size && t[k + 1].text == "as") { define(t[k + 2].text, l.startLine); k += 3; continue }
                                define(tok.text, l.startLine)
                            }
                            k++
                        }
                    }
                }
                "global", "nonlocal" -> t.drop(1).filter { it.type == PyTok.NAME }.forEach { define(it.text, l.startLine) }
            }
            // for-targets (statement and comprehensions), with/except "as", lambda params, walrus
            for ((k, tok) in t.withIndex()) {
                when {
                    tok.text == "for" && tok.type == PyTok.NAME -> {
                        var j = k + 1
                        while (j < t.size && !(t[j].text == "in" && t[j].depth == tok.depth)) {
                            if (t[j].type == PyTok.NAME) define(t[j].text, t[j].line)
                            j++
                        }
                    }
                    tok.text == "as" && k + 1 < t.size && t[k + 1].type == PyTok.NAME -> define(t[k + 1].text, tok.line)
                    tok.text == "lambda" -> {
                        var j = k + 1
                        while (j < t.size && t[j].text != ":") { if (t[j].type == PyTok.NAME) define(t[j].text, tok.line); j++ }
                    }
                    tok.text == ":=" && k > 0 && t[k - 1].type == PyTok.NAME -> define(t[k - 1].text, tok.line)
                }
            }
            // assignments: targets before top-level "="
            val eqs = t.withIndex().filter { it.value.type == PyTok.OP && it.value.text == "=" && it.value.depth == base }.map { it.index }
            if (eqs.isNotEmpty() && l.firstText !in setOf("def", "class", "if", "elif", "while", "for", "with", "return", "print", "assert")) {
                var startIdx = 0
                for (e in eqs) {
                    for (k in startIdx until e) {
                        val tok = t[k]
                        if (tok.type != PyTok.NAME || tok.text in KEYWORDS) continue
                        val prev = t.getOrNull(k - 1)?.text
                        val next = t.getOrNull(k + 1)?.text
                        if (prev == "." || next == "(" || next == "." || (next == "[" && tok.depth == base)) continue
                        if (tok.depth == base || (prev == "(" || prev == "[" || prev == ",")) define(tok.text, tok.line)
                    }
                    startIdx = e + 1
                }
                // simple kind inference for "x = <expr>"
                if (eqs.size == 1 && eqs[0] == 1 && t[0].type == PyTok.NAME) {
                    val name = t[0].text
                    val rhs = t.subList(2, t.size)
                    val kind = kindOf(rhs, name)
                    if (kind != null) varKind[name] = kind else varKind.remove(name)
                    if (kind == "input") inputVars[name] = l.startLine else inputVars.remove(name)
                }
            }
            // usages
            for ((k, tok) in t.withIndex()) {
                if (tok.type == PyTok.NAME && tok.text !in KEYWORDS) {
                    val prev = t.getOrNull(k - 1)?.text
                    val next = t.getOrNull(k + 1)?.text
                    if (prev == ".") continue
                    if (next == "=" && tok.depth > base && (prev == "(" || prev == ",")) continue // keyword argument
                    use(tok.text, tok.line)
                    if (tok.text == "input" && next == "(" && enclosingLoops(li).isNotEmpty()) inputInLoop = true
                }
                if (tok.type == PyTok.STRING && tok.prefix.contains('f')) {
                    for (m in Regex("""\{\s*([A-Za-z_][A-Za-z_0-9]*)""").findAll(tok.text)) use(m.groupValues[1], tok.line)
                }
            }
        }
    }

    private fun kindOf(rhs: List<PyToken>, self: String): String? {
        if (rhs.isEmpty()) return null
        val text = rhs.joinToString(" ") { it.text }
        val f = rhs[0].text
        return when {
            text == "input ( )" || (f == "input" && rhs.size >= 3 && rhs.last().text == ")" && rhs.count { it.text == "(" } == 1) -> "input"
            f in setOf("int", "len", "sum", "abs", "round", "ord") && rhs.getOrNull(1)?.text == "(" && rhs.last().text == ")" && !text.contains(".split") -> "int"
            f == "float" && rhs.getOrNull(1)?.text == "(" -> "float"
            rhs.size == 1 && rhs[0].type == PyTok.NUMBER -> if (rhs[0].text.contains('.') || rhs[0].text.contains('e')) "float" else "int"
            rhs.size == 1 && rhs[0].type == PyTok.STRING -> "str"
            f == "[" || f == "list" || text.endsWith(". split ( )") || text.contains("split (") && f != "int" -> "list"
            f == "str" && rhs.getOrNull(1)?.text == "(" -> "str"
            rhs.size >= 4 && rhs[0].text == self && rhs[1].text == "." && rhs[2].text in NONE_METHODS -> "none"
            rhs.size >= 4 && rhs[0].type == PyTok.NAME && rhs[1].text == "." && rhs[2].text in NONE_METHODS && rhs[3].text == "(" -> "none"
            rhs.all { it.type == PyTok.NUMBER || it.text in setOf("+", "-", "*", "//", "%", "(", ")") || (it.type == PyTok.NAME && varKind[it.text] == "int") } &&
                rhs.any { it.type == PyTok.NUMBER || it.type == PyTok.NAME } -> "int"
            else -> null
        }
    }

    fun stats() = CodeStats(
        lines = lines.count { it.isNotBlank() },
        logicalLines = logical.size,
        functions = functions,
        loops = loops,
        maxLoopDepth = loopDepthMax,
        usesInput = used.containsKey("input"),
        imports = imports.distinct(),
    )

    companion object {
        val KEYWORDS = setOf(
            "False", "None", "True", "and", "as", "assert", "async", "await", "break", "class", "continue", "def",
            "del", "elif", "else", "except", "finally", "for", "from", "global", "if", "import", "in", "is",
            "lambda", "nonlocal", "not", "or", "pass", "raise", "return", "try", "while", "with", "yield",
        )
        val SOFT_KEYWORDS = setOf("match", "case", "_", "type")
        val NONE_METHODS = setOf("sort", "append", "reverse", "extend", "insert", "clear", "remove", "update", "add")
        val BUILTINS = setOf(
            "abs", "aiter", "all", "anext", "any", "ascii", "bin", "bool", "breakpoint", "bytearray", "bytes", "callable",
            "chr", "classmethod", "compile", "complex", "delattr", "dict", "dir", "divmod", "enumerate", "eval", "exec",
            "filter", "float", "format", "frozenset", "getattr", "globals", "hasattr", "hash", "help", "hex", "id", "input",
            "int", "isinstance", "issubclass", "iter", "len", "list", "locals", "map", "max", "memoryview", "min", "next",
            "object", "oct", "open", "ord", "pow", "print", "property", "range", "repr", "reversed", "round", "set",
            "setattr", "slice", "sorted", "staticmethod", "str", "sum", "super", "tuple", "type", "vars", "zip",
            "__import__", "__name__", "__file__", "__doc__", "__builtins__", "__spec__", "__debug__", "self", "cls",
            "Ellipsis", "NotImplemented", "exit", "quit", "copyright", "credits", "license",
            "BaseException", "BaseExceptionGroup", "Exception", "ExceptionGroup", "ArithmeticError", "AssertionError",
            "AttributeError", "BlockingIOError", "BrokenPipeError", "BufferError", "BytesWarning", "ChildProcessError",
            "ConnectionAbortedError", "ConnectionError", "ConnectionRefusedError", "ConnectionResetError",
            "DeprecationWarning", "EOFError", "EncodingWarning", "EnvironmentError", "FileExistsError", "FileNotFoundError",
            "FloatingPointError", "FutureWarning", "GeneratorExit", "IOError", "ImportError", "ImportWarning",
            "IndentationError", "IndexError", "InterruptedError", "IsADirectoryError", "KeyError", "KeyboardInterrupt",
            "LookupError", "MemoryError", "ModuleNotFoundError", "NameError", "NotADirectoryError", "NotImplementedError",
            "OSError", "OverflowError", "PendingDeprecationWarning", "PermissionError", "ProcessLookupError",
            "RecursionError", "ReferenceError", "ResourceWarning", "RuntimeError", "RuntimeWarning", "StopAsyncIteration",
            "StopIteration", "SyntaxError", "SyntaxWarning", "SystemError", "SystemExit", "TabError", "TimeoutError",
            "TypeError", "UnboundLocalError", "UnicodeDecodeError", "UnicodeEncodeError", "UnicodeError",
            "UnicodeTranslateError", "UnicodeWarning", "UserWarning", "ValueError", "Warning", "ZeroDivisionError",
        )
    }
}

// ============================================================================ checks

private class Checks(val ctx: Ctx, val out: MutableList<Issue>) {

    private val L get() = ctx.logical

    fun add(sev: Severity, line: Int, code: String, err: String?, title: String, cause: String, explanation: String, fix: String?) {
        out += Issue(sev, line, code, err, title, cause, explanation, fix)
    }

    fun runAll() {
        lexErrors()
        indentation()
        statements()
        names()
        types()
        logic()
        performance()
        style()
    }

    private fun lexErrors() {
        for (e in ctx.lex.errors) {
            val (title, cause, fix) = when {
                e.message.startsWith("unterminated triple") -> Triple("Незакрытая строка в тройных кавычках", "Строка начата тремя кавычками, но не закрыта.", "Добавьте закрывающие тройные кавычки.")
                e.message.startsWith("unterminated") -> Triple("Незакрытая строка", "Строка начата кавычкой, но до конца строки кода нет закрывающей кавычки того же типа.", "Добавьте закрывающую кавычку: print(\"текст\").")
                e.message.contains("was never closed") -> Triple("Незакрытая скобка", "Открывающая скобка ${e.message.substringAfter("'").substringBefore("'")} не имеет пары.", "Добавьте закрывающую скобку в нужном месте.")
                e.message.startsWith("unmatched") -> Triple("Лишняя закрывающая скобка", "Встретилась закрывающая скобка без открывающей.", "Удалите лишнюю скобку или добавьте открывающую.")
                e.message.startsWith("closing parenthesis") -> Triple("Скобки разных типов", "Закрывающая скобка не соответствует открывающей: ${e.message}.", "Проверьте пары скобок: ( ), [ ], { }.")
                else -> Triple("Недопустимый символ", "В Python нет оператора ${e.message.substringAfter("'").substringBefore("'")}.", "Удалите символ.")
            }
            add(Severity.ERROR, e.line, "lex", "SyntaxError: ${e.message}", title, cause,
                "Python читает код по токенам; пока скобки и кавычки не сбалансированы, программа не запустится.", fix)
        }
    }

    private fun indentation() {
        var prevIndent: Int? = null
        val stack = ArrayList<Int>()
        stack += 0
        var prevColon = false
        var prevLine = 0
        for (l in L) {
            val raw = l.indent
            if (raw.contains(' ') && raw.contains('\t')) {
                add(Severity.WARNING, l.startLine, "mixed-tabs", "TabError",
                    "Табы и пробелы в одном отступе", "Отступ строки содержит и табуляцию, и пробелы.",
                    "Python 3 запрещает непоследовательное смешивание табов и пробелов (TabError). PEP 8 рекомендует 4 пробела.",
                    "Замените табы на 4 пробела.")
            }
            val w = l.indentWidth
            if (prevIndent == null) {
                if (w > 0) add(Severity.ERROR, l.startLine, "unexpected-indent", "IndentationError: unexpected indent",
                    "Лишний отступ в первой строке", "Первая инструкция программы не должна иметь отступа.",
                    "Отступы в Python задают вложенность блоков; на верхнем уровне отступа нет.", "Уберите пробелы в начале строки.")
            } else {
                if (prevColon) {
                    if (w <= stack.last()) {
                        add(Severity.ERROR, l.startLine, "expected-indent", "IndentationError: expected an indented block after line $prevLine",
                            "Нет отступа после двоеточия", "После строки $prevLine с двоеточием (if/for/while/def/…) должен идти блок с отступом.",
                            "Тело условия, цикла или функции записывается с дополнительным отступом (обычно 4 пробела).",
                            "Добавьте 4 пробела в начале строки ${l.startLine} или pass.")
                    } else stack += w
                } else if (w > stack.last()) {
                    add(Severity.ERROR, l.startLine, "unexpected-indent", "IndentationError: unexpected indent",
                        "Неожиданный отступ", "Строка сдвинута вправо, хотя предыдущая строка не открывает блок (нет двоеточия).",
                        "Новый уровень отступа допустим только после строки, заканчивающейся двоеточием.",
                        "Выровняйте строку по предыдущей.")
                } else {
                    while (stack.size > 1 && stack.last() > w) stack.removeAt(stack.size - 1)
                    if (stack.last() != w) {
                        add(Severity.ERROR, l.startLine, "bad-dedent", "IndentationError: unindent does not match any outer indentation level",
                            "Отступ не совпадает ни с одним внешним уровнем", "Строка сдвинута на количество пробелов, которого нет у внешних блоков.",
                            "При возврате из блока отступ должен в точности совпасть с одним из предыдущих уровней.",
                            "Выровняйте строку по началу нужного блока.")
                    }
                }
            }
            if (w % 4 != 0 && !raw.contains('\t')) {
                add(Severity.STYLE, l.startLine, "indent-4", null, "Отступ не кратен 4", "Отступ строки — $w пробелов.",
                    "PEP 8 рекомендует 4 пробела на уровень вложенности.", "Используйте 4 пробела.")
            }
            prevIndent = w
            prevColon = l.endsWithColon
            prevLine = l.startLine
        }
        if (prevColon) {
            add(Severity.ERROR, L.last().startLine, "expected-indent", "SyntaxError: expected an indented block",
                "Блок не дописан", "Программа заканчивается строкой с двоеточием — у блока нет тела.",
                "После if/for/while/def должна идти хотя бы одна инструкция с отступом.", "Добавьте тело блока или pass.")
        }
    }

    private val compound = setOf("if", "elif", "else", "for", "while", "def", "class", "try", "except", "finally", "with")

    private fun statements() {
        val loopStack = ArrayList<Int>()
        for ((i, l) in L.withIndex()) {
            val t = l.tokens
            val first = l.firstText
            val base = t.first().depth
            // Missing colon.
            val headerKw = if (first == "async") t.getOrNull(1)?.text else first
            if (headerKw in compound && t.none { it.text == ":" && it.depth == base && !insideLambda(t, it) }) {
                add(Severity.ERROR, l.endLine, "missing-colon", "SyntaxError: expected ':'",
                    "Пропущено двоеточие", "Строка «${preview(l)}» начинается с $headerKw, но не заканчивается двоеточием.",
                    "Заголовки блоков (if, elif, else, for, while, def, class, try, except, finally, with) обязательно заканчиваются символом «:».",
                    "Добавьте «:» в конец строки.")
            }
            // Wrong-case keywords.
            if (first.isNotEmpty() && first[0].isUpperCase() && first.lowercase() in setOf("if", "elif", "else", "for", "while", "def", "class", "return", "import", "from", "try", "except", "print", "input", "break", "continue", "pass")) {
                add(Severity.ERROR, l.startLine, "keyword-case", if (first.lowercase() in setOf("print", "input")) "NameError: name '$first' is not defined" else "SyntaxError: invalid syntax",
                    "Ключевое слово с заглавной буквы", "«$first» написано с заглавной буквы.",
                    "Python различает регистр: ключевые слова и встроенные функции пишутся строчными буквами.", "Замените на «${first.lowercase()}».")
            }
            // Python 2 print.
            if (first == "print" && t.size > 1 && t[1].text != "(" && t[1].text != "=" && t[1].text != ".") {
                add(Severity.ERROR, l.startLine, "print-statement", "SyntaxError: Missing parentheses in call to 'print'",
                    "print без скобок", "Запись «print …» — синтаксис Python 2.",
                    "В Python 3 print — функция, её аргументы пишутся в скобках.", "Используйте print(...).")
            }
            // "else if", "elseif".
            if (first == "else" && t.getOrNull(1)?.text == "if") {
                add(Severity.ERROR, l.startLine, "else-if", "SyntaxError: expected ':'", "else if вместо elif",
                    "В Python нет конструкции «else if» в одной строке.", "Для цепочки условий используется elif.", "Замените «else if» на «elif».")
            }
            if (first in setOf("elseif", "elsif", "elif:")) {
                add(Severity.ERROR, l.startLine, "elseif", "SyntaxError: invalid syntax", "Неверное ключевое слово «$first»",
                    "Такого ключевого слова нет в Python.", "Цепочка условий: if … elif … else.", "Используйте elif.")
            }
            // Assignment instead of comparison in a condition.
            if (headerKw in setOf("if", "elif", "while")) {
                val eq = t.firstOrNull { it.text == "=" && it.depth == base }
                if (eq != null) {
                    add(Severity.ERROR, eq.line, "assign-in-condition", "SyntaxError: invalid syntax. Maybe you meant '==' or ':=' instead of '='?",
                        "= вместо == в условии", "В условии стоит оператор присваивания «=».",
                        "«=» присваивает значение, а для сравнения нужен «==».", "Замените «=» на «==».")
                }
            }
            // C-style operators.
            for ((k, tok) in t.withIndex()) {
                when {
                    tok.text == "&&" || tok.text == "||" -> add(Severity.ERROR, tok.line, "c-logic", "SyntaxError: invalid syntax",
                        "Оператор ${tok.text} из C/Java", "В Python логические операторы записываются словами.",
                        "«&&» → and, «||» → or, «!» → not.", "Замените «${tok.text}» на «${if (tok.text == "&&") "and" else "or"}».")
                    tok.text == "!" && t.getOrNull(k + 1)?.text != "=" -> add(Severity.ERROR, tok.line, "c-not", "SyntaxError: invalid syntax",
                        "Оператор ! из C/Java", "Логическое отрицание в Python — слово not.", "!x записывается как not x.", "Замените «!» на «not ».")
                    (tok.text == "++" || tok.text == "--") && k > 0 && t[k - 1].type == PyTok.NAME -> add(Severity.ERROR, tok.line, "c-incr",
                        "SyntaxError: invalid syntax", "Инкремент ${tok.text} не существует", "В Python нет операторов ++ и --.",
                        "Увеличение на 1 записывается как x += 1, уменьшение — x -= 1.", "Замените «${t[k - 1].text}${tok.text}» на «${t[k - 1].text} ${tok.text[0]}= 1».")
                    tok.text == "===" || tok.text == "!==" -> add(Severity.ERROR, tok.line, "js-eq", "SyntaxError: invalid syntax",
                        "Оператор ${tok.text} из JavaScript", "В Python строгое сравнение — это обычные == и !=.", "Python не делает неявных преобразований типов при ==.",
                        "Замените на «${tok.text.dropLast(1)}».")
                    tok.text == "<>" -> add(Severity.ERROR, tok.line, "py2-ne", "SyntaxError: invalid syntax", "Оператор <> устарел",
                        "<> — синтаксис Python 2.", "Неравенство в Python 3: !=.", "Замените «<>» на «!=».")
                }
            }
            if (first == "/" && t.getOrNull(1)?.text == "/" || (t.firstOrNull()?.text == "//")) {
                add(Severity.ERROR, l.startLine, "c-comment", "SyntaxError: invalid syntax", "Комментарий в стиле C",
                    "Строка начинается с //, но в Python // — оператор целочисленного деления.", "Комментарии в Python начинаются с символа #.", "Замените «//» на «#».")
            }
            if (first == "for" && t.getOrNull(1)?.text == "(" && t.any { it.text == ";" }) {
                add(Severity.ERROR, l.startLine, "c-for", "SyntaxError: invalid syntax", "Цикл for в стиле C",
                    "Конструкции for (i = 0; i < n; i++) в Python нет.", "Цикл по числам пишется через range: for i in range(n):", "Используйте for i in range(n):")
            }
            if (first in setOf("function", "func", "fun", "void", "public", "static", "var", "let", "const", "int") && t.getOrNull(1)?.type == PyTok.NAME &&
                (t.getOrNull(2)?.text == "(" || first in setOf("var", "let", "const"))) {
                add(Severity.ERROR, l.startLine, "foreign-syntax", "SyntaxError: invalid syntax", "Синтаксис другого языка",
                    "«$first» не используется в Python для объявлений.",
                    "Функции объявляются через def, переменные создаются присваиванием без ключевого слова.",
                    if (first in setOf("var", "let", "const", "int")) "Уберите «$first»." else "Используйте def имя(параметры):")
            }
            // return / break / continue placement.
            if (first == "return" && ctx.enclosingFunction(i) == null) {
                add(Severity.ERROR, l.startLine, "return-outside", "SyntaxError: 'return' outside function", "return вне функции",
                    "return можно использовать только внутри def.", "Чтобы завершить программу, используйте exit() или поместите код в функцию.", "Уберите return или оформите код функцией.")
            }
            if ((first == "break" || first == "continue") && ctx.enclosingLoops(i).isEmpty()) {
                add(Severity.ERROR, l.startLine, "break-outside", "SyntaxError: '$first' outside loop", "$first вне цикла",
                    "$first допустим только внутри for или while.", "break прерывает цикл, continue переходит к следующей итерации — вне цикла это бессмысленно.", "Уберите $first.")
            }
            // Statement ends with ";".
            if (t.last().text == ";") {
                add(Severity.STYLE, l.endLine, "semicolon", null, "Точка с запятой в конце строки", "Строка заканчивается «;».",
                    "В Python точка с запятой не нужна; она лишь разделяет несколько инструкций в одной строке.", "Уберите «;».")
            }
            if (first == "while" && t.getOrNull(1)?.text in setOf("True", "1") && !blockHas(i) { it.firstText in setOf("break", "return") || it.tokens.any { tk -> tk.text in setOf("exit", "quit") } || it.tokens.any { tk -> tk.text == "raise" } }) {
                add(Severity.WARNING, l.startLine, "infinite-loop", null, "Бесконечный цикл", "while True без break/return внутри.",
                    "Такой цикл никогда не завершится, программа превысит лимит времени.", "Добавьте условие выхода с break.")
            }
            loopStack.size
        }
    }

    private fun insideLambda(t: List<PyToken>, colon: PyToken): Boolean {
        val idx = t.indexOf(colon)
        val lam = t.subList(0, idx).indexOfLast { it.text == "lambda" && it.depth == colon.depth }
        if (lam < 0) return false
        return t.subList(lam, idx).count { it.text == ":" && it.depth == colon.depth } == 0
    }

    /** Whether any line inside the block opened by header line [i] satisfies [pred]. */
    fun blockHas(i: Int, pred: (LogicalLine) -> Boolean): Boolean {
        for (j in i + 1 until L.size) {
            if (i !in ctx.parents[j]) break
            if (pred(L[j])) return true
        }
        return false
    }

    private fun preview(l: LogicalLine): String = l.tokens.joinToString(" ") { it.text }.take(40)

    private fun names() {
        if (ctx.starImport) return
        val reported = HashSet<String>()
        val candidates = (ctx.defined.keys + ctx.builtins + Ctx.KEYWORDS).toList()
        for ((name, uses) in ctx.used) {
            if (name in ctx.defined || name in ctx.builtins || name in Ctx.KEYWORDS || name in Ctx.SOFT_KEYWORDS) continue
            if (name.startsWith("__")) continue
            val line = uses.first()
            val lower = name.lowercase()
            val suggestion = when {
                lower in setOf("true", "false", "none", "null", "nil") -> when (lower) { "true" -> "True"; "false" -> "False"; else -> "None" }
                else -> candidates.filter { it != name && kotlin.math.abs(it.length - name.length) <= 2 }
                    .map { it to Fuzzy.distance(it.lowercase(), lower, 2) }
                    .filter { it.second <= (if (name.length <= 4) 1 else 2) }
                    .minByOrNull { it.second }?.first
            }
            if (reported.add(name)) {
                val title = if (suggestion != null) "Неизвестное имя «$name» — возможно, «$suggestion»" else "Неизвестное имя «$name»"
                add(Severity.ERROR, line, "undefined-name", "NameError: name '$name' is not defined", title,
                    "Переменная или функция «$name» используется, но нигде не создана (нет присваивания, def или import).",
                    "Python ищет имя в локальной, глобальной и встроенной областях видимости. Опечатка, неверный регистр или отсутствие присваивания приводят к NameError.",
                    suggestion?.let { "Замените «$name» на «$it»." } ?: "Создайте переменную до использования или исправьте опечатку.")
            }
        }
        // Use before assignment at module level.
        for ((li, l) in L.withIndex()) {
            if (ctx.blockDepth[li] != 0 || l.firstText in setOf("def", "class", "import", "from")) continue
            for (tok in l.tokens) {
                if (tok.type != PyTok.NAME) continue
                val def = ctx.defined[tok.text] ?: continue
                if (tok.text in ctx.builtins) continue
                val defLines = ctx.definedLines[tok.text].orEmpty()
                if (defLines.all { it > l.startLine } && ctx.functions.none { it == tok.text }) {
                    if (reported.add("before:" + tok.text)) {
                        add(Severity.ERROR, l.startLine, "use-before-def", "NameError: name '${tok.text}' is not defined",
                            "«${tok.text}» используется раньше, чем создаётся", "Переменная получает значение только в строке $def.",
                            "Python выполняет программу сверху вниз: к моменту строки ${l.startLine} переменной ещё нет.",
                            "Перенесите присваивание выше.")
                    }
                }
            }
        }
    }

    private fun types() {
        val arith = setOf("-", "/", "//", "%", "**", "<", ">", "<=", ">=")
        for ((li, l) in L.withIndex()) {
            val t = l.tokens
            for ((k, tok) in t.withIndex()) {
                if (tok.type != PyTok.NAME) continue
                val kind = ctx.varKind[tok.text]
                val prev = t.getOrNull(k - 1)
                val next = t.getOrNull(k + 1)
                val next2 = t.getOrNull(k + 2)
                // input() string used as a number
                if (tok.text in ctx.inputVars && (ctx.inputVars[tok.text] ?: 0) < l.startLine) {
                    val numericOp = (next != null && next.text in arith + "+" && next2?.type == PyTok.NUMBER) ||
                        (prev != null && prev.text in arith + "+" && t.getOrNull(k - 2)?.type == PyTok.NUMBER) ||
                        (prev?.text == "(" && t.getOrNull(k - 2)?.text == "range") ||
                        (next?.text in setOf("+=", "-=") && next2?.type == PyTok.NUMBER)
                    if (numericOp) {
                        add(Severity.ERROR, tok.line, "input-not-converted", "TypeError",
                            "Строка из input() используется как число",
                            "Переменная «${tok.text}» получена из input() и является строкой (str), а используется в арифметике или сравнении с числом.",
                            "input() всегда возвращает строку. «5» + 1 или range(\"5\") вызывают TypeError. Нужно преобразовать: int(input()).",
                            "Замените ${tok.text} = input() на ${tok.text} = int(input()).")
                    }
                }
                if (kind == "int" || kind == "float") {
                    if (prev?.text == "(" && t.getOrNull(k - 2)?.text == "len" && next?.text == ")") {
                        add(Severity.ERROR, tok.line, "len-of-int", "TypeError: object of type '${kind}' has no len()",
                            "len() от числа", "«${tok.text}» — число, а len() считает длину последовательностей.",
                            "У чисел нет длины. Количество цифр — len(str(n)).", "Используйте len(str(${tok.text})).")
                    }
                    if (next?.text == "[" && tok.depth == next.depth && prev?.text != "def") {
                        add(Severity.ERROR, tok.line, "subscript-int", "TypeError: '$kind' object is not subscriptable",
                            "Индексация числа", "«${tok.text}» — число, к нему нельзя применить [].",
                            "Чтобы взять цифру числа, переведите его в строку: str(n)[i], или используйте n % 10.", "Используйте str(${tok.text})[...].")
                    }
                    if (prev?.text == "+" && t.getOrNull(k - 2)?.type == PyTok.STRING || next?.text == "+" && next2?.type == PyTok.STRING) {
                        add(Severity.ERROR, tok.line, "str-plus-int", "TypeError: can only concatenate str (not \"$kind\") to str",
                            "Сложение строки и числа", "Строка складывается с числом «${tok.text}».",
                            "Python не преобразует типы автоматически. Используйте str(${tok.text}), f-строку f\"…{${tok.text}}\" или print(\"…\", ${tok.text}).",
                            "Замените ${tok.text} на str(${tok.text}).")
                    }
                    if (prev?.text == "in" && t.getOrNull(k - 3)?.text == "for" && next?.text == ":") {
                        add(Severity.ERROR, tok.line, "iterate-int", "TypeError: '$kind' object is not iterable",
                            "Цикл по числу", "for … in ${tok.text}: — «${tok.text}» число, а не последовательность.",
                            "Перебрать числа от 0 до n−1: for i in range(${tok.text}); перебрать цифры: for ch in str(${tok.text}).",
                            "Используйте range(${tok.text}).")
                    }
                }
                if (kind == "none" && next?.text == "." ) {
                    add(Severity.ERROR, tok.line, "none-attr", "AttributeError: 'NoneType' object has no attribute",
                        "Переменная равна None", "«${tok.text}» получила результат метода, который изменяет список на месте и возвращает None.",
                        "list.sort(), append(), reverse() ничего не возвращают. Пишите a.sort(), а не a = a.sort().", "Уберите присваивание.")
                }
            }
            // x = x.sort() and similar
            if (t.size >= 6 && t[0].type == PyTok.NAME && t[1].text == "=" && t[3].text == "." && t[4].text in Ctx.NONE_METHODS && t[5].text == "(") {
                add(Severity.ERROR, l.startLine, "assign-none", "Логическая ошибка (переменная станет None)",
                    "Присваивание результата ${t[4].text}()", "Метод ${t[4].text}() изменяет объект на месте и возвращает None.",
                    "После ${t[0].text} = ${t[2].text}.${t[4].text}(...) в ${t[0].text} окажется None. Для нового отсортированного списка есть sorted().",
                    "Замените на ${t[2].text}.${t[4].text}(...) без присваивания.")
            }
            // int(input().split())
            val text = t.joinToString("") { it.text }
            if (text.contains("int(input().split())")) {
                add(Severity.ERROR, l.startLine, "int-of-list", "TypeError: int() argument must be a string, a bytes-like object or a real number, not 'list'",
                    "int() от списка", "input().split() возвращает список строк, а int() принимает одно значение.",
                    "Для списка чисел: list(map(int, input().split())); для двух чисел: a, b = map(int, input().split()).",
                    "Используйте list(map(int, input().split())).")
            }
            // float index a[n / 2]
            for ((k, tok) in t.withIndex()) {
                if (tok.text == "[" && k > 0 && t[k - 1].type == PyTok.NAME) {
                    var j = k + 1
                    while (j < t.size && !(t[j].text == "]" && t[j].depth == tok.depth)) {
                        if (t[j].text == "/" && t[j].depth == tok.depth + 1) {
                            add(Severity.ERROR, t[j].line, "float-index", "TypeError: list indices must be integers or slices, not float",
                                "Дробный индекс", "Оператор / всегда даёт float, а индекс должен быть целым.",
                                "Для целочисленного деления используйте //.", "Замените «/» на «//» в индексе.")
                            break
                        }
                        j++
                    }
                }
            }
            // Division by literal zero
            for ((k, tok) in t.withIndex()) {
                if (tok.text in setOf("/", "//", "%") && t.getOrNull(k + 1)?.text == "0" && t.getOrNull(k + 2)?.text?.let { it !in setOf(".", "e") } != false) {
                    add(Severity.ERROR, tok.line, "div-zero", "ZeroDivisionError", "Деление на ноль", "Число делится на литерал 0.",
                        "Деление на ноль не определено.", "Проверьте делитель.")
                }
            }
            li.hashCode()
        }
    }

    private fun logic() {
        for ((i, l) in L.withIndex()) {
            val t = l.tokens
            for ((k, tok) in t.withIndex()) {
                // == None / != None
                if ((tok.text == "==" || tok.text == "!=") && t.getOrNull(k + 1)?.text == "None") {
                    add(Severity.STYLE, tok.line, "eq-none", null, "Сравнение с None через ${tok.text}",
                        "Для None рекомендуется проверка тождества.", "PEP 8: используйте «is None» / «is not None».",
                        "Замените «${tok.text} None» на «${if (tok.text == "==") "is" else "is not"} None».")
                }
                if (tok.text == "==" && t.getOrNull(k + 1)?.text in setOf("True", "False")) {
                    add(Severity.STYLE, tok.line, "eq-bool", null, "Сравнение с ${t[k + 1].text}", "Логическое значение сравнивается с ${t[k + 1].text}.",
                        "Вместо if x == True пишут if x:, вместо if x == False — if not x:.", "Упростите условие.")
                }
                // x is 5 / x is "a"
                if (tok.text == "is" && t.getOrNull(k + 1)?.let { it.type == PyTok.NUMBER || it.type == PyTok.STRING } == true) {
                    add(Severity.WARNING, tok.line, "is-literal", "SyntaxWarning: \"is\" with a literal", "is вместо ==",
                        "is проверяет, один ли это объект в памяти, а не равенство значений.", "Для сравнения значений используйте ==.", "Замените «is» на «==».")
                }
                // x == 1 or 2
                if (tok.text == "or" && t.getOrNull(k + 1)?.let { it.type == PyTok.NUMBER || it.type == PyTok.STRING } == true &&
                    t.getOrNull(k + 2)?.text.let { it == ":" || it == null || it == ")" || it == "or" } && t.subList(0, k).any { it.text == "==" }) {
                    add(Severity.WARNING, tok.line, "or-literal", null, "Условие всегда истинно",
                        "Запись «x == 1 or 2» означает «(x == 1) or 2», а 2 всегда истинно.",
                        "Каждое сравнение нужно писать полностью: x == 1 or x == 2, или короче: x in (1, 2).", "Используйте x in (…).")
                }
            }
            // Mutable default arguments
            if (l.firstText == "def") {
                for ((k, tok) in t.withIndex()) {
                    if (tok.text == "=" && t.getOrNull(k + 1)?.text in setOf("[", "{") ||
                        tok.text == "=" && t.getOrNull(k + 1)?.text in setOf("list", "dict", "set") && t.getOrNull(k + 2)?.text == "(") {
                        add(Severity.WARNING, tok.line, "mutable-default", null, "Изменяемое значение по умолчанию",
                            "Параметр функции по умолчанию — список/словарь/множество.",
                            "Значение по умолчанию создаётся один раз при объявлении функции и общее для всех вызовов — изменения «накапливаются».",
                            "Используйте None: def f(a=None): if a is None: a = [].")
                    }
                }
            }
            // Bare except
            if (l.firstText == "except" && t.getOrNull(1)?.text == ":") {
                add(Severity.STYLE, l.startLine, "bare-except", null, "except без типа исключения",
                    "Пустой except ловит все исключения, включая KeyboardInterrupt и SystemExit.",
                    "Это скрывает ошибки. Указывайте конкретный тип: except ValueError:.", "Укажите тип исключения.")
            }
            // Shadowing builtins
            if (t.size >= 2 && t[0].type == PyTok.NAME && t[1].text == "=" && t[0].text in SHADOWED) {
                add(Severity.WARNING, l.startLine, "shadow-builtin", null, "Переменная «${t[0].text}» скрывает встроенную функцию",
                    "Имя ${t[0].text} уже занято встроенной функцией Python.",
                    "После ${t[0].text} = … вызов ${t[0].text}(…) перестанет работать (TypeError: object is not callable).",
                    "Переименуйте переменную, например ${t[0].text}_value или total.")
            }
            // Recursion without base case
            if (l.firstText == "def") {
                val name = t.getOrNull(1)?.text ?: continue
                var selfCalls = 0
                var hasIf = false
                for (j in i + 1 until L.size) {
                    if (i !in ctx.parents[j]) break
                    val lt = L[j].tokens
                    if (L[j].firstText in setOf("if", "elif", "while", "for", "try")) hasIf = true
                    if (lt.any { it.text == "if" }) hasIf = true
                    selfCalls += lt.withIndex().count { (k, tk) -> tk.text == name && lt.getOrNull(k + 1)?.text == "(" && lt.getOrNull(k - 1)?.text != "def" }
                }
                if (selfCalls > 0 && !hasIf) {
                    add(Severity.ERROR, l.startLine, "no-base-case", "RecursionError: maximum recursion depth exceeded",
                        "Рекурсия без базового случая", "Функция $name вызывает саму себя, но в ней нет условия остановки.",
                        "Каждый рекурсивный вызов занимает место в стеке; без условия выхода стек переполняется (лимит ~1000 вызовов).",
                        "Добавьте if с возвратом результата для самого простого случая.")
                }
            }
            // f-string without f
            for (tok in t) {
                if (tok.type == PyTok.STRING && !tok.prefix.contains('f') && Regex("""\{[A-Za-z_][A-Za-z_0-9]*\}""").containsMatchIn(tok.text)) {
                    val names = Regex("""\{([A-Za-z_][A-Za-z_0-9]*)\}""").findAll(tok.text).map { it.groupValues[1] }.toList()
                    val usesFormat = t.any { it.text == "format" }
                    if (!usesFormat && names.any { it in ctx.defined }) {
                        add(Severity.WARNING, tok.line, "missing-f", null, "Похоже, забыта буква f у f-строки",
                            "Строка содержит {${names.first()}}, но не помечена префиксом f.",
                            "Без f фигурные скобки выводятся как есть, значение переменной не подставляется.", "Добавьте f перед кавычкой: f\"…\".")
                    }
                }
            }
            // input without call
            if (t.size == 3 && t[1].text == "=" && t[2].text == "input") {
                add(Severity.WARNING, l.startLine, "input-no-call", null, "input без скобок", "Переменной присвоена сама функция input, а не результат её вызова.",
                    "Чтобы прочитать строку, функцию нужно вызвать: input().", "Добавьте скобки: input().")
            }
            // range(len(a)) with a[i] only
            val text = t.joinToString(" ") { it.text }
            if (l.firstText == "for" && text.contains("in range ( len (")) {
                add(Severity.STYLE, l.startLine, "range-len", null, "range(len(...)) вместо enumerate",
                    "Цикл по индексам списка.", "Если нужны и индекс, и элемент — for i, x in enumerate(a); если только элемент — for x in a.",
                    "Рассмотрите enumerate().")
            }
            if (text.contains("in range ( len (") && text.contains("+ 1 )")) {
                add(Severity.WARNING, l.startLine, "range-len-plus", "IndexError: list index out of range", "Возможный выход за границы",
                    "range(len(a) + 1) даёт индекс len(a), которого нет в списке.", "Индексы списка длины n — от 0 до n − 1.", "Используйте range(len(a)).")
            }
            if (Regex("""(\w+) \[ len \( \1 \) \]""").containsMatchIn(text)) {
                add(Severity.ERROR, l.startLine, "index-len", "IndexError: list index out of range", "Индекс len(a)",
                    "Элемента с индексом len(a) не существует.", "Последний элемент — a[len(a) - 1] или просто a[-1].", "Используйте a[-1].")
            }
            if (l.firstText in setOf("if", "elif", "while") && Regex("""== \d+\.\d+|\d+\.\d+ ==""").containsMatchIn(text)) {
                add(Severity.WARNING, l.startLine, "float-eq", null, "Точное сравнение дробных чисел",
                    "Сравнение float через ==.", "0.1 + 0.2 == 0.3 даёт False из-за двоичного представления. Используйте math.isclose или сравнение с погрешностью.",
                    "Используйте math.isclose(a, b).")
            }
        }
    }

    private fun performance() {
        for ((i, l) in L.withIndex()) {
            val inLoop = ctx.enclosingLoops(i).isNotEmpty() || ctx.isLoopHeader(i)
            if (!inLoop) continue
            val t = l.tokens
            for ((k, tok) in t.withIndex()) {
                if (tok.text == "pop" && t.getOrNull(k - 1)?.text == "." && t.getOrNull(k + 1)?.text == "(" && t.getOrNull(k + 2)?.text == "0") {
                    add(Severity.PERFORMANCE, tok.line, "pop0", null, "list.pop(0) в цикле — O(n)",
                        "Удаление первого элемента сдвигает весь список.", "В цикле это даёт O(n²). collections.deque.popleft() работает за O(1).",
                        "Используйте deque.popleft().")
                }
                if (tok.text == "insert" && t.getOrNull(k - 1)?.text == "." && t.getOrNull(k + 2)?.text == "0") {
                    add(Severity.PERFORMANCE, tok.line, "insert0", null, "list.insert(0, x) в цикле — O(n)",
                        "Вставка в начало сдвигает весь список.", "Используйте deque.appendleft() или добавляйте в конец и разверните список в конце.",
                        "Используйте deque или append + reverse.")
                }
                if (tok.text == "in" && t.getOrNull(0)?.text != "for" && k + 1 < t.size && t[k + 1].type == PyTok.NAME &&
                    ctx.varKind[t[k + 1].text] == "list" && ctx.isLoopHeader(i).not()) {
                    add(Severity.PERFORMANCE, tok.line, "list-membership-in-loop", null, "Проверка «in список» внутри цикла",
                        "x in ${t[k + 1].text} просматривает весь список — O(n) на каждую проверку.",
                        "Если список большой, превратите его в множество один раз: s = set(${t[k + 1].text}); проверка x in s — O(1).",
                        "Используйте set.")
                }
                if ((tok.text == "count" || tok.text == "index") && t.getOrNull(k - 1)?.text == "." && t.getOrNull(k + 1)?.text == "(") {
                    add(Severity.PERFORMANCE, tok.line, "count-in-loop", null, ".${tok.text}() в цикле — O(n) на вызов",
                        "Метод ${tok.text} просматривает всю последовательность.", "В цикле это даёт O(n²). Подсчитайте частоты заранее словарём или Counter.",
                        "Используйте collections.Counter.")
                }
                if (tok.text == "+=" && k == 1 && ctx.varKind[t[0].text] == "str") {
                    add(Severity.PERFORMANCE, tok.line, "str-concat-loop", null, "Сложение строк в цикле",
                        "Строки неизменяемы: s += … каждый раз создаёт новую строку.", "Для большого количества частей собирайте список и в конце сделайте \"\".join(parts).",
                        "Используйте list + join.")
                }
            }
        }
    }

    private fun style() {
        for ((idx, raw) in ctx.lines.withIndex()) {
            if (raw.length > 99) add(Severity.STYLE, idx + 1, "long-line", null, "Слишком длинная строка",
                "Длина строки ${raw.length} символов.", "PEP 8 рекомендует не более 79 символов (до 99 для кода). Длинные строки трудно читать на маленьком экране.", "Разбейте строку.")
            if (raw.isNotEmpty() && (raw.endsWith(" ") || raw.endsWith("\t")) && raw.isNotBlank()) {
                add(Severity.STYLE, idx + 1, "trailing-space", null, "Пробелы в конце строки", "Строка оканчивается пробелами.", "PEP 8: лишние пробелы в конце строк не нужны.", "Удалите их.")
            }
        }
        for (l in L) {
            val t = l.tokens
            if (l.firstText == "def") {
                val name = t.getOrNull(1)?.text ?: continue
                if (name.any { it.isUpperCase() } && !name.startsWith("_")) {
                    add(Severity.STYLE, l.startLine, "func-name", null, "Имя функции не в snake_case", "Функция «$name» содержит заглавные буквы.",
                        "PEP 8: имена функций и переменных — строчными буквами с подчёркиваниями (my_function).", "Переименуйте функцию.")
                }
            }
            if (l.firstText == "class") {
                val name = t.getOrNull(1)?.text ?: continue
                if (name.first().isLowerCase()) {
                    add(Severity.STYLE, l.startLine, "class-name", null, "Имя класса не в CapWords", "Класс «$name» начинается со строчной буквы.",
                        "PEP 8: имена классов пишутся с заглавной буквы (MyClass).", "Переименуйте класс.")
                }
            }
            if (l.firstText == "from" && t.any { it.text == "*" }) {
                add(Severity.STYLE, l.startLine, "star-import", null, "import *", "Импорт всех имён модуля.",
                    "Непонятно, откуда берутся имена, возможны конфликты. Импортируйте нужные имена явно.", "Перечислите нужные имена.")
            }
            if (t.size >= 2 && t[0].type == PyTok.NAME && t[1].text == "=" && t[0].text in setOf("l", "O", "I")) {
                add(Severity.STYLE, l.startLine, "ambiguous-name", null, "Неоднозначное имя «${t[0].text}»", "Имена l, O, I легко спутать с 1 и 0.",
                    "PEP 8 не рекомендует такие имена.", "Выберите более понятное имя.")
            }
        }
        // Unused variables (assigned, never read), excluding "_" and loop variables used.
        for ((name, line) in ctx.defined) {
            if (name == "_" || name.startsWith("_") || name in ctx.functions) continue
            val uses = ctx.used[name].orEmpty()
            val defs = ctx.definedLines[name].orEmpty()
            if (uses.size <= defs.size && uses.all { it in defs } && ctx.imports.none { it == name }) {
                val isImport = L.any { it.startLine == line && it.firstText in setOf("import", "from") }
                add(Severity.STYLE, line, if (isImport) "unused-import" else "unused-var", null,
                    if (isImport) "Неиспользуемый импорт «$name»" else "Переменная «$name» не используется",
                    if (isImport) "Модуль/имя импортировано, но не используется." else "Значение присваивается, но нигде не читается.",
                    "Лишний код усложняет чтение и может указывать на ошибку (например, опечатку в имени).",
                    if (isImport) "Удалите импорт." else "Удалите переменную или используйте её.")
            }
        }
    }

    companion object {
        val SHADOWED = setOf("list", "dict", "str", "int", "sum", "max", "min", "input", "print", "len", "id", "type", "range", "set", "map", "filter", "sorted", "float", "tuple", "all", "any", "abs", "pow", "round", "zip", "next", "iter", "open", "format", "bool", "object", "vars", "dir", "hash")
    }
}

// ============================================================================ complexity

private class ComplexityEstimator(val ctx: Ctx) {

    private data class F(val n: Int = 0, val log: Int = 0, val sqrt: Int = 0) {
        operator fun times(o: F) = F(n + o.n, log + o.log, sqrt + o.sqrt)
        fun weight() = n * 100 + sqrt * 50 + log * 10
        override fun toString(): String {
            val parts = ArrayList<String>()
            if (n > 0) parts += if (n == 1) "n" else "n${sup(n)}"
            if (sqrt > 0) parts += if (sqrt == 1) "√n" else "n${sup(sqrt)}ᐟ²"
            if (log > 0) parts += if (log == 1) "log n" else "log${sup(log)} n"
            return "O(" + (if (parts.isEmpty()) "1" else parts.joinToString(" · ")) + ")"
        }

        private fun sup(k: Int) = k.toString().map { "⁰¹²³⁴⁵⁶⁷⁸⁹"[it - '0'] }.joinToString("")
    }

    private fun loopFactor(i: Int): Pair<F, String> {
        val l = ctx.logical[i]
        val t = l.tokens
        val text = t.joinToString(" ") { it.text }
        if (l.firstText == "for" || (l.firstText == "async" && t.getOrNull(1)?.text == "for")) {
            val inIdx = t.indexOfFirst { it.text == "in" }
            val iter = t.drop(inIdx + 1).joinToString(" ") { it.text }
            if (iter.startsWith("range (")) {
                val args = t.drop(inIdx + 3).dropLast(2)
                if (args.all { it.type == PyTok.NUMBER || it.text == "," || it.text == "-" }) return F() to "цикл по константному диапазону"
            }
            return F(n = 1) to "цикл for: ${iter.take(30)}"
        }
        // while: look at how the loop variable changes inside the block.
        val condNames = t.filter { it.type == PyTok.NAME && it.text !in Ctx.KEYWORDS }.map { it.text }.toSet()
        if (text.contains(" * ") && Regex("""(\w+) \* \1 <=?""").containsMatchIn(text) || text.contains("** 2 <=")) return F(sqrt = 1) to "while до √n"
        var halving = false
        for (j in i + 1 until ctx.logical.size) {
            if (i !in ctx.parents[j]) break
            val lt = ctx.logical[j].tokens
            if (lt.size >= 3 && lt[0].text in condNames && lt[1].text in setOf("//=", "/=", ">>=", "*=") ) halving = true
            if (lt.size >= 5 && lt[0].text in condNames && lt[1].text == "=" && lt.any { it.text in setOf("//", ">>") }) halving = true
        }
        return if (halving) F(log = 1) to "while с делением переменной (n //= k)" else F(n = 1) to "цикл while"
    }

    fun estimate(): Complexity {
        val reasons = ArrayList<String>()
        var best = F()
        var memory = "O(1)"
        for ((i, l) in ctx.logical.withIndex()) {
            var f = F()
            for (p in ctx.enclosingLoops(i)) f *= loopFactor(p).first
            if (ctx.isLoopHeader(i)) f *= loopFactor(i).first
            val text = l.tokens.joinToString(" ") { it.text }
            if (text.contains("sorted (") || text.contains(". sort (")) f *= F(n = 1, log = 1)
            else if (ctx.enclosingLoops(i).isNotEmpty() && (text.contains(". pop ( 0 )") || text.contains(". insert ( 0") || text.contains(". count (") || text.contains(". index ("))) f *= F(n = 1)
            if (f.weight() > best.weight()) {
                best = f
                reasons.clear()
                val loops = ctx.enclosingLoops(i) + if (ctx.isLoopHeader(i)) listOf(i) else emptyList()
                loops.forEach { reasons += "строка ${ctx.logical[it].startLine}: ${loopFactor(it).second}" }
                if (text.contains("sorted (") || text.contains(". sort (")) reasons += "строка ${l.startLine}: сортировка O(n log n)"
            }
            if (text.contains("append (") || text.contains("[ ") && text.contains(" for ") || text.contains("list (") || text.contains(". split (")) memory = "O(n)"
        }
        // Recursion
        for ((i, l) in ctx.logical.withIndex()) {
            if (l.firstText != "def") continue
            val name = l.tokens.getOrNull(1)?.text ?: continue
            var calls = 0
            var halves = false
            for (j in i + 1 until ctx.logical.size) {
                if (i !in ctx.parents[j]) break
                val lt = ctx.logical[j].tokens
                for ((k, tk) in lt.withIndex()) {
                    if (tk.text == name && lt.getOrNull(k + 1)?.text == "(") {
                        calls++
                        val arg = lt.drop(k + 2).takeWhile { it.text != ")" }.joinToString(" ") { it.text }
                        if (arg.contains("//") || arg.contains(">>")) halves = true
                    }
                }
            }
            val memo = i > 0 && ctx.logical.subList(maxOf(0, i - 2), i).any { prev -> prev.tokens.any { it.text in setOf("lru_cache", "cache") } }
            if (calls >= 2 && !memo && !halves) {
                reasons += "функция $name вызывает себя $calls раза — до O(2ⁿ) без мемоизации"
                return Complexity("O(2ⁿ)", "O(n) — глубина рекурсии", reasons)
            }
            if (calls >= 1) {
                memory = if (halves) "O(log n) — стек рекурсии" else "O(n) — стек рекурсии"
                val f = if (halves) F(log = 1) else F(n = 1)
                if (f.weight() > best.weight()) { best = f; reasons += "рекурсия $name: глубина ${if (halves) "log n" else "n"}" }
            }
        }
        if (reasons.isEmpty()) reasons += if (ctx.loops == 0) "нет циклов и рекурсии — константное число операций" else "циклы с константным числом итераций"
        return Complexity(best.toString(), memory, reasons)
    }
}

// ============================================================================ fixer

/** Applies safe, local automatic fixes. */
private class Fixer(val code: String, val ctx: Ctx) {

    fun apply(): Pair<String, List<String>> {
        val lines = code.replace("\r\n", "\n").split('\n').toMutableList()
        val applied = LinkedHashSet<String>()
        val fixedLines = HashSet<Int>()

        fun replaceLine(idx: Int, new: String, note: String) {
            if (idx !in lines.indices || lines[idx] == new) return
            lines[idx] = new
            applied += note
            fixedLines += idx
        }

        // Tabs in indentation -> 4 spaces.
        for (i in lines.indices) {
            val m = Regex("^[ \\t]+").find(lines[i]) ?: continue
            if ('\t' in m.value) replaceLine(i, m.value.replace("\t", "    ") + lines[i].substring(m.value.length), "табы в отступах заменены на 4 пробела")
        }
        for ((li, l) in ctx.logical.withIndex()) {
            val idx = l.startLine - 1
            var s = lines.getOrNull(idx) ?: continue
            val indent = s.takeWhile { it == ' ' || it == '\t' }
            var body = s.substring(indent.length)
            val first = l.firstText
            // Wrong-case keyword at line start.
            if (first.isNotEmpty() && first[0].isUpperCase() && first.lowercase() in setOf("if", "elif", "else", "for", "while", "def", "class", "return", "import", "from", "try", "except", "print", "input", "break", "continue", "pass")) {
                body = first.lowercase() + body.substring(first.length); applied += "ключевые слова переведены в нижний регистр"
            }
            // Misspelled keyword at line start.
            val kwFix = mapOf("retrun" to "return", "reutrn" to "return", "retun" to "return", "esle" to "else", "els" to "else",
                "whlie" to "while", "wihle" to "while", "improt" to "import", "imoprt" to "import", "fro" to "for", "fi" to "if",
                "elseif" to "elif", "elsif" to "elif", "deff" to "def", "dfe" to "def", "pirnt" to "print", "prnt" to "print", "prit" to "print", "pritn" to "print")
            val firstWord = body.takeWhile { it.isLetter() }
            if (firstWord in kwFix && firstWord !in ctx.defined) {
                body = kwFix.getValue(firstWord) + body.substring(firstWord.length); applied += "исправлены опечатки в ключевых словах"
            }
            // else if -> elif
            if (body.startsWith("else if ")) { body = "elif " + body.removePrefix("else if "); applied += "else if → elif" }
            // Python 2 print
            val p2 = Regex("^print\\s+([^=(].*)$").find(body)
            if (p2 != null && !body.startsWith("print(")) {
                val (content, comment) = splitComment(p2.groupValues[1])
                body = "print(${content.trimEnd()})" + comment; applied += "print … → print(…)"
            }
            // C-style operators
            if (body.contains("&&") || body.contains("||")) { body = body.replace("&&", "and").replace("||", "or"); applied += "&& / || → and / or" }
            if (Regex("""(?<![=!<>])!(?!=)\s*(?=[A-Za-z_(])""").containsMatchIn(body)) {
                body = body.replace(Regex("""(?<![=!<>])!(?!=)\s*(?=[A-Za-z_(])"""), "not "); applied += "! → not"
            }
            val incr = Regex("""^([A-Za-z_][A-Za-z_0-9]*)\s*(\+\+|--)\s*;?\s*$""").find(body)
            if (incr != null) { body = "${incr.groupValues[1]} ${incr.groupValues[2][0]}= 1"; applied += "x++ → x += 1" }
            if (body.startsWith("//")) { body = "#" + body.removePrefix("//"); applied += "// комментарий → #" }
            body = body.replace("===", "==").replace("!==", "!=").replace("<>", "!=")
            // true/false/null when undefined
            for ((bad, good) in listOf("true" to "True", "false" to "False", "null" to "None", "none" to "None", "nil" to "None")) {
                if (bad !in ctx.defined && Regex("""\b$bad\b""").containsMatchIn(codePart(body))) {
                    body = replaceCode(body, Regex("""\b$bad\b"""), good); applied += "true/false/null → True/False/None"
                }
            }
            // = in condition
            val headerKw = first
            if (headerKw in setOf("if", "elif", "while") && Regex("""(?<![=!<>:+\-*/%&|^])=(?!=)""").containsMatchIn(codePart(body).substringBeforeLast(':'))) {
                val (c, comment) = splitComment(body)
                val cond = c.substringBeforeLast(':')
                val rest = if (c.contains(':')) c.substring(c.lastIndexOf(':')) else ""
                body = cond.replace(Regex("""(?<![=!<>:+\-*/%&|^])=(?!=)"""), "==") + rest + comment
                applied += "= → == в условии"
            }
            // Missing colon
            val compound = setOf("if", "elif", "else", "for", "while", "def", "class", "try", "except", "finally", "with")
            val kw = body.takeWhile { it.isLetter() }
            if (kw in compound && l.startLine == l.endLine) {
                val (c, comment) = splitComment(body)
                if (!c.trimEnd().endsWith(":") && !hasTopLevelColon(c)) {
                    body = c.trimEnd() + ":" + (if (comment.isNotEmpty()) "  " + comment.trimStart() else ""); applied += "добавлены пропущенные двоеточия"
                }
            }
            // == None -> is None
            if (Regex("""==\s*None\b""").containsMatchIn(body) || Regex("""!=\s*None\b""").containsMatchIn(body)) {
                body = body.replace(Regex("""!=\s*None\b"""), "is not None").replace(Regex("""==\s*None\b"""), "is None"); applied += "== None → is None"
            }
            // x = x.sort()
            val noneAssign = Regex("""^([A-Za-z_]\w*)\s*=\s*([A-Za-z_]\w*)\.(sort|append|reverse|extend|insert|clear)\((.*)\)\s*$""").find(body)
            if (noneAssign != null) {
                body = "${noneAssign.groupValues[2]}.${noneAssign.groupValues[3]}(${noneAssign.groupValues[4]})"; applied += "убрано присваивание результата метода, возвращающего None"
            }
            // int(input().split())
            if (body.contains("int(input().split())")) { body = body.replace("int(input().split())", "list(map(int, input().split()))"); applied += "int(input().split()) → list(map(int, input().split()))" }
            // x = input() used as number
            val inMatch = Regex("""^([A-Za-z_]\w*)\s*=\s*input\(([^()]*)\)\s*$""").find(body)
            if (inMatch != null && inputUsedAsNumber(inMatch.groupValues[1])) {
                body = "${inMatch.groupValues[1]} = int(input(${inMatch.groupValues[2]}))"; applied += "input() → int(input()) для числовых данных"
            }
            // len(intVar) -> len(str(intVar)); "str" + intVar
            for ((name, kind) in ctx.varKind) {
                if (kind != "int" && kind != "float") continue
                if (body.contains("len($name)")) { body = body.replace("len($name)", "len(str($name))"); applied += "len(число) → len(str(число))" }
                val concat = Regex("""(["'][^"']*["'])\s*\+\s*\b$name\b(?!\s*\()""")
                if (concat.containsMatchIn(body)) { body = body.replace(concat) { "${it.groupValues[1]} + str($name)" }; applied += "\"текст\" + число → \"текст\" + str(число)" }
            }
            // float index a[x / 2]
            val fl = Regex("""\[([^\[\]]*?)(?<!/)/(?!/)([^\[\]]*?)]""")
            if (fl.containsMatchIn(codePart(body))) { body = body.replace(fl) { "[${it.groupValues[1]}//${it.groupValues[2]}]" }; applied += "/ → // в индексах" }
            // Statement-ending semicolon
            if (body.trimEnd().endsWith(";") && !body.trimStart().startsWith("#")) { body = body.trimEnd().removeSuffix(";"); applied += "убраны ; в конце строк" }
            // Single-line unclosed bracket
            val opens = ctx.lex.errors.filter { it.message.endsWith("was never closed") && it.line == l.startLine }
            if (opens.size == 1 && l.tokens.last().line == l.startLine) {
                val (c, comment) = splitComment(body)
                val ch = opens[0].message.substringAfter("'").first()
                val close = ")]}"["([{".indexOf(ch)]
                if (c.trimEnd().endsWith(":")) body = c.trimEnd().dropLast(1) + close + ":" + comment else body = c.trimEnd() + close + comment
                applied += "добавлена закрывающая скобка"
            }
            s = indent + body
            replaceLine(idx, s, applied.lastOrNull() ?: "исправление")
            li.hashCode()
        }
        // Expected indent / unexpected indent.
        var prevColon = false
        var prevIndent = 0
        val stack = ArrayList<Int>().apply { add(0) }
        for (l in ctx.logical) {
            val idx = l.startLine - 1
            val line = lines[idx]
            val ind = line.takeWhile { it == ' ' }.length
            if (prevColon && ind <= stack.last()) {
                val target = stack.last() + 4
                lines[idx] = " ".repeat(target) + line.trimStart()
                applied += "добавлен отступ в тело блока"
                stack += target
            } else if (!prevColon && ind > stack.last()) {
                lines[idx] = " ".repeat(stack.last()) + line.trimStart()
                applied += "убран лишний отступ"
            } else if (prevColon) {
                stack += ind
            } else {
                while (stack.size > 1 && stack.last() > ind) stack.removeAt(stack.size - 1)
            }
            prevColon = lines[idx].let { splitComment(it).first.trimEnd().endsWith(":") }
            prevIndent = ind
        }
        prevIndent.hashCode()
        return lines.joinToString("\n") to applied.toList()
    }

    private fun inputUsedAsNumber(name: String): Boolean {
        val pattern = Regex("""\b$name\b\s*([-+*/%<>]|//|\*\*|<=|>=|\+=|-=)\s*\d|\d\s*([-+*/%<>]|//|<=|>=)\s*\b$name\b|range\(\s*$name\b""")
        return pattern.containsMatchIn(code)
    }

    private fun hasTopLevelColon(s: String): Boolean {
        var depth = 0
        var inStr: Char? = null
        for (c in s) {
            if (inStr != null) { if (c == inStr) inStr = null; continue }
            when (c) {
                '"', '\'' -> inStr = c
                '(', '[', '{' -> depth++
                ')', ']', '}' -> depth--
                ':' -> if (depth == 0) return true
            }
        }
        return false
    }

    /** Splits "code  # comment" (ignoring # inside strings). */
    private fun splitComment(s: String): Pair<String, String> {
        var inStr: Char? = null
        for ((i, c) in s.withIndex()) {
            if (inStr != null) { if (c == inStr) inStr = null; continue }
            if (c == '"' || c == '\'') inStr = c
            if (c == '#') return s.substring(0, i) to s.substring(i)
        }
        return s to ""
    }

    /** The code part with string literals blanked out, for pattern checks. */
    private fun codePart(s: String): String {
        val sb = StringBuilder()
        var inStr: Char? = null
        for (c in splitComment(s).first) {
            if (inStr != null) { sb.append(' '); if (c == inStr) inStr = null; continue }
            if (c == '"' || c == '\'') { inStr = c; sb.append(' '); continue }
            sb.append(c)
        }
        return sb.toString()
    }

    /** Applies [re] only outside string literals and comments. */
    private fun replaceCode(s: String, re: Regex, replacement: String): String {
        val (code, comment) = splitComment(s)
        val out = StringBuilder()
        var i = 0
        var inStr: Char? = null
        val segment = StringBuilder()
        fun flushSeg() { out.append(re.replace(segment.toString(), replacement)); segment.clear() }
        while (i < code.length) {
            val c = code[i]
            if (inStr != null) { out.append(c); if (c == inStr) inStr = null; i++; continue }
            if (c == '"' || c == '\'') { flushSeg(); inStr = c; out.append(c); i++; continue }
            segment.append(c); i++
        }
        flushSeg()
        return out.toString() + comment
    }
}
