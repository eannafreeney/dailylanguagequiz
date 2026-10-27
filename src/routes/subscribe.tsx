import { Context } from "hono";
import { NewsletterForm } from "../components/Newsletter";
import { DOMAIN_TO_LANG, languages } from "../lib/languages";
import { getEnv, sendEmail } from "../lib/email";
import { isLangCode } from "../utils";

export async function subscribeHandler(c: Context) {
  const env = getEnv(c);
  const body = await c.req.parseBody();
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const langCode = typeof body.langCode === "string" ? body.langCode : "";
  const language = languages.find((item) => item.langCode === langCode);
  const origin = new URL(c.req.url).origin;
  const hostLang = DOMAIN_TO_LANG[new URL(c.req.url).hostname];
  const isAjax = (c.req.header("X-Alpine-Target") ?? "")
    .split(/\s+/)
    .includes("newsletter-form");

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !language || hostLang !== langCode) {
    if (isAjax) {
      return c.html(
        <NewsletterForm
          langCode={isLangCode(langCode) ? langCode : (hostLang ?? "")}
          error="Please enter a valid email and try again."
          email={email}
        />,
        400,
      );
    }
    return c.html("<main><h1>Invalid subscription</h1><p>Please return to the quiz and try again.</p><a href=\"/\">Back to quiz</a></main>", 400);
  }

  const token = crypto.randomUUID() + crypto.randomUUID();
  await env.DB.prepare(`INSERT INTO subscribers (email, lang_code, token, site_url, confirmed, unsubscribed, created_at)
    VALUES (?, ?, ?, ?, 0, 0, datetime('now'))
    ON CONFLICT(email, lang_code) DO UPDATE SET token=excluded.token, site_url=excluded.site_url, confirmed=0, unsubscribed=0`)
    .bind(email, langCode, token, origin)
    .run();

  const confirmUrl = new URL("/confirm", origin);
  confirmUrl.searchParams.set("token", token);

  await sendEmail(
    env,
    email,
    `Confirm your daily ${language.englishName} quiz`,
    `<p>Thanks for signing up for the daily ${language.englishName} quiz.</p><p><a href="${confirmUrl}">Confirm my email</a></p><p>If you didn't request this, ignore this email.</p>`,
  );

  if (isAjax) return c.html(<NewsletterForm langCode={langCode} done />);

  return c.html("<!doctype html><html lang=\"en\"><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width\"><title>Check your email</title><body style=\"font-family:system-ui;max-width:40rem;margin:4rem auto;padding:1rem\"><h1>Check your email</h1><p>Please use the confirmation link we sent to start receiving the daily quiz.</p><a href=\"/\">Back to quiz</a></body></html>");
}
