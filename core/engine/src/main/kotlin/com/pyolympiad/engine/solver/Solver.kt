package com.pyolympiad.engine.solver

import com.pyolympiad.engine.nlp.Lexicon
import com.pyolympiad.engine.nlp.ParsedQuery
import com.pyolympiad.engine.nlp.QueryParser
import com.pyolympiad.engine.solver.catalog.Catalog
import com.pyolympiad.engine.solver.seq.FrameDetector
import com.pyolympiad.engine.solver.seq.SequenceSkill
import com.pyolympiad.engine.text.TokenType

/**
 * Offline task solver. Pipeline (spec §38):
 * RECEIVE → NORMALIZE → DETECT LANGUAGE → DETECT TOPIC → EXTRACT CONSTRAINTS →
 * SEARCH ALGORITHMS → COMBINE KNOWLEDGE → SELECT → GENERATE PYTHON (several methods) →
 * CHECK EDGE CASES / COMPLEXITY → EXPLAIN → ANSWER.
 *
 * Running the generated code (answer for concrete input, cross-check of methods) is done
 * by the app with the embedded Python runtime, because this module is pure Kotlin.
 */
class Solver(private val lexicon: Lexicon, private val catalog: Catalog) {

    private val parser = QueryParser(lexicon)

    fun parse(text: String): ParsedQuery = parser.parse(text)

    fun solve(text: String): SolveResult {
        val trace = ArrayList<TraceStep>()
        trace += TraceStep("RECEIVE", "Получено условие: ${text.length} символов")
        val q = parser.parse(text)
        trace += TraceStep("NORMALIZE", q.normalized.take(160))
        val corrections = q.corrections.map { "${it.original} → ${it.corrected}" }
        if (corrections.isNotEmpty()) trace += TraceStep("TYPOS", corrections.joinToString(", "))
        trace += TraceStep("DETECT LANGUAGE", q.language.language.titleRu + " (уверенность ${(q.language.confidence * 100).toInt()}%)")
        val concepts = q.hits.map { it.concept }.filter { !it.startsWith("_") && it != "INPUT_LINE" }.distinct()
        val conceptLabels = concepts.map { ConceptNames.label(it) }
        trace += TraceStep("DETECT TOPIC", conceptLabels.joinToString(", ").ifEmpty { "ключевые понятия не найдены" })
        val constraintText = SequenceSkill.constraintsText(q)
        trace += TraceStep("EXTRACT CONSTRAINTS", constraintText ?: "явных ограничений нет")

        // Candidates: named algorithms from the catalog + compositional sequence frame.
        val ranked = catalog.rank(q)
        val frame = FrameDetector.detect(q)
        trace += TraceStep(
            "SEARCH ALGORITHMS",
            buildList {
                ranked.take(3).forEach { add("${it.skill.title} (${"%.1f".format(it.score)})") }
                frame?.let { add("комбинация «источник → фильтр → операция» (${"%.1f".format(it.second)})") }
            }.joinToString("; ").ifEmpty { "подходящих алгоритмов не найдено" },
        )

        data class Option(val id: String, val title: String, val score: Double, val build: () -> Solution?)
        val options = ArrayList<Option>()
        for (r in ranked) options += Option(r.skill.id, r.skill.title, r.score) { catalog.solve(r.skill, q, confidence(r.score)) }
        if (frame != null) {
            val (f, s) = frame
            options += Option("seq", "Комбинация знаний", s) { SequenceSkill.solve(f, q, confidence(s)) }
        }
        options.sortByDescending { it.score }

        val best = options.firstOrNull()
        if (best == null || best.score < MIN_SCORE) {
            trace += TraceStep("RESULT", "надёжное решение не найдено")
            return SolveResult(
                input = text,
                languageTitle = q.language.language.titleRu,
                corrections = corrections,
                detectedConcepts = conceptLabels,
                constraints = listOfNotNull(constraintText),
                solution = null,
                alternatives = options.take(3).map { Candidate(it.id, it.title, it.score) },
                trace = trace,
                failure = FAILURE,
                searchHint = searchHint(q),
            )
        }
        val solution = best.build()
        if (solution == null) {
            trace += TraceStep("RESULT", "не удалось построить код")
            return SolveResult(text, q.language.language.titleRu, corrections, conceptLabels, listOfNotNull(constraintText), null,
                emptyList(), trace, FAILURE, searchHint(q))
        }
        trace += TraceStep("COMBINE KNOWLEDGE", "темы: ${solution.topics.joinToString(", ")}; идеи: ${solution.keyIdeas.take(3).joinToString("; ")}")
        trace += TraceStep("SELECT ALGORITHM", solution.algorithm)
        trace += TraceStep("GENERATE PYTHON", "способов: ${solution.methods.size} (${solution.methods.joinToString(", ") { it.title }})")
        trace += TraceStep("CHECK EDGE CASES", "${solution.edgeCases.size} крайних случаев, ${solution.samples.size} тестов")
        trace += TraceStep("CHECK COMPLEXITY", solution.methods.joinToString("; ") { "${it.title}: ${it.time}" }.take(200))
        trace += TraceStep("EXPLAIN", solution.understood)
        val alternatives = options.drop(1).filter { it.score >= best.score * 0.6 && it.id != best.id }.take(3)
            .map { Candidate(it.id, it.title, it.score) }
        return SolveResult(
            input = text,
            languageTitle = q.language.language.titleRu,
            corrections = corrections,
            detectedConcepts = conceptLabels,
            constraints = listOfNotNull(constraintText),
            solution = solution,
            alternatives = alternatives,
            trace = trace,
            searchHint = searchHint(q),
        )
    }

    /** Solves the statement with a specific candidate (user picked "Возможно, вы имели в виду"). */
    fun solveWith(text: String, candidateId: String): Solution? {
        val q = parser.parse(text)
        if (candidateId == "seq") {
            val (f, s) = FrameDetector.detect(q) ?: return null
            return SequenceSkill.solve(f, q, confidence(s))
        }
        val skill = catalog.byId(candidateId) ?: return null
        return catalog.solve(skill, q, 0.5)
    }

    private fun confidence(score: Double): Double = (score / 4.0).coerceIn(0.1, 0.98)

    private fun searchHint(q: ParsedQuery): String {
        val words = q.tokens.filter { it.type == TokenType.WORD && it.text.length >= 3 }.map { it.text }
        return words.take(8).joinToString(" ")
    }

    companion object {
        const val MIN_SCORE = 1.6
        const val FAILURE = "Не удалось надёжно определить решение. Попробуйте переформулировать условие."
    }
}

/** Human-readable Russian labels for concepts (shown as "Тема" and in the trace). */
object ConceptNames {
    private val labels = mapOf(
        "NUMBER" to "число", "INTEGER" to "целое число", "NATURAL" to "натуральное число", "DIGIT" to "цифры",
        "LIST" to "список/массив", "ELEMENT" to "элементы", "STRING" to "строка", "WORD" to "слова", "CHAR" to "символы",
        "LETTER" to "буквы", "VOWEL" to "гласные", "CONSONANT" to "согласные", "UPPER" to "заглавные буквы",
        "LOWER" to "строчные буквы", "SPACE" to "пробелы", "MATRIX" to "матрица", "ROW" to "строки матрицы",
        "COLUMN" to "столбцы", "DIAGONAL" to "диагональ", "DIVISOR" to "делители", "PRIME" to "простые числа",
        "RANGE" to "диапазон", "PAIR" to "пары", "GRAPH" to "граф", "VERTEX" to "вершины", "EDGE" to "рёбра",
        "TREE" to "дерево", "PATH" to "путь", "SHORTEST" to "кратчайший", "MAZE" to "лабиринт/поле", "SUM" to "сумма",
        "PRODUCT" to "произведение", "COUNT" to "количество", "MAX" to "максимум", "MIN" to "минимум",
        "AVERAGE" to "среднее", "EVEN" to "чётные", "ODD" to "нечётные", "POSITIVE" to "положительные",
        "NEGATIVE" to "отрицательные", "ZERO" to "ноль", "DIVISIBLE" to "делимость", "NOT_DIVISIBLE" to "не делится",
        "GREATER" to "больше", "LESS" to "меньше", "EQUAL" to "равно", "GCD" to "НОД", "LCM" to "НОК",
        "FACTORIAL" to "факториал", "FIBONACCI" to "Фибоначчи", "PALINDROME" to "палиндром", "ANAGRAM" to "анаграмма",
        "REVERSE" to "обратный порядок", "SORT" to "сортировка", "ASC" to "по возрастанию", "DESC" to "по убыванию",
        "UNIQUE" to "различные значения", "BINARY" to "двоичная система", "BASE" to "система счисления",
        "SEARCH" to "поиск", "BSEARCH" to "бинарный поиск", "POWER" to "степень", "MOD" to "остаток/модуль",
        "SQUARE" to "квадрат", "CUBE" to "куб", "ROOT" to "корень", "SQRT" to "квадратный корень",
        "TRIANGLE" to "треугольник", "AREA" to "площадь", "PERIMETER" to "периметр", "CIRCLE" to "окружность",
        "LEAP" to "високосный год", "YEAR" to "год", "QUADRATIC" to "квадратное уравнение", "EQUATION" to "уравнение",
        "BRACKETS" to "скобки", "BALANCED" to "правильность", "SUBSTRING" to "подстрока", "SUBSEQUENCE" to "подпоследовательность",
        "SUBARRAY" to "подотрезок", "CONSECUTIVE" to "подряд идущие", "LONGEST" to "самый длинный",
        "MOST_FREQUENT" to "самый частый", "OCCURRENCE" to "вхождения", "REPLACE" to "замена", "REMOVE" to "удаление",
        "DUPLICATE" to "повторы", "MERGE" to "слияние", "ROTATE" to "сдвиг", "CIPHER" to "шифр", "COMPRESS" to "сжатие",
        "COIN" to "монеты", "STAIRS" to "лестница", "KNAPSACK" to "рюкзак", "WAYS" to "число способов",
        "PERMUTATION" to "перестановки", "COMBINATION" to "сочетания", "SUBSET" to "подмножества",
        "DIJKSTRA" to "Дейкстра", "BFS" to "обход в ширину", "DFS" to "обход в глубину", "DSU" to "DSU",
        "COMPONENTS" to "компоненты связности", "CYCLE" to "цикл в графе", "TOPOLOGICAL" to "топологическая сортировка",
        "MST" to "остовное дерево", "BITS" to "биты", "FACTORIZE" to "разложение на множители", "SIEVE" to "решето",
        "TWO" to "два значения", "THREE" to "три значения", "POSITION" to "позиция/индекс", "FIRST" to "первый",
        "LAST" to "последний", "SECOND" to "второй", "EXISTS" to "существование", "ALL" to "все",
        "CHECK" to "проверка", "PRINT" to "вывод", "AGE" to "возраст", "SECONDS" to "время", "WEEKDAY" to "день недели",
        "MULT_TABLE" to "таблица умножения", "STARS" to "узор из символов", "HELLO" to "приветствие",
        "QUERY" to "запросы", "WINDOW" to "окно", "PREFIX" to "префикс", "COMMON" to "общий", "INCREASING" to "возрастающая",
        "EDIT_DISTANCE" to "редакционное расстояние", "INVERSION" to "инверсии", "MISSING" to "пропущенное",
        "NEXT_GREATER" to "следующий больший", "INTERVALS" to "интервалы", "OVERLAP" to "пересечение",
        "TRANSPOSE" to "транспонирование", "SPIRAL" to "спираль", "SYMMETRIC" to "симметрия", "PANGRAM" to "панграмма",
        "SWAP" to "обмен", "SIGN" to "знак", "STACK" to "стек", "QUEUE" to "очередь", "DISTANCE" to "расстояние",
        "POINT" to "точки", "RADIUS" to "радиус", "SIDE" to "стороны", "RECTANGLE" to "прямоугольник",
        "RIGHT_ANGLE" to "прямой угол", "PYTHAGOREAN" to "Пифагор", "DIGITAL_ROOT" to "цифровой корень",
        "TOTIENT" to "функция Эйлера", "HANOI" to "Ханойская башня", "QUEEN" to "ферзи", "COLLATZ" to "Коллатц",
        "ARMSTRONG" to "число Армстронга", "PERFECT" to "совершенное число", "TICKET" to "счастливый билет",
        "CONVERT" to "перевод", "DECIMAL" to "десятичная", "HEX" to "шестнадцатеричная", "OCTAL" to "восьмеричная",
        "CELSIUS" to "Цельсий", "FAHRENHEIT" to "Фаренгейт", "DATE" to "дата", "DAYS" to "дни", "MINUTES" to "минуты",
        "HOURS" to "часы", "LENGTH" to "длина", "PROPER" to "собственные", "MAIN" to "главная", "SECONDARY" to "побочная",
        "PERFECT_SQUARE" to "полный квадрат", "GREATER_EQ" to "не меньше", "LESS_EQ" to "не больше",
        "TWO_DIGIT" to "двузначные", "THREE_DIGIT" to "трёхзначные", "FOUR_DIGIT" to "четырёхзначное",
        "FIVE_DIGIT" to "пятизначное", "SIX_DIGIT" to "шестизначное", "DIFF" to "разность", "QUOTIENT" to "частное",
        "ABS" to "модуль", "WEIGHT" to "вес", "VALUE" to "стоимость", "WITHOUT" to "без", "NOT" to "отрицание",
        "EACH" to "каждый", "KTH" to "k-й", "ISLAND" to "острова", "DIAMETER" to "диаметр", "BIPARTITE" to "двудольность",
        "SUBSEQ_SUM" to "сумма подмножества", "ADJACENT_NOT" to "несоседние", "PATTERN_GRID_PATHS" to "пути по сетке",
        "MINIMUM_COINS" to "минимум монет", "OCTAL" to "восьмеричная",
    )

    fun label(concept: String): String = labels[concept] ?: concept.lowercase().replace('_', ' ')
}
