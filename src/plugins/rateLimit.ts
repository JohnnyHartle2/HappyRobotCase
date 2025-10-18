import { FastifyPluginAsync } from "fastify";
import rateLimit from "@fastify/rate-limit";

const rateLimitPlugin: FastifyPluginAsync = async (fastify) => {
  await fastify.register(rateLimit, {
    max: 60, // 60 requests
    timeWindow: "1 minute", // per minute
    keyGenerator: (request) => {
      // Rate limit by API key if present, otherwise by IP
      return (request.headers["x-api-key"] as string) || request.ip;
    },
    errorResponseBuilder: (request, context) => {
      return {
        error: "Too Many Requests",
        message: `Rate limit exceeded, retry in ${Math.round(
          context.after / 1000
        )} seconds`,
        statusCode: 429,
      };
    },
  });
};

export default rateLimitPlugin;
