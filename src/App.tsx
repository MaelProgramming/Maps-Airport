import React from "react"; // Ajoute useState
import { useAuth } from "./contexts/AuthContext";
import Connector from "./engine/Connector";
import './App.css'
import { loginWithGoogle, logout } from "./hooks/useAuth";

function App(): React.JSX.Element {
  const { user } = useAuth();
  
  // ERROR : App n'a pas accès aux données de l'aéroport ici !
  // Pour que ça marche, tu devrais normalement avoir ces states ici :
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-6 px-4 text-center bg-gray-50 font-sans">
        <div className="space-y-2">
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Melio</h1>
          <p className="text-slate-500 font-medium">L'aviation, sans les bouchons au terminal.</p>
        </div>
        <button
          onClick={loginWithGoogle}
          className="px-8 py-4 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 font-bold w-full max-w-xs active:scale-95"
        >
          Se connecter avec Google
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen max-h-screen bg-white">
      <header className="flex items-center justify-between p-4 border-b bg-white/80 backdrop-blur-md z-[10001]">
        <div className="flex gap-2 flex-1 items-center">
          <span className="font-black text-lg tracking-tighter mr-4">MELIO</span>
          <div className="px-4 py-2 rounded-lg text-xs font-bold bg-slate-100 text-slate-900 border border-slate-200">
            📍 Madrid-Barajas (MAD)
          </div>
        </div>
        <button
          onClick={logout}
          className="px-4 py-2 text-slate-400 hover:text-red-600 text-xs font-bold rounded-xl transition-colors"
        >
          Déconnexion
        </button>
      </header>

      <main className="flex-1 relative w-full overflow-visible"> 

        <Connector />
      </main>
    </div>
  );
}

export default App;