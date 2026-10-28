import { Context } from "hono";
import { NewsletterForm } from "../components/Newsletter";
import { DOMAIN_TO_LANG, HUB_HOSTS, languages } from "../lib/languages";
import { getEnv, sendEmail } from "../lib/email";
import { isLangCode } from "../utils";
import { getDb } from "../lib/db";
import { subscribers } from "../lib/schema";

export async function subscribeHandler(c: Context) {
  const env = getEnv(c);
  const body = await c.req.parseBody();
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const langCode = typeof body.langCode === "string" ? body.langCode : "";
  const language = languages.find((item) => item.langCode === langCode);
  const origin = new URL(c.req.url).origin;
  const hostname = new URL(c.req.url).hostname;
  const hostLang = DOMAIN_TO_LANG[hostname];
  const isAjax = (c.req.header("X-Alpine-Target") ?? "")
    .split(/\s+/)
    .includes("newsletter-form");

  const onThisQuiz = hostLang === langCode || (HUB_HOSTS.has(hostname) && Boolean(language?.siteUrl));
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !language || !onThisQuiz) {
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
  await getDb(env.DB).insert(subscribers).values({
    email, langCode, token, siteUrl: origin, confirmed: false, unsubscribed: false,
  }).onConflictDoUpdate({
    target: [subscribers.email, subscribers.langCode],
    set: { token, siteUrl: origin, confirmed: false, unsubscribed: false },
  });

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
