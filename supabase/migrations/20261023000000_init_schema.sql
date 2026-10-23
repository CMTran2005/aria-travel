-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  display_name TEXT,
  preferences JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. POIs (Points of Interest) Table
CREATE TABLE IF NOT EXISTS pois (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT,
  location GEOGRAPHY(POINT, 4326),
  address TEXT,
  city TEXT,
  opening_hours JSONB,        -- {"Mon": ["08:00","17:00"], ...}
  avg_duration_minutes INT,
  avg_cost_usd DECIMAL(8,2),
  rating DECIMAL(3,2),
  tags TEXT[],
  source TEXT,                -- 'osm' | 'manual'
  external_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS pois_location_idx ON pois USING GIST(location);

-- 3. Trips Table
CREATE TABLE IF NOT EXISTS trips (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  title TEXT,
  city TEXT,
  start_date DATE,
  end_date DATE,
  budget_usd DECIMAL(10,2),
  preferences JSONB,
  status TEXT DEFAULT 'draft', -- draft | active | completed
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Itinerary Days Table
CREATE TABLE IF NOT EXISTS itinerary_days (
  id SERIAL PRIMARY KEY,
  trip_id UUID REFERENCES trips(id) ON DELETE CASCADE,
  day_number INT,
  date DATE
);

-- 5. Itinerary Items Table
CREATE TABLE IF NOT EXISTS itinerary_items (
  id SERIAL PRIMARY KEY,
  day_id INT REFERENCES itinerary_days(id) ON DELETE CASCADE,
  poi_id INT REFERENCES pois(id),
  visit_order INT,
  planned_start TIME,
  planned_end TIME,
  travel_time_to_prev_minutes INT,
  status TEXT DEFAULT 'planned' -- planned | visited | skipped
);

-- 6. Replanning Events Table
CREATE TABLE IF NOT EXISTS replanning_events (
  id SERIAL PRIMARY KEY,
  trip_id UUID REFERENCES trips(id),
  trigger_type TEXT,           -- weather | closed | traffic | manual
  trigger_data JSONB,
  old_itinerary JSONB,
  new_itinerary JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
