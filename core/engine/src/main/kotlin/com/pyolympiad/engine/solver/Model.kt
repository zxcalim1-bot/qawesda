package com.pyolympiad.engine.solver

/** Ordering priority of solution methods (spec: beginner → shortest → efficient → alternative → unusual). */
enum class MethodRole(val titleRu: String, val order: Int) {
    BEGINNER("Самый понятный", 0),
    SHORT("Самый короткий", 1),
    EFFICIENT("Самый эффективный", 2),
    ALTERNATIVE("Альтернативный алгоритм", 3),
    PYTHONIC("Интересный Python-подход", 4),
}

data class Method(
    /** Stable key of the approach, used to remove duplicates ("arith-loop", "formula", ...). */
    val approach: String,
    val title: String,
    val role: MethodRole,
    val code: String,
    /** Short explanation (1-2 sentences). */
    val idea: String,
    /** How it works, step by step. */
    val principle: String,
    val time: String,
    val memory: String,
    val pros: List<String>,
    val cons: List<String>,
    val whenToUse: String,
    /** 1 (hard to read) .. 5 (very easy). */
    val readability: Int,
    /** Minimum Python version when a newer function is used, e.g. "3.8". */
    val minPython: String? = null,
) {
    val lineCount: Int get() = code.lines().count { it.isNotBlank() && !it.trimStart().startsWith("#") }

    /** Code complexity label for the comparison table. */
    val codeComplexity: String
        get() = when {
            lineCount <= 3 -> "низкая"
            lineCount <= 8 -> "средняя"
            else -> "высокая"
        }
}

data class SampleTest(val input: String, val expected: String? = null)

/** One step of the solving pipeline, shown in "Как я решал". */
data class TraceStep(val stage: String, val result: String)

data class Solution(
    val skillId: String,
    val title: String,
    /** The task restated in clear Russian ("Понял задачу так: ..."). */
    val understood: String,
    val topics: List<String>,
    val keyIdeas: List<String>,
    val dataStructures: List<String>,
    val algorithm: String,
    val algorithmWhy: String,
    val inputFormat: String,
    val outputFormat: String,
    val constraintNote: String?,
    val methods: List<Method>,
    val edgeCases: List<String>,
    val samples: List<SampleTest>,
    /** stdin built from concrete values in the statement, if any. */
    val concreteInput: String?,
    /** Answer computed natively (without Python) when possible. */
    val nativeAnswer: String?,
    val explanation: List<String>,
    val knowledge: List<String>,
    val confidence: Double,
)

data class Candidate(val skillId: String, val title: String, val score: Double)

data class SolveResult(
    val input: String,
    val languageTitle: String,
    val corrections: List<String>,
    val detectedConcepts: List<String>,
    val constraints: List<String>,
    val solution: Solution?,
    val alternatives: List<Candidate>,
    val trace: List<TraceStep>,
    /** Set when no reliable solution was found. */
    val failure: String? = null,
    /** Words to search in the local knowledge base when the solver is unsure. */
    val searchHint: String = "",
)
