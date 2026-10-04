package com.pyolympiad.watch.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.SolidColor
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavHostController
import androidx.wear.compose.material3.lazy.transformedHeight
import com.pyolympiad.engine.analyzer.Severity
import com.pyolympiad.watch.AppViewModel
import com.pyolympiad.watch.ui.kit.LoadingScreen
import com.pyolympiad.watch.ui.kit.ScreenList
import com.pyolympiad.watch.ui.kit.Tone
import com.pyolympiad.watch.ui.kit.codeItem
import com.pyolympiad.watch.ui.kit.header
import com.pyolympiad.watch.ui.kit.infoCard
import com.pyolympiad.watch.ui.kit.navButton
import com.pyolympiad.watch.ui.kit.rememberTextInput
import com.pyolympiad.watch.ui.kit.textItem
import com.pyolympiad.watch.ui.nav.R
import com.pyolympiad.watch.ui.theme.PyPalette

private val CAPITALIZED = setOf(
    "If", "Elif", "Else", "For", "While", "Def", "Class", "Return", "Import", "From", "Try", "Except", "Finally",
    "With", "Print", "Input", "Int", "Str", "Len", "Range", "Break", "Continue", "Pass", "Lambda", "And", "Or", "Not",
    "In", "Is", "Global", "Del", "Assert", "Yield", "Raise", "List", "Map", "Sum", "Max", "Min", "Sorted", "Abs",
)

/** Undo what watch keyboards do to code: smart quotes, auto-capitalised first word, odd spaces. */
fun sanitizeCodeLine(raw: String): String {
    var s = raw.replace('“', '"').replace('”', '"').replace('„', '"').replace('«', '"').replace('»', '"')
        .replace('‘', '\'').replace('’', '\'').replace('`', '\'')
        .replace('—', '-').replace('–', '-').replace('×', '*').replace('÷', '/')
        .replace(' ', ' ').replace("…", "...")
    val indent = s.takeWhile { it == ' ' }
    val body = s.substring(indent.length)
    val first = body.takeWhile { it.isLetter() }
    if (first in CAPITALIZED) s = indent + first.lowercase() + body.substring(first.length)
    return s.trimEnd()
}

private fun indentOf(line: String) = line.takeWhile { it == ' ' }.length

private val TEMPLATES = listOf(
    "n = int(input())",
    "a, b = map(int, input().split())",
    "a = list(map(int, input().split()))",
    "s = input()",
    "for i in range(n):",
    "for x in a:",
    "while n > 0:",
    "if :",
    "elif :",
    "else:",
    "def solve():",
    "return ",
    "print()",
    "print(*a)",
    "ans = 0",
    "import math",
)

@Composable
fun CodeEditorScreen(vm: AppViewModel, nav: NavHostController) {
    val code by vm.code.collectAsState()
    var selected by remember { mutableStateOf<Int?>(null) }
    var pendingAction by remember { mutableStateOf<Pair<String, Int>?>(null) }
    var showTemplates by remember { mutableStateOf(false) }
    val input = rememberTextInput { text ->
        val (action, idx) = pendingAction ?: return@rememberTextInput
        val lines = text.replace("\r", "").split("\n").map { sanitizeCodeLine(it) }
        vm.editCode { l ->
            when (action) {
                "replace" -> {
                    val keep = " ".repeat(indentOf(l[idx]))
                    l[idx] = if (lines.first().startsWith(" ")) lines.first() else keep + lines.first()
                    lines.drop(1).forEachIndexed { k, line -> l.add(idx + 1 + k, keep + line) }
                }
                "below" -> {
                    val base = l.getOrNull(idx) ?: ""
                    val ind = indentOf(base) + if (base.trimEnd().endsWith(":")) 4 else 0
                    lines.forEachIndexed { k, line -> l.add(idx + 1 + k, if (line.startsWith(" ")) line else " ".repeat(ind) + line) }
                }
                "append" -> {
                    val last = l.lastOrNull { it.isNotBlank() } ?: ""
                    val ind = indentOf(last) + if (last.trimEnd().endsWith(":")) 4 else 0
                    if (l.size == 1 && l[0].isBlank()) l.clear()
                    lines.forEach { line -> l.add(if (line.startsWith(" ")) line else " ".repeat(ind) + line) }
                }
            }
        }
        pendingAction = null
    }
    val stdinInput = rememberTextInput { vm.setStdin(it.replace("\\n", "\n")) }

    ScreenList(edgeButton = { com.pyolympiad.watch.ui.kit.BottomAction("▶ Запуск") { nav.navigate(R.CODE_RUN) } }) { item ->
        header(item, code.title)
        if (code.taskId != null) textItem(item, "Привязан к задаче — можно проверить на тестах", PyPalette.muted, center = true, small = true)
        code.lines.forEachIndexed { i, line ->
            val isSel = selected == i
            navButton(item, "${i + 1}│" + showIndent(line), tone = if (isSel) Tone.PRIMARY else Tone.OUTLINED, key = "line$i$line") {
                selected = if (isSel) null else i
            }
            if (isSel) {
                navButton(item, "Изменить строку ${i + 1}", tone = Tone.SECONDARY, key = "e$i") { pendingAction = "replace" to i; input.open("Строка ${i + 1}") }
                navButton(item, "Вставить строку ниже", key = "b$i") { pendingAction = "below" to i; input.open("Новая строка") }
                navButton(item, "Отступ → (+4)", key = "r$i") { vm.editCode { l -> l[i] = "    " + l[i] } }
                navButton(item, "← Отступ (−4)", key = "l$i") { vm.editCode { l -> l[i] = l[i].removePrefix("    ").let { s -> if (s == l[i]) s.trimStart() else s } } }
                navButton(item, "Дублировать", key = "d$i") { vm.editCode { l -> l.add(i + 1, l[i]) } }
                navButton(item, "Удалить строку", tone = Tone.OUTLINED, key = "x$i") { vm.editCode { l -> l.removeAt(i) }; selected = null }
            }
        }
        navButton(item, "+ Добавить строку", tone = Tone.SECONDARY) { pendingAction = "append" to code.lines.size; input.open("Строка кода") }
        navButton(item, if (showTemplates) "Скрыть шаблоны" else "Шаблоны строк") { showTemplates = !showTemplates }
        if (showTemplates) for (t in TEMPLATES) navButton(item, t, tone = Tone.OUTLINED, key = "t$t") {
            vm.editCode { l ->
                val at = (selected ?: (l.size - 1)).coerceIn(0, l.size - 1)
                val base = l[at]
                val ind = indentOf(base) + if (base.trimEnd().endsWith(":")) 4 else 0
                if (l.size == 1 && l[0].isBlank()) l[0] = t else l.add(at + 1, " ".repeat(ind) + t)
            }
        }
        infoCard(item, "Ввод для программы (stdin)", code.stdin.ifEmpty { "(пусто)" }) { stdinInput.open("Ввод. Новая строка: \\n") }
        navButton(item, "▶ Запустить", tone = Tone.TERTIARY) { nav.navigate(R.CODE_RUN) }
        navButton(item, "Анализ кода", "ошибки, сложность, стиль") { nav.navigate(R.CODE_ANALYSIS) }
        code.taskId?.let { id -> navButton(item, "Проверить на тестах задачи", tone = Tone.SECONDARY) { nav.navigate(R.judge(id)) } }
        navButton(item, "Редактировать текстом", tone = Tone.OUTLINED) { nav.navigate(R.CODE_TEXT) }
        navButton(item, "Очистить", tone = Tone.OUTLINED) { vm.editCode { l -> l.clear() }; selected = null }
    }
}

@Composable
fun CodeTextScreen(vm: AppViewModel, nav: NavHostController) {
    val code by vm.code.collectAsState()
    var text by remember { mutableStateOf(code.text) }
    ScreenList(edgeButton = { com.pyolympiad.watch.ui.kit.BottomAction("Готово") {
        vm.editCode { l -> l.clear(); l.addAll(text.split("\n").map { sanitizeCodeLine(it) }) }
        nav.popBackStack()
    } }) { item ->
        header(item, "Код целиком")
        item {
            Box(
                Modifier.fillMaxWidth().transformedHeight(this, item.spec)
                    .background(PyPalette.codeBackground, RoundedCornerShape(12.dp)).padding(8.dp),
            ) {
                BasicTextField(
                    value = text,
                    onValueChange = { text = it },
                    textStyle = TextStyle(fontFamily = FontFamily.Monospace, fontSize = 12.sp, color = PyPalette.codeText),
                    cursorBrush = SolidColor(PyPalette.warning),
                    modifier = Modifier.fillMaxWidth().heightIn(min = 120.dp),
                )
            }
        }
        textItem(item, "Нажмите на поле, чтобы открыть клавиатуру. Отступ — 4 пробела.", PyPalette.muted, small = true)
    }
}

@Composable
fun RunResultScreen(vm: AppViewModel, nav: NavHostController) {
    val code by vm.code.collectAsState()
    LaunchedEffect(Unit) { vm.runCode() }
    val r = code.run
    if (code.running || r == null) return LoadingScreen("Выполняю на Python 3.11…")
    ScreenList { item ->
        header(item, r.statusRu)
        textItem(item, "${r.elapsedMs} мс", PyPalette.muted, center = true, small = true)
        if (code.stdin.isNotBlank()) codeItem(item, code.stdin, "Ввод:", PyPalette.muted)
        codeItem(item, r.stdout.ifEmpty { "(нет вывода)" }, "Вывод:", PyPalette.output)
        if (r.error != null) {
            infoCard(item, r.error + (r.line?.let { " — строка $it" } ?: ""), r.message ?: "", PyPalette.error)
            r.line?.let { ln -> code.lines.getOrNull(ln - 1)?.let { codeItem(item, it, "Строка $ln:", PyPalette.error) } }
            navButton(item, "Что значит ${r.error}?", tone = Tone.SECONDARY) { nav.navigate(R.entry("err:${r.error}")) }
            navButton(item, "Анализ кода", tone = Tone.SECONDARY) { nav.navigate(R.CODE_ANALYSIS) }
        }
        if (r.status == "TIMEOUT") infoCard(item, "Подсказка", "Проверьте условие выхода из цикла или уменьшите сложность алгоритма. Лимит меняется в Настройках.", PyPalette.warning)
        navButton(item, "Запустить снова", tone = Tone.TERTIARY) { vm.runCode() }
        navButton(item, "К коду", tone = Tone.OUTLINED) { nav.popBackStack() }
    }
}

@Composable
fun AnalysisScreen(vm: AppViewModel, nav: NavHostController) {
    val code by vm.code.collectAsState()
    LaunchedEffect(Unit) { vm.analyzeCode() }
    val r = code.analysis
    if (code.running || r == null) return LoadingScreen("Анализирую код…")
    ScreenList { item ->
        header(item, "Анализ кода")
        infoCard(item, null, r.summary, if (r.errors > 0) PyPalette.error else PyPalette.success)
        code.syntax?.let { s ->
            if (s.ok) textItem(item, "CPython 3.11: синтаксис корректен ✓", PyPalette.success, small = true)
            else infoCard(item, "CPython 3.11: ${s.error} в строке ${s.line ?: "?"}", (s.message ?: "") + (s.text?.let { "\n$it" } ?: ""), PyPalette.error)
        }
        for ((i, issue) in r.issues.withIndex()) {
            val color = when (issue.severity) {
                Severity.ERROR -> PyPalette.error
                Severity.WARNING -> PyPalette.warning
                Severity.PERFORMANCE -> PyPalette.info
                Severity.STYLE -> PyPalette.muted
            }
            infoCard(
                item, "${issue.severity.titleRu} · строка ${issue.line}: ${issue.title}",
                listOfNotNull(
                    issue.pythonError?.let { "Python: $it" },
                    "Причина: ${issue.cause}",
                    issue.explanation,
                    issue.fix?.let { "Исправление: $it" },
                ).joinToString("\n"),
                color,
            )
            if (issue.pythonError?.substringBefore(':')?.endsWith("Error") == true && i < 6) {
                val type = issue.pythonError!!.substringBefore(':').substringBefore(' ')
                navButton(item, "Подробнее о $type", tone = Tone.OUTLINED, key = "e$i") { nav.navigate(R.entry("err:$type")) }
            }
        }
        r.fixedCode?.let { fixed ->
            header(item, "Исправленный код")
            codeItem(item, fixed)
            textItem(item, r.appliedFixes.joinToString("\n") { "• $it" }, PyPalette.muted, small = true)
            navButton(item, "Применить исправления", tone = Tone.SECONDARY) {
                vm.editCode { l -> l.clear(); l.addAll(fixed.split("\n")) }
                nav.popBackStack()
            }
        }
        infoCard(item, "Сложность: ${r.complexity.time}", "Память: ${r.complexity.memory}\n" + r.complexity.reasons.joinToString("\n") { "• $it" })
        infoCard(item, "Рекомендации", r.recommendations.joinToString("\n") { "• $it" })
        infoCard(item, "Статистика", "Строк: ${r.stats.lines}, функций: ${r.stats.functions.size}, циклов: ${r.stats.loops}, вложенность: ${r.stats.maxLoopDepth}" +
            if (r.stats.imports.isNotEmpty()) "\nИмпорт: " + r.stats.imports.joinToString(", ") else "")
    }
}

/** Leading spaces are drawn as dots so the indentation is visible on the small screen. */
private fun showIndent(line: String): String {
    val n = line.takeWhile { it == ' ' }.length
    return ("·".repeat(n) + line.substring(n)).ifEmpty { "·" }
}
