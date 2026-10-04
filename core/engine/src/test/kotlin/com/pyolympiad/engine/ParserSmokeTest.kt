package com.pyolympiad.engine

import com.pyolympiad.engine.nlp.Lexicon
import com.pyolympiad.engine.nlp.QueryParser
import org.junit.Test

class ParserSmokeTest {
    @Test
    fun printParses() {
        val lex = Lexicon.parse(TestAssets.text("solver/lexicon.tsv"))
        val p = QueryParser(lex)
        listOf(
            "n natural son berilgan uning raqamlari yigindisini toping",
            "Дано натуральное число N. Найти сумму его цифр.",
            "naiti summu chetnyh cifr chisla",
            "Дано четырёхзначное число. Вывести его в обратном порядке",
            "Find the number of elements of the array divisible by 3",
            "Найдите сумму чисел от 1 до n, делящихся на k (1 ≤ n ≤ 10^9)",
            "Найти НОД чисел 12 и 18",
            "massivdagi 5 dan katta sonlar sonini toping",
            "Посчитайте количество гласных в строке",
            "Найдите сумму диогоналей матрицы",
        ).forEach { println(it + "\n   -> " + p.parse(it)) }
    }
}
