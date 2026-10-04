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
    /** Words (3+ letters) that matched no concept, stop word, variable or range: what the solver did not understand. */
    val uncovered: List<String> = emptyList(),
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

    /** Concepts naming a kind of number: "простых [чисел] до n" is a range, "строки до 100" is not. */
    private val NUMBER_KINDS = setOf(
        "NUMBER", "NATURAL", "PRIME", "COMPOSITE", "EVEN", "ODD", "SQUARE", "CUBE", "PERFECT_SQUARE",
        "FIBONACCI", "PERFECT", "ARMSTRONG", "PALINDROME", "TWO_DIGIT", "THREE_DIGIT", "POSITIVE",
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
            // "большее n" compares with a value; "большее из них" is a maximum.
            if ((h.concept == "MAX" || h.concept == "MIN") && h.matchedText in setOf("большее", "меньшее") &&
                operandAt(tokens, h.end, variables) != null) {
                hits += h.copy(concept = if (h.concept == "MAX") "GREATER" else "LESS")
                continue
            }
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
        var upTo = false
        if (ranges.isEmpty()) upToRange(tokens, hits, variables, language.language)?.let { ranges += it; upTo = true }
        if (ranges.isEmpty()) firstNRange(tokens, hits, variables)?.let { ranges += it }

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
        // A range given only by its upper end ("до n") is also marked: "числа Фибоначчи до n" lists values up to n.
        for (r in ranges) if (upTo) hits += ConceptHit("UPTO", r.start, r.end, LexLang.RU, "upto", "до", weak = false, fuzzy = false)

        val inputs = tokens.withIndex().filter { (i, t) ->
            t.type == TokenType.NUMBER && i !in usedNumberIdx && i !in rangeTokenIdx
        }.map { it.value }

        val quoted = tokens.filter { it.type == TokenType.QUOTED }.map { it.text }

        val coveredIdx = HashSet<Int>(rangeTokenIdx)
        for (h in rawHits) for (j in h.start until h.end) coveredIdx += j
        val uncovered = ArrayList<String>()
        for ((i, t) in tokens.withIndex()) {
            if (t.type != TokenType.WORD || t.text in variables) continue
            if (i !in coveredIdx) {
                if (t.text.length >= 3) uncovered += t.text
            } else if ('-' in t.text && rawHits.none { i >= it.start && i < it.end && '-' in it.form }) {
                // A stem matched only the first half of "числа-близнецы": the rest is still unexplained.
                t.text.split('-').drop(1).filterTo(uncovered) { it.length >= 3 }
            }
        }

        // "n чисел", "n numbers", "n ta son": a list of n values is read from input.
        for (i in 0 until tokens.size - 1) {
            if (tokens[i].type != TokenType.WORD || tokens[i].text !in variables) continue
            if (hits.any { it.concept == "FIRST" && it.end == i }) continue // "первых n чисел" is a sequence, not input
            val next = when {
                tokens[i + 1].text == "ta" -> i + 2
                // "n до 10^5 чисел": skip the bound between the variable and the noun
                tokens[i + 1].text in setOf("до", "do") && tokens.getOrNull(i + 2)?.type == TokenType.NUMBER -> i + 3
                else -> i + 1
            }
            if (hits.any { it.start == next && it.concept in setOf("NUMBER", "ELEMENT") }) {
                hits += ConceptHit("N_ITEMS", i, next + 1, LexLang.RU, "n items", "n чисел", weak = false, fuzzy = false)
                break
            }
        }

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
            uncovered = uncovered,
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

    /**
     * "простых чисел до n", "primes up to n", "n gacha tub sonlar": the numbers 1..n.
     * Only when a kind of number is named right next to it, so that constraints such as
     * "n до 10^5" or "длина строки до 100" are not mistaken for a range.
     */
    private fun upToRange(tokens: List<Token>, hits: List<ConceptHit>, variables: List<String>, language: Language): RangeSpec? {
        fun numberWordAt(idx: Int): Boolean = hits.any { it.concept in NUMBER_KINDS && idx >= it.start && idx < it.end }
        fun hiAt(idx: Int): Operand? {
            val t = tokens.getOrNull(idx) ?: return null
            if (t.type == TokenType.NUMBER && (t.text.contains('^') || t.text.contains('e') ||
                    (t.number ?: return null) > BigInteger.valueOf(10_000_000))) return null
            return operandAt(tokens, idx, variables)
        }
        for (i in tokens.indices) {
            val w = tokens[i].text
            if (tokens[i].type != TokenType.WORD) continue
            // "up to n" is already a LESS_EQ condition.
            if (hits.any { i >= it.start && i < it.end }) continue
            when {
                w == "до" || (w == "do" && language == Language.RUSSIAN_TRANSLIT) || w == "upto" ||
                    (w == "up" && tokens.getOrNull(i + 1)?.text == "to") -> {
                    val hiIdx = if (w == "up") i + 2 else i + 1
                    val hi = hiAt(hiIdx) ?: continue
                    if (!numberWordAt(i - 1)) continue
                    return RangeSpec(Operand.Num(BigInteger.ONE), hi, i, hiIdx + 1)
                }
                w == "gacha" && language == Language.UZBEK -> {
                    val hi = hiAt(i - 1) ?: continue
                    if ((i + 1..minOf(tokens.size - 1, i + 3)).none { numberWordAt(it) }) continue
                    return RangeSpec(Operand.Num(BigInteger.ONE), hi, i - 1, i + 1)
                }
            }
        }
        return null
    }

    /**
     * "сумма первых n натуральных чисел" is the range 1..n. Only for plain or natural numbers and
     * without conditions: "первых n простых/чётных/делящихся на 3" are other sequences.
     */
    private fun firstNRange(tokens: List<Token>, hits: List<ConceptHit>, variables: List<String>): RangeSpec? {
        val allowed = setOf("FIRST", "NATURAL", "NUMBER", "SUM", "PRODUCT", "AVERAGE", "SQUARE", "CUBE", "PRINT")
        if (hits.any { !it.concept.startsWith("_") && it.concept !in allowed }) return null
        val first = hits.firstOrNull { it.concept == "FIRST" } ?: return null
        val v = tokens.getOrNull(first.end)?.takeIf { it.type == TokenType.WORD && it.text in variables } ?: return null
        val kind = hits.firstOrNull { it.start == first.end + 1 } ?: return null
        if (kind.concept != "NATURAL" && kind.concept != "NUMBER") return null
        return RangeSpec(Operand.Num(BigInteger.ONE), Operand.Var(v.text), first.start, kind.end)
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
