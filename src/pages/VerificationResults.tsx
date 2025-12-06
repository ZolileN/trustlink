import { useState, useEffect, useCallback } from 'react';
import { useParams } from './router';
import { Shield, RefreshCw, Share2 } from 'lucide-react';
import { Card, CardHeader } from '../components/Card';
import { Button } from '../components/Button';
import { VerificationBadge } from '../components/VerificationBadge';
import { getSessionByToken, getVerificationResult } from '../lib/api';
import { VerificationSession, VerificationResult } from '../lib/supabase';
import { supabase } from '../lib/supabase';

export function VerificationResults() {
  const { token } = useParams();
  const [session, setSession] = useState<VerificationSession | null>(null);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isBuyer, setIsBuyer] = useState(false);

  const getCurrentUserPhone = useCallback(async (): Promise<string | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      return user?.phone || null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }, []);

  const loadResults = useCallback(async () => {
    if (!token) {
      setError('Invalid verification link');
      setLoading(false);
      return;
    }

    try {
      const currentUserPhone = await getCurrentUserPhone();
      const { session: fetchedSession, error: sessionError } = await getSessionByToken(token);

      if (sessionError || !fetchedSession) {
        setError('Could not load verification session');
        setLoading(false);
        return;
      }

      // Check if current user is the buyer
      setIsBuyer(currentUserPhone === fetchedSession.buyer_phone);
      setSession(fetchedSession);

      if (fetchedSession.status === 'completed') {
        const { result: fetchedResult, error: resultError } = await getVerificationResult(fetchedSession.id);

        if (resultError) {
          setError('Could not load verification results');
        } else {
          setResult(fetchedResult);
        }
      }
    } catch (error) {
      console.error('Error loading results:', error);
      setError('An error occurred while loading the verification results');
    } finally {
      setLoading(false);
    }
  }, [token, getCurrentUserPhone]);

  useEffect(() => {
    loadResults();
  }, [loadResults]);

  const handleRefresh = () => {
    setLoading(true);
    setError('');
    loadResults();
  };

  const handleShare = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: isBuyer 
          ? 'My TrustLink Verification Results' 
          : 'TrustLink Verification Results',
        text: isBuyer
          ? 'Here are my verification results from TrustLink'
          : 'Here are the verification results from TrustLink',
        url
      });
    } else {
      navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    }
  };

  const getVerificationTypeLabel = () => {
    if (!session) return '';
    
    switch (session.verification_type) {
      case 'property':
        return 'Property Verification';
      case 'vehicle':
        return 'Vehicle Verification';
      case 'both':
        return 'Property & Vehicle Verification';
      default:
        return 'Verification';
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading verification results...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 py-12 px-4">
        <div className="max-w-md mx-auto">
          <Card className="text-center">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
              <p className="text-gray-700 mb-6">{error}</p>
              <Button onClick={handleRefresh}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </div>
          </Card>
        </div>
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

              <div className="flex justify-end">
                <Button onClick={handleRefresh}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh Status
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  const allVerified = result?.id_verification_status === 'verified' &&
    result?.name_match === true &&
    (session.verification_type === 'vehicle' ||
      (result?.property_verification_status === 'verified' && result?.property_match === true));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <Shield className="w-16 h-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {isBuyer ? 'Your Verification Results' : 'Verification Results'}
          </h1>
          <p className="text-xl text-gray-600">{getVerificationTypeLabel()}</p>
        </div>

        <Card className="mb-6">
          <div className={`p-6 rounded-lg mb-6 ${allVerified ? 'bg-green-50 border-2 border-green-200' : 'bg-yellow-50 border-2 border-yellow-200'}`}>
            <h3 className={`text-2xl font-bold mb-2 ${allVerified ? 'text-green-900' : 'text-yellow-900'}`}>
              {allVerified ? '✓ Fully Verified' : '⚠ Verification Issues Found'}
            </h3>
            <p className={`${allVerified ? 'text-green-800' : 'text-yellow-800'}`}>
              {allVerified
                ? isBuyer 
                  ? 'All verification checks passed successfully. You can proceed with confidence.'
                  : 'All verification checks passed successfully'
                : isBuyer
                  ? 'Some verification checks did not pass. Please review the details carefully before proceeding.'
                  : 'Some verification checks did not pass. Review details below.'}
            </p>
          </div>

          {/* Next Steps for Buyer */}
          {isBuyer && (
            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">Next Steps</h4>
              <ul className="list-disc pl-5 space-y-1 text-blue-800 text-sm">
                <li>Share these results with the seller if needed</li>
                <li>Keep this link for your records</li>
                <li>Contact support if you have any questions</li>
              </ul>
            </div>
          )}

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

          {!allVerified && (
            <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="font-semibold text-red-900 mb-2">⚠ Warning</h4>
              <p className="text-red-800 text-sm">
                {isBuyer
                  ? 'Please verify all details with the seller before proceeding with the transaction.'
                  : 'Please ensure all details are correct before sharing these results with the buyer.'}
              </p>
            </div>
          )}
        </Card>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            onClick={handleRefresh}
            className="flex-1"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            onClick={handleShare}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share Results
          </Button>
        </div>
      </div>
    </div>
  );
}