package com.pyolympiad.watch

import android.os.Looper
import androidx.activity.ComponentActivity
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.key
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.compose.ui.test.junit4.createAndroidComposeRule
import androidx.compose.ui.test.onAllNodesWithText
import androidx.compose.ui.test.onRoot
import androidx.lifecycle.ViewModelProvider
import androidx.navigation.NavHostController
import androidx.wear.compose.material3.AppScaffold
import androidx.wear.compose.navigation.SwipeDismissableNavHost
import androidx.wear.compose.navigation.composable
import androidx.wear.compose.navigation.rememberSwipeDismissableNavController
import com.github.takahirom.roborazzi.captureRoboImage
import com.pyolympiad.watch.ui.screens.AnalysisScreen
import com.pyolympiad.watch.ui.screens.CategoryListScreen
import com.pyolympiad.watch.ui.screens.CodeEditorScreen
import com.pyolympiad.watch.ui.screens.CompareScreen
import com.pyolympiad.watch.ui.screens.EntryScreen
import com.pyolympiad.watch.ui.screens.HomeScreen
import com.pyolympiad.watch.ui.screens.MethodScreen
import com.pyolympiad.watch.ui.screens.ProgressScreen
import com.pyolympiad.watch.ui.screens.QuizScreen
import com.pyolympiad.watch.ui.screens.SearchScreen
import com.pyolympiad.watch.ui.screens.SectionScreen
import com.pyolympiad.watch.ui.screens.SettingsScreen
import com.pyolympiad.watch.ui.screens.SolveResultScreen
import com.pyolympiad.watch.ui.screens.TaskHintsScreen
import com.pyolympiad.watch.ui.screens.TaskScreen
import com.pyolympiad.watch.ui.screens.TaskSolutionScreen
import com.pyolympiad.watch.ui.screens.TasksMenuScreen
import com.pyolympiad.watch.ui.screens.TestsMenuScreen
import com.pyolympiad.watch.ui.screens.TraceScreen
import com.pyolympiad.watch.ui.theme.PyOlympTheme
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertTrue
import org.junit.Before
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith
import org.robolectric.RobolectricTestRunner
import org.robolectric.Shadows.shadowOf
import org.robolectric.annotation.Config
import org.robolectric.annotation.GraphicsMode

/**
 * Renders every main screen on a round Galaxy Watch-sized display (192dp, the 40 mm models)
 * with the real knowledge bases and engine, and saves screenshots to app/build/outputs/roborazzi
 * when run with `./gradlew :app:recordRoborazziDebug`.
 */
@RunWith(RobolectricTestRunner::class)
@GraphicsMode(GraphicsMode.Mode.NATIVE)
@Config(sdk = [34], qualifiers = "w192dp-h192dp-small-notlong-round-watch-xhdpi-keyshidden-nonav")
class ScreensTest {

    @get:Rule
    val rule = createAndroidComposeRule<ComponentActivity>()

    private lateinit var vm: AppViewModel

    @Before
    fun setUp() {
        vm = ViewModelProvider(rule.activity)[AppViewModel::class.java]
        rule.waitUntil(60_000) { vm.installProgress.value == null }
    }

    private var screen by mutableStateOf<Pair<String, @Composable (NavHostController) -> Unit>?>(null)
    private var contentSet = false

    /** setContent may be called only once per test, so screens are swapped through state. */
    private fun show(name: String, content: @Composable (NavHostController) -> Unit) {
        screen = name to content
        if (!contentSet) {
            contentSet = true
            rule.setContent {
                PyOlympTheme {
                    AppScaffold {
                        val current = screen ?: return@AppScaffold
                        key(current.first) {
                            val nav = rememberSwipeDismissableNavController()
                            SwipeDismissableNavHost(navController = nav, startDestination = "s") {
                                composable("s") { current.second(nav) }
                            }
                        }
                    }
                }
            }
        }
        // Screens load from the databases on Dispatchers.IO; wait until the spinner is gone.
        rule.waitUntil(20_000) {
            shadowOf(Looper.getMainLooper()).idle()
            rule.onAllNodesWithText("Загрузка…").fetchSemanticsNodes().isEmpty()
        }
        rule.waitForIdle()
        rule.onRoot().captureRoboImage("build/outputs/roborazzi/$name.png")
    }

    private fun solveAndWait(text: String) {
        vm.solve(text)
        rule.waitUntil(30_000) { !vm.solve.value.working && vm.solve.value.checks.none { it.status == MethodCheck.Status.PENDING } }
    }

    @Test
    fun home() = show("01_home") { HomeScreen(vm, it) }

    @Test
    fun sections() {
        for (key in listOf("python", "olympiad", "libraries", "errors")) {
            show("02_section_$key") { SectionScreen(vm, it, key) }
        }
    }

    @Test
    fun solveResultCompareAndTrace() {
        solveAndWait("Дано натуральное число n. Найдите сумму его цифр.")
        val sol = vm.solve.value.solution
        assertNotNull(sol)
        assertTrue(sol!!.methods.size >= 2)
        show("03_solve_result") { SolveResultScreen(vm, it) }
        show("04_method_2") { MethodScreen(vm, it, 1) }
        show("05_methods_table") { CompareScreen(vm) }
        show("06_trace") { TraceScreen(vm) }
    }

    @Test
    fun solveFailureIsHonest() {
        solveAndWait("кошка сидит на окне и смотрит на птиц")
        val r = vm.solve.value.result
        assertNotNull(r)
        assertTrue(r!!.solution == null)
        show("07_solve_failure") { SolveResultScreen(vm, it) }
    }

    @Test
    fun knowledgeEntries() {
        show("08_entry_sorted") { EntryScreen(vm, it, "py:builtin:sorted") }
        show("09_entry_error") { EntryScreen(vm, it, "err:ZeroDivisionError") }
        show("10_categories_algorithms") { CategoryListScreen(vm, it, "algorithms", "algorithm") }
    }

    @Test
    fun tasks() {
        show("11_tasks_menu") { TasksMenuScreen(vm, it) }
        show("12_task") { TaskScreen(vm, it, "task:digits-sum") }
        show("13_task_hints") { TaskHintsScreen(vm, "task:digits-sum") }
        show("14_task_solution") { TaskSolutionScreen(vm, it, "task:digits-sum", 0) }
    }

    @Test
    fun testsAndQuiz() {
        show("15_tests_menu") { TestsMenuScreen(vm, it) }
        vm.startQuiz("Тест", null, 10)
        rule.waitUntil(10_000) { vm.quiz.value != null }
        show("16_quiz") { QuizScreen(vm, it) }
    }

    @Test
    fun codeEditorAndAnalyzer() {
        vm.openCode("n = input()\nif n > 5\n    print(\"больше\" + n)\n", "Пример")
        show("17_code_editor") { CodeEditorScreen(vm, it) }
        vm.analyzeCode()
        // viewModelScope resumes on the main looper, which Robolectric runs only when asked.
        rule.waitUntil(20_000) { shadowOf(Looper.getMainLooper()).idle(); vm.code.value.analysis != null }
        show("18_analysis") { AnalysisScreen(vm, it) }
    }

    @Test
    fun searchProgressSettings() {
        show("19_search") { SearchScreen(vm, it) }
        show("20_progress") { ProgressScreen(vm, it) }
        show("21_settings") { SettingsScreen(vm, it) }
    }
}
