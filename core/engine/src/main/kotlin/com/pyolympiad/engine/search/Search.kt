package com.pyolympiad.engine.search

import com.pyolympiad.engine.text.RussianStem
import com.pyolympiad.engine.text.Skeleton
import com.pyolympiad.engine.text.TextNormalizer
import com.pyolympiad.engine.text.Transliterator

/**
 * Multilingual synonym groups (assets/synonyms/synonyms.tsv) and word-level translit
 * variants (assets/transliteration/words.tsv). Every line is a group of equivalent terms
 * separated by ';' or tabs: "строка; строки; stroka; string; str; satr".
 */
class Synonyms private constructor(private val groups: List<List<String>>) {

    private val index: Map<String, List<Int>> = buildMap<String, MutableList<Int>> {
        groups.forEachIndexed { gi, g ->
            for (term in g) for (key in keys(term)) getOrPut(key) { ArrayList() }.add(gi)
        }
    }

    val size: Int get() = groups.size

    /** All terms equivalent to [word] (including itself). */
    fun expand(word: String): List<String> {
        val out = LinkedHashSet<String>()
        out += word
        for (key in keys(word)) index[key]?.forEach { out += groups[it] }
        return out.toList()
    }

    companion object {
        private fun keys(term: String): List<String> = Skeleton.forms(TextNormalizer.normalize(term).replace(" ", ""))

        fun parse(text: String): Synonyms {
            val groups = text.lineSequence()
                .map { it.trim() }
                .filter { it.isNotEmpty() && !it.startsWith("#") }
                .map { line -> line.split(';', '\t').map { TextNormalizer.normalize(it) }.filter { it.isNotEmpty() } }
                .filter { it.size >= 2 }
                .toList()
            return Synonyms(groups)
        }
    }
}

/**
 * One group of alternatives for a single query word. The data layer runs one FTS MATCH per
 * group ("a* OR b* OR skel:c*") and ranks documents by how many groups they match — this
 * works identically with SQLite's standard and enhanced FTS query syntax.
 */
data class TermGroup(val word: String, val alternatives: List<String>, val weight: Double) {
    val matchExpression: String get() = alternatives.joinToString(" OR ")
}

class QueryExpander(private val synonyms: Synonyms) {

    private val stop = setOf(
        "и", "в", "на", "по", "с", "к", "из", "для", "как", "что", "это", "the", "a", "an", "of", "in", "to", "and",
        "or", "is", "va", "bilan", "uchun", "i", "v", "na",
    )

    /** Splits a free-text query into alternative groups for FTS. */
    fun expand(query: String): List<TermGroup> {
        val norm = TextNormalizer.normalize(query)
        val words = Regex("""[\p{L}\p{N}_']+""").findAll(norm).map { it.value.trim('\'') }.filter { it.isNotEmpty() }.toList()
        val groups = ArrayList<TermGroup>()
        for (w in words.distinct()) {
            if (w in stop && words.size > 1) continue
            val alts = LinkedHashSet<String>()
            fun addTerm(t: String, prefix: Boolean = true) {
                val clean = t.replace(Regex("""[^\p{L}\p{N}]"""), "")
                if (clean.isEmpty()) return
                alts += if (prefix && clean.length >= 2) "$clean*" else clean
            }
            fun addSkel(t: String) {
                for (s in Skeleton.forms(t)) {
                    val clean = s.replace(Regex("""[^\p{L}\p{N}]"""), "")
                    if (clean.length >= 2) alts += "skel:$clean*"
                }
            }
            val isCyr = w.any { TextNormalizer.isCyrillic(it) }
            addTerm(w)
            if (isCyr) {
                addTerm(RussianStem.stem(w))
            } else {
                val cyr = Transliterator.latinToCyrillic(w)
                if (w.length >= 3) addTerm(RussianStem.stem(cyr))
            }
            addSkel(w)
            for (syn in synonyms.expand(w)) {
                if (syn == w) continue
                for (part in syn.split(' ')) {
                    addTerm(part)
                    addSkel(part)
                }
            }
            if (alts.isEmpty()) continue
            groups += TermGroup(w, alts.take(24), if (w.length <= 2) 0.5 else 1.0)
        }
        return groups
    }
}
