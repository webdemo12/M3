// Validate VAPID keys in server/.env using web-push
const fs = require('fs');
const path = require('path');
const webpush = require('web-push');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const VAPID_PUBLIC = process.env.VAPID_PUBLIC;
const VAPID_PRIVATE = process.env.VAPID_PRIVATE;
const EMAIL = process.env.ADMIN_EMAIL || 'mailto:admin@example.com';

function makeUrlSafeBase64(key) {
  if (!key || typeof key !== 'string') return key;
  return key.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

console.log('Loaded VAPID_PUBLIC length:', VAPID_PUBLIC ? VAPID_PUBLIC.length : 'missing');
console.log('Loaded VAPID_PRIVATE length:', VAPID_PRIVATE ? VAPID_PRIVATE.length : 'missing');

const safePub = makeUrlSafeBase64(VAPID_PUBLIC || '');
const safePriv = makeUrlSafeBase64(VAPID_PRIVATE || '');

try {
  webpush.setVapidDetails(EMAIL, safePub, safePriv);
  console.log('✅ VAPID keys are valid (after URL-safe sanitization).');
  console.log('Public key (sanitized):', safePub);
} catch (err) {
  console.error('❌ VAPID validation failed:', err && err.message ? err.message : err);
  process.exit(1);
}
