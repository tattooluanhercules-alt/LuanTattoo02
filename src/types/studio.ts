export type DriveFolderName =
  | '01_CONFIGURACOES'
  | '02_LOGOTIPOS'
  | '03_GALERIA'
  | '04_MUSICAS'
  | '05_BANNERS'
  | '06_VIDEOS'
  | '07_PORTFOLIO'
  | '08_DOCUMENTOS'
  | '09_FOTOS_PERFIL'
  | '10_BACKGROUND'
  | '11_ICONS'
  | '12_ARQUIVOS_GERAIS';

export interface StudioConfig {
  id: string;
  studioName: string;
  tagline: string;
  heroTitle: string;
  heroSubtitle: string;
  heroCtaPrimary: string;
  heroCtaSecondary: string;
  heroMediaUrl: string;
  heroMediaType: 'image' | 'video';
  aboutTitle: string;
  aboutStory: string;
  aboutExperience: string;
  aboutSpecialties: string[];
  aboutImageUrl: string;
  footerText: string;
  currency: 'BRL';
  timezone: 'America/Maceio';
  updatedAt: string;
}

export interface SitePageItem {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  body: string;
  visible: boolean;
  updatedAt: string;
}

export interface PortfolioItem {
  id: string;
  title: string;
  category: string;
  description: string;
  imageUrl: string;
  driveFileId?: string;
  featured: boolean;
  isPlaceholder?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  driveFileId?: string;
  caption: string;
  order: number;
  isPlaceholder?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BannerItem {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  driveFileId?: string;
  linkUrl: string;
  active: boolean;
  placement: 'hero' | 'sobre' | 'portfolio' | 'contato';
  updatedAt: string;
}

export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  driveFileId?: string;
  sessionInfo: string;
  order: number;
  active: boolean;
  updatedAt: string;
}

export interface PriceItem {
  id: string;
  title: string;
  description: string;
  estimateLabel: string;
  notes: string;
  order: number;
  active: boolean;
  updatedAt: string;
}

export interface TestimonialItem {
  id: string;
  clientName: string;
  projectLabel: string;
  quote: string;
  published: boolean;
  createdAt: string;
}

export interface ContactInfo {
  id: string;
  whatsappNumber: string;
  whatsappMessage: string;
  instagramHandle: string;
  email: string;
  address: string;
  cityState: string;
  businessHours: string;
  bookingNotice: string;
  updatedAt: string;
}

export interface ContactSubmission {
  id: string;
  name: string;
  contactChannel: string;
  idea: string;
  placement: string;
  sizeEstimate: string;
  createdAt: string;
  status: 'novo' | 'lido' | 'respondido';
}

export interface SocialLinkItem {
  id: string;
  platform: 'Instagram' | 'WhatsApp' | 'TikTok' | 'Facebook' | 'YouTube' | 'Outro';
  label: string;
  url: string;
  active: boolean;
  order: number;
  updatedAt: string;
}

export interface MusicConfig {
  id: string;
  enabled: boolean;
  title: string;
  artist: string;
  audioUrl: string;
  driveFileId?: string;
  initialVolume: number;
  loop: boolean;
  manualPlayOnly: boolean;
  updatedAt: string;
}

export interface MenuItem {
  id: string;
  label: string;
  path: string;
  order: number;
  visible: boolean;
}

export interface SeoConfig {
  id: string;
  siteTitle: string;
  metaDescription: string;
  ogTitle: string;
  ogDescription: string;
  ogImageUrl: string;
  canonicalDomain: string;
  keywords: string;
  updatedAt: string;
}

export interface ThemeConfig {
  id: string;
  backgroundColor: string;
  surfaceColor: string;
  textColor: string;
  accentColor: string;
  borderRadius: 'sharp' | 'subtle' | 'editorial';
  updatedAt: string;
}

export interface DriveFileRecord {
  id: string;
  name: string;
  mimeType: string;
  sizeBytes: number;
  folderName: DriveFolderName;
  folderId?: string;
  publicUrl: string;
  thumbnailUrl?: string;
  sectionBinding?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DriveFolderInfo {
  name: DriveFolderName;
  id: string;
  fileCount: number;
}

export interface IntegrationStatus {
  appsScriptConfigured: boolean;
  appsScriptReachable: boolean;
  driveConnected: boolean;
  sheetsConnected: boolean;
  driveFolderId: string;
  sheetId: string;
  lastSyncAt: string | null;
  mode: 'apps-script' | 'local-cache';
  message: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  target: string;
  status: 'ok' | 'erro';
  details: string;
}

export interface SiteBundle {
  config: StudioConfig;
  pages: SitePageItem[];
  portfolio: PortfolioItem[];
  gallery: GalleryItem[];
  banners: BannerItem[];
  services: ServiceItem[];
  prices: PriceItem[];
  testimonials: TestimonialItem[];
  contacts: ContactInfo;
  socialLinks: SocialLinkItem[];
  music: MusicConfig;
  menu: MenuItem[];
  seo: SeoConfig;
  theme: ThemeConfig;
  priceDisclaimer: string;
  lastUpdated: string;
  source: 'apps-script' | 'cache';
}

export interface AdminUserSession {
  email: string;
  role: 'admin';
  issuedAt: string;
  expiresAt: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}
