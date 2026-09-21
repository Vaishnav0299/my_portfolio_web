-- Migration: 0002_remove_hero_stats.sql
-- Description: Drop hero stats column from bio table

ALTER TABLE bio DROP COLUMN IF EXISTS stats;
