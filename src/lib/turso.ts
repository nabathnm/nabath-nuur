import { createClient } from "@libsql/client";

export const turso = createClient({
  url: import.meta.env.VITE_PORTOFOLIO_TURSO_DATABASE_URL,
  authToken: import.meta.env.VITE_PORTOFOLIO_TURSO_AUTH_TOKEN,
});