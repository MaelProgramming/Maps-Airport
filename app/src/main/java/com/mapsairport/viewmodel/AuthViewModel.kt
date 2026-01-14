package com.mapsairport.viewmodel

import androidx.lifecycle.ViewModel
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.getValue
import androidx.compose.runtime.setValue
import com.google.firebase.Firebase
import com.mapsairport.model.User
import com.google.firebase.auth.FirebaseAuth
import com.google.firebase.auth.auth

class AuthViewModel : ViewModel() {

    private val auth: FirebaseAuth = Firebase.auth

    var email by mutableStateOf("")
    var password by mutableStateOf("")
    var user by mutableStateOf<User?>(null)
    var errorMessage by mutableStateOf<String?>(null)
    var isLoading by mutableStateOf(false)

    // Connexion
    fun login(onSuccess: () -> Unit) {
        isLoading = true
        errorMessage = null

        auth.signInWithEmailAndPassword(email, password)
            .addOnCompleteListener { task ->
                isLoading = false
                if (task.isSuccessful) {
                    val firebaseUser = auth.currentUser
                    if (firebaseUser != null) {
                        // Ici, tu peux récupérer les infos depuis Firestore si nécessaire
                        user = User(
                            id = firebaseUser.uid,
                            name = firebaseUser.displayName ?: "",
                            username = firebaseUser.email?.split("@")?.get(0) ?: ""
                        )
                        onSuccess()
                    }
                } else {
                    errorMessage = task.exception?.message ?: "Erreur inconnue"
                }
            }
    }

    // Inscription
    fun register(name: String, username: String, onSuccess: () -> Unit) {
        isLoading = true
        errorMessage = null

        auth.createUserWithEmailAndPassword(email, password)
            .addOnCompleteListener { task ->
                isLoading = false
                if (task.isSuccessful) {
                    val firebaseUser = auth.currentUser
                    if (firebaseUser != null) {
                        // Mettre à jour le displayName
                        val profileUpdates = com.google.firebase.auth.UserProfileChangeRequest.Builder()
                            .setDisplayName(name)
                            .build()
                        firebaseUser.updateProfile(profileUpdates).addOnCompleteListener {
                            user = User(
                                id = firebaseUser.uid,
                                name = name,
                                username = username
                            )
                            onSuccess()
                        }
                    }
                } else {
                    errorMessage = task.exception?.message ?: "Erreur inconnue"
                }
            }
    }

    // Déconnexion
    fun logout() {
        auth.signOut()
        user = null
        email = ""
        password = ""
    }
}
