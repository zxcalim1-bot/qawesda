package com.pyolympiad.engine.nlp

import com.pyolympiad.engine.text.Fuzzy
import com.pyolympiad.engine.text.Skeleton
import com.pyolympiad.engine.text.TextNormalizer
import com.pyolympiad.engine.text.Token
import com.pyolympiad.engine.text.TokenType
import com.pyolympiad.engine.text.Transliterator

enum class LexLang { RU, EN, UZ }

/** A concept found in the user's text. */
data class ConceptHit(
    val concept: String,
    /** Index of the first token of the match. */
    val start: Int,
    /** Index after the last token of the match. */
    val end: Int,
    val lang: LexLang,
    val matchedText: String,
    /** Form from the lexicon (for display of corrections). */
    val form: String,
    val weak: Boolean,
    val fuzzy: Boolean,
)

data class Correction(val original: String, val corrected: String)

/**
 * Multilingual concept dictionary (see assets/solver/lexicon.tsv).
 * Forms are stored as skeletons, so Russian typed in translit, missing "ё",
 * doubled letters and Uzbek apostrophe variants all match the same entry.
 */
class Lexicon private constructor(private val entries: List<Entry>) {

    private class Word(val skeleton: String, val exact: Boolean, val raw: String)

    private class Entry(
        val concept: String,
        val lang: LexLang,
        val words: List<Word>,
        val weak: Boolean,
        val form: String,
    ) {
        val stemLength: Int = words.sumOf { it.skeleton.length }
    }

    private val byFirstChar: Map<Char, List<Entry>> = entries
        .filter { it.words.first().skeleton.isNotEmpty() }
        .groupBy { it.words.first().skeleton.first() }

    val concepts: Set<String> = entries.mapTo(HashSet()) { it.concept }

    val size: Int get() = entries.size

    private class TokenForms(val lat: String?, val cyr: String?, val text: String)

    private fun formsOf(token: Token): TokenForms {
        val w = token.text
        return if (w.any { TextNormalizer.isCyrillic(it) }) {
            TokenForms(null, Skeleton.cyrillic(w), w)
        } else {
            TokenForms(Skeleton.latin(w), Skeleton.cyrillic(Transliterator.latinToCyrillic(w)), w)
        }
    }

    private fun wordMatches(word: Word, forms: TokenForms, lang: LexLang): Boolean {
        val candidate = if (lang == LexLang.RU) forms.cyr else forms.lat
        candidate ?: return false
        return if (word.exact) candidate == word.skeleton else candidate.startsWith(word.skeleton)
    }

    /**
     * Finds concept occurrences. Longest phrase wins; ties go to the longest stem.
     * Unmatched words get a typo-tolerant second pass.
     */
    fun match(tokens: List<Token>): Pair<List<ConceptHit>, List<Correction>> {
        val hits = ArrayList<ConceptHit>()
        val corrections = ArrayList<Correction>()
        val forms = tokens.map { if (it.type == TokenType.WORD) formsOf(it) else null }
        var i = 0
        while (i < tokens.size) {
            val f = forms[i]
            if (f == null) { i++; continue }
            val candidates = buildList {
                f.cyr?.firstOrNull()?.let { c -> byFirstChar[c]?.let { addAll(it) } }
                f.lat?.firstOrNull()?.let { c -> byFirstChar[c]?.let { addAll(it) } }
            }
            var bestLen = 0
            var bestStem = -1
            val best = ArrayList<Entry>()
            for (e in candidates) {
                val n = e.words.size
                if (i + n > tokens.size) continue
                var ok = true
                for (k in 0 until n) {
                    val tf = forms[i + k]
                    if (tf == null || !wordMatches(e.words[k], tf, e.lang)) { ok = false; break }
                }
                if (!ok) continue
                when {
                    n > bestLen || (n == bestLen && e.stemLength > bestStem) -> {
                        bestLen = n; bestStem = e.stemLength; best.clear(); best.add(e)
                    }
                    n == bestLen && e.stemLength == bestStem -> best.add(e)
                }
            }
            if (best.isNotEmpty()) {
                val text = tokens.subList(i, i + bestLen).joinToString(" ") { it.text }
                val seen = HashSet<String>()
                for (e in best) {
                    if (seen.add(e.concept)) {
                        hits += ConceptHit(e.concept, i, i + bestLen, e.lang, text, e.form, e.weak, false)
                    }
                }
                i += bestLen
                continue
            }
            // Typo-tolerant pass for single words.
            val fuzzy = fuzzyMatch(f)
            if (fuzzy != null) {
                hits += ConceptHit(fuzzy.concept, i, i + 1, fuzzy.lang, f.text, fuzzy.form, fuzzy.weak, true)
                corrections += Correction(f.text, fuzzy.form)
            }
            i++
        }
        return hits to corrections
    }

    private fun fuzzyMatch(f: TokenForms): Entry? {
        var best: Entry? = null
        var bestDist = Int.MAX_VALUE
        for (e in entries) {
            if (e.words.size != 1 || e.weak) continue
            val w = e.words[0]
            val stem = w.skeleton
            if (stem.length < 6) continue
            val candidate = (if (e.lang == LexLang.RU) f.cyr else f.lat) ?: continue
            if (candidate.length < stem.length) continue
            if (candidate[0] != stem[0]) continue
            val budget = if (stem.length >= 9) 2 else 1
            var d = Int.MAX_VALUE
            if (w.exact) {
                d = Fuzzy.distance(candidate, stem, budget)
            } else {
                for (len in stem.length..(stem.length + 1)) {
                    if (len < 1 || len > candidate.length) continue
                    d = minOf(d, Fuzzy.distance(candidate.substring(0, len), stem, budget))
                }
            }
            if (d in 1..budget && d < bestDist) {
                bestDist = d; best = e
            }
        }
        return best
    }

    /** Languages whose forms match this single word (used by the language detector). */
    fun languagesOf(token: Token): Set<LexLang> {
        if (token.type != TokenType.WORD) return emptySet()
        val f = formsOf(token)
        val out = HashSet<LexLang>()
        val candidates = buildList {
            f.cyr?.firstOrNull()?.let { c -> byFirstChar[c]?.let { addAll(it) } }
            f.lat?.firstOrNull()?.let { c -> byFirstChar[c]?.let { addAll(it) } }
        }
        for (e in candidates) {
            if (e.words.size == 1 && wordMatches(e.words[0], f, e.lang) && e.words[0].skeleton.length >= 3) out += e.lang
        }
        return out
    }

    companion object {
        fun parse(text: String): Lexicon {
            val entries = ArrayList<Entry>()
            text.lineSequence().forEachIndexed { lineNo, raw ->
                val line = raw.trimEnd()
                if (line.isBlank() || line.startsWith("#")) return@forEachIndexed
                val parts = line.split('\t')
                require(parts.size >= 3) { "lexicon line ${lineNo + 1}: expected 3 tab-separated columns" }
                val concept = parts[0].trim()
                val lang = when (parts[1].trim()) {
                    "ru" -> LexLang.RU
                    "en" -> LexLang.EN
                    "uz" -> LexLang.UZ
                    else -> error("lexicon line ${lineNo + 1}: unknown language ${parts[1]}")
                }
                for (formRaw in parts[2].split(';')) {
                    var form = TextNormalizer.normalize(formRaw)
                    if (form.isEmpty()) continue
                    var weak = false
                    if (form.startsWith("~")) { weak = true; form = form.substring(1) }
                    val words = form.split(' ').filter { it.isNotEmpty() }.map { w ->
                        val exact = w.startsWith("=")
                        val bare = w.removePrefix("=")
                        val skel = if (lang == LexLang.RU) Skeleton.cyrillic(bare) else Skeleton.latin(bare)
                        Word(skel, exact, bare)
                    }
                    if (words.isEmpty() || words.any { it.skeleton.isEmpty() }) continue
                    entries += Entry(concept, lang, words, weak, words.joinToString(" ") { it.raw })
                }
            }
            return Lexicon(entries)
        }
    }
}
