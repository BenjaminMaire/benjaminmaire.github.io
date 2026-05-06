# Fiche Technique — Socaphi (Application VB.NET — Gestion d'entrepôt / WMS)

> Solution : Socaphi  
> Fichier solution : `Socaphi.sln`  
> Client : Socaphi  
> Contexte : Application métier Windows de type WMS (Warehouse Management System)

---

## 1. Présentation du projet

**Nom :** Socaphi  
**Type :** Application Windows Forms (bureau) — WMS (Warehouse Management System)  
**Langage :** VB.NET  
**Framework :** .NET 4.0 Client Profile  
**Contexte :** Développé dans le cadre du BTS SIO pour le client Socaphi. C'est une application de gestion d'entrepôt déployée sur des terminaux mobiles Windows (Zebra, Honeywell). Elle s'interface avec le logiciel Sage (ERP) via ODBC et communique avec un serveur central Legitrack via TCP/IP pour l'impression d'étiquettes SSCC (code palette GS1).

**Objectif fonctionnel :**  
Socaphi gère le processus complet de préparation de commandes (picking) et d'expédition en entrepôt. L'opérateur scanne les codes-barres EAN-128 des colis, l'application vérifie les produits par rapport aux commandes Sage, gère les palettes, génère des codes SSCC et déclenche l'impression d'étiquettes. Elle assure également la traçabilité complète des mouvements de marchandises.

**Public cible :**
- Opérateurs picking en entrepôt
- Responsables d'expédition
- Administrateurs WMS configurant les terminaux

---

## 2. Choix techniques justifiés

| Technologie | Version | Justification du choix |
|---|---|---|
| VB.NET | — | Même choix que Pandore : intégration native Microsoft, compatibilité avec les terminaux Windows industriels, et cohérence avec la base de code existante Legitrack. Facilite la maintenance par une seule équipe pour toutes les applications de la gamme. |
| .NET Framework | 4.0 (Client Profile) | Profil allégé pour terminaux embarqués. Version stable et largement déployée sur les parcs de terminaux Zebra/Honeywell utilisés par Socaphi. |
| Windows Forms | — | Interface graphique adaptée aux terminaux tactiles industriels, avec gestion des événements clavier (scan) et souris (tactile). |
| ODBC (OdbcDataReader) | — | Accès aux données Sage (ERP client) via le connecteur ODBC standard. Permet de lire les commandes, produits, clients sans modifier le schéma Sage. |
| SQL Server (clsSQL) | — | Base de données propriétaire Legitrack pour le stockage des données de picking, traçabilité, SSCC. Accédée via `System.Data.SqlClient`. |
| EAN-128 / GS1 (clsCAB) | — | Décodage manuel des codes EAN-128 : extraction des Application Identifiers (01, 10, 15, 17, 21, 37…) à partir du code-barres scanné. Permet d'identifier automatiquement produit, lot, DLUO, quantité depuis un seul scan. |
| TCP/IP (clsServer, LegitrackCore) | — | Communication avec le serveur Legitrack central pour les opérations d'impression d'étiquettes SSCC sur imprimantes réseau (Zebra ZPL). |
| INI (clsIni) | — | Configuration par fichiers INI : paramètres de picking (vérification DLUO, modes autonome, SSCC), paramètres d'impression, URL serveur… Modifiable sans recompiler l'application. |
| SSCC GS1 | — | Génération de codes SSCC (Serial Shipping Container Code, 18 chiffres GS1) pour identifier de façon unique chaque palette préparée. Implémenté dans `modTracabilite.vb`. |
| LegitrackCore (framework interne) | 1.0.5 | Bibliothèque commune à toutes les applications Legitrack. Fournit les briques transversales pour ne pas réimplémenter les fonctions communes. |

---

## 3. Architecture technique

### Vue d'ensemble
```
Terminal mobile Windows Forms (Socaphi)
    ↕ ODBC                    ↕ SQL Server (ADO.NET)
Base Sage (ERP)           Base Legitrack (WMS)
    ↕ TCP/IP
Serveur Legitrack (impression SSCC, synchronisation)
    ↕ ZPL / TCP
Imprimante étiquettes Zebra
```

### Structure du projet

```
Socaphi/
├── LegitrackCore/                 ← Framework partagé (identique à Pandore v1.0.5)
│
└── Application/
    ├── ApplicationClasses/
    │   ├── ApplicationData/       ← Modèles métier
    │   │   ├── clsCommand.vb      ← Commande client
    │   │   ├── clsLineCommand.vb  ← Ligne de commande
    │   │   ├── clsProduct.vb      ← Produit (EAN, lot, DLUO, poids…)
    │   │   ├── clsPalett.vb       ← Palette en cours de préparation
    │   │   ├── clsPicking.vb      ← Session de picking (commande + colis scannés)
    │   │   ├── clsPickingLine.vb  ← Un colis scanné (produit, lot, quantité…)
    │   │   ├── clsClient.vb       ← Client (raison sociale, adresse…)
    │   │   └── clsTracabilite.vb  ← Tracabilité SSCC (palette source)
    │   ├── clsApplication.vb      ← Contexte session (paramètres volatils, variables impression)
    │   ├── clsIni.vb              ← Accès INI
    │   ├── clsCAB.vb              ← Décodage EAN-128 (Application Identifiers)
    │   ├── classDatabase.vb       ← Accès ODBC (Sage)
    │   └── classSQLDatabase.vb    ← Accès SQL Server (Legitrack)
    │
    ├── ApplicationForms/
    │   ├── frmAppLogin.vb         ← Authentification
    │   ├── frmAppMenu.vb          ← Menu principal
    │   ├── frmAppSelectCde.vb     ← Sélection d'une commande à préparer
    │   ├── frmAppSage.vb          ← Accès aux données Sage
    │   ├── frmAppDisplayInfo.vb   ← Affichage d'informations
    │   ├── Picking/
    │   │   ├── frmAppPickingMenu.vb          ← Menu picking
    │   │   ├── frmAppPickingProcess.vb       ← Processus principal de picking (scan)
    │   │   ├── frmAppPickingVisualisation.vb ← Vue des colis en cours
    │   │   ├── frmAppPickingMvtPalette.vb    ← Mouvement de palette
    │   │   ├── frmAppPickingManualAdd.vb     ← Saisie manuelle d'un colis
    │   │   └── frmAppSelectPaletteEnAttente.vb ← Reprise d'une palette en attente
    │   └── Expedition/
    │       └── frmAppExpeditionCreationCommande.vb ← Création de commande d'expédition
    │
    └── ApplicationModules/
        ├── GlobalAppVariable.vb   ← Variables globales de session
        ├── modDatabase.vb         ← Requêtes SQL Legitrack
        ├── modEvents.vb           ← Événements application
        ├── modExpediteur.vb       ← Gestion des expéditeurs
        ├── modGestionDesBlocages.vb ← Gestion des lots/palettes bloqués
        ├── modGestionUtilisateurs.vb ← Gestion utilisateurs
        ├── modImpression.vb       ← Sélection masques + déclenchement impression
        ├── modPicking.vb          ← Fonctions utilitaires picking
        ├── modTracabilite.vb      ← Génération SSCC, traçabilité
        ├── modTransporteur.vb     ← Gestion des transporteurs
        └── modStart.vb            ← Initialisation
```

**Patterns utilisés :**
- **Session State Pattern** : `clsApplication` (non singleton ici, instancié avec le login) stocke les paramètres volatils de la session (numéro de commande, SSCC courant, numéro de picking…) dans un dictionnaire
- **Dictionary-based event bus** : `listVarForProcessingPrintingLegitrack` (StringDictionary) sert de bus de données entre les modules pour préparer les variables d'impression
- **Layered Architecture** : Forms (UI) → Classes (métier) → Modules (accès données / impression)
- **Template Method** : `modImpression.SelectionMasqueImpressionPicking()` détermine le masque d'étiquette à utiliser selon le type de palette

---

## 4. Fonctionnalités principales

### Processus de picking (cœur de l'application)
Le flux complet de `frmAppPickingProcess` :

1. **Sélection de commande** : l'opérateur choisit une commande client (depuis Sage via ODBC)
2. **Scan EAN-128** : l'opérateur scanne le code-barres du colis. `clsCAB.DecompCodeBarre()` décode tous les AIs : AI(01) = GTIN produit, AI(10) = lot, AI(15)/(17) = DLUO/DLC, AI(37) = quantité
3. **Validation métier** :
   - Vérification que le produit est dans la commande
   - Contrôle de la DLUO (si lot trop proche de l'expiration, alerte ou blocage selon config INI)
   - Contrôle de quantité (alerte si quantité préparée > quantité commandée)
   - Gestion des lots bloqués par l'administrateur
4. **Ajout du colis** : enregistrement en base avec produit, lot, quantité, DLUO
5. **Validation palette** : génération du SSCC, impression de l'étiquette palette, enregistrement en traçabilité, mise à jour des commandes Sage

### Gestion des palettes en attente (MEA — Mise En Attente)
Une palette peut être mise "en attente" : un SSCC temporaire est généré, l'étiquette est imprimée, et la palette est suspendue. Elle peut être reprise ultérieurement par `frmAppSelectPaletteEnAttente`, qui restaure l'état complet (commande, colis scannés).

### Traçabilité SSCC
`modTracabilite.vb` gère la génération des codes SSCC (18 chiffres GS1 avec chiffre de contrôle) et l'enregistrement complet des mouvements en traçabilité : produit, lot, DLUO, quantité, type de palette (homogène/hétérogène), client, transporteur, expéditeur.

### Gestion des blocages
`modGestionDesBlocages.vb` vérifie si un lot ou une palette est bloqué dans la base Legitrack. Un lot bloqué déclenche un avertissement avec possibilité de passer en force (avec confirmation utilisateur).

### Saisie manuelle
Pour les colis dont le code-barres est illisible ou absent, `frmAppPickingManualAdd` permet la saisie manuelle du code produit, lot, quantité et DLUO.

### Module d'expédition
`frmAppExpeditionCreationCommande` gère la création de commandes d'expédition et l'association avec les transporteurs.

---

## 5. Points techniques remarquables

### 1. Décodage EAN-128 multi-AI
`clsCAB.DecompCodeBarre()` analyse le code-barres EAN-128 (aussi appelé GS1-128) en extrayant tous ses Application Identifiers. Ce format permet d'encoder plusieurs informations dans un seul code (produit + lot + DLUO + quantité). Le séparateur entre AIs est configurable via INI (`CarSepCbEan128`), s'adaptant aux différentes configurations de terminaux.

### 2. Génération SSCC GS1
Les codes SSCC (Serial Shipping Container Code) sont générés par `modTracabilite.CalculEtiq()` selon la norme GS1 : CNUF (Code National Unifié du Fabricant) + compteur séquentiel + chiffre de contrôle modulo 10. Le compteur peut être géré localement (INI) ou par le serveur central selon la configuration.

### 3. Processus d'impression découplé
L'impression d'étiquettes SSCC ne se fait pas directement depuis l'application. Les variables sont chargées dans `listVarForProcessingPrintingLegitrack`, puis transmises au serveur d'impression Legitrack via TCP/IP (`Ajout_SERVEUR_IMPRESSION_INDEX`). Ce découplage permet de changer d'imprimante ou de format d'étiquette sans recompiler l'application.

### 4. Configuration entièrement externalisée par INI
Plus de 30 paramètres de comportement sont configurables via INI sans recompilation : vérification DLUO, mode autonome, contrôle de commande UVC, liste de colisage, gestion des SSCC multiples, chemin des masques d'étiquettes... Cela permet de déployer la même application chez plusieurs clients avec des comportements différents.

### 5. Gestion des palettes hétérogènes et homogènes
L'application distingue automatiquement les palettes homogènes (un seul produit) des hétérogènes (plusieurs produits). Le masque d'étiquette SSCC est sélectionné différemment selon le type (`modImpression.SelectionMasqueImpressionPicking()`), ce qui impacte le contenu imprimé sur l'étiquette.

---

## 6. Difficultés rencontrées et solutions

### Synchronisation SSCC multi-colis
Lors d'un picking par SSCC (palette source complète), l'application gère le cas où plusieurs palettes correspondent à un même SSCC dans la traçabilité (`oTracabilite.UniqueSSCC`). Si plusieurs palettes matchent, une sélection est proposée à l'opérateur, et le code vérifie la cohérence (palette homogène, non bloquée, compatible avec la commande).

### Gestion des sessions interrompues
Si un opérateur quitte le picking sans valider, la palette en cours est détectable via `KEY_PICKING_WAITING_PALETT`. Au prochain démarrage du module, `ReprisePaletteEnAttente()` restaure l'état de la session.

### Variables impression partagées
Le module d'impression repose sur un `StringDictionary` partagé (`listVarForProcessingPrintingLegitrack`) passé entre modules. C'est une approche fonctionnelle mais fragile : le couplage implicite par noms de clés rend le débogage difficile si une clé est mal nommée.

---

## 7. Pistes d'amélioration

- **Remplacement du StringDictionary** par un objet fortement typé pour les variables d'impression (éliminer les erreurs de noms de clés)
- **Requêtes paramétrées** : certaines requêtes SQL sont construites par concaténation ; migrer vers des commandes paramétrées pour la sécurité
- **Migration .NET 6+** avec Windows Forms pour bénéficier des performances et des correctifs de sécurité
- **Tests unitaires** : `clsCAB.DecompCodeBarre()`, la génération SSCC et les contrôles DLUO sont candidats à des tests automatisés
- **Logging structuré** : remplacer les logs textuels libres par un format structuré (JSON) pour faciliter l'analyse à distance
- **Interface repensée** pour l'écran tactile : boutons plus grands, navigation simplifiée pour les opérateurs portant des gants

---

*Fiche générée le 2026-04-23 — basée sur lecture directe des sources*
