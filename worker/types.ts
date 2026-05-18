export interface Env {
  ASSETS: Fetcher;
  DB: D1Database;
  AI: Ai;
  APP_URL: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  JWT_SECRET: string;
}

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  avatar_url: string | null;
}

export type Variables = {
  user: SessionUser;
};
