package com.pyolympiad.engine

import java.io.File

/** Engine tests read the same data files that ship in the app's assets. */
object TestAssets {
    val root: File by lazy {
        var dir: File? = File("").absoluteFile
        while (dir != null && !File(dir, "app/src/main/assets").isDirectory) dir = dir.parentFile
        File(requireNotNull(dir) { "app/src/main/assets not found" }, "app/src/main/assets")
    }

    fun text(path: String): String = File(root, path).readText()
}
