package com.mapsairport.model

data class ControlPoint(
    val id: String = "",
    val airportId: String = "", // pour savoir à quel aéroport il appartient
    val name: String = "", // ex: "Sécurité Terminal 1"
    val position: String = "", // éventuellement pour map / localisation
    val avgWaitTime: Int = 0, // temps moyen en minutes
    val currentUsers: Int = 0, // nombre d’utilisateurs actuellement
    val capacity: Int = 50 // capacité max (pour Waze-style)
)
