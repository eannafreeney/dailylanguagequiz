# Daily email reminders

The daily quiz signup uses Cloudflare D1 for subscriber records and Resend for email delivery. An hourly Worker Cron checks the current time in `Europe/Dublin`, sending at 08:00 Irish local time across daylight-saving changes.

## Cloudflare setup

1. Create the D1 database: `npx wrangler d1 create mydaily-quiz-subscribers`.
2. Copy the returned database ID into `wrangler.jsonc`, replacing `REPLACE_WITH_D1_DATABASE_ID`.
3. Apply the migration: `npx wrangler d1 migrations apply mydaily-quiz-subscribers --remote`.
4. Add Worker secrets with `npx wrangler secret put RESEND_API_KEY` and `npx wrangler secret put EMAIL_FROM`. Set `EMAIL_FROM` to a sender verified in Resend, such as `Daily Quiz <quiz@your-verified-domain.example>`.
5. Deploy the Worker.

For local development, apply the migration with `--local` and use an uncommitted `.dev.vars` file for local variables. Never commit API keys.

## Subscriber flow

- The quiz homepage collects an email and language.
- A confirmation email is sent; only confirmed subscribers receive reminders.
- Daily messages link to the quiz and include an unsubscribe link.
- Visiting `/unsubscribe?token=...` immediately unsubscribes the address.

## Important deployment note

The D1 database ID must be filled in before deployment. Ensure the sender domain is verified in Resend and the Worker secrets are configured before testing signup or scheduled delivery.
