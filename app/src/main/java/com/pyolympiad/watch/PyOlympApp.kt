package com.pyolympiad.watch

import android.app.Application

class PyOlympApp : Application() {
    lateinit var container: AppContainer
        private set

    override fun onCreate() {
        super.onCreate()
        container = AppContainer(this)
    }
}
