package com.mapsairport.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.mapsairport.model.ControlPoint
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch

class ControlPointViewModel : ViewModel() {

    private val _controlPoints = MutableStateFlow<List<ControlPoint>>(emptyList())
    val controlPoints: StateFlow<List<ControlPoint>> = _controlPoints

    fun addControlPoint(controlPoint: ControlPoint) {
        viewModelScope.launch {
            _controlPoints.value = _controlPoints.value + controlPoint
        }
    }

    // Simuler la congestion comme Waze-style
    fun updateCongestion(id: String, deltaUsers: Int) {
        _controlPoints.value = _controlPoints.value.map { cp ->
            if (cp.id == id) {
                val newUsers = (cp.currentUsers + deltaUsers).coerceAtLeast(0)
                cp.copy(currentUsers = newUsers)
            } else cp
        }
    }

    // Calcul simple du temps total avec congestion
    fun estimatedTime(controlPoint: ControlPoint): Int {
        val congestionFactor = controlPoint.currentUsers.toFloat() / controlPoint.capacity
        return controlPoint.avgWaitTime + (congestionFactor * controlPoint.avgWaitTime).toInt()
    }
}
