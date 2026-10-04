package com.pyolympiad.engine

import com.pyolympiad.engine.analyzer.CodeAnalyzer
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Assume.assumeTrue
import org.junit.Test

class AnalyzerTest {

    private val analyzer = CodeAnalyzer()

    private fun codes(src: String) = analyzer.analyze(src).issues.map { it.code }.toSet()

    @Test
    fun cleanCodeHasNoErrors() {
        val r = analyzer.analyze("n = int(input())\ns = 0\nwhile n > 0:\n    s += n % 10\n    n //= 10\nprint(s)\n")
        assertEquals(0, r.errors)
        assertEquals("O(log n)", r.complexity.time)
    }

    @Test
    fun detectsTypicalBeginnerErrors() {
        val cases = mapOf(
            "if x > 5\n    print(x)\n" to "missing-colon",
            "print \"hello\"\n" to "print-statement",
            "x = 5\nif x = 5:\n    print(x)\n" to "assign-in-condition",
            "print(\"hello)\n" to "lex",
            "print((1 + 2)\n" to "lex",
            "x = 1\n    y = 2\n" to "unexpected-indent",
            "for i in range(3):\nprint(i)\n" to "expected-indent",
            "pirnt(5)\n" to "undefined-name",
            "n = input()\nprint(n + 1)\n" to "input-not-converted",
            "a = [3, 1]\na = a.sort()\n" to "assign-none",
            "x = 1\nif x == 1 && x > 0:\n    print(x)\n" to "c-logic",
            "i = 0\ni++\n" to "c-incr",
            "def f(n):\n    return f(n - 1)\n" to "no-base-case",
            "n = int(input())\nprint(len(n))\n" to "len-of-int",
            "s = 5\nprint(\"Ответ: \" + s)\n" to "str-plus-int",
            "a = int(input().split())\n" to "int-of-list",
            "x = 3\nif x == 1 or 2:\n    print(x)\n" to "or-literal",
            "def f(a=[]):\n    a.append(1)\n    return a\n" to "mutable-default",
            "list = [1, 2]\nprint(list)\n" to "shadow-builtin",
            "while True:\n    x = 1\n" to "infinite-loop",
            "return 5\n" to "return-outside",
            "break\n" to "break-outside",
            "If 1 > 0:\n    print(1)\n" to "keyword-case",
        )
        val failures = cases.filter { (src, code) -> code !in codes(src) }.map { (src, code) -> "$code not found in:\n$src got ${codes(src)}" }
        failures.forEach { println(it) }
        assertTrue(failures.isEmpty())
    }

    @Test
    fun autoFixesProduceValidPython() {
        assumeTrue(PyHarness.available)
        val broken = listOf(
            "if 1 > 0\n    print(1)\n",
            "print \"hi\"\n",
            "x = 5\nif x = 5:\n    print(x)\n",
            "n = input()\nprint(n + 1)\n",
            "a = [3, 1, 2]\na = a.sort()\nprint(a)\n",
            "x = 1\nif x == 1 && x > 0:\n    print(x)\n",
            "i = 0\ni++\nprint(i)\n",
            "for i in range(3):\nprint(i)\n",
            "print(\"hello\"\n",
            "If 1 > 0:\n    print(1)\n",
        )
        val jobs = ArrayList<PyHarness.Job>()
        for (src in broken) {
            val r = analyzer.analyze(src)
            assertNotNull("no fix for:\n$src\nissues: ${r.issues.map { it.code }}", r.fixedCode)
            jobs += PyHarness.Job("compile(" + pyString(r.fixedCode!!) + ", 'x', 'exec')\nprint('OK')", "")
        }
        val results = PyHarness.run(jobs)
        results.forEachIndexed { i, res ->
            assertTrue("fixed code does not compile:\n${analyzer.analyze(broken[i]).fixedCode}\n${res.error}", res.ok && res.output.trim() == "OK")
        }
    }

    @Test
    fun complexityEstimates() {
        assertEquals("O(n²)", analyzer.analyze("n = int(input())\nfor i in range(n):\n    for j in range(n):\n        print(i * j)\n").complexity.time)
        assertEquals("O(√n)", analyzer.analyze("n = int(input())\nd = 2\nwhile d * d <= n:\n    d += 1\n").complexity.time)
        assertEquals("O(2ⁿ)", analyzer.analyze("def fib(n):\n    if n < 2:\n        return n\n    return fib(n - 1) + fib(n - 2)\nprint(fib(30))\n").complexity.time)
        assertEquals("O(n² · log n)", analyzer.analyze("a = list(map(int, input().split()))\nfor x in a:\n    b = sorted(a)\n").complexity.time)
    }

    private fun pyString(s: String): String = "\"" + s.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n") + "\""
}
