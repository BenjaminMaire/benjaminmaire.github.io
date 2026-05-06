# Index des fiches techniques — E5 BTS SIO

> Auteur : MAIRE Benjamin  
> Généré le : 2026-04-23

---

## Fiches disponibles

| Projet | Fichier | Type | Technologie principale |
|---|---|---|---|
| **Evenix** (backend + frontend web) | [fiche_technique_evenix.md](fiche_technique_evenix.md) | Web full-stack | Spring Boot 3.4.5 + React 18 + TypeScript |
| **EvenixMobile** (application mobile) | [fiche_technique_evenixmobile.md](fiche_technique_evenixmobile.md) | Android / iOS | React Native (Expo) + JavaScript |
| **BarcoTag** (scan GS1 → RFID) | [fiche_technique_barcotag.md](fiche_technique_barcotag.md) | Android natif | Java — encodage EPC SGTIN-198 + RFID UHF |
| **Pandore** (gestion d'inventaire) | [fiche_technique_pandore.md](fiche_technique_pandore.md) | Windows bureau | VB.NET + .NET 4.0 + SQL Server |
| **Socaphi** (WMS picking) | [fiche_technique_socaphi.md](fiche_technique_socaphi.md) | Windows bureau | VB.NET + .NET 4.0 + SQL Server + ODBC Sage |
| **Safran GONOGO** (contrôle industriel) | [fiche_technique_safran.md](fiche_technique_safran.md) | Android natif | Java Android + parsing CSV (APK uniquement) |

---

## Récapitulatif des technologies par projet

```
evenix          : Java 17, Spring Boot 3, Spring Security, JWT, JPA/Hibernate,
                  MySQL, Lombok, Swagger/OpenAPI, React 18, TypeScript, Vite,
                  React Router, Axios, Tailwind CSS, Supabase

evenixmobile    : React Native 0.81, Expo 54, React Navigation, AsyncStorage,
                  DateTimePicker, JavaScript ES6+, Fetch API

barcotag        : Java 1.8, Android SDK 32, AndroidX, Material Design,
                  DeviceAPI (AAR propriétaire Barcodis), RFID UHF (RSCJA)

pandore         : VB.NET, .NET 4.0, Windows Forms, SQL Server (ADO.NET),
                  ODBC (Sage), TCP/IP, INI, LegitrackCore v1.0.4

socaphi         : VB.NET, .NET 4.0, Windows Forms, SQL Server (ADO.NET),
                  ODBC (Sage), EAN-128 GS1, SSCC, TCP/IP, INI, LegitrackCore v1.0.5

safran          : Java Android (déduit), CSV/TXT parsing, Android SDK (déduit)
                  [source non disponible — APK uniquement]
```
