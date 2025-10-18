import { config as dotenvConfig } from "dotenv";

dotenvConfig();

export const config = {
  database: {
    url: process.env.DATABASE_URL || "file:./dev.db",
  },
  api: {
    keys: process.env.API_KEYS?.split(",").map((key) => key.trim()) || [
      "test-key-123",
    ],
  },
  server: {
    port: parseInt(process.env.PORT || "3000", 10),
    host: process.env.HOST || "0.0.0.0",
    nodeEnv: process.env.NODE_ENV || "development",
  },
  https: {
    enabled: process.env.HTTPS_ENABLED === "true",
    certPath: process.env.SSL_CERT_PATH || "./certs/cert.pem",
    keyPath: process.env.SSL_KEY_PATH || "./certs/key.pem",
  },
} as const;
