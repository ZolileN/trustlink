import { useState, useEffect } from 'react';
import { useParams } from './router';
import { Shield, RefreshCw, Share2 } from 'lucide-react';
import { Card, CardHeader } from '../components/Card';
import { Button } from '../components/Button';
import { VerificationBadge } from '../components/VerificationBadge';
import { getSessionByToken, getVerificationResult } from '../lib/api';
import { VerificationSession, VerificationResult } from '../lib/supabase';
import { formatDateTime } from '../lib/utils';

export function VerificationResults() {
  const { token } = useParams();
  const [session, setSession] = useState<VerificationSession | null>(null);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadResults();
  }, [token]);

  const loadResults = async () => {
    if (!token) {
      setError('Invalid verification link');
      setLoading(false);
      return;
    }

    const { session: fetchedSession, error: sessionError } = await getSessionByToken(token);

    if (sessionError || !fetchedSession) {
      setError('Could not load verification session');
      setLoading(false);
      return;
    }

    setSession(fetchedSession);

    if (fetchedSession.status === 'completed') {
      const { result: fetchedResult, error: resultError } = await getVerificationResult(fetchedSession.id);

      if (resultError) {
        setError('Could not load verification results');
      } else {
        setResult(fetchedResult);
      }
    }

    setLoading(false);
  };

  const handleRefresh = () => {
    setLoading(true);
    loadResults();
  };

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: 'TrustLink Verification Results',
        text: 'View my verified TrustLink results',
        url
      });
    } else {
      navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-blue-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Loading results...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex items-center justify-center p-4">
        <Card className="max-w-md">
          <div className="text-center">
            <p className="text-red-600">{error}</p>
          </div>
        </Card>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  if (session.status !== 'completed') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader
              title="Verification In Progress"
              subtitle="The seller has not completed verification yet"
            />

            <div className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-900 text-sm">
                  <strong>Status:</strong> {session.status === 'pending' ? 'Waiting for seller to start' : 'Seller is completing verification'}
                </p>
                <p className="text-yellow-800 text-sm mt-2">
                  Created: {formatDateTime(session.created_at)}
                </p>
              </div>

              <Button
                variant="outline"
                className="w-full flex items-center justify-center gap-2"
                onClick={handleRefresh}
              >
                <RefreshCw className="w-5 h-5" />
                Refresh Status
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  const getVerificationTypeLabel = () => {
    switch (session.verification_type) {
      case 'property':
        return 'Property Ownership';
      case 'vehicle':
        return 'Vehicle Ownership';
      case 'both':
        return 'Property & Vehicle Ownership';
    }
  };

  const allVerified = result?.id_verification_status === 'verified' &&
    result?.name_match === true &&
    (session.verification_type === 'vehicle' ||
      (result?.property_verification_status === 'verified' && result?.property_match === true)) &&
    (session.verification_type === 'property' ||
      (result?.vehicle_verification_status === 'verified' && result?.vehicle_match === true));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <Shield className="w-16 h-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Verification Results</h1>
          <p className="text-xl text-gray-600">{getVerificationTypeLabel()}</p>
        </div>

        <Card className="mb-6">
          <div className={`p-6 rounded-lg mb-6 ${allVerified ? 'bg-green-50 border-2 border-green-200' : 'bg-yellow-50 border-2 border-yellow-200'}`}>
            <h3 className={`text-2xl font-bold mb-2 ${allVerified ? 'text-green-900' : 'text-yellow-900'}`}>
              {allVerified ? '✓ Fully Verified' : '⚠ Verification Issues Found'}
            </h3>
            <p className={`${allVerified ? 'text-green-800' : 'text-yellow-800'}`}>
              {allVerified
                ? 'All verification checks passed successfully'
                : 'Some verification checks did not pass. Review details below.'}
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Identity Verification</h4>
              <div className="space-y-2">
                <VerificationBadge
                  status={result?.id_verification_status || 'pending'}
                  label={result?.id_verification_status === 'verified' ? 'ID Verified' : 'ID Verification Failed'}
                />
                {result?.name_match !== null && (
                  <VerificationBadge
                    status={result?.name_match ? 'verified' : 'failed'}
                    label={result?.name_match ? 'Name Match Confirmed' : 'Name Mismatch'}
                  />
                )}
              </div>
            </div>

            {(session.verification_type === 'property' || session.verification_type === 'both') && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Property Ownership</h4>
                <div className="space-y-2">
                  <VerificationBadge
                    status={result?.property_verification_status || 'pending'}
                    label={result?.property_verification_status === 'verified' ? 'Property Verified' : 'Property Check Failed'}
                  />
                  {result?.property_match !== null && (
                    <VerificationBadge
                      status={result?.property_match ? 'verified' : 'failed'}
                      label={result?.property_match ? 'Ownership Confirmed' : 'Ownership Not Confirmed'}
                    />
                  )}
                </div>
              </div>
            )}

            {(session.verification_type === 'vehicle' || session.verification_type === 'both') && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3">Vehicle Ownership</h4>
                <div className="space-y-2">
                  <VerificationBadge
                    status={result?.vehicle_verification_status || 'pending'}
                    label={result?.vehicle_verification_status === 'verified' ? 'Vehicle Verified' : 'Vehicle Check Failed'}
                  />
                  {result?.vehicle_match !== null && (
                    <VerificationBadge
                      status={result?.vehicle_match ? 'verified' : 'failed'}
                      label={result?.vehicle_match ? 'Ownership Confirmed' : 'Ownership Not Confirmed'}
                    />
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="text-sm text-gray-600 space-y-1">
              <p><strong>Completed:</strong> {result?.completed_at ? formatDateTime(result.completed_at) : 'N/A'}</p>
              <p><strong>Verification ID:</strong> {session.id.substring(0, 8).toUpperCase()}</p>
            </div>
          </div>
        </Card>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            className="flex-1 flex items-center justify-center gap-2"
            onClick={handleShare}
          >
            <Share2 className="w-5 h-5" />
            Share Results
          </Button>
          <Button
            variant="primary"
            className="flex-1"
            onClick={() => window.location.href = '/'}
          >
            Create New Verification
          </Button>
        </div>

        {!allVerified && (
          <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="font-semibold text-red-900 mb-2">⚠ Warning</h4>
            <p className="text-red-800 text-sm">
              This seller has not passed all verification checks. Please exercise caution before proceeding with any transactions.
              Do not send deposits or payments until you are confident in the seller's identity and ownership claims.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
