// ============================================================================
// SYSTÈME I18N — Traductions FR/EN pour AgriIntel360
// ============================================================================

export type Language = 'fr' | 'en' | 'pt';

export interface Translations {
  // Navigation
  nav: {
    dashboard: string;
    messages: string;
    community: string;
    alerts: string;
    actors: string;
    analytics: string;
    indicators: string;
    predictions: string;
    chatbot: string;
    files: string;
    weather: string;
    map: string;
    admin: string;
    settings: string;
    notifications: string;
    logout: string;
    production: string;
    animal: string;
    forestier: string;
    halieutique: string;
  };

  // Common
  common: {
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    create: string;
    search: string;
    loading: string;
    error: string;
    success: string;
    confirm: string;
    back: string;
    next: string;
    previous: string;
    close: string;
    submit: string;
    reset: string;
    noData: string;
    view: string;
    download: string;
    upload: string;
    share: string;
    filter: string;
    sort: string;
    all: string;
    yes: string;
    no: string;
    required: string;
    optional: string;
    more: string;
    less: string;
    total: string;
    today: string;
    yesterday: string;
    thisWeek: string;
    thisMonth: string;
    send: string;
    reply: string;
    report: string;
    block: string;
    leave: string;
    join: string;
  };

  // Auth
  auth: {
    login: string;
    register: string;
    logout: string;
    email: string;
    password: string;
    confirmPassword: string;
    forgotPassword: string;
    resetPassword: string;
    username: string;
    fullName: string;
    rememberMe: string;
    loginSuccess: string;
    logoutSuccess: string;
    loginError: string;
    registerSuccess: string;
    verifyEmail: string;
    emailVerified: string;
  };

  // Dashboard
  dashboard: {
    title: string;
    welcome: string;
    overview: string;
    stats: string;
    recentActivity: string;
    quickActions: string;
    totalUsers: string;
    activeUsers: string;
    alerts: string;
    predictions: string;
  };

  // Messaging
  messaging: {
    title: string;
    newMessage: string;
    searchConversations: string;
    noConversations: string;
    typeMessage: string;
    send: string;
    sentAt: string;
    online: string;
    offline: string;
    unreadMessages: string;
    deleteConversation: string;
    deleteMessage: string;
    editMessage: string;
    pollVote: string;
    attachFile: string;
    recordVoice: string;
    startConversation: string;
  };

  // Community
  community: {
    title: string;
    groups: string;
    createGroup: string;
    joinGroup: string;
    leaveGroup: string;
    deleteGroup: string;
    members: string;
    posts: string;
    discussions: string;
    events: string;
    searchGroups: string;
    noGroups: string;
    addMember: string;
    removeMember: string;
    reportMember: string;
    reportGroup: string;
    groupAdmin: string;
    groupOwner: string;
    groupMember: string;
    public: string;
    private: string;
    postPlaceholder: string;
    commentPlaceholder: string;
    like: string;
    comment: string;
    share: string;
  };

  // Alerts
  alerts: {
    title: string;
    newAlert: string;
    noAlerts: string;
    markRead: string;
    markAllRead: string;
    deleteAlert: string;
    severity: {
      low: string;
      medium: string;
      high: string;
      critical: string;
    };
    type: {
      weather: string;
      price: string;
      disease: string;
      security: string;
      system: string;
      news: string;
    };
  };

  // Settings
  settings: {
    title: string;
    profile: string;
    preferences: string;
    security: string;
    notifications: string;
    profilePhoto: string;
    coverPhoto: string;
    personalInfo: string;
    professionalInfo: string;
    aboutMe: string;
    fullName: string;
    email: string;
    phone: string;
    gender: string;
    jobTitle: string;
    department: string;
    organization: string;
    country: string;
    bio: string;
    language: string;
    timezone: string;
    theme: string;
    themeLight: string;
    themeDark: string;
    themeSystem: string;
    saveChanges: string;
    profileUpdated: string;
    photoUpdated: string;
    coverUpdated: string;
  };

  // Actors
  actors: {
    title: string;
    search: string;
    filter: string;
    allSectors: string;
    vegetal: string;
    animal: string;
    halieutique: string;
    forestier: string;
    addActor: string;
    viewActor: string;
    verified: string;
    active: string;
    inactive: string;
    contact: string;
    location: string;
    sector: string;
    activityArea: string;
    setPosition: string;
    viewMap: string;
  };

  // Weather
  weather: {
    title: string;
    current: string;
    forecast: string;
    history: string;
    temperature: string;
    humidity: string;
    wind: string;
    precipitation: string;
    uvIndex: string;
    visibility: string;
    searchLocation: string;
    sunrise: string;
    sunset: string;
    feelsLike: string;
    weeklyForecast: string;
  };

  // Admin
  admin: {
    title: string;
    userManagement: string;
    rolePermissions: string;
    systemAlerts: string;
    moderation: string;
    reports: string;
    statistics: string;
    banUser: string;
    activateUser: string;
    deactivateUser: string;
    changeRole: string;
    deleteUser: string;
    systemHealth: string;
    totalUsers: string;
    activeUsers: string;
    verifiedUsers: string;
    pendingReports: string;
  };
}

const fr: Translations = {
  nav: {
    dashboard: 'Tableau de bord',
    messages: 'Messages',
    community: 'Communauté',
    alerts: 'Alertes',
    actors: 'Acteurs',
    analytics: 'Analyses',
    indicators: 'Indicateurs',
    predictions: 'Prédictions',
    chatbot: 'Assistant IA',
    files: 'Fichiers',
    weather: 'Météo',
    map: 'Carte',
    admin: 'Administration',
    settings: 'Paramètres',
    notifications: 'Notifications',
    logout: 'Déconnexion',
    production: 'Production',
    animal: 'Élevage',
    forestier: 'Forestier',
    halieutique: 'Halieutique',
  },

  common: {
    save: 'Enregistrer',
    cancel: 'Annuler',
    delete: 'Supprimer',
    edit: 'Modifier',
    create: 'Créer',
    search: 'Rechercher',
    loading: 'Chargement...',
    error: 'Erreur',
    success: 'Succès',
    confirm: 'Confirmer',
    back: 'Retour',
    next: 'Suivant',
    previous: 'Précédent',
    close: 'Fermer',
    submit: 'Soumettre',
    reset: 'Réinitialiser',
    noData: 'Aucune donnée',
    view: 'Voir',
    download: 'Télécharger',
    upload: 'Importer',
    share: 'Partager',
    filter: 'Filtrer',
    sort: 'Trier',
    all: 'Tous',
    yes: 'Oui',
    no: 'Non',
    required: 'Obligatoire',
    optional: 'Optionnel',
    more: 'Plus',
    less: 'Moins',
    total: 'Total',
    today: "Aujourd'hui",
    yesterday: 'Hier',
    thisWeek: 'Cette semaine',
    thisMonth: 'Ce mois',
    send: 'Envoyer',
    reply: 'Répondre',
    report: 'Signaler',
    block: 'Bloquer',
    leave: 'Quitter',
    join: 'Rejoindre',
  },

  auth: {
    login: 'Connexion',
    register: 'Inscription',
    logout: 'Déconnexion',
    email: 'Email',
    password: 'Mot de passe',
    confirmPassword: 'Confirmer le mot de passe',
    forgotPassword: 'Mot de passe oublié ?',
    resetPassword: 'Réinitialiser le mot de passe',
    username: "Nom d'utilisateur",
    fullName: 'Nom complet',
    rememberMe: 'Se souvenir de moi',
    loginSuccess: 'Connexion réussie',
    logoutSuccess: 'Déconnexion réussie',
    loginError: 'Identifiants incorrects',
    registerSuccess: 'Inscription réussie',
    verifyEmail: 'Vérifiez votre email',
    emailVerified: 'Email vérifié',
  },

  dashboard: {
    title: 'Tableau de bord',
    welcome: 'Bienvenue',
    overview: 'Vue d\'ensemble',
    stats: 'Statistiques',
    recentActivity: 'Activité récente',
    quickActions: 'Actions rapides',
    totalUsers: 'Utilisateurs totaux',
    activeUsers: 'Utilisateurs actifs',
    alerts: 'Alertes',
    predictions: 'Prédictions',
  },

  messaging: {
    title: 'Messages',
    newMessage: 'Nouveau message',
    searchConversations: 'Rechercher une conversation',
    noConversations: 'Aucune conversation',
    typeMessage: 'Tapez un message...',
    send: 'Envoyer',
    sentAt: 'Envoyé à',
    online: 'En ligne',
    offline: 'Hors ligne',
    unreadMessages: 'messages non lus',
    deleteConversation: 'Supprimer la conversation',
    deleteMessage: 'Supprimer le message',
    editMessage: 'Modifier le message',
    pollVote: 'Voter',
    attachFile: 'Joindre un fichier',
    recordVoice: 'Enregistrer un message vocal',
    startConversation: 'Démarrer une conversation',
  },

  community: {
    title: 'Communauté',
    groups: 'Groupes',
    createGroup: 'Créer un groupe',
    joinGroup: 'Rejoindre le groupe',
    leaveGroup: 'Quitter le groupe',
    deleteGroup: 'Supprimer le groupe',
    members: 'Membres',
    posts: 'Publications',
    discussions: 'Discussions',
    events: 'Événements',
    searchGroups: 'Rechercher des groupes',
    noGroups: 'Aucun groupe trouvé',
    addMember: 'Ajouter un membre',
    removeMember: 'Retirer du groupe',
    reportMember: 'Signaler ce membre',
    reportGroup: 'Signaler ce groupe',
    groupAdmin: 'Administrateur',
    groupOwner: 'Propriétaire',
    groupMember: 'Membre',
    public: 'Public',
    private: 'Privé',
    postPlaceholder: 'Partagez quelque chose avec le groupe...',
    commentPlaceholder: 'Écrire un commentaire...',
    like: 'J\'aime',
    comment: 'Commenter',
    share: 'Partager',
  },

  alerts: {
    title: 'Alertes',
    newAlert: 'Nouvelle alerte',
    noAlerts: 'Aucune alerte',
    markRead: 'Marquer comme lu',
    markAllRead: 'Tout marquer comme lu',
    deleteAlert: "Supprimer l'alerte",
    severity: {
      low: 'Faible',
      medium: 'Moyen',
      high: 'Élevé',
      critical: 'Critique',
    },
    type: {
      weather: 'Météo',
      price: 'Prix',
      disease: 'Maladie',
      security: 'Sécurité',
      system: 'Système',
      news: 'Actualité',
    },
  },

  settings: {
    title: 'Paramètres',
    profile: 'Profil',
    preferences: 'Préférences',
    security: 'Sécurité',
    notifications: 'Notifications',
    profilePhoto: 'Photo de profil',
    coverPhoto: 'Photo de couverture',
    personalInfo: 'Informations personnelles',
    professionalInfo: 'Informations professionnelles',
    aboutMe: 'À propos de moi',
    fullName: 'Nom complet',
    email: 'Email',
    phone: 'Téléphone',
    gender: 'Sexe',
    jobTitle: 'Poste',
    department: 'Département',
    organization: 'Organisation',
    country: 'Pays',
    bio: 'Biographie',
    language: 'Langue',
    timezone: 'Fuseau horaire',
    theme: 'Thème',
    themeLight: 'Mode clair',
    themeDark: 'Mode sombre',
    themeSystem: 'Système',
    saveChanges: 'Enregistrer les modifications',
    profileUpdated: 'Profil mis à jour',
    photoUpdated: 'Photo de profil mise à jour',
    coverUpdated: 'Photo de couverture mise à jour',
  },

  actors: {
    title: 'Acteurs agricoles',
    search: 'Rechercher un acteur',
    filter: 'Filtrer',
    allSectors: 'Tous les secteurs',
    vegetal: 'Végétal',
    animal: 'Animal',
    halieutique: 'Halieutique',
    forestier: 'Forestier',
    addActor: 'Ajouter un acteur',
    viewActor: "Voir l'acteur",
    verified: 'Vérifié',
    active: 'Actif',
    inactive: 'Inactif',
    contact: 'Contact',
    location: 'Localisation',
    sector: 'Secteur',
    activityArea: "Zone d'activité",
    setPosition: 'Définir ma position',
    viewMap: 'Voir sur la carte',
  },

  weather: {
    title: 'Météo',
    current: 'Météo actuelle',
    forecast: 'Prévisions',
    history: 'Historique',
    temperature: 'Température',
    humidity: 'Humidité',
    wind: 'Vent',
    precipitation: 'Précipitations',
    uvIndex: 'Indice UV',
    visibility: 'Visibilité',
    searchLocation: 'Rechercher une ville',
    sunrise: 'Lever du soleil',
    sunset: 'Coucher du soleil',
    feelsLike: 'Ressenti',
    weeklyForecast: 'Prévisions 7 jours',
  },

  admin: {
    title: 'Administration',
    userManagement: 'Gestion des utilisateurs',
    rolePermissions: 'Rôles et permissions',
    systemAlerts: 'Alertes système',
    moderation: 'Modération',
    reports: 'Signalements',
    statistics: 'Statistiques',
    banUser: "Bannir l'utilisateur",
    activateUser: "Activer l'utilisateur",
    deactivateUser: "Désactiver l'utilisateur",
    changeRole: 'Changer le rôle',
    deleteUser: "Supprimer l'utilisateur",
    systemHealth: 'État du système',
    totalUsers: 'Utilisateurs totaux',
    activeUsers: 'Utilisateurs actifs',
    verifiedUsers: 'Utilisateurs vérifiés',
    pendingReports: 'Signalements en attente',
  },
};

const en: Translations = {
  nav: {
    dashboard: 'Dashboard',
    messages: 'Messages',
    community: 'Community',
    alerts: 'Alerts',
    actors: 'Actors',
    analytics: 'Analytics',
    indicators: 'Indicators',
    predictions: 'Predictions',
    chatbot: 'AI Assistant',
    files: 'Files',
    weather: 'Weather',
    map: 'Map',
    admin: 'Administration',
    settings: 'Settings',
    notifications: 'Notifications',
    logout: 'Log out',
    production: 'Production',
    animal: 'Livestock',
    forestier: 'Forestry',
    halieutique: 'Fisheries',
  },

  common: {
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    create: 'Create',
    search: 'Search',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    confirm: 'Confirm',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    close: 'Close',
    submit: 'Submit',
    reset: 'Reset',
    noData: 'No data',
    view: 'View',
    download: 'Download',
    upload: 'Upload',
    share: 'Share',
    filter: 'Filter',
    sort: 'Sort',
    all: 'All',
    yes: 'Yes',
    no: 'No',
    required: 'Required',
    optional: 'Optional',
    more: 'More',
    less: 'Less',
    total: 'Total',
    today: 'Today',
    yesterday: 'Yesterday',
    thisWeek: 'This week',
    thisMonth: 'This month',
    send: 'Send',
    reply: 'Reply',
    report: 'Report',
    block: 'Block',
    leave: 'Leave',
    join: 'Join',
  },

  auth: {
    login: 'Log in',
    register: 'Register',
    logout: 'Log out',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm password',
    forgotPassword: 'Forgot password?',
    resetPassword: 'Reset password',
    username: 'Username',
    fullName: 'Full name',
    rememberMe: 'Remember me',
    loginSuccess: 'Successfully logged in',
    logoutSuccess: 'Successfully logged out',
    loginError: 'Invalid credentials',
    registerSuccess: 'Registration successful',
    verifyEmail: 'Verify your email',
    emailVerified: 'Email verified',
  },

  dashboard: {
    title: 'Dashboard',
    welcome: 'Welcome',
    overview: 'Overview',
    stats: 'Statistics',
    recentActivity: 'Recent activity',
    quickActions: 'Quick actions',
    totalUsers: 'Total users',
    activeUsers: 'Active users',
    alerts: 'Alerts',
    predictions: 'Predictions',
  },

  messaging: {
    title: 'Messages',
    newMessage: 'New message',
    searchConversations: 'Search conversations',
    noConversations: 'No conversations',
    typeMessage: 'Type a message...',
    send: 'Send',
    sentAt: 'Sent at',
    online: 'Online',
    offline: 'Offline',
    unreadMessages: 'unread messages',
    deleteConversation: 'Delete conversation',
    deleteMessage: 'Delete message',
    editMessage: 'Edit message',
    pollVote: 'Vote',
    attachFile: 'Attach file',
    recordVoice: 'Record voice message',
    startConversation: 'Start a conversation',
  },

  community: {
    title: 'Community',
    groups: 'Groups',
    createGroup: 'Create group',
    joinGroup: 'Join group',
    leaveGroup: 'Leave group',
    deleteGroup: 'Delete group',
    members: 'Members',
    posts: 'Posts',
    discussions: 'Discussions',
    events: 'Events',
    searchGroups: 'Search groups',
    noGroups: 'No groups found',
    addMember: 'Add member',
    removeMember: 'Remove from group',
    reportMember: 'Report member',
    reportGroup: 'Report group',
    groupAdmin: 'Admin',
    groupOwner: 'Owner',
    groupMember: 'Member',
    public: 'Public',
    private: 'Private',
    postPlaceholder: 'Share something with the group...',
    commentPlaceholder: 'Write a comment...',
    like: 'Like',
    comment: 'Comment',
    share: 'Share',
  },

  alerts: {
    title: 'Alerts',
    newAlert: 'New alert',
    noAlerts: 'No alerts',
    markRead: 'Mark as read',
    markAllRead: 'Mark all as read',
    deleteAlert: 'Delete alert',
    severity: {
      low: 'Low',
      medium: 'Medium',
      high: 'High',
      critical: 'Critical',
    },
    type: {
      weather: 'Weather',
      price: 'Price',
      disease: 'Disease',
      security: 'Security',
      system: 'System',
      news: 'News',
    },
  },

  settings: {
    title: 'Settings',
    profile: 'Profile',
    preferences: 'Preferences',
    security: 'Security',
    notifications: 'Notifications',
    profilePhoto: 'Profile photo',
    coverPhoto: 'Cover photo',
    personalInfo: 'Personal information',
    professionalInfo: 'Professional information',
    aboutMe: 'About me',
    fullName: 'Full name',
    email: 'Email',
    phone: 'Phone',
    gender: 'Gender',
    jobTitle: 'Job title',
    department: 'Department',
    organization: 'Organization',
    country: 'Country',
    bio: 'Biography',
    language: 'Language',
    timezone: 'Timezone',
    theme: 'Theme',
    themeLight: 'Light mode',
    themeDark: 'Dark mode',
    themeSystem: 'System',
    saveChanges: 'Save changes',
    profileUpdated: 'Profile updated',
    photoUpdated: 'Profile photo updated',
    coverUpdated: 'Cover photo updated',
  },

  actors: {
    title: 'Agricultural actors',
    search: 'Search actors',
    filter: 'Filter',
    allSectors: 'All sectors',
    vegetal: 'Crop',
    animal: 'Livestock',
    halieutique: 'Fisheries',
    forestier: 'Forestry',
    addActor: 'Add actor',
    viewActor: 'View actor',
    verified: 'Verified',
    active: 'Active',
    inactive: 'Inactive',
    contact: 'Contact',
    location: 'Location',
    sector: 'Sector',
    activityArea: 'Activity area',
    setPosition: 'Set my position',
    viewMap: 'View on map',
  },

  weather: {
    title: 'Weather',
    current: 'Current weather',
    forecast: 'Forecast',
    history: 'History',
    temperature: 'Temperature',
    humidity: 'Humidity',
    wind: 'Wind',
    precipitation: 'Precipitation',
    uvIndex: 'UV index',
    visibility: 'Visibility',
    searchLocation: 'Search a city',
    sunrise: 'Sunrise',
    sunset: 'Sunset',
    feelsLike: 'Feels like',
    weeklyForecast: '7-day forecast',
  },

  admin: {
    title: 'Administration',
    userManagement: 'User management',
    rolePermissions: 'Roles & permissions',
    systemAlerts: 'System alerts',
    moderation: 'Moderation',
    reports: 'Reports',
    statistics: 'Statistics',
    banUser: 'Ban user',
    activateUser: 'Activate user',
    deactivateUser: 'Deactivate user',
    changeRole: 'Change role',
    deleteUser: 'Delete user',
    systemHealth: 'System health',
    totalUsers: 'Total users',
    activeUsers: 'Active users',
    verifiedUsers: 'Verified users',
    pendingReports: 'Pending reports',
  },
};

const pt: Translations = fr; // Fallback to French for Portuguese (not yet translated)

const TRANSLATIONS: Record<Language, Translations> = { fr, en, pt };

export function getTranslations(lang: Language = 'fr'): Translations {
  return TRANSLATIONS[lang] || TRANSLATIONS.fr;
}

export function t(lang: Language, section: keyof Translations, key: string): string {
  const translations = getTranslations(lang);
  const sectionObj = translations[section] as Record<string, unknown>;
  return (typeof sectionObj[key] === 'string' ? sectionObj[key] as string : key);
}
