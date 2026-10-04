package com.pyolympiad.engine.nlp

import com.pyolympiad.engine.text.TextNormalizer
import com.pyolympiad.engine.text.Token
import com.pyolympiad.engine.text.TokenType
import com.pyolympiad.engine.text.Tokenizer
import java.math.BigInteger

/** A value in the statement: either a concrete number or a variable name such as n or k. */
sealed class Operand {
    data class Num(val value: BigInteger) : Operand() {
        override fun toString(): String = value.toString()
    }

    data class Var(val name: String) : Operand() {
        override fun toString(): String = name
    }
}

data class Bound(val variable: String?, val lower: BigInteger?, val upper: BigInteger?)

data class RangeSpec(val lo: Operand, val hi: Operand, val start: Int, val end: Int)

/** A number (or variable) attached to a concept, e.g. "divisible by 3" -> DIVISIBLE=3. */
data class ParamBinding(val concept: String, val value: Operand, val tokenIndex: Int)

class ParsedQuery(
    val original: String,
    val normalized: String,
    val tokens: List<Token>,
    val language: LanguageGuess,
    val hits: List<ConceptHit>,
    val corrections: List<Correction>,
    val bounds: List<Bound>,
    val ranges: List<RangeSpec>,
    val params: List<ParamBinding>,
    /** Numbers that are not constraints/params: concrete input values given in the text. */
    val inputNumbers: List<Token>,
    val variables: List<String>,
    val quoted: List<String>,
) {
    private val conceptSet: Set<String> = hits.mapTo(HashSet()) { it.concept }
    private val strongSet: Set<String> = hits.filter { !it.weak }.mapTo(HashSet()) { it.concept }

    fun has(concept: String): Boolean = concept in conceptSet
    fun hasStrong(concept: String): Boolean = concept in strongSet
    fun count(concept: String): Int = hits.count { it.concept == concept }
    fun hitsOf(concept: String): List<ConceptHit> = hits.filter { it.concept == concept }
    fun firstIndex(concept: String): Int = hits.firstOrNull { it.concept == concept }?.start ?: -1
    fun param(concept: String): Operand? = params.firstOrNull { it.concept == concept }?.value
    val conceptNames: Set<String> get() = conceptSet

    /** Largest upper bound mentioned in the constraints (for algorithm choice). */
    val maxBound: BigInteger?
        get() = bounds.mapNotNull { it.upper }.maxOrNull()

    fun upperBoundOf(variable: String): BigInteger? =
        bounds.filter { it.variable == variable }.mapNotNull { it.upper }.maxOrNull()

    override fun toString(): String =
        "ParsedQuery(lang=${language.language}, concepts=${hits.map { it.concept }}, params=$params, " +
            "ranges=$ranges, inputs=${inputNumbers.map { it.text }}, bounds=$bounds, vars=$variables)"
}

class QueryParser(private val lexicon: Lexicon) {

    private val PARAM_CONCEPTS = setOf(
        "DIVISIBLE", "NOT_DIVISIBLE", "GREATER", "LESS", "EQUAL", "GREATER_EQ", "LESS_EQ", "BASE",
        "ROTATE", "CIPHER", "KTH", "WINDOW", "LONGEST", "POWER", "MOD", "FIRST", "LAST",
    )

    /** Small words that may sit between a concept and its number ("делится на 3", "greater than 5"). */
    private val LINK_WORDS = setOf(
        "на", "чем", "числ", "число", "числа", "than", "by", "to", "of", "ga", "dan", "к", "к", "по", "на", "na", "chem",
        "be", "is", "равно", "ravno", "или", "ili", "or", "equal", "равен", "ravna", "ravno",
    )

    private val SINGLE_LETTER_VARS = setOf("n", "m", "k", "a", "b", "c", "x", "y", "s", "t", "p", "q", "d", "l", "r")

    fun parse(text: String): ParsedQuery {
        val normalized = TextNormalizer.normalize(text)
        val tokens = Tokenizer.tokenize(normalized)
        val language = LanguageDetector.detect(normalized, tokens, lexicon)
        val (rawHits, corrections) = lexicon.match(tokens)

        val variables = detectVariables(tokens, language.language)
        val usedNumberIdx = HashSet<Int>()
        val bounds = ArrayList<Bound>()

        // 1) Explicit inequalities: 1 <= n <= 10^5, a, b < 10^9, n >= 1.
        for ((i, t) in tokens.withIndex()) {
            if (t.type != TokenType.SYMBOL || t.text !in setOf("<=", "<", ">=", ">")) continue
            val next = tokens.getOrNull(i + 1)
            val prev = tokens.getOrNull(i - 1)
            if (next?.type == TokenType.NUMBER && prev != null) {
                val v = findVarBefore(tokens, i, variables)
                val value = next.number ?: continue
                if (t.text.startsWith("<")) bounds += Bound(v, null, value) else bounds += Bound(v, value, null)
                usedNumberIdx += i + 1
            }
            if (prev?.type == TokenType.NUMBER && next?.type == TokenType.WORD) {
                val value = prev.number ?: continue
                val v = next.text.takeIf { it in variables }
                if (t.text.startsWith("<")) bounds += Bound(v, value, null) else bounds += Bound(v, null, value)
                usedNumberIdx += i - 1
            }
        }

        // 2) Word constraints: "не более 10^5", "at most 1000", "10^9 dan oshmaydi".
        val hits = ArrayList<ConceptHit>()
        for (h in rawHits) {
            if (h.concept == "LE_PHRASE" || h.concept == "GE_PHRASE") {
                val numIdx = (h.end until minOf(tokens.size, h.end + 3)).firstOrNull { tokens[it].type == TokenType.NUMBER }
                    ?: (maxOf(0, h.start - 3) until h.start).lastOrNull { tokens[it].type == TokenType.NUMBER }
                val value = numIdx?.let { tokens[it].number }
                if (value != null) {
                    val looksLikeLimit = value >= BigInteger.valueOf(100) || tokens[numIdx].text.contains('^') ||
                        tokens[numIdx].text.contains('e') || findVarBefore(tokens, h.start, variables) != null
                    if (looksLikeLimit) {
                        val v = findVarBefore(tokens, h.start, variables)
                        bounds += if (h.concept == "LE_PHRASE") Bound(v, null, value) else Bound(v, value, null)
                        usedNumberIdx += numIdx
                        continue
                    }
                    // Small number: it is a filter ("элементы не больше 5").
                    hits += h.copy(concept = if (h.concept == "LE_PHRASE") "LESS_EQ" else "GREATER_EQ")
                    continue
                }
                // "не превосходящих n": a filter/bound given by a variable.
                val varNext = (h.end until minOf(tokens.size, h.end + 2)).any { tokens[it].type == TokenType.WORD && tokens[it].text in variables }
                if (varNext) hits += h.copy(concept = if (h.concept == "LE_PHRASE") "LESS_EQ" else "GREATER_EQ")
                continue
            }
            hits += h
        }

        // 3) Ranges: "от 1 до n", "from a to b", "1 dan n gacha", "с 1 по n", "between a and b".
        val ranges = ArrayList<RangeSpec>()
        for (i in tokens.indices) {
            val w = tokens[i].text
            if (tokens[i].type != TokenType.WORD) continue
            val opener = w in setOf("от", "from", "ot", "с", "s", "между", "mezhdu", "between")
            if (opener) {
                val lo = operandAt(tokens, i + 1, variables) ?: continue
                val closerIdx = i + 2
                val closer = tokens.getOrNull(closerIdx)?.text ?: continue
                if (closer !in setOf("до", "to", "do", "по", "po", "и", "and", "i", "until")) continue
                val hi = operandAt(tokens, closerIdx + 1, variables) ?: continue
                ranges += RangeSpec(lo, hi, i, closerIdx + 2)
            }
            if (w == "dan" && i >= 1 && i + 2 < tokens.size && tokens[i + 2].text == "gacha") {
                val lo = operandAt(tokens, i - 1, variables) ?: continue
                val hi = operandAt(tokens, i + 1, variables) ?: continue
                ranges += RangeSpec(lo, hi, i - 1, i + 3)
            }
        }
        // "1..n" / "1...n"
        for (i in 0 until tokens.size - 3) {
            if (tokens[i + 1].text == "." && tokens[i + 2].text == ".") {
                val lo = operandAt(tokens, i, variables) ?: continue
                val hiIdx = if (tokens[i + 3].text == ".") i + 4 else i + 3
                val hi = operandAt(tokens, hiIdx, variables) ?: continue
                ranges += RangeSpec(lo, hi, i, hiIdx + 1)
            }
        }

        // 4) Parameters attached to concepts.
        val params = ArrayList<ParamBinding>()
        val rangeTokenIdx = ranges.flatMap { (it.start until it.end).toList() }.toSet()
        val preferBackward = language.language == Language.UZBEK
        for (h in hits) {
            if (h.concept !in PARAM_CONCEPTS) continue
            val forward = scanForOperand(tokens, h.end, +1, variables, usedNumberIdx)
            val backward = scanForOperand(tokens, h.start - 1, -1, variables, usedNumberIdx)
            val pick = if (preferBackward) backward ?: forward else forward ?: backward
            if (pick != null) {
                val (idx, op) = pick
                // Do not steal the bounds of a range ("числа от 1 до 100 больше 5" keeps the range intact).
                if (idx in rangeTokenIdx) continue
                if (h.concept in setOf("FIRST", "LAST", "LONGEST", "POWER", "MOD") && op is Operand.Var) continue
                params += ParamBinding(h.concept, op, idx)
                if (tokens[idx].type == TokenType.NUMBER) usedNumberIdx += idx
            }
        }

        // Parsed ranges are concepts too ("от 1 до n" means the task is about a range of numbers).
        for (r in ranges) hits += ConceptHit("RANGE", r.start, r.end, LexLang.RU, "range", "от … до", weak = false, fuzzy = false)

        val inputs = tokens.withIndex().filter { (i, t) ->
            t.type == TokenType.NUMBER && i !in usedNumberIdx && i !in rangeTokenIdx
        }.map { it.value }

        val quoted = tokens.filter { it.type == TokenType.QUOTED }.map { it.text }

        return ParsedQuery(
            original = text,
            normalized = normalized,
            tokens = tokens,
            language = language,
            hits = hits.filter { !it.concept.startsWith("_") },
            corrections = corrections,
            bounds = bounds,
            ranges = ranges,
            params = params,
            inputNumbers = inputs,
            variables = variables,
            quoted = quoted,
        )
    }

    private fun detectVariables(tokens: List<Token>, language: Language): List<String> {
        val out = LinkedHashSet<String>()
        for ((i, t) in tokens.withIndex()) {
            if (t.type != TokenType.WORD) continue
            val w = t.text
            if (w.length == 1 && w[0] in 'a'..'z' && w in SINGLE_LETTER_VARS) {
                if (language == Language.RUSSIAN_TRANSLIT && w in setOf("s", "k", "a") &&
                    tokens.getOrNull(i + 1)?.let { it.type == TokenType.WORD && it.text.length > 2 } == true) continue
                if (language == Language.ENGLISH && w == "a" &&
                    tokens.getOrNull(i + 1)?.let { it.type == TokenType.WORD && it.text.length > 1 } == true) continue
                out += w
            } else if (w.length == 2 && w[0] in 'a'..'z' && w[1].isDigit()) {
                out += w
            }
        }
        return out.toList()
    }

    private fun findVarBefore(tokens: List<Token>, index: Int, variables: List<String>): String? {
        var j = index - 1
        var steps = 0
        while (j >= 0 && steps < 5) {
            val t = tokens[j]
            if (t.type == TokenType.WORD && t.text in variables) return t.text
            if (t.type == TokenType.WORD && t.text.length > 3 && steps > 1) break
            j--; steps++
        }
        return null
    }

    private fun operandAt(tokens: List<Token>, index: Int, variables: List<String>): Operand? {
        val t = tokens.getOrNull(index) ?: return null
        return when {
            t.type == TokenType.NUMBER && t.number != null -> Operand.Num(t.number)
            t.type == TokenType.WORD && t.text in variables -> Operand.Var(t.text)
            else -> null
        }
    }

    private fun scanForOperand(
        tokens: List<Token>,
        from: Int,
        step: Int,
        variables: List<String>,
        used: Set<Int>,
    ): Pair<Int, Operand>? {
        var i = from
        var skipped = 0
        while (i in tokens.indices && skipped <= 2) {
            val t = tokens[i]
            when {
                t.type == TokenType.NUMBER && t.number != null && i !in used -> return i to Operand.Num(t.number)
                t.type == TokenType.WORD && t.text in variables -> return i to Operand.Var(t.text)
                t.type == TokenType.WORD && t.text in LINK_WORDS -> {}
                t.type == TokenType.SYMBOL && t.text in setOf(",", ":", "(", ")") -> {}
                else -> return null
            }
            i += step
            skipped++
        }
        return null
    }
}
