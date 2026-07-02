// ============================================================================
// SECTION 1: CORE TYPES & ENUMS
// ============================================================================

/**
 * Group visibility and access level.
 */
export type GroupType =
  | 'public'       // Visible et accessible à tous
  | 'private'      // Sur invitation ou demande d'adhésion
  | 'professional' // Réservé aux professionnels du secteur
  | 'research'     // Groupe de recherche et d'études
  | 'regional'     // Groupe régional ou local
  | 'thematic';    // Groupe thématique spécialisé

/**
 * Membership status of the current user in a group.
 */
export type MembershipStatus =
  | 'none'      // Non membre
  | 'pending'   // Demande en attente de validation
  | 'member'    // Membre standard
  | 'moderator' // Modérateur (peut modérer le contenu)
  | 'admin'     // Administrateur (peut gérer les membres et paramètres)
  | 'owner';    // Propriétaire (pleins pouvoirs)

/**
 * Types de médias supportés dans les posts.
 */
export type PostMediaType =
  | 'image'     // Image statique
  | 'video'     // Vidéo
  | 'audio'     // Audio / voix
  | 'document'  // PDF, Word, Excel, etc.
  | 'poll'      // Sondage
  | 'event'     // Événement
  | 'link'      // Lien partagé avec preview
  | 'location'; // Point géographique

/**
 * Types de réactions disponibles sur posts et commentaires.
 */
export type ReactionType =
  | 'like'       // 👍 J'aime
  | 'love'       // ❤️ J'adore
  | 'insightful' // 💡 Pertinent
  | 'support'    // 🤝 Soutien
  | 'sad'        // 😔 Triste
  | 'angry';     // 😠 En colère

/**
 * Statut de publication d'un post.
 */
export type PostStatus =
  | 'published'  // Publié et visible
  | 'draft'      // Brouillon (auteur uniquement)
  | 'pending'    // En attente de modération
  | 'archived'   // Archivé
  | 'locked'     // Verrouillé (plus de commentaires)
  | 'pinned';    // Épinglé en haut du groupe

/**
 * Secteur agricole associé au groupe.
 * Aligné avec actor.ts et constants.ts.
 */
export type GroupSector =
  | 'vegetal'
  | 'animal'
  | 'halieutique'
  | 'forestier'
  | 'minier'
  | 'industriel'
  | 'general';

// ============================================================================
// SECTION 2: GROUP ENTITY
// ============================================================================

/**
 * Paramètres avancés du groupe
 */
export interface GroupSettings {
  messaging_blocked: boolean;
  members_can_post: boolean;
  members_can_comment: boolean;
  members_can_invite: boolean;
  members_can_upload: boolean;
  hidden_members: boolean;
  is_archived: boolean;
  mute_notifications: boolean;
}

export const DEFAULT_GROUP_SETTINGS: GroupSettings = {
  messaging_blocked: false,
  members_can_post: true,
  members_can_comment: true,
  members_can_invite: true,
  members_can_upload: true,
  hidden_members: false,
  is_archived: false,
  mute_notifications: false,
};

/**
 * A community group / discussion group.
 */
export interface Group {
  /** Unique group ID */
  id: string;
  /** Human-readable name */
  name: string;
  /** URL-friendly slug */
  slug: string;
  /** Description / mission statement */
  description: string;
  /** Group category */
  type: GroupType;
  /** Related agricultural sector */
  sector: GroupSector;
  /** Group avatar image URL */
  avatar?: string;
  /** Group banner / cover image URL */
  banner?: string;
  /** Tags / keywords */
  tags: string[];
  /** ISO 3166-1 alpha-2 country code */
  country?: string;
  /** Country name (derived) */
  country_name?: string;
  /** Region / state */
  region?: string;
  /** City */
  city?: string;
  /** Number of members */
  members_count: number;
  /** Number of posts */
  posts_count: number;
  /** Number of active discussions this week */
  weekly_activity?: number;
  /** Whether the current user is a member */
  is_member: boolean;
  /** Current user's membership status */
  membership_status: MembershipStatus;
  /** Whether the group requires approval to join */
  requires_approval: boolean;
  /** Maximum number of members (0 = unlimited) */
  max_members?: number;
  /** Whether posts require moderation before publishing */
  moderated: boolean;
  /** Creation timestamp (ISO 8601) */
  created_at: string;
  /** Creator user ID */
  created_by: string;
  /** Creator display info */
  creator?: PostAuthor;
  /** Last activity timestamp */
  updated_at?: string;
  /** Current user's role in the group */
  user_role?: MembershipStatus;
  /** Advanced group settings */
  settings?: GroupSettings;
  /** Rules / guidelines (markdown) */
  rules?: string;
  /** Pinned post IDs */
  pinned_posts?: string[];
  /** Related group IDs (suggested) */
  related_groups?: string[];
}

/**
 * Lightweight group summary for lists and dropdowns.
 */
export interface GroupSummary {
  id: string;
  name: string;
  slug: string;
  type: GroupType;
  sector: GroupSector;
  avatar?: string;
  members_count: number;
  posts_count: number;
  is_member: boolean;
  membership_status: MembershipStatus;
  country?: string;
}

// ============================================================================
// SECTION 3: POST AUTHOR
// ============================================================================

/**
 * Author information embedded in posts and comments.
 */
export interface PostAuthor {
  /** User ID */
  id: string;
  /** Display name */
  name: string;
  /** Avatar URL */
  avatar?: string;
  /** User role label (e.g. "Agronome", "Producteur") */
  role: string;
  /** User role icon */
  role_icon?: string;
  /** Special badge within the group */
  badge?: MembershipStatus;
  /** ISO country code */
  country?: string;
  /** Country flag emoji */
  country_flag?: string;
  /** Whether the account is verified */
  is_verified?: boolean;
}

// ============================================================================
// SECTION 4: POST MEDIA
// ============================================================================

/**
 * A media attachment in a post.
 */
export interface PostMedia {
  /** Unique media ID */
  id: string;
  /** Media category */
  type: PostMediaType;
  /** Public URL */
  url: string;
  /** Thumbnail / preview URL */
  thumbnail?: string;
  /** Original filename */
  filename?: string;
  /** File size in bytes */
  size?: number;
  /** Duration in seconds (audio/video) */
  duration?: number;
  /** Width in pixels (image/video) */
  width?: number;
  /** Height in pixels (image/video) */
  height?: number;
  /** Caption / alt text */
  caption?: string;
  /** MIME type */
  mime_type?: string;
  /** Upload progress 0-1 */
  upload_progress?: number;
  /** Whether upload is complete */
  upload_complete?: boolean;
}

// ============================================================================
// SECTION 5: POLL
// ============================================================================

/**
 * A single option in a poll.
 */
export interface PollOption {
  /** Option ID */
  id: string;
  /** Display text */
  text: string;
  /** Number of votes */
  votes: number;
  /** Whether current user voted for this option */
  has_voted: boolean;
  /** Vote percentage (computed) */
  percentage?: number;
}

/**
 * A poll embedded in a post.
 */
export interface Poll {
  /** Poll question */
  question: string;
  /** Available options */
  options: PollOption[];
  /** Total votes cast */
  total_votes: number;
  /** Whether multiple choices are allowed */
  multiple_choice: boolean;
  /** End date/time (ISO 8601) */
  ends_at: string;
  /** Whether current user has voted */
  has_voted: boolean;
  /** Whether the poll is still open */
  is_open: boolean;
}

// ============================================================================
// SECTION 6: EVENT
// ============================================================================

/**
 * An event embedded in a post.
 */
export interface Event {
  /** Event title */
  title: string;
  /** Description (markdown supported) */
  description?: string;
  /** Event date (ISO 8601) */
  date: string;
  /** Start time (HH:MM) */
  time?: string;
  /** End time (HH:MM) */
  end_time?: string;
  /** Location name */
  location?: string;
  /** Geographic coordinates [lng, lat] */
  coordinates?: [number, number];
  /** Event banner image URL */
  banner?: string;
  /** Number of participants */
  participants_count: number;
  /** Maximum participants (0 = unlimited) */
  max_participants?: number;
  /** Whether current user is participating */
  is_participating: boolean;
  /** Event type */
  event_type?: 'physical' | 'online' | 'hybrid';
  /** Online meeting URL */
  meeting_url?: string;
  /** Organizer info */
  organizer?: PostAuthor;
}

// ============================================================================
// SECTION 7: POST ENTITY
// ============================================================================

/**
 * A post / publication within a group.
 */
export interface Post {
  /** Unique post ID */
  id: string;
  /** Parent group ID */
  group_id: string;
  /** Group info (embedded for convenience) */
  group?: GroupSummary;
  /** Author information */
  author: PostAuthor;
  /** Post text content (markdown supported) */
  content: string;
  /** Whether content is truncated in list view */
  is_truncated?: boolean;
  /** Full content (if truncated) */
  full_content?: string;
  /** Media attachments */
  media: PostMedia[];
  /** Embedded poll */
  poll?: Poll;
  /** Embedded event */
  event?: Event;
  /** Shared link preview */
  link_preview?: LinkPreview;
  /** Geographic location attached */
  location?: MapLocation;
  /** Reactions summary: { reaction_type: count } */
  reactions: Record<ReactionType, number>;
  /** Current user's reaction, if any */
  user_reaction?: ReactionType;
  /** Number of comments */
  comments_count: number;
  /** Number of direct shares */
  shares_count: number;
  /** Number of bookmarks */
  bookmarks_count?: number;
  /** Number of views */
  views_count?: number;
  /** Whether current user bookmarked this post */
  is_bookmarked: boolean;
  /** Publication status */
  status: PostStatus;
  /** Whether post is pinned in the group */
  is_pinned: boolean;
  /** Whether post is locked (no more comments) */
  is_locked?: boolean;
  /** Whether post is highlighted/featured */
  is_featured?: boolean;
  /** Creation timestamp */
  created_at: string;
  /** Last update timestamp */
  updated_at: string;
  /** Scheduled publication time (if scheduled) */
  scheduled_at?: string;
}

/**
 * A shared link with OpenGraph-style preview.
 */
export interface LinkPreview {
  /** Original URL */
  url: string;
  /** Page title */
  title?: string;
  /** Page description */
  description?: string;
  /** Preview image URL */
  image?: string;
  /** Site favicon */
  favicon?: string;
  /** Site domain */
  domain?: string;
}

/**
 * A geographic location attached to a post.
 */
export interface MapLocation {
  /** Latitude */
  lat: number;
  /** Longitude */
  lng: number;
  /** Display name */
  name?: string;
  /** Address */
  address?: string;
  /** Related sector */
  sector?: GroupSector;
}

// ============================================================================
// SECTION 8: COMMENT ENTITY
// ============================================================================

/**
 * A comment on a post.
 */
export interface Comment {
  /** Unique comment ID */
  id: string;
  /** Parent post ID */
  post_id: string;
  /** Parent comment ID (for threaded replies) */
  parent_id?: string;
  /** Author information */
  author: PostAuthor;
  /** Comment text (markdown supported) */
  content: string;
  /** Media attachments */
  media?: PostMedia[];
  /** Reactions summary */
  reactions: Record<ReactionType, number>;
  /** Current user's reaction */
  user_reaction?: ReactionType;
  /** Number of direct replies */
  replies_count: number;
  /** Nested replies (populated on demand) */
  replies?: Comment[];
  /** Whether the comment is edited */
  is_edited?: boolean;
  /** Edit timestamp */
  edited_at?: string;
  /** Whether comment is pinned */
  is_pinned?: boolean;
  /** Creation timestamp */
  created_at: string;
}

/**
 * A comment tree (flattened or nested).
 */
export interface CommentThread {
  /** Root comments */
  roots: Comment[];
  /** Total comment count (including nested) */
  total_count: number;
  /** Whether there are more comments to load */
  has_more: boolean;
  /** Next page cursor */
  next_cursor?: string;
}

// ============================================================================
// SECTION 9: MEMBER ENTITY
// ============================================================================

/**
 * A group member.
 */
export interface Member {
  /** Membership record ID */
  id: string;
  /** User ID */
  user_id: string;
  /** Display name */
  name: string;
  /** Avatar URL */
  avatar?: string;
  /** Membership role in the group */
  role: MembershipStatus;
  /** Join date */
  joined_at: string;
  /** ISO country code */
  country?: string;
  /** Country flag emoji */
  country_flag?: string;
  /** User's main role (e.g. "Agriculteur") */
  user_role?: string;
  /** Number of posts in this group */
  posts_count?: number;
  /** Whether account is verified */
  is_verified?: boolean;
  /** Whether user is online */
  is_online?: boolean;
  /** Last activity timestamp */
  last_active_at?: string;
}

/**
 * Member with extended profile info.
 */
export interface MemberDetail extends Member {
  /** User bio */
  bio?: string;
  /** Organisation */
  organisation?: string;
  /** Contact email (if public) */
  email?: string;
  /** Phone (if public) */
  phone?: string;
  /** Social links */
  social_links?: {
    website?: string;
    facebook?: string;
    twitter?: string;
    linkedin?: string;
  };
  /** Groups in common with current user */
  common_groups?: string[];
}

// ============================================================================
// SECTION 10: NOTIFICATIONS & ACTIVITY
// ============================================================================

/**
 * A notification related to group activity.
 */
export interface GroupNotification {
  /** Notification ID */
  id: string;
  /** Notification type */
  type:
    | 'post_like'
    | 'post_comment'
    | 'post_mention'
    | 'post_share'
    | 'comment_reply'
    | 'comment_like'
    | 'member_join'
    | 'member_request'
    | 'member_promote'
    | 'group_announcement'
    | 'event_reminder'
    | 'poll_close';
  /** Actor who triggered the notification */
  actor: PostAuthor;
  /** Target post (if applicable) */
  post?: { id: string; content_preview: string };
  /** Target comment (if applicable) */
  comment?: { id: string; content_preview: string };
  /** Target group */
  group: { id: string; name: string; avatar?: string };
  /** Whether read */
  is_read: boolean;
  /** Creation timestamp */
  created_at: string;
}

/**
 * Activity feed item.
 */
export interface ActivityItem {
  /** Activity ID */
  id: string;
  /** Activity type */
  type:
    | 'post_created'
    | 'post_liked'
    | 'post_commented'
    | 'post_shared'
    | 'post_bookmarked'
    | 'poll_voted'
    | 'event_joined'
    | 'member_joined'
    | 'member_promoted';
  /** Actor */
  actor: PostAuthor;
  /** Target post */
  post?: Post;
  /** Target group */
  group?: GroupSummary;
  /** Timestamp */
  created_at: string;
}

// ============================================================================
// SECTION 11: FILTERS & REQUESTS
// ============================================================================

/**
 * Filters for group listing.
 */
export interface GroupFilters {
  /** Search query */
  search?: string;
  /** Group type filter */
  type?: GroupType;
  /** Sector filter */
  sector?: GroupSector;
  /** Country filter */
  country?: string;
  /** Region filter */
  region?: string;
  /** Tag filter */
  tag?: string;
  /** Only groups the user is a member of */
  member_only?: boolean;
  /** Only groups with recent activity */
  active_only?: boolean;
  /** Sort field */
  sort_by?: 'name' | 'members_count' | 'posts_count' | 'created_at' | 'activity';
  /** Sort direction */
  sort_order?: 'asc' | 'desc';
  /** Pagination */
  page?: number;
  limit?: number;
}

/**
 * Filters for post listing within a group.
 */
export interface PostFilters {
  /** Search in content */
  search?: string;
  /** Author ID filter */
  author_id?: string;
  /** Media type filter */
  media_type?: PostMediaType;
  /** Only pinned posts */
  pinned_only?: boolean;
  /** Date range start */
  date_from?: string;
  /** Date range end */
  date_to?: string;
  /** Sort field */
  sort_by?: 'created_at' | 'likes' | 'comments' | 'views' | 'popular';
  /** Sort direction */
  sort_order?: 'asc' | 'desc';
  /** Pagination */
  page?: number;
  limit?: number;
}

/**
 * Request to create a new group.
 */
export interface CreateGroupRequest {
  name: string;
  description: string;
  type: GroupType;
  sector: GroupSector;
  avatar?: File | string;
  banner?: File | string;
  tags?: string[];
  country?: string;
  region?: string;
  city?: string;
  rules?: string;
  requires_approval?: boolean;
  moderated?: boolean;
}

/**
 * Request to create a new post.
 */
export interface CreatePostRequest {
  group_id: string;
  content: string;
  media?: Omit<PostMedia, 'id' | 'upload_progress' | 'upload_complete'>[];
  poll?: Omit<Poll, 'total_votes' | 'has_voted' | 'is_open'>;
  event?: Omit<Event, 'participants_count' | 'is_participating'>;
  location?: MapLocation;
  scheduled_at?: string;
}

/**
 * Request to create a comment.
 */
export interface CreateCommentRequest {
  post_id: string;
  parent_id?: string;
  content: string;
  media?: Omit<PostMedia, 'id' | 'upload_progress' | 'upload_complete'>[];
}

/**
 * Request to react to a post or comment.
 */
export interface ReactRequest {
  target_type: 'post' | 'comment';
  target_id: string;
  reaction: ReactionType;
}

/**
 * Request to join a group.
 */
export interface JoinGroupRequest {
  group_id: string;
  /** Optional message to admins */
  message?: string;
}

/**
 * Request to invite members.
 */
export interface InviteMembersRequest {
  group_id: string;
  user_ids: string[];
  /** Optional welcome message */
  message?: string;
}

/**
 * Request to update member role.
 */
export interface UpdateMemberRoleRequest {
  group_id: string;
  user_id: string;
  new_role: MembershipStatus;
}

// ============================================================================
// SECTION 12: CONSTANTS & LABELS
// ============================================================================

/** Labels for group types */
export const GROUP_TYPE_LABELS: Record<GroupType, string> = {
  public:       'Public',
  private:      'Privé',
  professional: 'Professionnel',
  research:     'Recherche',
  regional:     'Régional',
  thematic:     'Thématique',
};

/** Descriptions for group types */
export const GROUP_TYPE_DESCRIPTIONS: Record<GroupType, string> = {
  public:       'Visible et accessible à tous les utilisateurs',
  private:      'Sur invitation ou demande d\'adhésion approuvée',
  professional: 'Réservé aux professionnels du secteur agricole',
  research:     'Groupe de recherche, études et expérimentation',
  regional:     'Groupe ancré dans une région ou localité',
  thematic:     'Groupe thématique spécialisé',
};

/** Icons for group types */
export const GROUP_TYPE_ICONS: Record<GroupType, string> = {
  public:       '🌍',
  private:      '🔒',
  professional: '💼',
  research:     '🔬',
  regional:     '📍',
  thematic:     '🏷️',
};

/** Labels for membership statuses */
export const MEMBERSHIP_STATUS_LABELS: Record<MembershipStatus, string> = {
  none: 'Non membre',
  pending: 'En attente',
  member: 'Membre',
  moderator: 'Modérateur',
  admin: 'Administrateur',
  owner: 'Propriétaire',
};

/** Labels for post media types */
export const POST_MEDIA_TYPE_LABELS: Record<PostMediaType, string> = {
  image: 'Image',
  video: 'Vidéo',
  audio: 'Audio',
  document: 'Document',
  poll: 'Sondage',
  event: 'Événement',
  link: 'Lien',
  location: 'Localisation',
};

/** Labels for reaction types */
export const REACTION_LABELS: Record<ReactionType, string> = {
  like: 'J\'aime',
  love: 'J\'adore',
  insightful: 'Pertinent',
  support: 'Soutien',
  sad: 'Triste',
  angry: 'En colère',
};

/** Emoji for reaction types */
export const REACTION_EMOJIS: Record<ReactionType, string> = {
  like: '👍',
  love: '❤️',
  insightful: '💡',
  support: '🤝',
  sad: '😔',
  angry: '😠',
};

/** Sector labels (aligned with actor.ts) */
export const GROUP_SECTOR_LABELS: Record<GroupSector, string> = {
  vegetal: '🌱 Végétal',
  animal: '🐄 Animal',
  halieutique: '🎣 Halieutique',
  forestier: '🌲 Forestier',
  minier: '⛏️ Minier',
  industriel: '🏭 Industriel',
  general: '🌍 Général',
};

/** Sector colors (aligned with utils.ts) */
export const GROUP_SECTOR_COLORS: Record<GroupSector, string> = {
  vegetal: '#16A34A',
  animal: '#D97706',
  halieutique: '#0891B2',
  forestier: '#92400E',
  minier: '#6B7280',
  industriel: '#4F46E5',
  general: '#6B7280',
};

// ============================================================================
// SECTION 13: UTILITY FUNCTIONS
// ============================================================================

/**
 * Get group type label.
 */
export function getGroupTypeLabel(type: GroupType): string {
  return GROUP_TYPE_LABELS[type] ?? type;
}

/**
 * Get group type description.
 */
export function getGroupTypeDescription(type: GroupType): string {
  return GROUP_TYPE_DESCRIPTIONS[type] ?? '';
}

/**
 * Get group type icon.
 */
export function getGroupTypeIcon(type: GroupType): string {
  return GROUP_TYPE_ICONS[type] ?? '📁';
}

/**
 * Get membership status label.
 */
export function getMembershipStatusLabel(status: MembershipStatus): string {
  return MEMBERSHIP_STATUS_LABELS[status] ?? status;
}

/**
 * Check if user can manage members (admin or owner).
 */
export function canManageMembers(status: MembershipStatus): boolean {
  return status === 'admin' || status === 'owner';
}

/**
 * Check if user can moderate content (moderator, admin, or owner).
 */
export function canModerate(status: MembershipStatus): boolean {
  return status === 'moderator' || status === 'admin' || status === 'owner';
}

/**
 * Check if user can post in the group.
 */
export function canPost(status: MembershipStatus): boolean {
  return status === 'member' || status === 'moderator' || status === 'admin' || status === 'owner';
}

/**
 * Check if user has joined or is pending.
 */
export function hasJoined(status: MembershipStatus): boolean {
  return status !== 'none';
}

/**
 * Get reaction label.
 */
export function getReactionLabel(reaction: ReactionType): string {
  return REACTION_LABELS[reaction] ?? reaction;
}

/**
 * Get reaction emoji.
 */
export function getReactionEmoji(reaction: ReactionType): string {
  return REACTION_EMOJIS[reaction] ?? '👍';
}

/**
 * Get sector label.
 */
export function getGroupSectorLabel(sector: GroupSector): string {
  return GROUP_SECTOR_LABELS[sector] ?? sector;
}

/**
 * Get sector color.
 */
export function getGroupSectorColor(sector: GroupSector): string {
  return GROUP_SECTOR_COLORS[sector] ?? '#6B7280';
}

/**
 * Format member count with compact notation.
 */
export function formatMemberCount(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}k`;
  return String(count);
}

/**
 * Check if a post can be edited by the given membership status.
 */
export function canEditPost(
  postAuthorId: string,
  currentUserId: string,
  currentUserStatus: MembershipStatus
): boolean {
  if (postAuthorId === currentUserId) return true;
  return canModerate(currentUserStatus);
}

/**
 * Check if a post can be deleted.
 */
export function canDeletePost(
  postAuthorId: string,
  currentUserId: string,
  currentUserStatus: MembershipStatus
): boolean {
  if (postAuthorId === currentUserId) return true;
  return canModerate(currentUserStatus);
}

/**
 * Create an empty group object.
 */
export function createEmptyGroup(): Group {
  const now = new Date().toISOString();
  return {
    id: '',
    name: '',
    slug: '',
    description: '',
    type: 'public',
    sector: 'general',
    tags: [],
    members_count: 0,
    posts_count: 0,
    is_member: false,
    membership_status: 'none',
    requires_approval: false,
    moderated: false,
    created_at: now,
    created_by: '',
  };
}

/**
 * Create an empty post object.
 */
export function createEmptyPost(groupId: string, author: PostAuthor): Post {
  const now = new Date().toISOString();
  return {
    id: '',
    group_id: groupId,
    author,
    content: '',
    media: [],
    reactions: { like: 0, love: 0, insightful: 0, support: 0, sad: 0, angry: 0 },
    comments_count: 0,
    shares_count: 0,
    is_bookmarked: false,
    status: 'published',
    is_pinned: false,
    is_locked: false,
    created_at: now,
    updated_at: now,
  };
}

/**
 * Create an empty comment object.
 */
export function createEmptyComment(postId: string, author: PostAuthor, parentId?: string): Comment {
  return {
    id: '',
    post_id: postId,
    parent_id: parentId,
    author,
    content: '',
    reactions: { like: 0, love: 0, insightful: 0, support: 0, sad: 0, angry: 0 },
    replies_count: 0,
    created_at: new Date().toISOString(),
  };
}

/**
 * Build reactions display string (e.g. "👍 12 · ❤️ 5 · 💡 3").
 */
export function buildReactionsSummary(reactions: Record<ReactionType, number>): string {
  const entries = Object.entries(reactions)
    .filter(([, count]) => count > 0)
    .sort(([, a], [, b]) => b - a);

  if (entries.length === 0) return '';

  return entries
    .map(([type, count]) => `${getReactionEmoji(type as ReactionType)} ${count}`)
    .join(' · ');
}

/**
 * Get total reactions count.
 */
export function getTotalReactions(reactions: Record<ReactionType, number>): number {
  return Object.values(reactions).reduce((sum, count) => sum + count, 0);
}

// ============================================================================
// SECTION 14: EXPORT GROUPING
// ============================================================================

export const CommunityTypes = {
  GROUP_TYPE_LABELS,
  GROUP_TYPE_DESCRIPTIONS,
  GROUP_TYPE_ICONS,
  MEMBERSHIP_STATUS_LABELS,
  POST_MEDIA_TYPE_LABELS,
  REACTION_LABELS,
  REACTION_EMOJIS,
  GROUP_SECTOR_LABELS,
  GROUP_SECTOR_COLORS,
  getGroupTypeLabel,
  getGroupTypeDescription,
  getGroupTypeIcon,
  getMembershipStatusLabel,
  canManageMembers,
  canModerate,
  canPost,
  hasJoined,
  getReactionLabel,
  getReactionEmoji,
  getGroupSectorLabel,
  getGroupSectorColor,
  formatMemberCount,
  canEditPost,
  canDeletePost,
  createEmptyGroup,
  createEmptyPost,
  createEmptyComment,
  buildReactionsSummary,
  getTotalReactions,
} as const;
