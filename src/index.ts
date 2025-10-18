import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import { readFileSync } from "fs";
import { join } from "path";
import { config } from "./config";
import prismaPlugin from "./plugins/prisma";
import rateLimitPlugin from "./plugins/rateLimit";
import loadsRoutes from "./modules/loads/loads.routes";
import healthRoutes from "./modules/health/health.routes";
import {
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from "fastify-type-provider-zod";

const buildServer = async () => {
  const fastify = Fastify({
    logger: {
      level: config.server.nodeEnv === "production" ? "info" : "debug",
      transport:
        config.server.nodeEnv === "development"
          ? {
              target: "pino-pretty",
              options: {
                colorize: true,
                translateTime: "HH:MM:ss Z",
                ignore: "pid,hostname",
              },
            }
          : undefined,
      redact: {
        paths: ["req.headers.x-api-key", "req.headers.authorization"],
        censor: "[REDACTED]",
      },
    },
  });

  // Configure Zod type provider
  fastify.setValidatorCompiler(validatorCompiler);
  fastify.setSerializerCompiler(serializerCompiler);
  fastify.withTypeProvider<ZodTypeProvider>();

  // Register plugins
  await fastify.register(helmet, {
    contentSecurityPolicy: false,
  });

  await fastify.register(cors, {
    origin: true,
    credentials: true,
  });

  await fastify.register(prismaPlugin);
  await fastify.register(rateLimitPlugin);

  // Register routes
  await fastify.register(healthRoutes, { prefix: "/api/v1" });
  await fastify.register(loadsRoutes, { prefix: "/api/v1/loads" });

  // Global error handler
  fastify.setErrorHandler((error, request, reply) => {
    fastify.log.error(error);

    if (error.validation) {
      return reply.status(400).send({
        error: "Bad Request",
        message: "Validation error",
        details: error.validation,
        statusCode: 400,
      });
    }

    return reply.status(500).send({
      error: "Internal Server Error",
      message: "An unexpected error occurred",
      statusCode: 500,
    });
  });

  // 404 handler
  fastify.setNotFoundHandler((request, reply) => {
    return reply.status(404).send({
      error: "Not Found",
      message: `Route ${request.method}:${request.url} not found`,
      statusCode: 404,
    });
  });

  return fastify;
};

const start = async () => {
  try {
    const server = await buildServer();

    // Configure HTTPS for local development
    let serverOptions = {};
    if (config.https.enabled && config.server.nodeEnv === "development") {
      try {
        const certPath = join(process.cwd(), config.https.certPath);
        const keyPath = join(process.cwd(), config.https.keyPath);

        serverOptions = {
          https: {
            key: readFileSync(keyPath),
            cert: readFileSync(certPath),
          },
        };

        server.log.info("HTTPS enabled for local development");
      } catch (error) {
        server.log.warn("HTTPS certificates not found, falling back to HTTP");
        server.log.warn("Run: npm run gen-certs to generate certificates");
      }
    }

    await server.listen({
      port: config.server.port,
      host: config.server.host,
      ...serverOptions,
    });

    const protocol =
      config.https.enabled && config.server.nodeEnv === "development"
        ? "https"
        : "http";
    const url = `${protocol}://${config.server.host}:${config.server.port}`;

    server.log.info(`Server listening at ${url}`);
    server.log.info(`Health check: ${url}/api/v1/healthz`);
    server.log.info(`API docs: ${url}/api/v1/loads`);
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on("SIGINT", async () => {
  console.log("\nReceived SIGINT, shutting down gracefully...");
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("\nReceived SIGTERM, shutting down gracefully...");
  process.exit(0);
});

if (require.main === module) {
  start();
}

export { buildServer };
