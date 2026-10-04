package com.pyolympiad.watch

import android.content.Context
import com.pyolympiad.data.KnowledgeBase
import com.pyolympiad.data.KnowledgeRepository
import com.pyolympiad.data.UserStore
import com.pyolympiad.engine.Engine
import com.pyolympiad.watch.runtime.PythonRuntime

/** Simple service locator. Everything is created lazily on first use (battery/RAM friendly). */
class AppContainer(private val context: Context) {

    val engine: Engine by lazy {
        Engine.load(
            readText = { path -> runCatching { context.assets.open(path).bufferedReader().use { it.readText() } }.getOrNull() },
            listDir = { path -> context.assets.list(path)?.toList() ?: emptyList() },
        )
    }

    val knowledgeBase: KnowledgeBase by lazy { KnowledgeBase(context) }
    val repository: KnowledgeRepository by lazy { KnowledgeRepository(knowledgeBase, engine.queryExpander) }
    val userStore: UserStore by lazy { UserStore(context) }
    val python: PythonRuntime by lazy { PythonRuntime(context) }
}
