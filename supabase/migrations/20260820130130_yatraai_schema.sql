/*
# YatraAI - Full Database Schema

## Overview
Complete schema for the YatraAI AI Smart Tourist Planner. Multi-user app with
authentication: every user-visible table is owner-scoped via user_id + RLS.

## Tables
1. profiles - extends auth.users with display name, phone, avatar
2. trips - trip planning requests with all 16 form steps + destinations
3. plans - generated AI travel plans (7 per trip) with budget breakdown + match score
4. itinerary_days - day-wise itinerary for each plan
5. bookings - confirmed bookings after payment
6. payments - payment records (demo mode honestly tracked)
7. reviews - user reviews and ratings for destinations/trips
8. travel_memories - user-uploaded trip photos with captions

## Security
- RLS enabled on every table
- Owner-scoped CRUD policies (SELECT/INSERT/UPDATE/DELETE) using auth.uid()
- user_id columns default to auth.uid() so inserts omitting user_id succeed
- No public/shared data - all data is private to each authenticated user
*/

-- ============ profiles ============
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL DEFAULT '',
  phone text DEFAULT '',
  avatar_url text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT TO authenticated USING (auth.uid() = id);
DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- ============ trips ============
CREATE TABLE IF NOT EXISTS trips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text DEFAULT '',
  -- starting location
  start_name text DEFAULT '',
  start_city text DEFAULT '',
  start_state text DEFAULT '',
  start_country text DEFAULT '',
  start_country_code text DEFAULT '',
  start_latitude float8,
  start_longitude float8,
  start_place_id text DEFAULT '',
  -- destinations (array of objects as jsonb)
  destinations jsonb NOT NULL DEFAULT '[]'::jsonb,
  primary_country text DEFAULT '',
  primary_country_code text DEFAULT '',
  is_international boolean DEFAULT false,
  -- traveller info
  adults int DEFAULT 1,
  children int DEFAULT 0,
  total_travellers int DEFAULT 1,
  -- dates
  days int NOT NULL DEFAULT 5,
  nights int DEFAULT 4,
  start_date date,
  end_date date,
  -- budget
  budget int NOT NULL DEFAULT 30000,
  -- preferences
  hotel_preference text DEFAULT '3 Star',
  room_type text DEFAULT 'Double',
  transport_preference text DEFAULT 'No Preference',
  weather_preference text DEFAULT 'No Preference',
  location_types text[] DEFAULT '{}',
  travel_type text DEFAULT 'Family',
  food_preference text DEFAULT 'No Preference',
  activities text[] DEFAULT '{}',
  travel_pace text DEFAULT 'Balanced',
  special_requirements text DEFAULT '',
  -- status
  status text DEFAULT 'planned',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_own_trips" ON trips;
CREATE POLICY "select_own_trips" ON trips FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_trips" ON trips;
CREATE POLICY "insert_own_trips" ON trips FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_trips" ON trips;
CREATE POLICY "update_own_trips" ON trips FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_trips" ON trips;
CREATE POLICY "delete_own_trips" ON trips FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ============ plans ============
CREATE TABLE IF NOT EXISTS plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_name text NOT NULL DEFAULT '',
  description text DEFAULT '',
  route jsonb DEFAULT '[]'::jsonb,
  num_locations int DEFAULT 1,
  num_nights int DEFAULT 4,
  hotel text DEFAULT '',
  transport text DEFAULT '',
  activities text[] DEFAULT '{}',
  weather text DEFAULT '',
  match_score int DEFAULT 0,
  -- budget breakdown (all in INR)
  hotel_cost int DEFAULT 0,
  transport_cost int DEFAULT 0,
  local_transport_cost int DEFAULT 0,
  food_cost int DEFAULT 0,
  activities_cost int DEFAULT 0,
  misc_cost int DEFAULT 0,
  total_cost int DEFAULT 0,
  budget_remaining int DEFAULT 0,
  within_budget boolean DEFAULT true,
  why_matches text DEFAULT '',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_own_plans" ON plans;
CREATE POLICY "select_own_plans" ON plans FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_plans" ON plans;
CREATE POLICY "insert_own_plans" ON plans FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_plans" ON plans;
CREATE POLICY "update_own_plans" ON plans FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_plans" ON plans;
CREATE POLICY "delete_own_plans" ON plans FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ============ itinerary_days ============
CREATE TABLE IF NOT EXISTS itinerary_days (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id uuid NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  day_number int NOT NULL,
  day_title text DEFAULT '',
  location text DEFAULT '',
  morning text DEFAULT '',
  afternoon text DEFAULT '',
  evening text DEFAULT '',
  food text DEFAULT '',
  transport text DEFAULT '',
  hotel text DEFAULT '',
  activities text[] DEFAULT '{}',
  daily_cost int DEFAULT 0,
  travel_tips text DEFAULT '',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE itinerary_days ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_own_itinerary" ON itinerary_days;
CREATE POLICY "select_own_itinerary" ON itinerary_days FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_itinerary" ON itinerary_days;
CREATE POLICY "insert_own_itinerary" ON itinerary_days FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_itinerary" ON itinerary_days;
CREATE POLICY "update_own_itinerary" ON itinerary_days FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_itinerary" ON itinerary_days;
CREATE POLICY "delete_own_itinerary" ON itinerary_days FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ============ bookings ============
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  trip_id uuid NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
  plan_id uuid NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
  booking_code text UNIQUE NOT NULL DEFAULT '',
  trip_route text DEFAULT '',
  travellers int DEFAULT 1,
  start_date date,
  end_date date,
  hotel text DEFAULT '',
  transport text DEFAULT '',
  activities text[] DEFAULT '{}',
  subtotal int DEFAULT 0,
  taxes int DEFAULT 0,
  total_payable int DEFAULT 0,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_own_bookings" ON bookings;
CREATE POLICY "select_own_bookings" ON bookings FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_bookings" ON bookings;
CREATE POLICY "insert_own_bookings" ON bookings FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_bookings" ON bookings;
CREATE POLICY "update_own_bookings" ON bookings FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_bookings" ON bookings;
CREATE POLICY "delete_own_bookings" ON bookings FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ============ payments ============
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  booking_id uuid NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  razorpay_order_id text DEFAULT '',
  razorpay_payment_id text DEFAULT '',
  razorpay_signature text DEFAULT '',
  amount int NOT NULL DEFAULT 0,
  currency text DEFAULT 'INR',
  payment_method text DEFAULT '',
  payment_status text DEFAULT 'pending',
  payment_mode text DEFAULT 'demo',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_own_payments" ON payments;
CREATE POLICY "select_own_payments" ON payments FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_payments" ON payments;
CREATE POLICY "insert_own_payments" ON payments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_payments" ON payments;
CREATE POLICY "update_own_payments" ON payments FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_payments" ON payments;
CREATE POLICY "delete_own_payments" ON payments FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ============ reviews ============
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  destination text NOT NULL DEFAULT '',
  trip_title text DEFAULT '',
  rating int NOT NULL DEFAULT 5,
  review_text text DEFAULT '',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_own_reviews" ON reviews;
CREATE POLICY "select_own_reviews" ON reviews FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_reviews" ON reviews;
CREATE POLICY "insert_own_reviews" ON reviews FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_reviews" ON reviews;
CREATE POLICY "update_own_reviews" ON reviews FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_reviews" ON reviews;
CREATE POLICY "delete_own_reviews" ON reviews FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ============ travel_memories ============
CREATE TABLE IF NOT EXISTS travel_memories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  destination text NOT NULL DEFAULT '',
  caption text DEFAULT '',
  photo_url text NOT NULL DEFAULT '',
  memory_date date,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE travel_memories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "select_own_memories" ON travel_memories;
CREATE POLICY "select_own_memories" ON travel_memories FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "insert_own_memories" ON travel_memories;
CREATE POLICY "insert_own_memories" ON travel_memories FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "update_own_memories" ON travel_memories;
CREATE POLICY "update_own_memories" ON travel_memories FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "delete_own_memories" ON travel_memories;
CREATE POLICY "delete_own_memories" ON travel_memories FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_trips_user ON trips(user_id);
CREATE INDEX IF NOT EXISTS idx_plans_trip ON plans(trip_id);
CREATE INDEX IF NOT EXISTS idx_plans_user ON plans(user_id);
CREATE INDEX IF NOT EXISTS idx_itinerary_plan ON itinerary_days(plan_id);
CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_booking ON payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_memories_user ON travel_memories(user_id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();