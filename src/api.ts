import type { Application, Contact, ContactLink, JobLead, LeadCriteria, LeadSource, OwnProfile, ProfileLink, PublicProfile, ShortcutLink, User } from './types';

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

  listLeads: (state: string = 'new') =>
    request<{ leads: JobLead[] }>(`/api/leads?state=${encodeURIComponent(state)}`),
  dismissLead: (id: string) => request<{ ok: boolean }>(`/api/leads/${id}/dismiss`, { method: 'POST' }),
  convertLead: (id: string) => request<{ application: Application }>(`/api/leads/${id}/convert`, { method: 'POST' }),
  runLeads: () => request<{ ok: boolean; inserted: number; sources: Array<{ source_id: string; label: string; fetched: number; inserted: number; error: string | null }> }>('/api/leads/run', { method: 'POST' }),
};
