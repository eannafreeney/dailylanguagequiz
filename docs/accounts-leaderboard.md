# Accounts, streaks, and leaderboard implementation

This feature is designed for the existing Cloudflare Workers + Hono app and its existing D1 binding (DB). Guests can continue taking quizzes without creating an account.

## Decisions

- **Authentication:** Supabase Auth email magic links. Never store passwords in D1.
- **Quiz and account data:** existing Cloudflare D1 database.
- **Date boundary:** use the `Europe/Dublin` local date, including across daylight-saving changes.
- **Guest experience:** guests can complete quizzes as before. Only a verified signed-in user gets account records.
- **Answer integrity:** the Worker validates each answer against the server-side question bank. The browser never submits a score.
- **Leaderboard:** one all-time leaderboard per language, ranked by distinct correctly answered questions. A question earns credit once per user/date/language. Equal scores share the same rank; completion time is not a tie-breaker.
- **Streaks:** one streak per language. A day counts when the user completes that language's daily quiz; derive consecutive dates from completion rows.
- **Privacy:** public leaderboard responses contain display names and aggregate scores only, never email addresses or auth tokens.

## D1 migration

`20261028000000_accounts_leaderboard.sql` creates profiles, daily completions, and unique correct-answer records. It has not been applied to production.

## Required Worker configuration

Set these as Cloudflare Worker secrets/variables (do not commit real values):

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY` (publishable/anon key; never a service-role key)

The Worker validates a bearer token with Supabase Auth's `/auth/v1/user` endpoint before reading or writing private account data. Missing auth configuration must fail closed for account routes.

## Implementation and release

1. Configure Supabase Auth email sign-in and allowed redirect URLs.
2. Add optional sign-in UI without interrupting guest quizzes.
3. Record verified correct answers and quiz completion server-side.
4. Add profile, per-language streak, and public leaderboard UI.
5. Test guest access, invalid sessions, duplicate submissions, and Dublin date boundaries.
6. Apply the migration to a staging D1 database, test, then decide whether to migrate production and deploy.

No production migration or deployment is performed by work on this branch.
