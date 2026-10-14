import { Context } from "hono";
import { getEnv } from "../lib/email";

export async function unsubscribeHandler(c: Context) {
  const token = c.req.query("token");
  if (!token || token.length > 100) {
    return c.text("This unsubscribe link is invalid.", 400);
  }

  const env = getEnv(c);
  const subscriber = await env.DB.prepare(
    "SELECT site_url FROM subscribers WHERE token = ?",
  ).bind(token).first<{ site_url: string }>();

  if (!subscriber) {
    return c.text("This unsubscribe link is invalid.", 400);
  }

  await env.DB.prepare("UPDATE subscribers SET unsubscribed = 1 WHERE token = ?")
    .bind(token)
    .run();

  return c.html(`<!doctype html><html lang="en"><meta charset="utf-8"><title>Unsubscribed</title><body style="font-family:system-ui;max-width:40rem;margin:4rem auto;padding:1rem"><h1>You're unsubscribed</h1><p>You won't receive any more daily quiz emails.</p><a href="${subscriber.site_url}">Return to the quiz</a></body></html>`);
}
