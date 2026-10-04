package com.pyolympiad.engine.nlp

import com.pyolympiad.engine.text.Skeleton
import com.pyolympiad.engine.text.TextNormalizer
import com.pyolympiad.engine.text.Token
import com.pyolympiad.engine.text.TokenType
import com.pyolympiad.engine.text.Transliterator

enum class Language(val titleRu: String) {
    RUSSIAN("русский"),
    RUSSIAN_TRANSLIT("русский (транслит латиницей)"),
    ENGLISH("английский"),
    UZBEK("узбекский (латиница)"),
    UNKNOWN("не определён"),
}

data class LanguageGuess(val language: Language, val confidence: Double)

/**
 * Detects the language of a task statement. Cyrillic text is Russian; Latin text is
 * scored as English, Uzbek or Russian typed in translit using function words,
 * morphology and the solver lexicon.
 */
object LanguageDetector {

    private val EN = setOf(
        "the", "a", "an", "of", "and", "or", "to", "in", "is", "are", "given", "find", "print", "output",
        "input", "number", "numbers", "integer", "integers", "list", "array", "string", "word", "words",
        "all", "each", "every", "that", "which", "how", "many", "write", "program", "return", "its", "their",
        "from", "with", "if", "not", "between", "contains", "line", "first", "second", "then", "for", "it",
        "your", "you", "task", "calculate", "compute", "determine", "count", "sum", "digits", "this", "be",
        "by", "on", "as", "than", "greater", "less", "should", "must", "following", "single", "value", "values",
    )

    private val UZ = setOf(
        "berilgan", "berilgan.", "toping", "topilsin", "son", "sonlar", "sonning", "soni", "sonini", "va", "bilan",
        "uchun", "eng", "katta", "kichik", "juft", "toq", "nechta", "chiqaring", "kiriting", "hisoblang",
        "aniqlang", "massiv", "satr", "harf", "butun", "qator", "ekub", "ekuk", "teng", "agar", "aks", "holda",
        "dastur", "tuzing", "elementlar", "elementlari", "misol", "kiritiladi", "chiqarilsin", "ning", "dan",
        "gacha", "ga", "ni", "bo'lgan", "bolgan", "uning", "ularning", "barcha", "hamma", "nechta", "qancha",
        "yozing", "toping.", "raqamlari", "raqamlar", "yig'indisini", "yigindisini", "yig'indisi", "yigindisi",
        "ko'paytmasini", "kopaytmasini", "o'rtacha", "ortacha", "so'z", "soz", "so'zlar", "sozlar", "tub",
        "musbat", "manfiy", "nol", "berilgan", "ro'yxat", "royxat", "lar", "bor", "yo'q", "yoq", "har", "bir",
    )

    private val RU_TRANSLIT = setOf(
        "dano", "dana", "dany", "dan", "naiti", "naidite", "naydite", "nayti", "naiti", "vyvesti", "vyvedite",
        "chislo", "chisla", "chisel", "summa", "summu", "summy", "spisok", "spiska", "stroka", "stroku",
        "stroki", "massiv", "massiva", "cifr", "cifry", "tsifr", "tsifry", "chetnyh", "chetnykh", "nechetnyh",
        "kolichestvo", "programma", "programmu", "napishite", "napisat", "kotoroe", "kotoraya", "kotoryi",
        "elementov", "elementy", "slovo", "slova", "bukv", "bukvy", "naturalnoe", "natural'noe", "celoe",
        "celye", "tseloe", "vse", "iz", "ego", "eto", "dlya", "esli", "ili", "na", "po", "ot", "do", "pri",
        "kak", "chto", "privet", "zadacha", "reshenie", "cikl", "uslovie", "funkciya", "slovar", "matrica",
        "proverka", "maksimum", "minimum", "proizvedenie", "srednee", "naibolshee", "naimenshee",
        "chisel", "skolko", "opredelite", "proverte", "yavlyaetsya", "li", "palindromom", "prostoe",
        "delitelei", "delitelej", "otvet", "vvod", "vyvod", "stroke", "chetnye", "nechetnye", "posledovatelnost",
    )

    fun detect(text: String, tokens: List<Token>, lexicon: Lexicon?): LanguageGuess {
        val ratio = TextNormalizer.cyrillicRatio(text)
        if (ratio >= 0.5) return LanguageGuess(Language.RUSSIAN, 0.6 + 0.4 * ratio)
        val words = tokens.filter { it.type == TokenType.WORD }
        if (words.isEmpty()) return LanguageGuess(Language.UNKNOWN, 0.0)
        var en = 0.0
        var uz = 0.0
        var rt = 0.0
        for (t in words) {
            val w = t.text
            if (w in EN) en += 1.0
            if (w in UZ || w.replace("'", "") in UZ) uz += 1.2
            if (w in RU_TRANSLIT) rt += 1.2
            if (w.contains("o'") || w.contains("g'")) uz += 0.8
            if (w.endsWith("ning") || w.endsWith("lari") || w.endsWith("larni") || w.endsWith("dagi") ||
                w.endsWith("sini") || w.endsWith("ing") && w.length > 5 && !w.endsWith("ting")) uz += 0.3
            if (w.length > 3 && (w.endsWith("yh") || w.endsWith("ykh") || w.endsWith("ogo") || w.endsWith("ost") ||
                    w.endsWith("iya") || w.endsWith("ov") || w.endsWith("ami") || w.endsWith("yi") || w.endsWith("aya"))) rt += 0.4
            if (lexicon != null) {
                val langs = lexicon.languagesOf(t)
                if (LexLang.EN in langs) en += 0.5
                if (LexLang.UZ in langs) uz += 0.6
                if (LexLang.RU in langs && Skeleton.cyrillic(Transliterator.latinToCyrillic(w)).length >= 3) rt += 0.6
            }
        }
        val total = en + uz + rt
        if (total < 0.5) return LanguageGuess(if (ratio > 0) Language.RUSSIAN else Language.UNKNOWN, 0.2)
        val (lang, score) = listOf(Language.ENGLISH to en, Language.UZBEK to uz, Language.RUSSIAN_TRANSLIT to rt)
            .maxBy { it.second }
        return LanguageGuess(lang, (score / total).coerceIn(0.0, 1.0))
    }
}
