package com.mapsairport.ui.screen

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavController
import com.mapsairport.component.AddAirportForm
import com.mapsairport.model.Airport
import com.mapsairport.viewmodel.AuthViewModel
import com.mapsairport.viewmodel.HomeViewModel

// Function Maps screen @Composable
@Composable
fun HomeScreen(
    navController: NavController,
    viewModel: HomeViewModel = viewModel(),
    authViewModel: AuthViewModel = viewModel()  // Ajouté pour gérer l'utilisateur
) {
    var searchQuery by remember { mutableStateOf("") }

    // Create the interface
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        // Nom de l'utilisateur et bouton déconnexion
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Text(
                text = "Bienvenue, ${authViewModel.user?.name ?: "Invité"}",
                style = MaterialTheme.typography.headlineSmall
            )
            Button(onClick = {
                authViewModel.logout()
                navController.navigate("login") {
                    popUpTo("home") { inclusive = true }
                }
            }) {
                Text("Déconnexion")
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        // Barre de recherche
        OutlinedTextField(
            value = searchQuery,
            onValueChange = { searchQuery = it },
            label = { Text("Rechercher un aéroport") },
            modifier = Modifier.fillMaxWidth()
        )

        Spacer(modifier = Modifier.height(12.dp))

        // Liste filtrée des aéroports
        LazyColumn(modifier = Modifier.weight(1f)) {
            items(viewModel.airports.filter {
                it.code.contains(searchQuery, true) ||
                        it.name.contains(searchQuery, true) ||
                        it.city.contains(searchQuery, true)
            }) { airport ->
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 4.dp)
                        .clickable {
                            navController.navigate("second/${airport.id}")
                        }
                ) {
                    Text(
                        text = "${airport.code} - ${airport.name} (${airport.city})",
                        modifier = Modifier.padding(16.dp)
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        // Formulaire pour ajouter un nouvel aéroport
        AddAirportForm(
            viewModel = viewModel,
            onDone = {
                println("Aéroport ajouté avec succès !")
            }
        )
    }
}
