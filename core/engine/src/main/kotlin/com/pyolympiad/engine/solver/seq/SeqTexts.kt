package com.pyolympiad.engine.solver.seq

import com.pyolympiad.engine.nlp.Operand
import com.pyolympiad.engine.nlp.ParsedQuery
import com.pyolympiad.engine.text.TokenType

/** Russian texts for sequence tasks: restatement, formats, edge cases, links. */
internal object SeqTexts {

    private fun genPlAdj(fl: Filter): Pair<String?, String?> = when (fl.kind) {
        FKind.EVEN -> "чётных" to null
        FKind.ODD -> "нечётных" to null
        FKind.POSITIVE -> "положительных" to null
        FKind.NEGATIVE -> "отрицательных" to null
        FKind.ZERO -> "нулевых" to null
        FKind.NONZERO -> "ненулевых" to null
        FKind.PRIME -> "простых" to null
        FKind.COMPOSITE -> "составных" to null
        FKind.DIV -> null to "делящихся на ${fl.p}"
        FKind.NDIV -> null to "не делящихся на ${fl.p}"
        FKind.GT -> null to "больших ${fl.p}"
        FKind.LT -> null to "меньших ${fl.p}"
        FKind.GE -> null to "не меньших ${fl.p}"
        FKind.LE -> null to "не больших ${fl.p}"
        FKind.EQ -> null to "равных ${fl.p}"
        FKind.NE -> null to "не равных ${fl.p}"
        FKind.PSQUARE -> null to "являющихся полными квадратами"
        FKind.TWO_DIGIT -> "двузначных" to null
        FKind.THREE_DIGIT -> "трёхзначных" to null
        FKind.PALINDROME -> null to "являющихся палиндромами"
        FKind.VOWEL -> "гласных" to null
        FKind.CONSONANT -> "согласных" to null
        FKind.UPPER -> "заглавных" to null
        FKind.LOWER -> "строчных" to null
        FKind.LETTER -> null to null
        FKind.DIGITCH -> null to null
        FKind.SPACE -> null to null
        FKind.LEN_GT -> null to "длиннее ${fl.p} символов"
        FKind.LEN_LT -> null to "короче ${fl.p} символов"
        FKind.LEN_EQ -> null to "длиной ровно ${fl.p} символов"
    }

    private fun nomPl(fl: Filter): String = when (fl.kind) {
        FKind.EVEN -> "чётные"; FKind.ODD -> "нечётные"; FKind.POSITIVE -> "положительные"; FKind.NEGATIVE -> "отрицательные"
        FKind.ZERO -> "нули"; FKind.NONZERO -> "ненулевые"; FKind.PRIME -> "простые"; FKind.COMPOSITE -> "составные"
        FKind.DIV -> "делящиеся на ${fl.p}"; FKind.NDIV -> "не делящиеся на ${fl.p}"; FKind.GT -> "большие ${fl.p}"
        FKind.LT -> "меньшие ${fl.p}"; FKind.GE -> "не меньшие ${fl.p}"; FKind.LE -> "не большие ${fl.p}"
        FKind.EQ -> "равные ${fl.p}"; FKind.NE -> "не равные ${fl.p}"; FKind.PSQUARE -> "полные квадраты"
        FKind.TWO_DIGIT -> "двузначные"; FKind.THREE_DIGIT -> "трёхзначные"; FKind.PALINDROME -> "палиндромы"
        FKind.VOWEL -> "гласные буквы"; FKind.CONSONANT -> "согласные буквы"; FKind.UPPER -> "заглавные буквы"
        FKind.LOWER -> "строчные буквы"; FKind.LETTER -> "буквы"; FKind.DIGITCH -> "цифры"; FKind.SPACE -> "пробелы"
        FKind.LEN_GT -> "длиннее ${fl.p} символов"; FKind.LEN_LT -> "короче ${fl.p} символов"; FKind.LEN_EQ -> "длиной ${fl.p} символов"
    }

    /** Noun (genitive plural) for the source elements, possibly replaced by a filter noun. */
    private fun noun(f: Frame): String {
        val charNoun = f.filters.firstOrNull { it.kind in setOf(FKind.LETTER, FKind.DIGITCH, FKind.SPACE, FKind.VOWEL, FKind.CONSONANT, FKind.UPPER, FKind.LOWER) }
        if (f.source == Source.CHARS && charNoun != null) return when (charNoun.kind) {
            FKind.DIGITCH -> "цифр строки"
            FKind.SPACE -> "пробелов строки"
            else -> "букв строки"
        }
        return when (f.source) {
            Source.DIGITS -> "цифр числа"
            Source.LIST -> "элементов списка"
            Source.RANGE -> "чисел от ${f.range!!.lo} до ${f.range.hi}"
            Source.CHARS -> "символов строки"
            Source.WORDS -> "слов"
            Source.DIVISORS -> if (f.proper) "собственных делителей числа n" else "делителей числа n"
            Source.MATRIX -> "элементов матрицы"
        }
    }

    private fun nounNomPl(f: Frame): String = when (f.source) {
        Source.DIGITS -> "цифры числа"; Source.LIST -> "элементы списка"; Source.RANGE -> "числа диапазона"
        Source.CHARS -> "символы строки"; Source.WORDS -> "слова"; Source.DIVISORS -> "делители числа n"; Source.MATRIX -> "элементы матрицы"
    }

    /** "чётных положительных элементов списка, делящихся на 3" */
    fun phrase(f: Frame): String {
        val pre = ArrayList<String>()
        val post = ArrayList<String>()
        for (fl in f.filters) {
            val (a, b) = genPlAdj(fl)
            a?.let { pre += it }
            b?.let { post += it }
        }
        val tr = when (f.transform) {
            Transform.SQUARE -> "квадратов "
            Transform.CUBE -> "кубов "
            Transform.ABS -> "модулей "
            Transform.NONE -> ""
        }
        val core = (pre + noun(f)).joinToString(" ")
        return tr + core + if (post.isNotEmpty()) ", " + post.joinToString(" и ") else ""
    }

    private fun given(f: Frame): String = when (f.source) {
        Source.DIGITS -> when (f.fixedDigits) {
            2 -> "Дано двузначное число n"
            3 -> "Дано трёхзначное число n"
            4 -> "Дано четырёхзначное число n"
            5 -> "Дано пятизначное число n"
            6 -> "Дано шестизначное число n"
            else -> if (f.natural) "Дано натуральное число n" else "Дано целое число n"
        }
        Source.LIST -> if (f.listWithCount) "Дан список из n целых чисел" else "Дан список целых чисел"
        Source.RANGE -> "Рассматриваются все целые числа от ${f.range!!.lo} до ${f.range.hi} включительно"
        Source.CHARS -> "Дана строка s"
        Source.WORDS -> "Дана строка из слов, разделённых пробелами"
        Source.DIVISORS -> "Дано натуральное число n"
        Source.MATRIX -> "Дана матрица из n строк и m столбцов"
    }

    fun understood(f: Frame): String {
        val p = phrase(f)
        val task = when (f.op) {
            Op.SUM -> "Найти сумму $p."
            Op.PRODUCT -> "Найти произведение $p."
            Op.COUNT -> "Найти количество $p."
            Op.AVERAGE -> "Найти среднее арифметическое $p."
            Op.MAX -> if (f.source == Source.WORDS) (if (f.filters.isEmpty()) "Найти самое длинное слово." else "Найти самое длинное среди $p.") else "Найти наибольшее значение среди $p."
            Op.MIN -> if (f.source == Source.WORDS) (if (f.filters.isEmpty()) "Найти самое короткое слово." else "Найти самое короткое среди $p.") else "Найти наименьшее значение среди $p."
            Op.RANGE_DIFF -> "Найти разность между наибольшим и наименьшим значениями среди $p."
            Op.SELECT -> "Вывести (в исходном порядке) значения всех $p."
            Op.REMOVE -> "Удалить ${if (f.source == Source.CHARS) "из строки" else ""} все ${f.filters.joinToString(" ") { nomPl(it) }} и вывести результат."
            Op.UNIQUE_COUNT -> "Найти количество различных значений среди $p."
            Op.UNIQUE_LIST -> "Вывести различные значения среди $p в порядке первого появления."
            Op.ANY -> "Проверить, есть ли среди ${noun(f)} ${f.filters.joinToString(" и ") { nomPl(it) }}. Вывести YES или NO."
            Op.ALL -> "Проверить, все ли ${nounNomPl(f)} — ${f.filters.joinToString(" и ") { nomPl(it) }}. Вывести YES или NO."
            Op.FIRST -> "Найти первое (слева) значение среди $p."
            Op.LAST -> "Найти последнее (справа) значение среди $p."
            Op.REVERSE -> when (f.source) {
                Source.DIGITS -> "Вывести число, записанное теми же цифрами в обратном порядке."
                Source.CHARS -> "Вывести строку в обратном порядке."
                Source.WORDS -> "Вывести слова в обратном порядке."
                else -> "Вывести элементы в обратном порядке."
            }
            Op.SORT_ASC -> "Вывести ${nounNomPl(f)} в порядке возрастания."
            Op.SORT_DESC -> "Вывести ${nounNomPl(f)} в порядке убывания."
            Op.INDEX_MAX -> "Найти ${if (f.oneBased) "номер" else "индекс"} наибольшего ${if (f.filters.isEmpty()) "элемента списка" else "среди $p"} (первого, если их несколько)."
            Op.INDEX_MIN -> "Найти ${if (f.oneBased) "номер" else "индекс"} наименьшего ${if (f.filters.isEmpty()) "элемента списка" else "среди $p"} (первого, если их несколько)."
        }
        return "${given(f)}. $task".replace("  ", " ")
    }

    fun title(f: Frame): String = understood(f).substringAfter(". ").substringBefore(".").replaceFirstChar { it.uppercase() }

    fun inputFormat(f: Frame): String {
        val params = f.paramVars
        val p = if (params.isEmpty()) "" else " ${params.joinToString(" ")}"
        return when (f.source) {
            Source.DIGITS, Source.DIVISORS -> if (params.isEmpty()) "Одна строка: целое число n." else "Одна строка: n$p через пробел."
            Source.LIST -> (if (f.listWithCount) "Первая строка: n. Вторая строка: n целых чисел через пробел." else "Одна строка: целые числа через пробел.") +
                (if (params.isEmpty()) "" else " Последняя строка:$p.")
            Source.RANGE -> {
                val vars = f.range!!.readVars + params
                if (vars.isEmpty()) "Ввода нет: границы заданы в условии." else "Одна строка: ${vars.joinToString(" ")} через пробел."
            }
            Source.CHARS -> "Одна строка s." + if (params.isEmpty()) "" else " Следующая строка:$p."
            Source.WORDS -> "Одна строка со словами через пробел." + if (params.isEmpty()) "" else " Следующая строка:$p."
            Source.MATRIX -> "Первая строка: n и m. Далее n строк по m целых чисел." + if (params.isEmpty()) "" else " Последняя строка:$p."
        }
    }

    fun outputFormat(f: Frame): String = when (f.op) {
        Op.SUM, Op.PRODUCT, Op.COUNT, Op.UNIQUE_COUNT -> "Одно целое число."
        Op.AVERAGE -> "Дробное число (float) или NO, если подходящих элементов нет."
        Op.MAX, Op.MIN, Op.FIRST, Op.LAST, Op.RANGE_DIFF, Op.INDEX_MAX, Op.INDEX_MIN -> "Одно значение или NO, если подходящих элементов нет."
        Op.ANY, Op.ALL -> "YES или NO."
        Op.SELECT, Op.UNIQUE_LIST, Op.REMOVE, Op.SORT_ASC, Op.SORT_DESC, Op.REVERSE ->
            if (f.source == Source.CHARS || (f.source == Source.DIGITS && f.op != Op.SELECT && f.op != Op.UNIQUE_LIST)) "Одна строка." else "Значения в одной строке через пробел."
    }

    fun edgeCases(f: Frame, q: ParsedQuery?): List<String> {
        val out = ArrayList<String>()
        when (f.source) {
            Source.DIGITS -> {
                if (f.fixedDigits == null) out += "n = 0: у числа одна цифра 0 — циклы с проверкой в конце это учитывают."
                if (!f.natural && f.fixedDigits == null) out += "Отрицательное n: знак не является цифрой, поэтому берём модуль abs(n)."
                out += "Очень большое n (сотни цифр): в Python целые числа не переполняются."
                if (f.op == Op.REVERSE) out += "Нули в конце числа (1200): в перевёрнутом числе они становятся ведущими и пропадают — получается 21. Если нужно сохранить нули, выводите строку str(n)[::-1]."
            }
            Source.LIST -> {
                out += "Один элемент в списке."
                out += "Отрицательные числа и нули."
                out += "Все элементы одинаковые."
            }
            Source.RANGE -> {
                out += "Пустой диапазон (нижняя граница больше верхней): сумма и количество равны 0."
                out += "Большие границы (10⁹ и больше): перебор не успеет — используйте формулу или range с шагом."
            }
            Source.CHARS -> {
                out += "Пустая строка."
                out += "Буквы в разном регистре и смесь кириллицы с латиницей."
                out += "Пробелы и знаки препинания."
            }
            Source.WORDS -> {
                out += "Несколько пробелов подряд: split() без аргументов их пропускает и не создаёт пустых слов."
                out += "Пустая строка: слов нет."
                if (f.op == Op.MAX || f.op == Op.MIN) out += "Несколько слов одинаковой длины: выводится первое из них."
            }
            Source.DIVISORS -> {
                out += "n = 1: единственный делитель 1${if (f.proper) " (собственных делителей нет)" else ""}."
                out += "n — простое число: делители только 1 и n."
                out += "n — точный квадрат (например, 36): делитель √n нельзя учитывать дважды."
            }
            Source.MATRIX -> {
                out += "Матрица из одной строки или одного столбца."
                out += "Отрицательные элементы."
            }
        }
        if (f.filters.any { it.kind == FKind.DIV || it.kind == FKind.NDIV }) out += "Делитель k = 0 недопустим: n % 0 вызывает ZeroDivisionError."
        if (f.filters.isNotEmpty() && f.op !in setOf(Op.ALL, Op.REMOVE)) {
            val empty = when (f.op) {
                Op.SUM, Op.COUNT, Op.UNIQUE_COUNT -> "ответ 0"
                Op.PRODUCT -> "произведение пустого набора равно 1 (уточните по условию, если ожидается другое)"
                Op.SELECT, Op.UNIQUE_LIST -> "выводится пустая строка"
                Op.ANY -> "ответ NO"
                else -> "выводится NO"
            }
            out += "Подходящих элементов нет: $empty."
        }
        if (f.op == Op.AVERAGE) out += "Среднее — дробное число: / всегда даёт float. Для вывода с 2 знаками: print(f\"{avg:.2f}\")."
        if (f.op == Op.PRODUCT) out += "Произведение быстро растёт, но целые числа Python не переполняются."
        if (f.op == Op.ALL) out += "Пустой набор: «все элементы удовлетворяют условию» считается истинным (YES)."
        if (q != null) {
            val big = q.maxBound
            if (big != null && big >= java.math.BigInteger.valueOf(10_000_000) && f.source in setOf(Source.RANGE, Source.DIVISORS)) {
                out += "По ограничениям n может быть до $big — выбирайте способ с подходящей сложностью (см. «Сравнить способы»)."
            }
        }
        return out
    }

    fun topics(f: Frame): List<String> {
        val t = ArrayList<String>()
        when (f.source) {
            Source.DIGITS -> t += listOf("Цифры числа", "Арифметика: // и %", "Циклы")
            Source.LIST -> t += listOf("Списки", "Циклы")
            Source.RANGE -> t += listOf("Арифметика", "Циклы", "Арифметическая прогрессия")
            Source.CHARS -> t += listOf("Строки", "Символы")
            Source.WORDS -> t += listOf("Строки", "Слова и split()")
            Source.DIVISORS -> t += listOf("Делители", "Теория чисел")
            Source.MATRIX -> t += listOf("Матрицы", "Вложенные циклы")
        }
        if (f.filters.any { it.kind == FKind.PRIME || it.kind == FKind.COMPOSITE }) t += "Простые числа"
        if (f.filters.isNotEmpty()) t += "Условия (if)"
        when (f.op) {
            Op.SORT_ASC, Op.SORT_DESC -> t += "Сортировка"
            Op.UNIQUE_COUNT, Op.UNIQUE_LIST -> t += "Множества (set)"
            Op.AVERAGE -> t += "Дробные числа (float)"
            Op.REVERSE -> t += "Срезы"
            else -> {}
        }
        return t.distinct()
    }

    fun dataStructures(f: Frame): List<String> {
        val d = ArrayList<String>()
        d += when (f.source) {
            Source.DIGITS -> "int (целое число)"
            Source.LIST -> "list (список)"
            Source.RANGE -> "range (диапазон)"
            Source.CHARS -> "str (строка)"
            Source.WORDS -> "list[str] (список слов)"
            Source.DIVISORS -> "list (список делителей)"
            Source.MATRIX -> "list[list[int]] (список списков)"
        }
        if (f.op in setOf(Op.UNIQUE_COUNT, Op.UNIQUE_LIST)) d += "set (множество)"
        if (f.op in setOf(Op.SELECT, Op.REMOVE)) d += "list (результат)"
        return d
    }

    fun algorithm(f: Frame): Pair<String, String> = when {
        f.op == Op.REVERSE && f.source == Source.DIGITS -> "Разворот числа" to "Цифры снимаются с конца (n % 10) и приписываются к ответу, либо число разворачивается как строка."
        f.op == Op.SORT_ASC || f.op == Op.SORT_DESC -> "Сортировка" to "Встроенная сортировка Timsort работает за O(n log n); для маленького алфавита значений подходит сортировка подсчётом."
        f.source == Source.DIGITS -> "Разбор числа на цифры" to "Любую задачу про цифры решает цикл: d = n % 10 — последняя цифра, n //= 10 — отбросить её. Каждая цифра обрабатывается один раз."
        f.source == Source.RANGE -> "Перебор диапазона или формула арифметической прогрессии" to
            "Числа диапазона можно перебрать циклом за O(n). Если подходящие числа образуют арифметическую прогрессию, ответ считается формулой за O(1)."
        f.source == Source.DIVISORS -> "Поиск делителей до √n" to "Делители образуют пары (d, n/d), меньший из пары ≤ √n, поэтому перебор до √n находит все делители."
        f.source == Source.MATRIX -> "Обход матрицы" to "Каждый элемент посещается один раз двумя вложенными циклами."
        else -> "Линейный проход с фильтрацией" to "Каждый элемент рассматривается ровно один раз: если он подходит под условие, учитываем его в ответе. Время O(n)."
    }

    fun knowledge(f: Frame): List<String> {
        val k = ArrayList<String>()
        when (f.source) {
            Source.DIGITS -> k += listOf("algo:digits", "py:op:mod", "py:op:floordiv", "py:kw:while", "py:builtin:str", "py:builtin:int")
            Source.LIST -> k += listOf("py:topic:lists", "py:kw:for", "py:builtin:sum", "py:builtin:max", "py:builtin:min", "py:builtin:len")
            Source.RANGE -> k += listOf("py:builtin:range", "algo:arithmetic-progression", "py:kw:for", "py:builtin:sum")
            Source.CHARS -> k += listOf("py:topic:strings", "py:method:str.count", "py:method:str.isupper", "py:method:str.isalpha", "lib:re")
            Source.WORDS -> k += listOf("py:method:str.split", "py:method:str.join", "py:builtin:max", "py:builtin:len")
            Source.DIVISORS -> k += listOf("algo:divisors", "py:op:mod", "lib:math.isqrt")
            Source.MATRIX -> k += listOf("algo:matrices", "py:topic:lists", "lib:itertools.chain")
        }
        if (f.filters.any { it.kind == FKind.PRIME }) k += listOf("algo:primes", "algo:sieve")
        if (f.filters.isNotEmpty()) k += "py:kw:if"
        k += listOf("py:topic:comprehensions", "py:topic:generators", "py:builtin:filter", "py:builtin:map")
        when (f.op) {
            Op.PRODUCT -> k += listOf("lib:math.prod", "lib:functools.reduce")
            Op.ANY -> k += "py:builtin:any"
            Op.ALL -> k += "py:builtin:all"
            Op.SORT_ASC, Op.SORT_DESC -> k += listOf("py:builtin:sorted", "algo:sorting", "algo:counting-sort")
            Op.REVERSE -> k += listOf("py:topic:slicing", "py:builtin:reversed")
            Op.UNIQUE_COUNT, Op.UNIQUE_LIST -> k += listOf("py:builtin:set", "lib:collections.Counter")
            Op.INDEX_MAX, Op.INDEX_MIN -> k += listOf("py:builtin:enumerate", "py:method:list.index")
            else -> {}
        }
        return k.distinct()
    }

    fun samples(f: Frame): List<String> {
        val pv = f.paramVars
        fun withParams(base: String, sameLine: Boolean, values: List<String>): String {
            if (pv.isEmpty()) return base
            val vs = pv.indices.map { values.getOrElse(it) { "3" } }.joinToString(" ")
            return if (sameLine) "$base $vs" else "$base\n$vs"
        }
        val pvals = f.filters.filter { it.param is Operand.Var }.map { fl ->
            when (fl.kind) { FKind.LEN_GT, FKind.LEN_LT, FKind.LEN_EQ -> "3"; FKind.DIV, FKind.NDIV -> "3"; else -> "2" }
        }
        return when (f.source) {
            Source.DIGITS -> {
                val base = when (f.fixedDigits) {
                    2 -> listOf("47", "10", "99")
                    3 -> listOf("123", "100", "907")
                    4 -> listOf("1234", "1200", "9999", "1000")
                    5 -> listOf("12345", "10000", "90807")
                    6 -> listOf("123321", "100001", "555555")
                    else -> if (f.natural) listOf("12345", "7", "2468", "9081726354", "1000") else listOf("12345", "0", "7", "-2468", "9081726354")
                }
                base.map { withParams(it, true, pvals) }
            }
            Source.DIVISORS -> listOf("12", "1", "28", "97", "36").map { withParams(it, true, pvals) }
            Source.LIST -> {
                val lists = listOf("3 -1 4 1 5 9 2 6", "7", "-2 -4 -6", "10 20 30 20 10", "0 15 -9 33 2")
                lists.map { l ->
                    val n = l.split(' ').size
                    withParams(if (f.listWithCount) "$n\n$l" else l, false, pvals)
                }
            }
            Source.RANGE -> {
                val reads = f.range!!.readVars
                val sets: List<List<String>> = when (reads.size) {
                    0 -> listOf(emptyList())
                    1 -> listOf(listOf("10"), listOf("1"), listOf("100"), listOf("37"))
                    else -> listOf(listOf("1", "10"), listOf("5", "20"), listOf("10", "5"), listOf("-7", "7"))
                }
                sets.map { s -> (s + pv.indices.map { pvals.getOrElse(it) { "3" } }).joinToString(" ") }
            }
            Source.CHARS -> listOf("Hello World", "Привет, Мир! 2024", "aAeE iou XYZ", "abc").map { withParams(it, false, pvals) }
            Source.WORDS -> listOf("the quick brown fox jumps over", "Мама мыла раму", "level noon test racecar", "a bb ccc dd").map { withParams(it, false, pvals) }
            Source.MATRIX -> listOf("2 3\n1 2 3\n4 5 6", "3 3\n-1 0 1\n2 -2 3\n9 8 7", "1 1\n5").map { withParams(it, false, pvals) }
        }
    }

    /** stdin built from concrete values in the statement ("сумма цифр числа 12345"). */
    fun concreteInput(f: Frame, q: ParsedQuery): String? {
        val nums = q.inputNumbers.mapNotNull { it.number?.toString() }
        val pv = f.paramVars
        return when (f.source) {
            Source.DIGITS, Source.DIVISORS -> if (nums.size == 1 + pv.size) nums.joinToString(" ") else null
            Source.LIST -> if (nums.size >= 2 && pv.isEmpty()) {
                val l = nums.joinToString(" ")
                if (f.listWithCount) "${nums.size}\n$l" else l
            } else null
            Source.RANGE -> {
                val reads = f.range!!.readVars
                when {
                    reads.isEmpty() && pv.isEmpty() -> ""
                    nums.size == reads.size + pv.size && nums.isNotEmpty() -> nums.joinToString(" ")
                    else -> null
                }
            }
            Source.CHARS, Source.WORDS -> q.tokens.firstOrNull { it.type == TokenType.QUOTED }?.let { quotedOriginal(q, it.text) }?.takeIf { pv.isEmpty() }
            Source.MATRIX -> null
        }
    }

    /** Quoted text from the original (not lower-cased) statement. */
    private fun quotedOriginal(q: ParsedQuery, lower: String): String {
        val m = Regex("[\"«“„]([^\"»”]*)[\"»”]").findAll(q.original).map { it.groupValues[1] }.firstOrNull { it.lowercase() == lower }
        return m ?: lower
    }

    fun explanation(f: Frame, main: com.pyolympiad.engine.solver.Method): List<String> {
        val steps = ArrayList<String>()
        steps += "Ввод: " + inputFormat(f)
        steps += when (f.source) {
            Source.DIGITS -> "Перебираем цифры числа. Последняя цифра — n % 10, а n // 10 удаляет её."
            Source.LIST -> "Перебираем элементы списка a по одному."
            Source.RANGE -> "Перебираем числа от ${f.range!!.lo} до ${f.range.hi}: range(начало, конец + 1), потому что правая граница range не включается."
            Source.CHARS -> "Перебираем символы строки s."
            Source.WORDS -> "split() разбивает строку на слова по пробелам, затем перебираем слова."
            Source.DIVISORS -> "Число d — делитель n, если n % d == 0."
            Source.MATRIX -> "Перебираем строки матрицы и элементы в каждой строке."
        }
        if (f.filters.isNotEmpty()) {
            val c = SeqCode(f).cond()
            steps += "Условие отбора: ${f.filters.joinToString(", ") { nomPl(it) }} → в Python: $c."
        }
        steps += when (f.op) {
            Op.SUM -> "Складываем подходящие значения (начинаем с 0)."
            Op.PRODUCT -> "Перемножаем подходящие значения (начинаем с 1 — нейтрального элемента умножения)."
            Op.COUNT -> "Считаем подходящие элементы: +1 за каждый."
            Op.AVERAGE -> "Считаем сумму и количество, среднее = сумма / количество."
            Op.MAX, Op.MIN -> "Храним лучший найденный элемент и сравниваем с ним каждый следующий."
            Op.SELECT -> "Собираем подходящие элементы в порядке появления."
            Op.REMOVE -> "Оставляем только элементы, которые НЕ нужно удалять."
            Op.ANY -> "Как только найден подходящий элемент — ответ YES, дальше можно не искать."
            Op.ALL -> "Как только найден элемент, нарушающий условие — ответ NO."
            else -> "Применяем операцию: ${main.title}."
        }
        steps += "Корректность: каждый элемент рассматривается ровно один раз, поэтому учтены все подходящие элементы и только они."
        steps += "Сложность: время ${main.time}, память ${main.memory}."
        return steps
    }
}
