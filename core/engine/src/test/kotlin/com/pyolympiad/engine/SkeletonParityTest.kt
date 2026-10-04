package com.pyolympiad.engine

import com.pyolympiad.engine.text.Skeleton
import org.junit.Assert.assertTrue
import org.junit.Test

/**
 * The FTS "skeleton" column is written by tools/textnorm.py at build time and queried with
 * [Skeleton.forms] at run time. Both sides must produce identical forms, otherwise translit and
 * misspelled queries silently stop matching. tools/build_content.py writes the fixture.
 */
class SkeletonParityTest {

    @Test
    fun kotlinSkeletonMatchesPythonBuildTool() {
        val stream = javaClass.classLoader.getResourceAsStream("skeleton_fixture.tsv")
            ?: error("skeleton_fixture.tsv not found; run tools/build_content.py")
        val lines = stream.bufferedReader(Charsets.UTF_8).readLines().filter { it.isNotBlank() }
        assertTrue("fixture too small: ${lines.size}", lines.size > 500)
        val mismatches = ArrayList<String>()
        for (line in lines) {
            val (word, expected) = line.split('\t', limit = 2)
            val actual = Skeleton.forms(word).joinToString("|")
            if (actual != expected) mismatches += "$word: python=$expected kotlin=$actual"
        }
        assertTrue("skeleton mismatches (${mismatches.size}):\n" + mismatches.take(30).joinToString("\n"), mismatches.isEmpty())
    }
}
