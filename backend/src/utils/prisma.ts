import { PrismaClient } from "@prisma/client";
import * as dotenv from "dotenv";
import path from "path";

// Ensure environment variables are loaded regardless of import order or working directory
dotenv.config({ path: path.join(process.cwd(), ".env") });
dotenv.config({ path: path.join(__dirname, "../../../.env") });
dotenv.config({ path: path.join(__dirname, "../../.env") });
dotenv.config();

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

const dbUrl =
  process.env.DATABASE_URL ||
  "postgresql://postgres:postgres@localhost:5432/xplover";

// Prevent multiple instances in development (hot reload)
const prisma =
  global.__prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: dbUrl,
      },
    },
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  global.__prisma = prisma;
}

export default prisma;
