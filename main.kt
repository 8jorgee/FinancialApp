package com.financetracker

import android.app.Application
import dagger.hilt.android.HiltAndroidApp
import android.content.Context
import androidx.room.Room
import com.google.firebase.FirebaseApp
import com.financetracker.data.local.FinanceDatabase

@HiltAndroidApp
class FinanceTrackerApp : Application() {
    companion object {
        lateinit var instance: FinanceTrackerApp
            private set
        lateinit var database: FinanceDatabase
            private set
    }

    override fun onCreate() {
        super.onCreate()
        instance = this
        FirebaseApp.initializeApp(this)
        database = Room.databaseBuilder(
            applicationContext,
            FinanceDatabase::class.java,
            "finance_db"
        ).build()
    }
}
