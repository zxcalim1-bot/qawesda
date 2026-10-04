package com.pyolympiad.engine.solver.seq

import com.pyolympiad.engine.nlp.Operand
import com.pyolympiad.engine.nlp.ParsedQuery
import java.math.BigInteger

/**
 * A "sequence task": take the elements of some source, keep those that pass the filters,
 * optionally transform them and apply one operation. This single frame covers a large
 * family of school and olympiad tasks ("сумма чётных цифр", "количество слов длиннее k",
 * "среднее положительных элементов", "сумма чисел от 1 до n, делящихся на k", ...),
 * including combinations that are not stored anywhere in the knowledge base.
 */
enum class Source(val elemType: ElemType) {
    DIGITS(ElemType.INT), LIST(ElemType.INT), RANGE(ElemType.INT), CHARS(ElemType.CHAR),
    WORDS(ElemType.WORD), DIVISORS(ElemType.INT), MATRIX(ElemType.INT),
}

enum class ElemType { INT, CHAR, WORD }

enum class Op {
    SUM, PRODUCT, COUNT, MAX, MIN, AVERAGE, SELECT, REMOVE, REVERSE, SORT_ASC, SORT_DESC,
    UNIQUE_COUNT, UNIQUE_LIST, ANY, ALL, FIRST, LAST, INDEX_MAX, INDEX_MIN, RANGE_DIFF,
}

enum class FKind(val elem: Set<ElemType>, val needsParam: Boolean = false) {
    EVEN(setOf(ElemType.INT)), ODD(setOf(ElemType.INT)), POSITIVE(setOf(ElemType.INT)),
    NEGATIVE(setOf(ElemType.INT)), ZERO(setOf(ElemType.INT)), NONZERO(setOf(ElemType.INT)),
    PRIME(setOf(ElemType.INT)), COMPOSITE(setOf(ElemType.INT)),
    DIV(setOf(ElemType.INT), true), NDIV(setOf(ElemType.INT), true),
    GT(setOf(ElemType.INT), true), LT(setOf(ElemType.INT), true), GE(setOf(ElemType.INT), true),
    LE(setOf(ElemType.INT), true), EQ(setOf(ElemType.INT), true), NE(setOf(ElemType.INT), true),
    PSQUARE(setOf(ElemType.INT)), TWO_DIGIT(setOf(ElemType.INT)), THREE_DIGIT(setOf(ElemType.INT)),
    PALINDROME(setOf(ElemType.INT, ElemType.WORD)),
    VOWEL(setOf(ElemType.CHAR)), CONSONANT(setOf(ElemType.CHAR)), UPPER(setOf(ElemType.CHAR)),
    LOWER(setOf(ElemType.CHAR)), LETTER(setOf(ElemType.CHAR)), DIGITCH(setOf(ElemType.CHAR)),
    SPACE(setOf(ElemType.CHAR)),
    LEN_GT(setOf(ElemType.WORD), true), LEN_LT(setOf(ElemType.WORD), true), LEN_EQ(setOf(ElemType.WORD), true),
}

data class Filter(val kind: FKind, val param: Operand? = null) {
    /** Python source for the parameter: a literal or a variable read from input. */
    val p: String get() = param?.toString() ?: "k"
}

enum class Transform { NONE, SQUARE, CUBE, ABS }

/** Python expressions for the range bounds plus the variables that must be read from input. */
data class RangeBounds(val lo: String, val hi: String, val readVars: List<String>, val loConst: BigInteger?, val hiConst: BigInteger?)

data class Frame(
    val source: Source,
    val op: Op,
    val filters: List<Filter> = emptyList(),
    val transform: Transform = Transform.NONE,
    val natural: Boolean = false,
    /** LIST: first line is the count n, second line the elements. */
    val listWithCount: Boolean = false,
    val range: RangeBounds? = null,
    val oneBased: Boolean = true,
    /** DIVISORS: exclude the number itself. */
    val proper: Boolean = false,
    /** Number of digits when the statement says "четырёхзначное" etc. */
    val fixedDigits: Int? = null,
) {
    val elem: ElemType get() = source.elemType

    /** Combinations that make sense as a task (others are rejected by the detector). */
    val isValid: Boolean
        get() = when {
            op == Op.ALL && filters.isEmpty() -> false
            op == Op.ANY && filters.isEmpty() -> false
            op == Op.REMOVE && (filters.isEmpty() || source !in setOf(Source.CHARS, Source.WORDS, Source.LIST)) -> false
            op == Op.SELECT && filters.isEmpty() && source !in setOf(Source.DIVISORS, Source.RANGE) -> false
            op in setOf(Op.INDEX_MAX, Op.INDEX_MIN) && source != Source.LIST -> false
            op in setOf(Op.REVERSE, Op.SORT_ASC, Op.SORT_DESC) && source in setOf(Source.RANGE, Source.DIVISORS, Source.MATRIX) -> false
            op in setOf(Op.REVERSE) && filters.isNotEmpty() -> false
            op in setOf(Op.SORT_ASC, Op.SORT_DESC) && filters.isNotEmpty() && source != Source.LIST -> false
            fixedDigits != null && source != Source.DIGITS -> false
            elem != ElemType.INT && transform != Transform.NONE -> false
            elem == ElemType.CHAR && op in setOf(Op.SUM, Op.PRODUCT, Op.AVERAGE, Op.MAX, Op.MIN, Op.RANGE_DIFF) -> false
            elem == ElemType.WORD && op in setOf(Op.SUM, Op.PRODUCT, Op.AVERAGE, Op.RANGE_DIFF) -> false
            else -> true
        }

    /** Variables that come from input in addition to the main data (e.g. k in "делящихся на k"). */
    val paramVars: List<String>
        get() = filters.mapNotNull { (it.param as? Operand.Var)?.name }
            .filter { v -> range?.readVars?.contains(v) != true }
            .distinct()
}

/** Detects a sequence frame in a parsed statement. Returns the frame and a confidence score. */
object FrameDetector {

    private val OPS_PRIORITY = listOf("SUM", "PRODUCT", "AVERAGE", "COUNT", "MAX", "MIN")

    /** Words that may accompany a request to list a range without changing its meaning. */
    private val LISTING_WORDS = setOf("все", "всех", "всё", "vse", "vsekh", "vseh", "all", "barcha", "hamma", "them")

    fun detect(q: ParsedQuery): Pair<Frame, Double>? {
        // Tasks that clearly belong to a named algorithm are not sequence tasks.
        val blockers = listOf(
            "GCD", "LCM", "FACTORIAL", "FIBONACCI", "FACTORIZE", "SIEVE", "BASE", "BINARY", "OCTAL", "HEX",
            "GRAPH", "TREE", "KNAPSACK", "COIN", "STAIRS", "ANAGRAM", "CIPHER", "COMPRESS", "BRACKETS",
            "QUADRATIC", "TRIANGLE", "LEAP", "TICKET", "PERFECT", "ARMSTRONG", "COLLATZ", "HANOI",
            "QUEEN", "PERMUTATION", "COMBINATION", "SUBSET", "MERGE", "BSEARCH", "SUBSEQUENCE",
            "SUBSTRING", "SUBARRAY", "CONSECUTIVE", "MOST_FREQUENT", "EDIT_DISTANCE", "DIGITAL_ROOT",
            "TOTIENT", "QUERY", "WINDOW", "TRANSPOSE", "SPIRAL", "DIAGONAL", "SYMMETRIC", "INVERSION",
            "MISSING", "NEXT_GREATER", "PANGRAM", "SECONDS", "WEEKDAY", "CELSIUS", "FAHRENHEIT",
            "MULT_TABLE", "STARS", "HELLO", "SWAP", "ROTATE", "REPLACE", "OCCURRENCE", "DUPLICATE",
            "INTERVALS", "MAZE", "ISLAND", "PATH", "DISTANCE", "CIRCLE", "AREA", "PERIMETER", "EQUATION",
            "SQRT", "POWER", "MOD", "BITS", "SECOND", "KTH", "PYTHAGOREAN", "AGE", "DATE", "DAYS",
        )
        val blocked = blockers.count { q.hasStrong(it) }

        val source = detectSource(q) ?: return null
        // "первых n простых чисел" is the start of an infinite sequence, not a filter over input data.
        if (firstN(q) && q.ranges.isEmpty() && !q.has("LIST") && !q.has("ELEMENT") && !q.has("N_ITEMS") &&
            source in setOf(Source.LIST, Source.RANGE)) return null
        // "Выведите все числа от 1 до n": a range and nothing else asked means listing its numbers.
        var op = detectOp(q, source)
            ?: if (source == Source.RANGE && blocked == 0 && q.uncovered.all { it in LISTING_WORDS }) Op.SELECT else return null
        val filters = detectFilters(q, source)
        // "barcha sonlarni chiqaring": "все" without a condition lists the range, it is not "все ли".
        if (op == Op.ALL && filters.isEmpty() && source == Source.RANGE && blocked == 0) op = Op.SELECT
        if (op == Op.ALL && filters.isEmpty()) return null
        if (op in setOf(Op.REMOVE) && filters.isEmpty()) return null
        if (op == Op.SELECT && filters.isEmpty() && source !in setOf(Source.DIVISORS, Source.RANGE)) return null
        val transform = when {
            q.hasStrong("CUBE") -> Transform.CUBE
            q.hasStrong("SQUARE") && !q.has("PERFECT_SQUARE") && !q.has("AREA") -> Transform.SQUARE
            q.hasStrong("ABS") && !q.has("MOD") -> Transform.ABS
            else -> Transform.NONE
        }.let { if (source.elemType != ElemType.INT) Transform.NONE else it }

        val range = if (source == Source.RANGE) rangeBounds(q) ?: return null else null
        val fixed = when {
            q.has("TWO_DIGIT") && source == Source.DIGITS -> 2
            q.has("THREE_DIGIT") && source == Source.DIGITS -> 3
            q.has("FOUR_DIGIT") && source == Source.DIGITS -> 4
            q.has("FIVE_DIGIT") && source == Source.DIGITS -> 5
            q.has("SIX_DIGIT") && source == Source.DIGITS -> 6
            else -> null
        }
        val oneBased = q.hitsOf("POSITION").none { it.matchedText.startsWith("индекс") || it.matchedText.startsWith("index") || it.matchedText.startsWith("indeks") }
        val listWithCount = source == Source.LIST && ("n" in q.variables || q.has("INPUT_LINE"))
        val frame = Frame(
            source = source,
            op = op,
            filters = filters,
            transform = transform,
            natural = q.has("NATURAL") || source == Source.DIVISORS,
            listWithCount = listWithCount,
            range = range,
            oneBased = oneBased,
            proper = q.has("PROPER"),
            fixedDigits = if (fixed != null && filters.none { it.kind in setOf(FKind.TWO_DIGIT, FKind.THREE_DIGIT) }) fixed else null,
        )
        if (!frame.isValid) return null
        var score = 1.0 + 0.9 + 0.25 * filters.size
        score -= 0.8 * blocked
        if (source == Source.LIST && !q.has("LIST") && !q.has("ELEMENT") && !q.has("N_ITEMS")) score -= 0.4
        return frame to score
    }

    /** "первые n …": FIRST counts how many to take, it does not ask for the first matching element. */
    private fun firstN(q: ParsedQuery): Boolean =
        q.hitsOf("FIRST").any { h -> q.tokens.getOrNull(h.end)?.let { it.text in q.variables } == true }

    private fun detectSource(q: ParsedQuery): Source? {
        val charHints = listOf("VOWEL", "CONSONANT", "LETTER", "CHAR", "UPPER", "LOWER", "SPACE")
        return when {
            q.has("MATRIX") -> Source.MATRIX
            q.has("DIVISOR") && !q.has("GCD") && !q.has("LCM") -> Source.DIVISORS
            q.has("WORD") && (q.has("LONGEST") || q.has("SHORTEST_WORD") || q.has("PALINDROME") ||
                charHints.none { q.has(it) }) -> Source.WORDS
            q.has("DIGIT") && (q.has("STRING") || q.has("CHAR")) -> Source.CHARS
            charHints.any { q.has(it) } || q.has("STRING") -> Source.CHARS
            q.has("DIGIT") -> Source.DIGITS
            q.ranges.isNotEmpty() -> Source.RANGE
            (q.has("NATURAL") || q.has("PRIME") || q.has("NUMBER")) && (q.has("LESS") || q.has("LESS_EQ")) && q.params.any {
                it.concept in setOf("LESS", "LESS_EQ") && it.value is Operand.Var
            } -> Source.RANGE
            q.has("LIST") || q.has("ELEMENT") || q.has("SEQUENCE") || q.has("N_ITEMS") -> Source.LIST
            q.has("NUMBER") && (q.has("SUM") || q.has("COUNT") || q.has("MAX") || q.has("MIN") || q.has("AVERAGE") || q.has("PRODUCT")) &&
                !q.has("TWO") && !q.has("THREE") -> Source.LIST
            q.has("REVERSE") && q.has("NUMBER") -> Source.DIGITS
            q.has("SORT") && q.has("NUMBER") -> Source.LIST
            else -> null
        }
    }

    private fun detectOp(q: ParsedQuery, source: Source): Op? {
        val strongCount = q.hitsOf("COUNT").any { !it.weak }
        // "число чётных цифр" means "количество".
        val numberAsCount = q.hitsOf("NUMBER").any { n ->
            q.hits.any { h -> h.start in (n.end)..(n.end + 1) && h.concept in setOf("EVEN", "ODD", "POSITIVE", "NEGATIVE", "PRIME", "DIGIT", "ELEMENT", "WORD", "VOWEL", "CONSONANT", "LETTER", "ZERO", "DIVISOR", "TWO_DIGIT", "THREE_DIGIT") }
        } && q.language.language.name.startsWith("RUSSIAN")
        return when {
            q.has("REMOVE") && source in setOf(Source.CHARS, Source.WORDS, Source.LIST) -> Op.REMOVE
            q.has("DIFF") && q.has("MAX") && q.has("MIN") -> Op.RANGE_DIFF
            q.has("POSITION") && q.has("MAX") -> Op.INDEX_MAX
            q.has("POSITION") && q.has("MIN") -> Op.INDEX_MIN
            q.has("REVERSE") -> Op.REVERSE
            q.has("SORT") || q.has("ASC") || q.has("DESC") -> if (q.has("DESC")) Op.SORT_DESC else Op.SORT_ASC
            q.has("UNIQUE") && (strongCount || q.has("COUNT")) -> Op.UNIQUE_COUNT
            q.has("UNIQUE") -> Op.UNIQUE_LIST
            q.has("AVERAGE") -> Op.AVERAGE
            q.has("SUM") -> Op.SUM
            q.has("PRODUCT") -> Op.PRODUCT
            strongCount -> Op.COUNT
            q.has("MAX") || (source == Source.WORDS && q.has("LONGEST")) -> Op.MAX
            q.has("MIN") || (source == Source.WORDS && q.has("SHORTEST_WORD")) -> Op.MIN
            q.has("ALL") -> Op.ALL
            q.has("EXISTS") -> Op.ANY
            numberAsCount -> Op.COUNT
            q.has("COUNT") -> Op.COUNT
            q.has("FIRST") && !q.has("NATURAL") && !firstN(q) -> Op.FIRST
            q.has("LAST") -> Op.LAST
            q.has("PRINT") || q.has("EACH") -> Op.SELECT
            source == Source.DIVISORS -> Op.SELECT
            else -> null
        }
    }

    private fun detectFilters(q: ParsedQuery, source: Source): List<Filter> {
        val elem = source.elemType
        val out = ArrayList<Filter>()
        fun negated(concept: String): Boolean = q.hitsOf(concept).any { h ->
            q.hits.any { it.concept == "NOT" && it.end == h.start }
        }
        fun add(kind: FKind, param: Operand? = null) {
            if (elem in kind.elem && out.none { it.kind == kind }) out += Filter(kind, param)
        }
        fun paramOf(concept: String): Operand = q.param(concept) ?: Operand.Var("k")

        if (q.has("ODD")) add(if (negated("ODD")) FKind.EVEN else FKind.ODD)
        else if (q.has("EVEN")) add(if (negated("EVEN")) FKind.ODD else FKind.EVEN)
        if (q.has("POSITIVE")) add(FKind.POSITIVE)
        if (q.has("NEGATIVE")) add(FKind.NEGATIVE)
        if (q.has("ZERO") && !q.has("REMOVE")) add(if (negated("ZERO")) FKind.NONZERO else FKind.ZERO)
        if (q.has("PRIME")) add(if (negated("PRIME")) FKind.COMPOSITE else FKind.PRIME)
        if (q.has("NOT_DIVISIBLE")) add(FKind.NDIV, paramOf("NOT_DIVISIBLE"))
        else if (q.has("DIVISIBLE")) add(if (negated("DIVISIBLE")) FKind.NDIV else FKind.DIV, paramOf("DIVISIBLE"))
        if (q.has("PERFECT_SQUARE")) add(FKind.PSQUARE)
        if (q.has("TWO_DIGIT") && source != Source.DIGITS) add(FKind.TWO_DIGIT)
        if (q.has("THREE_DIGIT") && source != Source.DIGITS) add(FKind.THREE_DIGIT)
        if (q.has("PALINDROME")) add(FKind.PALINDROME)

        val rangeHiVar = q.params.firstOrNull { it.concept in setOf("LESS", "LESS_EQ") && it.value is Operand.Var }
        val lessUsedAsRange = source == Source.RANGE && q.ranges.isEmpty() && rangeHiVar != null
        if (elem == ElemType.INT) {
            if (q.has("GREATER_EQ")) add(FKind.GE, paramOf("GREATER_EQ"))
            else if (q.has("GREATER")) add(if (negated("GREATER")) FKind.LE else FKind.GT, paramOf("GREATER"))
            if (!lessUsedAsRange) {
                if (q.has("LESS_EQ")) add(FKind.LE, paramOf("LESS_EQ"))
                else if (q.has("LESS")) add(if (negated("LESS")) FKind.GE else FKind.LT, paramOf("LESS"))
            }
            if (q.has("EQUAL") && q.param("EQUAL") != null) add(if (negated("EQUAL")) FKind.NE else FKind.EQ, paramOf("EQUAL"))
        }
        if (elem == ElemType.WORD) {
            val lenParam = q.param("GREATER") ?: q.param("LONGEST") ?: q.param("LESS") ?: q.param("EQUAL")
            if (q.has("LENGTH") || q.has("LONGEST") || q.has("LETTER")) {
                when {
                    (q.has("GREATER") || (q.has("LONGEST") && q.param("LONGEST") != null)) && lenParam != null -> add(FKind.LEN_GT, lenParam)
                    q.has("LESS") && lenParam != null -> add(FKind.LEN_LT, lenParam)
                    q.has("EQUAL") && lenParam != null -> add(FKind.LEN_EQ, lenParam)
                }
            }
        }
        if (elem == ElemType.CHAR) {
            if (q.has("VOWEL")) add(FKind.VOWEL)
            if (q.has("CONSONANT")) add(FKind.CONSONANT)
            if (q.has("UPPER")) add(FKind.UPPER)
            if (q.has("LOWER")) add(FKind.LOWER)
            if (q.has("DIGIT")) add(FKind.DIGITCH)
            if (q.has("SPACE")) add(FKind.SPACE)
            if (q.has("LETTER") && out.none { it.kind in setOf(FKind.VOWEL, FKind.CONSONANT, FKind.UPPER, FKind.LOWER) }) add(FKind.LETTER)
        }
        return out
    }

    private fun rangeBounds(q: ParsedQuery): RangeBounds? {
        val r = q.ranges.firstOrNull()
        if (r != null) {
            val reads = listOfNotNull((r.lo as? Operand.Var)?.name, (r.hi as? Operand.Var)?.name).distinct()
            return RangeBounds(r.lo.toString(), r.hi.toString(), reads,
                (r.lo as? Operand.Num)?.value, (r.hi as? Operand.Num)?.value)
        }
        val p = q.params.firstOrNull { it.concept in setOf("LESS", "LESS_EQ") && it.value is Operand.Var } ?: return null
        val name = (p.value as Operand.Var).name
        val hi = if (p.concept == "LESS") "$name - 1" else name
        return RangeBounds("1", hi, listOf(name), BigInteger.ONE, null)
    }
}
