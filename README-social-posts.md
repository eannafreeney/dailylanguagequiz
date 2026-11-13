# Daily social posts (Buffer)

The Worker can queue one daily quiz post per configured language channel. Social publishing is deliberately disabled until the Buffer settings below are added.

## Cloudflare Worker secrets and variables

Add these in the Cloudflare Worker settings (or with Wrangler):

- `SOCIAL_BUFFER_API_KEY` — secret containing your Buffer API key.
- `SOCIAL_BUFFER_CHANNELS` — JSON object mapping quiz language codes to Buffer channel IDs, for example:
  ```json
  {"ga":"BUFFER_IRISH_CHANNEL_ID","de":"BUFFER_GERMAN_CHANNEL_ID","zh":"BUFFER_CHINESE_CHANNEL_ID"}
  ```
- `SOCIAL_IMAGE_URL` — a publicly accessible, stable HTTPS URL to a JPEG or PNG image. Buffer fetches the media from this URL when it creates the post. The same image is currently attached to each language's post; captions are localized and use that day's real first quiz question.

Only include languages whose Instagram channels are connected in Buffer. Other languages are skipped. Do not commit API keys or real channel IDs to the repository.

## Schedule and duplicate protection

The existing hourly Cloudflare cron invokes the social task, which only runs at 08:00 Europe/Dublin. For each configured language it calls the same `getDailyQuestions` function as the quiz, uses the first question, and adds a post to that Buffer channel's queue. It includes the question, answer options, CEFR level (when present), and quiz URL; it does not mark or disclose the correct answer.

The `social_post_log` D1 table prevents the same language/date from being queued more than once. A failed Buffer request releases its claim so a later hourly invocation can retry.

Buffer currently uses its GraphQL API at `https://api.buffer.com`. Posts are added to each channel's queue; the actual publishing time is controlled by that channel's Buffer queue schedule.

## Before enabling

1. Connect each Instagram account as a separate channel in Buffer.
2. Add the three settings above to the Cloudflare Worker.
3. Confirm the image URL is publicly fetchable and points to a valid JPEG or PNG.
4. Apply the new D1 migration (`0003_social_posts.sql`) before deploying the Worker code.
5. Deploy and check Worker logs for `[daily-social]` messages.

Until all three settings are present, the social task logs that it is not configured and exits without affecting email reminders.
