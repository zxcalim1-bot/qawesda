package com.pyolympiad.engine

import com.pyolympiad.engine.nlp.Operand
import com.pyolympiad.engine.solver.seq.ElemType
import com.pyolympiad.engine.solver.seq.FKind
import com.pyolympiad.engine.solver.seq.Filter
import com.pyolympiad.engine.solver.seq.Frame
import com.pyolympiad.engine.solver.seq.Op
import com.pyolympiad.engine.solver.seq.RangeBounds
import com.pyolympiad.engine.solver.seq.SeqEvaluator
import com.pyolympiad.engine.solver.seq.SeqGenerator
import com.pyolympiad.engine.solver.seq.SequenceSkill
import com.pyolympiad.engine.solver.seq.Source
import com.pyolympiad.engine.solver.seq.Transform
import org.junit.Assert.assertTrue
import org.junit.Assume.assumeTrue
import org.junit.Test
import java.math.BigInteger

/**
 * Generates every supported (source, operation, filter) combination, runs all generated
 * Python methods on sample inputs and checks them against the independent Kotlin evaluator.
 */
class SeqGeneratorTest {

    private fun filtersFor(elem: ElemType): List<List<Filter>> {
        val k3 = Operand.Num(BigInteger.valueOf(3))
        val kv = Operand.Var("k")
        val singles = when (elem) {
            ElemType.INT -> listOf(
                Filter(FKind.EVEN), Filter(FKind.ODD), Filter(FKind.POSITIVE), Filter(FKind.NEGATIVE), Filter(FKind.ZERO),
                Filter(FKind.NONZERO), Filter(FKind.PRIME), Filter(FKind.COMPOSITE), Filter(FKind.DIV, k3), Filter(FKind.NDIV, k3),
                Filter(FKind.DIV, kv), Filter(FKind.GT, k3), Filter(FKind.LT, k3), Filter(FKind.GE, k3), Filter(FKind.LE, k3),
                Filter(FKind.EQ, k3), Filter(FKind.NE, k3), Filter(FKind.PSQUARE), Filter(FKind.TWO_DIGIT), Filter(FKind.THREE_DIGIT),
                Filter(FKind.PALINDROME),
            )
            ElemType.CHAR -> listOf(
                Filter(FKind.VOWEL), Filter(FKind.CONSONANT), Filter(FKind.UPPER), Filter(FKind.LOWER), Filter(FKind.LETTER),
                Filter(FKind.DIGITCH), Filter(FKind.SPACE),
            )
            ElemType.WORD -> listOf(
                Filter(FKind.PALINDROME), Filter(FKind.LEN_GT, k3), Filter(FKind.LEN_LT, k3), Filter(FKind.LEN_EQ, k3), Filter(FKind.LEN_GT, kv),
            )
        }
        val combos = when (elem) {
            ElemType.INT -> listOf(listOf(Filter(FKind.EVEN), Filter(FKind.POSITIVE)), listOf(Filter(FKind.ODD), Filter(FKind.GT, k3)))
            ElemType.CHAR -> listOf(listOf(Filter(FKind.UPPER), Filter(FKind.VOWEL)))
            ElemType.WORD -> emptyList()
        }
        return listOf(emptyList<Filter>()) + singles.map { listOf(it) } + combos
    }

    private fun frames(): List<Frame> {
        val out = ArrayList<Frame>()
        val ranges = listOf(
            RangeBounds("1", "n", listOf("n"), BigInteger.ONE, null),
            RangeBounds("a", "b", listOf("a", "b"), null, null),
            RangeBounds("1", "n - 1", listOf("n"), BigInteger.ONE, null),
        )
        for (source in Source.entries) {
            for (op in Op.entries) {
                for (filters in filtersFor(source.elemType)) {
                    val transforms = if (source.elemType == ElemType.INT && op in setOf(Op.SUM, Op.MAX, Op.SELECT) && filters.size <= 1)
                        listOf(Transform.NONE, Transform.SQUARE, Transform.ABS) else listOf(Transform.NONE)
                    for (tr in transforms) {
                        val base = Frame(source, op, filters, tr)
                        when (source) {
                            Source.RANGE -> ranges.forEach { out += base.copy(range = it) }
                            Source.LIST -> { out += base; out += base.copy(listWithCount = true, oneBased = false) }
                            Source.DIGITS -> { out += base; out += base.copy(natural = true) }
                            Source.DIVISORS -> { out += base.copy(natural = true); if (filters.isEmpty()) out += base.copy(natural = true, proper = true) }
                            else -> out += base
                        }
                    }
                }
            }
        }
        // Fixed-length numbers (spec example: reverse a four-digit number).
        for (d in 2..6) out += Frame(Source.DIGITS, Op.REVERSE, fixedDigits = d)
        return out
    }

    @Test
    fun allGeneratedMethodsAgreeWithReference() {
        assumeTrue("python3 not available", PyHarness.available)
        data class Case(val frame: Frame, val method: String, val code: String, val input: String, val expected: String)
        val cases = ArrayList<Case>()
        var framesWithMethods = 0
        var totalMethods = 0
        for (f in frames()) {
            val methods = SeqGenerator.methods(f)
            if (methods.isEmpty()) continue
            framesWithMethods++
            totalMethods += methods.size
            val sol = SequenceSkill.solve(f, null, 1.0) ?: continue
            for (s in sol.samples) {
                val expected = s.expected ?: continue
                for (m in methods) cases += Case(f, m.title, m.code, s.input, expected)
            }
        }
        println("frames with methods: $framesWithMethods, methods: $totalMethods, executions: ${cases.size}")
        val results = PyHarness.run(cases.map { PyHarness.Job(it.code, it.input) })
        val failures = ArrayList<String>()
        for ((c, r) in cases.zip(results)) {
            if (!r.ok || !PyHarness.same(r.output, c.expected)) {
                failures += "${c.frame}\n  method: ${c.method}\n  input: ${c.input.replace("\n", "\\n")}\n  expected: ${c.expected}\n  got: ${r.output.trim()} ${r.error ?: ""}\n${c.code.prependIndent("    | ")}"
            }
        }
        val byKind = cases.zip(results).filter { (c, r) -> !r.ok || !PyHarness.same(r.output, c.expected) }
            .groupingBy { (c, _) -> "${c.frame.source}/${c.frame.op}/${c.method}" }.eachCount()
        byKind.entries.sortedByDescending { it.value }.take(40).forEach { println("  ${it.value}  ${it.key}") }
        failures.take(12).forEach { println("FAIL\n$it") }
        assertTrue("${failures.size} of ${cases.size} executions failed", failures.isEmpty())
    }

    @Test
    fun specExampleReverseFourDigitHasFiveDistinctMethods() {
        val methods = SeqGenerator.methods(Frame(Source.DIGITS, Op.REVERSE, fixedDigits = 4))
        assertTrue(methods.size >= 5)
        assertTrue(methods.map { it.approach }.toSet().size == methods.size)
        assertTrue(SeqEvaluator.evaluate(Frame(Source.DIGITS, Op.REVERSE, fixedDigits = 4), "1200") == "21")
    }
}
