import { drizzle } from "drizzle-orm/d1";
import { schema } from "./schema";

export function getDb(database: D1Database) {
  return drizzle(database, { schema });
}
