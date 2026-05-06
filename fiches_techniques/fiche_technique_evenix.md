# Fiche Technique — Evenix (Backend + Frontend Web)

> Projet disponible sur : [evenix.fr](https://evenix.fr)  
> Contributeurs : LEMAIRE Alexis, MAIRE Benjamin, POIGNANT Bastien

---

## 1. Présentation du projet

**Nom :** Evenix  
**Type :** Application web full-stack (API REST + SPA React)  
**Contexte :** Projet de développement réalisé dans le cadre de la formation BTS SIO.

**Objectif fonctionnel :**  
Evenix est une plateforme de gestion d'événements. Elle permet à des utilisateurs de s'inscrire à des événements, à des organisateurs de les créer et gérer, et à des administrateurs de modérer l'ensemble de la plateforme. Les événements peuvent être gratuits ou payants.

**Public cible :**  
- Utilisateurs grand public souhaitant découvrir et s'inscrire à des événements
- Organisateurs d'événements (associations, entreprises, particuliers)
- Administrateurs de la plateforme

---

## 2. Choix techniques justifiés

| Technologie | Version | Justification du choix |
|---|---|---|
| Java | 17 | Version LTS recommandée, apporte les records, les sealed classes et une gestion mémoire améliorée. Standard dans les environnements professionnels. |
| Spring Boot | 3.4.5 | Framework Java de référence pour construire des API REST rapidement grâce à sa configuration automatique (auto-configuration), son conteneur IoC intégré et son écosystème de starters. Évite la configuration XML fastidieuse de Spring "nu". |
| Spring Security | (inclus Spring Boot 3) | Module officiel Spring dédié à la sécurité : gestion de l'authentification, des autorisations par rôle, filtre HTTP personnalisable. Intégration native avec JWT. |
| JWT (jjwt 0.12.3) | 0.12.3 | Authentification sans session serveur (stateless). Le token signé est transporté dans le header HTTP `Authorization: Bearer`, ce qui rend le backend scalable et compatible avec les clients mobiles. |
| Spring Data JPA / Hibernate | (inclus) | Abstraction de la couche de persistance : génération automatique des requêtes SQL à partir des méthodes de repository, mapping objet-relationnel avec Hibernate. Réduit considérablement le code répétitif de la couche données. |
| MySQL | (runtime) | Base de données relationnelle éprouvée, bien supportée par Spring/Hibernate. Les relations entre entités (Evenement, Utilisateur, Inscription, Lieu…) se modélisent naturellement en schéma relationnel. |
| Lombok | (inclus) | Génère automatiquement à la compilation les getters, setters, constructeurs. Réduit le code boilerplate sans perte de lisibilité. |
| SpringDoc OpenAPI (Swagger) | 2.8.4 | Génère automatiquement une documentation interactive de l'API accessible sur `/swagger-ui`. Facilite les tests et la collaboration front/back. |
| Spring Mail | (inclus) | Envoi d'emails de confirmation de compte directement depuis le backend Spring, sans dépendance externe. |
| React | 18.3.1 | Bibliothèque UI basée sur des composants réutilisables et un DOM virtuel pour des interfaces performantes. Standard de l'industrie pour les SPA (Single Page Applications). |
| TypeScript | 5.5.3 | Typage statique sur JavaScript : détecte les erreurs à la compilation, améliore l'autocomplétion et la maintenabilité du code frontend. |
| Vite | 5.4.2 | Bundler de nouvelle génération utilisant les modules ES natifs du navigateur en développement : démarrage quasi-instantané, rechargement à chaud (HMR) ultra-rapide. |
| React Router DOM | 7.9.6 | Routage côté client pour une navigation SPA fluide sans rechargement de page, avec gestion des routes protégées. |
| Axios | 1.13.2 | Client HTTP avec gestion automatique des headers, des intercepteurs et de la sérialisation JSON. Utilisé pour tous les appels vers l'API Spring Boot. |
| Tailwind CSS | 3.4.1 | Framework CSS utilitaire : styles appliqués directement dans le JSX, sans créer de fichiers CSS séparés. Cohérence visuelle et développement rapide. |
| Supabase JS | 2.57.4 | SDK pour interagir avec Supabase (stockage fichiers/images). Utilisé pour l'upload des images d'événements. |

---

## 3. Architecture technique

### Vue d'ensemble
```
Navigateur (React + TypeScript + Vite)
    ↕ HTTP/HTTPS — JSON — Bearer Token JWT
API REST (Spring Boot 3 — Java 17)
    ↕ JDBC / JPA / Hibernate
Base de données MySQL
```

### Couches du backend (Spring Boot)

```
com.evenix
├── config/          ← Sécurité (SecurityConfig), CORS (WebConfig), OpenAPI
├── controllers/     ← Points d'entrée REST (@RestController)
│                      AuthController, EvenementController, InscriptionController,
│                      UtilisateurController, LieuController, EntrepriseController…
├── services/        ← Logique métier
├── repos/           ← Interfaces Spring Data JPA (repositories)
├── entities/        ← Entités JPA : Utilisateur, Evenement, Inscription, Lieu, Role…
├── dto/             ← Data Transfer Objects (projection des entités vers le réseau)
├── mappers/         ← Conversions Entity ↔ DTO
├── security/        ← Filtre JWT personnalisé (JWTAuthorizationFilter, SecParams)
└── exception/       ← Gestion centralisée des erreurs (GlobalExceptionHandler)
```

### Couches du frontend (React)

```
src/
├── router/          ← Définition des routes (y compris routes protégées)
├── context/         ← AuthContext (état global d'authentification via React Context)
├── pages/           ← Composants de page (Home, EventsList, EventDetail, Login,
│                      Register, Profile, UserDashboard, AdminDashboard,
│                      OrganizerDashboard…)
├── components/      ← Composants réutilisables (Navbar, Footer, ProtectedRoute)
├── services/        ← Couche d'appels API (authService, evenementService,
│                      inscriptionService, utilisateurService…)
├── types/           ← Interfaces TypeScript (typage des entités)
└── utils/api.ts     ← Configuration Axios (base URL, intercepteurs)
```

**Patterns utilisés :**
- **MVC / Layered Architecture** côté backend (Controller → Service → Repository → Entity)
- **Context API** côté frontend pour l'état d'authentification global
- **Route Guards** (ProtectedRoute) pour sécuriser les pages selon le rôle
- **DTO Pattern** pour ne jamais exposer les entités internes directement en JSON
- **Stateless JWT** : aucune session serveur, token validé à chaque requête par le filtre

---

## 4. Fonctionnalités principales

### Authentification et gestion des comptes
- **Inscription** : formulaire validé côté serveur (`@Valid` + Jakarta Validation), mot de passe haché avec BCrypt, envoi d'un email de confirmation avec token unique
- **Confirmation d'email** : endpoint `/api/auth/confirm?token=...` qui valide le compte et redirige vers le frontend
- **Connexion** : authentification par email/mot de passe, génération d'un JWT signé renvoyé au client
- **Récupération de mot de passe** : système par question/réponse de sécurité (réponse hachée en BCrypt), sans envoi d'email

### Gestion des événements
- CRUD complet (Create, Read, Update, Delete) des événements via API REST
- Filtrage par type, lieu, organisateur
- Association événement ↔ types (relation Many-to-Many via table `evenement_type_assoc`)
- Upload d'image via Supabase Storage (URL stockée dans `imageUrl`)

### Inscriptions
- Inscription d'un utilisateur à un événement (relation Utilisateur ↔ Événement via table `inscription`)
- Désinscription
- Consultation des inscriptions par utilisateur

### Contrôle d'accès par rôle (RBAC)
- **Rôle UTILISATEUR** : consulte et s'inscrit aux événements
- **Rôle ORGANISATEUR** : crée, modifie, supprime ses propres événements
- **Rôle ADMIN** : accès total, gestion des utilisateurs

### Administration
- Tableau de bord admin : liste des utilisateurs, gestion des entreprises, modération
- Détail d'un utilisateur avec ses inscriptions

---

## 5. Points techniques remarquables

### 1. Sécurité JWT stateless
Le filtre `JWTAuthorizationFilter` intercepte toutes les requêtes HTTP avant les controllers. Il extrait et valide le token JWT depuis le header `Authorization`, puis charge les autorités Spring Security. La configuration `SessionCreationPolicy.STATELESS` garantit qu'aucune session HTTP n'est créée côté serveur, ce qui rend l'application horizontalement scalable.

### 2. Architecture de droits granulaire
La `SecurityConfig` définit des règles précises par méthode HTTP et par chemin :
- `GET /api/evenement/**` → public (pas besoin d'être connecté)
- `POST /api/evenement/**` → `ORGANISATEUR` ou `ADMIN` uniquement
- `GET /api/utilisateur/all` → `ADMIN` uniquement

### 3. Confirmation de compte par email
Lors de l'inscription, un token UUID unique est généré et stocké en base avec sa date de création. Un email est envoyé avec un lien vers `/api/auth/confirm?token=...`. Ce système protège contre la création de faux comptes.

### 4. Gestion centralisée des erreurs
La classe `GlobalExceptionHandler` (annotation `@RestControllerAdvice`) capture toutes les exceptions non gérées et retourne une réponse JSON structurée (`ApiResponse`) avec un code HTTP approprié. Cela évite que les stack traces Java n'atteignent le client.

### 5. Pattern DTO + Mapper
Les entités JPA ne sont jamais directement sérialisées en JSON. Des DTOs intermédiaires sont utilisés pour contrôler précisément ce qui est exposé (ex : le `motDePasse` n'est jamais inclus dans un DTO retourné).

### 6. Configuration CORS flexible
Le backend autorise toutes les origines (`allowedOriginPatterns: "*"`) tout en maintenant les credentials, pour faciliter le développement local et le déploiement sur différents domaines.

---

## 6. Difficultés rencontrées et solutions

### Boucles infinies JSON (Jackson)
Les entités JPA ayant des relations bidirectionnelles (ex : `Evenement` ↔ `Utilisateur` ↔ `Inscription`), Jackson pouvait provoquer des boucles infinies lors de la sérialisation. **Solution** : utilisation de `@JsonIgnoreProperties` sur les champs problématiques pour rompre la récursion.

### Double dépendance Lombok
Le `pom.xml` contient `spring-boot-configuration-processor` en doublon (lignes 131 et 137). C'est une erreur de configuration sans impact fonctionnel mais qui signale un manque de rigueur dans la gestion des dépendances.

### Configuration CORS en développement
L'CORS a été un point de friction lors de la mise en place de la communication frontend ↔ backend sur des ports différents. La solution adoptée est une configuration `CorsConfigurationSource` centralisée dans `SecurityConfig` plutôt que des annotations `@CrossOrigin` dispersées.

---

## 7. Pistes d'amélioration

- **Remplacer la question/réponse de sécurité** par un flux de réinitialisation par email avec token temporaire (approche standard et plus sécurisée)
- **Ajouter un refresh token** : actuellement les tokens JWT expirent sans mécanisme de renouvellement automatique côté frontend
- **Pagination** des listes d'événements et d'utilisateurs côté API (Spring Data `Pageable`)
- **Tests d'intégration** : les dépendances Mockito sont présentes dans le `pom.xml` mais la couverture de tests réelle est non déterminable depuis le code
- **Suppression de la dépendance dupliquée** `spring-boot-configuration-processor`
- **Validation plus stricte** des URLs d'images (actuellement stockées telles quelles sans validation de format)
- **Gestion des paiements** : l'entité `Paiement` et le `PaiementController` sont présents mais leur implémentation complète est non déterminable depuis le code

---

*Fiche générée le 2026-04-23 — basée sur lecture directe des sources*
