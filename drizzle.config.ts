import { type Config } from "drizzle-kit"

import { env } from "./src/env"

// import { databasePrefix } from "@/lib/constants"

export default {
  schema: "./src/db/schema.ts",
  dialect: "postgresql",
  out: "./drizzle",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
} satisfies Config
