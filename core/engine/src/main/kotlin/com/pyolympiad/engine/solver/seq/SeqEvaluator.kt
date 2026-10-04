package com.pyolympiad.engine.solver.seq

import java.math.BigDecimal
import java.math.BigInteger

/**
 * Independent Kotlin implementation of a [Frame]. It is used to
 *  - compute the answer instantly when the statement contains concrete numbers,
 *  - cross-check every generated Python method in unit tests.
 * Returns null when the input does not fit the frame (the caller then relies on Python).
 */
object SeqEvaluator {

    private sealed class E {
        data class I(val v: BigInteger) : E()
        data class C(val v: String) : E()
        data class W(val v: String) : E()
    }

    private class Input(lines: List<String>) {
        private val ls = lines
        private var pos = 0
        fun line(): String = if (pos < ls.size) ls[pos++] else throw IllegalArgumentException("EOF")
        fun ints(): List<BigInteger> = line().trim().split(Regex("\\s+")).filter { it.isNotEmpty() }.map { BigInteger(it) }
    }

    fun evaluate(f: Frame, stdin: String): String? = try {
        run(f, stdin)
    } catch (e: Exception) {
        null
    }

    private fun run(f: Frame, stdin: String): String {
        val inp = Input(stdin.split("\n").let { if (it.isNotEmpty() && it.last().isEmpty()) it.dropLast(1) else it })
        val vars = HashMap<String, BigInteger>()
        val params = f.paramVars
        val elems: List<E>
        when (f.source) {
            Source.DIGITS, Source.DIVISORS -> {
                val nums = inp.ints()
                var n = nums[0]
                params.forEachIndexed { i, p -> vars[p] = nums[i + 1] }
                if (f.source == Source.DIGITS) {
                    if (!(f.natural || f.fixedDigits != null)) n = n.abs()
                    if (f.op == Op.REVERSE) return reverseNumber(n)
                    if (n.signum() < 0) throw IllegalArgumentException("negative")
                    elems = n.toString().map { E.I(BigInteger.valueOf((it - '0').toLong())) }
                } else {
                    if (n.signum() <= 0) throw IllegalArgumentException("n must be positive")
                    if (n > BigInteger.valueOf(2_000_000)) throw IllegalArgumentException("too big for reference")
                    val nn = n.toLong()
                    val upper = if (f.proper) nn - 1 else nn
                    elems = (1..upper).filter { nn % it == 0L }.map { E.I(BigInteger.valueOf(it)) }
                }
            }
            Source.LIST -> {
                if (f.listWithCount) inp.line()
                elems = inp.ints().map { E.I(it) }
                readParams(inp, params, vars)
            }
            Source.RANGE -> {
                val r = f.range!!
                val names = r.readVars + params
                if (names.isNotEmpty()) {
                    val nums = inp.ints()
                    names.forEachIndexed { i, p -> vars[p] = nums[i] }
                }
                val lo = expr(r.lo, vars)
                val hi = expr(r.hi, vars)
                if (hi - lo > BigInteger.valueOf(3_000_000)) throw IllegalArgumentException("range too big for reference")
                val list = ArrayList<E>()
                var i = lo
                while (i <= hi) { list += E.I(i); i += BigInteger.ONE }
                elems = list
            }
            Source.CHARS -> {
                val s = inp.line()
                readParams(inp, params, vars)
                elems = s.codePoints().toArray().map { E.C(String(Character.toChars(it))) }
            }
            Source.WORDS -> {
                val s = inp.line()
                readParams(inp, params, vars)
                elems = s.trim().split(Regex("\\s+")).filter { it.isNotEmpty() }.map { E.W(it) }
            }
            Source.MATRIX -> {
                val (n, _) = inp.ints()
                val list = ArrayList<E>()
                repeat(n.toInt()) { list += inp.ints().map { E.I(it) } }
                readParams(inp, params, vars)
                elems = list
            }
        }
        return apply(f, elems, vars)
    }

    private fun readParams(inp: Input, params: List<String>, vars: MutableMap<String, BigInteger>) {
        if (params.isEmpty()) return
        val nums = inp.ints()
        params.forEachIndexed { i, p -> vars[p] = nums[i] }
    }

    private fun expr(e: String, vars: Map<String, BigInteger>): BigInteger {
        val t = e.trim()
        if (t.endsWith(" - 1")) return expr(t.removeSuffix(" - 1"), vars) - BigInteger.ONE
        t.toBigIntegerOrNull()?.let { return it }
        return vars[t] ?: throw IllegalArgumentException("unknown $t")
    }

    private fun reverseNumber(n: BigInteger): String = BigInteger(n.toString().reversed()).toString()

    private fun param(fl: Filter, vars: Map<String, BigInteger>): BigInteger =
        fl.param?.let { expr(it.toString(), vars) } ?: vars["k"] ?: throw IllegalArgumentException("no param")

    private fun isPrime(x: BigInteger): Boolean {
        if (x < BigInteger.TWO) return false
        if (x.bitLength() > 62) return x.isProbablePrime(50)
        val v = x.toLong()
        var i = 2L
        while (i * i <= v) { if (v % i == 0L) return false; i++ }
        return true
    }

    private val VOWELS = SeqCode.VOWELS

    private fun test(fl: Filter, e: E, vars: Map<String, BigInteger>): Boolean = when (e) {
        is E.I -> {
            val x = e.v
            when (fl.kind) {
                FKind.EVEN -> !x.testBit(0)
                FKind.ODD -> x.testBit(0)
                FKind.POSITIVE -> x.signum() > 0
                FKind.NEGATIVE -> x.signum() < 0
                FKind.ZERO -> x.signum() == 0
                FKind.NONZERO -> x.signum() != 0
                FKind.PRIME -> isPrime(x)
                FKind.COMPOSITE -> x > BigInteger.ONE && !isPrime(x)
                FKind.DIV -> x.mod(param(fl, vars).abs()).signum() == 0
                FKind.NDIV -> x.mod(param(fl, vars).abs()).signum() != 0
                FKind.GT -> x > param(fl, vars)
                FKind.LT -> x < param(fl, vars)
                FKind.GE -> x >= param(fl, vars)
                FKind.LE -> x <= param(fl, vars)
                FKind.EQ -> x == param(fl, vars)
                FKind.NE -> x != param(fl, vars)
                FKind.PSQUARE -> x.signum() >= 0 && x.sqrt().let { it * it == x }
                FKind.TWO_DIGIT -> x.abs() in BigInteger.TEN..BigInteger.valueOf(99)
                FKind.THREE_DIGIT -> x.abs() in BigInteger.valueOf(100)..BigInteger.valueOf(999)
                FKind.PALINDROME -> x.toString() == x.toString().reversed()
                else -> error("filter ${fl.kind} on int")
            }
        }
        is E.C -> {
            val ch = e.v
            val cp = ch.codePointAt(0)
            when (fl.kind) {
                FKind.VOWEL -> ch in VOWELS.map { it.toString() }
                FKind.CONSONANT -> Character.isLetter(cp) && ch !in VOWELS.map { it.toString() }
                FKind.UPPER -> Character.isUpperCase(cp)
                FKind.LOWER -> Character.isLowerCase(cp)
                FKind.LETTER -> Character.isLetter(cp)
                FKind.DIGITCH -> Character.isDigit(cp)
                FKind.SPACE -> ch == " "
                else -> error("filter ${fl.kind} on char")
            }
        }
        is E.W -> when (fl.kind) {
            FKind.PALINDROME -> e.v.lowercase() == e.v.lowercase().reversed()
            FKind.LEN_GT -> e.v.length.toBigInteger() > param(fl, vars)
            FKind.LEN_LT -> e.v.length.toBigInteger() < param(fl, vars)
            FKind.LEN_EQ -> e.v.length.toBigInteger() == param(fl, vars)
            else -> error("filter ${fl.kind} on word")
        }
    }

    private fun ok(f: Frame, e: E, vars: Map<String, BigInteger>) = f.filters.all { test(it, e, vars) }

    private fun transform(f: Frame, e: E): E = when {
        e !is E.I -> e
        f.transform == Transform.SQUARE -> E.I(e.v * e.v)
        f.transform == Transform.CUBE -> E.I(e.v * e.v * e.v)
        f.transform == Transform.ABS -> E.I(e.v.abs())
        else -> e
    }

    private fun show(e: E): String = when (e) {
        is E.I -> e.v.toString()
        is E.C -> e.v
        is E.W -> e.v
    }

    private fun cmpKey(e: E): BigInteger = when (e) {
        is E.I -> e.v
        is E.W -> e.v.length.toBigInteger()
        is E.C -> e.v.codePointAt(0).toBigInteger()
    }

    private fun joinOut(f: Frame, list: List<E>): String =
        if (f.elem == ElemType.CHAR) list.joinToString("") { show(it) } else list.joinToString(" ") { show(it) }

    private fun apply(f: Frame, elems: List<E>, vars: Map<String, BigInteger>): String {
        val sel = elems.filter { ok(f, it, vars) }.map { transform(f, it) }
        return when (f.op) {
            Op.SUM -> sel.fold(BigInteger.ZERO) { a, e -> a + (e as E.I).v }.toString()
            Op.PRODUCT -> sel.fold(BigInteger.ONE) { a, e -> a * (e as E.I).v }.toString()
            Op.COUNT -> sel.size.toString()
            Op.AVERAGE -> if (sel.isEmpty()) "NO" else pyFloat(
                BigDecimal(sel.fold(BigInteger.ZERO) { a, e -> a + (e as E.I).v })
                    .divide(BigDecimal(sel.size), java.math.MathContext(40)).toDouble(),
            )
            Op.MAX -> sel.fold(null as E?) { b, e -> if (b == null || cmpKey(e) > cmpKey(b)) e else b }?.let { show(it) } ?: "NO"
            Op.MIN -> sel.fold(null as E?) { b, e -> if (b == null || cmpKey(e) < cmpKey(b)) e else b }?.let { show(it) } ?: "NO"
            Op.RANGE_DIFF -> if (sel.isEmpty()) "NO" else (sel.maxOf { cmpKey(it) } - sel.minOf { cmpKey(it) }).toString()
            Op.SELECT -> joinOut(f, sel)
            Op.REMOVE -> joinOut(f, elems.filter { !ok(f, it, vars) })
            Op.UNIQUE_COUNT -> sel.map { show(it) }.toSet().size.toString()
            Op.UNIQUE_LIST -> joinOut(f, sel.distinctBy { show(it) })
            Op.ANY -> if (sel.isNotEmpty()) "YES" else "NO"
            Op.ALL -> if (elems.all { ok(f, it, vars) }) "YES" else "NO"
            Op.FIRST -> sel.firstOrNull()?.let { show(it) } ?: "NO"
            Op.LAST -> sel.lastOrNull()?.let { show(it) } ?: "NO"
            Op.REVERSE -> joinOut(f, elems.reversed())
            Op.SORT_ASC, Op.SORT_DESC -> {
                val sorted = sortElems(sel).let { if (f.op == Op.SORT_DESC) it.reversed() else it }
                if (f.source == Source.DIGITS) sorted.joinToString("") { show(it) } else joinOut(f, sorted)
            }
            Op.INDEX_MAX, Op.INDEX_MIN -> {
                val idx = elems.indices.filter { ok(f, elems[it], vars) }
                if (idx.isEmpty()) "NO" else {
                    var best = idx[0]
                    for (i in idx) {
                        val better = if (f.op == Op.INDEX_MAX) cmpKey(elems[i]) > cmpKey(elems[best]) else cmpKey(elems[i]) < cmpKey(elems[best])
                        if (better) best = i
                    }
                    (best + if (f.oneBased) 1 else 0).toString()
                }
            }
        }
    }

    private fun sortElems(list: List<E>): List<E> = when {
        list.all { it is E.I } -> list.sortedBy { (it as E.I).v }
        else -> list.sortedWith { a, b -> compareCodePoints(show(a), show(b)) }
    }

    private fun compareCodePoints(a: String, b: String): Int {
        val x = a.codePoints().toArray()
        val y = b.codePoints().toArray()
        for (i in 0 until minOf(x.size, y.size)) if (x[i] != y[i]) return x[i].compareTo(y[i])
        return x.size.compareTo(y.size)
    }

    /** Python's repr() of a float (shortest round-trip, Python exponent rules). */
    fun pyFloat(d: Double): String {
        if (d.isNaN()) return "nan"
        if (d.isInfinite()) return if (d > 0) "inf" else "-inf"
        if (d == 0.0) return if (1.0 / d < 0) "-0.0" else "0.0"
        val bd = BigDecimal(d.toString())
        val exp = bd.precision() - bd.scale() - 1
        return if (exp < -4 || exp >= 16) {
            val digits = bd.unscaledValue().abs().toString().trimEnd('0').ifEmpty { "0" }
            val mant = if (digits.length == 1) digits else digits[0] + "." + digits.substring(1)
            val sign = if (d < 0) "-" else ""
            val e = if (exp < 0) "-" + String.format("%02d", -exp) else "+" + String.format("%02d", exp)
            "$sign${mant}e$e"
        } else {
            val plain = bd.stripTrailingZeros().toPlainString()
            if (plain.contains('.')) plain else "$plain.0"
        }
    }
}
