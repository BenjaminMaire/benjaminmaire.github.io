# Fiche Technique — EvenixMobile (Application Android React Native)

> Composant mobile du projet Evenix  
> Contributeurs : LEMAIRE Alexis, MAIRE Benjamin, POIGNANT Bastien

---

## 1. Présentation du projet

**Nom :** EvenixMobile  
**Type :** Application mobile Android (React Native via Expo)  
**Contexte :** Extension mobile de la plateforme Evenix, développée en parallèle du frontend web dans le cadre du BTS SIO.

**Objectif fonctionnel :**  
EvenixMobile est le pendant mobile d'Evenix. Elle permet aux utilisateurs et organisateurs d'accéder à la plateforme de gestion d'événements depuis un smartphone Android. Elle consomme la même API REST Spring Boot que le frontend web.

**Public cible :**
- Utilisateurs souhaitant consulter et s'inscrire à des événements depuis leur mobile
- Organisateurs souhaitant gérer leurs événements en mobilité

---

## 2. Choix techniques justifiés

| Technologie | Version | Justification du choix |
|---|---|---|
| React Native | 0.81.5 | Framework cross-platform permettant de développer une application mobile depuis une base de code JavaScript/React partagée. Partage la logique React et la syntaxe JSX avec le frontend web Evenix, réduisant la courbe d'apprentissage. |
| Expo | ~54.0.33 | Surcouche à React Native qui simplifie drastiquement la configuration du projet (pas de XCode/Android Studio nécessaire pour démarrer), fournit un serveur de développement avec QR code et facilite les builds. Choisi pour accélérer le développement en environnement BTS. |
| React | 19.1.0 | Même bibliothèque UI que le frontend web, permettant de réutiliser la connaissance des composants et des hooks. |
| React Navigation (native-stack) | 7.x | Navigation standard pour React Native : gestion de la pile d'écrans (stack navigator) avec transitions animées natives. Alternative à React Router (web), spécialement conçue pour les interactions mobiles. |
| AsyncStorage | 2.2.0 | Stockage clé-valeur persistant sur le device (équivalent mobile du `localStorage` web). Utilisé pour conserver le token JWT et les informations utilisateur entre les sessions. |
| DateTimePicker | 8.4.4 | Composant natif de saisie de date/heure adapté aux conventions UI Android et iOS. Utilisé dans les formulaires de création d'événement. |
| JavaScript (ES6+) | — | Le choix de JS pur (sans TypeScript) simplifie le démarrage pour un projet de formation, bien que TypeScript aurait apporté plus de robustesse. |
| Fetch API (natif) | — | API HTTP intégrée à React Native, sans dépendance supplémentaire. Gestion des codes HTTP (401, 404, 400…) faite manuellement dans `services/api.js`. |

---

## 3. Architecture technique

### Vue d'ensemble
```
Application React Native (Expo)
    ↕ HTTP/HTTPS — JSON — Bearer Token JWT
API REST Evenix (Spring Boot — même backend que le web)
```

### Structure de l'application

```
EvenixMobile/
├── App.js                   ← Point d'entrée, initialise le NavigationContainer
├── index.js                 ← Enregistrement du composant racine
├── navigation/
│   └── AppNavigator.js      ← Stack Navigator : définit tous les écrans et leurs titres
├── screens/                 ← Un fichier par écran
│   ├── LoginScreen.js       ← Formulaire de connexion
│   ├── RegisterScreen.js    ← Formulaire d'inscription
│   ├── EventsListScreen.js  ← Liste de tous les événements
│   ├── EventDetailScreen.js ← Détail d'un événement + bouton inscription
│   ├── MesReservationsScreen.js ← Inscriptions de l'utilisateur connecté
│   ├── ProfileScreen.js     ← Profil utilisateur (modification)
│   ├── OrganizerEventsListScreen.js ← Événements créés par l'organisateur
│   ├── CreateEventScreen.js ← Formulaire de création d'événement
│   └── EditEventScreen.js   ← Formulaire de modification d'événement
└── services/
    └── api.js               ← Toutes les fonctions d'appel à l'API REST Evenix
```

**Patterns utilisés :**
- **Stack Navigation** : navigation par empilement d'écrans, conforme aux conventions Android
- **Service Layer** : toutes les interactions avec l'API sont centralisées dans `services/api.js`, les écrans ne font pas d'appels HTTP directs
- **Prop drilling** : le token JWT et les infos utilisateur sont passés via les paramètres de navigation (props) d'un écran à l'autre (pattern simple adapté à la taille du projet)

---

## 4. Fonctionnalités principales

### Authentification
- **Connexion** : appel POST `/api/auth/login`, récupération du token JWT et des infos utilisateur, stockage local via AsyncStorage
- **Inscription** : appel POST `/api/auth/register`, envoi des informations de profil
- **Déconnexion** : suppression du token de l'AsyncStorage et retour à l'écran Login

### Consultation des événements
- **Liste des événements** : appel GET `/api/evenement/all`, affichage sous forme de liste défilante (FlatList)
- **Détail d'un événement** : affichage des informations complètes (nom, description, date, lieu, prix, image)

### Inscriptions
- **Participer** : appel POST `/api/inscription`, gestion des cas d'erreur 401 (session expirée), 400 (déjà inscrit), 404 (introuvable)
- **Mes réservations** : appel GET `/api/inscription/user/{userId}`, liste des événements auxquels l'utilisateur est inscrit
- **Se désinscrire** : appel DELETE `/api/inscription/{inscriptionId}`

### Gestion des événements (Organisateur)
- **Créer un événement** : formulaire avec saisie du titre, description, dates (DateTimePicker), lieu, prix, envoi POST `/api/evenement`
- **Modifier un événement** : formulaire pré-rempli, mise à jour via PUT `/api/evenement/{id}`
- **Supprimer un événement** : appel DELETE `/api/evenement/{id}`
- **Mes événements** : liste des événements créés par l'organisateur connecté

### Profil utilisateur
- Affichage des informations personnelles (nom, prénom, email, téléphone)
- Modification du profil via PUT `/api/utilisateur/{id}`

---

## 5. Points techniques remarquables

### 1. Couche de service API centralisée
Le fichier `services/api.js` est le seul point de contact avec le backend. Chaque fonction gère précisément les différents codes HTTP retournés. Par exemple, pour `participerEvenement()` :
- HTTP 401 → throw `'SESSION_EXPIREE'` (pour déconnecter l'utilisateur proprement)
- HTTP 404 → message d'erreur spécifique
- HTTP 400 → relecture du body texte pour afficher le message métier du backend
- HTTP 200 → retour des données JSON

### 2. Navigation Stack typée
L'`AppNavigator.js` définit 9 écrans avec leurs options de header (titre, couleur `#4CAF50`). La navigation se fait via `navigation.navigate('NomEcran')` avec passage de paramètres, sans état global complexe.

### 3. Gestion du DateTimePicker natif
Pour la création/modification d'événements, `@react-native-community/datetimepicker` rend un sélecteur de date natif Android (Dialog Material Design) au lieu d'un champ texte. L'expérience utilisateur est ainsi conforme aux standards de la plateforme.

### 4. Même API que le web
L'application mobile consomme exactement la même API REST que le frontend web React. Cela démontre la capacité du backend Spring Boot à servir plusieurs types de clients (web, mobile) sans modification. Le token JWT est inclus dans le header `Authorization: Bearer <token>` de chaque requête authentifiée.

### 5. Gestion des réponses 204 No Content
Dans `deleteEvenement()`, le code gère le cas où le backend retourne HTTP 204 (sans corps JSON) lors d'une suppression réussie, en retournant simplement `true`. Cela évite une erreur de parsing JSON sur une réponse vide.

---

## 6. Difficultés rencontrées et solutions

### Configuration de l'IP du serveur
L'application mobile doit connaître l'adresse IP du serveur Spring Boot. En développement local sur réseau Wi-Fi, `localhost` ne fonctionne pas depuis un appareil physique. **Solution** : la `BASE_URL` dans `api.js` est configurée avec l'IP locale du PC (`192.168.56.13:8080`). Un commentaire dans le code explique comment la trouver avec `ipconfig`.

### Absence de refresh token
Si le JWT expire pendant l'utilisation de l'application, les appels API retournent HTTP 401. **Solution implémentée** : le code détecte l'erreur `SESSION_EXPIREE` et peut déconnecter l'utilisateur. Il n'y a pas de mécanisme automatique de renouvellement du token.

### Absence de TypeScript
Le projet utilise JavaScript pur, ce qui peut entraîner des erreurs de typage à l'exécution difficiles à détecter. Non identifié comme un problème bloquant mais comme une limite technique à mentionner.

---

## 7. Pistes d'amélioration

- **Migrer vers TypeScript** pour bénéficier du typage statique et de la détection d'erreurs à la compilation
- **Ajouter un état global** (Context API ou Zustand) pour partager le token et le profil utilisateur sans prop drilling à travers les écrans
- **Gérer le refresh token** pour renouveler automatiquement la session sans déconnecter l'utilisateur
- **Stocker l'URL du backend en variable d'environnement** (fichier `.env`) plutôt qu'en dur dans `api.js`
- **Ajouter une carte** (React Native Maps) pour visualiser les lieux des événements, comme mentionné dans le README Evenix (intégration Google Maps)
- **Build multi-plateforme** : Expo permet de générer une version iOS sans modification de code

---

*Fiche générée le 2026-04-23 — basée sur lecture directe des sources*
