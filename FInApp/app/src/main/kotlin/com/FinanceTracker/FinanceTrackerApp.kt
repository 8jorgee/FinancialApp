package com.financetracker

import android.app.Application
import android.Manifest
import android.annotation.SuppressLint
import android.content.pm.PackageManager
import android.os.Bundle
import android.util.Log
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.annotation.RequiresPermission
import androidx.compose.runtime.*
import androidx.compose.ui.tooling.preview.Preview
import androidx.core.app.ActivityCompat
import androidx.lifecycle.lifecycleScope
import androidx.navigation.compose.rememberNavController
import com.financetracker.ui.navigation.AppNavigation
import com.financetracker.ui.theme.FinanceTrackerTheme
import com.google.android.gms.location.FusedLocationProviderClient
import com.google.android.gms.location.LocationServices
import com.google.firebase.FirebaseApp
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.messaging.FirebaseMessaging
import dagger.hilt.android.HiltAndroidApp
import kotlinx.coroutines.launch
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL

@HiltAndroidApp
class FinanceTrackerApp : Application() {
    companion object {
        lateinit var instance: FinanceTrackerApp
            private set
        lateinit var auth: FirebaseAuth
            private set
        lateinit var firestore: FirebaseFirestore
            private set
        lateinit var messaging: FirebaseMessaging
            private set
    }

    override fun onCreate() {
        super.onCreate()
        instance = this
        FirebaseApp.initializeApp(this)
        auth = FirebaseAuth.getInstance()
        firestore = FirebaseFirestore.getInstance()
        messaging = FirebaseMessaging.getInstance()

        // Get FCM token
        messaging.token.addOnSuccessListener { token ->
            Log.d("FCM Token", "Token: $token")
            saveTokenToFirestore(token)
        }
    }

    fun saveTokenToFirestore(token: String) {
        val user = auth.currentUser
        user?.let {
            val userDoc = firestore.collection("users").document(it.uid)
            userDoc.update("fcmToken", token)
                .addOnSuccessListener { Log.d("Firestore", "Token saved successfully") }
                .addOnFailureListener { Log.e("Firestore", "Error saving token", it) }
        }
    }
}

class MainActivity : ComponentActivity() {
    private lateinit var fusedLocationClient: FusedLocationProviderClient

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        fusedLocationClient = LocationServices.getFusedLocationProviderClient(this)

        requestLocationPermission()
        setupFCMNotificationListener()

        setContent {
            FinanceTrackerTheme {
                MainScreen()
            }
        }
    }

    private fun requestLocationPermission() {
        if (ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            registerForActivityResult(ActivityResultContracts.RequestPermission()) { granted ->
                if (granted) {
                    getCurrentLocation()
                }
            }.launch(Manifest.permission.ACCESS_FINE_LOCATION)
        } else {
            getCurrentLocation()
        }
    }

    @SuppressLint("MissingPermission")
    @RequiresPermission(Manifest.permission.ACCESS_FINE_LOCATION)
    fun getCurrentLocation() {
        fusedLocationClient.lastLocation.addOnSuccessListener { location ->
            location?.let {
                println("User Location: Lat=${it.latitude}, Lng=${it.longitude}")
            }
        }
    }

    private fun setupFCMNotificationListener() {
        FirebaseMessaging.getInstance().subscribeToTopic("finance_updates")
            .addOnCompleteListener { task ->
                if (task.isSuccessful) {
                    Log.d("FCM", "Subscribed to finance_updates topic")
                } else {
                    Log.e("FCM", "Subscription failed")
                }
            }
    }
}

suspend fun fetchExchangeRates(): JSONObject? {
    return withContext(Dispatchers.IO) {
        try {
            val url = URL("https://api.exchangerate-api.com/v4/latest/USD")
            val connection = url.openConnection() as HttpURLConnection
            connection.requestMethod = "GET"
            connection.connect()

            val responseCode = connection.responseCode
            if (responseCode == HttpURLConnection.HTTP_OK) {
                val response = connection.inputStream.bufferedReader().use { it.readText() }
                return@withContext JSONObject(response)
            } else {
                Log.e("API", "Error fetching exchange rates: HTTP $responseCode")
                return@withContext null
            }
        } catch (e: Exception) {
            Log.e("API", "Exception: ${e.message}")
            return@withContext null
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

// Unit Tests
package com.financetracker.tests

import com.financetracker.FinanceTrackerApp
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.firestore.FirebaseFirestore
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import org.junit.Before
import org.junit.Test

class FinanceTrackerTests {

    private lateinit var app: FinanceTrackerApp
    private val mockAuth: FirebaseAuth = mockk(relaxed = true)
    private val mockFirestore: FirebaseFirestore = mockk(relaxed = true)

    @Before
    fun setup() {
        app = FinanceTrackerApp()
        FinanceTrackerApp.auth = mockAuth
        FinanceTrackerApp.firestore = mockFirestore
    }

    @Test
    fun testSaveTokenToFirestore() {
        val userId = "testUserId"
        val token = "testToken"

        every { mockAuth.currentUser?.uid } returns userId
        every { mockFirestore.collection("users").document(userId).update("fcmToken", token) } returns mockk()

        app.saveTokenToFirestore(token)

        verify { mockFirestore.collection("users").document(userId).update("fcmToken", token) }
    }
}
