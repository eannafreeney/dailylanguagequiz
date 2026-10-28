import { drizzle } from "drizzle-orm/d1";
import { schema } from "./schema";

export type D1Statement = {
  bind(...values: unknown[]): D1Statement;
  first<T = Record<string, unknown>>(): Promise<T | null>;
  run(): Promise<unknown>;
  all<T = Record<string, unknown>>(): Promise<{ results: T[] }>;
};

export type D1Binding = {
  prepare(sql: string): D1Statement;
  batch?(statements: D1Statement[]): Promise<unknown[]>;
  exec?(sql: string): Promise<unknown>;
};

export function getDb(database: D1Binding) {
  // Cloudflare supplies the concrete D1Database at runtime; keep the adapter
  // boundary narrow so this project doesn't need a separate ambient type package.
  return drizzle(database as never, { schema });
}
