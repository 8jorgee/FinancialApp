package com.financetracker

import android.app.Application
import dagger.hilt.android.HiltAndroidApp
import android.content.Context
import androidx.room.Room
import com.google.firebase.FirebaseApp
import com.financetracker.data.local.FinanceDatabase
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.messaging.FirebaseMessaging
import com.financetracker.data.repository.AuthRepository
import com.financetracker.data.repository.FinanceRepository
import com.financetracker.ui.auth.LoginScreen
import com.financetracker.ui.auth.RegisterScreen
import com.financetracker.ui.main.DashboardScreen

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
        lateinit var messaging: FirebaseMessaging
            private set
        lateinit var authRepository: AuthRepository
            private set
        lateinit var financeRepository: FinanceRepository
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
        messaging = FirebaseMessaging.getInstance()
        authRepository = AuthRepository(auth, firestore)
        financeRepository = FinanceRepository(database.financeDao())
    }
}
