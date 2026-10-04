package com.pyolympiad.watch

import androidx.test.core.app.ApplicationProvider
import com.pyolympiad.data.Domain
import com.pyolympiad.data.KnowledgeBase
import com.pyolympiad.data.KnowledgeRepository
import com.pyolympiad.data.UserStore
import com.pyolympiad.engine.Engine
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.annotation.Config

@RunWith(RobolectricTestRunner::class)
@Config(sdk = [34])
class KnowledgeRepositoryTest {

    private val context = ApplicationProvider.getApplicationContext<android.app.Application>()
    private val engine = Engine.load(
        readText = { p -> runCatching { context.assets.open(p).bufferedReader().use { it.readText() } }.getOrNull() },
        listDir = { p -> context.assets.list(p)?.toList() ?: emptyList() },
    )
    private val kb = KnowledgeBase(context)
    private val repo = KnowledgeRepository(kb, engine.queryExpander)

    @Test
    fun installsAndBrowses() {
        kb.installAll()
        assertTrue(Domain.entries.all { kb.isInstalled(it) })
        assertTrue(repo.count(Domain.PYTHON) > 100)
        assertTrue(repo.categories(Domain.LIBRARIES).isNotEmpty())
        val sorted = repo.entry("py:builtin:sorted")
        assertNotNull(sorted)
        assertTrue(sorted!!.sections.isNotEmpty())
        val task = repo.entry("task:digits-sum")
        assertEquals(3, task!!.task!!.hints.size)
    }

    @Test
    fun searchesInSeveralLanguages() {
        kb.installAll()
        fun top(q: String) = repo.search(q).take(5).map { it.entry.id }
        println("sorted -> " + top("sorted"))
        println("сортировка -> " + top("сортировка"))
        println("sortirovka -> " + top("sortirovka"))
        println("math.isqrt -> " + top("math.isqrt"))
        println("деление на ноль -> " + top("деление на ноль"))
        println("цифры -> " + top("цифры"))
        assertTrue(top("sorted").contains("py:builtin:sorted"))
        assertTrue(top("сортировка").contains("py:builtin:sorted"))
        assertTrue(top("sortirovka").contains("py:builtin:sorted"))
        assertTrue(top("math.isqrt").contains("lib:math.isqrt"))
        assertTrue(top("деление на ноль").contains("err:ZeroDivisionError"))
    }

    @Test
    fun userStoreTracksProgress() {
        val store = UserStore(context)
        store.recordAttempt("task:digits-sum", "Цифры числа", 1, success = false)
        store.recordHint("task:digits-sum", "Цифры числа", 1, 2)
        store.recordAttempt("task:digits-sum", "Цифры числа", 1, success = true)
        store.recordQuiz("quiz:basics:001", "basics", true)
        assertTrue(store.toggleFavorite("py:builtin:sorted", "builtin", "sorted()"))
        val o = store.overview(listOf("Цифры числа", "Строки"))
        assertEquals(1, o.solvedTasks)
        assertEquals(2, o.totalAttempts)
        assertEquals(1, o.failedAttempts)
        assertEquals(2, o.hintsUsed)
        assertEquals(listOf("Строки"), o.untouched)
        assertEquals(1, o.favorites)
    }
}
