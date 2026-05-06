# Fiche Technique — BarcoTag (Application Android Java)

> Client : Barcodis  
> Contexte : Environnement industriel — Scan GS1 + Écriture RFID UHF

---

## 1. Présentation du projet

**Nom :** BarcoTag  
**Package :** `com.barcodis.BarcoTag`  
**Type :** Application Android native (Java)  
**Contexte :** Développée pour Barcodis dans le cadre d'un contexte industriel. L'application tourne sur un terminal Android dédié équipé d'un lecteur RFID UHF et d'un scanner de codes-barres intégré (hardware trigger).

**Objectif fonctionnel :**  
BarcoTag résout un problème d'identification industrielle : à partir d'un code-barres GS1 scanné sur un produit (DataMatrix, Code128, EAN), l'application encode les informations (GTIN + numéro de série) au format standard EPC SGTIN-198 et écrit ce code dans une puce RFID UHF. Elle permet aussi de lire le contenu d'une puce RFID existante.

**Public cible :**
- Opérateurs en entrepôt ou en ligne de production chez des clients de Barcodis
- Techniciens chargés de l'initialisation de puces RFID sur des produits

---

## 2. Choix techniques justifiés

| Technologie | Version | Justification du choix |
|---|---|---|
| Android Java | Java 1.8 (API 30+) | Java est le langage historique d'Android, parfaitement supporté par l'ensemble des SDK constructeurs de terminaux industriels (Zebra, Honeywell, Rida…). Permet d'utiliser le SDK propriétaire du fabricant du terminal. |
| Android SDK | compileSdk 32, minSdk 30 | Cible les terminaux industriels récents (Android 11+). Le SDK 32 apporte les permissions de lecture de fichiers modernisées et la stabilité nécessaire à un usage en production. |
| AndroidX AppCompat | 1.4.1 | Assure la compatibilité des composants UI sur les différentes versions d'Android. Standard pour tout projet Android moderne. |
| Material Design | 1.9.0 | Composants UI cohérents avec les standards Google (boutons, dialogues, thèmes). Facilite la lisibilité sur des terminaux portés en environnement industriel (lumière variable). |
| ConstraintLayout | 2.1.3 | Positionnement des vues en XML sans imbrications complexes. Adapté aux interfaces simples et efficaces des terminaux industriels. |
| DeviceAPI (Barcodis AAR) | 20220323 | Bibliothèque propriétaire Barcodis (`DeviceAPI_ver20220323_release.aar`) encapsulant les fonctions bas niveau du lecteur RFID UHF du terminal. Fournit les méthodes `readData()`, `writeData()`, `init()`, `free()`. |
| AndroidX Preference | 1.2.1 | Écran de paramètres standard Android (`PreferenceFragment`) pour configurer la longueur du Company Prefix GS1 et la valeur EPC Filter, sans développer d'UI spécifique. |

---

## 3. Architecture technique

### Vue d'ensemble
```
Scanner (hardware trigger → champ caché)
    ↓ Code-barres brut (GS1 DataMatrix / Code128)
MainActivity
    ↓ Normalisation + parsing GS1
Gs1 + Gtin (parsing)
    ↓ GTIN + numéro de série extraits
SgtinEncoder
    ↓ EPC SGTIN-198 (binaire → hexadécimal)
EcritureRFIDActivity
    ↕ DeviceAPI (AAR propriétaire)
Puce RFID UHF (banque EPC)
```

### Activités et leur rôle

| Activité | Rôle |
|---|---|
| `MainActivity` | Reçoit les scans, parse le GS1, propose l'écriture RFID |
| `EcritureRFIDActivity` | Encode en SGTIN-198, contrôle l'unicité de la puce, écrit et vérifie |
| `LectureRFIDActivity` | Lit le contenu EPC d'une puce RFID existante |
| `SettingsActivity` | Paramètres : Company Prefix Length, Filter Value |

### Classes utilitaires

```
utility/
├── AsciiConverter.java    ← char → 7 bits ASCII (pour encodage SGTIN-198)
├── BinaryConverter.java   ← entier → chaîne binaire (avec taille imposée)
├── HexConverter.java      ← binaire → hexadécimal
├── Gs1Utility.java        ← fonctions GS1 génériques
├── Partition.java         ← calcul de la partition EPC (CP bits / IR bits)
├── Dialogs.java           ← boîtes de dialogue uniformes (erreur, confirmation)
└── Logs.java              ← système de journalisation interne

gs1/
├── Gs1.java               ← parsing d'une chaîne GS1 parenthésée
└── Gtin.java              ← décomposition du GTIN (indicator, CP, itemRef)

sgtin/
├── SgtinEncoder.java      ← encodage GTIN+série → EPC SGTIN-198 (URI, binaire, hex)
└── SgtinDecoder.java      ← décodage inverse (lecture d'une puce)
```

**Patterns utilisés :**
- **Separation of Concerns** : parsing GS1, conversion binaire/hex et écriture RFID sont dans des classes distinctes
- **Value Object** : `Gs1` et `Gtin` encapsulent les données et leur logique de décomposition
- **Single Responsibility** : chaque classe utilitaire a une responsabilité unique (conversion ASCII, hex, partition…)

---

## 4. Fonctionnalités principales

### 1. Scan et normalisation d'un code-barres GS1
Un champ `EditText` invisible (`edtHiddenScan`) reçoit les caractères envoyés par le scanner hardware quand l'opérateur appuie sur la gâchette. Le code :
- Détecte la gâchette via `onKeyDown()` (keycodes 139, 280, 293 selon le modèle de terminal)
- Supprime les préfixes de symbologie (ex : `]d2` pour GS1 DataMatrix)
- Remplace le séparateur ASCII 29 (GS = Group Separator) entre les AIs (Application Identifiers)
- Convertit le flux brut au format parenthésé `(01)12345678901234(21)ABC`

### 2. Validation GS1
Avant tout traitement, l'application vérifie :
- Absence de caractères inattendus (`SAFE_CHARS_REGEX`)
- Présence d'un AI `(01)` (GTIN) obligatoire
- Longueur minimale cohérente
Un anti-rebond de 250ms évite le double-traitement d'un même scan.

### 3. Encodage SGTIN-198
`SgtinEncoder` implémente la norme EPC SGTIN-198 :
- **Header** (8 bits) : `0x36` = `00110110` (identifiant du schéma SGTIN-198)
- **Filter** (3 bits) : classe d'objet configurable (0-7)
- **Partition** (3 bits) : déterminé par la longueur du Company Prefix (table normative)
- **Company Prefix** (CPbits) : partie GS1 du GTIN en binaire
- **Item Reference** (IRbits) : indicateur + référence article en binaire
- **Serial** (140 bits) : numéro de série en ASCII 7 bits concaténés, paddé à droite
- **Résultat** : 52 caractères hexadécimaux (208 bits) prêts à écrire sur la puce

### 4. Écriture sécurisée sur puce RFID
`EcritureRFIDActivity` implémente un protocole d'écriture en plusieurs étapes :
1. Vérification d'unicité de la puce : 10 lectures du TID (identifiant unique du chip) pour confirmer qu'une seule puce est dans le champ du lecteur
2. 6 lectures EPC successives pour confirmer l'EPC actuel
3. Validation stricte de l'EPC généré (longueur 52 hex, header `36`)
4. Écriture dans la banque EPC (mots 2 à 14, 13 mots × 16 bits = 208 bits)
5. Relecture post-écriture et comparaison avec la valeur attendue

### 5. Lecture RFID
`LectureRFIDActivity` lit et affiche l'EPC présent sur une puce, permettant la vérification.

### 6. Paramètres persistants
`SettingsActivity` utilise un `PreferenceFragment` Android standard pour configurer la longueur du Company Prefix GS1 (6 à 12 chiffres, valeur par défaut 7) et la valeur EPC Filter. Ces paramètres sont lus depuis `SharedPreferences` au démarrage.

---

## 5. Points techniques remarquables

### 1. Implémentation manuelle du standard EPC SGTIN-198
L'encodage SGTIN-198 est entièrement implémenté sans bibliothèque externe : conversion décimale → binaire sur N bits, encodage ASCII 7 bits du numéro de série, padding précis et construction bit-à-bit de la trame. Cela démontre une compréhension approfondie des standards GS1/EPC.

### 2. Robustesse de l'écriture RFID
Le protocole d'écriture comporte plusieurs filets de sécurité imbriqués pour éviter d'écrire le mauvais identifiant sur la mauvaise puce :
- Détection multi-puces par lecture répétée du TID
- Confirmation de l'EPC courant avant écriture
- Vérification post-écriture par relecture
- Délai anti-rebond sur la gâchette (400ms)

### 3. Gestion du séparateur GS (ASCII 29)
Le standard GS1 utilise le caractère ASCII 29 (Group Separator) pour délimiter les AIs à longueur variable. Ce caractère invisible est correctement détecté et traité dans la conversion du flux brut vers le format parenthésé.

### 4. Anti-rebond hardware
Les terminaux industriels peuvent envoyer plusieurs événements `onKeyDown` lors d'un seul appui sur la gâchette. Un système de timestamp (`lastScanTs`, `lastTriggerTs`) avec délai minimum (250ms, 400ms) évite les doubles traitements.

### 5. Classe `MyApp` (Application Android)
La classe `MyApp` (extension d'`Application`) initialise un logger et les paramètres globaux au démarrage de l'application. Cela suit le pattern Android recommandé pour l'état partagé entre activités.

---

## 6. Difficultés rencontrées et solutions

### Encodage précis du SGTIN-198
La norme EPC SGTIN-198 impose des tailles de champs en bits qui varient selon la longueur du Company Prefix GS1 (table de partition). Implémentation correcte via la classe `Partition` qui calcule les bits alloués au CP et à l'IR selon la norme GS1.

### Fiabilité de lecture RFID en environnement industriel
Dans un entrepôt, plusieurs puces peuvent être dans le champ du lecteur simultanément. La solution adoptée (10 lectures + vérification de l'unicité du TID) protège contre les écritures accidentelles sur la mauvaise puce.

### Champ de scan invisible
Pour utiliser le scanner hardware sans afficher de clavier virtuel, un `EditText` invisible avec `setShowSoftInputOnFocus(false)` et `setCursorVisible(false)` reçoit le flux du scanner. La gâchette redirige le focus vers ce champ avant le scan.

---

## 7. Pistes d'amélioration

- **Migrer vers Kotlin** : le langage moderne d'Android offre la null-safety, les coroutines et une syntaxe plus concise
- **Implémenter le décodeur SGTIN-198** (`SgtinDecoder.java` est présent mais son implémentation est non déterminable depuis le code disponible)
- **Journalisation persistante** : exporter les logs dans un fichier pour le support terrain
- **Mode hors-ligne avec synchronisation** : si un serveur central est ajouté au système, prévoir un mode de fonctionnement offline
- **Tests unitaires** : les classes `SgtinEncoder`, `Gs1`, `Partition` sont des candidats idéaux pour des tests automatisés (logique algorithmique pure sans dépendance Android)

---

*Fiche générée le 2026-04-23 — basée sur lecture directe des sources*
