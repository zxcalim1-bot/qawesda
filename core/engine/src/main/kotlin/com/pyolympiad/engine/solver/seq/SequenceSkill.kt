package com.pyolympiad.engine.solver.seq

import com.pyolympiad.engine.nlp.ParsedQuery
import com.pyolympiad.engine.solver.Method
import com.pyolympiad.engine.solver.MethodRole
import com.pyolympiad.engine.solver.SampleTest
import com.pyolympiad.engine.solver.Solution
import java.math.BigInteger

/** Builds a complete [Solution] for a sequence [Frame]. */
object SequenceSkill {

    fun solve(frame: Frame, q: ParsedQuery?, confidence: Double): Solution? {
        val methods = order(SeqGenerator.methods(frame), frame, q)
        if (methods.isEmpty()) return null
        val (algo, why) = SeqTexts.algorithm(frame)
        val samples = SeqTexts.samples(frame).map { input ->
            SampleTest(input, SeqEvaluator.evaluate(frame, input))
        }
        val concrete = q?.let { SeqTexts.concreteInput(frame, it) }
        val native = concrete?.let { SeqEvaluator.evaluate(frame, it) }
        return Solution(
            skillId = "seq:" + frame.source.name.lowercase() + ":" + frame.op.name.lowercase(),
            title = SeqTexts.title(frame),
            understood = SeqTexts.understood(frame),
            topics = SeqTexts.topics(frame),
            keyIdeas = keyIdeas(frame),
            dataStructures = SeqTexts.dataStructures(frame),
            algorithm = algo,
            algorithmWhy = why + constraintAdvice(frame, q, methods),
            inputFormat = SeqTexts.inputFormat(frame),
            outputFormat = SeqTexts.outputFormat(frame),
            constraintNote = q?.let { constraintsText(it) },
            methods = methods,
            edgeCases = SeqTexts.edgeCases(frame, q),
            samples = samples,
            concreteInput = concrete,
            nativeAnswer = native,
            explanation = SeqTexts.explanation(frame, methods.first()),
            knowledge = SeqTexts.knowledge(frame),
            confidence = confidence,
        )
    }

    private fun keyIdeas(f: Frame): List<String> {
        val k = ArrayList<String>()
        when (f.source) {
            Source.DIGITS -> k += listOf("n % 10 — последняя цифра", "n // 10 — число без последней цифры", "str(n) — запись числа как строка")
            Source.LIST -> k += listOf("Обход списка циклом for", "Накопление ответа в переменной")
            Source.RANGE -> k += listOf("range(a, b + 1) включает b", "Сумма прогрессии = (первый + последний) · количество / 2")
            Source.CHARS -> k += listOf("Строка — последовательность символов", "Методы str.isalpha / isupper / isdigit")
            Source.WORDS -> k += listOf("s.split() делит строку на слова", "key=len сравнивает слова по длине")
            Source.DIVISORS -> k += listOf("d делит n ⇔ n % d == 0", "Делители парные: d и n // d")
            Source.MATRIX -> k += listOf("Матрица = список строк", "Вложенные циклы")
        }
        if (f.filters.any { it.kind == FKind.PRIME }) k += "Простое число делится только на 1 и на себя; проверка до √x"
        if (f.filters.any { it.kind == FKind.EVEN || it.kind == FKind.ODD }) k += "Чётность: x % 2 == 0"
        return k
    }

    /** Orders methods by the spec priority; for huge inputs the most efficient one goes first. */
    private fun order(methods: List<Method>, f: Frame, q: ParsedQuery?): List<Method> {
        val sorted = methods.sortedBy { it.role.order }
        val big = q?.maxBound ?: return sorted
        val huge = big >= BigInteger.valueOf(10_000_000)
        if (huge && f.source in setOf(Source.RANGE, Source.DIVISORS)) {
            val eff = sorted.filter { it.role == MethodRole.EFFICIENT }
            return eff + sorted.filter { it.role != MethodRole.EFFICIENT }
        }
        return sorted
    }

    private fun constraintAdvice(f: Frame, q: ParsedQuery?, methods: List<Method>): String {
        val big = q?.maxBound ?: return ""
        if (big < BigInteger.valueOf(10_000_000)) return " По ограничениям (до $big) подойдёт любой из способов."
        val eff = methods.firstOrNull { it.role == MethodRole.EFFICIENT } ?: return " Ограничения большие (до $big): следите за временем работы."
        return " Ограничения большие (до $big): перебор за O(n) не уложится в 1–2 секунды, поэтому первым показан способ «${eff.title}» (${eff.time})."
    }

    fun constraintsText(q: ParsedQuery): String? {
        if (q.bounds.isEmpty()) return null
        return q.bounds.joinToString("; ") { b ->
            val v = b.variable ?: "значения"
            when {
                b.lower != null && b.upper != null -> "${b.lower} ≤ $v ≤ ${b.upper}"
                b.upper != null -> "$v ≤ ${b.upper}"
                else -> "$v ≥ ${b.lower}"
            }
        }
    }
}
