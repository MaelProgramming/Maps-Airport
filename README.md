# ✈️ Maps Airport - Indoor Navigation

**Maps Airport** est une solution moderne de navigation intérieure pour aéroports. L'application permet de visualiser les terminaux en haute précision, de gérer les changements d'étages et de localiser les points d'intérêt (Portes, Services, Lounges) via une interface fluide et responsive.

![Status](https://img.shields.io/badge/Status-v1.5--Stable-green)
![License](https://img.shields.io/badge/License-MIT-blue)

---

## ✨ Fonctionnalités (v1.5)

- **Moteur de Rendu SVG** : Cartographie vectorielle légère et ultra-précise.
- **Expérience Mobile First** : Navigation tactile intuitive avec zoom, panoramique et menus contextuels adaptés (Bottom Sheets).
- **Gestion Multi-Niveaux** : Système de switch d'étages dynamique.
- **Authentification Cloud** : Connexion sécurisée via Google Firebase Auth.
- **Synchronisation Temps Réel** : Données des aéroports et des terminaux stockées sur Firestore.

---

## 🛠️ Stack Technique

| Technologie | Usage |
| :--- | :--- |
| **React** | Framework UI |
| **TypeScript** | Typage et robustesse du code |
| **Tailwind CSS** | Design responsive et stylisation |
| **Firebase** | Auth, Firestore & Hosting |
| **Lucide React** | Bibliothèque d'icônes |
| **Zoom-Pan-Pinch** | Moteur d'interaction cartographique |

---

## 📂 Structure des Données (Firestore)

Le projet utilise une structure NoSQL flexible pour modéliser les aéroports :

```typescript
Airport {
  id: string,
  name: string,
  floors: [
    {
      level: number,
      name: string,
      areas: [{ id, name, type, shape: [{x, y}] }],
      markers: [{ id, name, type, position: {x, y} }]
    }
  ]
}
