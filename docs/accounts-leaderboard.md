# Accounts, streaks, and leaderboard implementation

This feature is designed for the existing Cloudflare Workers + Hono app and its existing D1 binding (DB). It keeps quiz questions accessible to guests.

## Design

- **Authentication:** Supabase Auth email magic links. Never store passwords in D1.
- **Quiz and account data:** existing Cloudflare D1 database.
- **Date boundary:** use the same Europe/Dublin local date already used by src/lib/analytics.ts, so existing quiz analytics and account streaks agree.
- **Guest experience:** guests can complete the quiz exactly as they do today. Only a verified signed-in user gets an account completion record.
- **Completion integrity:** only the server records a completion, after the last question has been answered correctly. The server derives the score from the quiz definition; never accept a client-supplied score.
- **Duplicate prevention:** the primary key on account_quiz_completions permits one completion per user, local date, and language. A retry should be treated as an idempotent success.
- **Streak:** derive consecutive dates from distinct local_date values, rather than storing a mutable streak counter that can drift. Decide whether a day counts when the user completes any quiz or only a specific language before implementing the profile UI.
- **Leaderboard:** aggregate scores from account_quiz_completions; expose only display names and aggregate scores, never email addresses or auth tokens.

## D1 migration

20261028000000_accounts_leaderboard.sql creates:

- user_profiles: display name keyed by the verified Supabase user ID.
- account_quiz_completions: one score per user/date/language, with indexes for leaderboard and streak queries.

Apply it to a staging D1 database first, then production, using the migration workflow already configured in wrangler.jsonc.

## Required Worker configuration

Set these as Cloudflare Worker secrets/variables (do not commit real values):

- SUPABASE_URL
- SUPABASE_ANON_KEY (the Supabase publishable/anon key; not a service-role key)

The Worker should validate a bearer token with Supabase Auth's /auth/v1/user endpoint before reading or writing account data. All account routes must fail closed when auth configuration is missing or the token is invalid. The publishable key is not a substitute for validating the user's access token.

## Implementation sequence

1. Configure Supabase Auth email sign-in and the production redirect URL(s).
2. Add a sign-in UI that uses Supabase's browser client; guests should not be redirected away from the quiz.
3. Add a small auth helper to validate bearer tokens in Hono.
4. Record a signed-in user's completion in the existing final-answer path, while preserving anonymous analytics.
5. Add profile and leaderboard endpoints; calculate streaks from distinct Dublin dates.
6. Add profile/streak/leaderboard UI and test the guest path, invalid sessions, duplicate submissions, and timezone boundaries.

This is the database foundation and implementation plan, not the complete end-user feature. No production deployment or D1 migration is performed by this change.
