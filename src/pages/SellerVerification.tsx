import { useState, useEffect } from 'react';
import { useParams } from './router';
import { Shield, User, Home, Car, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardHeader } from '../components/Card';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import {
  getSessionByToken,
  updateSessionStatus,
  createVerificationResult,
  updateVerificationResult,
  simulateIDVerification,
  simulatePropertyVerification,
  simulateVehicleVerification
} from '../lib/api';
import { VerificationSession } from '../lib/supabase';
import { isSessionExpired, hashValue } from '../lib/utils';

type VerificationStep = 'loading' | 'expired' | 'invalid' | 'intro' | 'id' | 'property' | 'vehicle' | 'complete';

export function SellerVerification() {
  const { token } = useParams();
  const [session, setSession] = useState<VerificationSession | null>(null);
  const [step, setStep] = useState<VerificationStep>('loading');
  const [error, setError] = useState('');

  const [idNumber, setIdNumber] = useState('');
  const [fullName, setFullName] = useState('');
  const [propertyReference, setPropertyReference] = useState('');
  const [vehicleReference, setVehicleReference] = useState('');

  const [verifying, setVerifying] = useState(false);
  const [verificationResults, setVerificationResults] = useState({
    idVerified: false,
    nameMatch: false,
    propertyVerified: false,
    propertyMatch: false,
    vehicleVerified: false,
    vehicleMatch: false
  });

  useEffect(() => {
    loadSession();
  }, [token]);

  const loadSession = async () => {
    if (!token) {
      setStep('invalid');
      return;
    }

    const { session: fetchedSession, error: sessionError } = await getSessionByToken(token);

    if (sessionError || !fetchedSession) {
      setStep('invalid');
      return;
    }

    if (isSessionExpired(fetchedSession.expires_at)) {
      setStep('expired');
      return;
    }

    setSession(fetchedSession);

    if (fetchedSession.status === 'completed') {
      setStep('complete');
    } else {
      setStep('intro');
    }
  };

  const handleStart = async () => {
    if (!session) return;

    await updateSessionStatus(session.id, 'in_progress');
    await createVerificationResult(session.id);
    setStep('id');
  };

  const handleIDVerification = async () => {
    if (!idNumber || !fullName) {
      setError('Please fill in all fields');
      return;
    }

    setVerifying(true);
    setError('');

    const idHash = await hashValue(idNumber);
    const result = await simulateIDVerification(idNumber, fullName);

    await updateVerificationResult(session!.id, {
      id_verification_status: result.verified ? 'verified' : 'failed',
      id_hash: idHash,
      name_match: result.nameMatch
    });

    setVerificationResults(prev => ({
      ...prev,
      idVerified: result.verified,
      nameMatch: result.nameMatch
    }));

    setVerifying(false);

    if (session!.verification_type === 'property' || session!.verification_type === 'both') {
      setStep('property');
    } else if (session!.verification_type === 'vehicle') {
      setStep('vehicle');
    } else {
      await finalizeVerification();
    }
  };

  const handlePropertyVerification = async () => {
    if (!propertyReference) {
      setError('Please enter property reference');
      return;
    }

    setVerifying(true);
    setError('');

    const propHash = await hashValue(propertyReference);
    const result = await simulatePropertyVerification(propertyReference);

    await updateVerificationResult(session!.id, {
      property_verification_status: result.verified ? 'verified' : 'failed',
      property_reference: propHash,
      property_match: result.ownershipMatch
    });

    setVerificationResults(prev => ({
      ...prev,
      propertyVerified: result.verified,
      propertyMatch: result.ownershipMatch
    }));

    setVerifying(false);

    if (session!.verification_type === 'both') {
      setStep('vehicle');
    } else {
      await finalizeVerification();
    }
  };

  const handleVehicleVerification = async () => {
    if (!vehicleReference) {
      setError('Please enter vehicle reference');
      return;
    }

    setVerifying(true);
    setError('');

    const vehicleHash = await hashValue(vehicleReference);
    const result = await simulateVehicleVerification(vehicleReference);

    await updateVerificationResult(session!.id, {
      vehicle_verification_status: result.verified ? 'verified' : 'failed',
      vehicle_reference: vehicleHash,
      vehicle_match: result.ownershipMatch
    });

    setVerificationResults(prev => ({
      ...prev,
      vehicleVerified: result.verified,
      vehicleMatch: result.ownershipMatch
    }));

    setVerifying(false);
    await finalizeVerification();
  };

  const finalizeVerification = async () => {
    await updateVerificationResult(session!.id, {
      completed_at: new Date().toISOString()
    });
    await updateSessionStatus(session!.id, 'completed');
    setStep('complete');
  };

  if (step === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-blue-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading verification...</p>
        </div>
      </div>
    );
  }

  if (step === 'invalid') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-4">
        <Card className="max-w-md">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Invalid Link</h2>
            <p className="text-gray-600">This verification link is invalid or has been removed.</p>
          </div>
        </Card>
      </div>
    );
  }

  if (step === 'expired') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-4">
        <Card className="max-w-md">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-yellow-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Link Expired</h2>
            <p className="text-gray-600">This verification link has expired. Please request a new one from the buyer.</p>
          </div>
        </Card>
      </div>
    );
  }

  if (step === 'intro') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <Shield className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h1 className="text-4xl font-bold text-gray-900 mb-2">TrustLink Verification</h1>
            <p className="text-xl text-gray-600">Quick & Secure Identity Verification</p>
          </div>

          <Card>
            <CardHeader
              title="Build Trust in 45 Seconds"
              subtitle="The buyer has requested verification to ensure a safe transaction"
            />

            <div className="space-y-4 mb-6">
              <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg">
                <User className="w-6 h-6 text-blue-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-gray-900">Identity Verification</h3>
                  <p className="text-sm text-gray-600">Verify your SA ID number</p>
                </div>
              </div>

              {(session?.verification_type === 'property' || session?.verification_type === 'both') && (
                <div className="flex items-start gap-3 p-4 bg-green-50 rounded-lg">
                  <Home className="w-6 h-6 text-green-600 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Property Ownership</h3>
                    <p className="text-sm text-gray-600">Verify property ownership via Deeds Office</p>
                  </div>
                </div>
              )}

              {(session?.verification_type === 'vehicle' || session?.verification_type === 'both') && (
                <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-lg">
                  <Car className="w-6 h-6 text-purple-600 mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900">Vehicle Ownership</h3>
                    <p className="text-sm text-gray-600">Verify vehicle ownership via NaTIS</p>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-gray-900 mb-2">Your Privacy</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Your ID details are encrypted and hashed</li>
                <li>• Only match/no-match results are shared</li>
                <li>• No raw personal data is stored</li>
                <li>• POPIA compliant</li>
              </ul>
            </div>

            <Button
              variant="primary"
              size="lg"
              className="w-full"
              onClick={handleStart}
            >
              Start Verification
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  if (step === 'id') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader
              title="Step 1: Identity Verification"
              subtitle="Enter your South African ID number and full name"
            />

            <div className="space-y-4">
              <Input
                label="SA ID Number"
                type="text"
                placeholder="9001015009087"
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)}
                helperText="13-digit South African ID number"
                maxLength={13}
              />

              <Input
                label="Full Name"
                type="text"
                placeholder="John Smith"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                helperText="As it appears on your ID"
              />

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}

              <Button
                variant="primary"
                size="lg"
                className="w-full"
                onClick={handleIDVerification}
                disabled={verifying}
              >
                {verifying ? 'Verifying...' : 'Verify Identity'}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (step === 'property') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader
              title="Step 2: Property Verification"
              subtitle="Enter the property details to verify ownership"
            />

            <div className="space-y-4">
              <Input
                label="ERF Number or Street Address"
                type="text"
                placeholder="ERF 12345 or 123 Main Street, Johannesburg"
                value={propertyReference}
                onChange={(e) => setPropertyReference(e.target.value)}
                helperText="Property reference for Deeds Office lookup"
              />

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}

              <Button
                variant="success"
                size="lg"
                className="w-full"
                onClick={handlePropertyVerification}
                disabled={verifying}
              >
                {verifying ? 'Verifying...' : 'Verify Property Ownership'}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (step === 'vehicle') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader
              title={`Step ${session?.verification_type === 'both' ? '3' : '2'}: Vehicle Verification`}
              subtitle="Enter the vehicle details to verify ownership"
            />

            <div className="space-y-4">
              <Input
                label="VIN or Chassis Number"
                type="text"
                placeholder="WBAUE11060E123456"
                value={vehicleReference}
                onChange={(e) => setVehicleReference(e.target.value)}
                helperText="Vehicle identification number for NaTIS lookup"
              />

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-800 text-sm">{error}</p>
                </div>
              )}

              <Button
                variant="success"
                size="lg"
                className="w-full"
                onClick={handleVehicleVerification}
                disabled={verifying}
              >
                {verifying ? 'Verifying...' : 'Verify Vehicle Ownership'}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (step === 'complete') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <Card>
            <div className="text-center mb-6">
              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Verification Complete!</h2>
              <p className="text-gray-600">The buyer can now view your verification results</p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-900 text-sm">
                Your verification has been successfully completed. The buyer will be notified and can proceed with confidence.
              </p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return null;
}
