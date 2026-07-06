-- Add leads_paused flag to users so they can globally pause/resume lead fetching
ALTER TABLE users ADD COLUMN leads_paused INTEGER NOT NULL DEFAULT 0;
