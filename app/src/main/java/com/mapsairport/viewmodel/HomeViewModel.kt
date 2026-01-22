package com.mapsairport.viewmodel // Package for view modelsaz

import androidx.compose.runtime.mutableStateListOf
import androidx.lifecycle.ViewModel
import com.google.firebase.Firebase
import com.google.firebase.firestore.firestore
import com.google.firebase.firestore.toObjects
import com.mapsairport.model.Airport
import com.mapsairport.model.ControlPoint
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import android.util.Log

class HomeViewModel : ViewModel() {

    private val db = Firebase.firestore // Firestore instance
    private val airportCollection = db.collection("airports") // Airport collection reference in Firebase
    private val controlPointCollection = db.collection("controlPoints") // Control point collection reference in Firestore

    private val _airports = mutableStateListOf<Airport>() // List of aiports
    val airports: List<Airport> get() = _airports // Expose the list of airports as a read-only property


    private val _controlPoints = MutableStateFlow<List<ControlPoint>>(emptyList()) // List of control point (private function)
    val controlPoints: StateFlow<List<ControlPoint>> = _controlPoints // Expose the list of control point (public function)

    init {
        listenToAirports()
        listenToControlPoints()
    }

    private fun listenToAirports() {
        airportCollection.addSnapshotListener { snapshot, error ->
            if (error != null) {
                Log.e("FIRESTORE", "Erreur airports", error)
                return@addSnapshotListener
            }

            Log.d("FIRESTORE", "Snapshot airports size = ${snapshot?.size()}")

            snapshot?.let {
                val list = it.toObjects(Airport::class.java)
                Log.d("FIRESTORE", "Airports reçus: $list")
                _airports.clear()
                _airports.addAll(list)
            }
        }
    }

    // Function to listen the control points collection
    private fun listenToControlPoints() {
        controlPointCollection.addSnapshotListener { snapshot, error ->
            if (error != null) return@addSnapshotListener
            snapshot?.let {
                _controlPoints.value = it.toObjects()
            }
        }
    }

    fun addAirport(name: String, city: String, latitude: Double, longitude: Double) {
        val airport = Airport(
            id = System.currentTimeMillis().toInt(), // ou un autre id unique
            name = name,
            city = city,
            latitude = latitude,
            longitude = longitude
        )
        airportCollection.document(airport.id.toString()).set(airport)
    }

    // Function to add a control point in the corresponding Firestore collection

    fun addControlPoint(controlPoint: ControlPoint) {
        controlPointCollection.document(controlPoint.id).set(controlPoint)
    }

    // Function to update the congestion of the point
    fun updateCongestion(id: String, deltaUsers: Int) {
        val ref = controlPointCollection.document(id)

        db.runTransaction { tx ->
            val snap = tx.get(ref)
            val current = snap.getLong("currentUsers") ?: 0
            val updated = (current + deltaUsers).coerceAtLeast(0)
            tx.update(ref, "currentUsers", updated)
        }
    }

    // Function to approximate the waiting time based on the current number of users
    fun estimatedTime(cp: ControlPoint): Int {
        val factor = cp.currentUsers.toFloat() / cp.capacity
        return cp.avgWaitTime + (factor * cp.avgWaitTime).toInt()
    }

}
