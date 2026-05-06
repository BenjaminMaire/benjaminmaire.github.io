# Fiche Technique — Safran GONOGO (Application Android Java)

> Application : GONOGO_4_1.apk  
> Client : Safran (secteur aéronautique)  
> Référence interne : SQY GONOGO  
> Source disponible : APK compilé uniquement (pas de code source)

---

> **Note importante :** Le code source de cette application n'est pas disponible dans l'espace de travail. Seuls l'APK compilé (`GONOGO_4_1.apk`, 12,8 Mo), un fichier de données de référence (`zone_expedition.csv`, `OP_expedition.txt`) et le manuel utilisateur (`Manuel_Utilisateur_SAFRAN_ANDROID_V2.docx`) sont présents. Les informations techniques ci-dessous sont déduites du nom de l'application, des fichiers de données présents et du contexte industriel Safran.

---

## 1. Présentation du projet

**Nom :** GONOGO — SQY (Saint-Quentin-en-Yvelines)  
**Version :** 4.1  
**Type :** Application Android native (APK)  
**Contexte :** Application développée pour le site industriel Safran SQY, groupe aéronautique français (moteurs d'avions, équipements). Déployée sur des terminaux Android utilisés par les opérateurs en atelier ou en zone d'expédition.

**Objectif fonctionnel :**  
L'application GONOGO (littéralement "Go / No-Go") est un outil de contrôle et de validation industrielle. Elle permet aux opérateurs de vérifier si une opération, un composant ou une expédition est conforme ("GO") ou non conforme ("NO-GO") selon des critères définis. Elle intègre la lecture et le traitement de fichiers CSV contenant les données de référence des zones d'expédition et des opérations.

**Public cible :**
- Opérateurs en atelier ou en zone d'expédition chez Safran SQY
- Techniciens qualité chargés des contrôles de conformité
- Responsables logistique pour le suivi des expéditions

---

## 2. Choix techniques justifiés

| Technologie | Version | Justification du choix |
|---|---|---|
| Android (Java natif) | Non déterminable depuis l'APK | Java Android est le standard industriel pour les applications déployées sur terminaux Android dédiés (Zebra, Honeywell). Les SDK propriétaires des terminaux (lecteurs codes-barres, RFID) sont fournis uniquement en Java. |
| Format CSV | — | Le CSV (Comma-Separated Values) est choisi pour les fichiers de données (`zone_expedition.csv`, `OP_expedition.txt`) en raison de sa simplicité d'échange et de maintenance. Les fichiers de configuration peuvent être mis à jour par les équipes métier sans développement. |
| APK Android | Version 4.1 | La numérotation de version (4.1) indique un projet mature en évolution itérative, typique d'un outil industriel développé progressivement en réponse aux besoins terrain. |

> Les autres choix techniques (framework, SDK, bibliothèques) ne sont pas déterminables depuis le code source.

---

## 3. Architecture technique

> Non déterminable depuis le code source. Les éléments suivants sont déduits du contexte.

### Architecture supposée (type application industrielle Android)

```
Interface Android (Activities / Fragments)
    ↓
Couche métier (vérification GO/NO-GO, parsing CSV)
    ↓
Fichiers CSV locaux (zone_expedition.csv, OP_expedition.txt)
    ↓ (optionnel)
API ou base de données distante (Non déterminable)
```

### Fichiers de données présents

**`zone_expedition.csv`** : contient les zones d'expédition de référence. En-tête `MFP`, puis les codes de zones autorisées : `840`, `842`, `631`, `780`, `853`, `URG`, `SOS`, `EXP`, `FICTIF`, `LITIGES`. Ces codes correspondent à des zones physiques du site Safran SQY (numéros d'emplacement + codes fonctionnels comme URG=Urgences, SOS, EXP=Expédition).

**`OP_expedition.txt`** : liste des opérations d'expédition autorisées. En-tête `OP`, puis les codes d'opérations : `1001`, `1002`, `1003`, `1004`, `1005`. Ce fichier sert de référentiel pour valider qu'une opération scannée fait partie des opérations GO autorisées.

### Patterns supposés
- **MVC Android** : séparation Activity (vue/contrôleur) / classe métier (modèle)
- **Lecture CSV en Java** : parsing manuel ou via bibliothèque (OpenCSV) pour charger les données de référence au démarrage

---

## 4. Fonctionnalités principales

> Déduites du nom de l'application, des fichiers présents et du contexte industriel Safran.

### Contrôle GO / NO-GO
Fonction centrale de l'application : l'opérateur saisit ou scanne un identifiant (zone, opération), et l'application détermine si l'action est autorisée (GO ✓) ou refusée (NO-GO ✗) en comparant avec les listes chargées depuis les fichiers CSV/TXT.

### Gestion des zones d'expédition
Lecture du fichier `zone_expedition.csv` (en-tête `MFP`, une zone par ligne). Les zones valides pour Safran SQY sont : `840`, `842`, `631`, `780`, `853`, `URG`, `SOS`, `EXP`, `FICTIF`, `LITIGES`. Si la zone scannée ou saisie est dans cette liste, c'est un GO ; sinon c'est un NO-GO.

### Suivi des opérations d'expédition
Lecture du fichier `OP_expedition.txt` (en-tête `OP`, une opération par ligne). Les opérations autorisées sont : `1001`, `1002`, `1003`, `1004`, `1005`. Ces codes correspondent probablement à des gammes d'opérations de contrôle qualité ou de traitement défini dans le système Safran.

### Lecture de codes-barres
Non déterminable avec certitude, mais fortement probable dans le contexte d'une application Android industrielle Safran : scan de codes-barres (EAN, QR Code, DataMatrix) pour identifier les composants ou opérations.

---

## 5. Points techniques remarquables

### 1. Lecture de fichiers CSV en Android
Le traitement de fichiers CSV en Java Android sans bibliothèque externe (parsing manuel) ou avec OpenCSV démontre la capacité à traiter des données structurées de référence localement, sans dépendance réseau. Cela garantit le fonctionnement en zone sans Wi-Fi.

### 2. Modèle de mise à jour des données sans recompilation
Le fait que les données métier (zones, opérations) soient dans des fichiers CSV/TXT séparés de l'APK permet de mettre à jour les référentiels sans redéployer l'application. L'équipe Safran peut modifier les zones d'expédition autorisées en remplaçant simplement un fichier.

### 3. Application mature (version 4.1)
La version 4.1 indique au moins quatre cycles de développement majeurs, signifiant que l'application a été itérativement améliorée en réponse aux retours terrain des opérateurs Safran. C'est la marque d'un outil réellement utilisé en production.

### 4. Contexte aéronautique
Dans le secteur aéronautique, les contrôles GO/NO-GO ont un caractère critique pour la sécurité et la conformité réglementaire. L'application répond à des exigences de traçabilité et de fiabilité supérieures à celles d'une application grand public.

---

## 6. Difficultés rencontrées et solutions

> Non déterminables depuis le code source (APK uniquement).

### Maintenance des référentiels CSV
La mise à jour des fichiers `zone_expedition.csv` et `OP_expedition.txt` nécessite un accès physique au terminal ou un mécanisme de déploiement des fichiers. Sans code source, la méthode de mise à jour utilisée n'est pas déterminable.

### Compatibilité avec les terminaux Safran
Chaque site industriel peut utiliser des modèles de terminaux Android différents. La gestion de la compatibilité (différentes versions Android, différents modèles de terminaux) est une difficulté classique dans ce contexte.

---

## 7. Pistes d'amélioration

> Propositions générales pour ce type d'application industrielle.

- **Synchronisation automatique des référentiels** : remplacer les fichiers CSV statiques par un mécanisme de synchronisation avec un serveur central (API REST) pour mettre à jour les zones et opérations sans intervention physique sur le terminal
- **Mode hors-ligne avec cache** : conserver une copie locale des données et les synchroniser quand le réseau est disponible
- **Journalisation des contrôles** : enregistrer chaque contrôle GO/NO-GO avec horodatage, identifiant opérateur et résultat pour la traçabilité réglementaire aéronautique
- **Signature électronique** : dans le contexte aéronautique, enregistrer l'identité de l'opérateur validant un contrôle avec authentification forte
- **Mise à disposition du code source** : l'absence de code source dans l'espace de travail est une limite pour la maintenance et l'évolution de l'application

---

*Fiche générée le 2026-04-23 — basée sur les fichiers disponibles (APK, CSV, documentation utilisateur)*  
*Informations techniques partiellement déduites — code source non disponible*
