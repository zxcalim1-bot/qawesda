package com.pyolympiad.watch

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.pyolympiad.data.Domain
import com.pyolympiad.data.Entry
import com.pyolympiad.data.QuizData
import com.pyolympiad.engine.analyzer.AnalysisReport
import com.pyolympiad.engine.solver.Solution
import com.pyolympiad.engine.solver.SolveResult
import com.pyolympiad.watch.runtime.JudgeResult
import com.pyolympiad.watch.runtime.PythonRuntime
import com.pyolympiad.watch.runtime.RunResult
import com.pyolympiad.watch.runtime.SyntaxCheck
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

data class Settings(
    /** Olympiad mode hides solutions until hints are used up or the user confirms. */
    val olympiadMode: Boolean = false,
    val textScale: Float = 1f,
    val timeLimitSec: Double = 5.0,
    val showTrace: Boolean = true,
)

/** Result of running one generated method on the samples with the embedded Python. */
data class MethodCheck(val status: Status, val passed: Int = 0, val total: Int = 0, val note: String = "") {
    enum class Status { PENDING, OK, FAILED, NO_RUNTIME }
}

data class SolveState(
    val input: String = "",
    val working: Boolean = false,
    val result: SolveResult? = null,
    /** Solution with methods that failed verification removed. */
    val solution: Solution? = null,
    val checks: List<MethodCheck> = emptyList(),
    val removedMethods: List<String> = emptyList(),
    val pythonAnswer: String? = null,
    val answerAgreement: String? = null,
    val verifying: Boolean = false,
)

data class CodeState(
    val lines: List<String> = listOf(""),
    val title: String = "Мой код",
    val taskId: String? = null,
    val stdin: String = "",
    val running: Boolean = false,
    val run: RunResult? = null,
    val analysis: AnalysisReport? = null,
    val syntax: SyntaxCheck? = null,
    val judge: JudgeResult? = null,
) {
    val text: String get() = lines.joinToString("\n")
}

data class QuizItem(val id: String, val category: String, val quiz: QuizData)

data class QuizSession(
    val title: String,
    val items: List<QuizItem>,
    val index: Int = 0,
    val chosen: Int? = null,
    val correct: Int = 0,
    val wrong: List<String> = emptyList(),
) {
    val current: QuizItem? get() = items.getOrNull(index)
    val finished: Boolean get() = index >= items.size
}

data class TrainingState(
    val sessionId: Long,
    val items: List<String>,
    val index: Int,
    val solved: Int,
    val failed: Int,
    val hints: Int,
    val viewed: Int,
) {
    val current: String? get() = items.getOrNull(index)
    val finished: Boolean get() = index >= items.size
}

class AppViewModel(app: Application) : AndroidViewModel(app) {

    val container: AppContainer = (app as PyOlympApp).container
    val repo get() = container.repository
    val store get() = container.userStore

    // ------------------------------------------------------------------ setup

    private val _installProgress = MutableStateFlow<Float?>(0f)
    val installProgress: StateFlow<Float?> = _installProgress.asStateFlow()

    private val _settings = MutableStateFlow(Settings())
    val settings: StateFlow<Settings> = _settings.asStateFlow()

    private val _pythonReady = MutableStateFlow<Boolean?>(null)
    val pythonReady: StateFlow<Boolean?> = _pythonReady.asStateFlow()

    init {
        viewModelScope.launch(Dispatchers.IO) {
            _settings.value = Settings(
                olympiadMode = store.setting("olympiad", "false").toBoolean(),
                textScale = store.setting("text_scale", "1.0").toFloatOrNull() ?: 1f,
                timeLimitSec = store.setting("time_limit", "5.0").toDoubleOrNull() ?: 5.0,
                showTrace = store.setting("show_trace", "true").toBoolean(),
            )
            val kb = container.knowledgeBase
            if (kb.needsInstall) kb.installAll { p -> _installProgress.value = p }
            container.engine // parse lexicon and skills while the user looks at the home screen
            _installProgress.value = null
            _pythonReady.value = container.python.warmUp()
        }
    }

    fun updateSettings(f: (Settings) -> Settings) {
        val s = f(_settings.value)
        _settings.value = s
        viewModelScope.launch(Dispatchers.IO) {
            store.setSetting("olympiad", s.olympiadMode.toString())
            store.setSetting("text_scale", s.textScale.toString())
            store.setSetting("time_limit", s.timeLimitSec.toString())
            store.setSetting("show_trace", s.showTrace.toString())
        }
    }

    // ------------------------------------------------------------------ solver

    private val _solve = MutableStateFlow(SolveState())
    val solve: StateFlow<SolveState> = _solve.asStateFlow()
    private var solveJob: Job? = null

    fun solve(text: String) {
        solveJob?.cancel()
        _solve.value = SolveState(input = text, working = true)
        solveJob = viewModelScope.launch(Dispatchers.Default) {
            store.addHistory("solve", text)
            val result = container.engine.solver.solve(text)
            _solve.value = SolveState(input = text, result = result, solution = result.solution,
                checks = result.solution?.methods?.map { MethodCheck(MethodCheck.Status.PENDING) } ?: emptyList(),
                pythonAnswer = result.solution?.nativeAnswer)
            result.solution?.let { verify(it) }
        }
    }

    fun solveWith(candidateId: String) {
        val text = _solve.value.input
        solveJob?.cancel()
        solveJob = viewModelScope.launch(Dispatchers.Default) {
            val sol = container.engine.solver.solveWith(text, candidateId) ?: return@launch
            _solve.update { it.copy(solution = sol, checks = sol.methods.map { MethodCheck(MethodCheck.Status.PENDING) }, removedMethods = emptyList(), pythonAnswer = sol.nativeAnswer, answerAgreement = null) }
            verify(sol)
        }
    }

    /**
     * Spec §46: check every method, remove wrong ones, compute the answer for the data in
     * the statement — all with the real CPython running on the watch.
     */
    private suspend fun verify(sol: Solution) {
        val py = container.python
        if (_pythonReady.value == false || !py.warmUp()) {
            _solve.update { s -> s.copy(checks = sol.methods.map { MethodCheck(MethodCheck.Status.NO_RUNTIME, note = "Python недоступен") }) }
            return
        }
        _solve.update { it.copy(verifying = true) }
        val inputs = sol.samples.map { it.input } + listOfNotNull(sol.concreteInput)
        val outputs = runCatching { py.batch(sol.methods.map { it.code }, inputs, 3.0) }.getOrElse {
            val note = it.message ?: it.javaClass.simpleName
            _solve.update { s -> s.copy(verifying = false, checks = sol.methods.map { MethodCheck(MethodCheck.Status.NO_RUNTIME, note = note) }) }
            return
        }
        // Reference output per input: the expected sample answer if known, otherwise the majority.
        val refs = inputs.indices.map { j ->
            sol.samples.getOrNull(j)?.expected ?: majority(outputs.map { it[j] })
        }
        val checks = outputs.mapIndexed { i, row ->
            var passed = 0
            var note = ""
            row.forEachIndexed { j, r ->
                val ref = refs[j]
                if (r.ok && ref != null && PythonRuntime.sameOutput(r.stdout, ref)) passed++
                else if (note.isEmpty()) note = if (!r.ok) "${r.error ?: r.statusRu} на тесте ${j + 1}" else "другой ответ на тесте ${j + 1}"
            }
            MethodCheck(if (passed == row.size) MethodCheck.Status.OK else MethodCheck.Status.FAILED, passed, row.size, note)
        }
        val keep = checks.indices.filter { checks[it].status == MethodCheck.Status.OK }
        val removed = checks.indices.filter { it !in keep }.map { sol.methods[it].title }
        val filtered = if (keep.isEmpty()) sol else sol.copy(methods = keep.map { sol.methods[it] })
        val filteredChecks = if (keep.isEmpty()) checks else keep.map { checks[it] }
        var answer = sol.nativeAnswer
        var agreement: String? = null
        if (sol.concreteInput != null) {
            val j = inputs.size - 1
            val answers = keep.map { outputs[it][j].stdout.trim() }
            if (answers.isNotEmpty()) {
                answer = answers.first()
                agreement = if (answers.all { PythonRuntime.sameOutput(it, answers.first()) })
                    "Все ${answers.size} способа(ов) дали одинаковый ответ ✓" else "Способы дали разные ответы — проверьте условие"
            }
        }
        _solve.update {
            it.copy(solution = filtered, checks = filteredChecks, removedMethods = if (keep.isEmpty()) emptyList() else removed,
                pythonAnswer = answer, answerAgreement = agreement, verifying = false)
        }
    }

    private fun majority(results: List<RunResult>): String? {
        val ok = results.filter { it.ok }.map { it.stdout }
        if (ok.isEmpty()) return null
        return ok.groupBy { it.trim().split(Regex("\\s+")).joinToString(" ") }.maxByOrNull { it.value.size }?.value?.first()
    }

    // ------------------------------------------------------------------ code editor, run, analysis, judge

    private val _code = MutableStateFlow(CodeState())
    val code: StateFlow<CodeState> = _code.asStateFlow()

    fun openCode(text: String, title: String = "Мой код", taskId: String? = null, stdin: String = "") {
        _code.value = CodeState(lines = text.trimEnd('\n').split('\n'), title = title, taskId = taskId, stdin = stdin)
    }

    fun editCode(f: (MutableList<String>) -> Unit) {
        _code.update { s ->
            val l = s.lines.toMutableList()
            f(l)
            if (l.isEmpty()) l += ""
            s.copy(lines = l, run = null, analysis = null, syntax = null, judge = null)
        }
    }

    fun setStdin(text: String) = _code.update { it.copy(stdin = text) }

    fun runCode() {
        val s = _code.value
        _code.update { it.copy(running = true, run = null) }
        viewModelScope.launch {
            store.addHistory("run", s.text.take(400))
            val r = runCatching { container.python.run(s.text, s.stdin, _settings.value.timeLimitSec) }.getOrElse {
                RunResult("RUNTIME_ERROR", "", it.message ?: "", "PythonUnavailable", it.message, null, 0)
            }
            _code.update { it.copy(running = false, run = r) }
        }
    }

    fun analyzeCode() {
        val s = _code.value
        _code.update { it.copy(running = true) }
        viewModelScope.launch {
            val report = withContext(Dispatchers.Default) { container.engine.analyzer.analyze(s.text) }
            val syntax = runCatching { container.python.check(s.text) }.getOrNull()
            _code.update { it.copy(running = false, analysis = report, syntax = syntax) }
        }
    }

    fun judgeCode(entry: Entry) {
        val task = entry.task ?: return
        val s = _code.value
        _code.update { it.copy(running = true, judge = null) }
        viewModelScope.launch {
            val r = runCatching { container.python.judge(s.text, task.tests.map { it.input to it.output }, 3.0) }.getOrNull()
            if (r != null) withContext(Dispatchers.IO) {
                store.recordAttempt(entry.id, entry.summary.category, entry.summary.level, r.allPassed)
            }
            _code.update { it.copy(running = false, judge = r) }
        }
    }

    // ------------------------------------------------------------------ current task (quick buttons "Подсказка", "Ответ")

    private val _currentTask = MutableStateFlow<String?>(null)
    val currentTask: StateFlow<String?> = _currentTask.asStateFlow()

    fun setCurrentTask(id: String) {
        _currentTask.value = id
        viewModelScope.launch(Dispatchers.IO) { store.setSetting("current_task", id) }
    }

    suspend fun currentOrRandomTask(): String? = withContext(Dispatchers.IO) {
        _currentTask.value ?: store.setting("current_task", "").ifEmpty { null }
            ?: repo.randomEntry(Domain.TASKS, "task")?.id?.also { _currentTask.value = it }
    }

    // ------------------------------------------------------------------ quizzes

    private val _quiz = MutableStateFlow<QuizSession?>(null)
    val quiz: StateFlow<QuizSession?> = _quiz.asStateFlow()

    fun startQuiz(title: String, category: String?, count: Int) {
        viewModelScope.launch(Dispatchers.IO) {
            val ids = repo.randomSample(Domain.TESTS, "quiz", count, category)
            val items = ids.mapNotNull { s -> repo.entry(s.id)?.quiz?.let { QuizItem(s.id, s.category, it) } }
            _quiz.value = QuizSession(title, items)
        }
    }

    fun answerQuiz(option: Int) {
        val s = _quiz.value ?: return
        val item = s.current ?: return
        if (s.chosen != null) return
        val ok = option == item.quiz.answer
        _quiz.value = s.copy(chosen = option, correct = s.correct + if (ok) 1 else 0, wrong = if (ok) s.wrong else s.wrong + item.category)
        viewModelScope.launch(Dispatchers.IO) { store.recordQuiz(item.id, item.category, ok) }
    }

    fun nextQuiz() {
        _quiz.update { s -> s?.copy(index = s.index + 1, chosen = null) }
    }

    // ------------------------------------------------------------------ training mode

    private val _training = MutableStateFlow<TrainingState?>(null)
    val training: StateFlow<TrainingState?> = _training.asStateFlow()

    fun startTraining(size: Int, category: String?, level: Int?) {
        viewModelScope.launch(Dispatchers.IO) {
            val solved = store.solvedTaskIds()
            val pool = repo.list(Domain.TASKS, "task", category, 0, 5000, level).filter { it.id !in solved }.shuffled()
            val fallback = if (pool.size < size) repo.list(Domain.TASKS, "task", category, 0, 5000, level).shuffled() else emptyList()
            val items = (pool + fallback).distinctBy { it.id }.take(size).map { it.id }
            val id = store.startSession("training", items)
            _training.value = TrainingState(id, items, 0, 0, 0, 0, 0)
            items.firstOrNull()?.let { setCurrentTask(it) }
        }
    }

    fun trainingResult(solved: Boolean, hintsUsed: Int, viewedSolution: Boolean) {
        val t = _training.value ?: return
        val id = t.current ?: return
        viewModelScope.launch(Dispatchers.IO) {
            val s = repo.summary(id)
            if (s != null) {
                if (solved) store.markSolved(id, s.category, s.level) else store.recordAttempt(id, s.category, s.level, false)
            }
            store.advanceSession(t.sessionId, solved)
            val next = t.copy(
                index = t.index + 1, solved = t.solved + if (solved) 1 else 0, failed = t.failed + if (solved) 0 else 1,
                hints = t.hints + hintsUsed, viewed = t.viewed + if (viewedSolution) 1 else 0,
            )
            _training.value = next
            next.current?.let { setCurrentTask(it) }
        }
    }

    fun stopTraining() {
        _training.value?.let { t -> viewModelScope.launch(Dispatchers.IO) { store.finishSession(t.sessionId) } }
    }
}
