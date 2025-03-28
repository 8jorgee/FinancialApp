package com.financetracker.ui.main

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.tooling.preview.Preview
import androidx.navigation.NavController

@Composable
fun DashboardScreen(navController: NavController) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text("Bienvenido a tu Dashboard", style = MaterialTheme.typography.headlineLarge)
        Spacer(modifier = Modifier.height(16.dp))

        Button(
            onClick = {
                // Lógica para mostrar información financiera
            }
        ) {
            Text("Ver tus finanzas")
        }

        Spacer(modifier = Modifier.height(8.dp))

        TextButton(onClick = {
            // Lógica para cerrar sesión
            navController.navigate("login")
        }) {
            Text("Cerrar sesión")
        }
    }
}

@Preview(showBackground = true)
@Composable
fun PreviewDashboard() {
    DashboardScreen(navController = rememberNavController())
}
