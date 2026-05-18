export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url: string | null;
}

export interface ShortcutLink {
  id: string;
  label: string;
  url: string;
  icon: string | null;
  sort_order: number;
}

export type ApplicationStatus =
  | 'Approached'
  | 'Referred'
  | 'Saved'
  | 'Save for later'
  | 'Applied'
  | 'Recruiter interview'
  | 'Phone'
  | 'HM interview'
  | 'Presentation'
  | '1<>1'
  | 'Onsite'
  | 'Final Call'
  | 'Offer'
  | 'Paused'
  | '3m ghosted'
  | 'Rejected'
  | 'Withdrawn'
  | 'Skip';

export const APPLICATION_STATUSES: ApplicationStatus[] = [
  'Approached',
  'Referred',
  'Saved',
  'Save for later',
  'Applied',
  'Recruiter interview',
  'Phone',
  'HM interview',
  'Presentation',
  '1<>1',
  'Onsite',
  'Final Call',
  'Offer',
  'Paused',
  '3m ghosted',
  'Rejected',
  'Withdrawn',
  'Skip',
];

export interface Application {
  id: string;
  company: string;
  role: string | null;
  location: string | null;
  work_mode: string | null;
  size: string | null;
  industry: string | null;
  status: ApplicationStatus;
  stage: string | null;
  referral: string | null;
  salary_low: number | null;
  salary_high: number | null;
  salary_currency: string | null;
  applied_at: string | null;
  last_activity_at: string | null;
  starred: number; // SQLite: 0/1
  notes: string | null;
  created_at: string;
  updated_at: string;
  contact_count: number;
}

export interface PublicProfile {
  slug: string;
  display_name: string;
  headline: string | null;
  avatar_url: string | null;
  links: Array<Pick<ShortcutLink, 'label' | 'url' | 'icon'>>;
}

export interface OwnProfile {
  slug: string | null;
  public_enabled: number;
  display_name: string | null;
  headline: string | null;
  avatar_url: string | null;
}

export interface Contact {
  id: string;
  name: string;
  company: string | null;
  role: string | null;
  email: string | null;
  linkedin: string | null;
  notes: string | null;
  last_touch_at: string;
  created_at: string;
  app_count: number;
}

export interface ContactLink {
  id: string;
  name: string;
  company: string | null;
  role: string | null;
  email: string | null;
  linkedin: string | null;
  relationship: string;
}

export interface ProfileLink {
  id: string;
  label: string;
  url: string;
  sort_order: number;
}

export interface LeadCriteria {
  user_id: string;
  title_keywords: string | null;
  seniority: string | null;
  work_modes: string | null;
  salary_min: number | null;
  salary_max: number | null;
  salary_currency: string | null;
  location: string | null;
  include_keywords: string | null;
  exclude_keywords: string | null;
  updated_at: string;
}

export interface LeadSource {
  id: string;
  user_id: string;
  source_type: 'greenhouse' | 'lever' | 'workable' | 'rss';
  slug: string | null;
  url: string | null;
  label: string;
  active: number;
  created_at: string;
}

export interface JobLead {
  id: string;
  user_id: string;
  source_id: string | null;
  source_label: string | null;
  source_type: string | null;
  external_url: string;
  title: string;
  company: string;
  location: string | null;
  work_mode: string | null;
  salary_hint: string | null;
  description: string | null;
  score: number | null;
  score_reason: string | null;
  state: 'new' | 'dismissed' | 'converted';
  fetched_at: string;
  scored_at: string | null;
  converted_application_id: string | null;
}
