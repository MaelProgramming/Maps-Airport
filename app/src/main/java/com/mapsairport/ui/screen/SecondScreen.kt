package com.mapsairport.ui.screen

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import com.mapsairport.viewmodel.HomeViewModel

@Composable
fun SecondScreen(
    navController: NavController,
    airportId: String,
    viewModel: HomeViewModel
) {
    val controlPoints by viewModel.controlPoints.collectAsState()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {

        Text(
            text = "Airport $airportId",
            style = MaterialTheme.typography.headlineMedium
        )

        Spacer(modifier = Modifier.height(16.dp))

        controlPoints
            .filter { it.airportId == airportId }
            .forEach { cp ->

                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 4.dp)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {

                        Text(text = cp.name)
                        Text(text = "Users: ${cp.currentUsers}")
                        Text(text = "ETA: ${viewModel.estimatedTime(cp)} min")

                        Row(modifier = Modifier.padding(top = 8.dp)) {
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

        Spacer(modifier = Modifier.height(24.dp))

        // Bouton pour accéder à la Map
        Button(
            onClick = {
                navController.navigate("map/$airportId")
            },
            modifier = Modifier.fillMaxWidth()
        ) {
            Text("Voir sur la carte")
        }

        Spacer(modifier = Modifier.height(12.dp))

        // Bouton retour
        Button(
            onClick = { navController.popBackStack() },
            modifier = Modifier.fillMaxWidth()
        ) {
            Text("Retour")
        }
    }
}
