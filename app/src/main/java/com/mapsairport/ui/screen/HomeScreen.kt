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
import com.mapsairport.model.Airport
import com.mapsairport.viewmodel.HomeViewModel

@Composable
fun HomeScreen(
    navController: NavController,
    viewModel: HomeViewModel = viewModel()
) {
    var code by remember { mutableStateOf("") }
    var name by remember { mutableStateOf("") }
    var city by remember { mutableStateOf("") }
    var searchQuery by remember { mutableStateOf("") }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        // Titre
        Text(
            text = "Welcome to Maps Airport",
            style = MaterialTheme.typography.headlineMedium
        )

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
                            // Navigation vers SecondScreen avec l'ID de l'aéroport
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
        Card(
            modifier = Modifier.fillMaxWidth(),
            elevation = CardDefaults.cardElevation(8.dp)
        ) {
            Column(modifier = Modifier.padding(12.dp)) {
                OutlinedTextField(
                    value = code,
                    onValueChange = { code = it },
                    label = { Text("Code IATA") },
                    modifier = Modifier.fillMaxWidth()
                )
                OutlinedTextField(
                    value = name,
                    onValueChange = { name = it },
                    label = { Text("Nom") },
                    modifier = Modifier.fillMaxWidth()
                )
                OutlinedTextField(
                    value = city,
                    onValueChange = { city = it },
                    label = { Text("Ville") },
                    modifier = Modifier.fillMaxWidth()
                )
                Spacer(modifier = Modifier.height(8.dp))
                Button(
                    onClick = {
                        if (code.isNotBlank() && name.isNotBlank() && city.isNotBlank()) {
                            // Génère un ID basé sur les IDs existants
                            val newId = (viewModel.airports.maxOfOrNull { it.id } ?: 0) + 1
                            val airport = Airport(
                                id = newId,
                                code = code.uppercase(),
                                name = name,
                                city = city
                            )
                            viewModel.addAirport(airport)

                            // Reset des champs
                            code = ""
                            name = ""
                            city = ""
                        }
                    },
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text("Ajouter")
                }
            }
        }
    }
}
