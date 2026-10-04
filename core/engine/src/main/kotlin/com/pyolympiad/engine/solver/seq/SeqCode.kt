package com.pyolympiad.engine.solver.seq

import com.pyolympiad.engine.solver.PyBuilder

/**
 * Low-level Python fragments for a [Frame]: input reading, element conditions,
 * value transforms and the per-operation accumulator logic. Method styles in
 * [SeqGenerator] are assembled from these pieces.
 */
internal class SeqCode(val f: Frame) {

    companion object {
        const val VOWELS = "aeiouAEIOUаеёиоуыэюяАЕЁИОУЫЭЮЯ"
        const val VOWEL_RE = "[aeiouAEIOUаеёиоуыэюяАЕЁИОУЫЭЮЯ]"

        val IS_PRIME = """
            def is_prime(x):
                if x < 2:
                    return False
                i = 2
                while i * i <= x:
                    if x % i == 0:
                        return False
                    i += 1
                return True
        """.trimIndent()
    }

    val elem: ElemType get() = f.elem

    /** Element variable name used in loops for this source. */
    val v: String
        get() = when (f.source) {
            Source.DIGITS -> "d"
            Source.LIST, Source.MATRIX -> "x"
            Source.RANGE -> "i"
            Source.CHARS -> "ch"
            Source.WORDS -> "w"
            Source.DIVISORS -> "d"
        }

    fun prepare(b: PyBuilder) {
        if (f.filters.any { it.kind == FKind.PRIME || it.kind == FKind.COMPOSITE }) b.helper("is_prime", IS_PRIME)
        if (f.filters.any { it.kind == FKind.PSQUARE }) b.import("import math")
        if (f.filters.any { it.kind == FKind.VOWEL || it.kind == FKind.CONSONANT }) b.helper("VOWELS", "VOWELS = \"$VOWELS\"")
    }

    private fun one(fl: Filter, x: String): String = when (fl.kind) {
        FKind.EVEN -> "$x % 2 == 0"
        FKind.ODD -> "$x % 2 != 0"
        FKind.POSITIVE -> "$x > 0"
        FKind.NEGATIVE -> "$x < 0"
        FKind.ZERO -> "$x == 0"
        FKind.NONZERO -> "$x != 0"
        FKind.PRIME -> "is_prime($x)"
        FKind.COMPOSITE -> "$x > 1 and not is_prime($x)"
        FKind.DIV -> "$x % ${fl.p} == 0"
        FKind.NDIV -> "$x % ${fl.p} != 0"
        FKind.GT -> "$x > ${fl.p}"
        FKind.LT -> "$x < ${fl.p}"
        FKind.GE -> "$x >= ${fl.p}"
        FKind.LE -> "$x <= ${fl.p}"
        FKind.EQ -> "$x == ${fl.p}"
        FKind.NE -> "$x != ${fl.p}"
        FKind.PSQUARE -> "$x >= 0 and math.isqrt($x) ** 2 == $x"
        FKind.TWO_DIGIT -> "10 <= abs($x) <= 99"
        FKind.THREE_DIGIT -> "100 <= abs($x) <= 999"
        FKind.PALINDROME -> if (elem == ElemType.WORD) "$x.lower() == $x.lower()[::-1]" else "str($x) == str($x)[::-1]"
        FKind.VOWEL -> "$x in VOWELS"
        FKind.CONSONANT -> "$x.isalpha() and $x not in VOWELS"
        FKind.UPPER -> "$x.isupper()"
        FKind.LOWER -> "$x.islower()"
        FKind.LETTER -> "$x.isalpha()"
        FKind.DIGITCH -> "$x.isdigit()"
        FKind.SPACE -> "$x == \" \""
        FKind.LEN_GT -> "len($x) > ${fl.p}"
        FKind.LEN_LT -> "len($x) < ${fl.p}"
        FKind.LEN_EQ -> "len($x) == ${fl.p}"
    }

    /** Combined filter condition, or null when every element is taken. */
    fun cond(x: String = v): String? {
        if (f.filters.isEmpty()) return null
        if (f.filters.size == 1) return one(f.filters[0], x)
        return f.filters.joinToString(" and ") { fl ->
            val c = one(fl, x)
            if (" and " in c || " or " in c) "($c)" else c
        }
    }

    /** Condition for REMOVE (keep elements that do NOT match) or ALL (find a violator). */
    fun negCond(x: String = v): String {
        val c = cond(x) ?: "False"
        return when {
            f.filters.size == 1 && f.filters[0].kind == FKind.SPACE -> "$x != \" \""
            f.filters.size == 1 && f.filters[0].kind == FKind.VOWEL -> "$x not in VOWELS"
            c.startsWith("is_prime(") && f.filters.size == 1 -> "not $c"
            f.filters.size == 1 && c.endsWith("()") && !c.contains(' ') -> "not $c"
            else -> "not ($c)"
        }
    }

    /** Value after the optional transform. */
    fun value(x: String = v): String = when (f.transform) {
        Transform.NONE -> x
        Transform.SQUARE -> "$x ** 2"
        Transform.CUBE -> "$x ** 3"
        Transform.ABS -> "abs($x)"
    }

    val hasTransform: Boolean get() = f.transform != Transform.NONE

    // ------------------------------------------------------------------ input

    /** Scalars read together on the first line for numeric sources. */
    fun readInput(b: PyBuilder) {
        val params = f.paramVars
        when (f.source) {
            Source.DIGITS -> {
                val conv = if (f.natural || f.fixedDigits != null) "int(input())" else "abs(int(input()))"
                if (params.isEmpty()) b.line("n = $conv")
                else {
                    b.line("n, ${params.joinToString(", ")} = map(int, input().split())")
                    if (!f.natural && f.fixedDigits == null) b.line("n = abs(n)")
                }
            }
            Source.DIVISORS -> {
                if (params.isEmpty()) b.line("n = int(input())")
                else b.line("n, ${params.joinToString(", ")} = map(int, input().split())")
            }
            Source.LIST -> {
                if (f.listWithCount) b.line("n = int(input())")
                b.line("a = list(map(int, input().split()))")
                readParams(b, params)
            }
            Source.RANGE -> {
                val r = f.range!!
                val vars = r.readVars + params
                when (vars.size) {
                    0 -> {}
                    1 -> b.line("${vars[0]} = int(input())")
                    else -> b.line("${vars.joinToString(", ")} = map(int, input().split())")
                }
            }
            Source.CHARS -> {
                b.line("s = input()")
                readParams(b, params)
            }
            Source.WORDS -> {
                b.line("words = input().split()")
                readParams(b, params)
            }
            Source.MATRIX -> {
                b.line("n, m = map(int, input().split())")
                b.line("a = [list(map(int, input().split())) for _ in range(n)]")
                readParams(b, params)
            }
        }
    }

    private fun readParams(b: PyBuilder, params: List<String>) {
        when (params.size) {
            0 -> {}
            1 -> b.line("${params[0]} = int(input())")
            else -> b.line("${params.joinToString(", ")} = map(int, input().split())")
        }
    }

    // ------------------------------------------------------------------ range helpers

    val lo: String get() = f.range!!.lo
    val hi: String get() = f.range!!.hi

    /** Exclusive upper bound for range(): "n + 1", or "n" when hi is "n - 1". */
    val hiExcl: String
        get() {
            val h = hi
            h.toBigIntegerOrNull()?.let { return (it + java.math.BigInteger.ONE).toString() }
            if (h.endsWith(" - 1")) return h.removeSuffix(" - 1")
            return "$h + 1"
        }

    val rangeExpr: String get() = if (lo == "0") "range($hiExcl)" else "range($lo, $hiExcl)"

    // ------------------------------------------------------------------ outputs

    /** Python statement printing a list of results in the format of the source. */
    fun printList(listVar: String): String = when (elem) {
        ElemType.CHAR -> "print(\"\".join($listVar))"
        else -> "print(*$listVar)"
    }

    /** Python statement printing a generator/iterable of results. */
    fun printIter(iter: String): String = when (elem) {
        ElemType.CHAR -> "print(\"\".join($iter))"
        else -> "print(*$iter)"
    }

    val isWordLen: Boolean get() = elem == ElemType.WORD

    /** Comparison key for MAX/MIN (words compare by length). */
    fun key(x: String): String = if (isWordLen) "len($x)" else x

    // ------------------------------------------------------------------ loop accumulators

    /**
     * Emits the loop-based accumulator for [op]. [body] receives a builder positioned
     * inside the loop body and a function that emits the per-element update.
     */
    fun loopInit(b: PyBuilder, op: Op) {
        when (op) {
            Op.SUM -> b.line("total = 0")
            Op.PRODUCT -> b.line("product = 1")
            Op.COUNT -> b.line("count = 0")
            Op.AVERAGE -> b.lines("total = 0", "count = 0")
            Op.MAX, Op.MIN -> b.line("best = None")
            Op.RANGE_DIFF -> b.lines("smallest = None", "largest = None")
            Op.SELECT, Op.REMOVE -> b.line("result = []")
            Op.UNIQUE_COUNT -> b.line("seen = set()")
            Op.UNIQUE_LIST -> b.lines("seen = set()", "result = []")
            Op.ANY -> b.line("found = False")
            Op.ALL -> b.line("ok = True")
            Op.FIRST, Op.LAST -> b.line("answer = None")
            else -> error("loopInit: unsupported $op")
        }
    }

    /** Per-element update; [allowBreak] is false inside nested loops. */
    fun loopUpdate(b: PyBuilder, op: Op, value: String, allowBreak: Boolean = true) {
        when (op) {
            Op.SUM -> b.line("total += $value")
            Op.PRODUCT -> b.line("product *= $value")
            Op.COUNT -> b.line("count += 1")
            Op.AVERAGE -> b.lines("total += $value", "count += 1")
            Op.MAX -> b.block("if best is None or ${key(value)} > ${key("best")}:") { line("best = $value") }
            Op.MIN -> b.block("if best is None or ${key(value)} < ${key("best")}:") { line("best = $value") }
            Op.RANGE_DIFF -> {
                b.block("if smallest is None or $value < smallest:") { line("smallest = $value") }
                b.block("if largest is None or $value > largest:") { line("largest = $value") }
            }
            Op.SELECT, Op.REMOVE -> b.line("result.append($value)")
            Op.UNIQUE_COUNT -> b.line("seen.add($value)")
            Op.UNIQUE_LIST -> b.block("if $value not in seen:") {
                line("seen.add($value)")
                line("result.append($value)")
            }
            Op.ANY -> { b.line("found = True"); if (allowBreak) b.line("break") }
            Op.FIRST -> if (allowBreak) b.lines("answer = $value", "break") else b.block("if answer is None:") { line("answer = $value") }
            Op.LAST -> b.line("answer = $value")
            Op.ALL -> { b.line("ok = False"); if (allowBreak) b.line("break") }
            else -> error("loopUpdate: unsupported $op")
        }
    }

    fun loopFinish(b: PyBuilder, op: Op) {
        when (op) {
            Op.SUM -> b.line("print(total)")
            Op.PRODUCT -> b.line("print(product)")
            Op.COUNT -> b.line("print(count)")
            Op.AVERAGE -> {
                b.block("if count > 0:") { line("print(total / count)") }
                b.block("else:") { line("print(\"NO\")") }
            }
            Op.MAX, Op.MIN -> b.line("print(best if best is not None else \"NO\")")
            Op.RANGE_DIFF -> b.line("print(largest - smallest if smallest is not None else \"NO\")")
            Op.SELECT, Op.REMOVE, Op.UNIQUE_LIST -> b.line(printList("result"))
            Op.UNIQUE_COUNT -> b.line("print(len(seen))")
            Op.ANY -> b.line("print(\"YES\" if found else \"NO\")")
            Op.ALL -> b.line("print(\"YES\" if ok else \"NO\")")
            Op.FIRST, Op.LAST -> b.line("print(answer if answer is not None else \"NO\")")
            else -> error("loopFinish: unsupported $op")
        }
    }

    /**
     * Emits "[if cond:] update" for the element [x]. For ALL the condition is negated
     * (we look for an element that breaks the rule); for REMOVE we keep non-matching ones.
     */
    fun filteredUpdate(b: PyBuilder, op: Op, x: String = v, allowBreak: Boolean = true, extraCond: String? = null) {
        val c = when (op) {
            Op.ALL -> negCond(x)
            Op.REMOVE -> negCond(x)
            else -> cond(x)
        }
        val full = listOfNotNull(extraCond, c).joinToString(" and ").ifEmpty { null }
        if (full == null) loopUpdate(b, op, value(x), allowBreak)
        else b.block("if $full:") { loopUpdate(this, op, value(x), allowBreak) }
    }

    // ------------------------------------------------------------------ builtin (generator) forms

    /** Generator expression "VALUE for x in ITER if COND". */
    fun gen(forClause: String, x: String = v, extraCond: String? = null, op: Op? = null): String {
        val c = listOfNotNull(extraCond, if (op == Op.REMOVE) negCond(x) else cond(x)).joinToString(" and ")
        return value(x) + " " + forClause + (if (c.isNotEmpty()) " if $c" else "")
    }

    /** Builtin-function solution lines for [op] given a for-clause over elements. Returns null if not expressible. */
    fun builtinLines(b: PyBuilder, op: Op, forClause: String, x: String = v, extraCond: String? = null, sizeExpr: String? = null): Boolean {
        val g = gen(forClause, x, extraCond, op)
        val c = listOfNotNull(extraCond, cond(x)).joinToString(" and ").ifEmpty { null }
        when (op) {
            Op.SUM -> b.line("print(sum($g))")
            Op.PRODUCT -> { b.import("import math"); b.line("print(math.prod($g))") }
            Op.COUNT -> if (c == null && sizeExpr != null) b.line("print($sizeExpr)") else b.line("print(sum(1 $forClause${if (c != null) " if $c" else ""}))")
            Op.AVERAGE -> {
                b.line("values = [$g]")
                b.line("print(sum(values) / len(values) if values else \"NO\")")
            }
            Op.MAX, Op.MIN -> {
                val fn = if (op == Op.MAX) "max" else "min"
                val k = if (isWordLen) ", key=len" else ""
                b.line("print($fn(($g)$k, default=\"NO\"))")
            }
            Op.RANGE_DIFF -> {
                b.line("values = [$g]")
                b.line("print(max(values) - min(values) if values else \"NO\")")
            }
            Op.SELECT, Op.REMOVE -> b.line(if (elem == ElemType.CHAR) "print(\"\".join($g))" else "print(*[$g])")
            Op.UNIQUE_COUNT -> b.line("print(len({$g}))")
            Op.UNIQUE_LIST -> b.line(printIter("dict.fromkeys($g)"))
            Op.ANY -> b.line("print(\"YES\" if any(${c ?: "True"} $forClause) else \"NO\")")
            Op.ALL -> b.line("print(\"YES\" if all(${cond(x)} $forClause${if (extraCond != null) " if $extraCond" else ""}) else \"NO\")")
            Op.FIRST -> b.line("print(next(($g), \"NO\"))")
            Op.LAST -> {
                b.line("values = [$g]")
                b.line("print(values[-1] if values else \"NO\")")
            }
            else -> return false
        }
        return true
    }

    /** Functional (map/filter/reduce) solution lines. [iterable] is the element iterable. */
    fun functionalLines(b: PyBuilder, op: Op, iterable: String, x: String = v): Boolean {
        val c = cond(x)
        var seq = if (c != null) "filter(lambda $x: $c, $iterable)" else iterable
        if (hasTransform && op in setOf(Op.SUM, Op.PRODUCT, Op.MAX, Op.MIN, Op.AVERAGE, Op.SELECT, Op.FIRST, Op.LAST, Op.RANGE_DIFF, Op.UNIQUE_COUNT, Op.UNIQUE_LIST)) {
            seq = "map(lambda $x: ${value(x)}, $seq)"
        }
        when (op) {
            Op.SUM -> b.line("print(sum($seq))")
            Op.PRODUCT -> {
                b.import("from functools import reduce")
                b.import("import operator")
                b.line("print(reduce(operator.mul, $seq, 1))")
            }
            Op.COUNT -> {
                if (c == null) return false
                b.line("print(len(list($seq)))")
            }
            Op.AVERAGE -> {
                b.line("values = list($seq)")
                b.line("print(sum(values) / len(values) if values else \"NO\")")
            }
            Op.MAX, Op.MIN -> {
                val fn = if (op == Op.MAX) "max" else "min"
                val k = if (isWordLen) ", key=len" else ""
                b.line("print($fn($seq$k, default=\"NO\"))")
            }
            Op.SELECT -> b.line(printIter(seq))
            Op.REMOVE -> b.line(printIter("filter(lambda $x: ${negCond(x)}, $iterable)"))
            Op.UNIQUE_COUNT -> b.line("print(len(set($seq)))")
            Op.UNIQUE_LIST -> b.line(printIter("dict.fromkeys($seq)"))
            Op.ANY -> b.line("print(\"YES\" if any(map(lambda $x: ${c ?: "True"}, $iterable)) else \"NO\")")
            Op.ALL -> b.line("print(\"YES\" if all(map(lambda $x: $c, $iterable)) else \"NO\")")
            Op.FIRST -> b.line("print(next(${if (seq == iterable) "iter($seq)" else seq}, \"NO\"))")
            Op.LAST -> {
                b.import("from functools import reduce")
                b.line("print(reduce(lambda last, $x: $x, $seq, \"NO\"))")
            }
            else -> return false
        }
        return true
    }
}
