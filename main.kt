package com.financetracker

import android.app.Application
import dagger.hilt.android.HiltAndroidApp
import android.content.Context
import androidx.room.Room
import com.google.firebase.FirebaseApp
import com.financetracker.data.local.FinanceDatabase
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore

@HiltAndroidApp
class FinanceTrackerApp : Application() {
    companion object {
        lateinit var instance: FinanceTrackerApp
            private set
        lateinit var database: FinanceDatabase
            private set
        lateinit var auth: FirebaseAuth
            private set
        lateinit var firestore: FirebaseFirestore
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
        auth = FirebaseAuth.getInstance()
        firestore = FirebaseFirestore.getInstance()
    }
}
