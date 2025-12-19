package com.mapsairport.ui.screen

import androidx.compose.foundation.layout.*
import androidx.compose.material3.Button
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.navigation.NavController
import androidx.lifecycle.viewmodel.compose.viewModel
import com.mapsairport.viewmodel.HomeViewModel



@Composable
fun SecondScreen(
    navController: NavController?,
    airportId: String?,
    viewModel: HomeViewModel = viewModel()
) {
    // Récupère l'aéroport depuis le ViewModel, même ceux ajoutés dynamiquement
    val airport = viewModel.airports.find { it.id == airportId?.toIntOrNull() }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        if (airport != null) {
            Text(text = "ID: ${airport.id}")
            Text(text = "Code: ${airport.code}")
            Text(text = "Nom: ${airport.name}")
            Text(text = "Ville: ${airport.city}")
        } else {
            Text("Aéroport non trouvé")
        }

        Spacer(modifier = Modifier.height(16.dp))

        Button(onClick = { navController?.popBackStack() }) {
            Text("Retour")
        }
    }
}
