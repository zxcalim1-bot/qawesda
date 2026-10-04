package com.pyolympiad.engine.solver.catalog

import com.pyolympiad.engine.nlp.Operand
import com.pyolympiad.engine.nlp.ParsedQuery
import com.pyolympiad.engine.solver.Method
import com.pyolympiad.engine.solver.MethodRole
import com.pyolympiad.engine.solver.SampleTest
import com.pyolympiad.engine.solver.Solution
import com.pyolympiad.engine.text.TokenType

/**
 * Named algorithmic skills loaded from assets/solver/skills.md.
 *
 * File format (one skill per "# skill:" header):
 * ```
 * # skill: gcd
 * title: НОД двух чисел
 * match: GCD | (COMMON & DIVISOR & MAX)     boolean expression over lexicon concepts
 * boost: TWO, NUMBER                         concepts that make the match more likely
 * avoid: LIST, LCM                           concepts that make it less likely
 * priority: 1.5
 * input: a b                                 stdin layout, lines separated by " | "
 * param: K = num(CIPHER, ROTATE) default 3   value bound from the statement, used as {K}
 * param: OFF = 1 if POSITION:номер else 0    conditional literal
 * sample: 12 18 => 6                         sample stdin ("\n" = new line) and optional expected output
 * ## Method title
 * role: beginner|short|efficient|alternative|pythonic
 * time: ..., memory: ..., idea: ..., principle: ..., pros: a; b, cons: a; b, when: ..., readability: 4
 * ```python
 * code
 * ```
 * ```
 */
class Catalog private constructor(val skills: List<Skill>) {

    class Skill(
        val id: String,
        val fields: Map<String, List<String>>,
        val methods: List<RawMethod>,
    ) {
        fun one(key: String): String? = fields[key]?.firstOrNull()
        fun all(key: String): List<String> = fields[key].orEmpty()
        fun list(key: String): List<String> = fields[key].orEmpty().flatMap { it.split(';', ',') }.map { it.trim() }.filter { it.isNotEmpty() }

        val title: String get() = one("title") ?: id
        val match: Expr by lazy { ExprParser.parse(one("match") ?: "FALSE") }
        val boost: List<String> by lazy { list("boost") }
        val avoid: List<String> by lazy { list("avoid") }
        val priority: Double get() = one("priority")?.toDoubleOrNull() ?: 1.0
    }

    class RawMethod(val title: String, val fields: Map<String, String>, val code: String)

    fun byId(id: String): Skill? = skills.firstOrNull { it.id == id }

    data class Scored(val skill: Skill, val score: Double)

    /** Concepts that carry little information on their own. */
    private val generic = setOf(
        "_STOP", "INPUT_LINE", "PRINT", "CHECK", "NUMBER", "INTEGER", "NATURAL", "ELEMENT", "NOT", "EACH",
        "FIRST", "SEARCH", "LE_PHRASE", "GE_PHRASE", "TWO", "THREE", "COUNT", "EXISTS", "ALL", "VALUE",
    )

    fun rank(q: ParsedQuery): List<Scored> {
        val significant = q.conceptNames.filter { it !in generic }
        val out = ArrayList<Scored>()
        for (s in skills) {
            if (!s.match.eval(q)) continue
            val inMatch = s.match.concepts().filter { q.has(it) }
            var score = s.priority + inMatch.size * 1.0
            score += s.boost.count { q.has(it) } * 0.4
            score -= s.avoid.count { q.has(it) } * 1.2
            val explained = (s.match.concepts() + s.boost).toSet()
            if (significant.isNotEmpty()) {
                val covered = significant.count { it in explained }
                score += 0.8 * covered / significant.size
                score -= 0.15 * (significant.size - covered)
            }
            out += Scored(s, score)
        }
        return out.sortedByDescending { it.score }
    }

    fun solve(skill: Skill, q: ParsedQuery?, confidence: Double): Solution {
        val params = bindParams(skill, q)
        fun sub(s: String): String {
            var r = s
            for ((k, v) in params) r = r.replace("{$k}", v)
            return r
        }
        val methods = skill.methods.map { m ->
            Method(
                approach = m.fields["approach"] ?: m.title,
                title = sub(m.title),
                role = when (m.fields["role"]?.trim()) {
                    "beginner" -> MethodRole.BEGINNER
                    "short" -> MethodRole.SHORT
                    "efficient" -> MethodRole.EFFICIENT
                    "pythonic" -> MethodRole.PYTHONIC
                    else -> MethodRole.ALTERNATIVE
                },
                code = sub(m.code).trimEnd() + "\n",
                idea = sub(m.fields["idea"] ?: ""),
                principle = sub(m.fields["principle"] ?: m.fields["idea"] ?: ""),
                time = m.fields["time"] ?: "",
                memory = m.fields["memory"] ?: "",
                pros = m.fields["pros"]?.split(';')?.map { sub(it.trim()) }?.filter { it.isNotEmpty() }.orEmpty(),
                cons = m.fields["cons"]?.split(';')?.map { sub(it.trim()) }?.filter { it.isNotEmpty() }.orEmpty(),
                whenToUse = sub(m.fields["when"] ?: ""),
                readability = m.fields["readability"]?.trim()?.toIntOrNull() ?: 3,
                minPython = m.fields["python"]?.trim(),
            )
        }
        val ordered = orderForConstraints(skill, methods, q)
        val samples = skill.all("sample").map { line ->
            val (input, expected) = if ("=>" in line) line.substringBefore("=>").trimEnd() to line.substringAfter("=>").trim() else line to null
            SampleTest(sub(input.replace("\\n", "\n")), expected?.replace("\\n", "\n")?.let { sub(it) })
        }
        return Solution(
            skillId = skill.id,
            title = sub(skill.title),
            understood = sub(skill.one("understood") ?: skill.title),
            topics = skill.list("topics"),
            keyIdeas = skill.all("ideas").flatMap { it.split(';') }.map { sub(it.trim()) }.filter { it.isNotEmpty() },
            dataStructures = skill.list("structures"),
            algorithm = sub(skill.one("algorithm") ?: skill.title),
            algorithmWhy = sub(skill.one("why") ?: "") + constraintAdvice(skill, ordered, q),
            inputFormat = sub(skill.one("input_desc") ?: ""),
            outputFormat = sub(skill.one("output_desc") ?: ""),
            constraintNote = q?.let { constraintsText(it) },
            methods = ordered,
            edgeCases = skill.all("edge").map { sub(it) },
            samples = samples,
            concreteInput = q?.let { concreteInput(skill, it) },
            nativeAnswer = null,
            explanation = skill.all("step").map { sub(it) },
            knowledge = skill.list("links"),
            confidence = confidence,
        )
    }

    private fun orderForConstraints(skill: Skill, methods: List<Method>, q: ParsedQuery?): List<Method> {
        val sorted = methods.sortedBy { it.role.order }
        val limit = skill.one("big")?.toBigIntegerOrNull() ?: return sorted
        val big = q?.maxBound ?: return sorted
        if (big < limit) return sorted
        val eff = sorted.filter { it.role == MethodRole.EFFICIENT }
        return eff + sorted.filter { it.role != MethodRole.EFFICIENT }
    }

    private fun constraintAdvice(skill: Skill, methods: List<Method>, q: ParsedQuery?): String {
        val big = q?.maxBound ?: return ""
        val limit = skill.one("big")?.toBigIntegerOrNull()
        if (limit != null && big >= limit) {
            val eff = methods.firstOrNull { it.role == MethodRole.EFFICIENT }
            if (eff != null) return " По ограничениям значения доходят до $big, поэтому первым показан способ «${eff.title}» (${eff.time})."
        }
        return " Ограничения из условия: до $big."
    }

    private fun constraintsText(q: ParsedQuery): String? {
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

    private fun bindParams(skill: Skill, q: ParsedQuery?): Map<String, String> {
        val out = LinkedHashMap<String, String>()
        for (line in skill.all("param")) {
            val name = line.substringBefore('=').trim()
            val rhs = line.substringAfter('=').trim()
            val numM = Regex("""num\(([^)]*)\)\s*default\s*(\S+)""").find(rhs)
            val ifM = Regex("""^(\S+)\s+if\s+(\S+)\s+else\s+(\S+)$""").find(rhs)
            when {
                numM != null -> {
                    val concepts = numM.groupValues[1].split(',').map { it.trim() }
                    val bound = q?.params?.firstOrNull { it.concept in concepts && it.value is Operand.Num }?.value
                    out[name] = bound?.toString() ?: numM.groupValues[2]
                }
                ifM != null -> {
                    val cond = ifM.groupValues[2]
                    val yes = q != null && conditionHolds(q, cond)
                    out[name] = if (yes) ifM.groupValues[1] else ifM.groupValues[3]
                }
                else -> out[name] = rhs
            }
        }
        return out
    }

    private fun conditionHolds(q: ParsedQuery, cond: String): Boolean {
        val concept = cond.substringBefore(':')
        val prefix = cond.substringAfter(':', "")
        return q.hitsOf(concept).any { prefix.isEmpty() || it.matchedText.startsWith(prefix) }
    }

    /** Builds stdin from numbers/strings in the statement according to "input:". */
    private fun concreteInput(skill: Skill, q: ParsedQuery): String? {
        val spec = skill.one("input") ?: return null
        val lines = spec.split('|').map { it.trim().split(' ').filter { s -> s.isNotEmpty() } }
        val slots = lines.flatten()
        val nums = q.inputNumbers.mapNotNull { it.number?.toString() ?: it.decimal?.toString() }
        val quoted = q.tokens.filter { it.type == TokenType.QUOTED }.map { quotedOriginal(q, it.text) }
        if ("list" in slots) {
            if (slots.any { it !in setOf("list", "count") } || nums.size < 2) return null
            return lines.joinToString("\n") { l -> l.joinToString(" ") { s -> if (s == "count") nums.size.toString() else nums.joinToString(" ") } }
        }
        val strSlots = slots.count { it == "str" }
        val numSlots = slots.size - strSlots
        if (strSlots > quoted.size || numSlots != nums.size || (strSlots == 0 && numSlots == 0)) return null
        var ni = 0
        var si = 0
        return lines.joinToString("\n") { l -> l.joinToString(" ") { s -> if (s == "str") quoted[si++] else nums[ni++] } }
    }

    private fun quotedOriginal(q: ParsedQuery, lower: String): String =
        Regex("[\"«“„]([^\"»”]*)[\"»”]").findAll(q.original).map { it.groupValues[1] }.firstOrNull { it.lowercase() == lower } ?: lower

    companion object {
        fun parse(text: String): Catalog {
            val skills = ArrayList<Skill>()
            var id: String? = null
            var fields = LinkedHashMap<String, MutableList<String>>()
            var methods = ArrayList<RawMethod>()
            var mTitle: String? = null
            var mFields = LinkedHashMap<String, String>()
            var code: StringBuilder? = null
            var inCode = false

            fun flushMethod() {
                val t = mTitle ?: return
                methods += RawMethod(t, mFields, code?.toString() ?: "")
                mTitle = null; mFields = LinkedHashMap(); code = null
            }

            fun flushSkill() {
                flushMethod()
                val sid = id ?: return
                skills += Skill(sid, fields, methods)
                id = null; fields = LinkedHashMap(); methods = ArrayList()
            }

            for (raw in text.lines()) {
                if (inCode) {
                    if (raw.trim() == "```") { inCode = false; continue }
                    code!!.append(raw).append('\n')
                    continue
                }
                val line = raw.trimEnd()
                when {
                    line.startsWith("# skill:") -> { flushSkill(); id = line.removePrefix("# skill:").trim() }
                    line.startsWith("#") && !line.startsWith("##") -> {}
                    line.startsWith("## ") -> { flushMethod(); mTitle = line.removePrefix("## ").trim() }
                    line.trim().startsWith("```python") -> { inCode = true; code = StringBuilder() }
                    line.isBlank() -> {}
                    ':' in line -> {
                        val key = line.substringBefore(':').trim()
                        val value = line.substringAfter(':').trim()
                        if (mTitle != null) mFields[key] = value
                        else fields.getOrPut(key) { ArrayList() }.add(value)
                    }
                }
            }
            flushSkill()
            return Catalog(skills)
        }
    }
}

/** Boolean expression over concept names: A & (B | !C). */
sealed class Expr {
    abstract fun eval(q: ParsedQuery): Boolean
    abstract fun concepts(): List<String>

    data class Leaf(val name: String) : Expr() {
        override fun eval(q: ParsedQuery) = name == "TRUE" || q.has(name)
        override fun concepts() = if (name == "TRUE" || name == "FALSE") emptyList() else listOf(name)
    }

    /** A<B: both concepts present and A is mentioned before B. */
    data class Before(val a: String, val b: String) : Expr() {
        override fun eval(q: ParsedQuery): Boolean {
            val ia = q.firstIndex(a)
            val ib = q.firstIndex(b)
            return ia >= 0 && ib >= 0 && ia < ib
        }
        override fun concepts() = listOf(a, b)
    }

    data class Not(val e: Expr) : Expr() {
        override fun eval(q: ParsedQuery) = !e.eval(q)
        override fun concepts() = emptyList<String>()
    }

    data class And(val a: Expr, val b: Expr) : Expr() {
        override fun eval(q: ParsedQuery) = a.eval(q) && b.eval(q)
        override fun concepts() = a.concepts() + b.concepts()
    }

    data class Or(val a: Expr, val b: Expr) : Expr() {
        override fun eval(q: ParsedQuery) = a.eval(q) || b.eval(q)
        override fun concepts() = a.concepts() + b.concepts()
    }
}

object ExprParser {
    fun parse(s: String): Expr {
        val tokens = Regex("""[A-Z_0-9]+<[A-Z_0-9]+|[A-Z_0-9]+|[&|!()]""").findAll(s).map { it.value }.toList()
        var pos = 0
        fun peek() = tokens.getOrNull(pos)
        lateinit var orExpr: () -> Expr
        fun atom(): Expr = when (val t = peek()) {
            "!" -> { pos++; Expr.Not(atom()) }
            "(" -> { pos++; val e = orExpr(); require(peek() == ")") { "missing ) in $s" }; pos++; e }
            null -> error("unexpected end in '$s'")
            else -> { pos++; if ('<' in t) Expr.Before(t.substringBefore('<'), t.substringAfter('<')) else Expr.Leaf(t) }
        }
        fun andExpr(): Expr {
            var e = atom()
            while (peek() == "&") { pos++; e = Expr.And(e, atom()) }
            return e
        }
        orExpr = {
            var e = andExpr()
            while (peek() == "|") { pos++; e = Expr.Or(e, andExpr()) }
            e
        }
        val e = orExpr()
        require(pos == tokens.size) { "trailing tokens in '$s'" }
        return e
    }
}
