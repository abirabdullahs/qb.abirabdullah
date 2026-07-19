import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set. Copy .env.example to .env and fill it in.");
}

// Neon's HTTP driver — best fit for serverless/edge (Vercel functions).
// If you later need transactions with multiple sequential statements
// (e.g. the question creation flow in Q-08), switch to the
// neon-serverless (websocket/pool) driver instead — see:
// https://orm.drizzle.team/docs/get-started-postgresql#neon
const sql = neon(process.env.DATABASE_URL);

export const db = drizzle(sql, { schema });
