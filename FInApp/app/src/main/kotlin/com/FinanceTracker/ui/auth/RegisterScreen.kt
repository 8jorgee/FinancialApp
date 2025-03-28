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
fun RegisterScreen(navController: NavController) {
    var email by remember { mutableStateOf(TextFieldValue("")) }
    var password by remember { mutableStateOf(TextFieldValue("")) }
    var errorMessage by remember { mutableStateOf("") }

    fun onRegister() {
        if (email.text.isEmpty() || password.text.isEmpty()) {
            errorMessage = "Por favor ingrese todos los campos."
            return
        }

        // Intentar registrar con Firebase
        FinanceTrackerApp.auth.createUserWithEmailAndPassword(email.text, password.text)
            .addOnCompleteListener { task ->
                if (task.isSuccessful) {
                    navController.navigate("dashboard")
                } else {
                    errorMessage = "Error al registrarse. Inténtelo de nuevo."
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
        Text("Crear cuenta", style = MaterialTheme.typography.headlineLarge)
        Spacer(modifier = Modifier.height(16.dp))

        BasicTextField(value = email, onValueChange = { email = it })
        Spacer(modifier = Modifier.height(8.dp))
        BasicTextField(value = password, onValueChange = { password = it })

        if (errorMessage.isNotEmpty()) {
            Text(text = errorMessage, color = MaterialTheme.colorScheme.error)
        }

        Button(
            onClick = { onRegister() },
            modifier = Modifier.padding(top = 16.dp)
        ) {
            Text("Registrarse")
        }

        Spacer(modifier = Modifier.height(8.dp))

        TextButton(onClick = { navController.navigate("login") }) {
            Text("¿Ya tienes una cuenta? Inicia sesión")
        }
    }
}

@Preview(showBackground = true)
@Composable
fun PreviewRegister() {
    RegisterScreen(navController = rememberNavController())
}
