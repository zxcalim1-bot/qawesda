package com.pyolympiad.watch.ui.theme

import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.unit.Density
import androidx.wear.compose.material3.ColorScheme
import androidx.wear.compose.material3.MaterialTheme

/** Python-inspired palette (blue + yellow) tuned for OLED watch screens (true black background). */
val PyColors = ColorScheme(
    primary = Color(0xFF9CC3F5),
    primaryDim = Color(0xFF7FA9DE),
    primaryContainer = Color(0xFF1F4466),
    onPrimary = Color(0xFF0B2338),
    onPrimaryContainer = Color(0xFFD6E6FB),
    secondary = Color(0xFFFFD866),
    secondaryDim = Color(0xFFE5BE4E),
    secondaryContainer = Color(0xFF4A3D10),
    onSecondary = Color(0xFF2A2100),
    onSecondaryContainer = Color(0xFFFFEFB8),
    tertiary = Color(0xFF8FD9B6),
    tertiaryDim = Color(0xFF74BF9C),
    tertiaryContainer = Color(0xFF1C4A38),
    onTertiary = Color(0xFF00281A),
    onTertiaryContainer = Color(0xFFC9F2DD),
    background = Color.Black,
    onBackground = Color(0xFFE6E8EC),
)

object PyPalette {
    val codeBackground = Color(0xFF15191F)
    val codeText = Color(0xFFE3E7EE)
    val output = Color(0xFF8FD9B6)
    val error = Color(0xFFFF8A80)
    val warning = Color(0xFFFFD866)
    val info = Color(0xFF9CC3F5)
    val muted = Color(0xFFA7AEB8)
    val success = Color(0xFF8FD9B6)
}

/** User-selected text size multiplier (Settings → Размер шрифта). */
val LocalTextScale = staticCompositionLocalOf { 1f }

@Composable
fun PyOlympTheme(textScale: Float = 1f, content: @Composable () -> Unit) {
    val density = LocalDensity.current
    CompositionLocalProvider(
        LocalDensity provides Density(density.density, density.fontScale * textScale),
        LocalTextScale provides textScale,
    ) {
        MaterialTheme(colorScheme = PyColors, content = content)
    }
}
