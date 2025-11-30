# M3 Matka Push Server

This is a minimal push server to accept subscriptions and send Web Push notifications using VAPID keys.

Setup

1. Install dependencies:

```bash
cd server
npm install
```

2. Generate VAPID keys (run in node REPL or a small script):

```js
const webpush = require('web-push');
console.log(webpush.generateVAPIDKeys());
```

Save the `publicKey` and `privateKey`.

3. Export environment variables and start server (example on Windows PowerShell):

```powershell
$env:VAPID_PUBLIC="<your-public-key>"
$env:VAPID_PRIVATE="<your-private-key>"
$env:ADMIN_EMAIL="mailto:you@example.com"
npm start
```

4. Configure the frontend:

- Set `VITE_PUSH_SERVER` (or `VITE_API_BASE`) in your `.env` to the push server base URL, for example:

```
VITE_PUSH_SERVER=http://localhost:4000
VITE_VAPID_PUBLIC=<your-public-key>
```

5. When a user clicks "Enable Notifications" in the app, the browser will request permission and subscribe to push. The subscription is sent to the server.

6. To send notifications, POST to `/push/notify` with JSON body:

```json
{
  "title": "M3 Matka Daily 10:30 AM result - check fast",
  "body": "Tap to check the updated 10:30 AM result",
  "url": "/"
}
```

Notes

- Web Push requires HTTPS in production. Localhost is allowed without HTTPS for testing.
- For production, host the push server on HTTPS and point `VITE_PUSH_SERVER` to it.
