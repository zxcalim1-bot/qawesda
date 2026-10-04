// Pure Kotlin/JVM module: no Android dependencies, so the whole task-understanding
// and code-generation engine is unit-testable on a desktop JVM.
plugins {
    alias(libs.plugins.kotlin.jvm)
}

java {
    sourceCompatibility = JavaVersion.VERSION_17
    targetCompatibility = JavaVersion.VERSION_17
}

kotlin {
    compilerOptions {
        jvmTarget.set(org.jetbrains.kotlin.gradle.dsl.JvmTarget.JVM_17)
    }
}

dependencies {
    testImplementation(libs.junit)
}

tasks.test {
    // Tests that execute generated Python code look for python3 on PATH and are
    // skipped automatically when it is unavailable.
    systemProperty("pyolymp.python", System.getenv("PYOLYMP_PYTHON") ?: "python3")
    testLogging { events("failed"); exceptionFormat = org.gradle.api.tasks.testing.logging.TestExceptionFormat.FULL }
}
