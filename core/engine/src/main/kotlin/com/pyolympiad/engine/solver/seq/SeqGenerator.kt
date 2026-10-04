package com.pyolympiad.engine.solver.seq

import com.pyolympiad.engine.solver.CodeNormalizer
import com.pyolympiad.engine.solver.Method
import com.pyolympiad.engine.solver.MethodRole
import com.pyolympiad.engine.solver.PyBuilder

/**
 * Generates several genuinely different Python solutions for a [Frame].
 * Every style either supports the frame or returns null — no padding with copies.
 */
object SeqGenerator {

    fun methods(f: Frame): List<Method> {
        if (!f.isValid) return emptyList()
        val out = ArrayList<Method>()
        val gens: List<() -> Method?> = when (f.source) {
            Source.DIGITS -> digits(f)
            Source.LIST -> list(f)
            Source.RANGE -> range(f)
            Source.CHARS -> chars(f)
            Source.WORDS -> words(f)
            Source.DIVISORS -> divisors(f)
            Source.MATRIX -> matrix(f)
        }
        val seen = HashSet<String>()
        for (g in gens) {
            val m = runCatching { g() }.getOrNull() ?: continue
            if (seen.add(CodeNormalizer.key(m.code)) && out.none { it.approach == m.approach }) out += m
        }
        return out
    }

    // ------------------------------------------------------------------ helpers

    private fun build(f: Frame, body: PyBuilder.(SeqCode) -> Boolean): String? {
        val c = SeqCode(f)
        val b = PyBuilder()
        c.prepare(b)
        c.readInput(b)
        return if (b.body(c)) b.build() else null
    }

    private val primeNote = "проверка простоты добавляет O(√x) на каждый элемент"

    private fun primeExtra(f: Frame): String =
        if (f.filters.any { it.kind == FKind.PRIME || it.kind == FKind.COMPOSITE }) " (+ $primeNote)" else ""

    private val resultMemory = setOf(Op.SELECT, Op.REMOVE, Op.UNIQUE_LIST, Op.UNIQUE_COUNT, Op.AVERAGE, Op.RANGE_DIFF, Op.LAST)

    // ================================================================== DIGITS

    private fun digits(f: Frame): List<() -> Method?> {
        if (f.op == Op.REVERSE) return reverseNumber(f)
        if (f.op == Op.SORT_ASC || f.op == Op.SORT_DESC) return sortDigits(f)
        return listOf(
            { digitsArith(f) },
            { digitsStrLoop(f) },
            { digitsBuiltin(f) },
            { digitsRecursion(f) },
            { digitsFunctional(f) },
        )
    }

    private fun digitsArith(f: Frame): Method? {
        val supported = setOf(Op.SUM, Op.PRODUCT, Op.COUNT, Op.AVERAGE, Op.MAX, Op.MIN, Op.RANGE_DIFF, Op.UNIQUE_COUNT, Op.ANY, Op.ALL, Op.FIRST, Op.LAST, Op.SELECT)
        if (f.op !in supported) return null
        // Digits come out right-to-left: "first" (leftmost) is the last one seen, "last" the first one seen.
        val op = when (f.op) { Op.FIRST -> Op.LAST; Op.LAST -> Op.FIRST; else -> f.op }
        val code = build(f) { c ->
            c.loopInit(this, op)
            val simple = f.op == Op.SUM
            if (simple) {
                block("while n > 0:") {
                    line("d = n % 10")
                    c.filteredUpdate(this, op)
                    line("n //= 10")
                }
            } else {
                block("while True:") {
                    line("d = n % 10")
                    c.filteredUpdate(this, op, allowBreak = false)
                    line("n //= 10")
                    block("if n == 0:") { line("break") }
                }
            }
            if (f.op == Op.SELECT) line("result.reverse()")
            c.loopFinish(this, op)
            true
        } ?: return null
        val doWhile = f.op != Op.SUM
        return Method(
            approach = "arith-loop",
            title = "Цикл while: n % 10 и n // 10",
            role = MethodRole.BEGINNER,
            code = code,
            idea = "Последняя цифра числа — это n % 10, а n // 10 отбрасывает её. Повторяем, пока число не закончится.",
            principle = buildString {
                append("1) d = n % 10 — остаток от деления на 10, т.е. последняя цифра.\n")
                append("2) Обрабатываем цифру d (проверяем условие и обновляем ответ).\n")
                append("3) n //= 10 — целочисленное деление убирает последнюю цифру.\n")
                if (doWhile) append("4) Цикл с проверкой в конце (while True ... break), поэтому у числа 0 тоже есть одна цифра 0.")
                else append("4) Цикл while n > 0 останавливается, когда цифр не осталось.")
                if (f.op == Op.SELECT) append("\nЦифры получаются справа налево, поэтому в конце список разворачивается.")
            },
            time = "O(d), d — количество цифр (≈ log₁₀ n)" + primeExtra(f),
            memory = if (f.op in resultMemory) "O(d)" else "O(1)",
            pros = listOf("Не использует строки — чистая арифметика", "Классика олимпиад и школьных задач", "O(1) дополнительной памяти"),
            cons = listOf("Длиннее строковых решений", "Цифры перебираются справа налево"),
            whenToUse = "Когда нужно показать понимание операций // и %, или запрещено переводить число в строку.",
            readability = 4,
        )
    }

    private fun digitsStrLoop(f: Frame): Method? {
        val supported = setOf(Op.SUM, Op.PRODUCT, Op.COUNT, Op.AVERAGE, Op.MAX, Op.MIN, Op.RANGE_DIFF, Op.UNIQUE_COUNT, Op.UNIQUE_LIST, Op.ANY, Op.ALL, Op.FIRST, Op.LAST, Op.SELECT)
        if (f.op !in supported) return null
        val code = build(f) { c ->
            c.loopInit(this, f.op)
            block("for ch in str(n):") {
                line("d = int(ch)")
                c.filteredUpdate(this, f.op)
            }
            c.loopFinish(this, f.op)
            true
        } ?: return null
        return Method(
            approach = "str-loop",
            title = "Цикл for по строке str(n)",
            role = MethodRole.BEGINNER,
            code = code,
            idea = "Переводим число в строку и перебираем символы слева направо, превращая каждый обратно в цифру int(ch).",
            principle = "str(n) даёт запись числа, например '507'. Цикл for проходит по символам '5', '0', '7'; int(ch) превращает символ в цифру, " +
                "после чего цифра проверяется и учитывается в ответе.",
            time = "O(d), d — количество цифр" + primeExtra(f),
            memory = "O(d) — строка с записью числа",
            pros = listOf("Цифры идут в естественном порядке слева направо", "Легко читать"),
            cons = listOf("Создаёт строку длиной d", "Для очень больших чисел str(n) работает за O(d²) в CPython"),
            whenToUse = "Когда важен порядок цифр слева направо или нужна максимальная наглядность.",
            readability = 5,
        )
    }

    private fun digitsBuiltin(f: Frame): Method? {
        val code = build(f) { c ->
            c.builtinLines(this, f.op, "for d in map(int, str(n))", sizeExpr = "len(str(n))")
        } ?: return null
        return Method(
            approach = "builtin",
            title = "Встроенные функции + генератор",
            role = MethodRole.SHORT,
            code = code,
            idea = "Всё решение — одно выражение: генератор перебирает цифры map(int, str(n)), а встроенная функция (sum, max, len, any…) считает ответ.",
            principle = "map(int, str(n)) превращает каждый символ записи числа в цифру. Генераторное выражение «d for d in … if условие» " +
                "отбирает нужные цифры без создания списка, а встроенная функция сворачивает их в ответ.",
            time = "O(d)" + primeExtra(f),
            memory = if (f.op in setOf(Op.AVERAGE, Op.RANGE_DIFF, Op.LAST)) "O(d)" else "O(d) — только строка, генератор не хранит цифры",
            pros = listOf("Самый короткий код", "Встроенные функции написаны на C и работают быстро", "Идиоматичный Python"),
            cons = listOf("Новичку сложнее понять генераторы", "Сложнее отлаживать по шагам"),
            whenToUse = "На олимпиаде, когда важна скорость написания и чтения кода.",
            readability = 4,
            minPython = if (f.op == Op.PRODUCT) "3.8" else null,
        )
    }

    private fun digitsRecursion(f: Frame): Method? {
        val init = when (f.op) {
            Op.SUM, Op.COUNT -> "0"
            Op.PRODUCT -> "1"
            Op.MAX, Op.MIN -> "None"
            Op.ANY -> "False"
            Op.ALL -> "True"
            else -> return null
        }
        val code = build(f) { c ->
            val cond = c.cond("d")
            val v = c.value("d")
            block("def solve(n):") {
                line("d = n % 10")
                line("rest = solve(n // 10) if n >= 10 else $init")
                when (f.op) {
                    Op.SUM -> if (cond == null) line("return rest + $v") else {
                        block("if $cond:") { line("return rest + $v") }
                        line("return rest")
                    }
                    Op.PRODUCT -> if (cond == null) line("return rest * $v") else {
                        block("if $cond:") { line("return rest * $v") }
                        line("return rest")
                    }
                    Op.COUNT -> if (cond == null) line("return rest + 1") else {
                        block("if $cond:") { line("return rest + 1") }
                        line("return rest")
                    }
                    Op.MAX, Op.MIN -> {
                        val cmp = if (f.op == Op.MAX) ">" else "<"
                        val full = listOfNotNull(cond, "(rest is None or $v $cmp rest)").joinToString(" and ")
                        block("if $full:") { line("return $v") }
                        line("return rest")
                    }
                    Op.ANY -> line("return ($cond) or rest")
                    Op.ALL -> line("return ($cond) and rest")
                    else -> {}
                }
            }
            line()
            line()
            when (f.op) {
                Op.MAX, Op.MIN -> { line("answer = solve(n)"); line("print(answer if answer is not None else \"NO\")") }
                Op.ANY, Op.ALL -> line("print(\"YES\" if solve(n) else \"NO\")")
                else -> line("print(solve(n))")
            }
            true
        } ?: return null
        return Method(
            approach = "recursion",
            title = "Рекурсия",
            role = MethodRole.ALTERNATIVE,
            code = code,
            idea = "Ответ для числа n выражается через ответ для n // 10 (число без последней цифры) и последнюю цифру n % 10.",
            principle = "Функция solve(n) отделяет последнюю цифру d = n % 10 и рекурсивно решает задачу для n // 10. " +
                "База рекурсии — однозначное число (n < 10): дальше цифр нет. Результаты объединяются при возврате из вызовов.",
            time = "O(d)" + primeExtra(f),
            memory = "O(d) — глубина стека вызовов",
            pros = listOf("Показывает рекурсивное мышление", "Короткая формула «ответ(n) = f(ответ(n // 10), n % 10)»"),
            cons = listOf("Расходует стек вызовов", "Медленнее цикла из-за вызовов функций"),
            whenToUse = "Для тренировки рекурсии или когда задача естественно формулируется рекурсивно.",
            readability = 3,
        )
    }

    private fun digitsFunctional(f: Frame): Method? {
        val code = build(f) { c -> c.functionalLines(this, f.op, "map(int, str(n))") } ?: return null
        return Method(
            approach = "functional",
            title = "map / filter / reduce",
            role = MethodRole.PYTHONIC,
            code = code,
            idea = "Функциональный стиль: map превращает символы в цифры, filter отбирает нужные, а sum/max/reduce считают результат.",
            principle = "map(int, str(n)) — поток цифр; filter(lambda d: условие, …) пропускает только подходящие; " +
                "агрегирующая функция (sum, len, max, functools.reduce) сворачивает поток в один ответ.",
            time = "O(d)" + primeExtra(f),
            memory = "O(d)",
            pros = listOf("Каждый шаг — отдельная функция", "Хорошо комбинируется"),
            cons = listOf("lambda и filter читаются тяжелее генераторов", "reduce многим незнаком"),
            whenToUse = "Когда удобно мыслить цепочкой преобразований данных.",
            readability = 3,
            minPython = null,
        )
    }

    private fun reverseNumber(f: Frame): List<() -> Method?> {
        val digits = f.fixedDigits
        val list = ArrayList<() -> Method?>()
        if (digits != null && digits in 2..4) list += { reverseDecompose(digits) }
        val read = readN(f)
        list += { reverseSlice(read) }
        list += { reverseWhile(read) }
        list += { reverseJoin(read) }
        if (digits != null && digits in 2..4) list += { reverseDivmod(digits) }
        list += { reverseRecursion(read) }
        return list
    }

    private fun reverseDecompose(digits: Int): Method {
        val names = listOf("a", "b", "c", "d").take(digits)
        val b = PyBuilder().line("n = int(input())")
        for ((i, name) in names.withIndex()) {
            val pow = digits - 1 - i
            val expr = when {
                pow == 0 -> "n % 10"
                i == 0 -> "n // ${"1" + "0".repeat(pow)}"
                else -> "n // ${"1" + "0".repeat(pow)} % 10"
            }
            b.line("$name = $expr")
        }
        val sum = names.reversed().withIndex().joinToString(" + ") { (i, name) ->
            val pow = digits - 1 - i
            if (pow == 0) name else "$name * ${"1" + "0".repeat(pow)}"
        }
        b.line("print($sum)")
        return Method(
            approach = "decompose",
            title = "Разбор разрядов",
            role = MethodRole.BEGINNER,
            code = b.build(),
            idea = "Достаём каждую цифру делением на степени 10 и собираем число заново в обратном порядке.",
            principle = "n // 1000 — тысячи, n // 100 % 10 — сотни, n // 10 % 10 — десятки, n % 10 — единицы. " +
                "Затем умножаем цифры на разряды в обратном порядке и складываем.",
            time = "O(1)",
            memory = "O(1)",
            pros = listOf("Только арифметика", "Отлично объясняет разряды числа"),
            cons = listOf("Работает только для числа с фиксированным количеством цифр"),
            whenToUse = "Когда количество цифр известно заранее (школьные задачи на разряды).",
            readability = 5,
        )
    }

    /** Input line for number tasks: negative numbers are read as their absolute value. */
    private fun readN(f: Frame): String =
        if (f.natural || f.fixedDigits != null) "n = int(input())" else "n = abs(int(input()))"

    private fun reverseSlice(read: String) = Method(
        approach = "slice",
        title = "Срез строки [::-1]",
        role = MethodRole.SHORT,
        code = "$read\nprint(int(str(n)[::-1]))\n",
        idea = "Переводим число в строку, разворачиваем срезом с шагом -1 и превращаем обратно в число.",
        principle = "str(n)[::-1] читает строку от конца к началу. int(...) убирает ведущие нули (1200 → 21).",
        time = "O(d)",
        memory = "O(d)",
        pros = listOf("Одна строка кода", "Подходит для любого количества цифр"),
        cons = listOf("Для отрицательных чисел нужно отдельно обработать знак"),
        whenToUse = "Почти всегда, когда разрешено работать со строками.",
        readability = 5,
    )

    private fun reverseWhile(read: String) = Method(
        approach = "while",
        title = "Цикл while: r = r * 10 + n % 10",
        role = MethodRole.EFFICIENT,
        code = "$read\nr = 0\nwhile n > 0:\n    r = r * 10 + n % 10\n    n //= 10\nprint(r)\n",
        idea = "Снимаем последние цифры числа и «приписываем» их справа к результату r.",
        principle = "r * 10 сдвигает уже собранные цифры влево, + n % 10 добавляет следующую цифру, n //= 10 удаляет её из исходного числа.",
        time = "O(d)",
        memory = "O(1)",
        pros = listOf("Не использует строки", "Работает для любого количества цифр"),
        cons = listOf("Нужно понимать арифметику разрядов"),
        whenToUse = "Когда нужно решение без строк или с O(1) памяти.",
        readability = 4,
    )

    private fun reverseJoin(read: String) = Method(
        approach = "reversed-join",
        title = "reversed + join",
        role = MethodRole.PYTHONIC,
        code = "$read\nprint(int(\"\".join(reversed(str(n)))))\n",
        idea = "reversed() перебирает символы с конца, \"\".join склеивает их в строку.",
        principle = "reversed(str(n)) — итератор по символам в обратном порядке; join собирает их в новую строку; int убирает ведущие нули.",
        time = "O(d)",
        memory = "O(d)",
        pros = listOf("Показывает работу с итераторами", "Читается как фраза"),
        cons = listOf("Длиннее среза"),
        whenToUse = "Когда нужно развернуть любую последовательность, а не только строку.",
        readability = 4,
    )

    private fun reverseDivmod(digits: Int): Method {
        val b = PyBuilder().line("n = int(input())")
        val names = listOf("a", "b", "c", "d").take(digits)
        // Peel digits from the right: last digit first.
        val rev = names.reversed()
        for (i in 0 until digits - 2) b.line("n, ${rev[i]} = divmod(n, 10)")
        b.line("${names[0]}, ${names[1]} = divmod(n, 10)")
        val sum = names.reversed().withIndex().joinToString(" + ") { (i, name) ->
            val pow = digits - 1 - i
            if (pow == 0) name else "$name * ${"1" + "0".repeat(pow)}"
        }
        b.line("print($sum)")
        return Method(
            approach = "divmod",
            title = "divmod",
            role = MethodRole.ALTERNATIVE,
            code = b.build(),
            idea = "divmod(n, 10) за один вызов возвращает и частное, и остаток — отрезаем цифры по одной.",
            principle = "divmod(n, 10) == (n // 10, n % 10). Каждым вызовом отделяем последнюю цифру, последний вызов делит двузначный остаток на две цифры.",
            time = "O(1)",
            memory = "O(1)",
            pros = listOf("Одна операция вместо двух", "Знакомит с divmod"),
            cons = listOf("Только для фиксированного количества цифр"),
            whenToUse = "Когда нужны одновременно частное и остаток.",
            readability = 3,
        )
    }

    private fun reverseRecursion(read: String) = Method(
        approach = "recursion",
        title = "Рекурсия с накопителем",
        role = MethodRole.ALTERNATIVE,
        code = "def reverse(n, acc=0):\n    if n == 0:\n        return acc\n    return reverse(n // 10, acc * 10 + n % 10)\n\n\n$read\nprint(reverse(n))\n",
        idea = "Та же идея, что в цикле while, но записанная рекурсивно: накопитель acc передаётся в следующий вызов.",
        principle = "reverse(n, acc) переносит последнюю цифру n в конец acc и вызывает себя для n // 10. Когда n == 0, накопитель и есть ответ.",
        time = "O(d)",
        memory = "O(d) — стек вызовов",
        pros = listOf("Хвостовая рекурсия — удобный шаблон"),
        cons = listOf("Python не оптимизирует хвостовую рекурсию", "Тратит стек"),
        whenToUse = "Для тренировки рекурсии.",
        readability = 3,
    )

    private fun sortDigits(f: Frame): List<() -> Method?> {
        val read = readN(f)
        val desc = f.op == Op.SORT_DESC
        val rev = if (desc) ", reverse=True" else ""
        return listOf(
            {
                Method(
                    approach = "sorted",
                    title = "sorted() по символам",
                    role = MethodRole.SHORT,
                    code = "$read\nprint(\"\".join(sorted(str(n)$rev)))\n",
                    idea = "Сортируем символы записи числа и склеиваем обратно.",
                    principle = "sorted(str(n)) возвращает список символов-цифр по ${if (desc) "убыванию" else "возрастанию"}; символы '0'..'9' упорядочены так же, как цифры.",
                    time = "O(d log d)",
                    memory = "O(d)",
                    pros = listOf("Одна строка"),
                    cons = listOf("Ведущие нули сохраняются как символы (это строка, а не число)"),
                    whenToUse = "Почти всегда.",
                    readability = 5,
                )
            },
            {
                val order = if (desc) "range(9, -1, -1)" else "range(10)"
                Method(
                    approach = "counting",
                    title = "Сортировка подсчётом",
                    role = MethodRole.EFFICIENT,
                    code = "$read\ncnt = [0] * 10\nfor ch in str(n):\n    cnt[int(ch)] += 1\nresult = \"\"\nfor digit in $order:\n    result += str(digit) * cnt[digit]\nprint(result)\n",
                    idea = "Цифр всего 10 видов, поэтому достаточно посчитать, сколько раз встречается каждая, и выписать их по порядку.",
                    principle = "cnt[k] — сколько раз встречается цифра k. Затем перебираем цифры ${if (desc) "от 9 до 0" else "от 0 до 9"} и выписываем каждую cnt[k] раз.",
                    time = "O(d)",
                    memory = "O(1) для счётчиков + O(d) для ответа",
                    pros = listOf("Линейное время — быстрее любой сортировки сравнениями", "Классический олимпиадный приём"),
                    cons = listOf("Подходит только для небольшого диапазона значений"),
                    whenToUse = "Когда значения из маленького диапазона (цифры, буквы, оценки).",
                    readability = 4,
                )
            },
            {
                val cmp = if (desc) "<" else ">"
                Method(
                    approach = "bubble",
                    title = "Сортировка пузырьком вручную",
                    role = MethodRole.BEGINNER,
                    code = "$read\ndigits = list(str(n))\nfor i in range(len(digits)):\n    for j in range(len(digits) - 1 - i):\n        if digits[j] $cmp digits[j + 1]:\n            digits[j], digits[j + 1] = digits[j + 1], digits[j]\nprint(\"\".join(digits))\n",
                    idea = "Соседние цифры, стоящие в неправильном порядке, меняются местами, пока весь список не отсортируется.",
                    principle = "После i-го прохода внешнего цикла ${if (desc) "наименьшая" else "наибольшая"} из оставшихся цифр «всплывает» в конец списка.",
                    time = "O(d²)",
                    memory = "O(d)",
                    pros = listOf("Показывает, как работает сортировка изнутри"),
                    cons = listOf("Квадратичное время"),
                    whenToUse = "Для обучения алгоритмам сортировки.",
                    readability = 4,
                )
            },
        )
    }

    // ================================================================== LIST

    private fun list(f: Frame): List<() -> Method?> {
        if (f.op == Op.REVERSE) return listReverse(f)
        if (f.op == Op.SORT_ASC || f.op == Op.SORT_DESC) return listSort(f)
        if (f.op == Op.INDEX_MAX || f.op == Op.INDEX_MIN) return listIndex(f)
        return listOf(
            { genericLoop(f, "for x in a:", "for", "Цикл for по элементам", "Перебираем элементы списка циклом for и обновляем ответ для подходящих.", "O(n)") },
            { genericBuiltin(f, "for x in a", "len(a)", "Встроенные функции + генератор", "O(n)") },
            { listWhile(f) },
            { listSortBased(f) },
            { genericFunctional(f, "a", "O(n)") },
            { listCounter(f) },
        )
    }

    private fun genericLoop(f: Frame, header: String, approach: String, title: String, idea: String, time: String): Method? {
        val supported = setOf(Op.SUM, Op.PRODUCT, Op.COUNT, Op.AVERAGE, Op.MAX, Op.MIN, Op.RANGE_DIFF, Op.SELECT, Op.REMOVE, Op.UNIQUE_COUNT, Op.UNIQUE_LIST, Op.ANY, Op.ALL, Op.FIRST, Op.LAST)
        if (f.op !in supported) return null
        val code = build(f) { c ->
            c.loopInit(this, f.op)
            block(header) { c.filteredUpdate(this, f.op) }
            c.loopFinish(this, f.op)
            true
        } ?: return null
        return Method(
            approach = approach,
            title = title,
            role = MethodRole.BEGINNER,
            code = code,
            idea = idea,
            principle = loopPrinciple(f),
            time = time + primeExtra(f),
            memory = if (f.op in resultMemory) "O(n) — список результата" else "O(1) дополнительной памяти",
            pros = listOf("Понятен любому новичку", "Легко добавить отладочный print внутри цикла", "Ранний выход break, где возможно"),
            cons = listOf("Больше строк, чем у встроенных функций"),
            whenToUse = "Когда нужно максимально прозрачное решение или сложная логика внутри цикла.",
            readability = 5,
        )
    }

    private fun loopPrinciple(f: Frame): String {
        val acc = when (f.op) {
            Op.SUM -> "total накапливает сумму подходящих значений"
            Op.PRODUCT -> "product накапливает произведение (начальное значение 1 — нейтральный элемент умножения)"
            Op.COUNT -> "count увеличивается на 1 для каждого подходящего элемента"
            Op.AVERAGE -> "total и count накапливают сумму и количество; в конце среднее = total / count"
            Op.MAX -> "best хранит лучший найденный элемент; None означает «ещё ничего не нашли»"
            Op.MIN -> "best хранит наименьший найденный элемент; None означает «ещё ничего не нашли»"
            Op.RANGE_DIFF -> "smallest и largest хранят текущие минимум и максимум"
            Op.SELECT, Op.REMOVE -> "result собирает подходящие элементы в исходном порядке"
            Op.UNIQUE_COUNT -> "множество seen хранит уже встреченные значения; его размер — ответ"
            Op.UNIQUE_LIST -> "множество seen помогает за O(1) проверить, встречалось ли значение; result хранит порядок первых появлений"
            Op.ANY -> "found становится True при первом подходящем элементе, и цикл прерывается break"
            Op.ALL -> "ok становится False при первом элементе, нарушающем условие, и цикл прерывается break"
            Op.FIRST -> "answer запоминает первый подходящий элемент, после чего цикл прерывается"
            Op.LAST -> "answer перезаписывается каждым подходящим элементом, в конце там последний"
            else -> "ответ обновляется для каждого элемента"
        }
        return "Цикл проходит по всем элементам ровно один раз. Переменная $acc. " +
            "Если подходящих элементов нет, выводится ${emptyAnswer(f.op)}."
    }

    private fun emptyAnswer(op: Op): String = when (op) {
        Op.SUM, Op.COUNT, Op.UNIQUE_COUNT -> "0"
        Op.PRODUCT -> "1 (произведение пустого набора)"
        Op.SELECT, Op.REMOVE, Op.UNIQUE_LIST -> "пустая строка"
        Op.ANY -> "NO"
        Op.ALL -> "YES"
        else -> "NO"
    }

    private fun genericBuiltin(f: Frame, forClause: String, sizeExpr: String?, title: String, time: String): Method? {
        val code = build(f) { c -> c.builtinLines(this, f.op, forClause, sizeExpr = sizeExpr) } ?: return null
        val fn = when (f.op) {
            Op.SUM -> "sum"; Op.PRODUCT -> "math.prod"; Op.COUNT -> "sum(1 for …)/len"; Op.MAX -> "max"; Op.MIN -> "min"
            Op.ANY -> "any"; Op.ALL -> "all"; Op.FIRST -> "next"; Op.UNIQUE_COUNT -> "set"; Op.UNIQUE_LIST -> "dict.fromkeys"
            else -> "встроенные функции"
        }
        return Method(
            approach = "builtin",
            title = title,
            role = MethodRole.SHORT,
            code = code,
            idea = "Генераторное выражение отбирает нужные элементы, а $fn вычисляет ответ одной строкой.",
            principle = "Конструкция «x for x in … if условие» лениво выдаёт подходящие элементы, не создавая лишних списков. " +
                "Встроенная функция $fn реализована на C и проходит по ним один раз." +
                (if (f.op == Op.MAX || f.op == Op.MIN) " Параметр default задаёт ответ для пустого набора." else ""),
            time = time + primeExtra(f),
            memory = if (f.op in setOf(Op.AVERAGE, Op.RANGE_DIFF, Op.LAST, Op.SELECT, Op.UNIQUE_LIST, Op.UNIQUE_COUNT)) "O(n)" else "O(1) дополнительной памяти",
            pros = listOf("Самый короткий код", "Работает быстрее явного цикла", "Идиоматичный Python"),
            cons = listOf("Генераторы сложнее для новичка"),
            whenToUse = "На олимпиаде и в реальном коде — по умолчанию.",
            readability = 4,
            minPython = if (f.op == Op.PRODUCT) "3.8" else null,
        )
    }

    private fun genericFunctional(f: Frame, iterable: String, time: String): Method? {
        val code = build(f) { c -> c.functionalLines(this, f.op, iterable) } ?: return null
        return Method(
            approach = "functional",
            title = "map / filter / reduce",
            role = MethodRole.PYTHONIC,
            code = code,
            idea = "Функциональный стиль: filter отбирает элементы, map преобразует, sum/max/reduce сворачивают в ответ.",
            principle = "filter(lambda x: условие, данные) возвращает ленивый итератор только по подходящим элементам. " +
                "Агрегирующая функция проходит по нему один раз. functools.reduce применяет операцию накопительно.",
            time = time + primeExtra(f),
            memory = "O(1)–O(n) в зависимости от операции",
            pros = listOf("Чёткое разделение «отбор → преобразование → свёртка»"),
            cons = listOf("lambda-выражения читаются тяжелее генераторов"),
            whenToUse = "Когда данные проходят цепочку преобразований.",
            readability = 3,
        )
    }

    private fun listWhile(f: Frame): Method? {
        val supported = setOf(Op.SUM, Op.PRODUCT, Op.COUNT, Op.AVERAGE, Op.MAX, Op.MIN, Op.ANY, Op.ALL, Op.FIRST, Op.LAST, Op.SELECT, Op.RANGE_DIFF)
        if (f.op !in supported) return null
        val code = build(f) { c ->
            c.loopInit(this, f.op)
            line("i = 0")
            block("while i < len(a):") {
                line("x = a[i]")
                if (f.op in setOf(Op.ANY, Op.ALL, Op.FIRST)) {
                    // break would skip "i += 1", which is fine because the loop ends anyway.
                    c.filteredUpdate(this, f.op)
                } else c.filteredUpdate(this, f.op)
                line("i += 1")
            }
            c.loopFinish(this, f.op)
            true
        } ?: return null
        return Method(
            approach = "while-index",
            title = "Цикл while по индексам",
            role = MethodRole.ALTERNATIVE,
            code = code,
            idea = "Явно управляем индексом i: берём a[i], обрабатываем и переходим к i + 1.",
            principle = "Индекс начинается с 0 и растёт до len(a) - 1. Такой цикл знаком по C/C++/Pascal и удобен, когда шаг по индексу нестандартный.",
            time = "O(n)" + primeExtra(f),
            memory = if (f.op in resultMemory) "O(n)" else "O(1)",
            pros = listOf("Полный контроль над индексом", "Переносится на другие языки"),
            cons = listOf("Легко забыть i += 1 и получить бесконечный цикл", "Многословнее for"),
            whenToUse = "Когда индекс меняется нестандартно (два указателя, пропуски элементов).",
            readability = 4,
        )
    }

    private fun listSortBased(f: Frame): Method? {
        if (f.op !in setOf(Op.MAX, Op.MIN, Op.RANGE_DIFF)) return null
        val code = build(f) { c ->
            val g = c.gen("for x in a")
            line("values = sorted($g)")
            when (f.op) {
                Op.MAX -> line("print(values[-1] if values else \"NO\")")
                Op.MIN -> line("print(values[0] if values else \"NO\")")
                else -> line("print(values[-1] - values[0] if values else \"NO\")")
            }
            true
        } ?: return null
        return Method(
            approach = "sort",
            title = "Сортировка и крайние элементы",
            role = MethodRole.ALTERNATIVE,
            code = code,
            idea = "После сортировки наименьший элемент стоит первым, наибольший — последним.",
            principle = "sorted() возвращает новый упорядоченный список; values[0] — минимум, values[-1] — максимум.",
            time = "O(n log n)" + primeExtra(f),
            memory = "O(n)",
            pros = listOf("Сразу даёт и минимум, и максимум, и порядок остальных элементов"),
            cons = listOf("Медленнее линейного прохода", "Тратит O(n) памяти"),
            whenToUse = "Когда кроме экстремума нужны и другие порядковые статистики (второй максимум, медиана).",
            readability = 4,
        )
    }

    private fun listCounter(f: Frame): Method? {
        if (f.op !in setOf(Op.UNIQUE_COUNT, Op.UNIQUE_LIST)) return null
        val code = build(f) { c ->
            import("from collections import Counter")
            val g = c.gen("for x in a")
            line("counts = Counter($g)")
            if (f.op == Op.UNIQUE_COUNT) line("print(len(counts))") else line(c.printIter("counts"))
            true
        } ?: return null
        return Method(
            approach = "counter",
            title = "collections.Counter",
            role = MethodRole.PYTHONIC,
            code = code,
            idea = "Counter считает, сколько раз встречается каждое значение; ключи — различные значения.",
            principle = "Counter — словарь «значение → количество». Ключи хранятся в порядке первого появления (Python 3.7+).",
            time = "O(n)",
            memory = "O(k), k — число различных значений",
            pros = listOf("Сразу есть частоты — пригодятся в похожих задачах"),
            cons = listOf("Хранит лишнюю информацию, если нужны только различные значения"),
            whenToUse = "Когда кроме различных значений важны их частоты.",
            readability = 4,
        )
    }

    private fun listReverse(f: Frame): List<() -> Method?> = listOf(
        { simple(f, "slice", "Срез a[::-1]", MethodRole.SHORT, "print(*a[::-1])", "Срез с шагом -1 создаёт развёрнутую копию списка.", "O(n)", "O(n)", 5) },
        { simple(f, "reversed", "reversed()", MethodRole.PYTHONIC, "print(*reversed(a))", "reversed() возвращает итератор, идущий от конца к началу, без копирования списка.", "O(n)", "O(1) дополнительно", 5) },
        {
            simple(f, "loop", "Цикл с конца", MethodRole.BEGINNER, "result = []\nfor i in range(len(a) - 1, -1, -1):\n    result.append(a[i])\nprint(*result)",
                "Идём по индексам от len(a) - 1 до 0 и собираем элементы.", "O(n)", "O(n)", 4)
        },
        {
            simple(f, "two-pointers", "Два указателя (на месте)", MethodRole.EFFICIENT,
                "i, j = 0, len(a) - 1\nwhile i < j:\n    a[i], a[j] = a[j], a[i]\n    i += 1\n    j -= 1\nprint(*a)",
                "Меняем местами первый и последний элементы, затем второй и предпоследний и т.д.", "O(n)", "O(1)", 4)
        },
        { simple(f, "method", "Метод list.reverse()", MethodRole.ALTERNATIVE, "a.reverse()\nprint(*a)", "list.reverse() разворачивает список на месте и возвращает None.", "O(n)", "O(1)", 5) },
    )

    private fun listSort(f: Frame): List<() -> Method?> {
        val desc = f.op == Op.SORT_DESC
        val rev = if (desc) ", reverse=True" else ""
        val selectPrefix = if (f.filters.isNotEmpty()) "a = [x for x in a if ${SeqCode(f).cond("x")}]\n" else ""
        return listOf(
            { simple(f, "sorted", "sorted()", MethodRole.SHORT, "${selectPrefix}print(*sorted(a$rev))", "Встроенная сортировка Timsort.", "O(n log n)", "O(n)", 5) },
            { simple(f, "sort-method", "list.sort()", MethodRole.ALTERNATIVE, "${selectPrefix}a.sort(${rev.removePrefix(", ")})\nprint(*a)", "Сортировка на месте, без копии списка.", "O(n log n)", "O(1) дополнительно (кроме буфера Timsort)", 5) },
        )
    }

    private fun listIndex(f: Frame): List<() -> Method?> {
        val isMax = f.op == Op.INDEX_MAX
        val off = if (f.oneBased) " + 1" else ""
        val cmp = if (isMax) ">" else "<"
        val fn = if (isMax) "max" else "min"
        val c = SeqCode(f).cond("x")
        val note = if (f.oneBased) "Нумерация с 1 (номер элемента)." else "Нумерация с 0 (индекс Python)."
        if (c != null) {
            return listOf(
                {
                    simple(f, "loop", "Цикл с enumerate", MethodRole.BEGINNER,
                        "best = -1\nfor i, x in enumerate(a):\n    if $c and (best == -1 or x $cmp a[best]):\n        best = i\nprint(best$off if best != -1 else \"NO\")",
                        "Запоминаем индекс лучшего подходящего элемента. $note", "O(n)", "O(1)", 4)
                },
                {
                    simple(f, "builtin", "$fn с key по кандидатам", MethodRole.SHORT,
                        "cands = [i for i, x in enumerate(a) if $c]\nprint($fn(cands, key=lambda i: a[i])$off if cands else \"NO\")",
                        "Собираем индексы подходящих элементов и берём тот, у которого значение ${if (isMax) "наибольшее" else "наименьшее"}. $note", "O(n)", "O(n)", 4)
                },
            )
        }
        return listOf(
            {
                simple(f, "loop", "Цикл с запоминанием индекса", MethodRole.BEGINNER,
                    "best = 0\nfor i in range(1, len(a)):\n    if a[i] $cmp a[best]:\n        best = i\nprint(best$off)",
                    "Храним индекс текущего ${if (isMax) "максимума" else "минимума"}; строгое сравнение оставляет первое вхождение. $note", "O(n)", "O(1)", 5)
            },
            { simple(f, "index", "a.index($fn(a))", MethodRole.SHORT, "print(a.index($fn(a))$off)", "$fn(a) находит значение, index — его первую позицию. $note", "O(n) (два прохода)", "O(1)", 5) },
            { simple(f, "key", "$fn(range(len(a)), key=a.__getitem__)", MethodRole.PYTHONIC, "print($fn(range(len(a)), key=a.__getitem__)$off)", "Ищем индекс, у которого значение a[i] ${if (isMax) "наибольшее" else "наименьшее"}, за один проход. $note", "O(n)", "O(1)", 3) },
        )
    }

    /** Wraps a hand-written body (input reading is generated). */
    private fun simple(
        f: Frame, approach: String, title: String, role: MethodRole, body: String, idea: String,
        time: String, memory: String, readability: Int,
    ): Method {
        val b = PyBuilder()
        val c = SeqCode(f)
        c.prepare(b)
        c.readInput(b)
        body.lines().forEach { b.line(it) }
        return Method(
            approach = approach, title = title, role = role, code = b.build(), idea = idea, principle = idea,
            time = time, memory = memory, pros = prosFor(approach), cons = consFor(approach),
            whenToUse = whenFor(approach), readability = readability,
        )
    }

    private fun prosFor(approach: String): List<String> = when (approach) {
        "slice", "sorted", "index", "builtin" -> listOf("Короткий и быстрый код")
        "reversed" -> listOf("Не копирует данные")
        "two-pointers" -> listOf("Работает на месте, O(1) памяти", "Классический приём «два указателя»")
        "loop" -> listOf("Понятно новичку", "Легко изменить логику")
        "method", "sort-method" -> listOf("Не создаёт новый список")
        "key" -> listOf("Один проход без дополнительных списков")
        else -> listOf("Корректное решение")
    }

    private fun consFor(approach: String): List<String> = when (approach) {
        "slice", "sorted" -> listOf("Создаёт копию списка")
        "two-pointers", "loop" -> listOf("Больше строк кода")
        "method", "sort-method" -> listOf("Изменяет исходный список", "Метод возвращает None — частая ошибка: a = a.sort()")
        "index" -> listOf("Два прохода по списку")
        "key" -> listOf("Синтаксис key=a.__getitem__ непривычен")
        else -> emptyList()
    }

    private fun whenFor(approach: String): String = when (approach) {
        "two-pointers" -> "Когда важна память или нужно изменить данные на месте."
        "loop" -> "Для обучения и когда нужна нестандартная логика."
        else -> "В большинстве задач."
    }

    // ================================================================== RANGE

    private fun range(f: Frame): List<() -> Method?> {
        val c = SeqCode(f)
        return listOf(
            { genericLoop(f, "for i in ${c.rangeExpr}:", "for", "Цикл for по range", "Перебираем все числа диапазона и учитываем подходящие.", "O(n), n — длина диапазона") },
            { genericBuiltin(f, "for i in ${c.rangeExpr}", "len(${c.rangeExpr})", "Встроенные функции + range", "O(n)") },
            { rangeFormula(f) },
            { rangeStep(f) },
            { rangeSieve(f) },
            { genericFunctional(f, c.rangeExpr, "O(n)") },
        )
    }

    private fun stepInfo(f: Frame): Triple<String, String, String>? {
        if (f.filters.size != 1 || f.transform != Transform.NONE) return null
        val fl = f.filters[0]
        val lo = f.range!!.lo
        return when (fl.kind) {
            FKind.EVEN -> Triple("start = $lo if $lo % 2 == 0 else $lo + 1", "2", "чётные")
            FKind.ODD -> Triple("start = $lo if $lo % 2 != 0 else $lo + 1", "2", "нечётные")
            FKind.DIV -> Triple("start = ($lo + ${fl.p} - 1) // ${fl.p} * ${fl.p}", fl.p, "кратные ${fl.p}")
            else -> null
        }
    }

    private fun rangeStep(f: Frame): Method? {
        val (startLine, step, what) = stepInfo(f) ?: return null
        val c = SeqCode(f)
        val op = f.op
        if (op !in setOf(Op.SUM, Op.COUNT, Op.SELECT, Op.PRODUCT, Op.MAX, Op.MIN, Op.AVERAGE, Op.FIRST, Op.LAST, Op.ANY)) return null
        val code = build(f) { _ ->
            line(startLine)
            line("r = range(start, ${c.hiExcl}, $step)")
            when (op) {
                Op.SUM -> line("print(sum(r))")
                Op.COUNT -> line("print(len(r))")
                Op.SELECT -> line("print(*r)")
                Op.PRODUCT -> { import("import math"); line("print(math.prod(r))") }
                Op.MAX, Op.LAST -> line("print(r[-1] if r else \"NO\")")
                Op.MIN, Op.FIRST -> line("print(r[0] if r else \"NO\")")
                Op.AVERAGE -> line("print(sum(r) / len(r) if r else \"NO\")")
                Op.ANY -> line("print(\"YES\" if r else \"NO\")")
                else -> {}
            }
            true
        } ?: return null
        return Method(
            approach = "step",
            title = "range с шагом $step",
            role = MethodRole.EFFICIENT,
            code = code,
            idea = "Не проверяем каждое число: сразу перебираем только $what, начиная с первого подходящего, с шагом $step.",
            principle = "Первое подходящее число вычисляется формулой (start), дальше range(start, …, $step) выдаёт только нужные числа. " +
                "Объект range знает свою длину и элементы по индексу без хранения списка.",
            time = if (op in setOf(Op.COUNT, Op.MAX, Op.MIN, Op.FIRST, Op.LAST, Op.ANY)) "O(1)" else "O(n / $step)",
            memory = "O(1)",
            pros = listOf("В $step раз меньше итераций", "range не хранит элементы в памяти"),
            cons = listOf("Нужно аккуратно вычислить первое подходящее число"),
            whenToUse = "Когда подходящие числа образуют арифметическую прогрессию.",
            readability = 4,
            minPython = if (op == Op.PRODUCT) "3.8" else null,
        )
    }

    private fun rangeFormula(f: Frame): Method? {
        val op = f.op
        if (op !in setOf(Op.SUM, Op.COUNT, Op.AVERAGE)) return null
        val c = SeqCode(f)
        val lo = c.lo
        val hi = c.hi
        val code: String
        val what: String
        if (f.transform != Transform.NONE) {
            if (f.filters.isNotEmpty() || op != Op.SUM || f.transform == Transform.ABS) return null
            val fn = if (f.transform == Transform.SQUARE) "m * (m + 1) * (2 * m + 1) // 6" else "(m * (m + 1) // 2) ** 2"
            code = build(f) { _ ->
                block("def prefix(m):") { line("return $fn") }
                line()
                line()
                line("lo, hi = $lo, $hi")
                line("print(prefix(hi) - prefix(lo - 1) if hi >= lo else 0)")
                true
            } ?: return null
            what = if (f.transform == Transform.SQUARE) "1² + 2² + … + m² = m(m+1)(2m+1)/6" else "1³ + … + m³ = (m(m+1)/2)²"
        } else {
            if (f.filters.size > 1) return null
            val fl = f.filters.firstOrNull()
            val kind = fl?.kind
            if (kind != null && kind !in setOf(FKind.EVEN, FKind.ODD, FKind.DIV, FKind.NDIV)) return null
            code = build(f) { _ ->
                line("lo, hi = $lo, $hi")
                line("all_count = max(0, hi - lo + 1)")
                line("all_total = (lo + hi) * all_count // 2")
                if (kind != null) {
                    val k = when (kind) { FKind.EVEN, FKind.ODD -> "2"; else -> fl.p }
                    line("first = (lo + $k - 1) // $k * $k")
                    line("last = hi // $k * $k")
                    block("if first > last:") { line("cnt, total = 0, 0") }
                    block("else:") {
                        line("cnt = (last - first) // $k + 1")
                        line("total = (first + last) * cnt // 2")
                    }
                    if (kind == FKind.ODD || kind == FKind.NDIV) {
                        line("cnt, total = all_count - cnt, all_total - total")
                    }
                } else {
                    line("cnt, total = all_count, all_total")
                }
                when (op) {
                    Op.SUM -> line("print(total)")
                    Op.COUNT -> line("print(cnt)")
                    else -> line("print(total / cnt if cnt else \"NO\")")
                }
                true
            } ?: return null
            what = "сумма арифметической прогрессии (первый + последний) · количество / 2"
        }
        return Method(
            approach = "formula",
            title = "Математическая формула O(1)",
            role = MethodRole.EFFICIENT,
            code = code,
            idea = "Ответ считается формулой без перебора: $what.",
            principle = "Подходящие числа образуют арифметическую прогрессию. Её количество и сумма вычисляются по формулам, " +
                "поэтому время не зависит от величины n — работает даже для n = 10¹⁸.",
            time = "O(1)",
            memory = "O(1)",
            pros = listOf("Мгновенно для любых n", "Показывает математическое мышление — ключ к олимпиадным задачам"),
            cons = listOf("Нужно вывести и проверить формулу", "Легко ошибиться на границах"),
            whenToUse = "Когда n большое (10⁹ и больше) и перебор не уложится в лимит времени.",
            readability = 3,
        )
    }

    private fun rangeSieve(f: Frame): Method? {
        if (f.filters.size != 1 || f.filters[0].kind != FKind.PRIME) return null
        if (f.op !in setOf(Op.SUM, Op.COUNT, Op.SELECT, Op.MAX, Op.MIN, Op.AVERAGE, Op.FIRST, Op.LAST, Op.PRODUCT, Op.ANY)) return null
        if (f.transform != Transform.NONE && f.op != Op.SUM && f.op != Op.COUNT) return null
        val c = SeqCode(f)
        val b = PyBuilder()
        b.import("import math")
        c.readInput(b)
        b.line("lo, hi = ${c.lo}, ${c.hi}")
        b.line("limit = max(hi, 1)")
        b.line("sieve = [True] * (limit + 1)")
        b.line("sieve[0] = sieve[1] = False")
        b.block("for i in range(2, math.isqrt(limit) + 1):") {
            block("if sieve[i]:") {
                line("sieve[i * i::i] = [False] * len(range(i * i, limit + 1, i))")
            }
        }
        b.line("primes = [i for i in range(max(lo, 2), hi + 1) if sieve[i]]")
        when (f.op) {
            Op.SUM -> b.line(if (f.transform == Transform.NONE) "print(sum(primes))" else "print(sum(${c.value("p")} for p in primes))")
            Op.COUNT -> b.line("print(len(primes))")
            Op.SELECT -> b.line("print(*primes)")
            Op.MAX, Op.LAST -> b.line("print(primes[-1] if primes else \"NO\")")
            Op.MIN, Op.FIRST -> b.line("print(primes[0] if primes else \"NO\")")
            Op.AVERAGE -> b.line("print(sum(primes) / len(primes) if primes else \"NO\")")
            Op.PRODUCT -> b.line("print(math.prod(primes))")
            Op.ANY -> b.line("print(\"YES\" if primes else \"NO\")")
            else -> return null
        }
        return Method(
            approach = "sieve",
            title = "Решето Эратосфена",
            role = MethodRole.EFFICIENT,
            code = b.build(),
            idea = "Один раз вычёркиваем все составные числа до hi, после чего простота любого числа проверяется за O(1).",
            principle = "Для каждого ещё не вычеркнутого i (это простое число) вычёркиваем кратные ему, начиная с i·i. " +
                "Срез sieve[i*i::i] = […] делает это одной операцией. Остаются только простые числа.",
            time = "O(n log log n)",
            memory = "O(n)",
            pros = listOf("Намного быстрее проверки каждого числа делением", "Стандартный олимпиадный алгоритм"),
            cons = listOf("Нужна память O(n) — до ~10⁷ на обычном компьютере"),
            whenToUse = "Когда нужно много простых чисел до n ≤ 10⁷.",
            readability = 3,
            minPython = "3.8",
        )
    }

    // ================================================================== CHARS

    private fun chars(f: Frame): List<() -> Method?> {
        if (f.op == Op.REVERSE) return charsReverse(f)
        if (f.op == Op.SORT_ASC || f.op == Op.SORT_DESC) return charsSort(f)
        return listOf(
            { genericLoop(f, "for ch in s:", "for", "Цикл for по символам", "Перебираем символы строки и учитываем подходящие.", "O(n), n — длина строки") },
            { genericBuiltin(f, "for ch in s", "len(s)", "Встроенные функции + генератор", "O(n)") },
            { charsStrMethods(f) },
            { charsRegex(f) },
            { charsCounter(f) },
            { genericFunctional(f, "s", "O(n)") },
        )
    }

    private fun charsStrMethods(f: Frame): Method? {
        if (f.filters.size != 1) return null
        val kind = f.filters[0].kind
        val body: String = when {
            f.op == Op.COUNT && kind == FKind.VOWEL -> "print(sum(s.count(v) for v in VOWELS))"
            f.op == Op.COUNT && kind == FKind.SPACE -> "print(s.count(\" \"))"
            f.op == Op.COUNT && kind in setOf(FKind.UPPER, FKind.LOWER, FKind.LETTER, FKind.DIGITCH) ->
                "print(sum(map(str.${method(kind)}, s)))"
            f.op == Op.REMOVE && kind == FKind.SPACE -> "print(s.replace(\" \", \"\"))"
            f.op == Op.REMOVE && kind == FKind.VOWEL -> "print(s.translate(str.maketrans(\"\", \"\", VOWELS)))"
            f.op == Op.ANY && kind in setOf(FKind.UPPER, FKind.LOWER, FKind.LETTER, FKind.DIGITCH) ->
                "print(\"YES\" if any(map(str.${method(kind)}, s)) else \"NO\")"
            f.op == Op.ALL && kind in setOf(FKind.LETTER, FKind.DIGITCH) ->
                "print(\"YES\" if s.${method(kind)}() or not s else \"NO\")"
            else -> return null
        }
        val c = SeqCode(f)
        val b = PyBuilder()
        c.prepare(b)
        c.readInput(b)
        body.lines().forEach { b.line(it) }
        val detail = when {
            body.contains("s.count") && kind == FKind.VOWEL -> "s.count(v) считает вхождения каждой гласной; суммируем по всем гласным."
            body.contains("s.count") -> "Метод s.count считает вхождения подстроки за один проход на C."
            body.contains("map(str.") -> "str.${method(kind)} применяется к каждому символу и даёт True/False; True считается как 1."
            body.contains("replace") -> "s.replace(\" \", \"\") заменяет каждый пробел пустой строкой."
            body.contains("translate") -> "str.maketrans(\"\", \"\", VOWELS) строит таблицу удаления гласных; translate применяет её за один проход."
            else -> "Используются методы строк."
        }
        return Method(
            approach = "str-methods",
            title = "Методы строк",
            role = MethodRole.PYTHONIC,
            code = b.build(),
            idea = detail,
            principle = detail + " Методы строк реализованы на C и работают очень быстро.",
            time = if (kind == FKind.VOWEL && f.op == Op.COUNT) "O(n · |гласные|)" else "O(n)",
            memory = "O(1)–O(n)",
            pros = listOf("Готовые оптимизированные методы", "Короткий код"),
            cons = listOf("Нужно знать подходящий метод строк"),
            whenToUse = "Для типовых операций со строками.",
            readability = 4,
        )
    }

    private fun method(kind: FKind) = when (kind) {
        FKind.UPPER -> "isupper"; FKind.LOWER -> "islower"; FKind.LETTER -> "isalpha"; FKind.DIGITCH -> "isdigit"; else -> "isalpha"
    }

    private fun regexClass(kind: FKind): String? = when (kind) {
        FKind.VOWEL -> SeqCode.VOWEL_RE
        FKind.DIGITCH -> "[0-9]"
        FKind.SPACE -> " "
        FKind.UPPER -> "[A-ZА-ЯЁ]"
        FKind.LOWER -> "[a-zа-яё]"
        else -> null
    }

    private fun charsRegex(f: Frame): Method? {
        if (f.filters.size != 1) return null
        val cls = regexClass(f.filters[0].kind) ?: return null
        val body = when (f.op) {
            Op.COUNT -> "print(len(re.findall(r\"$cls\", s)))"
            Op.REMOVE -> "print(re.sub(r\"$cls\", \"\", s))"
            Op.SELECT -> "print(\"\".join(re.findall(r\"$cls\", s)))"
            Op.ANY -> "print(\"YES\" if re.search(r\"$cls\", s) else \"NO\")"
            else -> return null
        }
        val c = SeqCode(f)
        val b = PyBuilder().import("import re")
        c.readInput(b)
        b.line(body)
        return Method(
            approach = "regex",
            title = "Регулярные выражения (re)",
            role = MethodRole.ALTERNATIVE,
            code = b.build(),
            idea = "Описываем нужные символы шаблоном $cls и поручаем поиск модулю re.",
            principle = "re.findall возвращает все совпадения шаблона, re.sub заменяет их, re.search ищет первое. " +
                "Класс символов в квадратных скобках совпадает с любым из перечисленных символов.",
            time = "O(n)",
            memory = "O(n)",
            pros = listOf("Легко расширить шаблон (например, добавить другие символы)", "Мощный инструмент обработки текста"),
            cons = listOf("Нужно знать синтаксис регулярных выражений", "Класс [A-ZА-ЯЁ] покрывает только латиницу и кириллицу"),
            whenToUse = "Когда условие на символы сложное или текст нужно разбирать по шаблонам.",
            readability = 3,
        )
    }

    private fun charsCounter(f: Frame): Method? {
        if (f.op !in setOf(Op.COUNT, Op.UNIQUE_COUNT, Op.UNIQUE_LIST)) return null
        val c = SeqCode(f)
        val cond = c.cond("ch")
        val b = PyBuilder()
        c.prepare(b)
        b.import("from collections import Counter")
        c.readInput(b)
        b.line("counts = Counter(s)")
        when (f.op) {
            Op.COUNT -> {
                if (cond == null) return null
                b.line("print(sum(cnt for ch, cnt in counts.items() if $cond))")
            }
            Op.UNIQUE_COUNT -> b.line(if (cond == null) "print(len(counts))" else "print(sum(1 for ch in counts if $cond))")
            Op.UNIQUE_LIST -> b.line(if (cond == null) "print(\"\".join(counts))" else "print(\"\".join(ch for ch in counts if $cond))")
            else -> return null
        }
        return Method(
            approach = "counter",
            title = "collections.Counter",
            role = MethodRole.ALTERNATIVE,
            code = b.build(),
            idea = "Сначала считаем частоту каждого символа, затем работаем только с различными символами.",
            principle = "Counter(s) — словарь «символ → сколько раз встречается». Проверять условие нужно только для различных символов, а их обычно немного.",
            time = "O(n)",
            memory = "O(k), k — число различных символов",
            pros = listOf("Условие проверяется один раз на каждый различный символ", "Частоты пригодятся в похожих задачах"),
            cons = listOf("Лишняя структура данных для простого подсчёта"),
            whenToUse = "Когда нужны частоты символов или условие дорого проверять.",
            readability = 4,
        )
    }

    private fun charsReverse(f: Frame): List<() -> Method?> = listOf(
        { simple(f, "slice", "Срез s[::-1]", MethodRole.SHORT, "print(s[::-1])", "Срез с шагом -1 читает строку с конца.", "O(n)", "O(n)", 5) },
        { simple(f, "reversed", "reversed + join", MethodRole.PYTHONIC, "print(\"\".join(reversed(s)))", "reversed() идёт по символам с конца, join склеивает их.", "O(n)", "O(n)", 5) },
        { simple(f, "loop", "Цикл с конца строки", MethodRole.BEGINNER, "result = []\nfor i in range(len(s) - 1, -1, -1):\n    result.append(s[i])\nprint(\"\".join(result))", "Идём по индексам от последнего к первому и собираем символы в список.", "O(n)", "O(n)", 4) },
        { simple(f, "prepend", "Приписывание в начало", MethodRole.ALTERNATIVE, "result = \"\"\nfor ch in s:\n    result = ch + result\nprint(result)", "Каждый следующий символ ставим перед уже собранной частью.", "O(n²) — каждое сложение строк копирует результат", "O(n)", 4) },
    )

    private fun charsSort(f: Frame): List<() -> Method?> {
        val rev = if (f.op == Op.SORT_DESC) ", reverse=True" else ""
        return listOf(
            { simple(f, "sorted", "sorted + join", MethodRole.SHORT, "print(\"\".join(sorted(s$rev)))", "sorted(s) сортирует символы по их кодам Unicode.", "O(n log n)", "O(n)", 5) },
            {
                val order = if (f.op == Op.SORT_DESC) "sorted(counts, reverse=True)" else "sorted(counts)"
                simple(f, "counting", "Подсчёт символов", MethodRole.EFFICIENT,
                    "counts = {}\nfor ch in s:\n    counts[ch] = counts.get(ch, 0) + 1\nresult = \"\"\nfor ch in $order:\n    result += ch * counts[ch]\nprint(result)",
                    "Считаем каждый символ, затем выписываем различные символы по порядку нужное число раз.", "O(n + k log k), k — различных символов", "O(k)", 4)
            },
        )
    }

    // ================================================================== WORDS

    private fun words(f: Frame): List<() -> Method?> {
        if (f.op == Op.REVERSE) return listOf(
            { simple(f, "slice", "Срез words[::-1]", MethodRole.SHORT, "print(*words[::-1])", "Разворачиваем список слов срезом.", "O(n)", "O(n)", 5) },
            { simple(f, "reversed", "join + reversed", MethodRole.PYTHONIC, "print(\" \".join(reversed(words)))", "reversed() перебирает слова с конца, join склеивает через пробел.", "O(n)", "O(n)", 5) },
            { simple(f, "loop", "Цикл с конца", MethodRole.BEGINNER, "result = []\nfor i in range(len(words) - 1, -1, -1):\n    result.append(words[i])\nprint(*result)", "Идём по индексам слов от последнего к первому.", "O(n)", "O(n)", 4) },
        )
        if (f.op == Op.SORT_ASC || f.op == Op.SORT_DESC) {
            val rev = if (f.op == Op.SORT_DESC) ", reverse=True" else ""
            return listOf(
                { simple(f, "sorted", "sorted()", MethodRole.SHORT, "print(*sorted(words$rev))", "Слова сортируются лексикографически (по кодам символов).", "O(L log n)", "O(n)", 5) },
                { simple(f, "sort-method", "list.sort()", MethodRole.ALTERNATIVE, "words.sort(${rev.removePrefix(", ")})\nprint(*words)", "Сортировка списка слов на месте.", "O(L log n)", "O(1) дополнительно", 5) },
            )
        }
        return listOf(
            { genericLoop(f, "for w in words:", "for", "Цикл for по словам", "split() делит строку на слова по пробелам; перебираем их циклом.", "O(L), L — длина строки") },
            { genericBuiltin(f, "for w in words", "len(words)", "Встроенные функции", "O(L)") },
            { wordsSorted(f) },
            { wordsRegex(f) },
            { genericFunctional(f, "words", "O(L)") },
        )
    }

    private fun wordsSorted(f: Frame): Method? {
        if (f.op !in setOf(Op.MAX, Op.MIN)) return null
        val c = SeqCode(f)
        val cond = c.cond("w")
        val src = if (cond == null) "words" else "[w for w in words if $cond]"
        val rev = if (f.op == Op.MAX) ", reverse=True" else ""
        return simple(f, "sort", "sorted по длине", MethodRole.ALTERNATIVE,
            "cands = sorted($src, key=len$rev)\nprint(cands[0] if cands else \"NO\")",
            "Сортируем слова по длине (сортировка устойчивая, поэтому при равной длине сохраняется исходный порядок) и берём первое.",
            "O(n log n)", "O(n)", 4)
    }

    private fun wordsRegex(f: Frame): Method? {
        if (f.op != Op.COUNT || f.filters.isNotEmpty()) return null
        val b = PyBuilder().import("import re")
        b.line("s = input()")
        b.line("print(len(re.findall(r\"\\S+\", s)))")
        return Method(
            approach = "regex",
            title = "Регулярное выражение \\S+",
            role = MethodRole.ALTERNATIVE,
            code = b.build(),
            idea = "Слово — это максимальная последовательность непробельных символов \\S+.",
            principle = "re.findall(r\"\\S+\", s) возвращает все слова; их количество и есть ответ. Несколько пробелов подряд не создают пустых слов.",
            time = "O(L)",
            memory = "O(L)",
            pros = listOf("Легко изменить определение слова (например, только буквы: [A-Za-zА-Яа-яЁё]+)"),
            cons = listOf("Нужно знать регулярные выражения"),
            whenToUse = "Когда слова отделены не только пробелами (знаки препинания и т.п.).",
            readability = 3,
        )
    }

    // ================================================================== DIVISORS

    private fun divisors(f: Frame): List<() -> Method?> {
        val upper = if (f.proper) "n" else "n + 1"
        val extra = "n % d == 0"
        return listOf(
            { divisorsLoop(f, upper, extra) },
            { divisorsSqrt(f) },
            { divisorsBuiltin(f, upper, extra) },
            { divisorsFormula(f) },
        )
    }

    private fun divisorsLoop(f: Frame, upper: String, extra: String): Method? {
        val supported = setOf(Op.SUM, Op.PRODUCT, Op.COUNT, Op.AVERAGE, Op.MAX, Op.MIN, Op.SELECT, Op.ANY, Op.FIRST, Op.LAST, Op.ALL)
        if (f.op !in supported) return null
        val code = build(f) { c ->
            c.loopInit(this, f.op)
            block("for d in range(1, $upper):") {
                if (f.op == Op.ALL) {
                    block("if $extra and ${c.negCond("d")}:") { c.loopUpdate(this, Op.ALL, "d") }
                } else c.filteredUpdate(this, f.op, extraCond = extra)
            }
            c.loopFinish(this, f.op)
            true
        } ?: return null
        return Method(
            approach = "loop",
            title = "Перебор всех чисел от 1 до n",
            role = MethodRole.BEGINNER,
            code = code,
            idea = "d — делитель n, если n % d == 0. Проверяем все d от 1 до n.",
            principle = "Остаток от деления n на d равен нулю ровно тогда, когда d делит n. Перебор идёт по возрастанию, поэтому делители получаются упорядоченными.",
            time = "O(n)" + primeExtra(f),
            memory = if (f.op in resultMemory) "O(число делителей)" else "O(1)",
            pros = listOf("Очевидно правильно", "Делители сразу по возрастанию"),
            cons = listOf("Медленно для n > 10⁷"),
            whenToUse = "Когда n небольшое (до ~10⁶–10⁷).",
            readability = 5,
        )
    }

    private fun divisorsSqrt(f: Frame): Method? {
        val supported = setOf(Op.SUM, Op.PRODUCT, Op.COUNT, Op.AVERAGE, Op.MAX, Op.MIN, Op.SELECT, Op.ANY, Op.FIRST, Op.LAST, Op.ALL)
        if (f.op !in supported) return null
        val c = SeqCode(f)
        val b = PyBuilder()
        c.prepare(b)
        c.readInput(b)
        b.lines("small, large = [], []", "d = 1")
        b.block("while d * d <= n:") {
            block("if n % d == 0:") {
                line("small.append(d)")
                block("if d != n // d:") { line("large.append(n // d)") }
            }
            line("d += 1")
        }
        b.line("divisors = small + large[::-1]")
        if (f.proper) b.line("divisors.pop()")
        c.builtinLines(b, f.op, "for d in divisors", sizeExpr = "len(divisors)")
        return Method(
            approach = "sqrt",
            title = "Перебор до √n парами",
            role = MethodRole.EFFICIENT,
            code = b.build(),
            idea = "Делители идут парами d и n / d, причём меньший из пары не больше √n. Достаточно перебрать d до √n.",
            principle = "Если d делит n, то n // d тоже делитель. Меньшие делители (≤ √n) собираются в small, парные к ним — в large. " +
                "large разворачивается, чтобы весь список шёл по возрастанию. Для точного квадрата пара d == n // d добавляется один раз." +
                (if (f.proper) " pop() удаляет само число n (последний делитель)." else ""),
            time = "O(√n)" + primeExtra(f),
            memory = "O(число делителей)",
            pros = listOf("Для n = 10¹² нужно лишь 10⁶ итераций", "Стандартная олимпиадная техника"),
            cons = listOf("Нужно аккуратно обработать точный квадрат"),
            whenToUse = "Почти всегда, особенно для больших n.",
            readability = 3,
        )
    }

    private fun divisorsBuiltin(f: Frame, upper: String, extra: String): Method? {
        val code = build(f) { c ->
            if (f.op == Op.ALL) {
                line("print(\"YES\" if all(${c.cond("d")} for d in range(1, $upper) if $extra) else \"NO\")")
                true
            } else c.builtinLines(this, f.op, "for d in range(1, $upper)", extraCond = extra)
        } ?: return null
        return Method(
            approach = "builtin",
            title = "Генератор + встроенные функции",
            role = MethodRole.SHORT,
            code = code,
            idea = "Одно выражение: генератор перебирает d и оставляет делители, встроенная функция считает ответ.",
            principle = "«d for d in range(1, n + 1) if n % d == 0» перечисляет делители; sum/len/max/… сворачивают их.",
            time = "O(n)" + primeExtra(f),
            memory = "O(1)",
            pros = listOf("Самый короткий код"),
            cons = listOf("Такая же медленная асимптотика O(n), как у простого перебора"),
            whenToUse = "Для небольших n, когда важна краткость.",
            readability = 4,
            minPython = if (f.op == Op.PRODUCT) "3.8" else null,
        )
    }

    private fun divisorsFormula(f: Frame): Method? {
        if (f.filters.isNotEmpty() || f.transform != Transform.NONE || f.op !in setOf(Op.COUNT, Op.SUM)) return null
        val b = PyBuilder()
        b.line("n = int(input())")
        b.lines("m = n", "count, total = 1, 1", "p = 2")
        b.block("while p * p <= m:") {
            block("if m % p == 0:") {
                line("e = 0")
                block("while m % p == 0:") { line("m //= p"); line("e += 1") }
                line("count *= e + 1")
                line("total *= (p ** (e + 1) - 1) // (p - 1)")
            }
            line("p += 1")
        }
        b.block("if m > 1:") { line("count *= 2"); line("total *= m + 1") }
        if (f.proper) { b.line("count -= 1"); b.line("total -= n") }
        b.line(if (f.op == Op.COUNT) "print(count)" else "print(total)")
        return Method(
            approach = "formula",
            title = "Через разложение на простые множители",
            role = MethodRole.ALTERNATIVE,
            code = b.build(),
            idea = "Если n = p₁^e₁ · … · pₖ^eₖ, то число делителей τ(n) = (e₁+1)…(eₖ+1), а их сумма σ(n) = Π (pᵢ^(eᵢ+1) − 1)/(pᵢ − 1).",
            principle = "Раскладываем n на простые множители перебором до √n. Для каждого простого p с показателем e умножаем count на (e + 1), " +
                "а total — на сумму 1 + p + … + p^e = (p^(e+1) − 1)/(p − 1). Оставшийся множитель m > 1 — простое число в первой степени.",
            time = "O(√n)",
            memory = "O(1)",
            pros = listOf("Не хранит список делителей", "Знакомит с мультипликативными функциями τ и σ"),
            cons = listOf("Нужно знать теорию чисел"),
            whenToUse = "Когда нужны только количество или сумма делителей, а n велико.",
            readability = 2,
        )
    }

    // ================================================================== MATRIX

    private fun matrix(f: Frame): List<() -> Method?> = listOf(
        { matrixLoop(f) },
        { matrixBuiltin(f) },
        { matrixChain(f) },
        { matrixMapRows(f) },
    )

    private fun matrixLoop(f: Frame): Method? {
        val supported = setOf(Op.SUM, Op.PRODUCT, Op.COUNT, Op.AVERAGE, Op.MAX, Op.MIN, Op.RANGE_DIFF, Op.ANY, Op.ALL, Op.FIRST, Op.LAST, Op.SELECT, Op.UNIQUE_COUNT)
        if (f.op !in supported) return null
        val code = build(f) { c ->
            c.loopInit(this, f.op)
            block("for row in a:") {
                block("for x in row:") { c.filteredUpdate(this, f.op, allowBreak = false) }
            }
            c.loopFinish(this, f.op)
            true
        } ?: return null
        return Method(
            approach = "nested",
            title = "Вложенные циклы",
            role = MethodRole.BEGINNER,
            code = code,
            idea = "Внешний цикл перебирает строки матрицы, внутренний — элементы строки.",
            principle = "Матрица хранится как список списков: a[i] — i-я строка, a[i][j] — элемент. Вложенные циклы посещают каждый элемент ровно один раз.",
            time = "O(n·m)" + primeExtra(f),
            memory = "O(1) дополнительно",
            pros = listOf("Самый наглядный способ обхода матрицы"),
            cons = listOf("break во внутреннем цикле не прерывает внешний"),
            whenToUse = "Для обучения и задач, где нужны индексы i, j.",
            readability = 5,
        )
    }

    private fun matrixBuiltin(f: Frame): Method? {
        val noFilter = f.filters.isEmpty() && f.transform == Transform.NONE
        if (noFilter && f.op in setOf(Op.SUM, Op.MAX, Op.MIN)) {
            val fn = when (f.op) { Op.SUM -> "sum"; Op.MAX -> "max"; else -> "min" }
            val code = build(f) { _ -> line("print($fn($fn(row) for row in a))"); true }!!
            return Method(
                approach = "builtin",
                title = "$fn по строкам",
                role = MethodRole.SHORT,
                code = code,
                idea = "Сначала $fn каждой строки, затем $fn полученных значений.",
                principle = "$fn(row) обрабатывает одну строку, внешний $fn объединяет результаты всех строк.",
                time = "O(n·m)", memory = "O(1)",
                pros = listOf("Одна строка", "Быстро"), cons = listOf("Не подходит, если нужен фильтр по элементам"),
                whenToUse = "Для простых агрегатов по всей матрице.", readability = 5,
            )
        }
        val code = build(f) { c -> c.builtinLines(this, f.op, "for row in a for x in row", sizeExpr = "n * m") } ?: return null
        return Method(
            approach = "builtin",
            title = "Генератор по всем элементам",
            role = MethodRole.SHORT,
            code = code,
            idea = "Двойной генератор «x for row in a for x in row» перечисляет все элементы матрицы подряд.",
            principle = "В генераторе циклы записываются в том же порядке, что и вложенные циклы for.",
            time = "O(n·m)" + primeExtra(f), memory = "O(1)",
            pros = listOf("Коротко, без вложенных блоков"), cons = listOf("Порядок for в генераторе сначала путает"),
            whenToUse = "Когда матрицу нужно обработать как один поток чисел.", readability = 4,
            minPython = if (f.op == Op.PRODUCT) "3.8" else null,
        )
    }

    private fun matrixChain(f: Frame): Method? {
        val code = build(f) { c ->
            import("from itertools import chain")
            line("flat = list(chain.from_iterable(a))")
            c.builtinLines(this, f.op, "for x in flat", sizeExpr = "len(flat)")
        } ?: return null
        return Method(
            approach = "chain",
            title = "itertools.chain — «расплющить» матрицу",
            role = MethodRole.PYTHONIC,
            code = code,
            idea = "chain.from_iterable склеивает все строки в один список, дальше задача — как для обычного списка.",
            principle = "Сведение двумерной задачи к одномерной: flat содержит все n·m элементов по строкам.",
            time = "O(n·m)", memory = "O(n·m) — копия элементов",
            pros = listOf("Переиспользует решения для списков"), cons = listOf("Тратит память на копию"),
            whenToUse = "Когда структура строк не важна.", readability = 4,
        )
    }

    private fun matrixMapRows(f: Frame): Method? {
        if (f.filters.isNotEmpty() || f.transform != Transform.NONE || f.op !in setOf(Op.SUM, Op.MAX, Op.MIN)) return null
        val fn = when (f.op) { Op.SUM -> "sum"; Op.MAX -> "max"; else -> "min" }
        val code = build(f) { _ -> line("print($fn(map($fn, a)))"); true }!!
        return Method(
            approach = "map-rows",
            title = "$fn(map($fn, a))",
            role = MethodRole.ALTERNATIVE,
            code = code,
            idea = "map применяет $fn к каждой строке, внешний $fn объединяет результаты.",
            principle = "Функциональная запись того же двухуровневого агрегата.",
            time = "O(n·m)", memory = "O(1)",
            pros = listOf("Очень коротко"), cons = listOf("Только для операций, которые можно применить к строкам и к результатам"),
            whenToUse = "Для sum/max/min по матрице.", readability = 4,
        )
    }
}
