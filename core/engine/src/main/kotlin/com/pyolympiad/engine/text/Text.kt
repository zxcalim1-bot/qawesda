package com.pyolympiad.engine.text

import java.math.BigInteger

/**
 * Text utilities shared by the task solver, the code analyzer and the search engine.
 *
 * Everything here is deterministic, allocation-light and works without any
 * external resources so it can run on a watch.
 */
object TextNormalizer {

    private val APOSTROPHES = setOf('\'', '’', '‘', 'ʻ', 'ʼ', '`', '´', 'ʹ', '′')

    /** Lower-cases, unifies apostrophes/dashes/comparison signs and collapses whitespace. */
    fun normalize(input: String): String {
        val sb = StringBuilder(input.length + 8)
        for (ch in input) {
            when {
                ch in APOSTROPHES -> sb.append('\'')
                ch == 'ё' || ch == 'Ё' -> sb.append('е')
                ch == '≤' || ch == '⩽' -> sb.append("<=")
                ch == '≥' || ch == '⩾' -> sb.append(">=")
                ch == '≠' -> sb.append("!=")
                ch == '×' || ch == '·' || ch == '∙' -> sb.append('*')
                ch == '−' || ch == '–' || ch == '—' -> sb.append('-')
                ch == '«' || ch == '»' || ch == '“' || ch == '”' || ch == '„' -> sb.append('"')
                ch == ' ' || ch == '\t' -> sb.append(' ')
                else -> sb.append(ch.lowercaseChar())
            }
        }
        return sb.toString().replace(Regex("[ ]{2,}"), " ").trim()
    }

    fun isCyrillic(ch: Char): Boolean = ch in 'Ѐ'..'ӿ'
    fun isLatin(ch: Char): Boolean = ch in 'a'..'z' || ch in 'A'..'Z'

    fun cyrillicRatio(s: String): Double {
        var cyr = 0
        var letters = 0
        for (ch in s) {
            if (ch.isLetter()) {
                letters++
                if (isCyrillic(ch)) cyr++
            }
        }
        return if (letters == 0) 0.0 else cyr.toDouble() / letters
    }
}

/**
 * Russian <-> Latin transliteration.
 *
 * Latin -> Cyrillic is tuned for the way people actually type Russian with a Latin
 * keyboard ("spisok", "stroka", "chetnyh cifr", "funkciya", "zadachi"), including the
 * minimum rules sh→ш, ch→ч, zh→ж, ya→я, yu→ю, yo→ё, kh→х, ts→ц.
 */
object Transliterator {

    private val MULTI = listOf(
        "shch" to "щ", "sch" to "щ", "shh" to "щ",
        "zh" to "ж", "kh" to "х", "ch" to "ч", "sh" to "ш", "ts" to "ц", "tz" to "ц",
        "yo" to "ё", "jo" to "ё", "yu" to "ю", "ju" to "ю", "ya" to "я", "ja" to "я",
        "ck" to "к", "ph" to "ф", "iy" to "ий", "yy" to "ый", "ij" to "ий", "yj" to "ый",
    )

    private val SINGLE = mapOf(
        'a' to "а", 'b' to "б", 'v' to "в", 'g' to "г", 'd' to "д", 'e' to "е", 'z' to "з",
        'i' to "и", 'j' to "й", 'k' to "к", 'l' to "л", 'm' to "м", 'n' to "н", 'o' to "о",
        'p' to "п", 'r' to "р", 's' to "с", 't' to "т", 'u' to "у", 'f' to "ф", 'h' to "х",
        'c' to "ц", 'x' to "кс", 'w' to "в", 'q' to "к", '\'' to "ь",
    )

    private val VOWELS_LAT = setOf('a', 'e', 'i', 'o', 'u', 'y')

    /** Converts one Latin word typed as Russian translit into Cyrillic. */
    fun latinToCyrillic(word: String): String {
        val w = word.lowercase()
        val sb = StringBuilder(w.length + 2)
        var i = 0
        while (i < w.length) {
            // Word-initial "ye"/"e" handling: "yesli" -> "если".
            if (i == 0 && w.startsWith("ye")) {
                sb.append("е"); i += 2; continue
            }
            var matched = false
            for ((lat, cyr) in MULTI) {
                if (w.startsWith(lat, i)) {
                    // "iy"/"yy" are only endings ("noviy", "chetnyy"); inside a word treat normally.
                    if ((lat == "iy" || lat == "yy" || lat == "ij" || lat == "yj") && i + lat.length != w.length) continue
                    sb.append(cyr); i += lat.length; matched = true; break
                }
            }
            if (matched) continue
            val ch = w[i]
            if (ch == 'y') {
                val prev = if (i > 0) w[i - 1] else ' '
                sb.append(if (prev in VOWELS_LAT) "й" else if (i == 0) "й" else "ы")
                i++; continue
            }
            sb.append(SINGLE[ch] ?: ch.toString())
            i++
        }
        return sb.toString()
    }

    private val CYR_TO_LAT = mapOf(
        'а' to "a", 'б' to "b", 'в' to "v", 'г' to "g", 'д' to "d", 'е' to "e", 'ё' to "yo",
        'ж' to "zh", 'з' to "z", 'и' to "i", 'й' to "y", 'к' to "k", 'л' to "l", 'м' to "m",
        'н' to "n", 'о' to "o", 'п' to "p", 'р' to "r", 'с' to "s", 'т' to "t", 'у' to "u",
        'ф' to "f", 'х' to "kh", 'ц' to "ts", 'ч' to "ch", 'ш' to "sh", 'щ' to "shch",
        'ъ' to "", 'ы' to "y", 'ь' to "", 'э' to "e", 'ю' to "yu", 'я' to "ya",
    )

    fun cyrillicToLatin(text: String): String {
        val sb = StringBuilder(text.length + 8)
        for (ch in text) {
            val lower = ch.lowercaseChar()
            val mapped = CYR_TO_LAT[lower]
            if (mapped == null) sb.append(ch) else sb.append(mapped)
        }
        return sb.toString()
    }
}

/**
 * "Skeleton" forms make spelling variants collide on purpose:
 * чётных / четных / chetnyh / chetnykh -> "четних"; summa / сумма -> "сума".
 * Used for lexicon lookup and for search indexing (the build script uses the same rules).
 */
object Skeleton {

    fun cyrillic(word: String): String {
        val sb = StringBuilder(word.length)
        var last = ' '
        for (raw in word.lowercase()) {
            val ch = when (raw) {
                'ё' -> 'е'; 'э' -> 'е'; 'й' -> 'и'; 'ы' -> 'и'; 'щ' -> 'ш'
                'ъ', 'ь', '\'' -> continue
                else -> raw
            }
            if (ch == last) continue
            sb.append(ch)
            last = ch
        }
        return sb.toString()
    }

    fun latin(word: String): String {
        val sb = StringBuilder(word.length)
        var last = ' '
        for (raw in word.lowercase()) {
            if (raw == '\'' || raw == '-') continue
            if (raw == last) continue
            sb.append(raw)
            last = raw
        }
        return sb.toString()
    }

    /** Skeleton of any word: Cyrillic words directly, Latin words both as-is and via translit. */
    fun forms(word: String): List<String> {
        if (word.isEmpty()) return emptyList()
        return if (word.any { TextNormalizer.isCyrillic(it) }) {
            listOf(cyrillic(word))
        } else {
            val lat = latin(word)
            val cyr = cyrillic(Transliterator.latinToCyrillic(word))
            if (lat == cyr) listOf(lat) else listOf(lat, cyr)
        }
    }
}

object Fuzzy {

    /** Optimal string alignment (restricted Damerau-Levenshtein) distance with an early cut-off. */
    fun distance(a: String, b: String, max: Int = Int.MAX_VALUE): Int {
        if (a == b) return 0
        if (kotlin.math.abs(a.length - b.length) > max) return max + 1
        val n = a.length
        val m = b.length
        if (n == 0) return m
        if (m == 0) return n
        var prev2 = IntArray(m + 1)
        var prev = IntArray(m + 1) { it }
        var cur = IntArray(m + 1)
        for (i in 1..n) {
            cur[0] = i
            var rowMin = cur[0]
            for (j in 1..m) {
                val cost = if (a[i - 1] == b[j - 1]) 0 else 1
                var v = minOf(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost)
                if (i > 1 && j > 1 && a[i - 1] == b[j - 2] && a[i - 2] == b[j - 1]) {
                    v = minOf(v, prev2[j - 2] + 1)
                }
                cur[j] = v
                if (v < rowMin) rowMin = v
            }
            if (rowMin > max) return max + 1
            val t = prev2; prev2 = prev; prev = cur; cur = t
        }
        return prev[m]
    }

    /** Typo budget that grows with the word length: short words must match exactly. */
    fun budget(length: Int): Int = when {
        length <= 3 -> 0
        length <= 5 -> 1
        length <= 9 -> 2
        else -> 3
    }
}

/** Very light Russian stemmer used for search queries (strip common endings). */
object RussianStem {
    private val ENDINGS = listOf(
        "иями", "ями", "ами", "иях", "ого", "его", "ому", "ему", "ыми", "ими", "ая", "яя", "ое", "ее",
        "ые", "ие", "ый", "ий", "ой", "ей", "ую", "юю", "ом", "ем", "ах", "ях", "ов", "ев", "ам", "ям",
        "ия", "ию", "ии", "ть", "ти", "ся", "сь", "а", "я", "о", "е", "ы", "и", "у", "ю", "ь", "й",
    )

    fun stem(word: String): String {
        if (word.length <= 4) return word
        for (e in ENDINGS) {
            if (word.endsWith(e) && word.length - e.length >= 3) return word.substring(0, word.length - e.length)
        }
        return word
    }
}

enum class TokenType { WORD, NUMBER, QUOTED, SYMBOL }

data class Token(
    val type: TokenType,
    val text: String,
    val index: Int,
    /** Numeric value for NUMBER tokens (10^9 and 1e5 are expanded). */
    val number: BigInteger? = null,
    val decimal: Double? = null,
)

object Tokenizer {

    private val POWER = Regex("""^(\d+)\s*(?:\^|\*\*)\s*(\d+)""")
    private val SCI = Regex("""^(\d+(?:\.\d+)?)[eе](\d+)""")
    private val NUM = Regex("""^-?\d+(?:[.,]\d+)?""")

    fun tokenize(normalized: String): List<Token> {
        val out = ArrayList<Token>()
        var i = 0
        val s = normalized
        while (i < s.length) {
            val ch = s[i]
            when {
                ch.isWhitespace() -> i++
                ch == '"' -> {
                    val end = s.indexOf('"', i + 1)
                    if (end > i) {
                        out += Token(TokenType.QUOTED, s.substring(i + 1, end), out.size)
                        i = end + 1
                    } else i++
                }
                ch.isDigit() || (ch == '-' && i + 1 < s.length && s[i + 1].isDigit() &&
                    (i == 0 || s[i - 1] == ' ' || s[i - 1] == '(' || s[i - 1] == '[' || s[i - 1] == ',' || s[i - 1] == ':')) -> {
                    val rest = s.substring(i)
                    val pow = POWER.find(rest)
                    val sci = SCI.find(rest)
                    when {
                        pow != null -> {
                            val base = BigInteger(pow.groupValues[1])
                            val exp = pow.groupValues[2].toInt().coerceAtMost(4000)
                            out += Token(TokenType.NUMBER, pow.value, out.size, base.pow(exp))
                            i += pow.value.length
                        }
                        sci != null && !sci.groupValues[1].contains('.') -> {
                            val mant = BigInteger(sci.groupValues[1])
                            val exp = sci.groupValues[2].toInt().coerceAtMost(4000)
                            out += Token(TokenType.NUMBER, sci.value, out.size, mant.multiply(BigInteger.TEN.pow(exp)))
                            i += sci.value.length
                        }
                        else -> {
                            val m = NUM.find(rest)!!
                            val text = m.value
                            if (text.contains('.') || text.contains(',')) {
                                val d = text.replace(',', '.').toDoubleOrNull()
                                // "1,2,3" style lists: treat comma as a separator, not a decimal point.
                                if (text.contains(',') && i + text.length < s.length && s[i + text.length] == ',') {
                                    val intPart = text.substringBefore(',')
                                    out += Token(TokenType.NUMBER, intPart, out.size, intPart.toBigInteger())
                                    i += intPart.length
                                } else {
                                    out += Token(TokenType.NUMBER, text, out.size, null, d)
                                    i += text.length
                                }
                            } else {
                                out += Token(TokenType.NUMBER, text, out.size, BigInteger(text))
                                i += text.length
                            }
                        }
                    }
                }
                ch.isLetter() -> {
                    var j = i
                    while (j < s.length && (s[j].isLetter() || (s[j] == '\'' && j + 1 < s.length && s[j + 1].isLetter() && j > i) ||
                            (s[j] == '-' && j + 1 < s.length && s[j + 1].isLetter() && j > i && s[j - 1].isLetter()))) j++
                    // Keep "x2" / "a1" style identifiers together.
                    while (j < s.length && s[j].isDigit() && j > i && s[j - 1].isLetter() && (j - i) <= 2) j++
                    out += Token(TokenType.WORD, s.substring(i, j), out.size)
                    i = j
                }
                else -> {
                    val two = if (i + 1 < s.length) s.substring(i, i + 2) else ""
                    if (two == "<=" || two == ">=" || two == "!=" || two == "==" || two == "**" || two == "//") {
                        out += Token(TokenType.SYMBOL, two, out.size); i += 2
                    } else {
                        out += Token(TokenType.SYMBOL, ch.toString(), out.size); i++
                    }
                }
            }
        }
        return out
    }
}
