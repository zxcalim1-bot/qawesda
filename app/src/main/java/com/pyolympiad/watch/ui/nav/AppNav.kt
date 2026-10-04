package com.pyolympiad.watch.ui.nav

import android.net.Uri
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.navigation.NavHostController
import androidx.wear.compose.material3.AppScaffold
import androidx.wear.compose.navigation.SwipeDismissableNavHost
import androidx.wear.compose.navigation.composable
import androidx.wear.compose.navigation.rememberSwipeDismissableNavController
import com.pyolympiad.watch.AppViewModel
import com.pyolympiad.watch.ui.screens.AboutScreen
import com.pyolympiad.watch.ui.screens.AnalysisScreen
import com.pyolympiad.watch.ui.screens.CategoryListScreen
import com.pyolympiad.watch.ui.screens.CodeEditorScreen
import com.pyolympiad.watch.ui.screens.CodeTextScreen
import com.pyolympiad.watch.ui.screens.CompareScreen
import com.pyolympiad.watch.ui.screens.EntryListScreen
import com.pyolympiad.watch.ui.screens.EntryScreen
import com.pyolympiad.watch.ui.screens.FavoritesScreen
import com.pyolympiad.watch.ui.screens.HomeScreen
import com.pyolympiad.watch.ui.screens.JudgeScreen
import com.pyolympiad.watch.ui.screens.MethodScreen
import com.pyolympiad.watch.ui.screens.MoreMethodsScreen
import com.pyolympiad.watch.ui.screens.ProgressScreen
import com.pyolympiad.watch.ui.screens.QuizScreen
import com.pyolympiad.watch.ui.screens.RunResultScreen
import com.pyolympiad.watch.ui.screens.SearchScreen
import com.pyolympiad.watch.ui.screens.SectionScreen
import com.pyolympiad.watch.ui.screens.SettingsScreen
import com.pyolympiad.watch.ui.screens.SolveInputScreen
import com.pyolympiad.watch.ui.screens.SolveResultScreen
import com.pyolympiad.watch.ui.screens.TaskHintsScreen
import com.pyolympiad.watch.ui.screens.TaskScreen
import com.pyolympiad.watch.ui.screens.TaskSolutionScreen
import com.pyolympiad.watch.ui.screens.TasksMenuScreen
import com.pyolympiad.watch.ui.screens.TestsMenuScreen
import com.pyolympiad.watch.ui.screens.TraceScreen
import com.pyolympiad.watch.ui.screens.TrainingScreen
import com.pyolympiad.watch.ui.screens.TrainingSetupScreen

/** Route builders. Ids are URI-encoded because they contain ':' and '.'. */
object R {
    const val HOME = "home"
    const val SOLVE = "solve"
    const val SOLVE_RESULT = "solve/result"
    const val COMPARE = "solve/compare"
    const val MORE = "solve/more"
    const val TRACE = "solve/trace"
    const val SEARCH = "search"
    const val FAVORITES = "favorites"
    const val PROGRESS = "progress"
    const val SETTINGS = "settings"
    const val ABOUT = "about"
    const val TASKS = "tasks"
    const val TRAINING_SETUP = "training/setup"
    const val TRAINING = "training/run"
    const val TESTS = "tests"
    const val QUIZ = "quiz"
    const val CODE = "code"
    const val CODE_TEXT = "code/text"
    const val CODE_RUN = "code/run"
    const val CODE_ANALYSIS = "code/analysis"

    private fun e(s: String) = Uri.encode(s)
    fun method(i: Int) = "solve/method/$i"
    fun section(key: String) = "section/$key"
    fun entry(id: String) = if (id.startsWith("task:")) "task/${e(id)}" else "entry/${e(id)}"
    fun cats(domain: String, kind: String) = "cats/$domain/${e(kind)}"
    fun list(domain: String, kind: String?, category: String?, level: Int? = null) =
        "list/$domain/${e(kind ?: "-")}/${e(category ?: "-")}/${level ?: 0}"
    fun taskHints(id: String) = "task/${e(id)}/hints"
    fun taskSolution(id: String, i: Int) = "task/${e(id)}/solution/$i"
    fun judge(id: String) = "task/${e(id)}/judge"
}

@Composable
fun AppNav(vm: AppViewModel, initialText: String?) {
    val nav: NavHostController = rememberSwipeDismissableNavController()
    AppScaffold {
        SwipeDismissableNavHost(navController = nav, startDestination = R.HOME) {
            composable(R.HOME) { HomeScreen(vm, nav) }
            composable(R.SOLVE) { SolveInputScreen(vm, nav) }
            composable(R.SOLVE_RESULT) { SolveResultScreen(vm, nav) }
            composable("solve/method/{i}") { SolveMethodRoute(vm, nav, it.arguments?.getString("i")?.toIntOrNull() ?: 0) }
            composable(R.COMPARE) { CompareScreen(vm) }
            composable(R.MORE) { MoreMethodsScreen(vm, nav) }
            composable(R.TRACE) { TraceScreen(vm) }
            composable("section/{key}") { SectionScreen(vm, nav, it.arguments?.getString("key") ?: "") }
            composable("cats/{domain}/{kind}") {
                CategoryListScreen(vm, nav, it.arguments?.getString("domain") ?: "", Uri.decode(it.arguments?.getString("kind") ?: ""))
            }
            composable("list/{domain}/{kind}/{category}/{level}") {
                val a = it.arguments
                EntryListScreen(
                    vm, nav, a?.getString("domain") ?: "",
                    Uri.decode(a?.getString("kind") ?: "-").takeIf { k -> k != "-" },
                    Uri.decode(a?.getString("category") ?: "-").takeIf { c -> c != "-" },
                    a?.getString("level")?.toIntOrNull()?.takeIf { l -> l > 0 },
                )
            }
            composable("entry/{id}") { EntryScreen(vm, nav, Uri.decode(it.arguments?.getString("id") ?: "")) }
            composable("task/{id}") { TaskScreen(vm, nav, Uri.decode(it.arguments?.getString("id") ?: "")) }
            composable("task/{id}/hints") { TaskHintsScreen(vm, Uri.decode(it.arguments?.getString("id") ?: "")) }
            composable("task/{id}/solution/{i}") {
                TaskSolutionScreen(vm, nav, Uri.decode(it.arguments?.getString("id") ?: ""), it.arguments?.getString("i")?.toIntOrNull() ?: 0)
            }
            composable("task/{id}/judge") { JudgeScreen(vm, nav, Uri.decode(it.arguments?.getString("id") ?: "")) }
            composable(R.TASKS) { TasksMenuScreen(vm, nav) }
            composable(R.TRAINING_SETUP) { TrainingSetupScreen(vm, nav) }
            composable(R.TRAINING) { TrainingScreen(vm, nav) }
            composable(R.TESTS) { TestsMenuScreen(vm, nav) }
            composable(R.QUIZ) { QuizScreen(vm, nav) }
            composable(R.SEARCH) { SearchScreen(vm, nav) }
            composable(R.FAVORITES) { FavoritesScreen(vm, nav) }
            composable(R.PROGRESS) { ProgressScreen(vm, nav) }
            composable(R.SETTINGS) { SettingsScreen(vm, nav) }
            composable(R.ABOUT) { AboutScreen(vm) }
            composable(R.CODE) { CodeEditorScreen(vm, nav) }
            composable(R.CODE_TEXT) { CodeTextScreen(vm, nav) }
            composable(R.CODE_RUN) { RunResultScreen(vm, nav) }
            composable(R.CODE_ANALYSIS) { AnalysisScreen(vm, nav) }
        }
    }
    // Text shared to the app (ACTION_SEND or adb extra) goes straight to the solver.
    LaunchedEffect(initialText) {
        if (!initialText.isNullOrBlank()) {
            vm.solve(initialText)
            nav.navigate(R.SOLVE_RESULT)
        }
    }
}

@Composable
private fun SolveMethodRoute(vm: AppViewModel, nav: NavHostController, i: Int) = MethodScreen(vm, nav, i)
