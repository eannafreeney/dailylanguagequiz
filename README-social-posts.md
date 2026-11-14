# Daily social carousels

The Worker queues one seven-slide Instagram carousel per configured language: a branded cover, five question slides, and a final call-to-action. Each slide is generated on demand as a 1080 × 1350 PNG from the same daily question set used by the quiz.

## Cloudflare Worker settings

Add these when you're ready to connect Buffer:

- `SOCIAL_BUFFER_API_KEY` — secret containing your Buffer API key.
- `SOCIAL_BUFFER_CHANNELS` — JSON object mapping language codes to Buffer channel IDs, for example:
  ```json
  {"ga":"BUFFER_IRISH_CHANNEL_ID","de":"BUFFER_GERMAN_CHANNEL_ID","zh":"BUFFER_CHINESE_CHANNEL_ID"}
  ```

No manual image URL or storage bucket is needed. Public, date-specific PNG URLs are served at `/social-media/{language}/{date}/{slide}.png` and remain available for Buffer to fetch when the post publishes.

## Design and content

- Slide 1: branded language cover and swipe prompt.
- Slides 2–6: one of the actual five daily questions per slide, including all answer options.
- Slide 7: call to action linking to that language's quiz.
- Correct answers and explanations are never included.
- The SVG template is rendered to PNG in the Cloudflare Worker.
- Question selection, image generation, and publishing are separate modules, so Buffer can be replaced later.

## Schedule and duplicate protection

The existing hourly cron runs the social task at 08:00 Europe/Dublin. It uses `getDailyQuestions` to select the same five questions as the live quiz. The `social_post_log` D1 table prevents a language/date being queued more than once. Failed submissions release their claim so a later hourly invocation can retry.

## Before enabling

1. Connect the Instagram accounts you want to publish to.
2. Add the Buffer API key and language-to-channel JSON map to Cloudflare.
3. Apply `migrations/0003_social_posts.sql` before deploying.
4. Deploy and check Worker logs for `[daily-social]` messages.

Social posting stays inactive until both Buffer settings are configured. Email reminders are unchanged.
