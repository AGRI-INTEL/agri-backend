# Tests E2E (Cypress) — Agri Intel Frontend

Prérequis:
- Frontend en cours d'exécution sur `http://localhost:3000` (`npm run dev`)
- Backend en cours d'exécution sur `http://localhost:8000`

Installation (dans `Frontend/`):

```bash
npm install
# ou
yarn
```

Ouvrir l'interface interactive Cypress:

```bash
npm run cypress:open
```

Lancer les tests en CI / headless et générer des rapports:

```bash
npm run cypress:run
npm run cypress:report
```

Les rapports et captures sont générés dans `cypress/reports`, `cypress/screenshots`, et `cypress/videos`.
