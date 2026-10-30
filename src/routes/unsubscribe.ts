import { Context } from "hono";
import { getEnv } from "../lib/email";
import { getDb } from "../lib/db";
import { subscribers } from "../lib/schema";
import { eq } from "drizzle-orm";

export async function unsubscribeHandler(c: Context) {
  const token = c.req.query("token");
  if (!token || token.length > 100) {
    return c.text("This unsubscribe link is invalid.", 400);
  }

  const env = getEnv(c);
  const [subscriber] = await getDb(env.DB).select({ siteUrl: subscribers.siteUrl })
    .from(subscribers).where(eq(subscribers.token, token)).limit(1);

  if (!subscriber) {
    return c.text("This unsubscribe link is invalid.", 400);
  }

  await getDb(env.DB).update(subscribers).set({ unsubscribed: true })
    .where(eq(subscribers.token, token));

  return c.html(`<!doctype html><html lang="en"><meta charset="utf-8"><title>Unsubscribed</title><body style="font-family:system-ui;max-width:40rem;margin:4rem auto;padding:1rem"><h1>You're unsubscribed</h1><p>You won't receive any more daily quiz emails.</p><a href="${subscriber.siteUrl}">Return to the quiz</a></body></html>`);
}
