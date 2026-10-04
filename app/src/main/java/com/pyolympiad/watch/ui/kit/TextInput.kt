package com.pyolympiad.watch.ui.kit

import android.app.RemoteInput
import android.content.Intent
import android.view.inputmethod.EditorInfo
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.wear.input.RemoteInputIntentHelper
import androidx.wear.input.wearableExtender

/**
 * Launches the watch's system text input (keyboard, handwriting or voice — whatever the
 * device offers) and returns the text. Keyboard and handwriting work without a network;
 * voice input works offline only if the watch has an offline speech pack installed.
 */
class TextInputLauncher(private val launch: (String) -> Unit) {
    fun open(label: String) = launch(label)
}

private const val KEY = "text"

@Composable
fun rememberTextInput(onText: (String) -> Unit): TextInputLauncher {
    val launcher = rememberLauncherForActivityResult(ActivityResultContracts.StartActivityForResult()) { result ->
        val data: Intent = result.data ?: return@rememberLauncherForActivityResult
        val text = RemoteInput.getResultsFromIntent(data)?.getCharSequence(KEY)?.toString()
        if (!text.isNullOrBlank()) onText(text)
    }
    return remember(launcher) {
        TextInputLauncher { label ->
            val intent = RemoteInputIntentHelper.createActionRemoteInputIntent()
            val input = RemoteInput.Builder(KEY)
                .setLabel(label)
                .wearableExtender {
                    setEmojisAllowed(false)
                    setInputActionType(EditorInfo.IME_ACTION_DONE)
                }
                .build()
            RemoteInputIntentHelper.putRemoteInputsExtra(intent, listOf(input))
            launcher.launch(intent)
        }
    }
}
