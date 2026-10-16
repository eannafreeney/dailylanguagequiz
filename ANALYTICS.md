# Daily quiz analytics

The app records a completion when a visitor submits a correct answer to the final question for the day. Records are stored in the existing Cloudflare D1 database.

## Deploy

1. Apply the new D1 migration to the **remote** database:

   ```sh
   npx wrangler d1 migrations apply mydaily-quiz-subscribers --remote
   ```

2. Set a strong dashboard password as a Cloudflare Worker secret:

   ```sh
   npx wrangler secret put ANALYTICS_PASSWORD
   ```

   Enter a long, unique password when prompted. Do not put it in `wrangler.jsonc` or commit it to Git.

3. Deploy the Worker using the project's normal deploy command:

   ```sh
   npm run deploy
   ```

4. Visit `https://mydaily.irish/analytics` and enter any username plus the dashboard password when the browser asks for HTTP Basic Authentication.

## What is counted

- **Daily participants** means distinct anonymous browser IDs that completed that language's quiz on that Dublin calendar date.
- A browser is counted at most once per language per day, even if the final answer is submitted repeatedly.
- The cookie is random, HttpOnly, Secure, and retained for one year. No name, email address, or IP address is stored by this feature.
- This is an estimate of people, not a perfect count of individuals: clearing cookies or switching browsers/devices can count the same person again, and people who do not finish are not counted.
- The dashboard displays daily counts by language for the last 30 days.

The analytics page is protected by the `ANALYTICS_PASSWORD` secret. If it is unset, the page returns a configuration message rather than showing statistics.
