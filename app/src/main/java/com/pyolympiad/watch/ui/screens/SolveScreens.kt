package com.pyolympiad.watch.ui.screens

import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.produceState
import androidx.navigation.NavHostController
import com.pyolympiad.data.EntrySummary
import com.pyolympiad.data.SearchHit
import com.pyolympiad.engine.solver.Method
import com.pyolympiad.watch.AppViewModel
import com.pyolympiad.watch.MethodCheck
import com.pyolympiad.watch.ui.kit.LoadingScreen
import com.pyolympiad.watch.ui.kit.ScreenList
import com.pyolympiad.watch.ui.kit.Tone
import com.pyolympiad.watch.ui.kit.codeItem
import com.pyolympiad.watch.ui.kit.header
import com.pyolympiad.watch.ui.kit.infoCard
import com.pyolympiad.watch.ui.kit.kindTitle
import com.pyolympiad.watch.ui.kit.navButton
import com.pyolympiad.watch.ui.kit.rememberTextInput
import com.pyolympiad.watch.ui.kit.textItem
import com.pyolympiad.watch.ui.nav.R
import com.pyolympiad.watch.ui.theme.PyPalette
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

/** Example statements (from the spec and typical school/olympiad tasks, in several languages). */
private val EXAMPLES = listOf(
    "n natural son berilgan uning raqamlari yigindisini toping",
    "Дано четырёхзначное число. Вывести его в обратном порядке",
    "Найдите НОД чисел 84 и 36",
    "naiti summu chetnyh cifr chisla 123456",
    "Сколько чисел от 1 до 1000 делятся на 7",
    "Check whether 97 is a prime number",
    "Проверьте, является ли строка \"А роза упала на лапу Азора\" палиндромом",
    "Найдите максимальную сумму подотрезка массива",
    "Найдите кратчайший путь в графе от вершины s до t",
    "Сколькими способами можно подняться по лестнице из 10 ступенек",
)

@Composable
fun SolveInputScreen(vm: AppViewModel, nav: NavHostController) {
    val input = rememberTextInput { text ->
        vm.solve(text)
        nav.navigate(R.SOLVE_RESULT)
    }
    val history by produceState(emptyList<String>()) { value = withContext(Dispatchers.IO) { vm.store.history("solve", 8) } }
    ScreenList(edgeButton = { com.pyolympiad.watch.ui.kit.BottomAction("Ввести") { input.open("Условие задачи") } }) { item ->
        header(item, "Решить задачу")
        textItem(item, "Напишите условие на русском, транслитом, английском или узбекском. Тему и алгоритм указывать не нужно.", PyPalette.muted, small = true)
        navButton(item, "Ввести условие", "клавиатура / рукописный ввод", Tone.SECONDARY) { input.open("Условие задачи") }
        if (history.isNotEmpty()) {
            header(item, "Недавние")
            for (h in history) navButton(item, h.take(80), tone = Tone.OUTLINED, key = "h$h") { vm.solve(h); nav.navigate(R.SOLVE_RESULT) }
        }
        header(item, "Примеры условий")
        for (ex in EXAMPLES) navButton(item, ex, key = ex) { vm.solve(ex); nav.navigate(R.SOLVE_RESULT) }
    }
}

private fun statusMark(c: MethodCheck?): String = when (c?.status) {
    MethodCheck.Status.OK -> " ✓"
    MethodCheck.Status.FAILED -> " ✗"
    MethodCheck.Status.PENDING -> " …"
    else -> ""
}

@Composable
fun SolveResultScreen(vm: AppViewModel, nav: NavHostController) {
    val state by vm.solve.collectAsState()
    val settings by vm.settings.collectAsState()
    if (state.working || (state.result == null && state.input.isNotEmpty())) return LoadingScreen("Анализирую условие…")
    val result = state.result ?: return LoadingScreen("Нет задачи")
    val sol = state.solution
    val input = rememberTextInput { text -> vm.solve(text) }
    val related by produceState<List<EntrySummary>>(emptyList(), sol?.skillId, sol?.knowledge) {
        value = withContext(Dispatchers.IO) { sol?.knowledge?.mapNotNull { runCatching { vm.repo.summary(it) }.getOrNull() } ?: emptyList() }
    }
    val similar by produceState<List<SearchHit>>(emptyList(), result.searchHint, sol == null) {
        value = if (sol == null && result.searchHint.isNotBlank()) withContext(Dispatchers.IO) {
            runCatching { vm.repo.search(result.searchHint, limit = 8) }.getOrDefault(emptyList())
        } else emptyList()
    }

    ScreenList { item ->
        if (sol == null) {
            header(item, "Нет надёжного решения")
            infoCard(item, null, result.failure ?: "Не удалось надёжно определить решение. Попробуйте переформулировать условие.", PyPalette.warning)
            textItem(item, "Язык: ${result.languageTitle}", PyPalette.muted, small = true)
            if (result.detectedConcepts.isNotEmpty()) textItem(item, "Понятия: " + result.detectedConcepts.joinToString(", "), PyPalette.muted, small = true)
            navButton(item, "Переформулировать", tone = Tone.SECONDARY) { input.open("Условие задачи") }
            if (result.alternatives.isNotEmpty()) {
                header(item, "Возможно, вы имели в виду")
                for (a in result.alternatives) navButton(item, a.title, key = a.skillId) { vm.solveWith(a.skillId) }
            }
            if (similar.isNotEmpty()) {
                header(item, "Похожее в базе знаний")
                for (h in similar) navButton(item, h.entry.title, kindTitle(h.entry.kind), Tone.OUTLINED, key = h.entry.id) { nav.navigate(R.entry(h.entry.id)) }
            }
            return@ScreenList
        }
        header(item, sol.title)
        infoCard(item, "Понял задачу так", sol.understood)
        val meta = buildList {
            add("Язык: ${result.languageTitle}")
            if (result.corrections.isNotEmpty()) add("Исправлено: " + result.corrections.joinToString(", "))
            add("Тема: " + sol.topics.joinToString(", "))
            sol.constraintNote?.let { add("Ограничения: $it") }
        }
        textItem(item, meta.joinToString("\n"), PyPalette.muted, small = true)
        infoCard(item, "Алгоритм: ${sol.algorithm}", sol.algorithmWhy)
        if (sol.dataStructures.isNotEmpty()) textItem(item, "Структуры данных: " + sol.dataStructures.joinToString(", "), PyPalette.muted, small = true)

        val main = sol.methods.first()
        header(item, "Решение: ${main.title}" + statusMark(state.checks.firstOrNull()))
        codeItem(item, main.code)
        textItem(item, "Время ${main.time} · Память ${main.memory}", PyPalette.muted, small = true)

        // Answer for the concrete data from the statement.
        val answer = state.pythonAnswer ?: sol.nativeAnswer
        sol.concreteInput?.let { data ->
            infoCard(item, "Ответ" + (if (data.isNotBlank()) " для данных: " + data.replace("\n", " / ") else ""),
                (answer ?: if (state.verifying) "вычисляю…" else "—") + (state.answerAgreement?.let { "\n$it" } ?: ""), PyPalette.success)
        }
        if (state.verifying) textItem(item, "Проверяю способы на тестах встроенным Python…", PyPalette.muted, small = true)
        else if (state.checks.any { it.status == MethodCheck.Status.OK }) {
            val ok = state.checks.count { it.status == MethodCheck.Status.OK }
            textItem(item, "Проверено Python 3.11 на часах: $ok из ${state.checks.size} способов прошли все ${state.checks.first().total} тестов ✓", PyPalette.success, small = true)
        } else if (state.checks.any { it.status == MethodCheck.Status.NO_RUNTIME }) {
            textItem(item, "Встроенный Python недоступен — код проверен на компьютере при сборке.", PyPalette.muted, small = true)
        }
        if (state.removedMethods.isNotEmpty()) textItem(item, "Удалены как неверные: " + state.removedMethods.joinToString(", "), PyPalette.warning, small = true)

        // Spec §42/§45: method buttons under the answer.
        header(item, "Способы решения")
        sol.methods.take(5).forEachIndexed { i, m ->
            navButton(item, "Способ ${i + 1}: ${m.title}" + statusMark(state.checks.getOrNull(i)), "${m.role.titleRu} · ${m.time}", if (i == 0) Tone.PRIMARY else Tone.TONAL, key = "m$i") {
                nav.navigate(R.method(i))
            }
        }
        if (sol.methods.size > 5) navButton(item, "Ещё способы (${sol.methods.size - 5})", tone = Tone.SECONDARY) { nav.navigate(R.MORE) }
        if (sol.methods.size > 1) navButton(item, "Сравнить способы", tone = Tone.SECONDARY) { nav.navigate(R.COMPARE) }

        header(item, "Объяснение")
        textItem(item, sol.explanation.mapIndexed { i, s -> "${i + 1}. $s" }.joinToString("\n"))
        if (sol.keyIdeas.isNotEmpty()) infoCard(item, "Ключевые идеи", sol.keyIdeas.joinToString("\n") { "• $it" })
        infoCard(item, "Формат ввода", sol.inputFormat)
        infoCard(item, "Формат вывода", sol.outputFormat)
        if (sol.edgeCases.isNotEmpty()) infoCard(item, "Крайние случаи", sol.edgeCases.joinToString("\n") { "• $it" }, PyPalette.warning)
        if (sol.samples.isNotEmpty()) {
            header(item, "Тесты")
            for ((k, s) in sol.samples.take(4).withIndex()) {
                codeItem(item, s.input.ifEmpty { "(пустой ввод)" }, "Ввод ${k + 1}:", PyPalette.muted)
                s.expected?.let { codeItem(item, it, "Ожидается:", PyPalette.output) }
            }
        }
        navButton(item, "Запустить код", "Python Run", Tone.TERTIARY) {
            vm.openCode(main.code, sol.title, stdin = sol.concreteInput ?: sol.samples.firstOrNull()?.input ?: "")
            nav.navigate(R.CODE)
        }
        if (related.isNotEmpty()) {
            header(item, "Связанные знания")
            for (r in related) navButton(item, r.title, kindTitle(r.kind), Tone.OUTLINED, key = "k" + r.id) { nav.navigate(R.entry(r.id)) }
        }
        if (result.alternatives.isNotEmpty()) {
            header(item, "Другие трактовки")
            for (a in result.alternatives) navButton(item, a.title, tone = Tone.OUTLINED, key = "alt" + a.skillId) { vm.solveWith(a.skillId) }
        }
        if (settings.showTrace) navButton(item, "Как я решал", "этапы анализа", Tone.OUTLINED) { nav.navigate(R.TRACE) }
        navButton(item, "Новая задача", tone = Tone.OUTLINED) { input.open("Условие задачи") }
    }
}

@Composable
fun MethodScreen(vm: AppViewModel, nav: NavHostController, index: Int) {
    val state by vm.solve.collectAsState()
    val sol = state.solution ?: return LoadingScreen()
    val m: Method = sol.methods.getOrNull(index) ?: return LoadingScreen()
    val check = state.checks.getOrNull(index)
    ScreenList { item ->
        header(item, "Способ ${index + 1}: ${m.title}")
        textItem(item, m.role.titleRu + (m.minPython?.let { " · Python $it+" } ?: ""), PyPalette.muted, center = true, small = true)
        codeItem(item, m.code)
        when (check?.status) {
            MethodCheck.Status.OK -> textItem(item, "✓ Проверен на ${check.total} тестах встроенным Python", PyPalette.success, small = true)
            MethodCheck.Status.FAILED -> textItem(item, "✗ Не прошёл проверку: ${check.note}", PyPalette.error, small = true)
            else -> {}
        }
        infoCard(item, "Идея", m.idea)
        if (m.principle != m.idea) infoCard(item, "Как работает", m.principle)
        infoCard(item, "Сложность", "Время: ${m.time}\nПамять: ${m.memory}")
        if (m.pros.isNotEmpty()) infoCard(item, "Преимущества", m.pros.joinToString("\n") { "+ $it" }, PyPalette.success)
        if (m.cons.isNotEmpty()) infoCard(item, "Недостатки", m.cons.joinToString("\n") { "− $it" }, PyPalette.warning)
        if (m.whenToUse.isNotBlank()) infoCard(item, "Когда использовать", m.whenToUse)
        navButton(item, "Запустить", "Python Run", Tone.TERTIARY) {
            vm.openCode(m.code, m.title, stdin = sol.concreteInput ?: sol.samples.firstOrNull()?.input ?: "")
            nav.navigate(R.CODE)
        }
        if (index + 1 < sol.methods.size) navButton(item, "Следующий способ") { nav.navigate(R.method(index + 1)) }
    }
}

@Composable
fun MoreMethodsScreen(vm: AppViewModel, nav: NavHostController) {
    val state by vm.solve.collectAsState()
    val sol = state.solution ?: return LoadingScreen()
    ScreenList { item ->
        header(item, "Ещё способы")
        sol.methods.drop(5).forEachIndexed { k, m ->
            val i = k + 5
            navButton(item, "Способ ${i + 1}: ${m.title}" + statusMark(state.checks.getOrNull(i)), "${m.role.titleRu} · ${m.time}", key = "mm$i") { nav.navigate(R.method(i)) }
        }
    }
}

@Composable
fun CompareScreen(vm: AppViewModel) {
    val state by vm.solve.collectAsState()
    val sol = state.solution ?: return LoadingScreen()
    ScreenList { item ->
        header(item, "Сравнение способов")
        textItem(item, "Способ | Идея | Время | Память | Сложность кода", PyPalette.muted, small = true, center = true)
        sol.methods.forEachIndexed { i, m ->
            infoCard(
                item, "${i + 1}. ${m.title}",
                listOf(
                    "Идея: ${m.idea}",
                    "Время: ${m.time}",
                    "Память: ${m.memory}",
                    "Сложность кода: ${m.codeComplexity} (${m.lineCount} стр.)",
                    "Читаемость: " + "★".repeat(m.readability) + "☆".repeat(5 - m.readability),
                    "Роль: ${m.role.titleRu}",
                ).joinToString("\n"),
            )
        }
        val shortest = sol.methods.minByOrNull { it.lineCount }
        val readable = sol.methods.maxByOrNull { it.readability }
        val efficient = sol.methods.firstOrNull { it.role == com.pyolympiad.engine.solver.MethodRole.EFFICIENT }
        infoCard(item, "Итог", listOfNotNull(
            readable?.let { "Понятнее всего: ${it.title}" },
            shortest?.let { "Короче всего: ${it.title} (${it.lineCount} стр.)" },
            efficient?.let { "Эффективнее всего: ${it.title} — ${it.time}" },
        ).joinToString("\n"), PyPalette.success)
    }
}

@Composable
fun TraceScreen(vm: AppViewModel) {
    val state by vm.solve.collectAsState()
    val r = state.result ?: return LoadingScreen()
    ScreenList { item ->
        header(item, "Как я решал")
        for (t in r.trace) infoCard(item, t.stage, t.result)
        if (state.checks.isNotEmpty()) infoCard(item, "CHECK (Python)", state.checks.mapIndexed { i, c -> "Способ ${i + 1}: ${c.status} ${c.passed}/${c.total} ${c.note}" }.joinToString("\n"))
        infoCard(item, "ANSWER", state.pythonAnswer ?: "ответ зависит от входных данных")
    }
}
