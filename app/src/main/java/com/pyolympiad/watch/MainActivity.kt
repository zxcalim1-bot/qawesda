package com.pyolympiad.watch

import android.content.Intent
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.runtime.getValue
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import com.pyolympiad.watch.ui.nav.AppNav
import com.pyolympiad.watch.ui.theme.PyOlympTheme

class MainActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        // A task statement can be handed over with ACTION_SEND or, for testing, with
        // `adb shell am start -n com.pyolympiad.watch/.MainActivity --es task "..."`.
        // It is consumed only on the first creation so a configuration change does not re-solve it.
        val initialText = if (savedInstanceState == null) sharedText(intent) else null
        setContent {
            val vm: AppViewModel = viewModel()
            val settings by vm.settings.collectAsStateWithLifecycle()
            PyOlympTheme(textScale = settings.textScale) {
                AppNav(vm, initialText)
            }
        }
    }

    private fun sharedText(intent: Intent?): String? {
        intent ?: return null
        val text = intent.getStringExtra(EXTRA_TASK)
            ?: if (intent.action == Intent.ACTION_SEND) intent.getCharSequenceExtra(Intent.EXTRA_TEXT)?.toString() else null
        return text?.trim()?.takeIf { it.isNotEmpty() }
    }

    companion object {
        const val EXTRA_TASK = "task"
    }
}
