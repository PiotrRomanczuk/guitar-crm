-- Fix: Add 'pending' to assignment_status enum
-- This is required because client queries are using 'pending' status
ALTER TYPE public.assignment_status ADD VALUE IF NOT EXISTS 'pending' AFTER 'not_started';
