-- Enable UUID generation if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Monetization tiers (will skip if exists)
DO $$ BEGIN
  CREATE TYPE public.membership_tier AS ENUM ('free','pro','elite');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Staff roles (will skip if exists - we have app_role)
DO $$ BEGIN
  CREATE TYPE public.user_role AS ENUM ('user','moderator','admin');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Category visibility (who can read) - NEW
DO $$ BEGIN
  CREATE TYPE public.category_visibility AS ENUM ('public','pro','elite');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Content status - NEW
DO $$ BEGIN
  CREATE TYPE public.content_status AS ENUM ('active','locked','removed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;