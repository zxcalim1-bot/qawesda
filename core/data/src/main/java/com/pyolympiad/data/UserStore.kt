package com.pyolympiad.data

import android.content.ContentValues
import android.content.Context
import android.database.sqlite.SQLiteDatabase
import android.database.sqlite.SQLiteOpenHelper

/** Status of a task for the current user. */
enum class TaskStatus(val code: Int, val titleRu: String) {
    NONE(0, "не начата"), ATTEMPTED(1, "есть попытки"), SOLVED(2, "решена"), VIEWED_SOLUTION(3, "решение просмотрено");

    companion object {
        fun of(code: Int) = entries.firstOrNull { it.code == code } ?: NONE
    }
}

data class TaskProgress(
    val taskId: String,
    val topic: String,
    val level: Int,
    val status: TaskStatus,
    val attempts: Int,
    val failedAttempts: Int,
    val hintsUsed: Int,
)

data class Favorite(val id: String, val kind: String, val title: String, val addedAt: Long)

data class TopicStat(val topic: String, val attempts: Int, val successes: Int) {
    val accuracy: Double get() = if (attempts == 0) 0.0 else successes.toDouble() / attempts
}

data class TrainingSession(
    val id: Long,
    val kind: String,
    val size: Int,
    val items: List<String>,
    val position: Int,
    val correct: Int,
    val startedAt: Long,
    val finishedAt: Long?,
)

data class Overview(
    val xp: Int,
    val level: Int,
    val levelTitle: String,
    val nextLevelXp: Int,
    val solvedTasks: Int,
    val attemptedTasks: Int,
    val totalAttempts: Int,
    val failedAttempts: Int,
    val hintsUsed: Int,
    val quizAnswered: Int,
    val quizCorrect: Int,
    val topicsStudied: Int,
    val favorites: Int,
    val strong: List<TopicStat>,
    val weak: List<TopicStat>,
    val untouched: List<String>,
)

/**
 * Local user data: progress, attempts, hints, quiz answers, studied topics, favorites,
 * training sessions, history, settings and saved code. Stored only on the watch.
 */
class UserStore(context: Context) : SQLiteOpenHelper(context, "user.db", null, 1) {

    override fun onCreate(db: SQLiteDatabase) {
        db.execSQL("CREATE TABLE favorite(id TEXT PRIMARY KEY, kind TEXT NOT NULL, title TEXT NOT NULL, added INTEGER NOT NULL)")
        db.execSQL(
            "CREATE TABLE task_progress(task_id TEXT PRIMARY KEY, topic TEXT NOT NULL, level INTEGER NOT NULL, status INTEGER NOT NULL, " +
                "attempts INTEGER NOT NULL DEFAULT 0, failed INTEGER NOT NULL DEFAULT 0, hints INTEGER NOT NULL DEFAULT 0, " +
                "solved_at INTEGER, last_at INTEGER NOT NULL)",
        )
        db.execSQL("CREATE TABLE quiz_answer(id INTEGER PRIMARY KEY AUTOINCREMENT, quiz_id TEXT NOT NULL, category TEXT NOT NULL, correct INTEGER NOT NULL, at INTEGER NOT NULL)")
        db.execSQL("CREATE TABLE studied(entry_id TEXT PRIMARY KEY, kind TEXT NOT NULL, category TEXT NOT NULL, views INTEGER NOT NULL, last_at INTEGER NOT NULL)")
        db.execSQL(
            "CREATE TABLE session(id INTEGER PRIMARY KEY AUTOINCREMENT, kind TEXT NOT NULL, size INTEGER NOT NULL, items TEXT NOT NULL, " +
                "position INTEGER NOT NULL DEFAULT 0, correct INTEGER NOT NULL DEFAULT 0, started INTEGER NOT NULL, finished INTEGER)",
        )
        db.execSQL("CREATE TABLE history(id INTEGER PRIMARY KEY AUTOINCREMENT, kind TEXT NOT NULL, text TEXT NOT NULL, at INTEGER NOT NULL)")
        db.execSQL("CREATE TABLE setting(key TEXT PRIMARY KEY, value TEXT NOT NULL)")
        db.execSQL("CREATE TABLE snippet(id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, code TEXT NOT NULL, updated INTEGER NOT NULL)")
    }

    override fun onUpgrade(db: SQLiteDatabase, oldVersion: Int, newVersion: Int) {}

    private val now: Long get() = System.currentTimeMillis()

    // ------------------------------------------------------------------ favorites

    fun isFavorite(id: String): Boolean =
        readableDatabase.rawQuery("SELECT 1 FROM favorite WHERE id = ?", arrayOf(id)).use { it.moveToFirst() }

    fun toggleFavorite(id: String, kind: String, title: String): Boolean {
        val db = writableDatabase
        return if (isFavorite(id)) {
            db.delete("favorite", "id = ?", arrayOf(id)); false
        } else {
            db.insertWithOnConflict("favorite", null, ContentValues().apply {
                put("id", id); put("kind", kind); put("title", title); put("added", now)
            }, SQLiteDatabase.CONFLICT_REPLACE)
            true
        }
    }

    fun favorites(): List<Favorite> = readableDatabase.rawQuery("SELECT id, kind, title, added FROM favorite ORDER BY added DESC", null).use { c ->
        val out = ArrayList<Favorite>()
        while (c.moveToNext()) out += Favorite(c.getString(0), c.getString(1), c.getString(2), c.getLong(3))
        out
    }

    // ------------------------------------------------------------------ tasks

    fun taskProgress(taskId: String): TaskProgress? =
        readableDatabase.rawQuery("SELECT task_id, topic, level, status, attempts, failed, hints FROM task_progress WHERE task_id = ?", arrayOf(taskId)).use { c ->
            if (!c.moveToFirst()) null else TaskProgress(c.getString(0), c.getString(1), c.getInt(2), TaskStatus.of(c.getInt(3)), c.getInt(4), c.getInt(5), c.getInt(6))
        }

    private fun upsertTask(taskId: String, topic: String, level: Int, update: (TaskProgress) -> TaskProgress) {
        val cur = taskProgress(taskId) ?: TaskProgress(taskId, topic, level, TaskStatus.NONE, 0, 0, 0)
        val next = update(cur)
        writableDatabase.insertWithOnConflict("task_progress", null, ContentValues().apply {
            put("task_id", taskId); put("topic", topic); put("level", level); put("status", next.status.code)
            put("attempts", next.attempts); put("failed", next.failedAttempts); put("hints", next.hintsUsed)
            if (next.status == TaskStatus.SOLVED && cur.status != TaskStatus.SOLVED) put("solved_at", now)
            put("last_at", now)
        }, SQLiteDatabase.CONFLICT_REPLACE)
    }

    fun recordAttempt(taskId: String, topic: String, level: Int, success: Boolean) = upsertTask(taskId, topic, level) {
        it.copy(
            attempts = it.attempts + 1,
            failedAttempts = it.failedAttempts + if (success) 0 else 1,
            status = if (success) TaskStatus.SOLVED else if (it.status == TaskStatus.NONE) TaskStatus.ATTEMPTED else it.status,
        )
    }

    fun recordHint(taskId: String, topic: String, level: Int, hintNumber: Int) = upsertTask(taskId, topic, level) {
        it.copy(hintsUsed = maxOf(it.hintsUsed, hintNumber), status = if (it.status == TaskStatus.NONE) TaskStatus.ATTEMPTED else it.status)
    }

    fun recordSolutionViewed(taskId: String, topic: String, level: Int) = upsertTask(taskId, topic, level) {
        it.copy(status = if (it.status == TaskStatus.SOLVED) it.status else TaskStatus.VIEWED_SOLUTION)
    }

    fun markSolved(taskId: String, topic: String, level: Int) = upsertTask(taskId, topic, level) {
        it.copy(status = TaskStatus.SOLVED, attempts = maxOf(1, it.attempts))
    }

    fun solvedTaskIds(): Set<String> = readableDatabase.rawQuery("SELECT task_id FROM task_progress WHERE status = 2", null).use { c ->
        val out = HashSet<String>()
        while (c.moveToNext()) out += c.getString(0)
        out
    }

    fun touchedTaskIds(): Set<String> = readableDatabase.rawQuery("SELECT task_id FROM task_progress", null).use { c ->
        val out = HashSet<String>()
        while (c.moveToNext()) out += c.getString(0)
        out
    }

    // ------------------------------------------------------------------ quizzes and studied topics

    fun recordQuiz(quizId: String, category: String, correct: Boolean) {
        writableDatabase.insert("quiz_answer", null, ContentValues().apply {
            put("quiz_id", quizId); put("category", category); put("correct", if (correct) 1 else 0); put("at", now)
        })
    }

    fun recordStudied(id: String, kind: String, category: String) {
        writableDatabase.execSQL(
            "INSERT INTO studied(entry_id, kind, category, views, last_at) VALUES (?, ?, ?, 1, ?) " +
                "ON CONFLICT(entry_id) DO UPDATE SET views = views + 1, last_at = excluded.last_at",
            arrayOf(id, kind, category, now),
        )
    }

    fun studiedCount(): Int = readableDatabase.rawQuery("SELECT COUNT(*) FROM studied", null).use { if (it.moveToFirst()) it.getInt(0) else 0 }

    fun recentlyStudied(limit: Int = 20): List<Triple<String, String, String>> =
        readableDatabase.rawQuery("SELECT entry_id, kind, category FROM studied ORDER BY last_at DESC LIMIT $limit", null).use { c ->
            val out = ArrayList<Triple<String, String, String>>()
            while (c.moveToNext()) out += Triple(c.getString(0), c.getString(1), c.getString(2))
            out
        }

    // ------------------------------------------------------------------ sessions (training mode, tests)

    fun startSession(kind: String, items: List<String>): Long = writableDatabase.insert("session", null, ContentValues().apply {
        put("kind", kind); put("size", items.size); put("items", items.joinToString("\n")); put("started", now)
    })

    fun session(id: Long): TrainingSession? =
        readableDatabase.rawQuery("SELECT id, kind, size, items, position, correct, started, finished FROM session WHERE id = ?", arrayOf(id.toString())).use { c ->
            if (!c.moveToFirst()) null else TrainingSession(
                c.getLong(0), c.getString(1), c.getInt(2), c.getString(3).split("\n").filter { it.isNotEmpty() },
                c.getInt(4), c.getInt(5), c.getLong(6), if (c.isNull(7)) null else c.getLong(7),
            )
        }

    fun activeSession(kind: String): TrainingSession? =
        readableDatabase.rawQuery("SELECT id FROM session WHERE kind = ? AND finished IS NULL ORDER BY started DESC LIMIT 1", arrayOf(kind)).use { c ->
            if (c.moveToFirst()) session(c.getLong(0)) else null
        }

    fun advanceSession(id: Long, correct: Boolean) {
        writableDatabase.execSQL("UPDATE session SET position = position + 1, correct = correct + ? WHERE id = ?", arrayOf(if (correct) 1 else 0, id))
        session(id)?.let { s -> if (s.position >= s.size) finishSession(id) }
    }

    fun finishSession(id: Long) {
        writableDatabase.execSQL("UPDATE session SET finished = ? WHERE id = ? AND finished IS NULL", arrayOf(now, id))
    }

    fun sessions(kind: String, limit: Int = 10): List<TrainingSession> =
        readableDatabase.rawQuery("SELECT id FROM session WHERE kind = ? ORDER BY started DESC LIMIT $limit", arrayOf(kind)).use { c ->
            val ids = ArrayList<Long>()
            while (c.moveToNext()) ids += c.getLong(0)
            ids.mapNotNull { session(it) }
        }

    // ------------------------------------------------------------------ history, settings, snippets

    fun addHistory(kind: String, text: String) {
        val db = writableDatabase
        db.delete("history", "kind = ? AND text = ?", arrayOf(kind, text))
        db.insert("history", null, ContentValues().apply { put("kind", kind); put("text", text); put("at", now) })
        db.execSQL("DELETE FROM history WHERE kind = ? AND id NOT IN (SELECT id FROM history WHERE kind = ? ORDER BY at DESC LIMIT 30)", arrayOf(kind, kind))
    }

    fun history(kind: String, limit: Int = 10): List<String> =
        readableDatabase.rawQuery("SELECT text FROM history WHERE kind = ? ORDER BY at DESC LIMIT $limit", arrayOf(kind)).use { c ->
            val out = ArrayList<String>()
            while (c.moveToNext()) out += c.getString(0)
            out
        }

    fun setting(key: String, default: String): String =
        readableDatabase.rawQuery("SELECT value FROM setting WHERE key = ?", arrayOf(key)).use { if (it.moveToFirst()) it.getString(0) else default }

    fun setSetting(key: String, value: String) {
        writableDatabase.insertWithOnConflict("setting", null, ContentValues().apply { put("key", key); put("value", value) }, SQLiteDatabase.CONFLICT_REPLACE)
    }

    fun saveSnippet(id: Long?, title: String, code: String): Long {
        val v = ContentValues().apply { put("title", title); put("code", code); put("updated", now) }
        return if (id == null) writableDatabase.insert("snippet", null, v) else { writableDatabase.update("snippet", v, "id = ?", arrayOf(id.toString())); id }
    }

    fun snippets(): List<Triple<Long, String, String>> =
        readableDatabase.rawQuery("SELECT id, title, code FROM snippet ORDER BY updated DESC", null).use { c ->
            val out = ArrayList<Triple<Long, String, String>>()
            while (c.moveToNext()) out += Triple(c.getLong(0), c.getString(1), c.getString(2))
            out
        }

    fun deleteSnippet(id: Long) { writableDatabase.delete("snippet", "id = ?", arrayOf(id.toString())) }

    fun resetProgress() {
        val db = writableDatabase
        for (t in listOf("task_progress", "quiz_answer", "studied", "session", "history")) db.delete(t, null, null)
    }

    // ------------------------------------------------------------------ statistics

    fun topicStats(): List<TopicStat> {
        val stats = HashMap<String, IntArray>()
        readableDatabase.rawQuery("SELECT topic, attempts, failed, status FROM task_progress", null).use { c ->
            while (c.moveToNext()) {
                val s = stats.getOrPut(c.getString(0)) { IntArray(2) }
                val attempts = maxOf(1, c.getInt(1))
                s[0] += attempts
                s[1] += if (c.getInt(3) == TaskStatus.SOLVED.code) maxOf(1, attempts - c.getInt(2)) else 0
            }
        }
        readableDatabase.rawQuery("SELECT category, COUNT(*), SUM(correct) FROM quiz_answer GROUP BY category", null).use { c ->
            while (c.moveToNext()) {
                val s = stats.getOrPut(QUIZ_TOPICS[c.getString(0)] ?: c.getString(0)) { IntArray(2) }
                s[0] += c.getInt(1)
                s[1] += c.getInt(2)
            }
        }
        return stats.map { (k, v) -> TopicStat(k, v[0], v[1]) }
    }

    fun overview(allTopics: List<String>): Overview {
        val db = readableDatabase
        var solved = 0
        var attempted = 0
        var attempts = 0
        var failed = 0
        var hints = 0
        var xp = 0
        db.rawQuery("SELECT status, attempts, failed, hints, level FROM task_progress", null).use { c ->
            while (c.moveToNext()) {
                attempted++
                attempts += c.getInt(1)
                failed += c.getInt(2)
                hints += c.getInt(3)
                if (c.getInt(0) == TaskStatus.SOLVED.code) {
                    solved++
                    xp += 10 * maxOf(1, c.getInt(4)) - 2 * c.getInt(3)
                }
            }
        }
        val (qa, qc) = db.rawQuery("SELECT COUNT(*), COALESCE(SUM(correct), 0) FROM quiz_answer", null).use { c ->
            if (c.moveToFirst()) c.getInt(0) to c.getInt(1) else 0 to 0
        }
        xp += qc * 3
        val studied = studiedCount()
        xp += studied
        xp = maxOf(0, xp)
        val (lvl, title, next) = levelFor(xp)
        val stats = topicStats()
        val strong = stats.filter { it.attempts >= 3 && it.accuracy >= 0.8 }.sortedByDescending { it.accuracy }
        val weak = stats.filter { it.attempts >= 2 && it.accuracy < 0.5 }.sortedBy { it.accuracy }
        val touched = stats.map { it.topic }.toSet()
        return Overview(
            xp = xp, level = lvl, levelTitle = title, nextLevelXp = next, solvedTasks = solved, attemptedTasks = attempted,
            totalAttempts = attempts, failedAttempts = failed, hintsUsed = hints, quizAnswered = qa, quizCorrect = qc,
            topicsStudied = studied, favorites = favorites().size, strong = strong, weak = weak,
            untouched = allTopics.filter { it !in touched },
        )
    }

    companion object {
        val LEVELS = listOf(
            0 to "Новичок", 50 to "Ученик", 150 to "Практик", 350 to "Знаток Python", 700 to "Олимпиадник",
            1200 to "Эксперт", 2000 to "Мастер", 3500 to "Гроссмейстер",
        )

        fun levelFor(xp: Int): Triple<Int, String, Int> {
            var idx = 0
            for ((i, l) in LEVELS.withIndex()) if (xp >= l.first) idx = i
            val next = LEVELS.getOrNull(idx + 1)?.first ?: LEVELS.last().first
            return Triple(idx + 1, LEVELS[idx].second, next)
        }

        val QUIZ_TOPICS = mapOf(
            "basics" to "Основы Python", "syntax" to "Синтаксис", "output" to "Вывод программ",
            "algorithms" to "Алгоритмы", "ds" to "Структуры данных", "olympiad" to "Олимпиадные темы",
        )
    }
}
