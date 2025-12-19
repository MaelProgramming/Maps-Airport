package com.mapsairport.ui.screen

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.Button
import androidx.compose.material3.Text
import androidx.compose.material3.TextField
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavController
import com.mapsairport.model.Airport
import com.mapsairport.viewmodel.HomeViewModel
import android.net.Uri

@Composable
fun HomeScreen(navController: NavController?, viewModel: HomeViewModel = viewModel()) {
    // Champs pour saisir un aéroport personnalisé
    var code by remember { mutableStateOf("") }
    var name by remember { mutableStateOf("") }
    var city by remember { mutableStateOf("") }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(text = viewModel.message)

        Spacer(modifier = Modifier.height(16.dp))

        // Liste des aéroports
        LazyColumn(modifier = Modifier.weight(1f)) {
            items(viewModel.airports) { airport ->
                Text(
                    text = "${airport.code} - ${airport.name} (${airport.city})",
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(8.dp)
                        .clickable {
                            // Navigation vers le détail
                            navController?.navigate("second/${airport.id}")
                        }
                )
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Formulaire pour ajouter un aéroport personnalisé
        TextField(value = code, onValueChange = { code = it }, label = { Text("Code") })
        TextField(value = name, onValueChange = { name = it }, label = { Text("Nom") })
        TextField(value = city, onValueChange = { city = it }, label = { Text("Ville") })

        Spacer(modifier = Modifier.height(8.dp))

        Button(onClick = {
            if (code.isNotBlank() && name.isNotBlank() && city.isNotBlank()) {
                viewModel.addAirport(
                    Airport(
                        id = viewModel.generateId(), // Génère un ID unique
                        code = code,
                        name = name,
                        city = city
                    )
                )
                code = ""; name = ""; city = ""  // Réinitialise les champs
            }
        }) {
            Text("Ajouter l'aéroport personnalisé")
        }
    }
}
