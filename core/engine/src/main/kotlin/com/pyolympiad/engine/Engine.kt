package com.pyolympiad.engine

import com.pyolympiad.engine.analyzer.CodeAnalyzer
import com.pyolympiad.engine.nlp.Lexicon
import com.pyolympiad.engine.search.QueryExpander
import com.pyolympiad.engine.search.Synonyms
import com.pyolympiad.engine.solver.Solver
import com.pyolympiad.engine.solver.catalog.Catalog

/**
 * Entry point of the offline knowledge engine. All language data is read from the
 * app assets (assets/solver, assets/synonyms, assets/transliteration) so it can be
 * extended without touching code.
 */
class Engine private constructor(
    val lexicon: Lexicon,
    val catalog: Catalog,
    val synonyms: Synonyms,
) {
    val solver: Solver = Solver(lexicon, catalog)
    val analyzer: CodeAnalyzer = CodeAnalyzer()
    val queryExpander: QueryExpander = QueryExpander(synonyms)

    companion object {
        /**
         * @param readText reads an asset path such as "solver/lexicon.tsv"
         * @param listDir lists file names in an asset directory such as "solver/skills"
         */
        fun load(readText: (String) -> String?, listDir: (String) -> List<String>): Engine {
            val lexicon = Lexicon.parse(readText("solver/lexicon.tsv") ?: "")
            val skills = listDir("solver/skills").filter { it.endsWith(".md") }.sorted()
                .joinToString("\n") { readText("solver/skills/$it") ?: "" }
            val catalog = Catalog.parse(skills)
            val synonyms = Synonyms.parse(
                (readText("synonyms/synonyms.tsv") ?: "") + "\n" + (readText("transliteration/words.tsv") ?: ""),
            )
            return Engine(lexicon, catalog, synonyms)
        }
    }
}
