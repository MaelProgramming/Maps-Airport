package com.mapsairport.ui.screen

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import com.mapsairport.viewmodel.HomeViewModel

@Composable
fun SecondScreen(
    navController: NavController,
    airportId: String?,
    viewModel: HomeViewModel
) {
    val controlPoints by viewModel.controlPoints.collectAsState()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {

        // Bouton Retour
        Button(onClick = { navController.popBackStack() }) {
            Text("← Retour")
        }

        Spacer(modifier = Modifier.height(16.dp))

        Text(
            text = "Détails de l'aéroport $airportId",
            style = MaterialTheme.typography.headlineMedium
        )

        Spacer(modifier = Modifier.height(16.dp))

        // Liste des points de contrôle
        LazyColumn(modifier = Modifier.fillMaxSize()) {
            val airportControls = controlPoints.filter { it.airportId == airportId }
            items(airportControls) { cp ->
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 4.dp)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Text(text = cp.name, style = MaterialTheme.typography.titleMedium)
                        Text(text = "En attente: ${cp.currentUsers} / ${cp.capacity}")
                        Text(text = "Temps estimé: ${viewModel.estimatedTime(cp)} min")

                        Spacer(modifier = Modifier.height(8.dp))

                        Row {
                            Button(onClick = { viewModel.updateCongestion(cp.id, +1) }) {
                                Text("+")
                            }
                            Spacer(modifier = Modifier.width(8.dp))
                            Button(onClick = { viewModel.updateCongestion(cp.id, -1) }) {
                                Text("-")
                            }
                        }
                    }
                }
            }

            if (airportControls.isEmpty()) {
                item {
                    Text(
                        text = "Aucun point de contrôle pour cet aéroport",
                        style = MaterialTheme.typography.bodyMedium,
                        modifier = Modifier.padding(16.dp)
                    )
                }
            }
        }
    }
}
