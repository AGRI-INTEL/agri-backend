// ============================================================================
// SECTION 1: APPLICATION METADATA
// ============================================================================

export const APP_NAME = 'AgriIntel360';
export const APP_TAGLINE = "Intelligence agricole pour l'Afrique";
export const APP_DESCRIPTION = "Plateforme d'intelligence agricole couvrant l'ensemble du continent africain avec des outils de prédiction, cartographie interactive et analyse de marchés.";
export const APP_VERSION = '2.0.0';
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://agriintel360.lsgrouptogo.com';
export const API_URL = process.env.NEXT_PUBLIC_API_URL || '';
export const APP_CONTACT_EMAIL = 'contact@agriintel360.lsgrouptogo.com';
export const APP_SUPPORT_PHONE = '+221 33 000 00 00';

// ============================================================================
// SECTION 2: PAGINATION & LISTING
// ============================================================================

export const DEFAULT_PAGE_SIZE = 25;
export const PAGE_SIZE_OPTIONS = [10, 25, 50, 100, 250] as const;
export const MAX_PAGE_SIZE = 1000;
export const DEFAULT_SORT_ORDER = 'desc' as const;
export const DEFAULT_SORT_FIELD = 'created_at';

// ============================================================================
// SECTION 3: FILE UPLOAD LIMITS
// ============================================================================

export const FILE_SIZE_UNITS = ['B', 'KB', 'MB', 'GB'] as const;

export const MAX_IMAGE_SIZE = 10 * 1024 * 1024;       // 10MB
export const MAX_VIDEO_SIZE = 100 * 1024 * 1024;      // 100MB
export const MAX_AUDIO_SIZE = 50 * 1024 * 1024;       // 50MB
export const MAX_DOCUMENT_SIZE = 25 * 1024 * 1024;      // 25MB
export const MAX_ARCHIVE_SIZE = 200 * 1024 * 1024;    // 200MB
export const MAX_FILE_SIZE = 500 * 1024 * 1024;         // 500MB (absolute max)

export const MAX_IMAGE_DIMENSION = 4096;                // px (max width/height)
export const MAX_VIDEO_DIMENSION = 3840;                // px (4K)
export const MAX_VIDEO_DURATION = 300;                   // 5 minutes max
export const MAX_AUDIO_DURATION = 600;                   // 10 minutes max

export const MAX_PHOTOS_PER_POST = 10;
export const MAX_PHOTOS_PER_MESSAGE = 5;
export const MAX_FILES_PER_UPLOAD = 20;
export const MAX_TOTAL_UPLOAD_SIZE = 500 * 1024 * 1024;  // 500MB batch max

// ============================================================================
// SECTION 4: ACCEPTED FILE TYPES
// ============================================================================

export const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
  'image/svg+xml',
] as const;

export const ACCEPTED_VIDEO_TYPES = [
  'video/mp4',
  'video/webm',
  'video/ogg',
  'video/quicktime',
  'video/x-msvideo',
] as const;

export const ACCEPTED_AUDIO_TYPES = [
  'audio/mpeg',
  'audio/mp4',
  'audio/wav',
  'audio/ogg',
  'audio/webm',
  'audio/flac',
  'audio/aac',
] as const;

export const ACCEPTED_DOCUMENT_TYPES = [
  'application/pdf',
  'text/plain',
  'text/csv',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
] as const;

export const ACCEPTED_ARCHIVE_TYPES = [
  'application/zip',
  'application/x-zip-compressed',
  'application/x-rar-compressed',
  'application/x-7z-compressed',
] as const;

export const BLOCKED_EXTENSIONS = [
  '.exe', '.dll', '.bat', '.cmd', '.sh', '.php', '.jsp', '.asp', '.aspx',
  '.jar', '.war', '.ear', '.py', '.rb', '.pl', '.cgi', '.com', '.scr',
  '.msi', '.vbs', '.js', '.wsf', '.hta', '.ps1', '.psm1', '.psd1',
  '.dmg', '.pkg', '.deb', '.rpm', '.app', '.ipa', '.apk', '.iso',
  '.bin', '.dat', '.sys', '.drv', '.ocx', '.reg', '.inf',
] as const;

export const ALL_ACCEPTED_TYPES = [
  ...ACCEPTED_IMAGE_TYPES,
  ...ACCEPTED_VIDEO_TYPES,
  ...ACCEPTED_AUDIO_TYPES,
  ...ACCEPTED_DOCUMENT_TYPES,
  ...ACCEPTED_ARCHIVE_TYPES,
] as const;

// ============================================================================
// SECTION 5: MAP CONFIGURATION
// ============================================================================

export const MAP_DEFAULT_CENTER: [number, number] = [15, 5];        // Center of Africa
export const MAP_DEFAULT_ZOOM = 3.5;
export const MAP_MIN_ZOOM = 2;
export const MAP_MAX_ZOOM = 18;

// OpenFreeMap — free, no API key, global coverage
export const MAP_STYLE_STREETS = 'https://tiles.openfreemap.org/styles/liberty';
export const MAP_STYLE_SATELLITE = 'https://tiles.openfreemap.org/styles/bright';
export const MAP_STYLE_TERRAIN = 'https://tiles.openfreemap.org/styles/liberty';
export const MAP_STYLE_DARK = 'https://tiles.openfreemap.org/styles/positron';

export const MAP_STYLES = [
  { id: 'streets', name: 'Rues', url: MAP_STYLE_STREETS, icon: '🗺️' },
  { id: 'satellite', name: 'Satellite', url: MAP_STYLE_SATELLITE, icon: '🛰️' },
  { id: 'terrain', name: 'Terrain', url: MAP_STYLE_TERRAIN, icon: '⛰️' },
  { id: 'dark', name: 'Sombre', url: MAP_STYLE_DARK, icon: '🌙' },
] as const;

// ============================================================================
// SECTION 6: SECTORS & CATEGORIES
// ============================================================================

export const SECTORS = ['vegetal', 'animal', 'halieutique', 'forestier', 'minier', 'industriel'] as const;

export type Sector = (typeof SECTORS)[number];

export const SECTOR_CONFIG: Record<Sector, {
  label: string;
  emoji: string;
  color: string;
  description: string;
}> = {
  vegetal: {
    label: 'Végétal',
    emoji: '🌱',
    color: '#16A34A',
    description: 'Production végétale et cultures',
  },
  animal: {
    label: 'Animal',
    emoji: '🐄',
    color: '#D97706',
    description: 'Élevage et production animale',
  },
  halieutique: {
    label: 'Halieutique',
    emoji: '🎣',
    color: '#0891B2',
    description: 'Pêche et aquaculture',
  },
  forestier: {
    label: 'Forestier',
    emoji: '🌲',
    color: '#92400E',
    description: 'Forêts et produits forestiers',
  },
  minier: {
    label: 'Minier',
    emoji: '⛏️',
    color: '#6B7280',
    description: 'Exploitation minière',
  },
  industriel: {
    label: 'Industriel',
    emoji: '🏭',
    color: '#4F46E5',
    description: 'Industrie agroalimentaire',
  },
};

// ============================================================================
// SECTION 7: CROPS (CULTURES)
// ============================================================================

export const CROPS = [
  'Maïs', 'Riz', 'Mil', 'Sorgho', 'Arachide', 'Coton',
  'Manioc', 'Igname', 'Patate douce', 'Niébé', 'Soja',
  'Tomate', 'Oignon', 'Gombo', 'Piment', 'Aubergine',
  'Mangue', 'Anacarde', 'Cacao', 'Café', 'Banane',
  'Papaye', 'Orange', 'Citron', 'Ananas', 'Pastèque',
  'Haricot', 'Lentille', 'Sésame', 'Karité', 'Palmier à huile',
] as const;

export type Crop = (typeof CROPS)[number];

export const CROP_CATEGORIES: Record<string, string[]> = {
  céréales: ['Maïs', 'Riz', 'Mil', 'Sorgho'],
  légumineuses: ['Niébé', 'Soja', 'Haricot', 'Lentille'],
  tubercules: ['Manioc', 'Igname', 'Patate douce'],
  fruits: ['Mangue', 'Banane', 'Papaye', 'Orange', 'Citron', 'Ananas', 'Pastèque'],
  oléagineux: ['Arachide', 'Sésame', 'Karité', 'Palmier à huile'],
  fibres: ['Coton'],
  légumes: ['Tomate', 'Oignon', 'Gombo', 'Piment', 'Aubergine'],
  stimulants: ['Cacao', 'Café'],
};

// ============================================================================
// SECTION 8: ANIMAL SPECIES
// ============================================================================

export const ANIMAL_SPECIES = [
  'Bovins', 'Ovins', 'Caprins', 'Volailles', 'Porcins',
  'Camelins', 'Équins', 'Asins', 'Lapins', 'Abeilles',
  'Poissons', 'Crevettes', 'Escargots',
] as const;

export type AnimalSpecies = (typeof ANIMAL_SPECIES)[number];

export const ANIMAL_CATEGORIES: Record<string, string[]> = {
  ruminants: ['Bovins', 'Ovins', 'Caprins', 'Camelins'],
  monogastriques: ['Porcins', 'Lapins', 'Volailles'],
  aquatiques: ['Poissons', 'Crevettes'],
  autres: ['Équins', 'Asins', 'Abeilles', 'Escargots'],
};

// ============================================================================
// SECTION 9: ROLES & PERMISSIONS
// ============================================================================

export const USER_ROLES = [
  'agriculteur',
  'eleveur',
  'pecheur',
  'forestier',
  'cooperative',
  'ong',
  'gouvernement',
  'chercheur',
  'acheteur',
  'fournisseur',
  'transformateur',
  'exportateur',
  'institution',
  'autre',
] as const;

export type UserRole = (typeof USER_ROLES)[number];

export const ROLE_LABELS: Record<UserRole, string> = {
  agriculteur: 'Agriculteur',
  eleveur: 'Éleveur',
  pecheur: 'Pêcheur',
  forestier: 'Forestier',
  cooperative: 'Coopérative',
  ong: 'ONG',
  gouvernement: 'Gouvernement',
  chercheur: 'Chercheur',
  acheteur: 'Acheteur',
  fournisseur: 'Fournisseur',
  transformateur: 'Transformateur',
  exportateur: 'Exportateur',
  institution: 'Institution',
  autre: 'Autre',
};

// ============================================================================
// SECTION 10: LLM PROVIDERS
// ============================================================================

export const LLM_PROVIDERS = [
  { id: 'kimi', name: 'Kimi', emoji: '🧠', description: 'Kimi K2.6 - Moonshot AI', max_tokens: 200000 },
  { id: 'deepseek', name: 'DeepSeek', emoji: '🧠', description: 'DeepSeek V3', max_tokens: 64000 },
  { id: 'gpt4', name: 'GPT-4', emoji: '🧠', description: 'GPT-4o - OpenAI', max_tokens: 128000 },
  { id: 'claude', name: 'Claude', emoji: '🧠', description: 'Claude 3.5 Sonnet', max_tokens: 200000 },
  { id: 'gemini', name: 'Gemini', emoji: '🧠', description: 'Gemini 2.5 Pro', max_tokens: 1000000 },
  { id: 'demo', name: 'Demo', emoji: '🎮', description: 'Mode démonstration', max_tokens: 4000 },
] as const;

export type LLMProvider = (typeof LLM_PROVIDERS)[number]['id'];

export const DEFAULT_LLM_PROVIDER: LLMProvider = 'kimi';

// ============================================================================
// SECTION 11: CHATBOT CONFIGURATION
// ============================================================================

export const CHATBOT_NAME = 'AgriBot';
export const CHATBOT_AVATAR = '/images/agribot-avatar.png';

export const CHATBOT_SUGGESTIONS = [
  '📊 Quel est le rendement moyen du maïs au Sénégal ?',
  '💰 Compare les prix du riz entre le Ghana et le Nigeria',
  '🌧 Y a-t-il des alertes sécheresse cette semaine ?',
  "🔮 Prédire la production d'arachide en 2026",
  '🐄 Quels sont les vaccins obligatoires pour les bovins ?',
  '🎣 Quelles sont les zones de pêche interdites actuellement ?',
  '🌱 Quelle est la meilleure période pour semer le mil au Burkina ?',
  '📈 Évolution des prix du cacao sur les 6 derniers mois',
] as const;

export const CHATBOT_WELCOME_MESSAGE = `Bonjour ! Je suis **${CHATBOT_NAME}**, votre assistant agricole intelligent. Je peux vous aider avec :

• 📊 **Données & Statistiques** — rendements, prix, marchés
• 🔮 **Prédictions** — production, météo, tendances
• 🚨 **Alertes** — sécheresse, ravageurs, prix
• 💡 **Conseils** — cultures, élevage, pêche

Posez-moi une question ou choisissez une suggestion ci-dessous !`;

export const CHATBOT_MAX_HISTORY = 50;
export const CHATBOT_MAX_MESSAGE_LENGTH = 2000;

// ============================================================================
// SECTION 12: PRICING PLANS
// ============================================================================

export type PricingPeriod = 'monthly' | 'annual';

export interface PricingPlan {
  id: string;
  name: string;
  price_monthly: number | null;
  price_annual: number | null;
  currency: string;
  badge: string;
  features: string[];
  cta: string;
  cta_variant: 'default' | 'outline' | 'secondary';
  highlighted: boolean;
  limits?: {
    storage_gb?: number;
    api_calls_monthly?: number;
    max_users?: number;
    max_projects?: number;
    support_level?: 'community' | 'email' | 'priority' | 'dedicated';
  };
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'free',
    name: 'Gratuit',
    price_monthly: 0,
    price_annual: 0,
    currency: 'FCFA',
    badge: 'Démarrez ici',
    features: [
      'Dashboard basique',
      '5 requêtes AgriBot/jour',
      '1GB stockage',
      'Communauté publique',
      'Alertes basiques',
      'Carte interactive (lecture)',
    ],
    cta: "S'inscrire Gratuitement",
    cta_variant: 'outline',
    highlighted: false,
    limits: {
      storage_gb: 1,
      api_calls_monthly: 150,
      max_users: 1,
      max_projects: 3,
      support_level: 'community',
    },
  },
  {
    id: 'pro',
    name: 'Pro',
    price_monthly: 9900,
    price_annual: 7920,
    currency: 'FCFA',
    badge: 'Populaire',
    features: [
      'Dashboard complet',
      'AgriBot illimité',
      '50GB stockage',
      'Alertes avancées',
      'Export données (CSV, Excel, PDF)',
      'Support prioritaire',
      'Carte interactive complète',
      'Prédictions IA avancées',
      'API limitée',
      'Rapports personnalisés',
    ],
    cta: "Commencer l'Essai Gratuit",
    cta_variant: 'default',
    highlighted: true,
    limits: {
      storage_gb: 50,
      api_calls_monthly: 10000,
      max_users: 5,
      max_projects: 20,
      support_level: 'priority',
    },
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price_monthly: null,
    price_annual: null,
    currency: 'FCFA',
    badge: 'Organisations',
    features: [
      'Tout Pro inclus',
      'API illimitée',
      'SSO & SAML',
      'Custom LLM (fine-tuning)',
      'Formation dédiée',
      'SLA 99.9%',
      'Support dédié 24/7',
      'Hébergement dédié',
      'Intégrations sur mesure',
      'Audit & conformité',
    ],
    cta: "Contacter l'Équipe",
    cta_variant: 'outline',
    highlighted: false,
    limits: {
      storage_gb: 500,
      api_calls_monthly: Infinity,
      max_users: Infinity,
      max_projects: Infinity,
      support_level: 'dedicated',
    },
  },
];

export const PRICING_DISCOUNT_PERCENT = 20; // Annual discount

// ============================================================================
// SECTION 13: TESTIMONIALS
// ============================================================================

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  country: string;
  country_code: string;
  avatar: string;
  rating: 1 | 2 | 3 | 4 | 5;
  quote: string;
  sector: Sector;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    id: '1',
    name: 'Amadou Diallo',
    role: 'Producteur de maïs',
    country: 'Sénégal',
    country_code: 'SN',
    avatar: '/images/testimonials/amadou.jpg',
    rating: 5,
    quote: "AgriIntel360 m'a permis d'augmenter mon rendement de maïs de 30% grâce aux prévisions météo et aux alertes personnalisées.",
    sector: 'vegetal',
  },
  {
    id: '2',
    name: 'Fatima Ouédraogo',
    role: 'Éleveuse',
    country: 'Burkina Faso',
    country_code: 'BF',
    avatar: '/images/testimonials/fatima.jpg',
    rating: 5,
    quote: "Le suivi de mon cheptel est devenu tellement plus simple. Les alertes de mortalité m'ont sauvé plusieurs fois.",
    sector: 'animal',
  },
  {
    id: '3',
    name: 'Kofi Mensah',
    role: 'Pêcheur',
    country: 'Ghana',
    country_code: 'GH',
    avatar: '/images/testimonials/kofi.jpg',
    rating: 5,
    quote: 'La carte interactive me montre les meilleures zones de pêche. Mes revenus ont augmenté de 25% cette année.',
    sector: 'halieutique',
  },
  {
    id: '4',
    name: 'Aïcha Traoré',
    role: 'Coopérative forestière',
    country: "Côte d'Ivoire",
    country_code: 'CI',
    avatar: '/images/testimonials/aicha.jpg',
    rating: 5,
    quote: 'La certification et le suivi des PFNL nous ont ouvert de nouveaux marchés internationaux.',
    sector: 'forestier',
  },
  {
    id: '5',
    name: 'Jean-Pierre Ndaye',
    role: 'Agronome',
    country: 'Cameroun',
    country_code: 'CM',
    avatar: '/images/testimonials/jp.jpg',
    rating: 4,
    quote: "Les données de précision et les modèles prédictifs sont d'une qualité remarquable pour la recherche agronomique.",
    sector: 'vegetal',
  },
];

// ============================================================================
// SECTION 14: LANDING PAGE STATS
// ============================================================================

export const LANDING_STATS = [
  { value: '50,000+', label: 'Producteurs actifs', suffix: '' },
  { value: '2.5M', label: 'Hectares suivis', suffix: 'ha' },
  { value: '54', label: 'Pays couverts', suffix: '' },
  { value: '98.5', label: 'Précision IA', suffix: '%' },
  { value: '12', label: 'Langues supportées', suffix: '' },
  { value: '24/7', label: 'Support disponible', suffix: '' },
] as const;

// ============================================================================
// SECTION 15: SECTOR SHOWCASE
// ============================================================================

export interface SectorShowcase {
  id: Sector;
  label: string;
  emoji: string;
  stats: string;
  description: string;
  features: string[];
  color: string;
  image: string;
}

export const SECTOR_SHOWCASE: SectorShowcase[] = [
  {
    id: 'vegetal',
    label: 'Végétal',
    emoji: '🌱',
    stats: '35,000 producteurs | 1.2M ha | 30+ cultures',
    description: 'Suivi complet de la production végétale : cultures, rendements, prix du marché et prédictions de récolte.',
    features: [
      'Suivi parcelles GPS',
      'Alertes ravageurs & maladies',
      'Prix marchés en temps réel',
      'Prédictions rendement IA',
      'Calendrier cultural personnalisé',
      'Recommandations engrais',
    ],
    color: '#16A34A',
    image: '/images/sectors/vegetal.jpg',
  },
  {
    id: 'animal',
    label: 'Animal',
    emoji: '🐄',
    stats: '8,500 éleveurs | 180,000 têtes | 13 espèces',
    description: 'Gestion du cheptel, suivi sanitaire, productivité laitière et alertes de mortalité en temps réel.',
    features: [
      'Suivi individuel cheptel',
      'Alertes mortalité & maladies',
      'Productivité laitière',
      'Annuaire vétérinaires',
      'Génétique & reproduction',
      'Traçabilité complète',
    ],
    color: '#D97706',
    image: '/images/sectors/animal.jpg',
  },
  {
    id: 'halieutique',
    label: 'Halieutique',
    emoji: '🎣',
    stats: '4,200 pêcheurs | 2,800 pirogues | 45 ports',
    description: 'Cartographie des zones de pêche, suivi des captures et gestion durable des ressources halieutiques.',
    features: [
      'Cartographie zones de pêche',
      'Suivi captures & débarquements',
      'Météo marine & marées',
      'Annuaire ports débarquement',
      'Alertes interdictions',
      'Traçabilité lots',
    ],
    color: '#0891B2',
    image: '/images/sectors/halieutique.jpg',
  },
  {
    id: 'forestier',
    label: 'Forestier',
    emoji: '🌲',
    stats: '1,800 exploitants | 45 PFNL | 22 forêts',
    description: 'Gestion durable des forêts, suivi des PFNL et certification des exploitations forestières.',
    features: [
      'Cartographie forêts & concessions',
      'Suivi PFNL (miel, karité, gomme)',
      'Certification FSC/PEFC',
      'Alertes surexploitation',
      'Traçabilité bois',
      'Reboisement & carbone',
    ],
    color: '#92400E',
    image: '/images/sectors/forestier.jpg',
  },
  {
    id: 'minier',
    label: 'Minier',
    emoji: '⛏️',
    stats: '320 sites | 12 minerais | 8 pays',
    description: "Suivi des activités minières et leur impact sur l'agriculture environnante.",
    features: [
      'Cartographie sites miniers',
      'Impact environnemental',
      'Rehabilitation terres',
      'Alertes pollution',
      'Conflits usage terres',
    ],
    color: '#6B7280',
    image: '/images/sectors/minier.jpg',
  },
  {
    id: 'industriel',
    label: 'Industriel',
    emoji: '🏭',
    stats: '450 usines | 28 produits | 15 pays',
    description: 'Transformation agroalimentaire, traçabilité et optimisation de la chaîne de valeur.',
    features: [
      'Suivi transformation',
      'Traçabilité lots',
      'Qualité & normes',
      'Optimisation chaîne valeur',
      'Marchés export',
    ],
    color: '#4F46E5',
    image: '/images/sectors/industriel.jpg',
  },
];

// ============================================================================
// SECTION 16: TIME & DATE CONFIGURATION
// ============================================================================

export const DEFAULT_TIMEZONE = 'Africa/Dakar';
export const SUPPORTED_TIMEZONES = [
  'Africa/Dakar',
  'Africa/Lagos',
  'Africa/Accra',
  'Africa/Abidjan',
  'Africa/Casablanca',
  'Africa/Cairo',
  'Africa/Nairobi',
  'Africa/Johannesburg',
  'Africa/Kigali',
  'Africa/Addis_Ababa',
] as const;

export const DATE_FORMATS = [
  { value: 'dd/MM/yyyy', label: '22/05/2026', example: 'JJ/MM/AAAA' },
  { value: 'MM/dd/yyyy', label: '05/22/2026', example: 'MM/JJ/AAAA' },
  { value: 'yyyy-MM-dd', label: '2026-05-22', example: 'AAAA-MM-JJ' },
  { value: 'dd MMMM yyyy', label: '22 mai 2026', example: 'JJ Mois AAAA' },
] as const;

export const DEFAULT_DATE_FORMAT = 'dd/MM/yyyy';

// ============================================================================
// SECTION 17: NOTIFICATION & ALERT CONFIGURATION
// ============================================================================

export const NOTIFICATION_CHANNELS = ['email', 'sms', 'push', 'in_app'] as const;

export const ALERT_TYPES = [
  'weather', 'price', 'pest', 'disease', 'market', 'policy', 'social',
] as const;

export const ALERT_SEVERITY_LEVELS = ['info', 'warning', 'critical', 'emergency'] as const;

export const NOTIFICATION_DEFAULTS = {
  email: true,
  sms: false,
  push: true,
  in_app: true,
} as const;

// ============================================================================
// SECTION 18: API & RATE LIMITS
// ============================================================================

export const API_RATE_LIMITS = {
  free: { requests_per_minute: 10, requests_per_day: 150 },
  pro: { requests_per_minute: 60, requests_per_day: 10000 },
  enterprise: { requests_per_minute: 300, requests_per_day: Infinity },
} as const;

export const API_TIMEOUT = 30000; // 30 seconds
export const API_MAX_RETRIES = 3;

// ============================================================================
// SECTION 19: SEO & META
// ============================================================================

export const SEO_DEFAULTS = {
  title: `${APP_NAME} - ${APP_TAGLINE}`,
  description: APP_DESCRIPTION,
  keywords: [
    'agriculture', 'Afrique', 'intelligence agricole', 'prédiction',
    'météo', 'prix', 'marché', 'élevage', 'pêche', 'forêt',
    'rendement', 'culture', 'maïs', 'riz', 'cacao',
  ],
  og_image: '/images/og-image.jpg',
  twitter_handle: '@agriintel360',
} as const;

// ============================================================================
// SECTION 20: EXPORT GROUPING
// ============================================================================

export const AppConfig = {
  APP_NAME,
  APP_TAGLINE,
  APP_DESCRIPTION,
  APP_VERSION,
  APP_URL,
  API_URL,
  DEFAULT_PAGE_SIZE,
  PAGE_SIZE_OPTIONS,
  MAX_IMAGE_SIZE,
  MAX_VIDEO_SIZE,
  MAX_AUDIO_SIZE,
  MAX_DOCUMENT_SIZE,
  MAX_IMAGE_DIMENSION,
  SECTORS,
  SECTOR_CONFIG,
  CROPS,
  CROP_CATEGORIES,
  ANIMAL_SPECIES,
  ANIMAL_CATEGORIES,
  USER_ROLES,
  ROLE_LABELS,
  LLM_PROVIDERS,
  DEFAULT_LLM_PROVIDER,
  CHATBOT_NAME,
  CHATBOT_SUGGESTIONS,
  PRICING_PLANS,
  TESTIMONIALS,
  LANDING_STATS,
  SECTOR_SHOWCASE,
  MAP_DEFAULT_CENTER,
  MAP_DEFAULT_ZOOM,
  DEFAULT_TIMEZONE,
  SUPPORTED_TIMEZONES,
  DATE_FORMATS,
  DEFAULT_DATE_FORMAT,
  SEO_DEFAULTS,
} as const;
