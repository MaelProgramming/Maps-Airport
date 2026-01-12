package com.mapsairport.ui.screen

import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavController
import androidx.room.parser.expansion.Position
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
    airportId: String?,
    viewModel: HomeViewModel = viewModel()
) {
    val airports = viewModel.airports
    val airport = airports.find { it.id.toString() == airportId }

    // Coordonnées initiales
    val initialLatLng = airport?.let { LatLng(it.latitude, it.longitude) } ?: LatLng(40.4168, -3.7038)
    val initialZoom = 10f

    // Correct : on utilise CameraPosition
    val cameraPositionState = rememberCameraPositionState {
        position = CameraPosition.fromLatLngZoom(initialLatLng, initialZoom)
    }

    GoogleMap(
        modifier = Modifier.fillMaxSize(),
        cameraPositionState = cameraPositionState
    ) {
        // Markers pour tous les aéroports
        airports.forEach { ap ->
            Marker(
                state = com.google.maps.android.compose.MarkerState(position = LatLng(ap.latitude, ap.longitude)),
                title = ap.name,
                snippet = ap.city,
                onClick = {
                    navController.navigate("second/${ap.id}")
                    true
                }
            )
        }
    }
}

