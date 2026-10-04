package com.pyolympiad.watch.ui.kit

import androidx.compose.foundation.background
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.semantics.heading
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.wear.compose.foundation.lazy.TransformingLazyColumn
import androidx.wear.compose.foundation.lazy.TransformingLazyColumnScope
import androidx.wear.compose.foundation.lazy.rememberTransformingLazyColumnState
import androidx.wear.compose.material3.Button
import androidx.wear.compose.material3.ButtonDefaults
import androidx.wear.compose.material3.Card
import androidx.wear.compose.material3.CardDefaults
import androidx.wear.compose.material3.CircularProgressIndicator
import androidx.wear.compose.material3.EdgeButton
import androidx.wear.compose.material3.FilledTonalButton
import androidx.wear.compose.material3.ListHeader
import androidx.wear.compose.material3.MaterialTheme
import androidx.wear.compose.material3.OutlinedButton
import androidx.wear.compose.material3.ScreenScaffold
import androidx.wear.compose.material3.SurfaceTransformation
import androidx.wear.compose.material3.Text
import androidx.wear.compose.material3.lazy.rememberTransformationSpec
import androidx.wear.compose.material3.lazy.transformedHeight
import com.pyolympiad.data.Block
import com.pyolympiad.data.Section
import com.pyolympiad.watch.ui.theme.PyPalette

/**
 * A scrollable watch screen: TransformingLazyColumn inside ScreenScaffold, so items scale
 * and fade at the round edges, the scroll indicator follows the bezel, the time text stays
 * on top and the rotary crown/bezel scrolls the list.
 */
@Composable
fun ScreenList(
    edgeButton: (@Composable () -> Unit)? = null,
    content: TransformingLazyColumnScope.(Item) -> Unit,
) {
    val state = rememberTransformingLazyColumnState()
    val spec = rememberTransformationSpec()
    val item = Item(spec)
    if (edgeButton != null) {
        ScreenScaffold(scrollState = state, edgeButton = { edgeButton() }) { padding ->
            TransformingLazyColumn(state = state, contentPadding = padding) { content(item) }
        }
    } else {
        ScreenScaffold(scrollState = state) { padding ->
            TransformingLazyColumn(state = state, contentPadding = padding) { content(item) }
        }
    }
}

/** Holder for the transformation spec used by list items. */
class Item(val spec: androidx.wear.compose.material3.lazy.TransformationSpec)

/** Adds a standard header item. */
fun TransformingLazyColumnScope.header(item: Item, text: String) {
    item {
        ListHeader(
            modifier = Modifier.fillMaxWidth().transformedHeight(this, item.spec).semantics { heading() },
            transformation = SurfaceTransformation(item.spec),
        ) {
            Text(text, textAlign = TextAlign.Center, maxLines = 3, overflow = TextOverflow.Ellipsis)
        }
    }
}

enum class Tone { PRIMARY, TONAL, OUTLINED, SECONDARY, TERTIARY }

/** A full-width list button with an optional secondary line. */
fun TransformingLazyColumnScope.navButton(
    item: Item,
    label: String,
    secondary: String? = null,
    tone: Tone = Tone.TONAL,
    enabled: Boolean = true,
    key: Any? = null,
    onClick: () -> Unit,
) {
    item(key = key) {
        WideButton(label, secondary, tone, enabled, Modifier.fillMaxWidth().transformedHeight(this, item.spec), SurfaceTransformation(item.spec), onClick)
    }
}

@Composable
fun WideButton(
    label: String,
    secondary: String? = null,
    tone: Tone = Tone.TONAL,
    enabled: Boolean = true,
    modifier: Modifier = Modifier.fillMaxWidth(),
    transformation: SurfaceTransformation? = null,
    onClick: () -> Unit,
) {
    val labelContent: @Composable androidx.compose.foundation.layout.RowScope.() -> Unit = {
        Text(label, maxLines = 3, overflow = TextOverflow.Ellipsis)
    }
    val secondaryContent: (@Composable androidx.compose.foundation.layout.RowScope.() -> Unit)? =
        secondary?.let { s -> { Text(s, maxLines = 3, overflow = TextOverflow.Ellipsis) } }
    when (tone) {
        Tone.PRIMARY -> Button(onClick = onClick, modifier = modifier, enabled = enabled, secondaryLabel = secondaryContent, transformation = transformation, label = labelContent)
        Tone.SECONDARY -> Button(onClick = onClick, modifier = modifier, enabled = enabled, secondaryLabel = secondaryContent, transformation = transformation,
            colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.secondaryContainer, contentColor = MaterialTheme.colorScheme.onSecondaryContainer,
                secondaryContentColor = MaterialTheme.colorScheme.onSecondaryContainer), label = labelContent)
        Tone.TERTIARY -> Button(onClick = onClick, modifier = modifier, enabled = enabled, secondaryLabel = secondaryContent, transformation = transformation,
            colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.tertiaryContainer, contentColor = MaterialTheme.colorScheme.onTertiaryContainer,
                secondaryContentColor = MaterialTheme.colorScheme.onTertiaryContainer), label = labelContent)
        Tone.TONAL -> FilledTonalButton(onClick = onClick, modifier = modifier, enabled = enabled, secondaryLabel = secondaryContent, transformation = transformation, label = labelContent)
        Tone.OUTLINED -> OutlinedButton(onClick = onClick, modifier = modifier, enabled = enabled, secondaryLabel = secondaryContent, transformation = transformation, label = labelContent)
    }
}

/** Plain text item (paragraph). */
fun TransformingLazyColumnScope.textItem(
    item: Item,
    text: String,
    color: Color? = null,
    bold: Boolean = false,
    center: Boolean = false,
    small: Boolean = false,
) {
    if (text.isBlank()) return
    item {
        Text(
            text,
            modifier = Modifier.fillMaxWidth().padding(horizontal = 6.dp).transformedHeight(this, item.spec),
            color = color ?: MaterialTheme.colorScheme.onBackground,
            fontWeight = if (bold) FontWeight.SemiBold else null,
            textAlign = if (center) TextAlign.Center else TextAlign.Start,
            style = if (small) MaterialTheme.typography.bodySmall else MaterialTheme.typography.bodyMedium,
        )
    }
}

/** A card with a title and free text (non-clickable look). */
fun TransformingLazyColumnScope.infoCard(
    item: Item,
    title: String?,
    text: String,
    accent: Color? = null,
    onClick: (() -> Unit)? = null,
) {
    if (text.isBlank() && title == null) return
    item {
        Card(
            onClick = onClick ?: {},
            enabled = onClick != null,
            modifier = Modifier.fillMaxWidth().transformedHeight(this, item.spec),
            transformation = SurfaceTransformation(item.spec),
            colors = CardDefaults.cardColors(),
        ) {
            if (title != null) Text(title, color = accent ?: MaterialTheme.colorScheme.primary, style = MaterialTheme.typography.labelMedium)
            if (text.isNotBlank()) Text(text, style = MaterialTheme.typography.bodySmall)
        }
    }
}

/** Monospace code block, scrollable horizontally so long lines are never cut. */
@Composable
fun CodeView(code: String, modifier: Modifier = Modifier, color: Color = PyPalette.codeText, background: Color = PyPalette.codeBackground, numbered: Boolean = false) {
    val lines = code.trimEnd('\n').split('\n')
    val text = if (numbered) lines.mapIndexed { i, l -> "${(i + 1).toString().padStart(2)}│$l" }.joinToString("\n") else lines.joinToString("\n")
    Box(
        modifier
            .fillMaxWidth()
            .background(background, RoundedCornerShape(12.dp))
            .padding(horizontal = 8.dp, vertical = 6.dp)
            .horizontalScroll(rememberScrollState()),
    ) {
        Text(text, fontFamily = FontFamily.Monospace, fontSize = 11.sp, lineHeight = 14.sp, color = color, softWrap = false)
    }
}

fun TransformingLazyColumnScope.codeItem(item: Item, code: String, label: String? = null, color: Color = PyPalette.codeText, numbered: Boolean = false) {
    if (code.isBlank()) return
    item {
        Column(Modifier.fillMaxWidth().transformedHeight(this, item.spec)) {
            if (label != null) Text(label, style = MaterialTheme.typography.labelSmall, color = PyPalette.muted, modifier = Modifier.padding(start = 8.dp, bottom = 2.dp))
            CodeView(code, color = color, numbered = numbered)
        }
    }
}

/** Renders knowledge-base sections (paragraphs, bullet lists, code with real output). */
fun TransformingLazyColumnScope.sectionsItems(item: Item, sections: List<Section>) {
    for (s in sections) {
        if (s.blocks.isEmpty()) continue
        header(item, s.heading)
        for (b in s.blocks) {
            when (b) {
                is Block.Paragraph -> textItem(item, b.text)
                is Block.Bullets -> textItem(item, b.items.joinToString("\n") { "• $it" })
                is Block.Code -> {
                    codeItem(item, b.code, if (b.lang == "python") null else null)
                    b.input?.let { codeItem(item, it, "Ввод:", PyPalette.muted) }
                    b.output?.let { codeItem(item, it, "Вывод:", PyPalette.output) }
                    b.error?.let { codeItem(item, it, "Ошибка:", PyPalette.error) }
                }
            }
        }
    }
}

@Composable
fun LoadingScreen(text: String = "Загрузка…", progress: Float? = null) {
    Box(Modifier.fillMaxSize().padding(24.dp), contentAlignment = Alignment.Center) {
        Column(horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(10.dp)) {
            if (progress != null) CircularProgressIndicator(progress = { progress }) else CircularProgressIndicator()
            Text(text, textAlign = TextAlign.Center, style = MaterialTheme.typography.bodySmall)
        }
    }
}

/** A row of small labelled values ("Время O(n) · Память O(1)"). */
@Composable
fun MetaRow(vararg pairs: Pair<String, String>) {
    Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
        pairs.forEach { (k, v) -> Text("$k: $v", style = MaterialTheme.typography.labelSmall, color = PyPalette.muted) }
    }
}

@Composable
fun BottomAction(label: String, onClick: () -> Unit) {
    EdgeButton(onClick = onClick) { Text(label) }
}

fun levelTitle(level: Int): String = when (level) {
    1 -> "Beginner"; 2 -> "Easy"; 3 -> "Medium"; 4 -> "Hard"; 5 -> "Very Hard"; 6 -> "Olympiad"; else -> ""
}

fun kindTitle(kind: String): String = when (kind) {
    "builtin" -> "Встроенная функция"; "keyword" -> "Ключевое слово"; "operator" -> "Оператор"; "method" -> "Метод"
    "topic" -> "Статья"; "exception" -> "Исключение"; "cpython" -> "CPython"; "langref" -> "Справочник языка"
    "module" -> "Модуль"; "member" -> "Функция/класс модуля"; "extlib" -> "Внешняя библиотека"; "extmember" -> "API библиотеки"
    "algorithm" -> "Алгоритм"; "task" -> "Задача"; "error" -> "Ошибка"; "quiz" -> "Вопрос теста"; "project" -> "Проект"
    else -> kind
}
