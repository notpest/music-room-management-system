-- Supabase Initial Schema Migration
-- This migration defines the tables for the Music Room Management System

-- 1. User Table
CREATE TABLE "user" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" TEXT NOT NULL,
  "hashed_password" TEXT NOT NULL,
  "email" TEXT UNIQUE NOT NULL,
  "role" TEXT NOT NULL DEFAULT 'user'
);

-- 2. Band Table
CREATE TABLE "band" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" TEXT NOT NULL,
  "created_date" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "colour" TEXT NOT NULL
);

-- 3. UserBand (Many-to-Many Join Table)
CREATE TABLE "UserBand" (
  "user_id" UUID REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "band_id" UUID REFERENCES "band"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  PRIMARY KEY ("user_id", "band_id")
);

-- 4. Room Table
CREATE TABLE "room" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "number" INTEGER UNIQUE NOT NULL,
  "name" TEXT NOT NULL
);

-- 5. Slot Table
CREATE TABLE "slot" (
  "id" SERIAL PRIMARY KEY,
  "status" TEXT NOT NULL DEFAULT 'available',
  "band_id" UUID REFERENCES "band"("id"),
  "room_id" UUID NOT NULL REFERENCES "room"("id"),
  "slot_start" TIMESTAMPTZ NOT NULL,
  "slot_end" TIMESTAMPTZ NOT NULL
);

-- 6. Request Table
CREATE TABLE "request" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID NOT NULL REFERENCES "user"("id"),
  "status" TEXT NOT NULL,
  "slot_start" TIMESTAMPTZ NOT NULL,
  "slot_end" TIMESTAMPTZ NOT NULL,
  "request_date" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "response_date" TIMESTAMPTZ,
  "slot_id" INTEGER REFERENCES "slot"("id"),
  "room_id" UUID NOT NULL REFERENCES "room"("id"),
  "band_id" UUID REFERENCES "band"("id"),
  "reason" TEXT
);

-- 7. Entry Log Table
CREATE TABLE "entry_log" (
  "id" SERIAL PRIMARY KEY,
  "equipment_id" TEXT NOT NULL,
  "scanned_at" TIMESTAMPTZ NOT NULL
);

-- 8. Slot Config Table
CREATE TABLE "slot_config" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "start_time" TIME NOT NULL,
  "end_time" TIME NOT NULL,
  "enabled" BOOLEAN NOT NULL DEFAULT true
);

-- Indexes for conflict resolution
CREATE INDEX idx_slot_room_time ON "slot"("room_id", "slot_start", "slot_end");
CREATE INDEX idx_request_room_time ON "request"("room_id", "slot_start", "slot_end");
