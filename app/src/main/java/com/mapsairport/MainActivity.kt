package com.mapsairport

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.ui.Modifier
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.mapsairport.ui.screen.HomeScreen
import com.mapsairport.ui.screen.MapScreen
import com.mapsairport.ui.screen.SecondScreen
import com.mapsairport.ui.theme.MapsAirportTheme
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

                    NavHost(navController = navController, startDestination = "home") {

                        // Home Screen
                        composable("home") {
                            HomeScreen(
                                navController = navController,
                                viewModel = sharedViewModel
                            )
                        }

                        // Second Screen with ID argument
                        composable(
                            route = "second/{id}",
                            arguments = listOf(navArgument("id") {
                                type = NavType.StringType
                                nullable = false // argument obligatoire
                            })
                        ) { backStackEntry ->
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
                            arguments = listOf(navArgument("id") {
                                type = NavType.StringType
                                nullable = false
                            })
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
