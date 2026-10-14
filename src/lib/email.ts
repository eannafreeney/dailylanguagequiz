import { Context } from "hono";

export type Statement = {
  bind(...values: unknown[]): Statement;
  first<T = Record<string, unknown>>(): Promise<T | null>;
  run(): Promise<{ success: boolean; meta?: { changes?: number } }>;
  all<T = Record<string, unknown>>(): Promise<{ results: T[] }>;
};

export type Env = {
  DB: { prepare(sql: string): Statement };
  RESEND_API_KEY: string;
  EMAIL_FROM: string;
};

export const getEnv = (c: Context) =>
  (c as unknown as { env: Env }).env;

export async function sendEmail(
  env: Env,
  to: string,
  subject: string,
  html: string,
) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: env.EMAIL_FROM, to, subject, html }),
  });

  if (!response.ok) {
    console.error("Resend email failed", response.status, await response.text());
    throw new Error("Email delivery failed");
  }
}
