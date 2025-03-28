package com.financetracker.ui.auth

import android.widget.Toast
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.text.BasicTextField
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.TextFieldValue
import androidx.compose.ui.tooling.preview.Preview
import androidx.navigation.NavController
import com.financetracker.FinanceTrackerApp

@Composable
fun LoginScreen(navController: NavController) {
    var email by remember { mutableStateOf(TextFieldValue("")) }
    var password by remember { mutableStateOf(TextFieldValue("")) }
    var errorMessage by remember { mutableStateOf("") }

    fun onLogin() {
        if (email.text.isEmpty() || password.text.isEmpty()) {
            errorMessage = "Por favor ingrese todos los campos."
            return
        }

        // Intentar iniciar sesión con Firebase
        FinanceTrackerApp.auth.signInWithEmailAndPassword(email.text, password.text)
            .addOnCompleteListener { task ->
                if (task.isSuccessful) {
                    navController.navigate("dashboard")
                } else {
                    errorMessage = "Error al iniciar sesión. Inténtelo de nuevo."
                }
            }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text("Iniciar sesión", style = MaterialTheme.typography.headlineLarge)
        Spacer(modifier = Modifier.height(16.dp))

        BasicTextField(value = email, onValueChange = { email = it })
        Spacer(modifier = Modifier.height(8.dp))
        BasicTextField(value = password, onValueChange = { password = it })

        if (errorMessage.isNotEmpty()) {
            Text(text = errorMessage, color = MaterialTheme.colorScheme.error)
        }

        Button(
            onClick = { onLogin() },
            modifier = Modifier.padding(top = 16.dp)
        ) {
            Text("Iniciar sesión")
        }

        Spacer(modifier = Modifier.height(8.dp))

        TextButton(onClick = { navController.navigate("register") }) {
            Text("¿No tienes una cuenta? Regístrate")
        }
    }
}

@Preview(showBackground = true)
@Composable
fun PreviewLogin() {
    LoginScreen(navController = rememberNavController())
}
