package com.mapsairport.viewmodel

import androidx.compose.runtime.mutableStateListOf
import androidx.lifecycle.ViewModel
import com.mapsairport.model.Airport

class HomeViewModel : ViewModel() {
    // Property accessed in HomeScreen
    val message: String = "Bienvenue sur MapsAirport"

    // Using mutableStateListOf so the UI updates automatically when items are added
    private val _airports = mutableStateListOf<Airport>()
    val airports: List<Airport> get() = _airports

    init {
        // Optional: Add some dummy data
        _airports.add(Airport(1, "CDG", "Charles de Gaulle", "Paris"))
        _airports.add(Airport(2, "JFK", "John F. Kennedy", "New York"))
    }

    fun addAirport(airport: Airport) {
        _airports.add(airport)
    }

    fun generateId(): Int {
        return (_airports.maxOfOrNull { it.id } ?: 0) + 1
    }
}