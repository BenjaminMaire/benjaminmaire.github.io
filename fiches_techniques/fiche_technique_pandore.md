# Fiche Technique — Pandore (Application VB.NET — Gestion d'inventaire)

> Solution : LegitrackCoreNet — Pandore  
> Fichier solution : `LegitrackCoreNet.sln`  
> Contexte : Application métier Windows développée sur la base du framework interne LegitrackCore

---

## 1. Présentation du projet

**Nom :** Pandore (module applicatif LegitrackCoreNet)  
**Type :** Application Windows Forms (bureau)  
**Langage :** VB.NET  
**Framework :** .NET 4.0 Client Profile  
**Contexte :** Développé dans le cadre d'un projet professionnel BTS SIO. Pandore est un module de gestion d'inventaire basé sur le framework interne `LegitrackCore`, utilisé sur des terminaux mobiles Windows (type Zebra/Honeywell sous Windows CE ou Windows embarqué).

**Objectif fonctionnel :**  
Pandore permet à des opérateurs en entrepôt de réaliser des inventaires physiques : créer un inventaire, scanner des produits pour les comptabiliser, visualiser les écarts avec les données du logiciel de gestion (Sage), exporter les résultats et imprimer des étiquettes. Il intègre également un module Clavis de gestion de numéros de série.

**Public cible :**
- Opérateurs logistiques en entrepôt ou magasin
- Responsables de stock chargés de la validation des inventaires
- Techniciens configurant le terminal mobile

---

## 2. Choix techniques justifiés

| Technologie | Version | Justification du choix |
|---|---|---|
| VB.NET | — | Choisi pour l'intégration native avec l'écosystème Microsoft (.NET Framework) et la compatibilité avec les terminaux Windows embarqués utilisés dans les entrepôts. Langage historiquement utilisé chez les éditeurs de WMS (Warehouse Management Systems) comme Legitrack. |
| .NET Framework | 4.0 (Client Profile) | Version largement répandue sur les terminaux industriels Windows CE et Windows Compact. Le profil "Client" réduit l'empreinte d'installation, essentiel sur des terminaux avec ressources limitées. |
| Windows Forms | — | Interface graphique native Windows, adapté aux écrans tactiles de terminaux industriels. Permet de créer des interfaces robustes avec des contrôles standards (boutons larges, listes, saisie). |
| SQL Server / ADO.NET | — | Base de données relationnelle Microsoft, accédée via `System.Data.SqlClient` (SqlDataReader, SqlCommand). Compatible avec Sage (ERP souvent basé sur SQL Server) pour les requêtes croisées. |
| ODBC | — | Accès à d'autres sources de données (Sage notamment) via `OdbcDataReader`, permettant de lire les articles et familles de l'ERP sans modification du schéma. |
| INI (clsIni) | — | Fichiers de configuration au format INI, standard sur les terminaux industriels Windows qui n'ont pas toujours de registre accessible. Gestion des paramètres applicatifs et utilisateurs. |
| TCP/IP (clsTCPClient) | — | Communication réseau avec le serveur central Legitrack pour synchroniser les données et déclencher les impressions d'étiquettes sur imprimantes réseau. |
| LegitrackCore (framework interne) | — | Bibliothèque partagée entre les différentes applications Legitrack (Pandore, Socaphi…). Fournit les composants transversaux : serveur, HTTP manager, logs, formulaires standards, modules utilitaires. |

---

## 3. Architecture technique

### Vue d'ensemble
```
Interface Windows Forms (Forms)
    ↓
Couche Application (Classes + Modules)
    ↓
Base de données (SQL Server — dbPandore + Sage — ODBC)
    ↓
Serveur Legitrack (TCP/IP — impression, synchronisation)
```

### Structure du projet

```
LegitrackCoreNet — Pandore/
├── LegitrackCore/                 ← Framework partagé (bibliothèque interne)
│   ├── CoreNetClasses/
│   │   ├── clsServer.vb           ← Serveur de communication
│   │   ├── clsHttpManager.vb      ← Gestion HTTP
│   │   ├── clsIniServer.vb        ← Lecture/écriture INI
│   │   ├── clsLogs.vb             ← Journalisation
│   │   └── clsNotifyIcon.vb       ← Icône de notification
│   ├── CoreNetForms/              ← Formulaires réutilisables (login, server, settings…)
│   └── CoreNetModules/            ← Modules globaux (constantes, GUID, réseau, logs)
│
└── Application/                   ← Code spécifique Pandore
    ├── ApplicationClasses/
    │   ├── clsApplication.vb      ← Singleton : contexte global (user, prefs, params)
    │   ├── clsIni.vb              ← Accès INI applicatif
    │   ├── clsTCPClient.vb        ← Communication TCP avec le serveur
    │   ├── clsUser.vb             ← Modèle utilisateur + préférences
    │   ├── clsDepot.vb            ← Données de dépôt/emplacement
    │   ├── clsProduit.vb          ← Données produit
    │   ├── clsPreferences.vb      ← Préférences typées (overlay user > defaults)
    │   ├── clsCsv.vb              ← Export CSV
    │   ├── Database.vb            ← Accès SQL Server (dbPandore)
    │   └── Inventaire.vb          ← Logique métier inventaire
    │
    ├── ApplicationForms/          ← Formulaires métier Pandore
    │   ├── frmAppLogin.vb         ← Authentification
    │   ├── Clavis/                ← Module gestion numéros de série
    │   ├── Pandore/               ← Module inventaire principal
    │   │   ├── frmGestionInventaire.vb    ← Création/suppression/renommage
    │   │   ├── frmDetailsInventaire.vb   ← Contenu d'un inventaire
    │   │   ├── frmViews.vb               ← Vues configurables
    │   │   ├── frmFiltres.vb             ← Filtrage des produits
    │   │   ├── frmExport.vb              ← Export des données
    │   │   ├── frmPrintLabel.vb          ← Impression d'étiquettes
    │   │   └── frmLogs.vb                ← Consultation des logs
    │   ├── VerifStock/            ← Module vérification de stock
    │   └── Options/               ← Configuration applicative
    │
    └── ApplicationModules/
        ├── modStart.vb            ← Démarrage, initialisation
        ├── SageReferences.vb      ← Références partagées avec Sage (ERP)
        └── PreferenceKeys.vb      ← Constantes des clés de préférences
```

**Patterns utilisés :**
- **Singleton** : `clsApplication.Instance` fournit un point d'accès unique au contexte (utilisateur, préférences, paramètres de session)
- **Layered Architecture** : séparation Forms (UI) / Classes (logique métier) / Database (accès données)
- **Repository implicite** : `Database.vb` centralise l'accès SQL Server
- **Module VB.NET** : les modules (`modStart`, `SageReferences`…) servent de namespaces fonctionnels pour les procédures utilitaires

---

## 4. Fonctionnalités principales

### Gestion des inventaires
- **Créer un inventaire** : insertion en base (`INSERT INTO INVENT`), récupération du `NumInventaire` auto-incrémenté, enregistrement dans le fichier INI (`pandoreIni.PutString("Inventaires", nom & "-" & num, "1")`)
- **Lister les inventaires** : requête SQL `SELECT NumInventaire, Description FROM INVENT ORDER BY NumInventaire DESC`, affichage dans un `ListView`
- **Renommer un inventaire** : `UPDATE INVENT SET Description = ... WHERE NumInventaire = ...`
- **Supprimer un inventaire** : `DELETE FROM INVENT WHERE NumInventaire = ...` avec confirmation utilisateur et nettoyage du fichier INI

### Saisie et visualisation des produits
- Interface de scan de produits par inventaire (liaison avec les données Sage via ODBC)
- Vues configurables (`frmViews`) pour afficher les données selon les besoins de l'opérateur
- Filtrage par famille, référence, emplacement (`frmFiltres`)

### Module Clavis — Numéros de série
- Gestion des identifiants uniques (numéros de série) des produits
- Modification des numéros de série existants (`frmClavisModifySerial`)
- Visualisation des données Clavis

### Export et impression
- Export des données d'inventaire au format CSV (`clsCsv`)
- Impression d'étiquettes produits via le serveur d'impression Legitrack (`frmPrintLabel`)

### Authentification et préférences
- Connexion utilisateur (`frmAppLogin`) avec chargement des préférences personnalisées
- Système de préférences en deux niveaux : valeurs par défaut (INI global) et surcharges utilisateur (INI personnel), accessibles via `GetPref<T>()` et `SetPref<T>()`

---

## 5. Points techniques remarquables

### 1. Singleton de contexte applicatif
`clsApplication.Instance` est un singleton thread-safe implémenté en VB.NET. Il centralise :
- L'utilisateur connecté (`CurrentUser`)
- Les paramètres de session (dictionnaire clé/valeur)
- Les préférences typées (méthode générique `GetPref(Of T)()` avec fallback sur les valeurs par défaut)

### 2. Système de préférences à deux niveaux
La classe `clsPreferences` implémente un système d'overlay : les préférences globales (depuis l'INI applicatif) constituent les valeurs par défaut, et les préférences utilisateur (INI personnel) les surchargent. La méthode `Get(Of T)()` avec typage générique retourne la bonne valeur sans cast explicite dans le code appelant.

### 3. Accès base de données avec `Using`
Le code utilise le pattern `Using r As SqlDataReader = dbPandore.doCommandReader(sql)` pour garantir la fermeture des connexions même en cas d'exception (équivalent VB.NET du try-with-resources Java).

### 4. Interface ListView optimisée
Les listes utilisent `lvInventaire.BeginUpdate()` / `EndUpdate()` pour regrouper toutes les modifications d'affichage en une seule passe, évitant les scintillements sur des terminaux aux ressources limitées.

### 5. Double source de données (SQL Server + ODBC/Sage)
L'application accède simultanément à sa propre base SQL Server (données d'inventaire) et à la base Sage via ODBC (données articles). Cela permet de comparer les quantités inventoriées avec celles de l'ERP sans copier les données Sage.

---

## 6. Difficultés rencontrées et solutions

### Injection SQL partielle
Dans `frmGestionInventaire`, les requêtes SQL sont construites par concaténation de chaînes avec protection minimale (`.Replace("'", "''")` pour l'échappement). Ce n'est pas l'approche la plus sécurisée — des requêtes paramétrées (`SqlCommand` avec `Parameters.Add`) seraient préférables.

### Gestion d'erreurs systématique
Toutes les méthodes utilisent des blocs `Try/Catch` avec journalisation (`oUserLog.AddToLog()`), ce qui facilite le débogage sur des terminaux distants où l'accès physique est difficile.

---

## 7. Pistes d'amélioration

- **Requêtes paramétrées** : remplacer les concaténations SQL par des `SqlCommand` avec `Parameters.Add()` pour éliminer les risques d'injection SQL
- **Migrer vers .NET Framework 4.8 ou .NET 6+** pour bénéficier des améliorations de performance et de sécurité
- **Tests unitaires** : la logique de `clsApplication`, `clsPreferences` et `Inventaire.vb` pourrait être testée indépendamment de l'UI
- **Synchronisation offline** : ajouter un mode de fonctionnement déconnecté avec synchronisation différée pour les zones sans réseau Wi-Fi
- **Interface tactile améliorée** : agrandir les contrôles et espacements pour faciliter l'utilisation avec des gants en environnement froid ou industriel

---

*Fiche générée le 2026-04-23 — basée sur lecture directe des sources*
