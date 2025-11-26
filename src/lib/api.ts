import { supabase, VerificationType, VerificationSession, VerificationResult } from './supabase';
import { generateSessionToken, hashValue, getExpiryTime } from './utils';

export async function createVerificationSession(
  buyerPhone: string,
  sellerPhone: string,
  verificationType: VerificationType
): Promise<{ session: VerificationSession; error: string | null }> {
  try {
    const token = generateSessionToken();
    const expiresAt = getExpiryTime();

    const { data, error } = await supabase
      .from('verification_sessions')
      .insert({
        session_token: token,
        buyer_phone: buyerPhone,
        seller_phone: sellerPhone,
        verification_type: verificationType,
        status: 'pending',
        expires_at: expiresAt,
      })
      .select()
      .single();

    if (error) {
      return { session: null as any, error: error.message };
    }

    return { session: data as VerificationSession, error: null };
  } catch (err) {
    return { session: null as any, error: 'Failed to create verification session' };
  }
}

export async function getSessionByToken(
  token: string
): Promise<{ session: VerificationSession | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('verification_sessions')
      .select('*')
      .eq('session_token', token)
      .maybeSingle();

    if (error) {
      return { session: null, error: error.message };
    }

    return { session: data as VerificationSession | null, error: null };
  } catch (err) {
    return { session: null, error: 'Failed to fetch session' };
  }
}

export async function updateSessionStatus(
  sessionId: string,
  status: string
): Promise<{ success: boolean; error: string | null }> {
  try {
    const { error } = await supabase
      .from('verification_sessions')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', sessionId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (err) {
    return { success: false, error: 'Failed to update session' };
  }
}

export async function createVerificationResult(
  sessionId: string
): Promise<{ result: VerificationResult | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('verification_results')
      .insert({
        session_id: sessionId,
      })
      .select()
      .single();

    if (error) {
      return { result: null, error: error.message };
    }

    return { result: data as VerificationResult, error: null };
  } catch (err) {
    return { result: null, error: 'Failed to create verification result' };
  }
}

export async function updateVerificationResult(
  sessionId: string,
  updates: Partial<VerificationResult>
): Promise<{ success: boolean; error: string | null }> {
  try {
    const { error } = await supabase
      .from('verification_results')
      .update(updates)
      .eq('session_id', sessionId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, error: null };
  } catch (err) {
    return { success: false, error: 'Failed to update verification result' };
  }
}

export async function getVerificationResult(
  sessionId: string
): Promise<{ result: VerificationResult | null; error: string | null }> {
  try {
    const { data, error } = await supabase
      .from('verification_results')
      .select('*')
      .eq('session_id', sessionId)
      .maybeSingle();

    if (error) {
      return { result: null, error: error.message };
    }

    return { result: data as VerificationResult | null, error: null };
  } catch (err) {
    return { result: null, error: 'Failed to fetch verification result' };
  }
}

export async function simulateIDVerification(idNumber: string, expectedName: string): Promise<{
  verified: boolean;
  nameMatch: boolean;
  retrievedName: string;
}> {
  await new Promise(resolve => setTimeout(resolve, 1000));

  const mockNames = ['John Smith', 'Sarah Johnson', 'Michael Brown', 'Emily Davis'];
  const retrievedName = mockNames[Math.floor(Math.random() * mockNames.length)];
  const nameMatch = retrievedName.toLowerCase().includes(expectedName.toLowerCase().split(' ')[0]) ||
                    Math.random() > 0.3;

  return {
    verified: true,
    nameMatch,
    retrievedName: nameMatch ? expectedName : retrievedName
  };
}

export async function simulatePropertyVerification(propertyReference: string): Promise<{
  verified: boolean;
  ownershipMatch: boolean;
}> {
  await new Promise(resolve => setTimeout(resolve, 1200));

  return {
    verified: true,
    ownershipMatch: Math.random() > 0.2
  };
}

export async function simulateVehicleVerification(vehicleReference: string): Promise<{
  verified: boolean;
  ownershipMatch: boolean;
}> {
  await new Promise(resolve => setTimeout(resolve, 1100));

  return {
    verified: true,
    ownershipMatch: Math.random() > 0.2
  };
}
