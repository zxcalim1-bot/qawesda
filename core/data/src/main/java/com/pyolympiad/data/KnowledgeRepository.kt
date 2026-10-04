package com.pyolympiad.data

import android.database.Cursor
import com.pyolympiad.engine.search.QueryExpander
import com.pyolympiad.engine.text.TextNormalizer
import java.nio.ByteBuffer
import java.nio.ByteOrder
import kotlin.math.ln

/**
 * Read access to the knowledge databases: browsing, entry details with cross-domain links,
 * and ranked multilingual full-text search.
 */
class KnowledgeRepository(private val kb: KnowledgeBase, private val expander: QueryExpander) {

    private val cache = object : LinkedHashMap<String, Entry>(32, 0.75f, true) {
        override fun removeEldestEntry(eldest: MutableMap.MutableEntry<String, Entry>?) = size > 48
    }

    private fun Cursor.summary(): EntrySummary = EntrySummary(
        id = getString(0), kind = getString(1), category = getString(2), title = getString(3),
        summary = getString(4), level = getInt(5), lang = getString(6),
    )

    private val summaryCols = "id, kind, category, title, summary, level, lang"

    fun categories(domain: Domain, kind: String? = null): List<Category> {
        val db = kb.db(domain)
        val sql = if (kind == null) "SELECT kind, name, count FROM category ORDER BY sort_key"
        else "SELECT kind, name, count FROM category WHERE kind = ? ORDER BY sort_key"
        db.rawQuery(sql, kind?.let { arrayOf(it) }).use { c ->
            val out = ArrayList<Category>()
            while (c.moveToNext()) out += Category(c.getString(0), c.getString(1), c.getInt(2))
            return out
        }
    }

    fun list(domain: Domain, kind: String? = null, category: String? = null, offset: Int = 0, limit: Int = 200, level: Int? = null): List<EntrySummary> {
        val where = ArrayList<String>()
        val args = ArrayList<String>()
        kind?.let { where += "kind = ?"; args += it }
        category?.let { where += "category = ?"; args += it }
        level?.let { where += "level = ?"; args += it.toString() }
        val sql = "SELECT $summaryCols FROM entry" + (if (where.isEmpty()) "" else " WHERE " + where.joinToString(" AND ")) +
            " ORDER BY sort_key, title LIMIT $limit OFFSET $offset"
        kb.db(domain).rawQuery(sql, args.toTypedArray()).use { c ->
            val out = ArrayList<EntrySummary>()
            while (c.moveToNext()) out += c.summary()
            return out
        }
    }

    fun count(domain: Domain, kind: String? = null): Int {
        val sql = if (kind == null) "SELECT COUNT(*) FROM entry" else "SELECT COUNT(*) FROM entry WHERE kind = ?"
        kb.db(domain).rawQuery(sql, kind?.let { arrayOf(it) }).use { c -> return if (c.moveToFirst()) c.getInt(0) else 0 }
    }

    fun summary(id: String): EntrySummary? {
        val domain = Domain.ofId(id) ?: return null
        kb.db(domain).rawQuery("SELECT $summaryCols FROM entry WHERE id = ?", arrayOf(id)).use { c ->
            return if (c.moveToFirst()) c.summary() else null
        }
    }

    fun exists(id: String): Boolean = summary(id) != null

    fun entry(id: String): Entry? {
        synchronized(cache) { cache[id]?.let { return it } }
        val domain = Domain.ofId(id) ?: return null
        val db = kb.db(domain)
        val (summary, source, data) = db.rawQuery("SELECT $summaryCols, source, data FROM entry WHERE id = ?", arrayOf(id)).use { c ->
            if (!c.moveToFirst()) return null
            Triple(c.summary(), c.getString(7), c.getString(8))
        }
        val relatedIds = db.rawQuery("SELECT dst FROM relation WHERE src = ?", arrayOf(id)).use { c ->
            val out = ArrayList<String>()
            while (c.moveToNext()) out += c.getString(0)
            out
        }
        val related = relatedIds.mapNotNull { runCatching { summary(it) }.getOrNull() }
        // Back-links from every installed domain (cheap: indexed by dst).
        val backlinks = ArrayList<EntrySummary>()
        for (d in Domain.entries) {
            if (!kb.isInstalled(d) && d != domain) continue
            kb.db(d).rawQuery(
                "SELECT $summaryCols FROM entry WHERE id IN (SELECT src FROM relation WHERE dst = ?) LIMIT 30", arrayOf(id),
            ).use { c -> while (c.moveToNext()) backlinks += c.summary() }
        }
        val entry = EntryParser.parse(summary, source, data, related, backlinks.filter { b -> related.none { it.id == b.id } })
        synchronized(cache) { cache[id] = entry }
        return entry
    }

    fun randomEntry(domain: Domain, kind: String, level: Int? = null, exclude: Set<String> = emptySet()): EntrySummary? {
        val where = if (level != null) "kind = ? AND level = ?" else "kind = ?"
        val args = if (level != null) arrayOf(kind, level.toString()) else arrayOf(kind)
        kb.db(domain).rawQuery("SELECT $summaryCols FROM entry WHERE $where ORDER BY RANDOM() LIMIT 20", args).use { c ->
            val list = ArrayList<EntrySummary>()
            while (c.moveToNext()) list += c.summary()
            return list.firstOrNull { it.id !in exclude } ?: list.firstOrNull()
        }
    }

    fun randomSample(domain: Domain, kind: String, count: Int, category: String? = null): List<EntrySummary> {
        val where = if (category != null) "kind = ? AND category = ?" else "kind = ?"
        val args = if (category != null) arrayOf(kind, category) else arrayOf(kind)
        kb.db(domain).rawQuery("SELECT $summaryCols FROM entry WHERE $where ORDER BY RANDOM() LIMIT $count", args).use { c ->
            val list = ArrayList<EntrySummary>()
            while (c.moveToNext()) list += c.summary()
            return list
        }
    }

    // ------------------------------------------------------------------ search

    /**
     * Multilingual ranked search. Each query word becomes an OR-group of alternatives
     * (original, stem, translit, skeleton, synonyms) — run as a separate FTS query; documents
     * are ranked by matched groups and a BM25-like score from matchinfo('pcnx').
     */
    fun search(query: String, domains: Collection<Domain> = Domain.entries, limit: Int = 60): List<SearchHit> {
        val groups = expander.expand(query)
        if (groups.isEmpty()) return emptyList()
        val normalizedQuery = TextNormalizer.normalize(query)
        // One idf scale for all domains, so small curated databases are not penalised.
        val globalN = kb.manifest.sumOf { it.entries }.coerceAtLeast(1)
        val hits = ArrayList<SearchHit>()
        for (domain in domains) {
            val db = kb.db(domain)
            val scores = HashMap<Long, Double>()
            val matchedGroups = HashMap<Long, Int>()
            for (g in groups) {
                val seen = HashSet<Long>()
                runCatching {
                    db.rawQuery(
                        "SELECT docid, matchinfo(entry_fts, 'pcnx') FROM entry_fts WHERE entry_fts MATCH ? LIMIT 4000",
                        arrayOf(g.matchExpression),
                    ).use { c ->
                        while (c.moveToNext()) {
                            val doc = c.getLong(0)
                            val s = score(c.getBlob(1), globalN) * g.weight
                            scores[doc] = (scores[doc] ?: 0.0) + s
                            if (seen.add(doc)) matchedGroups[doc] = (matchedGroups[doc] ?: 0) + 1
                        }
                    }
                }
            }
            if (scores.isEmpty()) continue
            val n = groups.size
            val ranked = scores.entries.map { (doc, s) ->
                val covered = matchedGroups[doc] ?: 0
                doc to (s + 40.0 * covered * covered / (n * n) + if (covered == n) 25.0 else 0.0)
            }.sortedByDescending { it.second }.take(limit)
            if (ranked.isEmpty()) continue
            val ids = ranked.joinToString(",") { it.first.toString() }
            val byRow = HashMap<Long, EntrySummary>()
            db.rawQuery("SELECT rowid, $summaryCols FROM entry WHERE rowid IN ($ids)", null).use { c ->
                while (c.moveToNext()) {
                    byRow[c.getLong(0)] = EntrySummary(c.getString(1), c.getString(2), c.getString(3), c.getString(4), c.getString(5), c.getInt(6), c.getString(7))
                }
            }
            for ((doc, s) in ranked) {
                val e = byRow[doc] ?: continue
                var bonus = 0.0
                val title = TextNormalizer.normalize(e.title).trimEnd('(', ')').removeSuffix("()")
                if (title == normalizedQuery || title.substringAfterLast('.') == normalizedQuery) bonus += 120.0
                else if (title.startsWith(normalizedQuery)) bonus += 40.0
                // Prefer curated Russian explanations over raw English docstrings.
                if (e.lang == "ru") bonus += 12.0
                if (e.kind == "member" || e.kind == "extmember") bonus -= 8.0
                hits += SearchHit(e, s + bonus)
            }
        }
        return hits.sortedByDescending { it.score }.distinctBy { it.entry.id }.take(limit)
    }

    /** Column weights: title, keywords, body, skeleton forms. */
    private val weights = doubleArrayOf(10.0, 5.0, 1.0, 4.0)

    private fun score(blob: ByteArray, globalN: Int): Double {
        val b = ByteBuffer.wrap(blob).order(ByteOrder.nativeOrder()).asIntBuffer()
        val p = b.get(0)
        val c = b.get(1)
        val n = maxOf(b.get(2), globalN)
        var s = 0.0
        for (phrase in 0 until p) {
            for (col in 0 until c) {
                val base = 3 + 3 * (phrase * c + col)
                if (base + 2 >= b.limit()) continue
                val hitsHere = b.get(base)
                if (hitsHere == 0) continue
                val docsWithHit = b.get(base + 2).coerceAtLeast(1)
                val idf = ln(1.0 + (n - docsWithHit + 0.5) / (docsWithHit + 0.5))
                val tf = hitsHere / (hitsHere + 1.2)
                s += weights.getOrElse(col) { 1.0 } * tf * idf
            }
        }
        return s
    }

    /** Distinct kinds present in a domain, with counts (for the Python/Functions/Libraries menus). */
    fun kinds(domain: Domain): Map<String, Int> {
        kb.db(domain).rawQuery("SELECT kind, COUNT(*) FROM entry GROUP BY kind", null).use { c ->
            val out = LinkedHashMap<String, Int>()
            while (c.moveToNext()) out[c.getString(0)] = c.getInt(1)
            return out
        }
    }
}
