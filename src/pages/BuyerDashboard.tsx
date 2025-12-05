import { useState } from 'react';
import { Shield, ArrowRight, Share2 } from 'lucide-react';
import { Card, CardHeader } from '../components/Card';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { createVerificationSession } from '../lib/api';
import { VerificationType } from '../lib/supabase';
import { generateVerificationUrl, generateWhatsAppShareUrl } from '../lib/utils';

export function BuyerDashboard() {
  const [buyerPhone, setBuyerPhone] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');  // Add this line here
  const [sellerPhone, setSellerPhone] = useState('');
  const [verificationType, setVerificationType] = useState<VerificationType>('property');
  const [loading, setLoading] = useState(false);
  const [verificationUrl, setVerificationUrl] = useState('');
  const [error, setError] = useState('');

  const handleCreateLink = async () => {
    // Check required fields
    if (!buyerPhone || !sellerPhone) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');

    const { session, error: apiError } = await createVerificationSession(
      buyerPhone,
      buyerEmail,
      sellerPhone,
      verificationType
    );

    setLoading(false);

    if (apiError || !session) {
      setError(apiError || 'Failed to create verification session');
      return;
    }

    const url = generateVerificationUrl(session.session_token);
    setVerificationUrl(url);
  };

  const handleShareWhatsApp = () => {
    const message = `Hi! Please verify your identity and ownership using this secure TrustLink: ${verificationUrl}

This will only take 45 seconds and helps protect both of us from scams.`;

    const whatsappUrl = generateWhatsAppShareUrl(sellerPhone, message);
    window.open(whatsappUrl, '_blank');
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(verificationUrl);
    alert('Link copied to clipboard!');
  };

  if (verificationUrl) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader
              title="Verification Link Created!"
              subtitle="Share this link with the seller to start the verification process"
            />

            <div className="space-y-4">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-2">Verification Link:</p>
                <p className="font-mono text-sm break-all text-gray-900">{verificationUrl}</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  variant="primary"
                  className="flex-1 flex items-center justify-center gap-2"
                  onClick={handleShareWhatsApp}
                >
                  <Share2 className="w-5 h-5" />
                  Share via WhatsApp
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={copyToClipboard}
                >
                  Copy Link
                </Button>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  <strong>Next steps:</strong> The seller will complete identity and ownership verification.
                  You'll be able to view the results using this same link.
                </p>
              </div>

              <Button
                variant="secondary"
                className="w-full"
                onClick={() => {
                  setVerificationUrl('');
                  setBuyerPhone('');
                  setBuyerEmail('');  // Add this line
                  setSellerPhone('');
                }}
              >
                Create Another Link
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Shield className="w-16 h-16 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">TrustLink</h1>
          <p className="text-xl text-gray-600">
            Verify seller identity and ownership in 45 seconds
          </p>
        </div>

        <Card>
          <CardHeader
            title="Create Verification Link"
            subtitle="Send a secure verification request to any seller"
          />

          <div className="space-y-4">
            <Input
              label="Your Phone Number"
              type="tel"
              placeholder="0821234567"
              value={buyerPhone}
              onChange={(e) => setBuyerPhone(e.target.value)}
              helperText="Your contact number for updates"
            />

            <Input
  label="Your Email"
  type="email"
              placeholder="your.email@example.com"
              value={buyerEmail}
              onChange={(e) => setBuyerEmail(e.target.value)}
              helperText="Your email for verification updates"
              required
            />
            <Input
              label="Seller's Phone Number"
              type="tel"
              placeholder="0827654321"
              value={sellerPhone}
              onChange={(e) => setSellerPhone(e.target.value)}
              helperText="The seller will receive the verification link"
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What to Verify
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    name="verificationType"
                    value="property"
                    checked={verificationType === 'property'}
                    onChange={(e) => setVerificationType(e.target.value as VerificationType)}
                    className="mr-3"
                  />
                  <div>
                    <span className="font-medium block">Property Ownership</span>
                    <span className="text-sm text-gray-500">Verify property ownership</span>
                  </div>
                </label>
                <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    name="verificationType"
                    value="vehicle"
                    checked={verificationType === 'vehicle'}
                    onChange={(e) => setVerificationType(e.target.value as VerificationType)}
                    className="mr-3"
                  />
                  <div>
                    <span className="font-medium block">Vehicle Ownership</span>
                    <span className="text-sm text-gray-500">Verify vehicle ownership</span>
                  </div>
                </label>
                <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    name="verificationType"
                    value="idNumber"
                    checked={verificationType === 'idNumber'}
                    onChange={(e) => setVerificationType(e.target.value as VerificationType)}
                    className="mr-3"
                  />
                  <div>
                    <span className="font-medium block">ID Verification</span>
                    <span className="text-sm text-gray-500">Verify identity document</span>
                  </div>
                </label>
                <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    name="verificationType"
                    value="both"
                    checked={verificationType === 'both'}
                    onChange={(e) => setVerificationType(e.target.value as VerificationType)}
                    className="mr-3"
                  />
                  <div>
                    <span className="font-medium block">Property & Vehicle</span>
                    <span className="text-sm text-gray-500">Verify both ownerships</span>
                  </div>
                </label>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            <Button
              variant="primary"
              size="lg"
              className="w-full flex items-center justify-center gap-2"
              onClick={handleCreateLink}
              disabled={loading}
            >
              {loading ? 'Creating Link...' : 'Create Verification Link'}
              <ArrowRight className="w-5 h-5" />
            </Button>
          </div>
        </Card>

        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="font-bold text-gray-900 mb-3">How it works</h3>
          <ol className="space-y-2 text-gray-600">
            <li>1. Enter your details and select what to verify</li>
            <li>2. Share the secure link with the seller via WhatsApp</li>
            <li>3. Seller completes verification in under 45 seconds</li>
            <li>4. You receive instant verification results</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
