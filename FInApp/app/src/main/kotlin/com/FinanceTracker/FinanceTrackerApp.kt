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
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.runtime.Composable
import androidx.compose.ui.tooling.preview.Preview
import androidx.navigation.compose.rememberNavController
import com.financetracker.ui.navigation.AppNavigation
import com.financetracker.ui.theme.FinanceTrackerTheme

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

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            FinanceTrackerTheme {
                MainScreen()
            }
        }
    }
}

@Composable
fun MainScreen() {
    val navController = rememberNavController()
    AppNavigation(navController)
}

@Preview(showBackground = true)
@Composable
fun DefaultPreview() {
    FinanceTrackerTheme {
        MainScreen()
    }
}
