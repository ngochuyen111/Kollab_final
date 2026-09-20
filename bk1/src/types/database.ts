export type Id = number;

export type UserRole = 'ADMIN' | 'BRAND' | 'KOL' | 'KOC';
export type CampaignStatus = 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'TRACKING' | 'COMPLETED' | 'CANCELLED';
export type TaskStatus =
  | 'ASSIGNED'
  | 'DRAFT_SUBMITTED'
  | 'REVISION_REQUIRED'
  | 'APPROVED_TO_PUBLISH'
  | 'PUBLISHED'
  | 'TRACKING'
  | 'METRICS_SUBMITTED'
  | 'METRICS_APPROVED'
  | 'COMPLETED'
  | 'PAYMENT_PENDING'
  | 'PAID'
  | 'CANCELLED';
export type DraftStatus = 'SUBMITTED' | 'APPROVED' | 'REJECTED';
export type MetricStatus = 'SUBMITTED' | 'APPROVED' | 'REJECTED';
export type ReportPeriod = '24H' | '72H' | '7DAYS' | 'FINAL';
export type PaymentStatus = 'UNPAID' | 'PENDING' | 'PARTIAL_PAID' | 'PAID' | 'HOLD' | 'REJECTED';

export interface AppUser {
  id: Id;
  full_name: string;
  email: string;
  role: UserRole;
  avatar_url: string | null;
  status: string;
  created_at: string;
}

export interface Brand {
  id: Id;
  user_id: Id;
  brand_name: string;
  industry: string | null;
  description: string | null;
  website_url: string | null;
  logo_url: string | null;
  status: string;
}

export interface Product {
  id: Id;
  brand_id: Id;
  product_name: string;
  description: string | null;
  image_url: string | null;
  product_link: string | null;
  price: number | null;
  status: string;
}

export interface KolProfile {
  id: Id;
  user_id: Id;
  created_by_brand_id: Id | null;
  bio: string | null;
  platform: string | null;
  social_link: string | null;
  followers: number;
  content_category: string | null;
  qr_payment_url: string | null;
  bank_name: string | null;
  bank_account: string | null;
  bank_owner: string | null;
  status: string;
}

export interface Campaign {
  id: Id;
  brand_id: Id;
  product_id: Id;
  campaign_name: string;
  objective: string | null;
  campaign_brief: string | null;
  start_date: string;
  end_date: string;
  target_views: number;
  target_engagement_rate: number;
  target_conversion: number;
  payment_rule: string | null;
  status: CampaignStatus;
  budget: number;
  created_at?: string;
}

export interface CampaignTask {
  id: Id;
  campaign_id: Id;
  kol_profile_id: Id;
  content_type: string;
  content_requirement: string | null;
  draft_deadline: string | null;
  publish_deadline: string | null;
  payment_amount: number;
  status: TaskStatus;
  created_at?: string;
}

export interface DraftSubmission {
  id: Id;
  task_id: Id;
  caption: string | null;
  draft_file_url: string | null;
  draft_link: string | null;
  status: DraftStatus;
  feedback: string | null;
  submitted_at: string;
  reviewed_at: string | null;
  reviewed_by: Id | null;
}

export interface PublishedPost {
  id: Id;
  task_id: Id;
  post_url: string;
  publish_time: string;
  screenshot_url: string | null;
  submitted_at: string;
}

export interface PerformanceMetric {
  id: Id;
  task_id: Id;
  report_period: ReportPeriod;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  engagement: number;
  engagement_rate: number;
  insight_screenshot_url: string | null;
  status: MetricStatus;
  feedback: string | null;
  submitted_at: string;
  reviewed_at: string | null;
  reviewed_by: Id | null;
}

export interface Payment {
  id: Id;
  task_id: Id;
  brand_id: Id;
  kol_profile_id: Id;
  amount: number;
  paid_amount: number;
  status: PaymentStatus;
  payment_note: string | null;
  paid_date: string | null;
}

export interface CampaignWithRelations extends Campaign {
  products: Pick<Product, 'id' | 'product_name' | 'image_url' | 'price'> | null;
  brands: Pick<Brand, 'id' | 'brand_name' | 'logo_url' | 'industry'> | null;
}

export interface KolWithUser extends KolProfile {
  users: Pick<AppUser, 'id' | 'full_name' | 'email' | 'avatar_url' | 'role'> | null;
}

export interface TaskWithRelations extends CampaignTask {
  campaigns: (CampaignWithRelations & { brands: Pick<Brand, 'id' | 'brand_name' | 'logo_url'> | null }) | null;
  kol_profiles: KolWithUser | null;
  draft_submissions?: DraftSubmission[];
  published_posts?: PublishedPost[];
  performance_metrics?: PerformanceMetric[];
  payments?: Payment[];
}

export type CreateInput<T extends { id: Id }> = Omit<T, 'id'>;
export type UpdateInput<T extends { id: Id }> = Partial<Omit<T, 'id'>>;
