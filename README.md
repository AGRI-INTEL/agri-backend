
<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="./public/logo.png">
    <img src="./public/logo.png" alt="AgriIntel360" width="280">
  </picture>
</p>

<h1 align="center">🌾 AgriIntel360 — Frontend</h1>

<p align="center">
  <strong>Plateforme Intelligente de Décision Agricole pour l'Afrique</strong>
  <br>
  <em>Tableau de bord, cartographie, messagerie, prédictions IA & communautés</em>
</p>

<p align="center">
  <a href="https://agriintel360.lsgrouptogo.com" target="_blank">
    <img src="https://img.shields.io/badge/LIVE-https%3A%2F%2Fagriintel360.lsgrouptogo.com-16A34A?style=for-the-badge&logo=globe&logoColor=white" alt="Live Site">
  </a>
  <a href="https://nextjs.org/">
    <img src="https://img.shields.io/badge/Next.js-15.5-000000?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js">
  </a>
  <a href="https://react.dev/">
    <img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React 19">
  </a>
  <a href="https://www.typescriptlang.org/">
    <img src="https://img.shields.io/badge/TypeScript-5.4-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  </a>
  <a href="https://tailwindcss.com/">
    <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS">
  </a>
  <br>
  <a href="https://tanstack.com/query/latest">
    <img src="https://img.shields.io/badge/TanStack_Query-5-FF4154?style=for-the-badge&logo=reactquery&logoColor=white" alt="TanStack Query">
  </a>
  <a href="https://zustand-demo.pmnd.rs/">
    <img src="https://img.shields.io/badge/Zustand-4.5-433E38?style=for-the-badge&logo=react&logoColor=white" alt="Zustand">
  </a>
  <a href="https://ui.shadcn.com/">
    <img src="https://img.shields.io/badge/shadcn%2Fui-000000?style=for-the-badge&logo=shadcnui&logoColor=white" alt="shadcn/ui">
  </a>
  <a href="https://www.radix-ui.com/">
    <img src="https://img.shields.io/badge/Radix_UI-161618?style=for-the-badge&logo=radixui&logoColor=white" alt="Radix UI">
  </a>
  <a href="https://recharts.org/">
    <img src="https://img.shields.io/badge/Recharts-2-22B5BF?style=for-the-badge&logo=recharts&logoColor=white" alt="Recharts">
  </a>
  <br>
  <a href="https://framer.com/motion">
    <img src="https://img.shields.io/badge/Framer_Motion-11-0055FF?style=for-the-badge&logo=framer&logoColor=white" alt="Framer Motion">
  </a>
  <a href="https://lucide.dev/">
    <img src="https://img.shields.io/badge/Lucide-React-F56565?style=for-the-badge&logo=lucide&logoColor=white" alt="Lucide">
  </a>
  <a href="https://maplibre.org/">
    <img src="https://img.shields.io/badge/MapLibre_GL-4.1-7CB342?style=for-the-badge&logo=maplibre&logoColor=white" alt="MapLibre GL">
  </a>
  <a href="https://socket.io/">
    <img src="https://img.shields.io/badge/Socket.IO-4.8-010101?style=for-the-badge&logo=socket.io&logoColor=white" alt="Socket.IO">
  </a>
</p>

<p align="center">
  <a href="#-architecture">Architecture</a> •
  <a href="#-pages--routes">Pages</a> •
  <a href="#-composants">Composants</a> •
  <a href="#-hooks">Hooks</a> •
  <a href="#-state-management">State</a> •
  <a href="#-type-script-types">Types</a> •
  <a href="#-installation">Installation</a> •
  <a href="#-d%C3%A9ploiement">Déploiement</a>
</p>

---

## ✨ Aperçu

**AgriIntel360 Frontend** est l'interface utilisateur moderne et réactive de la plateforme d'intelligence agricole. Construite avec **Next.js 15.5** en **static export**, elle offre :

| 🌱 **Végétal** | 🐄 **Animal** | 🎣 **Halieutique** | 🌲 **Forestier** |
|:---:|:---:|:---:|:---:|
| Suivi cultures & rendements | Gestion cheptel | Zones de pêche | PFNL & certification |
| Alertes ravageurs | Suivi sanitaire | Captures & débarcations | Forêts & concessions |
| Prédictions récolte IA | Productivité laitière | Météo marine | Reboisement carbone |

### 🎯 Fonctionnalités clés

| Fonctionnalité | Description |
|:---|:---|
| 🔐 **Authentification** | Login/Register, OAuth Google/Microsoft, 2FA, refresh tokens |
| 📊 **Tableau de bord** | Vue d'ensemble avec KPIs, graphiques Recharts, cartes |
| 🗺️ **Cartographie** | Carte interactive MapLibre GL — zones agricoles, marchés, ports |
| 🤖 **Chatbot IA** | AgriBot avec Kimi, DeepSeek, GPT-4, Claude — questions & réponses |
| 💬 **Messagerie** | Conversations privées, messages vocaux, fichiers, sondages, présence temps réel |
| 👥 **Communautés** | Groupes publics/privés, posts, commentaires, réactions |
| 🔔 **Alertes** | Météo, prix marchés, ravageurs, sécheresse — notifications temps réel |
| 📈 **Analytics** | Graphiques, tendances, comparaisons entre pays & cultures |
| 🔮 **Prédictions ML** | Rendement, prix, météo — modèles XGBoost/Prophet |
| 🌤️ **Météo** | Courante, prévisions 7 jours, historique — OpenWeatherMap |
| 💰 **Économie** | PIB, inflation, emploi, export/import — World Bank |
| 📁 **Fichiers** | Upload, téléchargement, organisation arborescente, partage |
| 👤 **Acteurs** | Profils agriculteurs, éleveurs, pêcheurs, forestiers, coopératives |
| ⚙️ **Paramètres** | Profil, préférences, sécurité, notifications, facturation |
| 🌍 **i18n** | Français/Anglais et 10+ langues africaines |

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        NAVIGATEUR                               │
│          Static Export Next.js (output: 'export')                │
└───────────────────────────┬─────────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│                    APPLICATION LAYER                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │   TanStack   │  │   Zustand    │  │   React 19           │   │
│  │   Query 5    │  │   Stores     │  │   Server Components  │   │
│  │  (Data Fetch)│  │  (State Mgmt)│  │   + Client WC        │   │
│  └──────────────┘  └──────────────┘  └──────────────────────┘   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │  Socket.IO   │  │  Framer      │  │   shadcn/ui +        │   │
│  │  Client      │  │  Motion 11   │  │   Radix UI Primitives│   │
│  └──────────────┘  └──────────────┘  └──────────────────────┘   │
└───────────────────────────┬─────────────────────────────────────┘
                            │
┌───────────────────────────▼─────────────────────────────────────┐
│                    API CLIENT (lib/api-client.ts)                │
│  Circuit Breaker | Retry 3x | Interceptors | Auth Inject        │
│  ↓ Auto-détection URL (proxy PHP Apache ou Next.js rewrites)    │
└───────────────────────────┬─────────────────────────────────────┘
                            │
              ┌─────────────▼─────────────┐
              │   Backend FastAPI          │
              │   (uvicorn :8001)          │
              └───────────────────────────┘
```

### 📁 Structure du projet

```
Frontend/
├── app/                          # Pages Next.js App Router
│   ├── layout.tsx                # Root layout — fonts, metadata, providers
│   ├── providers.tsx             # Providers wrapper (QueryClient, Theme, etc.)
│   ├── error.tsx                 # Global error boundary
│   ├── loading.tsx               # Global loading screen
│   ├── not-found.tsx             # 404 page
│   ├── (landing)/                # Pages publiques
│   │   ├── page.tsx              # Landing page hero
│   │   ├── contact/              # Page contact
│   │   ├── privacy/              # Politique de confidentialité
│   │   └── terms/                # Conditions d'utilisation
│   ├── (auth)/                   # Pages d'authentification
│   │   ├── login/                # Connexion
│   │   ├── register/             # Inscription
│   │   ├── forgot-password/      # Mot de passe oublié
│   │   └── verify-email/         # Vérification email
│   ├── auth/
│   │   └── callback/             # OAuth callback (Google/Microsoft)
│   └── (dashboard)/              # Pages authentifiées (17 sous-routes)
│       ├── layout.tsx            # Dashboard layout — Sidebar + Header
│       ├── dashboard/            # Vue d'ensemble
│       ├── messages/             # Messagerie privée
│       ├── alerts/               # Alertes ([id] = détail)
│       ├── actors/               # Acteurs agricoles ([id] = détail)
│       ├── community/            # Groupes & communautés
│       ├── analytics/            # Analyses et graphiques
│       ├── indicators/           # Indicateurs agricoles
│       ├── predictions/          # Prédictions ML
│       ├── chatbot/              # Chatbot IA AgriBot
│       ├── files/                # Gestion de fichiers
│       ├── weather/              # Météo
│       ├── map/                  # Carte interactive
│       ├── production/           # Production végétale
│       ├── animal/               # Élevage
│       ├── forestier/            # Secteur forestier
│       ├── halieutique/          # Pêche & aquaculture
│       ├── notifications/        # Centre de notifications
│       ├── admin/                # Administration
│       └── settings/             # Profil & préférences
│
├── components/                   # Composants React
│   ├── ui/                       # 24 composants shadcn/ui (button, card, dialog, etc.)
│   ├── layout/                   # 5 composants layout (Sidebar, Header, MobileNav)
│   ├── landing/                  # Composants page d'accueil
│   ├── auth/                     # Formulaires auth
│   ├── dashboard/                # Widgets dashboard
│   ├── actors/                   # 11 composants acteurs
│   ├── community/                # 7 composants communauté
│   ├── alerts/                   # 2 composants alertes
│   ├── indicators/               # 4 composants indicateurs
│   ├── predictions/              # Composants prédictions
│   ├── analytics/                # Composants analytics
│   ├── chatbot/                  # Composants chatbot
│   ├── admin/                    # Composants admin
│   ├── map/                      # Composants carte
│   ├── weather/                  # Composants météo
│   ├── files/                    # Composants fichiers
│   ├── settings/                 # Composants paramètres
│   ├── media/                    # Composants médias
│   └── shared/                   # Composants partagés
│
├── hooks/                        # 21 hooks personnalisés
├── stores/                       # 4 stores Zustand
├── lib/                          # 12 utilitaires
├── types/                        # 11 fichiers de types TypeScript
├── public/                       # Assets statiques
│   ├── images/                   # Images (secteurs, témoignages, etc.)
│   ├── fonts/                    # Polices (Inter, Playfair Display, JetBrains Mono)
│   ├── locales/                  # Fichiers i18n (fr, en)
│   ├── logo.png                  # Logo principal
│   ├── favicon.ico               # Favicon
│   ├── manifest.json             # PWA manifest
│   └── robots.txt                # SEO
│
├── styles/
│   └── globals.css               # Styles globaux Tailwind + CSS custom
├── fonts/                        # Polices locales WOFF2
├── middleware.ts                 # Middleware Next.js (auth guard dev)
├── next.config.js                # Config Next.js (static export)
├── tailwind.config.js            # Thème Tailwind complet
├── tsconfig.json                 # TypeScript config
├── postcss.config.js             # PostCSS config
├── cypress.config.js             # Cypress E2E config
├── package.json                  # Dépendances
└── deploy-lws.sh                 # Script déploiement LWS
```

---

## 🧩 Composants UI

La librairie de composants s'appuie sur **shadcn/ui** + **Radix UI** avec 24 composants accessibles et personnalisés :

| Composant | Description | Badge |
|:---|:---|:---|
| `button` | Variantes : default, destructive, outline, secondary, ghost, link | 🎨 |
| `card` | Conteneurs avec header, content, footer | 📇 |
| `dialog` | Fenêtres modales accessibles | 🪟 |
| `dropdown-menu` | Menus déroulants Radix | 📋 |
| `tabs` | Onglets avec contenu associé | 📑 |
| `avatar` | Avatars avec fallback initials | 👤 |
| `badge` | Badges de statut/catégorie | 🏷️ |
| `input` | Champs de texte stylisés | ⌨️ |
| `select` | Sélecteurs accessibles | 📝 |
| `switch` | Toggle switches | 🔄 |
| `checkbox` | Cases à cocher | ☑️ |
| `slider` | Curseurs de valeur | 🔢 |
| `tooltip` | Infobulles contextuelles | 💬 |
| `progress` | Barres de progression | 📊 |
| `scroll-area` | Zones défilables stylisées | 📜 |
| `separator` | Séparateurs visuels | ➖ |
| `skeleton` | Placeholders de chargement | 💀 |
| `label` | Étiquettes de formulaire | 🏷️ |
| `textarea` | Zones de texte multi-lignes | 📝 |
| `alert-dialog` | Dialogues de confirmation | ⚠️ |
| `error-boundary` | Capture d'erreurs React | 🚨 |
| `error-fallback` | Fallback UI d'erreur | 🔧 |
| `link-button` | Boutons style lien | 🔗 |
| `language-switcher` | Sélecteur de langue 🌍 | 🌍 |

Les layouts utilisent **5 composants structurels** :
- `sidebar` — Navigation latérale avec icônes Lucide et sections (rétractable)
- `header` — Barre supérieure avec recherche, notifications, profil
- `mobile-nav` — Navigation mobile adaptative
- `breadcrumb` — Fil d'Ariane contextuel
- `page-wrapper` — Wrapper de page standardisé

---

## ⚡ Hooks (TanStack Query)

**21 hooks personnalisés** pour la gestion des données et l'interaction API :

| Hook | Queries clés | Mutations |
|:---|:---|:---|
| `use-auth.ts` | `auth/me` | login, register, logout, refresh, 2FA |
| `use-messaging.ts` | conversations, messages, search users | sendMessage, createConv, votePoll, uploadFile |
| `use-community.ts` | groups, posts, comments, members | createGroup, join, post, comment, react |
| `use-alerts.ts` | alerts, alert detail | createAlert, dismissAlert |
| `use-actors.ts` | actors list, actor detail, search | createActor, updateActor |
| `use-chatbot.ts` | chat history | sendMessage, clearHistory, switchProvider |
| `use-notifications.ts` | notifications, unread count | markRead, markAllRead |
| `use-indicators.ts` | indicators, indicator data | — |
| `use-weather.ts` | current weather, forecast, history | — |
| `use-files.ts` | files, folders | upload, delete, move |
| `use-predictions.ts` | prediction history | predict yield/price/weather |
| `use-geolocation.ts` | — | calculate distance, nearby places |
| `use-admin.ts` | admin users, stats | activate, deactivate |
| `use-settings.ts` | user settings | update profile, preferences |
| `use-translation.ts` | — | switch language |
| `use-voice-recorder.ts` | — | start/stop recording, encode audio |
| `use-media-upload.ts` | — | compress image, upload with progress |
| `use-debounce.ts` | Utility — debounce values | — |
| `use-local-storage.ts` | Utility — localStorage sync | — |
| `use-media-query.ts` | Utility — responsive breakpoints | — |
| `use-persistent-state.ts` | Utility — persisted state | — |

---

## 🏪 State Management (Zustand)

**4 stores Zustand** avec persist et sélecteurs optimisés :

### `auth-store.ts`
```typescript
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hydrationState: 'pending' | 'hydrating' | 'complete' | 'error';
  // Actions
  setUser(user): void;
  updateUser(partial): void;
  logout(): Promise<void>;
  rehydrate(): Promise<void>;
}
```
- Persisté dans `localStorage` sous la clé `agriintel360-auth`
- Version 1 avec migration v0→v1
- Sélecteurs typés : `useIsAuthenticated()`, `useCurrentUser()`, `useHasPermission()`, `useAuthHydrated()`

### `ui-store.ts`
```typescript
interface UIState {
  sidebarCollapsed: boolean;
  theme: 'light' | 'dark';
  notifications: Notification[];
  toggleSidebar(): void;
  setTheme(theme): void;
  addNotification(notification): void;
}
```

### `filter-store.ts`
```typescript
interface FilterState {
  country: string | null;
  crop: string | null;
  sector: string | null;
  dateRange: [Date, Date] | null;
  setCountry(country): void;
  setCrop(crop): void;
  setSector(sector): void;
  resetFilters(): void;
}
```

### `map-store.ts`
```typescript
interface MapState {
  center: [number, number];
  zoom: number;
  style: string;
  selectedMarker: any;
  setCenter(center): void;
  setZoom(zoom): void;
  setStyle(style): void;
}
```

---

## 🔌 API Client

Le client API (`lib/api-client.ts`) est un **système complet de communication HTTP** :

```
┌──────────────────────────────────────────────────────────────────┐
│                      apiClient                                   │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  Circuit Breaker                                           │  │
│  │  • Détection arrêt backend (503)                           │  │
│  │  • Health check automatique toutes les 30s                │  │
│  │  • Événement 'backend-status-change'                      │  │
│  └────────────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  Retry & Timeout                                           │  │
│  │  • 3 tentatives max avec backoff exponentiel              │  │
│  │  • Statuts réessayables : 408, 429, 500, 502, 504         │  │
│  │  • Timeout configurable (30s défaut)                      │  │
│  └────────────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  Interceptors                                              │  │
│  │  • Request : Auth token (Bearer), CSRF, Lang, Cache       │  │
│  │  • Response : Redirection 401 → /login?expired=true       │  │
│  │  • Error : Logging formaté                                │  │
│  └────────────────────────────────────────────────────────────┘  │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  Méthodes                                                 │  │
│  │  get<T> / post<T> / put<T> / patch<T> / delete<T>         │  │
│  │  upload<T> (XHR avec progression) | batch<T>              │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

Instances pré-configurées :
- `apiClient` — Client par défaut avec tous les interceptors
- `api.get/post/put/patch/delete/upload/batch` — Raccourcis
- `publicApi` — Sans auth (credentials: same-origin)
- `authApi` — Avec auth (credentials: include)
- `uploadApi` — Timeout 2min, 1 retry

---

## 📦 TypeScript Types

**11 fichiers de types** dans `types/` :

| Fichier | Types principaux |
|:---|:---|
| `auth.ts` | User, LoginCredentials, RegisterData, Permission, Role |
| `messaging.ts` | Conversation, PrivateMessage, PollData, SearchUserResult |
| `community.ts` | Group, GroupMember, Post, Comment, Reaction |
| `alert.ts` | Alert, AlertType, AlertSeverity |
| `actor.ts` | Actor, ActorType, ActorSector |
| `indicator.ts` | Indicator, IndicatorData, IndicatorType |
| `weather.ts` | WeatherCurrent, WeatherForecast, WeatherHistory |
| `prediction.ts` | Prediction, PredictionResult, ModelType |
| `chatbot.ts` | ChatMessage, ChatSuggestion, LLMProvider |
| `file.ts` | UploadedFile, FileFolder, FilePermission |
| `api.ts` | ApiError, ApiResponse, PaginatedResponse |

---

## 🎨 Thème & Design System

Le thème Tailwind CSS 4 est entièrement configuré avec :

### 🎨 Palette de couleurs

```
Primary  (Vert agricole) : #16A34A → nuances 50→900
Secondary (Orange)       : #D97706 → nuances 50→900
Accent   (Cyan)          : #0891B2
Végétal                  : #16A34A
Animal                   : #D97706
Halieutique              : #0891B2
Forestier                : #92400E
```

### 🔤 Typographie

| Style | Taille | Poids | Usage |
|:---|:---:|:---:|:---|
| `display` | 5rem / 80px | 800 | Titres hero |
| `h1` | 2.5rem / 40px | 700 | Titres de section |
| `h2` | 1.875rem / 30px | 600 | Sous-titres |
| `h3` | 1.5rem / 24px | 600 | Titres de carte |
| `body` | 0.875rem / 14px | 400 | Corps de texte |

- **Inter** (variable) — Police système pour l'interface
- **Playfair Display** (variable) — Police pour titres élégants
- **JetBrains Mono** (variable) — Police pour code et données

### 📐 Design tokens

- Arrondis : `card: 12px`, `button: 8px`, `input: 6px`
- Ombres : `card`, `card-hover`, `modal`, `glow-green`, `glow-orange`
- Animations : `fade-in`, `slide-up`, `slide-in-right`, `pulse-slow`, `bounce-slow`
- Breakpoints : `xs: 480px` → `3xl: 1920px`
- Layout : `sidebar: 240px`, `header: 64px`

---

## 🚀 Installation

```bash
# Prérequis
node >= 18
npm >= 9

# Cloner
git clone <votre-repo>
cd Frontend

# Installer les dépendances
npm install

# Variables d'environnement
cp .env.local.example .env.local

# Lancer en développement (avec turbopack)
npm run dev
# → http://localhost:3000

# Linter
npm run lint

# Tests unitaires
npm run test

# Tests E2E (Cypress)
npm run cypress:open

# Tests E2E (Playwright)
npm run test:e2e

# Storybook
npm run storybook
```

### ⚙️ Variables d'environnement

```env
# .env.local
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_PREFIX=/api/v1
NEXT_PUBLIC_MAPBOX_TOKEN=votre_token
NEXT_PUBLIC_GOOGLE_CLIENT_ID=votre_client_id
NEXT_PUBLIC_MICROSOFT_CLIENT_ID=votre_client_id
```

---

## 🏗 Build & Déploiement

```bash
# Build statique
npm run build
# → Génère dans Frontend/out/

# Prévisualisation
npx serve out/

# Déploiement LWS (production)
./deploy-lws.sh
# → Upload out/ → _frontend/ via lftp mirror
```

Le build produit un **export statique complet** (HTML, CSS, JS) déployable sur n'importe quel serveur web statique (Apache, Nginx, LWS). Le routage et l'authentification sont gérés côté client.

### Production LWS

```
┌─────────────┐     ┌──────────────────────┐     ┌──────────────┐
│  Navigateur  │────▶│  Apache (LWS)        │────▶│  _frontend/  │
│              │     │  • .htaccess rules    │     │  (static)    │
│              │     │  • /api/* → proxy PHP │     └──────────────┘
│              │     │  • community/groups/* │     ┌──────────────┐
│              │     │    → _.html rewrite   │     │  FastAPI     │
└─────────────┘     └──────────────────────┘     │  (:8001)     │
                                                  └──────────────┘
```

### Règles .htaccess (production)

```apache
# HTTPS redirect
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}/$1 [R=301,L]

# Next.js static assets
RewriteRule ^_frontend/(.*) _frontend/$1 [L]

# Community dynamic routes
RewriteRule ^community/groups/([^/]+)$ _frontend/community/groups/_.html [L]

# Catch-all → PHP proxy
RewriteRule ^(.*)$ index.php [L]
```

---

## 📚 Pages & Routes

### Pages publiques `(landing)/`

| Route | Composant | Description |
|:---|:---|:---|
| `/` | `page.tsx` | Landing page — hero, secteurs, stats, témoignages, pricing, CTA |
| `/contact` | `contact/page.tsx` | Formulaire de contact |
| `/privacy` | `privacy/page.tsx` | Politique de confidentialité |
| `/terms` | `terms/page.tsx` | Conditions d'utilisation |

### Pages authentification `(auth)/`

| Route | Composant | Description |
|:---|:---|:---|
| `/login` | `login/page.tsx` | Connexion JWT |
| `/register` | `register/page.tsx` | Inscription |
| `/forgot-password` | `forgot-password/page.tsx` | Réinitialisation mot de passe |
| `/verify-email` | `verify-email/page.tsx` | Vérification email |
| `/auth/callback` | `callback/page.tsx` | Callback OAuth Google/Microsoft |

### Pages dashboard `(dashboard)/`

| Route | Description |
|:---|:---|
| `/dashboard` | Vue d'ensemble — KPIs, graphiques tendances, alertes récentes |
| `/messages` | Messagerie — liste conversations, chat temps réel, sondages, upload |
| `/alerts` | Alertes agricoles — météo, prix, ravageurs, sécheresse |
| `/alerts/[id]` | Détail d'une alerte |
| `/actors` | Acteurs agricoles — agriculteurs, éleveurs, pêcheurs, forestiers |
| `/actors/[id]` | Profil détaillé d'un acteur |
| `/community` | Communautés & groupes — navigation, posts, commentaires |
| `/community/groups/[uuid]` | Page d'un groupe (via Apache rewrite → `_.html`) |
| `/analytics` | Analyses — graphiques, tendances, comparaisons |
| `/indicators` | Indicateurs agricoles — données FAOSTAT, World Bank |
| `/predictions` | Prédictions ML — rendement, prix, météo |
| `/chatbot` | Chatbot IA AgriBot — questions & réponses |
| `/files` | Gestion de fichiers — upload, dossiers, partage |
| `/weather` | Météo — actuelle, prévisions 7j, historique |
| `/map` | Carte interactive — cultures, marchés, ports, zones agricoles |
| `/production` | Production végétale — cultures, rendements, parcelles |
| `/animal` | Élevage — cheptel, suivi sanitaire, productivité |
| `/forestier` | Secteur forestier — forêts, PFNL, certification |
| `/halieutique` | Pêche & aquaculture — zones, captures, ports |
| `/notifications` | Centre de notifications — liste, filtres, marquer lu |
| `/admin` | Administration — utilisateurs, stats, configuration |
| `/settings` | Paramètres — profil, préférences, sécurité, facturation |

---

## 🗺️ Cartographie (MapLibre GL)

La carte interactive utilise **MapLibre GL** (fork open-source de Mapbox GL) avec OpenFreeMap :

```typescript
// Centre par défaut : Afrique de l'Ouest
MAP_DEFAULT_CENTER = [15, 5];   // lat, lon
MAP_DEFAULT_ZOOM = 3.5;

// Styles disponibles
'🗺️ Rues'    → https://tiles.openfreemap.org/styles/liberty
'🛰️ Satellite' → https://tiles.openfreemap.org/styles/bright
'⛰️ Terrain'  → https://tiles.openfreemap.org/styles/liberty
'🌙 Sombre'   → https://tiles.openfreemap.org/styles/positron
```

Fonctionnalités cartographiques :
- Marqueurs de cultures, marchés, ports, zones agricoles
- Couches de chaleur (heatmap) pour densité de production
- Géocodage et recherche de lieux
- Calcul de distances entre points
- Alertes géolocalisées

---

## 🤖 AgriBot — Chatbot IA

Le chatbot AgriBot supporte **6 providers LLM** :

| Provider | Modèle | Tokens max |
|:---|:---|:---:|
| 🧠 Kimi | Moonshot K2.6 | 200K |
| 🧠 DeepSeek | DeepSeek V3 | 64K |
| 🧠 GPT-4 | GPT-4o | 128K |
| 🧠 Claude | Claude 3.5 Sonnet | 200K |
| 🧠 Gemini | Gemini 2.5 Pro | 1M |
| 🎮 Demo | Mode démonstration | 4K |

Fonctionnalités :
- Génération SQL sécurisée (SELECT uniquement) pour données agricoles
- Suggestions de questions contextuelles
- Historique des 50 derniers échanges
- Feedback utilisateur
- Bascule dynamique entre providers

---

## 💬 Messagerie Temps Réel

La messagerie utilise **Socket.IO** avec auto-reconnection :

```
┌────────────┐     ┌────────────┐     ┌──────────────┐
│  Client A  │────▶│  Socket.IO  │◀────│   Client B   │
│  (React)   │     │  + FastAPI  │     │   (React)    │
└────────────┘     └────────────┘     └──────────────┘
```

- Messages texte, vocal, fichiers, images
- Sondages avec vote en direct
- Indicateurs de saisie (typing)
- Statut de présence en ligne
- Pièces jointes avec prévisualisation
- Notifications de nouveaux messages

---

## 🧪 Tests

| Type | Technologie | Commande |
|:---|:---|:---|
| Unitaires | Jest + Testing Library | `npm run test` |
| E2E | Cypress | `npm run cypress:open` |
| E2E | Playwright | `npm run test:e2e` |
| UI | Storybook | `npm run storybook` |

---

## 🌍 Internationalisation (i18n)

Support multilingue complet :
- **Français** (défaut)
- **Anglais**
- Architecture extensible pour +10 langues africaines

Les traductions sont stockées dans `public/locales/{lang}/` et chargées dynamiquement.

---

## 📦 Dépendances principales

```json
{
  "next": "15.5.18",
  "react": "19.0.0",
  "react-dom": "19.0.0",
  "typescript": "5.4.5",
  "tailwindcss": "^4.3.0",
  "@tanstack/react-query": "^5.62.8",
  "zustand": "4.5.2",
  "framer-motion": "11.1.7",
  "lucide-react": "0.350.0",
  "recharts": "2.12.7",
  "maplibre-gl": "4.1.2",
  "socket.io-client": "4.8.3",
  "react-hook-form": "7.51.3",
  "zod": "3.22.4",
  "date-fns": "3.6.0",
  "sonner": "1.4.41",
  "dompurify": "^3.4.11",
  "embla-carousel-react": "8.0.4",
  "cmdk": "1.0.0",
  "vaul": "0.9.0",
  "react-markdown": "9.0.1",
  "react-dropzone": "14.2.3"
}
```

---

## 🔒 Sécurité Frontend

- ✅ Authentification JWT avec stockage localStorage sécurisé
- ✅ Circuit breaker anti-surge (backoff 30s)
- ✅ Interceptor 401 → redirection login propre
- ✅ CSRF token via cookie `csrf_token`
- ✅ Headers antérieurs : `X-Requested-With: XMLHttpRequest`
- ✅ Cache Control : `no-cache` sur les requêtes API
- ✅ [DOMPurify](https://github.com/cure53/DOMPurify) pour assainir le HTML
- ✅ Hydration SSR-safe avec flags `mounted` + `useEffect`
- ✅ Middleware Next.js pour routes protégées (dev)

---

## 📊 Statistiques du Projet

| Métrique | Valeur |
|:---|---:|
| Pages | 40+ |
| Composants | 100+ |
| Hooks personnalisés | 21 |
| Stores Zustand | 4 |
| Fichiers de types TS | 11 |
| Dépendances npm | 60+ |
| Tests E2E (Cypress) | Configuré |
| Tests unitaires (Jest) | Configuré |

---

## 🤝 Contribution

1. Fork le projet
2. `git checkout -b feature/ma-fonctionnalite`
3. Commit avec `npm run lint` validé
4. Push et Pull Request

---

## 📄 Licence

**Propriétaire** — © 2026 AgriIntel360. Tous droits réservés.

---

<p align="center">
  <strong>🌾 AgriIntel360</strong><br>
  <em>Intelligence Agricole pour l'Afrique</em><br>
  <br>
  <a href="https://agriintel360.lsgrouptogo.com">🌐 Site Live</a> •
  <a href="mailto:contact@agriintel360.lsgrouptogo.com">📧 Contact</a>
</p>
