// ============================================================================
// SECTION 1: CORE TYPES & ENUMS
// ============================================================================

export type Sector = 'vegetal' | 'animal' | 'halieutique' | 'forestier' | 'minier' | 'industriel';

export type ActorRole =
  | 'producteur'
  | 'eleveur'
  | 'pecheur'
  | 'exploitant_forestier'
  | 'cooperative'
  | 'groupement'
  | 'transformateur'
  | 'commercant'
  | 'exportateur'
  | 'importateur'
  | 'fournisseur_intrants'
  | 'veterinaire'
  | 'agronome'
  | 'technicien'
  | 'chercheur'
  | 'ong'
  | 'institution'
  | 'financier'
  | 'assureur'
  | 'transporteur'
  | 'stockeur'
  | 'semencier'
  | 'irrigant'
  | 'mecanisateur'
  | 'certifieur'
  | 'auditeur'
  | 'consultant'
  | 'formateur'
  | 'journaliste'
  | 'fonctionnaire'
  | 'elu'
  | 'autre';

export type FarmingType = 'extensif' | 'intensif' | 'semi-intensif' | 'biologique' | 'permaculture';

export type CertificationType = 'bio' | 'fairtrade' | 'rainforest' | 'fsc' | 'pefc' | 'globalgap' | 'local';

export type ActorStatus = 'active' | 'inactive' | 'pending' | 'suspended' | 'verified';

export type Gender = 'homme' | 'femme' | 'autre' | 'prefere_pas_dire';

export type LanguageCode = 'fr' | 'en' | 'wo' | 'ha' | 'ar' | 'sw' | 'pt' | 'bm' | 'dy';

// ============================================================================
// SECTION 2: ACTOR CORE INTERFACE
// ============================================================================

export interface Actor {
  id: string;
  name: string;
  slug: string;
  role: ActorRole;
  sector: Sector;
  sub_sector?: string;

  // Location
  country: string;          // ISO 3166-1 alpha-2
  country_name?: string;
  region: string;
  region_code?: string;
  city: string;
  address?: string;
  postal_code?: string;
  latitude?: number;
  longitude?: number;
  location_precision?: 'exact' | 'approximate' | 'city_only';

  // Contact
  phone?: string;
  phone_secondary?: string;
  email?: string;
  email_secondary?: string;
  website?: string;
  whatsapp?: string;
  telegram?: string;

  // Organization
  organisation?: string;
  organisation_type?: 'cooperative' | 'groupement' | 'entreprise' | 'ong' | 'institution' | 'individuel';
  organisation_size?: 'micro' | 'small' | 'medium' | 'large';
  siret?: string;             // Business registration number
  tax_id?: string;

  // Profile
  avatar?: string;
  cover_image?: string;
  bio?: string;
  description?: string;
  short_bio?: string;
  languages: LanguageCode[];

  // Classification
  tags: string[];
  specializations: string[];
  products: string[];
  services: string[];

  // Status
  status: ActorStatus;
  is_active: boolean;
  is_verified: boolean;
  is_featured: boolean;
  is_premium: boolean;
  verification_date?: string;
  verification_method?: 'email' | 'phone' | 'document' | 'manual' | 'partner';

  // Demographics
  gender?: Gender;
  birth_year?: number;
  education_level?: 'none' | 'primary' | 'secondary' | 'tertiary' | 'postgraduate';
  experience_years?: number;

  // Social
  facebook?: string;
  twitter?: string;
  linkedin?: string;
  youtube?: string;
  instagram?: string;

  // Metadata
  created_at: string;
  updated_at: string;
  last_login_at?: string;
  last_activity_at?: string;
  view_count: number;
  contact_count: number;

  // Ratings
  rating_average?: number;
  rating_count?: number;
  review_count?: number;

  // Sector-specific data
  vegetal_data?: VegetalData;
  animal_data?: AnimalData;
  halieutique_data?: HalieutiqueData;
  forestier_data?: ForestierData;
  minier_data?: MinierData;
  industriel_data?: IndustrielData;
}

// ============================================================================
// SECTION 3: SECTOR-SPECIFIC DATA INTERFACES
// ============================================================================

// ─────────────────────────────────────────────────────────────────────────────
// Végétal
// ─────────────────────────────────────────────────────────────────────────────
export interface VegetalData {
  // Surface
  total_area_ha: number;
  cultivated_area_ha?: number;
  irrigated_area_ha?: number;
  fallow_area_ha?: number;
  owned_land_ha?: number;
  rented_land_ha?: number;

  // Cultures
  crops: CropInfo[];
  main_crop?: string;
  secondary_crops?: string[];
  crop_rotation?: string[];

  // Production
  yield_kg_ha?: number;
  annual_production_tonnes?: number;
  production_capacity?: number;

  // Équipement
  equipment: EquipmentInfo[];
  has_tractor: boolean;
  has_harvester: boolean;
  has_irrigation: boolean;
  has_storage: boolean;
  has_processing: boolean;

  // Certifications
  certifications: CertificationInfo[];
  organic_certified: boolean;
  fairtrade_certified: boolean;

  // Économique
  annual_revenue?: number;
  revenue_currency?: string;
  price_per_kg?: number;

  // Environnement
  water_source?: 'river' | 'well' | 'rain' | 'dam' | 'mixed';
  soil_type?: 'sandy' | 'clay' | 'loamy' | 'laterite' | 'alluvial';
  climate_zone?: 'sahel' | 'soudan' | 'guinea' | 'equatorial' | 'montane';
  agroecological_zone?: string;
}

export interface CropInfo {
  name: string;
  variety?: string;
  area_ha?: number;
  yield_kg_ha?: number;
  production_tonnes?: number;
  season?: 'dry' | 'wet' | 'both' | 'year_round';
  sowing_month?: number;     // 1-12
  harvest_month?: number;    // 1-12
  irrigation_type?: 'gravity' | 'sprinkler' | 'drip' | 'manual';
  fertilizer_type?: string[];
  pesticide_use?: boolean;
  organic?: boolean;
}

export interface EquipmentInfo {
  type: string;
  count: number;
  condition: 'new' | 'good' | 'fair' | 'poor';
  acquisition_year?: number;
  brand?: string;
}

export interface CertificationInfo {
  type: CertificationType;
  certifier?: string;
  certificate_number?: string;
  valid_from?: string;
  valid_until?: string;
  status: 'active' | 'pending' | 'expired' | 'suspended';
}

// ─────────────────────────────────────────────────────────────────────────────
// Animal
// ─────────────────────────────────────────────────────────────────────────────
export interface AnimalData {
  // Cheptel
  total_livestock: number;
  species: AnimalSpeciesInfo[];
  main_species?: string;

  // Type d'élevage
  farming_type: FarmingType;
  housing_type?: 'open' | 'semi_open' | 'closed' | 'pastoral';
  feeding_system?: 'grazing' | 'cut_and_carry' | 'stall' | 'mixed';

  // Production
  milk_productivity_litres_day?: number;
  egg_productivity_eggs_year?: number;
  wool_productivity_kg_year?: number;
  meat_productivity_kg_year?: number;

  // Santé
  mortality_rate?: number;
  vaccination_program?: boolean;
  veterinary_visits_per_year?: number;
  veterinarian?: string;
  veterinarian_phone?: string;

  // Reproduction
  breeding_method?: 'natural' | 'ai' | 'mixed'; // AI = artificial insemination
  calving_interval_months?: number;
  fertility_rate?: number;

  // Équipement
  equipment: string[];
  has_milking_machine: boolean;
  has_cooling: boolean;
  has_biogas: boolean;

  // Certifications
  certifications: CertificationInfo[];
  animal_welfare_certified: boolean;

  // Économique
  annual_revenue?: number;
  revenue_currency?: string;
  milk_price_per_litre?: number;
  meat_price_per_kg?: number;
}

export interface AnimalSpeciesInfo {
  species: string;
  count: number;
  breed?: string;
  average_age_months?: number;
  average_weight_kg?: number;
  purpose: 'meat' | 'milk' | 'eggs' | 'wool' | 'traction' | 'mixed';
  organic?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Halieutique
// ─────────────────────────────────────────────────────────────────────────────
export interface HalieutiqueData {
  // Flotte
  pirogues_count: number;
  pirogue_types: PirogueInfo[];
  total_capacity_kg?: number;

  // Équipement
  nets: NetInfo[];
  motor: boolean;
  motor_count?: number;
  motor_power_hp?: number;
  has_gps: boolean;
  has_sonar: boolean;
  has_vhf: boolean;
  has_safety_equipment: boolean;

  // Organisation
  groupement?: string;
  groupement_members?: number;
  port?: string;
  port_code?: string;
  landing_site?: string;

  // Production
  fishing_areas: FishingAreaInfo[];
  annual_catch_tonnes?: number;
  main_species: string[];
  secondary_species?: string[];
  trips_per_month?: number;
  trip_duration_hours?: number;
  revenue_per_trip?: number;
  revenue_currency?: string;

  // Durabilité
  sustainable_fishing: boolean;
  mesh_size_mm?: number;
  closed_season_compliant: boolean;
  quota_compliant: boolean;

  // Certifications
  certifications: CertificationInfo[];
  msc_certified: boolean;
}

export interface PirogueInfo {
  type: string;
  length_m?: number;
  material: 'wood' | 'fiberglass' | 'aluminum' | 'mixed';
  year_built?: number;
  capacity_kg?: number;
}

export interface NetInfo {
  type: string;
  mesh_size_mm?: number;
  length_m?: number;
  material?: string;
}

export interface FishingAreaInfo {
  name: string;
  coordinates?: [number, number]; // [lng, lat]
  depth_m?: number;
  distance_km?: number;
  species: string[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Forestier
// ─────────────────────────────────────────────────────────────────────────────
export interface ForestierData {
  // Exploitation
  exploitation_type: string[];
  forest_area_ha?: number;
  owned_area_ha?: number;
  concession_area_ha?: number;
  land_title: boolean;
  title_number?: string;
  concession_duration_years?: number;

  // PFNL
  pfnl_products: PFNLProductInfo[];
  main_products: string[];
  annual_production_tonnes?: number;

  // Forêt
  forest_type?: 'primary' | 'secondary' | 'plantation' | 'agroforestry' | 'mangrove';
  tree_species: string[];
  forest_age_years?: number;
  regeneration_rate?: number;

  // Équipement
  equipment: string[];
  has_sawmill: boolean;
  has_drying_kiln: boolean;
  has_transport: boolean;

  // Certifications
  certifications: CertificationInfo[];
  fsc_certified: boolean;
  pefc_certified: boolean;
  legal_origin_verified: boolean;

  // Économique
  annual_revenue?: number;
  revenue_currency?: string;
  price_per_m3?: number;

  // Environnement
  biodiversity_index?: number;
  carbon_stock_tonnes?: number;
  reforestation_area_ha?: number;
}

export interface PFNLProductInfo {
  name: string;
  category: 'honey' | 'gum' | 'butter' | 'oil' | 'fruit' | 'nut' | 'resin' | 'bark' | 'leaf' | 'other';
  annual_production_kg?: number;
  harvest_season?: string;
  price_per_kg?: number;
  organic?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Minier
// ─────────────────────────────────────────────────────────────────────────────
export interface MinierData {
  site_type: 'artisanal' | 'small_scale' | 'industrial';
  minerals: string[];
  site_count?: number;
  workers_count?: number;
  annual_production_tonnes?: number;
  revenue_currency?: string;
  environmental_impact?: 'low' | 'medium' | 'high';
  rehabilitation_plan?: boolean;
  safety_certified?: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// Industriel
// ─────────────────────────────────────────────────────────────────────────────
export interface IndustrielData {
  industry_type: string[];
  factory_count?: number;
  processing_capacity_tonnes_day?: number;
  products: string[];
  certifications: CertificationInfo[];
  haccp_certified: boolean;
  iso_certified: boolean;
  export_markets: string[];
  annual_revenue?: number;
  revenue_currency?: string;
  employee_count?: number;
  women_employee_percentage?: number;
}

// ============================================================================
// SECTION 4: ACTOR RELATIONSHIPS & NETWORK
// ============================================================================

export interface ActorRelationship {
  id: string;
  source_actor_id: string;
  target_actor_id: string;
  relationship_type: 'supplier' | 'client' | 'partner' | 'competitor' | 'investor' | 'mentor' | 'subsidiary' | 'parent';
  strength: 'weak' | 'medium' | 'strong';
  start_date?: string;
  end_date?: string;
  description?: string;
  is_active: boolean;
}

export interface ActorNetwork {
  actor_id: string;
  connections: ActorConnection[];
  network_size: number;
  network_density: number;
  influence_score: number;
}

export interface ActorConnection {
  actor_id: string;
  actor_name: string;
  actor_avatar?: string;
  relationship_type: ActorRelationship['relationship_type'];
  strength: ActorRelationship['strength'];
  mutual_connections: number;
}

// ============================================================================
// SECTION 5: ACTOR REVIEWS & RATINGS
// ============================================================================

export interface ActorReview {
  id: string;
  actor_id: string;
  reviewer_id: string;
  reviewer_name: string;
  reviewer_avatar?: string;
  rating: 1 | 2 | 3 | 4 | 5;
  title?: string;
  content: string;
  tags: string[];
  is_verified_purchase: boolean;
  helpful_count: number;
  created_at: string;
  updated_at?: string;
}

export interface ActorRatingSummary {
  average: number;
  count: number;
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
}

// ============================================================================
// SECTION 6: ACTOR FILTERS & PAGINATION
// ============================================================================

export interface ActorFilters {
  // Search
  search?: string;
  q?: string;

  // Classification
  sector?: Sector;
  sectors?: Sector[];
  role?: ActorRole;
  roles?: ActorRole[];
  tags?: string[];
  specializations?: string[];
  products?: string[];
  services?: string[];

  // Location
  country?: string;
  countries?: string[];
  region?: string;
  regions?: string[];
  city?: string;
  near_coordinates?: [number, number]; // [lng, lat]
  radius_km?: number;

  // Status
  status?: ActorStatus;
  is_verified?: boolean;
  is_active?: boolean;
  is_featured?: boolean;
  is_premium?: boolean;

  // Demographics
  gender?: Gender;
  organisation_type?: Actor['organisation_type'];
  organisation_size?: Actor['organisation_size'];
  experience_min?: number;
  experience_max?: number;

  // Sector-specific
  has_vegetal_data?: boolean;
  has_animal_data?: boolean;
  has_halieutique_data?: boolean;
  has_forestier_data?: boolean;
  certifications?: CertificationType[];
  organic_only?: boolean;
  fairtrade_only?: boolean;

  // Sorting
  sort_by?: 'name' | 'created_at' | 'updated_at' | 'rating' | 'distance' | 'relevance';
  sort_order?: 'asc' | 'desc';

  // Pagination
  page?: number;
  limit?: number;
  offset?: number;
}

export interface ActorListResponse {
  data: Actor[];
  meta: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
    has_next: boolean;
    has_prev: boolean;
  };
  facets?: {
    sectors: Record<Sector, number>;
    roles: Record<string, number>;
    countries: Record<string, number>;
    certifications: Record<string, number>;
  };
}

export interface ActorAutocompleteItem {
  id: string;
  name: string;
  sector: Sector;
  role: ActorRole;
  country: string;
  avatar?: string;
  match_type: 'name' | 'organisation' | 'product' | 'city';
}

// ============================================================================
// SECTION 7: ACTOR ACTIVITY & ANALYTICS
// ============================================================================

export interface ActorActivity {
  id: string;
  actor_id: string;
  activity_type: 'profile_view' | 'contact_click' | 'product_view' | 'review_posted' | 'document_download' | 'map_interaction';
  metadata?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface ActorAnalytics {
  actor_id: string;
  period: '7d' | '30d' | '90d' | '1y';
  profile_views: number;
  contact_clicks: number;
  search_appearances: number;
  map_views: number;
  top_referrers: string[];
  top_countries: Record<string, number>;
  peak_hours: Record<number, number>;
  conversion_rate: number;
}

// ============================================================================
// SECTION 8: ACTOR IMPORT/EXPORT
// ============================================================================

export interface ActorImportRow {
  name: string;
  role: ActorRole;
  sector: Sector;
  country: string;
  region: string;
  city: string;
  phone?: string;
  email?: string;
  latitude?: number;
  longitude?: number;
  organisation?: string;
  tags?: string[];
  errors?: string[];
  warnings?: string[];
}

export interface ActorImportResult {
  total: number;
  created: number;
  updated: number;
  failed: number;
  errors: { row: number; message: string }[];
  warnings: { row: number; message: string }[];
}

// ============================================================================
// SECTION 9: ACTOR FORM DATA (for creation/update)
// ============================================================================

export interface ActorFormData {
  // Required
  name: string;
  role: ActorRole;
  sector: Sector;
  country: string;
  region: string;
  city: string;

  // Optional
  address?: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  email?: string;
  website?: string;
  organisation?: string;
  organisation_type?: Actor['organisation_type'];
  bio?: string;
  tags?: string[];
  specializations?: string[];
  products?: string[];
  services?: string[];
  avatar?: File | string;
  cover_image?: File | string;

  // Sector data (one of these based on sector)
  vegetal_data?: VegetalData;
  animal_data?: AnimalData;
  halieutique_data?: HalieutiqueData;
  forestier_data?: ForestierData;
  minier_data?: MinierData;
  industriel_data?: IndustrielData;
}

// ============================================================================
// SECTION 10: HELPER TYPES & CONSTANTS
// ============================================================================

export const SECTOR_LABELS: Record<Sector, string> = {
  vegetal: 'Végétal',
  animal: 'Animal',
  halieutique: 'Halieutique',
  forestier: 'Forestier',
  minier: 'Minier',
  industriel: 'Industriel',
};

export const ROLE_LABELS: Record<ActorRole, string> = {
  producteur: 'Producteur',
  eleveur: 'Éleveur',
  pecheur: 'Pêcheur',
  exploitant_forestier: 'Exploitant forestier',
  cooperative: 'Coopérative',
  groupement: 'Groupement',
  transformateur: 'Transformateur',
  commercant: 'Commerçant',
  exportateur: 'Exportateur',
  importateur: 'Importateur',
  fournisseur_intrants: "Fournisseur d'intrants",
  veterinaire: 'Vétérinaire',
  agronome: 'Agronome',
  technicien: 'Technicien',
  chercheur: 'Chercheur',
  ong: 'ONG',
  institution: 'Institution',
  financier: 'Financier',
  assureur: 'Assureur',
  transporteur: 'Transporteur',
  stockeur: 'Stockeur',
  semencier: 'Semencier',
  irrigant: 'Irrigant',
  mecanisateur: 'Mécanisateur',
  certifieur: 'Certifieur',
  auditeur: 'Auditeur',
  consultant: 'Consultant',
  formateur: 'Formateur',
  journaliste: 'Journaliste',
  fonctionnaire: 'Fonctionnaire',
  elu: 'Élu',
  autre: 'Autre',
};

export const STATUS_LABELS: Record<ActorStatus, string> = {
  active: 'Actif',
  inactive: 'Inactif',
  pending: 'En attente',
  suspended: 'Suspendu',
  verified: 'Vérifié',
};

export const STATUS_COLORS: Record<ActorStatus, string> = {
  active: '#22C55E',
  inactive: '#6B7280',
  pending: '#EAB308',
  suspended: '#DC2626',
  verified: '#3B82F6',
};

export const FARMING_TYPE_LABELS: Record<FarmingType, string> = {
  extensif: 'Extensif',
  intensif: 'Intensif',
  'semi-intensif': 'Semi-intensif',
  biologique: 'Biologique',
  permaculture: 'Permaculture',
};

export const CERTIFICATION_LABELS: Record<CertificationType, string> = {
  bio: 'Bio / Organic',
  fairtrade: 'Fairtrade',
  rainforest: 'Rainforest Alliance',
  fsc: 'FSC',
  pefc: 'PEFC',
  globalgap: 'GlobalG.A.P',
  local: 'Certification locale',
};

export const GENDER_LABELS: Record<Gender, string> = {
  homme: 'Homme',
  femme: 'Femme',
  autre: 'Autre',
  prefere_pas_dire: 'Préfère ne pas dire',
};

// ============================================================================
// SECTION 11: UTILITY FUNCTIONS
// ============================================================================

/**
 * Get sector label.
 */
export function getSectorLabel(sector: Sector): string {
  return SECTOR_LABELS[sector] || sector;
}

/**
 * Get role label.
 */
export function getRoleLabel(role: ActorRole): string {
  return ROLE_LABELS[role] || role;
}

/**
 * Get status label.
 */
export function getStatusLabel(status: ActorStatus): string {
  return STATUS_LABELS[status] || status;
}

/**
 * Get status color.
 */
export function getStatusColor(status: ActorStatus): string {
  return STATUS_COLORS[status] || '#6B7280';
}

/**
 * Check if actor has sector-specific data.
 */
export function hasSectorData(actor: Actor, sector: Sector): boolean {
  switch (sector) {
    case 'vegetal': return !!actor.vegetal_data;
    case 'animal': return !!actor.animal_data;
    case 'halieutique': return !!actor.halieutique_data;
    case 'forestier': return !!actor.forestier_data;
    case 'minier': return !!actor.minier_data;
    case 'industriel': return !!actor.industriel_data;
    default: return false;
  }
}

/**
 * Get actor's primary sector data.
 */
export function getPrimarySectorData(actor: Actor): unknown {
  switch (actor.sector) {
    case 'vegetal': return actor.vegetal_data;
    case 'animal': return actor.animal_data;
    case 'halieutique': return actor.halieutique_data;
    case 'forestier': return actor.forestier_data;
    case 'minier': return actor.minier_data;
    case 'industriel': return actor.industriel_data;
    default: return undefined;
  }
}

/**
 * Format actor display name.
 */
export function getActorDisplayName(actor: Actor): string {
  if (actor.organisation) {
    return `${actor.name} (${actor.organisation})`;
  }
  return actor.name;
}

/**
 * Get actor location string.
 */
export function getActorLocation(actor: Actor): string {
  const parts = [actor.city, actor.region, actor.country_name || actor.country].filter(Boolean);
  return parts.join(', ');
}

/**
 * Check if actor is contactable.
 */
export function isContactable(actor: Actor): boolean {
  return !!(actor.phone || actor.email || actor.whatsapp);
}

/**
 * Get actor initials for avatar fallback.
 */
export function getActorInitials(actor: Actor): string {
  return actor.name
    .split(/\s+/)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}
