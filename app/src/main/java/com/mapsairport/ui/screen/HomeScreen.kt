package com.mapsairport.ui.screen

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavController
import com.mapsairport.model.Airport
import com.mapsairport.model.ControlPoint
import java.util.UUID
import com.mapsairport.viewmodel.HomeViewModel

@Composable
fun HomeScreen(
   navController: NavController?,
   viewModel: HomeViewModel = viewModel()
) {
    var code by remember { mutableStateOf("") }
    var name by remember { mutableStateOf("") }
    var city by remember { mutableStateOf("") }

    // ID de l'aéroport sélectionné
    var selectedAirportId by remember { mutableStateOf<Int?>(null) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        Text(text = viewModel.message, style = MaterialTheme.typography.headlineSmall)
        Spacer(modifier = Modifier.height(16.dp))

        // Liste des aéroports
        LazyColumn(modifier = Modifier.weight(1f)) {
            items(viewModel.airports, key = { it.id }) { airport ->
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 4.dp)
                        .clickable {
                            // Toggle sélection
                            selectedAirportId = if (selectedAirportId == airport.id) null else airport.id
                        }
                ) {
                    Text(
                        text = "${airport.code} - ${airport.name} (${airport.city})",
                        modifier = Modifier.padding(16.dp)
                    )
                }

                // Détails inline si sélectionné
                if (selectedAirportId == airport.id) {
                    SecondScreenInline(airport = airport, viewModel = viewModel)
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Formulaire d'ajout d'aéroport
        OutlinedTextField(
            value = code,
            onValueChange = { code = it },
            label = { Text("Code IATA (ex: MAD)") },
            modifier = Modifier.fillMaxWidth()
        )
        OutlinedTextField(
            value = name,
            onValueChange = { name = it },
            label = { Text("Nom de l'aéroport") },
            modifier = Modifier.fillMaxWidth()
        )
        OutlinedTextField(
            value = city,
            onValueChange = { city = it },
            label = { Text("Ville") },
            modifier = Modifier.fillMaxWidth()
        )

        Spacer(modifier = Modifier.height(16.dp))

        Button(
            modifier = Modifier.fillMaxWidth(),
            onClick = {
                if (code.isNotBlank() && name.isNotBlank() && city.isNotBlank()) {
                    val airport = Airport(
                        id = viewModel.generateId(),
                        code = code.uppercase(),
                        name = name,
                        city = city
                    )
                    viewModel.addAirport(airport)

                    // Points de contrôle par défaut
                    viewModel.addControlPoint(
                        ControlPoint(
                            id = UUID.randomUUID().toString(),
                            airportId = airport.id.toString(),
                            name = "Sécurité",
                            avgWaitTime = 10,
                            capacity = 50,
                            currentUsers = 0
                        )
                    )
                    viewModel.addControlPoint(
                        ControlPoint(
                            id = UUID.randomUUID().toString(),
                            airportId = airport.id.toString(),
                            name = "Douane",
                            avgWaitTime = 5,
                            capacity = 30,
                            currentUsers = 0
                        )
                    )

                    // Réinitialisation des champs
                    code = ""; name = ""; city = ""
                }
            }
        ) {
            Text("Ajouter à la base Cloud")
        }
    }
}

@Composable
fun SecondScreenInline(
    airport: Airport,
    viewModel: HomeViewModel
) {
    val controls by viewModel.controlPoints.collectAsState()
    val airportControls = controls.filter { it.airportId == airport.id.toString() }

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .heightIn(max = 300.dp) // Limite la hauteur
            .verticalScroll(rememberScrollState())
            .padding(8.dp)
    ) {
        Text("Détails de l'aéroport:", style = MaterialTheme.typography.titleMedium)
        Text("Code: ${airport.code}")
        Text("Nom: ${airport.name}")
        Text("Ville: ${airport.city}")
        Spacer(modifier = Modifier.height(8.dp))
        Text("Points de contrôle:", style = MaterialTheme.typography.titleMedium)

        airportControls.forEach { cp ->
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(4.dp)
                    .clickable { viewModel.updateCongestion(cp.id, 1) } // clique = ajoute 1 utilisateur
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Column {
                        Text(cp.name)
                        Text("En attente: ${cp.currentUsers} / ${cp.capacity}")
                    }
                    Text("${viewModel.estimatedTime(cp)} min ⏱️")
                }
            }
        }
    }
}
