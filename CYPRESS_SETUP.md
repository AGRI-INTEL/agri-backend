# Cypress Setup — Agri Intel

- Node >= 18 recommandé
- Depuis `Frontend/` :

```bash
npm install
npm run cypress:open
```

Configuration principale :
- `cypress.config.ts` : baseUrl (frontend) et `env.apiUrl` (backend)
- `cypress/support/commands.ts` : commandes custom `loginByUI`, `loginByApi`

Conseils :
- Si vos tests font des appels réseau vers `localhost:8000`, assurez-vous que le backend autorise CORS vers `http://localhost:3000` et `http://127.0.0.1:3000`.
- Pour exécuter en CI, lancez d'abord le backend et le frontend dans des jobs distincts ou en parallèle.
