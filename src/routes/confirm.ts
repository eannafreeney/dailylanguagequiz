import { Context } from "hono";
import { getEnv } from "../lib/email";
import { getDb } from "../lib/db";
import { subscribers } from "../lib/schema";
import { and, eq } from "drizzle-orm";

export async function confirmHandler(c: Context) {
  const token = c.req.query("token");
  if (!token || token.length > 100) {
    return c.text("This confirmation link is invalid or expired.", 400);
  }

  const env = getEnv(c);
  const [subscriber] = await getDb(env.DB).select({ siteUrl: subscribers.siteUrl })
    .from(subscribers).where(and(
      eq(subscribers.token, token),
      eq(subscribers.unsubscribed, false),
    )).limit(1);

  if (!subscriber) {
    return c.text("This confirmation link is invalid or expired.", 400);
  }

  await getDb(env.DB).update(subscribers).set({ confirmed: true })
    .where(eq(subscribers.token, token));

  return c.redirect(new URL("/?subscribed=1", subscriber.siteUrl).toString());
}
