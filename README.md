# Katapult Web - Plateforme de Candidature

Application web pour la gestion des candidatures à l'incubateur Katapult dédié aux projets de l'Économie Sociale et Solidaire (ESS).

## Fonctionnalités

- Authentification complète (connexion, inscription, mot de passe oublié)
- Gestion de profil utilisateur
- Soumission et suivi de candidatures
- Back office administrateur pour la gestion des candidatures et des utilisateurs
- Tableau de bord avec statistiques pour les administrateurs
- Interface d'évaluation pour les évaluateurs

## Technologies utilisées

- React 18
- React Router v6
- Axios pour les requêtes API
- Formik et Yup pour la gestion des formulaires
- JWT pour l'authentification
- Chart.js pour les visualisations de données
- React Toastify pour les notifications

## Installation

1. Clonez ce dépôt :
```
git clone https://github.com/votre-organisation/katapult-web.git
cd katapult-web
```

2. Installez les dépendances :
```
npm install
```

3. Configurez les variables d'environnement :
Créez un fichier `.env` à la racine du projet et ajoutez :
```
REACT_APP_API_URL=https://katapult-api.vercel.app/api
```

4. Lancez l'application :
```
npm start
```

## Structure du projet

```
src/
├── assets/            # Images, polices et autres ressources
├── components/        # Composants réutilisables
├── context/           # Contextes React (authentification, etc.)
├── pages/             # Pages de l'application
│   ├── admin/         # Pages du back office administrateur
│   ├── candidatures/  # Pages de gestion des candidatures
│   └── evaluations/   # Pages pour les évaluateurs
├── services/          # Services pour interaction avec l'API
└── utils/             # Fonctions utilitaires
```

## Fonctionnement avec le backend

Cette application est conçue pour fonctionner avec l'API Katapult hébergée sur Vercel à l'adresse https://katapult-api.vercel.app.

## Rôles utilisateurs

- **Candidat** : Peut soumettre et suivre ses candidatures
- **Évaluateur** : Peut évaluer les candidatures qui lui sont assignées
- **Administrateur** : A accès complet à toutes les fonctionnalités, peut gérer les utilisateurs et les candidatures

## Tests

```
npm test
```

## Build de production

```
npm run build
```

## Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou à soumettre une pull request.

## Licence

Tous droits réservés © Katapult. 