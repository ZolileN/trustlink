export function generateSessionToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

export async function hashValue(value: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(value);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export function formatPhoneNumber(phone: string): string {
  return phone.replace(/\D/g, '');
}

export function isValidSAIDNumber(idNumber: string): boolean {
  if (idNumber.length !== 13 || !/^\d+$/.test(idNumber)) {
    return false;
  }
  return true;
}

export function getExpiryTime(): string {
  const now = new Date();
  now.setMinutes(now.getMinutes() + 30);
  return now.toISOString();
}

export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleString('en-ZA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function isSessionExpired(expiresAt: string): boolean {
  return new Date(expiresAt) < new Date();
}

export function generateVerificationUrl(token: string): string {
  return `${window.location.origin}/verify/${token}`;
}

export function generateWhatsAppShareUrl(phone: string, message: string): string {
  const formattedPhone = formatPhoneNumber(phone);
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
}
