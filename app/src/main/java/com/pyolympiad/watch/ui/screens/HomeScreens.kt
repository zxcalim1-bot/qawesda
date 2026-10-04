package com.pyolympiad.watch.ui.screens

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.produceState
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.navigation.NavHostController
import androidx.wear.compose.material3.CircularProgressIndicator
import androidx.wear.compose.material3.FilledTonalButton
import androidx.wear.compose.material3.MaterialTheme
import androidx.wear.compose.material3.SurfaceTransformation
import androidx.wear.compose.material3.Text
import androidx.wear.compose.material3.lazy.transformedHeight
import com.pyolympiad.data.Domain
import com.pyolympiad.watch.AppViewModel
import com.pyolympiad.watch.ui.kit.ScreenList
import com.pyolympiad.watch.ui.kit.Tone
import com.pyolympiad.watch.ui.kit.header
import com.pyolympiad.watch.ui.kit.infoCard
import com.pyolympiad.watch.ui.kit.navButton
import com.pyolympiad.watch.ui.kit.textItem
import com.pyolympiad.watch.ui.nav.R
import com.pyolympiad.watch.ui.theme.PyPalette
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

@Composable
fun HomeScreen(vm: AppViewModel, nav: NavHostController) {
    val install by vm.installProgress.collectAsState()
    val settings by vm.settings.collectAsState()
    val scope = rememberCoroutineScope()
    val level by produceState<String?>(null, install) {
        if (install == null) value = withContext(Dispatchers.IO) {
            val o = vm.store.overview(emptyList())
            "Уровень ${o.level} · ${o.levelTitle} · ${o.xp} XP"
        }
    }

    fun openCurrentTask(hints: Boolean) {
        scope.launch {
            val id = vm.currentOrRandomTask() ?: return@launch
            vm.setCurrentTask(id)
            nav.navigate(if (hints) R.taskHints(id) else R.taskSolution(id, 0))
        }
    }

    ScreenList { item ->
        header(item, "Python Olympiad")
        if (install != null) {
            item {
                Row(Modifier.fillMaxWidth().transformedHeight(this, item.spec), horizontalArrangement = Arrangement.Center) {
                    CircularProgressIndicator(progress = { install ?: 0f })
                }
            }
            textItem(item, "Подготовка офлайн-базы знаний: ${((install ?: 0f) * 100).toInt()}%", PyPalette.muted, center = true, small = true)
        } else {
            level?.let { textItem(item, it, PyPalette.muted, center = true, small = true) }
            if (settings.olympiadMode) textItem(item, "Олимпиадный режим", PyPalette.warning, center = true, small = true)
        }
        // Quick actions: two compact buttons per row.
        quickRow(item, "Решить" to { nav.navigate(R.SOLVE) }, "Поиск" to { nav.navigate(R.SEARCH) })
        quickRow(item, "Случайная" to {
            scope.launch {
                val id = withContext(Dispatchers.IO) { vm.repo.randomEntry(Domain.TASKS, "task")?.id } ?: return@launch
                vm.setCurrentTask(id)
                nav.navigate(R.entry(id))
            }
        }, "Подсказка" to { openCurrentTask(hints = true) })
        quickRow(item, "Ответ" to { openCurrentTask(hints = false) }, "Справка" to { nav.navigate(R.section("python")) })

        header(item, "Разделы")
        navButton(item, "Python", "Справочник языка", Tone.PRIMARY) { nav.navigate(R.section("python")) }
        navButton(item, "Решить задачу", "Условие → решение и код", Tone.SECONDARY) { nav.navigate(R.SOLVE) }
        navButton(item, "Олимпиада", "Темы, задачи, тренировка") { nav.navigate(R.section("olympiad")) }
        navButton(item, "Задачи", "По темам и уровням") { nav.navigate(R.TASKS) }
        navButton(item, "Алгоритмы", "Теория, шаблоны, O(...)") { nav.navigate(R.section("algorithms")) }
        navButton(item, "Функции", "Встроенные и методы") { nav.navigate(R.section("functions")) }
        navButton(item, "Библиотеки", "Стандартные и внешние") { nav.navigate(R.section("libraries")) }
        navButton(item, "Ошибки", "Исключения и анализатор") { nav.navigate(R.section("errors")) }
        navButton(item, "Тесты", "10 / 20 / 50 вопросов") { nav.navigate(R.TESTS) }
        navButton(item, "Поиск", "RU · EN · UZ · транслит") { nav.navigate(R.SEARCH) }
        navButton(item, "Избранное") { nav.navigate(R.FAVORITES) }
        navButton(item, "Прогресс") { nav.navigate(R.PROGRESS) }
        navButton(item, "Python Run", "Редактор и запуск кода", Tone.TERTIARY) { nav.navigate(R.CODE) }
        navButton(item, "Настройки", tone = Tone.OUTLINED) { nav.navigate(R.SETTINGS) }
    }
}

private fun androidx.wear.compose.foundation.lazy.TransformingLazyColumnScope.quickRow(
    item: com.pyolympiad.watch.ui.kit.Item,
    a: Pair<String, () -> Unit>,
    b: Pair<String, () -> Unit>,
) {
    item {
        Row(
            Modifier.fillMaxWidth().transformedHeight(this, item.spec),
            horizontalArrangement = Arrangement.spacedBy(4.dp),
        ) {
            for ((label, action) in listOf(a, b)) {
                FilledTonalButton(onClick = action, modifier = Modifier.weight(1f), transformation = SurfaceTransformation(item.spec)) {
                    Text(label, maxLines = 1, overflow = TextOverflow.Ellipsis, textAlign = TextAlign.Center,
                        style = MaterialTheme.typography.labelMedium, modifier = Modifier.fillMaxWidth())
                }
            }
        }
    }
}

/** Menus of the main sections, with live entry counts from the databases. */
@Composable
fun SectionScreen(vm: AppViewModel, nav: NavHostController, key: String) {
    val counts by produceState<Map<String, Map<String, Int>>>(emptyMap(), key) {
        value = withContext(Dispatchers.IO) {
            Domain.entries.associate { d -> d.key to runCatching { vm.repo.kinds(d) }.getOrDefault(emptyMap()) }
        }
    }
    fun n(domain: Domain, kind: String): String? = counts[domain.key]?.get(kind)?.let { "$it" }
    val settings by vm.settings.collectAsState()

    ScreenList { item ->
        when (key) {
            "python" -> {
                header(item, "Python")
                navButton(item, "Статьи и темы", n(Domain.PYTHON, "topic")?.let { "$it статей" }, Tone.PRIMARY) { nav.navigate(R.cats("python", "topic")) }
                navButton(item, "Встроенные функции", n(Domain.PYTHON, "builtin")) { nav.navigate(R.list("python", "builtin", null)) }
                navButton(item, "Ключевые слова", n(Domain.PYTHON, "keyword")) { nav.navigate(R.list("python", "keyword", null)) }
                navButton(item, "Операторы", n(Domain.PYTHON, "operator")) { nav.navigate(R.list("python", "operator", null)) }
                navButton(item, "Методы типов", n(Domain.PYTHON, "method")) { nav.navigate(R.cats("python", "method")) }
                navButton(item, "Исключения", n(Domain.PYTHON, "exception")) { nav.navigate(R.list("python", "exception", null)) }
                navButton(item, "CPython изнутри", n(Domain.PYTHON, "cpython")) { nav.navigate(R.list("python", "cpython", null)) }
                navButton(item, "Справочник языка (EN)", n(Domain.PYTHON, "langref")) { nav.navigate(R.list("python", "langref", null)) }
                navButton(item, "Python Run", "Запуск кода на часах", Tone.TERTIARY) { nav.navigate(R.CODE) }
            }
            "functions" -> {
                header(item, "Функции и методы")
                navButton(item, "Встроенные функции", n(Domain.PYTHON, "builtin"), Tone.PRIMARY) { nav.navigate(R.list("python", "builtin", null)) }
                navButton(item, "Методы str, list, dict…", n(Domain.PYTHON, "method")) { nav.navigate(R.cats("python", "method")) }
                navButton(item, "Функции модулей", n(Domain.LIBRARIES, "member")) { nav.navigate(R.cats("libraries", "member")) }
                navButton(item, "Ключевые слова", n(Domain.PYTHON, "keyword")) { nav.navigate(R.list("python", "keyword", null)) }
                navButton(item, "Операторы", n(Domain.PYTHON, "operator")) { nav.navigate(R.list("python", "operator", null)) }
            }
            "libraries" -> {
                header(item, "Библиотеки")
                navButton(item, "Стандартная библиотека", n(Domain.LIBRARIES, "module")?.let { "$it модулей" }, Tone.PRIMARY) { nav.navigate(R.list("libraries", "module", null)) }
                navButton(item, "Функции модулей", n(Domain.LIBRARIES, "member")) { nav.navigate(R.cats("libraries", "member")) }
                navButton(item, "Внешние библиотеки", n(Domain.LIBRARIES, "extlib")) { nav.navigate(R.list("libraries", "extlib", null)) }
                if (counts[Domain.LIBRARIES.key]?.containsKey("extmember") == true) {
                    navButton(item, "API внешних библиотек", n(Domain.LIBRARIES, "extmember")) { nav.navigate(R.cats("libraries", "extmember")) }
                }
                navButton(item, "GitHub / Open Source", n(Domain.GITHUB, "project")?.let { "$it проектов" }, Tone.SECONDARY) { nav.navigate(R.cats("github", "project")) }
                infoCard(item, null, "Внешние библиотеки — справочник. Запустить на часах можно только стандартную библиотеку Python 3.11.")
            }
            "algorithms" -> {
                header(item, "Алгоритмы")
                navButton(item, "Все темы", n(Domain.ALGORITHMS, "algorithm"), Tone.PRIMARY) { nav.navigate(R.cats("algorithms", "algorithm")) }
                navButton(item, "Задачи по алгоритмам") { nav.navigate(R.TASKS) }
                navButton(item, "Тест: алгоритмы") { vm.startQuiz("Алгоритмы", "algorithms", 10); nav.navigate(R.QUIZ) }
            }
            "olympiad" -> {
                header(item, "Олимпиада")
                navButton(item, "Темы олимпиад", n(Domain.ALGORITHMS, "algorithm"), Tone.PRIMARY) { nav.navigate(R.cats("algorithms", "algorithm")) }
                navButton(item, "Олимпиадные задачи", "уровень Olympiad") { nav.navigate(R.list("tasks", "task", null, 6)) }
                navButton(item, "Сложные задачи", "Hard и Very Hard") { nav.navigate(R.list("tasks", "task", null, 4)) }
                navButton(item, "Тренировка", "10 / 20 / 50 / 100 задач", Tone.SECONDARY) { nav.navigate(R.TRAINING_SETUP) }
                navButton(item, "Тест: олимпиадные темы") { vm.startQuiz("Олимпиадные темы", "olympiad", 10); nav.navigate(R.QUIZ) }
                navButton(item, if (settings.olympiadMode) "Режим: олимпиада" else "Режим: обучение",
                    if (settings.olympiadMode) "Решения скрыты до подсказок" else "Решения доступны сразу", Tone.OUTLINED) {
                    vm.updateSettings { it.copy(olympiadMode = !it.olympiadMode) }
                }
            }
            "errors" -> {
                header(item, "Ошибки")
                navButton(item, "Разбор ошибок", n(Domain.ERRORS, "error"), Tone.PRIMARY) { nav.navigate(R.cats("errors", "error")) }
                navButton(item, "Встроенные исключения", n(Domain.PYTHON, "exception")) { nav.navigate(R.list("python", "exception", null)) }
                navButton(item, "Анализатор кода", "Найти ошибку в программе", Tone.TERTIARY) {
                    vm.openCode("n = input()\nif n > 5\n    print(\"больше\" + n)\n", "Пример с ошибками")
                    nav.navigate(R.CODE)
                }
                navButton(item, "Тест: найди ошибку") { vm.startQuiz("Синтаксис и ошибки", "syntax", 10); nav.navigate(R.QUIZ) }
            }
            else -> header(item, key)
        }
    }
}
