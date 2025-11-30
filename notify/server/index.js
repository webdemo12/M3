const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const webpush = require('web-push');
const fs = require('fs');
const path = require('path');

const SUBS_FILE = path.join(__dirname, 'subs.json');
let subscriptions = [];

if (fs.existsSync(SUBS_FILE)) {
  try {
    subscriptions = JSON.parse(fs.readFileSync(SUBS_FILE));
  } catch (e) {
    subscriptions = [];
  }
}

const app = express();
app.use(cors());
app.use(bodyParser.json());

const VAPID_PUBLIC = process.env.VAPID_PUBLIC || 'BCE58ePzJNJqHm5ltYeyqpG9144gjEXiJzVIdPIZ5aM2MLTblaPbpdQZcZYBEnguAEsQAyVn1922fnLkviMeTRc';
const VAPID_PRIVATE = process.env.VAPID_PRIVATE || 'BMUDrjfRyeEWOhQAWdmyXjH0f62QZml6FbT-fgojilY';
const EMAIL = process.env.ADMIN_EMAIL || 'mailto:krishnendupradhan721458@gmail.com';

if (!VAPID_PUBLIC || !VAPID_PRIVATE) {
  console.warn('VAPID keys not set. Generate VAPID keys and set VAPID_PUBLIC and VAPID_PRIVATE in env.');
}

// Use VAPID keys as-is (standard Base64 format, not URL-safe)
try {
  webpush.setVapidDetails(EMAIL, VAPID_PUBLIC, VAPID_PRIVATE);
  console.log('✅ VAPID keys configured (public key length:', VAPID_PUBLIC.length, ')');
} catch (err) {
  console.error('❌ Failed to set VAPID details:', err && err.message ? err.message : err);
  // Re-throw so startup fails loudly if keys invalid
  throw err;
}

function persist() {
  try {
    fs.writeFileSync(SUBS_FILE, JSON.stringify(subscriptions, null, 2));
  } catch (e) {
    console.warn('Failed to persist subscriptions:', e);
  }
}

app.get('/vapidPublicKey', (req, res) => {
  // Return the standard Base64 public key
  res.json({ publicKey: VAPID_PUBLIC });
});

app.post('/push/subscribe', (req, res) => {
  const sub = req.body;
  if (!sub || !sub.endpoint) return res.status(400).json({ error: 'Invalid subscription' });

  const exists = subscriptions.find(s => s.endpoint === sub.endpoint);
  if (!exists) {
    subscriptions.push(sub);
    persist();
    console.log('Added new subscription. Total:', subscriptions.length);
  }
  res.json({ success: true });
});

app.post('/push/notify', async (req, res) => {
  const payloadData = req.body || {};
  const payload = JSON.stringify({
    title: payloadData.title || 'M3 Matka',
    body: payloadData.body || 'New result posted',
    url: payloadData.url || '/',
    icon: payloadData.icon || '/ganesh.png'
  });

  const results = [];

  const subsCopy = Array.from(subscriptions);

  for (const sub of subsCopy) {
    try {
      await webpush.sendNotification(sub, payload);
      results.push({ endpoint: sub.endpoint, status: 'ok' });
    } catch (err) {
      console.warn('Failed to send to', sub.endpoint, err.statusCode || err);
      results.push({ endpoint: sub.endpoint, status: 'failed' });
      // Remove subscriptions that are gone
      if (err.statusCode === 410 || err.statusCode === 404) {
        subscriptions = subscriptions.filter(s => s.endpoint !== sub.endpoint);
        persist();
      }
    }
  }

  res.json({ results, total: subsCopy.length });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Push server running on port ${PORT}`));
