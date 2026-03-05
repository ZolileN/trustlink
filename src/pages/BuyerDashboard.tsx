import { useState } from 'react';
import { ArrowRight, Copy, Link2, Share2 } from 'lucide-react';
import { Card, CardHeader } from '../components/Card';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { createVerificationSession } from '../lib/api';
import { VerificationType } from '../lib/supabase';
import { generateVerificationUrl, generateWhatsAppShareUrl } from '../lib/utils';
import brandLogo from '../../Logo.png';

const verificationOptions: Array<{
  value: VerificationType;
  title: string;
  description: string;
}> = [
  { value: 'property', title: 'Property Ownership', description: 'Validate title ownership details' },
  { value: 'vehicle', title: 'Vehicle Ownership', description: 'Validate NaTIS ownership records' },
  { value: 'idNumber', title: 'ID Verification', description: 'Validate identity against ID details' },
  { value: 'both', title: 'Property and Vehicle', description: 'Run both ownership checks' }
];

const howItWorksSteps = [
  {
    title: 'Enter Buyer Details & Choose Verification',
    description:
      'Fill in your contact info and select the verification type(s) you need - ID, property ownership, or vehicle registration.'
  },
  {
    title: 'Generate & Share Secure Link',
    description:
      'Instantly create a unique, encrypted verification link and send it to the seller via WhatsApp, email, or any messaging platform.'
  },
  {
    title: 'Seller Verifies in Under a Minute',
    description:
      'The seller clicks the link and completes the verification process - typically 45 seconds or less - using official government records.'
  },
  {
    title: 'View Verified Results Instantly',
    description:
      'Open the same link to see real-time verification results. Green means ownership and identity match; red indicates a mismatch. Share proof with confidence before making any payment.'
  }
];

export function BuyerDashboard() {
  const [buyerPhone, setBuyerPhone] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [sellerPhone, setSellerPhone] = useState('');
  const [verificationType, setVerificationType] = useState<VerificationType>('property');
  const [loading, setLoading] = useState(false);
  const [verificationUrl, setVerificationUrl] = useState('');
  const [error, setError] = useState('');

  const handleCreateLink = async () => {
    if (!buyerPhone || !sellerPhone) {
      setError('Please fill in your phone number and the seller phone number.');
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

    setVerificationUrl(generateVerificationUrl(session.session_token));
  };

  const handleShareWhatsApp = () => {
    const message = `Hi! Please verify your identity and ownership using this secure TrustLink: ${verificationUrl}

This takes under 45 seconds and protects both of us from scams.`;

    const whatsappUrl = generateWhatsAppShareUrl(sellerPhone, message);
    window.open(whatsappUrl, '_blank');
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(verificationUrl);
    alert('Link copied to clipboard!');
  };

  if (verificationUrl) {
    return (
      <div className="app-bg min-h-screen">
        <div className="page-shell max-w-2xl">
          <Card>
            <CardHeader
              title="Verification Link Ready"
              subtitle="Share this secure link with your seller to begin verification."
            />

            <div className="space-y-5">
              <div className="rounded-2xl border border-blue-100 bg-white/95 p-4">
                <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-blue-700">
                  <Link2 className="h-4 w-4" />
                  Verification URL
                </div>
                <p className="break-all font-mono text-xs text-slate-700 sm:text-sm">{verificationUrl}</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <Button
                  variant="primary"
                  className="gap-2"
                  onClick={handleShareWhatsApp}
                >
                  <Share2 className="h-4 w-4" />
                  Share on WhatsApp
                </Button>
                <Button variant="outline" className="gap-2" onClick={copyToClipboard}>
                  <Copy className="h-4 w-4" />
                  Copy Link
                </Button>
              </div>

              <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4 text-sm text-blue-900">
                <strong>Next step:</strong> once the seller completes verification, this same link opens the results summary.
              </div>

              <Button
                variant="secondary"
                className="w-full"
                onClick={() => {
                  setVerificationUrl('');
                  setBuyerPhone('');
                  setBuyerEmail('');
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
    <div className="app-bg min-h-screen">
      <div className="page-shell max-w-3xl">
        <section className="logo-hero mb-7 rounded-3xl border border-blue-100 bg-white/70 p-6 text-center shadow-sm backdrop-blur-sm sm:p-8">
          <div className="mb-3 flex flex-col items-center gap-3">
            <div className="logo-frame">
              <img
                src={brandLogo}
                alt="Identity Banc logo"
                className="logo-image"
              />
            </div>
            <p className="feature-chip">A digital ownership verification layer for safer peer-to-peer transactions.</p>
          </div>
        </section>

        <Card>
          <CardHeader
            title="Create Verification Link"
            subtitle="Add details, choose checks, and send instantly to your seller."
          />

          <div className="space-y-4">
            <Input
              label="Your Phone Number"
              type="tel"
              placeholder="0821234567"
              value={buyerPhone}
              onChange={(e) => setBuyerPhone(e.target.value)}
              helperText="Used for result updates"
            />

            <Input
              label="Your Email"
              type="email"
              placeholder="your.email@example.com"
              value={buyerEmail}
              onChange={(e) => setBuyerEmail(e.target.value)}
              helperText="Optional, for additional notifications"
            />

            <Input
              label="Seller's Phone Number"
              type="tel"
              placeholder="0827654321"
              value={sellerPhone}
              onChange={(e) => setSellerPhone(e.target.value)}
              helperText="The verification link is sent to this number"
            />

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">What to Verify</label>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {verificationOptions.map((option) => {
                  const isSelected = verificationType === option.value;
                  return (
                    <label
                      key={option.value}
                      className={`cursor-pointer rounded-2xl border p-4 transition-all ${
                        isSelected
                          ? 'border-blue-300 bg-blue-50 shadow-sm'
                          : 'border-slate-200 bg-white/80 hover:border-blue-200 hover:bg-blue-50/40'
                      }`}
                    >
                      <div className="mb-2 flex items-center gap-2">
                        <input
                          type="radio"
                          name="verificationType"
                          value={option.value}
                          checked={isSelected}
                          onChange={(e) => setVerificationType(e.target.value as VerificationType)}
                          className="h-4 w-4 border-slate-300 text-blue-600"
                        />
                        <span className="font-semibold text-slate-900">{option.title}</span>
                      </div>
                      <p className="pl-6 text-sm text-slate-500">{option.description}</p>
                    </label>
                  );
                })}
              </div>
            </div>

            {error && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
                {error}
              </div>
            )}

            <Button
              variant="primary"
              size="lg"
              className="w-full gap-2"
              onClick={handleCreateLink}
              disabled={loading}
            >
              {loading ? 'Creating Link...' : 'Create Verification Link'}
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        </Card>

        <section className="mt-7 rounded-3xl border border-blue-100 bg-white/85 p-6 shadow-sm backdrop-blur-sm sm:p-7">
          <h3 className="hero-title text-2xl font-bold text-slate-900">How Identity Banc Works</h3>
          <div className="mt-4 grid gap-3">
            {howItWorksSteps.map((step, index) => (
              <article
                key={step.title}
                className="rounded-2xl border border-blue-100 bg-gradient-to-br from-white to-blue-50/60 p-4"
              >
                <div className="mb-2 inline-flex items-center rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-800">
                  Step {index + 1}
                </div>
                <h4 className="text-base font-semibold text-slate-900 sm:text-lg">{step.title}</h4>
                <p className="mt-1 text-sm text-slate-600 sm:text-base">{step.description}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
