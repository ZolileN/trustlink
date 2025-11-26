import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type VerificationType = 'property' | 'vehicle' | 'both' | 'idNumber';
export type SessionStatus = 'pending' | 'in_progress' | 'completed' | 'expired';
export type VerificationStatus = 'verified' | 'failed' | 'pending' | 'skipped';

export interface VerificationSession {
  id: string;
  session_token: string;
  buyer_phone: string;
  seller_phone: string;
  verification_type: VerificationType;
  status: SessionStatus;
  expires_at: string;
  created_at: string;
  updated_at: string;
}

export interface VerificationResult {
  id: string;
  session_id: string;
  id_verification_status: VerificationStatus;
  id_hash: string | null;
  name_match: boolean | null;
  property_verification_status: VerificationStatus;
  property_reference: string | null;
  property_match: boolean | null;
  vehicle_verification_status: VerificationStatus;
  vehicle_reference: string | null;
  vehicle_match: boolean | null;
  completed_at: string | null;
  created_at: string;
}

export interface VerifiedSeller {
  id: string;
  seller_phone: string;
  seller_name: string;
  id_hash: string;
  badge_active: boolean;
  badge_expires_at: string | null;
  total_verifications: number;
  created_at: string;
  updated_at: string;
}
