import { Context } from "hono";
import { getEnv } from "../lib/email";

export async function confirmHandler(c: Context) {
  const token = c.req.query("token");
  if (!token || token.length > 100) {
    return c.text("This confirmation link is invalid or expired.", 400);
  }

  const env = getEnv(c);
  const subscriber = await env.DB.prepare(
    "SELECT site_url FROM subscribers WHERE token = ? AND unsubscribed = 0",
  ).bind(token).first<{ site_url: string }>();

  if (!subscriber) {
    return c.text("This confirmation link is invalid or expired.", 400);
  }

  await env.DB.prepare("UPDATE subscribers SET confirmed = 1 WHERE token = ?")
    .bind(token)
    .run();

  return c.redirect(new URL("/?subscribed=1", subscriber.site_url).toString());
}
