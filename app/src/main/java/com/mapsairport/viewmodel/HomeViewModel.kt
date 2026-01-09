package com.mapsairport.viewmodel

// Import pour toutes les libs natives
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

    private val db = Firebase.firestore
    private val airportCollection = db.collection("airports")
    private val controlPointCollection = db.collection("controlPoints")

    private val _airports = mutableStateListOf<Airport>()
    val airports: List<Airport> get() = _airports

    private val _controlPoints = MutableStateFlow<List<ControlPoint>>(emptyList())
    val controlPoints: StateFlow<List<ControlPoint>> = _controlPoints

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

    private fun listenToControlPoints() {
        controlPointCollection.addSnapshotListener { snapshot, error ->
            if (error != null) return@addSnapshotListener
            snapshot?.let {
                _controlPoints.value = it.toObjects()
            }
        }
    }

    fun addAirport(airport: Airport) {
        airportCollection.document(airport.id.toString()).set(airport)
    }

    fun addControlPoint(controlPoint: ControlPoint) {
        controlPointCollection.document(controlPoint.id).set(controlPoint)
    }

    fun updateCongestion(id: String, deltaUsers: Int) {
        val ref = controlPointCollection.document(id)

        db.runTransaction { tx ->
            val snap = tx.get(ref)
            val current = snap.getLong("currentUsers") ?: 0
            val updated = (current + deltaUsers).coerceAtLeast(0)
            tx.update(ref, "currentUsers", updated)
        }
    }

    fun estimatedTime(cp: ControlPoint): Int {
        val factor = cp.currentUsers.toFloat() / cp.capacity
        return cp.avgWaitTime + (factor * cp.avgWaitTime).toInt()
    }
}
