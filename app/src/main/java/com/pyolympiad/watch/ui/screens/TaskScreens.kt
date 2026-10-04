package com.pyolympiad.watch.ui.screens

import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.produceState
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.navigation.NavHostController
import com.pyolympiad.data.Category
import com.pyolympiad.data.Domain
import com.pyolympiad.data.Entry
import com.pyolympiad.data.TaskProgress
import com.pyolympiad.data.TaskStatus
import com.pyolympiad.watch.AppViewModel
import com.pyolympiad.watch.ui.kit.LoadingScreen
import com.pyolympiad.watch.ui.kit.ScreenList
import com.pyolympiad.watch.ui.kit.Tone
import com.pyolympiad.watch.ui.kit.codeItem
import com.pyolympiad.watch.ui.kit.header
import com.pyolympiad.watch.ui.kit.infoCard
import com.pyolympiad.watch.ui.kit.kindTitle
import com.pyolympiad.watch.ui.kit.levelTitle
import com.pyolympiad.watch.ui.kit.navButton
import com.pyolympiad.watch.ui.kit.textItem
import com.pyolympiad.watch.ui.nav.R
import com.pyolympiad.watch.ui.theme.PyPalette
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

@Composable
private fun rememberEntry(vm: AppViewModel, id: String): Entry? {
    val e by produceState<Entry?>(null, id) { value = withContext(Dispatchers.IO) { vm.repo.entry(id) } }
    return e
}

@Composable
fun TasksMenuScreen(vm: AppViewModel, nav: NavHostController) {
    val cats by produceState<List<Category>?>(null) { value = withContext(Dispatchers.IO) { vm.repo.categories(Domain.TASKS, "task") } }
    val total = cats?.sumOf { it.count } ?: 0
    ScreenList { item ->
        header(item, "Задачи")
        textItem(item, "$total задач с подсказками, решениями и тестами", PyPalette.muted, center = true, small = true)
        navButton(item, "Тренировка", "10 / 20 / 50 / 100 задач", Tone.SECONDARY) { nav.navigate(R.TRAINING_SETUP) }
        header(item, "По уровню")
        for (lv in 1..6) navButton(item, levelTitle(lv), key = "lv$lv") { nav.navigate(R.list("tasks", "task", null, lv)) }
        header(item, "По темам")
        for (c in cats ?: emptyList()) navButton(item, c.name, "${c.count}", key = c.name) { nav.navigate(R.list("tasks", "task", c.name)) }
    }
}

@Composable
fun TaskScreen(vm: AppViewModel, nav: NavHostController, id: String) {
    val e = rememberEntry(vm, id) ?: return LoadingScreen()
    val t = e.task ?: return EntryScreen(vm, nav, id)
    val settings by vm.settings.collectAsState()
    val scope = rememberCoroutineScope()
    var progress by remember { mutableStateOf<TaskProgress?>(null) }
    var favorite by remember { mutableStateOf(false) }
    LaunchedEffect(id) {
        vm.setCurrentTask(id)
        withContext(Dispatchers.IO) {
            vm.store.recordStudied(e.id, e.summary.kind, e.summary.category)
            progress = vm.store.taskProgress(id)
            favorite = vm.store.isFavorite(id)
        }
    }
    ScreenList { item ->
        header(item, e.title)
        textItem(item, "${levelTitle(e.summary.level)} · ${e.summary.category}" + (progress?.let { " · " + it.status.titleRu } ?: ""), PyPalette.muted, center = true, small = true)
        infoCard(item, "Условие", t.statement)
        if (t.input.isNotBlank()) infoCard(item, "Входные данные", t.input)
        if (t.output.isNotBlank()) infoCard(item, "Выходные данные", t.output)
        if (t.constraints.isNotBlank()) infoCard(item, "Ограничения", t.constraints)
        val examples = t.tests.filter { !it.hidden }
        examples.forEachIndexed { i, ex ->
            codeItem(item, ex.input.trimEnd(), "Пример ${i + 1} — ввод:", PyPalette.muted)
            codeItem(item, ex.output.trimEnd(), "Вывод:", PyPalette.output)
        }
        navButton(item, "Подсказки (${t.hints.size})", "${progress?.hintsUsed ?: 0} использовано", Tone.SECONDARY) { nav.navigate(R.taskHints(id)) }
        navButton(item, "Проверить моё решение", "тесты: ${t.tests.size}", Tone.TERTIARY) {
            vm.openCode("n = int(input())\n", e.title, taskId = id, stdin = examples.firstOrNull()?.input ?: "")
            nav.navigate(R.CODE)
        }
        val locked = settings.olympiadMode && (progress?.hintsUsed ?: 0) < t.hints.size && progress?.status != TaskStatus.SOLVED
        t.solutions.forEachIndexed { i, s ->
            navButton(item, (if (locked) "🔒 " else "") + "Решение ${i + 1}: ${s.title}", s.time.ifEmpty { null }, key = "s$i") { nav.navigate(R.taskSolution(id, i)) }
        }
        if (progress?.status != TaskStatus.SOLVED) {
            navButton(item, "Отметить: решил сам", tone = Tone.OUTLINED) {
                scope.launch { withContext(Dispatchers.IO) { vm.store.markSolved(id, e.summary.category, e.summary.level); progress = vm.store.taskProgress(id) } }
            }
        }
        if (e.related.isNotEmpty()) {
            header(item, "Теория к задаче")
            for (r in e.related) navButton(item, r.title, kindTitle(r.kind), Tone.OUTLINED, key = "r" + r.id) { nav.navigate(R.entry(r.id)) }
        }
        navButton(item, if (favorite) "★ В избранном" else "☆ В избранное", tone = Tone.OUTLINED) {
            scope.launch { favorite = withContext(Dispatchers.IO) { vm.store.toggleFavorite(id, "task", e.title) } }
        }
        navButton(item, "Решить решателем", "сравнить с автоматическим решением", Tone.OUTLINED) {
            vm.solve(t.statement)
            nav.navigate(R.SOLVE_RESULT)
        }
    }
}

/** Spec §23: hint 1 — light, hint 2 — more specific, hint 3 — almost the solution path. */
@Composable
fun TaskHintsScreen(vm: AppViewModel, id: String) {
    val e = rememberEntry(vm, id) ?: return LoadingScreen()
    val t = e.task ?: return LoadingScreen()
    var shown by remember { mutableIntStateOf(0) }
    LaunchedEffect(id) { shown = withContext(Dispatchers.IO) { vm.store.taskProgress(id)?.hintsUsed ?: 0 } }
    val scope = rememberCoroutineScope()
    ScreenList { item ->
        header(item, "Подсказки")
        textItem(item, e.title, PyPalette.muted, center = true, small = true)
        val names = listOf("Подсказка 1 — лёгкая", "Подсказка 2 — конкретнее", "Подсказка 3 — направление решения")
        for (i in 0 until shown.coerceAtMost(t.hints.size)) infoCard(item, names.getOrElse(i) { "Подсказка ${i + 1}" }, t.hints[i], PyPalette.warning)
        if (shown < t.hints.size) {
            navButton(item, "Открыть подсказку ${shown + 1}", tone = Tone.SECONDARY) {
                val next = shown + 1
                shown = next
                scope.launch(Dispatchers.IO) { vm.store.recordHint(id, e.summary.category, e.summary.level, next) }
            }
        } else textItem(item, "Все подсказки открыты. Теперь можно посмотреть решение.", PyPalette.muted, small = true, center = true)
    }
}

@Composable
fun TaskSolutionScreen(vm: AppViewModel, nav: NavHostController, id: String, index: Int) {
    val e = rememberEntry(vm, id) ?: return LoadingScreen()
    val t = e.task ?: return LoadingScreen()
    val settings by vm.settings.collectAsState()
    var progress by remember { mutableStateOf<TaskProgress?>(null) }
    var confirmed by remember { mutableStateOf(false) }
    LaunchedEffect(id) { progress = withContext(Dispatchers.IO) { vm.store.taskProgress(id) } }
    var saved by remember(id, index) { mutableStateOf(false) }
    val locked = settings.olympiadMode && !confirmed && (progress?.hintsUsed ?: 0) < t.hints.size && progress?.status != TaskStatus.SOLVED
    val s = t.solutions.getOrNull(index) ?: return LoadingScreen()
    ScreenList { item ->
        header(item, "Решение ${index + 1}: ${s.title}")
        if (locked) {
            infoCard(item, "Олимпиадный режим", "Сначала попробуйте решить сами или откройте все подсказки (${progress?.hintsUsed ?: 0}/${t.hints.size}).", PyPalette.warning)
            navButton(item, "К подсказкам", tone = Tone.SECONDARY) { nav.navigate(R.taskHints(id)) }
            navButton(item, "Всё равно показать решение", tone = Tone.OUTLINED) { confirmed = true }
            return@ScreenList
        }
        LaunchedEffectOnce(id) { withContext(Dispatchers.IO) { vm.store.recordSolutionViewed(id, e.summary.category, e.summary.level) } }
        codeItem(item, s.code)
        if (s.time.isNotBlank() || s.memory.isNotBlank()) textItem(item, "Время ${s.time} · Память ${s.memory}", PyPalette.muted, small = true)
        if (s.explain.isNotBlank()) infoCard(item, "Пояснение", s.explain)
        if (t.explain.isNotBlank()) infoCard(item, "Разбор задачи", t.explain)
        navButton(item, "Запустить", "Python Run", Tone.TERTIARY) {
            vm.openCode(s.code, e.title, taskId = id, stdin = t.tests.firstOrNull()?.input ?: "")
            nav.navigate(R.CODE)
        }
        navButton(item, if (saved) "✓ Сохранено в избранном" else "★ Сохранить решение", tone = Tone.OUTLINED, enabled = !saved) {
            vm.saveSnippet("${e.title} — ${s.title}", s.code) { saved = true }
        }
        if (index + 1 < t.solutions.size) navButton(item, "Другое решение") { nav.navigate(R.taskSolution(id, index + 1)) }
    }
}

/** Helper: run a side effect once per key from inside a lazy list builder. */
private fun androidx.wear.compose.foundation.lazy.TransformingLazyColumnScope.LaunchedEffectOnce(key: Any, block: suspend () -> Unit) {
    item { LaunchedEffect(key) { block() } }
}

@Composable
fun JudgeScreen(vm: AppViewModel, nav: NavHostController, id: String) {
    val e = rememberEntry(vm, id) ?: return LoadingScreen()
    val code by vm.code.collectAsState()
    LaunchedEffect(id) { vm.judgeCode(e) }
    if (code.running) return LoadingScreen("Проверяю на тестах…")
    val j = code.judge
    ScreenList { item ->
        header(item, "Проверка решения")
        if (j == null) {
            infoCard(item, null, "Не удалось запустить проверку: встроенный Python недоступен.", PyPalette.error)
            return@ScreenList
        }
        infoCard(item, if (j.allPassed) "Решение принято ✓" else "Пройдено ${j.passed} из ${j.total}",
            if (j.allPassed) "Все тесты пройдены. Задача отмечена как решённая." else "Исправьте ошибку и проверьте снова.",
            if (j.allPassed) PyPalette.success else PyPalette.warning)
        j.results.forEachIndexed { i, r ->
            val title = "Тест ${i + 1}: " + if (r.ok) "OK (${r.elapsedMs} мс)" else when (r.status) {
                "OK" -> "неверный ответ"
                "TIMEOUT" -> "превышено время"
                "SYNTAX_ERROR" -> "синтаксическая ошибка"
                else -> r.error ?: r.status
            }
            if (r.ok) textItem(item, title, PyPalette.success, small = true)
            else {
                infoCard(item, title, listOfNotNull(
                    r.message?.let { "Сообщение: $it" + (r.line?.let { l -> " (строка $l)" } ?: "") },
                    "Ваш вывод: ${r.stdout.trim().take(200).ifEmpty { "(пусто)" }}",
                    "Ожидалось: ${r.expected.trim().take(200)}",
                ).joinToString("\n"), PyPalette.error)
                r.error?.let { err -> navButton(item, "Что значит $err?", tone = Tone.OUTLINED, key = "err$i") { nav.navigate(R.entry("err:$err")) } }
            }
        }
        navButton(item, "Вернуться к коду", tone = Tone.OUTLINED) { nav.popBackStack() }
    }
}
