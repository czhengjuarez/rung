import type { Application, ApplicationEvent, CoachFeedback, Contact, ContactLink, InterviewQuestion, JobLead, LeadCriteria, LeadSource, NotificationPreferences, OwnProfile, ProfileLink, PublicProfile, Resume, ShortcutLink, TailoredResume, User } from './types';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
    ...init
  });
  if (res.status === 401) {
    throw new Error('Unauthorized');
  }
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed: ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const api = {
  me: () => request<{ user: User | null }>('/api/me'),
  logout: () => request<void>('/api/auth/logout', { method: 'POST' }),

  listLinks: () => request<{ links: ShortcutLink[] }>('/api/links'),
  createLink: (body: Partial<ShortcutLink>) =>
    request<{ link: ShortcutLink }>('/api/links', { method: 'POST', body: JSON.stringify(body) }),
  updateLink: (id: string, body: Partial<ShortcutLink>) =>
    request<{ link: ShortcutLink }>(`/api/links/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  deleteLink: (id: string) => request<void>(`/api/links/${id}`, { method: 'DELETE' }),

  listApplications: () => request<{ applications: Application[] }>('/api/applications'),
  createApplication: (body: Partial<Application>) =>
    request<{ application: Application }>('/api/applications', { method: 'POST', body: JSON.stringify(body) }),
  updateApplication: (id: string, body: Partial<Application>) =>
    request<{ application: Application }>(`/api/applications/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(body)
    }),
  deleteApplication: (id: string) => request<void>(`/api/applications/${id}`, { method: 'DELETE' }),
  reorderApplications: (ids: string[]) =>
    request<{ ok: boolean }>('/api/applications/reorder', { method: 'PATCH', body: JSON.stringify({ ids }) }),

  getProfile: () => request<{ profile: OwnProfile }>('/api/profile'),
  updateProfile: (body: Partial<OwnProfile>) =>
    request<{ profile: OwnProfile }>('/api/profile', { method: 'PATCH', body: JSON.stringify(body) }),
  getProfileLinks: () => request<{ links: ProfileLink[] }>('/api/profile/links'),
  setProfileLinks: (links: Array<{ label: string; url: string }>) =>
    request<{ links: ProfileLink[] }>('/api/profile/links', { method: 'PUT', body: JSON.stringify({ links }) }),

  listContacts: () => request<{ contacts: Contact[] }>('/api/contacts'),
  createContact: (body: Partial<Contact>) =>
    request<{ contact: Contact }>('/api/contacts', { method: 'POST', body: JSON.stringify(body) }),
  updateContact: (id: string, body: Partial<Contact>) =>
    request<{ contact: Contact }>(`/api/contacts/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  deleteContact: (id: string) => request<void>(`/api/contacts/${id}`, { method: 'DELETE' }),
  getContactApplications: (id: string) =>
    request<{ applications: Array<{ id: string; company: string; role: string | null; status: string; relationship: string }> }>(`/api/contacts/${id}/applications`),

  listAppEvents: (appId: string) =>
    request<{ events: ApplicationEvent[] }>(`/api/applications/${appId}/events`),
  createAppEvent: (appId: string, body: { type: string; occurred_at: string; notes?: string }) =>
    request<{ event: ApplicationEvent }>(`/api/applications/${appId}/events`, { method: 'POST', body: JSON.stringify(body) }),

  listAppContacts: (appId: string) =>
    request<{ contacts: ContactLink[] }>(`/api/applications/${appId}/contacts`),
  linkContact: (appId: string, contactId: string, relationship: string) =>
    request<{ ok: boolean }>(`/api/applications/${appId}/contacts`, {
      method: 'POST', body: JSON.stringify({ contact_id: contactId, relationship })
    }),
  unlinkContact: (appId: string, contactId: string) =>
    request<void>(`/api/applications/${appId}/contacts/${contactId}`, { method: 'DELETE' }),

  importApplications: (rows: Array<Partial<Record<string, unknown>>>) =>
    request<{ imported: number }>('/api/applications/import', {
      method: 'POST',
      body: JSON.stringify({ applications: rows })
    }),

  getPublicProfile: (slug: string) =>
    request<{ profile: PublicProfile }>(`/api/public/profile/${encodeURIComponent(slug)}`),

  getCriteria: () => request<{ criteria: LeadCriteria | null }>('/api/leads/criteria'),
  saveCriteria: (body: Partial<LeadCriteria>) =>
    request<{ criteria: LeadCriteria }>('/api/leads/criteria', { method: 'PUT', body: JSON.stringify(body) }),

  listSources: () => request<{ sources: LeadSource[] }>('/api/leads/sources'),
  createSource: (body: Partial<LeadSource>) =>
    request<{ source: LeadSource }>('/api/leads/sources', { method: 'POST', body: JSON.stringify(body) }),
  updateSource: (id: string, body: Partial<LeadSource>) =>
    request<{ source: LeadSource }>(`/api/leads/sources/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  deleteSource: (id: string) => request<void>(`/api/leads/sources/${id}`, { method: 'DELETE' }),

  scrapeLeadUrl: (url: string) =>
    request<{ title: string | null; company: string | null; location: string | null; salary_hint: string | null; description: string | null; source: string }>('/api/leads/scrape', { method: 'POST', body: JSON.stringify({ url }) }),
  clipLead: (body: { title: string; company: string; external_url: string; location?: string; salary_hint?: string; description?: string }) =>
    request<{ lead: unknown }>('/api/leads/clip', { method: 'POST', body: JSON.stringify(body) }),

  listLeads: (state: string = 'new') =>
    request<{ leads: JobLead[] }>(`/api/leads?state=${encodeURIComponent(state)}`),
  updateLead: (id: string, body: Partial<Pick<JobLead, 'title' | 'company' | 'location' | 'work_mode' | 'salary_hint' | 'external_url' | 'description'>>) =>
    request<{ lead: JobLead }>(`/api/leads/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  scoreLead: (id: string) => request<{ score: number; score_reason: string }>(`/api/leads/${id}/score`, { method: 'POST' }),
  dismissLead: (id: string) => request<{ ok: boolean }>(`/api/leads/${id}/dismiss`, { method: 'POST' }),
  convertLead: (id: string) => request<{ application: Application }>(`/api/leads/${id}/convert`, { method: 'POST' }),
  runLeads: () => request<{ ok: boolean; inserted: number; sources: Array<{ source_id: string; label: string; fetched: number; inserted: number; error: string | null }> }>('/api/leads/run', { method: 'POST' }),

  listInterviewQuestions: (tab: 'public' | 'private', category?: string) =>
    request<{ questions: InterviewQuestion[] }>(`/api/interview/questions?tab=${tab}${category ? `&category=${encodeURIComponent(category)}` : ''}`),
  createInterviewQuestion: (body: Partial<InterviewQuestion> & { hint?: string }) =>
    request<{ question: InterviewQuestion }>('/api/interview/questions', { method: 'POST', body: JSON.stringify(body) }),
  updateInterviewQuestion: (id: string, body: Partial<InterviewQuestion>) =>
    request<{ ok: boolean }>(`/api/interview/questions/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  deleteInterviewQuestion: (id: string) =>
    request<void>(`/api/interview/questions/${id}`, { method: 'DELETE' }),

  coachAnswer: (body: { question: string; answer: string; category?: string }) =>
    request<{ feedback: CoachFeedback }>('/api/interview/coach', { method: 'POST', body: JSON.stringify(body) }),

  saveInterviewAnswer: (questionId: string, body: { answer?: string; notes?: string }) =>
    request<{ ok: boolean }>(`/api/interview/answers/${questionId}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteInterviewAnswer: (questionId: string) =>
    request<void>(`/api/interview/answers/${questionId}`, { method: 'DELETE' }),

  listResumes: () => request<{ resumes: Resume[] }>('/api/resumes'),
  getTailorUsage: () => request<{ used: number; limit: number }>('/api/resumes/tailor-usage'),
  uploadResume: (formData: FormData) =>
    fetch('/api/resumes', { method: 'POST', credentials: 'include', body: formData }).then(async (res) => {
      if (!res.ok) { const t = await res.text(); throw new Error(t || `Upload failed: ${res.status}`); }
      return res.json() as Promise<{ resume: Resume }>;
    }),
  updateResume: (id: string, body: { label?: string; resume_text?: string }) =>
    request<{ ok: boolean }>(`/api/resumes/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  deleteResume: (id: string) => request<void>(`/api/resumes/${id}`, { method: 'DELETE' }),
  downloadResumeUrl: (id: string) => `/api/resumes/${id}/download`,

  tailorResume: (resumeId: string, body: {
    job_description: string; job_title?: string; company?: string;
    application_id?: string; job_lead_id?: string;
  }) => request<{ id: string; tailored_text: string }>(`/api/resumes/${resumeId}/tailor`, { method: 'POST', body: JSON.stringify(body) }),

  listTailoredResumes: (resumeId: string) =>
    request<{ tailored: TailoredResume[] }>(`/api/resumes/${resumeId}/tailored`),
  getTailoredResume: (tailoredId: string) =>
    request<{ tailored: TailoredResume }>(`/api/resumes/tailored/${tailoredId}`),

  getVapidPublicKey: () =>
    request<{ publicKey: string }>('/api/push/vapid-public-key'),
  subscribePush: (body: { endpoint: string; p256dh: string; auth: string }) =>
    request<{ ok: boolean }>('/api/push/subscribe', { method: 'POST', body: JSON.stringify(body) }),
  unsubscribePush: (endpoint: string) =>
    request<void>('/api/push/subscribe', { method: 'DELETE', body: JSON.stringify({ endpoint }) }),
  getNotifPrefs: () =>
    request<{ preferences: NotificationPreferences | null }>('/api/push/preferences'),
  saveNotifPrefs: (body: Partial<NotificationPreferences>) =>
    request<{ preferences: NotificationPreferences }>('/api/push/preferences', { method: 'PUT', body: JSON.stringify(body) }),

  submitFeedback: (type: 'bug' | 'feature' | 'other', message: string) =>
    request<{ ok: boolean }>('/api/feedback', { method: 'POST', body: JSON.stringify({ type, message }) }),
};
