package com.pyolympiad.data

import android.content.Context
import android.database.sqlite.SQLiteDatabase
import org.json.JSONObject
import java.io.File
import java.util.concurrent.ConcurrentHashMap

/** Content domains: one read-only SQLite database each (see tools/build_content.py). */
enum class Domain(val key: String, val titleRu: String, val prefixes: Set<String>) {
    PYTHON("python", "Python", setOf("py")),
    LIBRARIES("libraries", "Библиотеки", setOf("lib", "ext")),
    ALGORITHMS("algorithms", "Алгоритмы", setOf("algo")),
    TASKS("tasks", "Задачи", setOf("task")),
    ERRORS("errors", "Ошибки", setOf("err")),
    TESTS("tests", "Тесты", setOf("quiz")),
    GITHUB("github", "Проекты", setOf("gh"));

    companion object {
        fun ofId(id: String): Domain? {
            val prefix = id.substringBefore(':')
            return entries.firstOrNull { prefix in it.prefixes }
        }
    }
}

data class DbInfo(val domain: Domain, val assetPath: String, val entries: Int, val size: Long, val hash: String)

/**
 * Installs the bundled knowledge databases from assets into app storage on first use and
 * opens them read-only. Large databases stay on disk; only the pages SQLite needs are read
 * into memory (lazy loading by design), and each domain is installed only when first used.
 */
class KnowledgeBase(private val context: Context) {

    private val prefs = context.getSharedPreferences("knowledge_base", Context.MODE_PRIVATE)
    private val open = ConcurrentHashMap<Domain, SQLiteDatabase>()
    private val dir: File = File(context.noBackupFilesDir, "knowledge").apply { mkdirs() }

    val manifest: List<DbInfo> by lazy { readManifest() }
    val version: String by lazy { manifestJson.optString("version", "") }
    val pythonVersion: String by lazy { manifestJson.optString("python", "") }
    val externalLibraries: List<String> by lazy {
        val arr = manifestJson.optJSONArray("external_libraries") ?: return@lazy emptyList()
        (0 until arr.length()).map { arr.getJSONObject(it).let { o -> o.optString("name") + " " + o.optString("version") } }
    }

    private val manifestJson: JSONObject by lazy {
        context.assets.open(MANIFEST).bufferedReader().use { JSONObject(it.readText()) }
    }

    private fun readManifest(): List<DbInfo> {
        val arr = manifestJson.getJSONArray("databases")
        return (0 until arr.length()).mapNotNull { i ->
            val o = arr.getJSONObject(i)
            val domain = Domain.entries.firstOrNull { it.key == o.getString("domain") } ?: return@mapNotNull null
            DbInfo(domain, o.getString("path"), o.getInt("entries"), o.getLong("size"), o.getString("hash"))
        }
    }

    fun info(domain: Domain): DbInfo? = manifest.firstOrNull { it.domain == domain }

    private fun fileOf(domain: Domain) = File(dir, domain.key + ".db")

    fun isInstalled(domain: Domain): Boolean {
        val info = info(domain) ?: return false
        val f = fileOf(domain)
        return f.exists() && prefs.getString("hash_" + domain.key, null) == info.hash
    }

    /** Copies one database from assets if missing or outdated. Thread-safe per domain. */
    fun install(domain: Domain, onProgress: (Long) -> Unit = {}) {
        synchronized(lockOf(domain)) {
            if (isInstalled(domain)) return
            val info = info(domain) ?: error("no database for $domain")
            open.remove(domain)?.close()
            val target = fileOf(domain)
            val tmp = File(dir, domain.key + ".db.tmp")
            context.assets.open(info.assetPath).use { input ->
                tmp.outputStream().buffered(1 shl 16).use { out ->
                    val buf = ByteArray(1 shl 16)
                    var total = 0L
                    while (true) {
                        val n = input.read(buf)
                        if (n < 0) break
                        out.write(buf, 0, n)
                        total += n
                        onProgress(total)
                    }
                }
            }
            if (target.exists()) target.delete()
            check(tmp.renameTo(target)) { "cannot install $domain" }
            prefs.edit().putString("hash_" + domain.key, info.hash).apply()
        }
    }

    /** Installs every database that is missing; reports overall progress 0..1. */
    fun installAll(onProgress: (Float) -> Unit = {}) {
        val pending = manifest.filter { !isInstalled(it.domain) }
        val total = pending.sumOf { it.size }.coerceAtLeast(1)
        var done = 0L
        for (info in pending) {
            install(info.domain) { copied -> onProgress(((done + copied).toFloat() / total).coerceIn(0f, 1f)) }
            done += info.size
        }
        onProgress(1f)
    }

    val needsInstall: Boolean get() = manifest.any { !isInstalled(it.domain) }

    fun db(domain: Domain): SQLiteDatabase {
        open[domain]?.let { if (it.isOpen) return it }
        install(domain)
        synchronized(lockOf(domain)) {
            open[domain]?.let { if (it.isOpen) return it }
            val db = SQLiteDatabase.openDatabase(
                fileOf(domain).path, null,
                SQLiteDatabase.OPEN_READONLY or SQLiteDatabase.NO_LOCALIZED_COLLATORS,
            )
            open[domain] = db
            return db
        }
    }

    fun close() {
        open.values.forEach { runCatching { it.close() } }
        open.clear()
    }

    /** Bytes used by installed databases. */
    val installedBytes: Long get() = Domain.entries.sumOf { fileOf(it).takeIf { f -> f.exists() }?.length() ?: 0L }

    private val locks = ConcurrentHashMap<Domain, Any>()
    private fun lockOf(d: Domain) = locks.getOrPut(d) { Any() }

    companion object {
        const val MANIFEST = "db_manifest.json"
    }
}
