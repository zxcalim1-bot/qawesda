package com.pyolympiad.watch.ui.screens

import androidx.compose.runtime.Composable
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
import com.pyolympiad.data.Favorite
import com.pyolympiad.data.Overview
import com.pyolympiad.data.SearchHit
import com.pyolympiad.data.UserStore
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
import com.pyolympiad.watch.ui.kit.rememberTextInput
import com.pyolympiad.watch.ui.kit.textItem
import com.pyolympiad.watch.ui.nav.R
import com.pyolympiad.watch.ui.theme.PyPalette
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

// ============================================================================ training mode

@Composable
fun TrainingSetupScreen(vm: AppViewModel, nav: NavHostController) {
    var size by remember { mutableIntStateOf(10) }
    var category by remember { mutableStateOf<String?>(null) }
    var level by remember { mutableStateOf<Int?>(null) }
    val cats by produceState<List<Category>>(emptyList()) { value = withContext(Dispatchers.IO) { vm.repo.categories(Domain.TASKS, "task") } }
    val weak by produceState<List<String>>(emptyList()) {
        value = withContext(Dispatchers.IO) { vm.store.overview(emptyList()).weak.map { it.topic } }
    }
    ScreenList(edgeButton = { com.pyolympiad.watch.ui.kit.BottomAction("Старт") { vm.startTraining(size, category, level); nav.navigate(R.TRAINING) } }) { item ->
        header(item, "Тренировка")
        textItem(item, "Задачи: $size · Тема: ${category ?: "все"} · Уровень: ${level?.let { levelTitle(it) } ?: "любой"}", PyPalette.muted, center = true, small = true)
        header(item, "Количество задач")
        for (n in listOf(10, 20, 50, 100)) navButton(item, "$n задач", tone = if (n == size) Tone.PRIMARY else Tone.TONAL, key = "n$n") { size = n }
        header(item, "Уровень")
        navButton(item, "Любой", tone = if (level == null) Tone.PRIMARY else Tone.TONAL) { level = null }
        for (lv in 1..6) navButton(item, levelTitle(lv), tone = if (level == lv) Tone.PRIMARY else Tone.TONAL, key = "l$lv") { level = lv }
        header(item, "Тема")
        navButton(item, "Все темы", tone = if (category == null) Tone.PRIMARY else Tone.TONAL) { category = null }
        for (w in weak) navButton(item, "Слабая тема: $w", tone = if (category == w) Tone.PRIMARY else Tone.SECONDARY, key = "w$w") { category = w }
        for (c in cats) navButton(item, c.name, "${c.count}", tone = if (category == c.name) Tone.PRIMARY else Tone.TONAL, key = "c" + c.name) { category = c.name }
        navButton(item, "Начать тренировку", tone = Tone.SECONDARY) { vm.startTraining(size, category, level); nav.navigate(R.TRAINING) }
    }
}

@Composable
fun TrainingScreen(vm: AppViewModel, nav: NavHostController) {
    val t by vm.training.collectAsState()
    val state = t ?: return LoadingScreen("Подбираю задачи…")
    if (state.items.isEmpty()) {
        ScreenList { item ->
            header(item, "Тренировка")
            textItem(item, "Подходящих задач не найдено. Выберите другую тему или уровень.", center = true)
        }
        return
    }
    if (state.finished) {
        ScreenList { item ->
            header(item, "Тренировка завершена")
            infoCard(item, "Итог", "Решено: ${state.solved} из ${state.items.size}\nНе решено: ${state.failed}\nПодсказок: ${state.hints}\nПросмотрено решений: ${state.viewed}", PyPalette.success)
            val pct = state.solved * 100 / state.items.size
            infoCard(item, "Рекомендация", when {
                pct >= 80 -> "Отлично! Повышайте уровень сложности."
                pct >= 50 -> "Хорошо. Повторите теорию по задачам, которые не получились."
                else -> "Начните с подсказок и теории: раздел «Алгоритмы» и «Прогресс → слабые темы»."
            })
            navButton(item, "Прогресс") { nav.navigate(R.PROGRESS) }
            navButton(item, "Новая тренировка", tone = Tone.SECONDARY) { nav.navigate(R.TRAINING_SETUP) }
        }
        return
    }
    val id = state.current ?: return LoadingScreen()
    val e by produceState<Entry?>(null, id) { value = withContext(Dispatchers.IO) { vm.repo.entry(id) } }
    val entry = e ?: return LoadingScreen()
    val task = entry.task
    ScreenList { item ->
        header(item, "Задача ${state.index + 1} / ${state.items.size}")
        textItem(item, "✓ ${state.solved}  ✗ ${state.failed}", PyPalette.muted, center = true, small = true)
        infoCard(item, entry.title, task?.statement ?: entry.summary.summary)
        task?.tests?.firstOrNull { !it.hidden }?.let {
            codeItem(item, it.input.trimEnd(), "Пример ввода:", PyPalette.muted)
            codeItem(item, it.output.trimEnd(), "Вывод:", PyPalette.output)
        }
        navButton(item, "Открыть задачу полностью", tone = Tone.OUTLINED) { nav.navigate(R.entry(id)) }
        navButton(item, "Подсказка", tone = Tone.SECONDARY) { nav.navigate(R.taskHints(id)) }
        navButton(item, "Проверить код", tone = Tone.TERTIARY) {
            vm.openCode("n = int(input())\n", entry.title, taskId = id, stdin = task?.tests?.firstOrNull()?.input ?: "")
            nav.navigate(R.CODE)
        }
        navButton(item, "Решил ✓", tone = Tone.PRIMARY) { vm.trainingResult(solved = true, hintsUsed = 0, viewedSolution = false) }
        navButton(item, "Не решил / пропустить") { vm.trainingResult(solved = false, hintsUsed = 0, viewedSolution = false) }
        navButton(item, "Посмотреть решение", tone = Tone.OUTLINED) {
            vm.trainingResult(solved = false, hintsUsed = 0, viewedSolution = true)
            nav.navigate(R.taskSolution(id, 0))
        }
        navButton(item, "Закончить тренировку", tone = Tone.OUTLINED) { vm.stopTraining(); nav.popBackStack() }
    }
}

// ============================================================================ tests (quizzes)

private val TEST_CATEGORIES = listOf(
    "basics" to "Python Basics", "syntax" to "Syntax", "output" to "Output",
    "algorithms" to "Algorithms", "ds" to "Data Structures", "olympiad" to "Olympiad",
)

@Composable
fun TestsMenuScreen(vm: AppViewModel, nav: NavHostController) {
    val counts by produceState<Map<String, Int>>(emptyMap()) {
        value = withContext(Dispatchers.IO) { vm.repo.categories(Domain.TESTS, "quiz").associate { it.name to it.count } }
    }
    var size by remember { mutableIntStateOf(10) }
    ScreenList { item ->
        header(item, "Тесты")
        textItem(item, "Вопросов в тесте: $size", PyPalette.muted, center = true, small = true)
        for (n in listOf(10, 20, 50)) navButton(item, "$n вопросов", tone = if (n == size) Tone.PRIMARY else Tone.TONAL, key = "s$n") { size = n }
        header(item, "Категории")
        navButton(item, "Смешанный тест", "${counts.values.sum()} вопросов в базе", Tone.SECONDARY) { vm.startQuiz("Смешанный тест", null, size); nav.navigate(R.QUIZ) }
        for ((key, title) in TEST_CATEGORIES) {
            val n = counts[key] ?: 0
            navButton(item, title, "${UserStore.QUIZ_TOPICS[key]} · $n", enabled = n > 0, key = key) { vm.startQuiz(title, key, size); nav.navigate(R.QUIZ) }
        }
        textItem(item, "Типы вопросов: определить вывод, найти ошибку, выбрать код, определить тип, выбрать алгоритм, оценить сложность.", PyPalette.muted, small = true)
    }
}

@Composable
fun QuizScreen(vm: AppViewModel, nav: NavHostController) {
    val s by vm.quiz.collectAsState()
    val session = s ?: return LoadingScreen("Подбираю вопросы…")
    if (session.items.isEmpty()) {
        ScreenList { item -> header(item, session.title); textItem(item, "В этой категории пока нет вопросов.", center = true) }
        return
    }
    if (session.finished) {
        ScreenList { item ->
            header(item, "Результат")
            val pct = session.correct * 100 / session.items.size
            infoCard(item, "${session.correct} из ${session.items.size} ($pct%)", when {
                pct >= 90 -> "Превосходно!"
                pct >= 70 -> "Хороший результат."
                pct >= 50 -> "Неплохо, но есть что повторить."
                else -> "Стоит повторить теорию."
            }, if (pct >= 70) PyPalette.success else PyPalette.warning)
            val weak = session.wrong.groupingBy { it }.eachCount().entries.sortedByDescending { it.value }
            if (weak.isNotEmpty()) infoCard(item, "Ошибки по темам", weak.joinToString("\n") { "${UserStore.QUIZ_TOPICS[it.key] ?: it.key}: ${it.value}" })
            navButton(item, "Ещё раз", tone = Tone.SECONDARY) { nav.popBackStack(); nav.navigate(R.TESTS) }
        }
        return
    }
    val q = session.current!!.quiz
    ScreenList { item ->
        header(item, "${session.title} · ${session.index + 1}/${session.items.size}")
        infoCard(item, typeTitle(q.type), q.question)
        if (q.code.isNotBlank()) codeItem(item, q.code)
        q.variants.forEachIndexed { i, v -> codeItem(item, v, "Вариант ${i + 1}:") }
        q.options.forEachIndexed { i, o ->
            val chosen = session.chosen
            val tone = when {
                chosen == null -> Tone.TONAL
                i == q.answer -> Tone.TERTIARY
                i == chosen -> Tone.OUTLINED
                else -> Tone.TONAL
            }
            val mark = when {
                chosen == null -> ""
                i == q.answer -> "✓ "
                i == chosen -> "✗ "
                else -> ""
            }
            navButton(item, mark + o, tone = tone, enabled = chosen == null || i == q.answer || i == chosen, key = "o$i") { vm.answerQuiz(i) }
        }
        if (session.chosen != null) {
            val ok = session.chosen == q.answer
            infoCard(item, if (ok) "Верно!" else "Неверно", q.explain, if (ok) PyPalette.success else PyPalette.error)
            navButton(item, if (session.index + 1 < session.items.size) "Дальше" else "Результат", tone = Tone.SECONDARY) { vm.nextQuiz() }
        }
    }
}

private fun typeTitle(t: String) = when (t) {
    "output" -> "Что выведет программа?"
    "error" -> "Какая ошибка возникнет?"
    "type" -> "Какой тип у значения?"
    "choose_code" -> "Выберите правильный код"
    "algorithm" -> "Выберите алгоритм"
    "complexity" -> "Оцените сложность"
    else -> "Вопрос"
}

// ============================================================================ search

@Composable
fun SearchScreen(vm: AppViewModel, nav: NavHostController) {
    var query by remember { mutableStateOf("") }
    var filter by remember { mutableStateOf<Domain?>(null) }
    val input = rememberTextInput { query = it }
    val history by produceState(emptyList<String>(), query) { value = withContext(Dispatchers.IO) { vm.store.history("search", 6) } }
    val hits by produceState<List<SearchHit>?>(emptyList(), query, filter) {
        value = null
        value = if (query.isBlank()) emptyList() else withContext(Dispatchers.IO) {
            vm.store.addHistory("search", query)
            vm.repo.search(query, filter?.let { listOf(it) } ?: Domain.entries, 60)
        }
    }
    ScreenList(edgeButton = { com.pyolympiad.watch.ui.kit.BottomAction("Найти") { input.open("Поиск") } }) { item ->
        header(item, if (query.isBlank()) "Поиск" else "«$query»")
        if (query.isBlank()) {
            textItem(item, "Русский, английский, узбекский, транслит (spisok, slovar), первые буквы (sor → sorted).", PyPalette.muted, small = true)
            navButton(item, "Ввести запрос", tone = Tone.SECONDARY) { input.open("Поиск") }
            if (history.isNotEmpty()) {
                header(item, "Недавние")
                for (h in history) navButton(item, h, tone = Tone.OUTLINED, key = "h$h") { query = h }
            }
            return@ScreenList
        }
        header(item, "Категория")
        navButton(item, "Все", tone = if (filter == null) Tone.PRIMARY else Tone.TONAL) { filter = null }
        for (d in Domain.entries) navButton(item, d.titleRu, tone = if (filter == d) Tone.PRIMARY else Tone.TONAL, key = "f" + d.key) { filter = d }
        val list = hits
        if (list == null) textItem(item, "Ищу…", PyPalette.muted, center = true)
        else {
            header(item, "Найдено: ${list.size}")
            if (list.isEmpty()) textItem(item, "Ничего не найдено. Попробуйте другое слово или транслит.", PyPalette.muted, center = true)
            for (h in list) navButton(item, h.entry.title, kindTitle(h.entry.kind) + " · " + h.entry.summary.take(50), key = h.entry.id) { nav.navigate(R.entry(h.entry.id)) }
        }
        navButton(item, "Новый поиск", tone = Tone.OUTLINED) { input.open("Поиск") }
    }
}

// ============================================================================ favorites

@Composable
fun FavoritesScreen(vm: AppViewModel, nav: NavHostController) {
    val favs by produceState<List<Favorite>?>(null) { value = withContext(Dispatchers.IO) { vm.store.favorites() } }
    val snippets by produceState<List<Triple<Long, String, String>>?>(null) { value = withContext(Dispatchers.IO) { vm.store.snippets() } }
    val list = favs ?: return LoadingScreen()
    val codes = snippets ?: return LoadingScreen()
    ScreenList { item ->
        header(item, "Избранное")
        if (list.isEmpty() && codes.isEmpty()) {
            textItem(item, "Пусто. Нажмите «☆ В избранное» в задаче, функции, методе, алгоритме, библиотеке, ошибке или статье, а «★ Сохранить решение» — под решением.", PyPalette.muted, center = true)
        }
        if (codes.isNotEmpty()) {
            header(item, "Сохранённые решения и код")
            for ((sid, title, body) in codes) {
                navButton(item, title, body.lineSequence().firstOrNull { it.isNotBlank() }?.trim(), Tone.TERTIARY, key = "s$sid") {
                    vm.openCode(body, title, snippetId = sid)
                    nav.navigate(R.CODE)
                }
            }
        }
        for ((kind, items) in list.groupBy { it.kind }) {
            header(item, kindTitle(kind))
            for (f in items) navButton(item, f.title, key = f.id) { nav.navigate(R.entry(f.id)) }
        }
    }
}

// ============================================================================ progress

@Composable
fun ProgressScreen(vm: AppViewModel, nav: NavHostController) {
    val overview by produceState<Overview?>(null) {
        value = withContext(Dispatchers.IO) {
            val topics = vm.repo.categories(Domain.TASKS, "task").map { it.name }
            vm.store.overview(topics)
        }
    }
    val o = overview ?: return LoadingScreen()
    ScreenList { item ->
        header(item, "Прогресс")
        infoCard(item, "Уровень ${o.level}: ${o.levelTitle}", "${o.xp} XP" + if (o.nextLevelXp > o.xp) " · до следующего уровня ${o.nextLevelXp - o.xp} XP" else "", PyPalette.success)
        infoCard(item, "Задачи", "Решено: ${o.solvedTasks}\nНачато: ${o.attemptedTasks}\nПопыток: ${o.totalAttempts} (ошибочных ${o.failedAttempts})\nПодсказок: ${o.hintsUsed}")
        infoCard(item, "Тесты", "Ответов: ${o.quizAnswered}\nПравильных: ${o.quizCorrect}" +
            if (o.quizAnswered > 0) " (${o.quizCorrect * 100 / o.quizAnswered}%)" else "")
        infoCard(item, "Изучено", "Статей и тем: ${o.topicsStudied}\nВ избранном: ${o.favorites}")
        if (o.strong.isNotEmpty()) infoCard(item, "Сильные темы", o.strong.joinToString("\n") { "${it.topic}: ${(it.accuracy * 100).toInt()}%" }, PyPalette.success)
        if (o.weak.isNotEmpty()) infoCard(item, "Слабые темы", o.weak.joinToString("\n") { "${it.topic}: ${(it.accuracy * 100).toInt()}%" }, PyPalette.warning)
        val recs = buildList {
            o.weak.firstOrNull()?.let { add("Потренируйтесь в теме «${it.topic}»: начните с уровня Beginner/Easy и используйте подсказки.") }
            if (o.quizAnswered < 10) add("Пройдите тест на 10 вопросов, чтобы оценить базовые знания.")
            o.untouched.take(3).forEach { add("Новая тема: «$it».") }
            if (o.solvedTasks >= 20 && o.weak.isEmpty()) add("Переходите к уровням Hard и Olympiad.")
            if (isEmpty()) add("Продолжайте в том же духе!")
        }
        infoCard(item, "Рекомендации", recs.joinToString("\n") { "• $it" })
        o.weak.firstOrNull()?.let { w -> navButton(item, "Тренировка: ${w.topic}", tone = Tone.SECONDARY) { vm.startTraining(10, w.topic, null); nav.navigate(R.TRAINING) } }
    }
}

// ============================================================================ settings / about

@Composable
fun SettingsScreen(vm: AppViewModel, nav: NavHostController) {
    val s by vm.settings.collectAsState()
    val python by vm.pythonReady.collectAsState()
    val scope = rememberCoroutineScope()
    var confirmReset by remember { mutableStateOf(false) }
    ScreenList { item ->
        header(item, "Настройки")
        navButton(item, if (s.olympiadMode) "Режим: олимпиада" else "Режим: обучение", if (s.olympiadMode) "решения скрыты до подсказок" else "решения видны сразу", Tone.PRIMARY) {
            vm.updateSettings { it.copy(olympiadMode = !it.olympiadMode) }
        }
        header(item, "Размер шрифта")
        for ((label, scale) in listOf("Мелкий" to 0.9f, "Обычный" to 1f, "Крупный" to 1.15f, "Очень крупный" to 1.3f)) {
            navButton(item, label, tone = if (s.textScale == scale) Tone.PRIMARY else Tone.TONAL, key = label) { vm.updateSettings { it.copy(textScale = scale) } }
        }
        header(item, "Лимит времени Python Run")
        for (sec in listOf(2.0, 5.0, 10.0, 30.0)) navButton(item, "${sec.toInt()} с", tone = if (s.timeLimitSec == sec) Tone.PRIMARY else Tone.TONAL, key = "t$sec") { vm.updateSettings { it.copy(timeLimitSec = sec) } }
        navButton(item, if (s.showTrace) "Этапы решения: показывать" else "Этапы решения: скрывать", tone = Tone.OUTLINED) { vm.updateSettings { it.copy(showTrace = !it.showTrace) } }
        header(item, "Данные")
        textItem(item, "Python на часах: " + when (python) { true -> "готов (CPython 3.11)"; false -> "недоступен"; null -> "запускается…" }, PyPalette.muted, small = true)
        if (!confirmReset) navButton(item, "Сбросить прогресс", tone = Tone.OUTLINED) { confirmReset = true }
        else navButton(item, "Точно сбросить? Нажмите ещё раз", tone = Tone.SECONDARY) {
            scope.launch(Dispatchers.IO) { vm.store.resetProgress() }
            confirmReset = false
        }
        navButton(item, "О приложении и лицензии", tone = Tone.OUTLINED) { nav.navigate(R.ABOUT) }
    }
}

@Composable
fun AboutScreen(vm: AppViewModel) {
    val info by produceState<String?>(null) {
        value = withContext(Dispatchers.IO) {
            val kb = vm.container.knowledgeBase
            val lines = kb.manifest.map { "${it.domain.titleRu}: ${it.entries} записей" }
            val pyVer = vm.container.python.version()
            (lines + listOf(
                "Версия базы: ${kb.version}",
                "Python сборки базы: ${kb.pythonVersion}",
                "Python на часах: $pyVer",
                "Навыков решателя: ${vm.container.engine.catalog.skills.size} + композиции",
                "Понятий в словаре: ${vm.container.engine.lexicon.size}",
                "Занято на диске: ${kb.installedBytes / 1024 / 1024} МБ",
            ) + if (kb.externalLibraries.isNotEmpty()) listOf("API внешних библиотек: " + kb.externalLibraries.joinToString(", ")) else emptyList()).joinToString("\n")
        }
    }
    ScreenList { item ->
        header(item, "О приложении")
        infoCard(item, "Offline Python Olympiad Assistant", "Работает без интернета, телефона, сервера и аккаунтов. Все данные и прогресс хранятся на часах.")
        infoCard(item, "Состав базы", info ?: "…")
        infoCard(item, "Лицензии", "Справочник Python, официальный Language Reference и docstrings стандартной библиотеки — Python Software Foundation License; примеры кода документации — Zero-Clause BSD. Встроенный Python — CPython 3.11 через Chaquopy (MIT). API внешних библиотек (если включены) — из их docstrings под лицензиями этих проектов (BSD, MIT, Apache 2.0, LGPL). Задачи, тесты, статьи и решатель — собственные материалы проекта.")
        infoCard(item, "Ограничения", "Внешние библиотеки (NumPy, Pandas, PyTorch…) — только справочник: на часах выполняется стандартная библиотека Python. Длинные вычисления на C (например, 10**10**8) не прерываются лимитом времени.")
    }
}
