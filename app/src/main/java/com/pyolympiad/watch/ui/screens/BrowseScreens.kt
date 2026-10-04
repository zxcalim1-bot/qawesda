package com.pyolympiad.watch.ui.screens

import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
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
import com.pyolympiad.data.EntrySummary
import com.pyolympiad.watch.AppViewModel
import com.pyolympiad.watch.ui.kit.LoadingScreen
import com.pyolympiad.watch.ui.kit.ScreenList
import com.pyolympiad.watch.ui.kit.Tone
import com.pyolympiad.watch.ui.kit.codeItem
import com.pyolympiad.watch.ui.kit.header
import com.pyolympiad.watch.ui.kit.infoCard
import com.pyolympiad.watch.ui.kit.kindTitle
import com.pyolympiad.watch.ui.kit.kindTitlePlural
import com.pyolympiad.watch.ui.kit.levelTitle
import com.pyolympiad.watch.ui.kit.navButton
import com.pyolympiad.watch.ui.kit.sectionsItems
import com.pyolympiad.watch.ui.kit.textItem
import com.pyolympiad.watch.ui.nav.R
import com.pyolympiad.watch.ui.theme.PyPalette
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

private fun domainOf(key: String) = Domain.entries.firstOrNull { it.key == key } ?: Domain.PYTHON

@Composable
fun CategoryListScreen(vm: AppViewModel, nav: NavHostController, domainKey: String, kind: String) {
    val domain = domainOf(domainKey)
    val cats by produceState<List<Category>?>(null, domainKey, kind) {
        value = withContext(Dispatchers.IO) { vm.repo.categories(domain, kind) }
    }
    val list = cats ?: return LoadingScreen()
    ScreenList { item ->
        header(item, kindTitlePlural(kind))
        if (list.isEmpty()) textItem(item, "Раздел пока пуст.", PyPalette.muted, center = true)
        for (c in list) navButton(item, c.name, "${c.count}", key = c.name) { nav.navigate(R.list(domainKey, kind, c.name)) }
    }
}

@Composable
fun EntryListScreen(vm: AppViewModel, nav: NavHostController, domainKey: String, kind: String?, category: String?, level: Int?) {
    val domain = domainOf(domainKey)
    var limit by remember { mutableIntStateOf(120) }
    val entries by produceState<List<EntrySummary>?>(null, domainKey, kind, category, level, limit) {
        value = withContext(Dispatchers.IO) { vm.repo.list(domain, kind, category, 0, limit, level) }
    }
    val solved by produceState(emptySet<String>()) { value = withContext(Dispatchers.IO) { vm.store.solvedTaskIds() } }
    val list = entries ?: return LoadingScreen()
    ScreenList { item ->
        header(item, category ?: kind?.let { kindTitlePlural(it) } ?: domain.titleRu)
        if (list.isEmpty()) textItem(item, "Записей нет.", PyPalette.muted, center = true)
        for (e in list) {
            val mark = if (e.id in solved) "✓ " else ""
            val secondary = when {
                e.kind == "task" -> listOf(levelTitle(e.level), e.category).filter { it.isNotEmpty() }.joinToString(" · ")
                else -> e.summary.take(70)
            }
            navButton(item, mark + e.title, secondary.ifEmpty { null }, key = e.id) { nav.navigate(R.entry(e.id)) }
        }
        if (list.size >= limit) navButton(item, "Показать ещё", tone = Tone.OUTLINED) { limit += 200 }
    }
}

/** Generic knowledge entry: reference articles, algorithms, errors, projects, quizzes. */
@Composable
fun EntryScreen(vm: AppViewModel, nav: NavHostController, id: String) {
    val entry by produceState<Entry?>(null, id) {
        value = withContext(Dispatchers.IO) {
            vm.repo.entry(id)?.also { vm.store.recordStudied(it.id, it.summary.kind, it.summary.category) }
        }
    }
    val scope = rememberCoroutineScope()
    var favorite by remember { mutableStateOf(false) }
    LaunchedEffect(id) { favorite = withContext(Dispatchers.IO) { vm.store.isFavorite(id) } }
    var showAnswer by remember { mutableStateOf(false) }
    val e = entry ?: return LoadingScreen()
    ScreenList { item ->
        header(item, e.title)
        textItem(item, listOf(kindTitle(e.summary.kind), e.summary.category).filter { it.isNotEmpty() }.joinToString(" · "), PyPalette.muted, center = true, small = true)
        if (e.summary.summary.isNotBlank() && e.summary.summary != e.title) textItem(item, e.summary.summary)
        e.signature?.let { codeItem(item, it, "Синтаксис:") }
        e.fields["complexity"]?.let { c -> infoCard(item, "Сложность", listOfNotNull("время $c", e.fields["memory"]?.let { "память $it" }).joinToString(", ")) }
        e.error?.let { err ->
            if (err.wrong.isNotBlank()) codeItem(item, err.wrong, "Неправильный код:")
            if (err.wrongOut.isNotBlank()) codeItem(item, err.wrongOut, "Результат:", PyPalette.error)
            if (err.fixed.isNotBlank()) codeItem(item, err.fixed, "Исправленный код:", PyPalette.output)
            if (err.fixedOut.isNotBlank()) codeItem(item, err.fixedOut, "Вывод:", PyPalette.output)
        }
        e.quiz?.let { q ->
            infoCard(item, "Вопрос", q.question)
            if (q.code.isNotBlank()) codeItem(item, q.code)
            q.options.forEachIndexed { i, o -> textItem(item, "${i + 1}) $o") }
            if (showAnswer) infoCard(item, "Ответ: ${q.options.getOrNull(q.answer) ?: ""}", q.explain, PyPalette.success)
            else navButton(item, "Показать ответ", tone = Tone.OUTLINED) { showAnswer = true }
        }
        sectionsItems(item, e.sections)
        e.fields["url"]?.let { infoCard(item, "Официальный репозиторий", it + "\n(откройте на телефоне или компьютере — часам интернет не нужен)") }
        e.fields["license"]?.let { textItem(item, "Лицензия: $it", PyPalette.muted, small = true) }
        if (e.related.isNotEmpty()) {
            header(item, "Связанные знания")
            for (r in e.related) navButton(item, r.title, kindTitle(r.kind), Tone.OUTLINED, key = "rel" + r.id) { nav.navigate(R.entry(r.id)) }
        }
        if (e.referencedBy.isNotEmpty()) {
            header(item, "Где используется")
            for (r in e.referencedBy.take(15)) navButton(item, r.title, kindTitle(r.kind), Tone.OUTLINED, key = "ref" + r.id) { nav.navigate(R.entry(r.id)) }
        }
        val runnable = e.sections.flatMap { it.blocks }.filterIsInstance<com.pyolympiad.data.Block.Code>().firstOrNull { it.lang == "python" }
        if (runnable != null) {
            navButton(item, "Открыть пример в Python Run", tone = Tone.TERTIARY) {
                vm.openCode(runnable.code, e.title, stdin = runnable.input ?: "")
                nav.navigate(R.CODE)
            }
        }
        navButton(item, if (favorite) "★ В избранном" else "☆ В избранное", tone = Tone.OUTLINED) {
            scope.launch { favorite = withContext(Dispatchers.IO) { vm.store.toggleFavorite(e.id, e.summary.kind, e.title) } }
        }
        if (e.source != "curated") textItem(item, "Источник: ${e.source}", PyPalette.muted, small = true)
    }
}
