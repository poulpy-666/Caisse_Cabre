# 🎟️ Caisse Billetterie

Application web simple et intuitive destinée à la gestion et à la clôture des caisses d'une billetterie associative.

L'objectif est de permettre aux bénévoles de saisir rapidement les éléments d'une caisse, de contrôler les différents moyens de paiement et d'obtenir automatiquement une synthèse comptable.

---

## 🚀 Version actuelle

**V1.5.0 — Version figée**

Cette version constitue la base stable du projet avant l'ajout du système de sauvegarde et d'historique.

---

## ✨ Fonctionnalités

### 🟢 Ouverture de caisse

- Nom de la manifestation
- Date
- Saisie du fond de caisse
- Comptage par billet et pièce
- Calcul automatique du fond de caisse initial

### 🎟️ Billetterie

Tarifs actuellement configurés :

| Tarif | Prix |
|---|---:|
| Tarif plein | 20 € |
| Moins de 12 ans | 12 € |
| Moins de 3 ans | 0 € |
| Invitation | 0 € |
| PMR | 20 € |

Le nombre de billets vendus est saisi pour chaque catégorie.

L'application calcule automatiquement le :

**CA billetterie**

---

## 💶 Gestion des espèces

Lors de la fermeture, le bénévole saisit le nombre de billets et pièces présents dans la caisse.

Coupures disponibles :

### Billets

- 50 €
- 20 €
- 10 €
- 5 €

### Pièces

- 2 €
- 1 €
- 0,50 €
- 0,20 €
- 0,10 €
- 0,05 €
- 0,02 €
- 0,01 €

L'application calcule automatiquement :

- Somme billets
- Somme monnaie
- Somme totale espèces
- Espèces issues des ventes
- Différence avec le fond de caisse initial

---

## 💳 Moyens de paiement

Les différents moyens de paiement sont séparés afin de faciliter le rapprochement avec les données de la billetterie.

### Moyens disponibles

- CB Guichet — TPE
- CB Web
- Chèques
- Chèques-Vacances ANCV
- Chèques-Vacances Connect
- Autre

Les moyens de paiement peuvent être validés avant la clôture afin d'éviter les modifications accidentelles.

---

## 🎫 Chèques-Vacances ANCV

Les chèques-vacances ANCV peuvent être comptabilisés par valeur.

Valeurs disponibles :

- 10 €
- 20 €
- 25 €
- 50 €

Le total ANCV est calculé automatiquement.

---

# 🔀 Paiements multiples

Cette fonctionnalité permet de gérer une vente réglée avec plusieurs moyens de paiement.

### Exemple

Une vente de **40 €** peut être réglée :

- 20 € en espèces
- 20 € en ANCV

Le paiement multiple doit être **validé** avant d'être intégré aux calculs.

L'application vérifie automatiquement que :

> Montant de la transaction = somme des moyens de paiement

Exemple :

```text
Transaction       40,00 €

Espèces           20,00 €
ANCV              20,00 €

Total réparti     40,00 €

✓ Répartition correcte