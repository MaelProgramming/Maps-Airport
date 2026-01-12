package com.mapsairport.ui.screen

import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavController
import com.google.android.gms.maps.CameraUpdateFactory
import com.google.android.gms.maps.model.CameraPosition
import com.google.android.gms.maps.model.LatLng
import com.google.maps.android.compose.CameraPositionState
import com.google.maps.android.compose.GoogleMap
import com.google.maps.android.compose.Marker
import com.google.maps.android.compose.rememberCameraPositionState
import com.mapsairport.model.Airport
import com.mapsairport.viewmodel.HomeViewModel

@Composable
fun MapScreen(
    navController: NavController,
    viewModel: HomeViewModel = viewModel()
) {
    val airports = viewModel.airports

    // Position initiale de la caméra sur Madrid
    val cameraPositionState = rememberCameraPositionState {
        position = CameraPosition.fromLatLngZoom(LatLng(40.4168, -3.7038), 5f)
    }

    GoogleMap(
        modifier = Modifier.fillMaxSize(),
        cameraPositionState = cameraPositionState
    ) {
        airports.forEach { airport ->
            // Marker avec latitude et longitude de l'aéroport
            Marker(
                state = com.google.maps.android.compose.MarkerState(
                    position = LatLng(airport.latitude, airport.longitude)
                ),
                title = airport.name,
                snippet = airport.city,
                onClick = {
                    navController.navigate("second/${airport.id}")
                    true
                }
            )
        }
    }
}
