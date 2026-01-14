package com.mapsairport

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.mapsairport.ui.screen.*
import com.mapsairport.ui.theme.MapsAirportTheme
import com.mapsairport.viewmodel.AuthViewModel
import com.mapsairport.viewmodel.HomeViewModel

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MapsAirportTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    val navController = rememberNavController()
                    val sharedViewModel: HomeViewModel = viewModel()
                    val authViewModel: AuthViewModel = viewModel()

                    // Start destination dynamique
                    val startDestination = if (authViewModel.user != null) "home" else "login"

                    NavHost(navController = navController, startDestination = startDestination) {

                        // Login Screen
                        composable("login") {
                            LoginScreen(navController = navController, authViewModel = authViewModel)
                        }

                        // Register Screen
                        composable("register") {
                            RegisterScreen(navController = navController, authViewModel = authViewModel)
                        }

                        // Home Screen
                        composable("home") {
                            HomeScreen(
                                navController = navController,
                                viewModel = sharedViewModel,
                                authViewModel = authViewModel
                            )
                        }

                        // Second Screen with ID argument
                        composable("second/{id}") { backStackEntry ->
                            val id = backStackEntry.arguments!!.getString("id")!!
                            SecondScreen(
                                navController = navController,
                                airportId = id,
                                viewModel = sharedViewModel
                            )
                        }

                        // Map Screen with ID argument
                        composable(
                            route = "map/{id}",
                            arguments = listOf(navArgument("id") { type = NavType.StringType })
                        ) { backStackEntry ->
                            val id = backStackEntry.arguments!!.getString("id")!!
                            MapScreen(
                                navController = navController,
                                viewModel = sharedViewModel,
                                airportId = id
                            )
                        }
                    }
                }
            }
        }
    }
}
