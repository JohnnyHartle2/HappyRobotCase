import { FastifyRequest, FastifyReply } from "fastify";
import { config } from "../config";

export const apiKeyAuth = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const apiKey = request.headers["x-api-key"] as string;

  if (!apiKey) {
    return reply.status(401).send({
      error: "Unauthorized",
      message: "API key is required",
      statusCode: 401,
    });
  }

  if (!config.api.keys.includes(apiKey)) {
    return reply.status(403).send({
      error: "Forbidden",
      message: "Invalid API key",
      statusCode: 403,
    });
  }
};
