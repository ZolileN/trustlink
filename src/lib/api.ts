import { supabase, VerificationType, VerificationSession, VerificationResult } from './supabase';
import { generateSessionToken, getExpiryTime } from './utils';

export async function createVerificationSession(
  buyerPhone: string,
  buyerEmail: string,
  sellerPhone: string,
  verificationType: VerificationType
): Promise<{ session: VerificationSession | null; error: string | null }> {
  try {
    const token = generateSessionToken();
    const expiresAt = getExpiryTime();

    const { data, error } = await supabase
      .from('verification_sessions')
      .insert({
        session_token: token,
        buyer_phone: buyerPhone,
        buyer_email: buyerEmail,
        seller_phone: sellerPhone,
        verification_type: verificationType,
        status: 'pending',
        expires_at: expiresAt,
      })
      .select()
      .single();

    if (error) {
      return { session: null, error: error.message };
    }

    return { session: data as VerificationSession, error: null };
  } catch (error) {
    console.error('Error creating verification session:', error);
    return { session: null, error: 'Failed to create verification session' };
  }
}

// 2. Fix error parameter in getSessionByToken
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
  } catch (error) {
    console.error('Error fetching session by token:', error);  // Using error instead of err
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
  } catch (error) {
    console.error('Error updating session status:', error);
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
  } catch (error) {
    console.error('Error creating verification result:', error);
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
  } catch (error) {
    console.error('Error updating verification result:', error);
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
  } catch (error) {
    console.error('Error fetching verification result:', error);
    return { result: null, error: 'Failed to fetch verification result' };
  }
}

export async function simulateIDVerification(_idNumber: string, expectedName: string): Promise<{
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function simulatePropertyVerification(_propertyReference: string): Promise<{
  verified: boolean;
  ownershipMatch: boolean;
}> {
  await new Promise(resolve => setTimeout(resolve, 1200));

  return {
    verified: true,
    ownershipMatch: Math.random() > 0.2
  };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function simulateVehicleVerification(_vehicleReference: string): Promise<{
  verified: boolean;
  ownershipMatch: boolean;
}> {
  await new Promise(resolve => setTimeout(resolve, 1100));

  return {
    verified: true,
    ownershipMatch: Math.random() > 0.2
  };
}

export async function sendVerificationResults(
  sessionId: string,
  result: VerificationResult
): Promise<{ success: boolean; error: string | null }> {
  try {
    // Get the session to access buyer's phone number
    const { session, error: sessionError } = await getSessionBySessionId(sessionId);
    if (sessionError || !session) {
      return { success: false, error: sessionError || 'Session not found' };
    }

    // Create a results link
    const resultsLink = `${window.location.origin}/results/${session.session_token}`;
    
    // Format the message based on verification results
    let message = `🔒 TrustLink Verification Results\n\n`;
    message += `✅ Verification completed by seller\n\n`;
    
    if (result.id_verification_status === 'verified') {
      message += `🆔 ID Verification: Verified\n`;
      message += `   • Name Match: ${result.name_match ? '✅' : '❌'}\n\n`;
    }
    
    if (result.property_verification_status === 'verified') {
      message += `🏠 Property Verification: ${result.property_match ? '✅ Verified' : '❌ Not Verified'}\n\n`;
    }
    
    if (result.vehicle_verification_status === 'verified') {
      message += `🚗 Vehicle Verification: ${result.vehicle_match ? '✅ Verified' : '❌ Not Verified'}\n\n`;
    }
    
    message += `View full results: ${resultsLink}`;

    // In a real app, you would integrate with an SMS service here
    // For example, using Twilio, AWS SNS, or another SMS provider
    console.log('Sending verification results to:', session.buyer_phone);
    console.log('Message:', message);

    return { success: true, error: null };
  } catch (error) {
    console.error('Error sending verification results:', error);
    return { success: false, error: 'Failed to send verification results' };
  }
}

// Add this helper function to get session by ID
async function getSessionBySessionId(sessionId: string) {
  try {
    const { data, error } = await supabase
      .from('verification_sessions')
      .select('*')
      .eq('id', sessionId)
      .maybeSingle();

    if (error) {
      return { session: null, error: error.message };
    }

    return { session: data as VerificationSession | null, error: null };
  } catch (error) {  // Changed from err to error
    console.error('Error fetching session by ID:', error);
    return { session: null, error: 'Failed to fetch session' };
  }
}

// Add this new function to your api.ts file
export async function sendSellerNotification(
  sessionId: string,
  result: VerificationResult
): Promise<{ success: boolean; error: string | null }> {
  try {
    // Get the session to access seller's phone and email
    const { data: session, error: sessionError } = await supabase
      .from('verification_sessions')
      .select('*')
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) {
      return { success: false, error: 'Session not found' };
    }

    // Get seller's email (you'll need to store this in your database)
    const { data: seller, error: sellerError } = await supabase
      .from('sellers') // Assuming you have a sellers table
      .select('email, first_name, last_name')
      .eq('phone', session.seller_phone)
      .single();

    if (sellerError || !seller) {
      return { success: false, error: 'Seller not found' };
    }

    // Determine verification status based on the verification type
    let verificationStatus: string;
    let verificationType: string;
    
    if (session.verification_type === 'idNumber') {
      verificationType = 'ID Verification';
      verificationStatus = result.id_verification_status === 'verified' 
        ? '✅ Verified' 
        : '❌ Not Verified';
    } else if (session.verification_type === 'property') {
      verificationType = 'Property Verification';
      verificationStatus = result.property_verification_status === 'verified'
        ? result.property_match ? '✅ Verified' : '❌ Verification Failed'
        : '❌ Not Verified';
    } else if (session.verification_type === 'vehicle') {
      verificationType = 'Vehicle Verification';
      verificationStatus = result.vehicle_verification_status === 'verified'
        ? result.vehicle_match ? '✅ Verified' : '❌ Verification Failed'
        : '❌ Not Verified';
    } else { // 'both' or any other type
      verificationType = 'ID, Property, and Vehicle Verification';
      const idStatus = result.id_verification_status === 'verified' ? '✅' : '❌';
      const propertyStatus = result.property_verification_status === 'verified' 
        ? (result.property_match ? '✅' : '❌') 
        : '❌';
      const vehicleStatus = result.vehicle_verification_status === 'verified'
        ? (result.vehicle_match ? '✅' : '❌')
        : '❌';
      verificationStatus = `ID: ${idStatus}, Property: ${propertyStatus}, Vehicle: ${vehicleStatus}`;
    }

    const emailContent = `
      <h2>Verification Update</h2>
      <p>Hello ${seller.first_name} ${seller.last_name},</p>
      <p>The buyer has submitted their verification details for ${verificationType}.</p>
      <p>Verification Status: ${verificationStatus}</p>
      <p>You can view the full results by logging into your TrustLink account.</p>
      <p>Best regards,<br/>The TrustLink Team</p>
    `;

    // Send email using Supabase's email service
    const { error: emailError } = await supabase.functions.invoke('send-email', {
      body: {
        to: seller.email,
        subject: 'Buyer Verification Update',
        html: emailContent,
      },
    });

    if (emailError) {
      console.error('Error sending email:', emailError);
      // Fallback to SMS if email fails
      const smsMessage = `TrustLink: Buyer has submitted ${verificationType}. Status: ${verificationStatus.replace(/[^✅❌]/g, '')}. Log in for details.`;
      await sendSMS(session.seller_phone, smsMessage);
    }

    return { success: true, error: null };
  } catch (error) {
    console.error('Error in sendSellerNotification:', error);
    return { success: false, error: 'Failed to send notification' };
  }
}

// Helper function to send SMS (you'll need to implement this based on your SMS provider)
async function sendSMS(phone: string, message: string): Promise<void> {
  // Implement your SMS sending logic here
  // This could be Twilio, AWS SNS, or another SMS provider
  console.log(`SMS to ${phone}: ${message}`);
  // Example with Twilio:
  // const accountSid = process.env.TWILIO_ACCOUNT_SID;
  // const authToken = process.env.TWILIO_AUTH_TOKEN;
  // const client = require('twilio')(accountSid, authToken);
  // await client.messages.create({
  //   body: message,
  //   from: 'YOUR_TWILIO_NUMBER',
  //   to: phone
  // });
}