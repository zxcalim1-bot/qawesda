package com.pyolympiad.engine

import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Assume.assumeTrue
import org.junit.Test
import java.io.File

/**
 * End-to-end: statement (any supported language) → chosen skill → every generated method
 * executed with python3 on the skill's samples, all methods must agree.
 */
class SolverGoldenTest {

    companion object {
        val engine: Engine by lazy {
            Engine.load(
                readText = { p -> File(TestAssets.root, p).takeIf { it.exists() }?.readText() },
                listDir = { p -> File(TestAssets.root, p).list()?.toList() ?: emptyList() },
            )
        }

        /** statement -> expected skill id (prefix match: "seq:digits:sum" or "gcd"). */
        val CASES = listOf(
            // spec examples
            "n natural son berilgan uning raqamlari yigindisini toping" to "seq:digits:sum",
            "Дано натуральное число N. Найти сумму его цифр." to "seq:digits:sum",
            "Дано четырёхзначное число. Вывести его в обратном порядке" to "seq:digits:reverse",
            // russian
            "Найдите количество чётных цифр числа" to "seq:digits:count",
            "Найти произведение нечётных цифр натурального числа n" to "seq:digits:product",
            "Найти наибольшую цифру числа" to "seq:digits:max",
            "Найдите сумму чисел от 1 до n, делящихся на 3" to "seq:range:sum",
            "Сколько чисел от a до b делятся на k" to "seq:range:count",
            "Найдите среднее арифметическое положительных элементов массива" to "seq:list:average",
            "Найти максимальный элемент списка" to "seq:list:max",
            "Посчитайте количество гласных в строке" to "seq:chars:count",
            "Удалите все пробелы из строки" to "seq:chars:remove",
            "Найдите самое длинное слово в предложении" to "seq:words:max",
            "Найдите сумму всех делителей числа n" to "seq:divisors:sum",
            "Найдите сумму элементов матрицы" to "seq:matrix:sum",
            "Найдите НОД двух чисел" to "gcd",
            "Найти наименьшее общее кратное чисел a и b" to "lcm",
            "Проверить, является ли число простым" to "is_prime",
            "Вывести все простые числа, не превосходящие n" to "primes_upto",
            "Разложите число на простые множители" to "factorize",
            "Вычислите факториал числа n" to "factorial",
            "Найдите n-е число Фибоначчи" to "fibonacci",
            "Переведите число в двоичную систему счисления" to "to_base",
            "Переведите число из двоичной системы в десятичную" to "from_base",
            "Проверьте, является ли строка палиндромом" to "string_palindrome",
            "Являются ли две строки анаграммами" to "anagram",
            "Проверьте правильность скобочной последовательности" to "brackets",
            "Отсортируйте массив по убыванию" to "sort_list",
            "Бинарный поиск элемента в отсортированном массиве" to "binary_search",
            "Найдите максимальную сумму подотрезка массива" to "max_subarray",
            "Сколькими способами можно подняться по лестнице из n ступенек" to "stairs",
            "Найдите кратчайший путь в графе от вершины s до t" to "bfs_shortest",
            "Посчитайте количество компонент связности графа" to "components",
            "Определите, является ли год високосным" to "leap_year",
            "Решите квадратное уравнение" to "quadratic",
            "Найдите сумму двух чисел" to "two_numbers_sum",
            "Зашифруйте строку шифром Цезаря со сдвигом 3" to "caesar",
            "Найдите самый часто встречающийся элемент массива" to "most_frequent_element",
            "Задача о рюкзаке" to "knapsack",
            "Найдите наибольшую общую подпоследовательность двух строк" to "lcs",
            "Ханойская башня" to "hanoi",
            "Выведите все перестановки чисел от 1 до n" to "permutations_print",
            // translit
            "naiti summu chetnyh cifr chisla" to "seq:digits:sum",
            "proverit yavlyaetsya li chislo prostym" to "is_prime",
            "naidite NOD dvuh chisel" to "gcd",
            "otsortirovat massiv po vozrastaniyu" to "sort_list",
            "kolichestvo glasnyh bukv v stroke" to "seq:chars:count",
            // english
            "Find the sum of digits of a number" to "seq:digits:sum",
            "Count the even numbers in the array" to "seq:list:count",
            "Check whether a number is prime" to "is_prime",
            "Find the greatest common divisor of two numbers" to "gcd",
            "Reverse a string" to "seq:chars:reverse",
            "Find the factorial of n" to "factorial",
            "binary search in a sorted array" to "binary_search",
            "Find the longest word in a sentence" to "seq:words:max",
            // uzbek
            "massivdagi 5 dan katta sonlar sonini toping" to "seq:list:count",
            "ikki sonning EKUB ini toping" to "gcd",
            "sonning faktorialini hisoblang" to "factorial",
            "n sonining juft raqamlari yig'indisini toping" to "seq:digits:sum",
            "satrdagi unli harflar sonini toping" to "seq:chars:count",
            // typos
            "Найдите сумму цифр чсла" to "seq:digits:sum",
            "Найдите сумму диогоналей матрицы" to "matrix_diagonal_sum",
        )
    }

    @Test
    fun goldenStatementsPickExpectedSkill() {
        val failures = ArrayList<String>()
        for ((text, expected) in CASES) {
            val r = engine.solver.solve(text)
            val got = r.solution?.skillId
            if (got == null || !(got == expected || got.startsWith("$expected:") || got.startsWith(expected))) {
                failures += "«$text» → $got (expected $expected); alternatives=${r.alternatives.map { it.skillId + ":" + "%.1f".format(it.score) }}"
            }
        }
        failures.forEach { println("MISMATCH $it") }
        assertTrue("${failures.size} of ${CASES.size} statements mismatched", failures.isEmpty())
    }

    @Test
    fun specExampleUzbekProducesCanonicalWhileLoop() {
        val r = engine.solver.solve("n natural son berilgan uning raqamlari yigindisini toping")
        val s = assertNotNullAndGet(r.solution)
        assertEquals("узбекский (латиница)", r.languageTitle)
        val first = s.methods.first()
        assertTrue(first.code.contains("while n > 0:") && first.code.contains("n % 10") && first.code.contains("n //= 10"))
        assertTrue(s.methods.size >= 4)
        assertTrue(s.understood.contains("сумм"))
    }

    @Test
    fun specExampleReverseShowsFiveMethods() {
        val s = assertNotNullAndGet(engine.solver.solve("Дано четырёхзначное число. Вывести его в обратном порядке").solution)
        assertTrue("methods: ${s.methods.map { it.title }}", s.methods.size >= 5)
        assertTrue(s.methods.any { it.code.contains("n // 1000") })
        assertTrue(s.methods.any { it.code.contains("[::-1]") })
        assertTrue(s.methods.any { it.code.contains("divmod") })
    }

    @Test
    fun concreteNumbersGiveNativeAnswerOrInput() {
        val r = engine.solver.solve("Найдите сумму цифр числа 12345")
        val s = assertNotNullAndGet(r.solution)
        assertEquals("12345", s.concreteInput)
        assertEquals("15", s.nativeAnswer)
        val g = assertNotNullAndGet(engine.solver.solve("Найти НОД чисел 12 и 18").solution)
        assertEquals("12 18", g.concreteInput)
    }

    @Test
    fun gibberishFailsHonestly() {
        val r = engine.solver.solve("абырвалг qwerty")
        assertTrue(r.solution == null)
        assertEquals(com.pyolympiad.engine.solver.Solver.FAILURE, r.failure)
    }

    @Test
    fun allGoldenSolutionsRunAndAgree() {
        assumeTrue(PyHarness.available)
        data class Case(val text: String, val method: String, val code: String, val input: String, val expected: String?)
        val cases = ArrayList<Case>()
        for ((text, _) in CASES) {
            val s = engine.solver.solve(text).solution ?: continue
            for (sample in s.samples) for (m in s.methods) cases += Case(text, m.title, m.code, sample.input, sample.expected)
            s.concreteInput?.let { inp -> s.methods.forEach { m -> cases += Case(text, m.title, m.code, inp, s.nativeAnswer) } }
        }
        val results = PyHarness.run(cases.map { PyHarness.Job(it.code, it.input) })
        val byKey = HashMap<Pair<String, String>, String>()
        val failures = ArrayList<String>()
        for ((c, r) in cases.zip(results)) {
            if (!r.ok) { failures += "«${c.text}» / ${c.method} crashed on ${c.input.replace("\n", "\\n")}: ${r.error}"; continue }
            if (c.expected != null && !PyHarness.same(r.output, c.expected)) {
                failures += "«${c.text}» / ${c.method} on ${c.input.replace("\n", "\\n")}: got ${r.output.trim()} expected ${c.expected}"
            }
            val key = c.text to c.input
            val prev = byKey[key]
            if (prev == null) byKey[key] = r.output
            else if (!PyHarness.same(prev, r.output)) failures += "«${c.text}» methods disagree on ${c.input.replace("\n", "\\n")}: ${prev.trim()} vs ${r.output.trim()} (${c.method})"
        }
        failures.take(20).forEach { println("FAIL $it") }
        println("executions: ${cases.size}")
        assertTrue("${failures.size} failures", failures.isEmpty())
    }

    private fun <T> assertNotNullAndGet(v: T?): T {
        assertNotNull(v)
        return v!!
    }
}
