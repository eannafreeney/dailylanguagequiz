# Daily push reminders

Daily reminders use standard Web Push with VAPID keys. The private key must stay in Cloudflare secrets and must never be committed to the repository.

## One-time Cloudflare setup

1. Install dependencies after pulling the change:

   ```sh
   npm install
   ```

2. Generate one VAPID key pair. The `web-push` CLI can generate compatible keys:

   ```sh
   npx web-push generate-vapid-keys
   ```

3. Store the generated public and private keys as Worker secrets, plus a contact address for the VAPID subject:

   ```sh
   npx wrangler secret put VAPID_PUBLIC_KEY
   npx wrangler secret put VAPID_PRIVATE_KEY
   npx wrangler secret put VAPID_SUBJECT
   ```

   Use the generated values for the first two prompts. For `VAPID_SUBJECT`, use a contact such as `mailto:quiz@mydaily.irish`. Keep the same key pair after deployment; replacing it invalidates existing browser subscriptions.

4. Apply the new D1 migration:

   ```sh
   npx wrangler d1 migrations apply mydaily-quiz-subscribers --remote
   ```

5. Deploy the Worker:

   ```sh
   npm run deploy
   ```

## Behaviour

- Users opt in from the Mobile App page after granting browser notification permission.
- The default reminder is 09:00 in the device's IANA timezone. Users can choose another time in 15-minute increments.
- The Worker runs every 15 minutes and sends at most one reminder per subscription per local calendar day.
- Turning reminders off removes the server-side subscription and unsubscribes that browser.
- Expired push endpoints (HTTP 404/410) are automatically removed.
- Email newsletter subscriptions are unchanged.

## Platform notes

- iOS/iPadOS web push requires iOS/iPadOS 16.4 or later and the website must be added to the Home Screen before enabling notifications.
- Android and desktop support depends on the browser's Web Push support and the user's permission.
- Push delivery is best-effort; browser and operating-system settings can suppress notifications.

## Manual smoke test

1. Apply the migration and configure the VAPID secrets.
2. Open `/mobile-app` on a supported browser.
3. Enable reminders and allow notifications.
4. Set a reminder time 15 minutes ahead and wait for the next quarter-hour scheduler run.
5. Confirm the notification opens the site's home page.
6. Turn reminders off and confirm the browser subscription is removed.