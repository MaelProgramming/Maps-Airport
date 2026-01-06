package com.mapsairport.viewmodel

import androidx.compose.runtime.mutableStateListOf
import androidx.lifecycle.ViewModel
import com.mapsairport.model.Airport
import com.google.firebase.Firebase
import com.mapsairport.model.ControlPoint
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import com.google.firebase.firestore.firestore
import com.google.firebase.firestore.toObjects

class HomeViewModel : ViewModel() {

    val message: String = "Welcome to Maps Airport"
    private val _airports = mutableStateListOf<Airport>()
    private val _controlPoints = MutableStateFlow<List<ControlPoint>>(emptyList())
    val controlPoints: StateFlow<List<ControlPoint>> = _controlPoints
    val airports: List<Airport> get() = _airports

    // Utilisation de la nouvelle syntaxe Firebase
    private val db = Firebase.firestore
    private val airportCollection = db.collection("airports")
    private val controlPointCollection = db.collection("controlPoints")

    init {
        listenToAirports()
        listenToControlPoints()
    }

    private fun listenToAirports() {
        airportCollection.addSnapshotListener { snapshot, error ->
            if (error != null) return@addSnapshotListener

            snapshot?.let {
                val list = it.toObjects(Airport::class.java)
                _airports.clear()
                _airports.addAll(list)
            }
        }
    }
    fun addControlPoint(controlPoint: ControlPoint) {
        _controlPoints.value = _controlPoints.value + controlPoint
        controlPointCollection.document(controlPoint.id).set(controlPoint)
    }
    fun updateCongestion(id: String, deltaUsers: Int) {
        _controlPoints.value = _controlPoints.value.map { cp ->
            if (cp.id == id) cp.copy(currentUsers = (cp.currentUsers + deltaUsers).coerceAtLeast(0))
            else cp
        }
    }
    private fun listenToControlPoints() {
        controlPointCollection.addSnapshotListener { snapshot, error ->
            if (error != null) return@addSnapshotListener
            snapshot?.let {
                val list = it.toObjects(ControlPoint::class.java)
                _controlPoints.value = list
            }
        }
    }
    fun estimatedTime(cp: ControlPoint): Int {
        val congestionFactor = cp.currentUsers.toFloat() / cp.capacity
        return cp.avgWaitTime + (congestionFactor * cp.avgWaitTime).toInt()
    }
    fun addAirport(airport: Airport) {
        airportCollection.document(airport.id.toString()).set(airport)
    }

    fun generateId(): Int {
        return (_airports.maxOfOrNull { it.id } ?: 0) + 1
    }
}