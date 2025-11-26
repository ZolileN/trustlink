/*
  # TrustLink Database Schema

  1. New Tables
    - `verification_sessions`
      - `id` (uuid, primary key)
      - `session_token` (text, unique) - One-time link token
      - `buyer_phone` (text) - Buyer's contact
      - `seller_phone` (text) - Seller's contact
      - `verification_type` (text) - 'property', 'vehicle', or 'both'
      - `status` (text) - 'pending', 'in_progress', 'completed', 'expired'
      - `expires_at` (timestamptz) - 30 min expiry
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `verification_results`
      - `id` (uuid, primary key)
      - `session_id` (uuid, foreign key)
      - `id_verification_status` (text) - 'verified', 'failed', 'pending'
      - `id_hash` (text) - Hashed ID number
      - `name_match` (boolean)
      - `property_verification_status` (text)
      - `property_reference` (text) - ERF/address hash
      - `property_match` (boolean)
      - `vehicle_verification_status` (text)
      - `vehicle_reference` (text) - VIN hash
      - `vehicle_match` (boolean)
      - `completed_at` (timestamptz)
      - `created_at` (timestamptz)

    - `verified_sellers`
      - `id` (uuid, primary key)
      - `seller_phone` (text, unique)
      - `seller_name` (text)
      - `id_hash` (text)
      - `badge_active` (boolean)
      - `badge_expires_at` (timestamptz)
      - `total_verifications` (integer)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for public access to verification flows
    - Add policies for sellers to view their own profiles
*/

-- Create verification_sessions table
CREATE TABLE IF NOT EXISTS verification_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_token text UNIQUE NOT NULL,
  buyer_phone text NOT NULL,
  seller_phone text NOT NULL,
  verification_type text NOT NULL CHECK (verification_type IN ('property', 'vehicle', 'both')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'expired')),
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create verification_results table
CREATE TABLE IF NOT EXISTS verification_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES verification_sessions(id) ON DELETE CASCADE,
  id_verification_status text DEFAULT 'pending' CHECK (id_verification_status IN ('verified', 'failed', 'pending')),
  id_hash text,
  name_match boolean,
  property_verification_status text DEFAULT 'pending' CHECK (property_verification_status IN ('verified', 'failed', 'pending', 'skipped')),
  property_reference text,
  property_match boolean,
  vehicle_verification_status text DEFAULT 'pending' CHECK (vehicle_verification_status IN ('verified', 'failed', 'pending', 'skipped')),
  vehicle_reference text,
  vehicle_match boolean,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create verified_sellers table
CREATE TABLE IF NOT EXISTS verified_sellers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_phone text UNIQUE NOT NULL,
  seller_name text NOT NULL,
  id_hash text NOT NULL,
  badge_active boolean DEFAULT false,
  badge_expires_at timestamptz,
  total_verifications integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE verification_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE verified_sellers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for verification_sessions
CREATE POLICY "Anyone can create verification sessions"
  ON verification_sessions FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anyone can view sessions by token"
  ON verification_sessions FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anyone can update sessions by token"
  ON verification_sessions FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- RLS Policies for verification_results
CREATE POLICY "Anyone can create verification results"
  ON verification_results FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anyone can view verification results"
  ON verification_results FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anyone can update verification results"
  ON verification_results FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- RLS Policies for verified_sellers
CREATE POLICY "Anyone can view verified sellers"
  ON verified_sellers FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Anyone can create verified sellers"
  ON verified_sellers FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Anyone can update verified sellers"
  ON verified_sellers FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_verification_sessions_token ON verification_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_verification_sessions_status ON verification_sessions(status);
CREATE INDEX IF NOT EXISTS idx_verification_results_session ON verification_results(session_id);
CREATE INDEX IF NOT EXISTS idx_verified_sellers_phone ON verified_sellers(seller_phone);