import { FastifyPluginAsync } from "fastify";

const healthRoutes: FastifyPluginAsync = async (fastify) => {
  // GET /healthz - Basic health check (no auth)
  fastify.get("/healthz", async (request, reply) => {
    return reply.send({
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });

  // GET /readyz - Readiness check with DB (no auth)
  fastify.get("/readyz", async (request, reply) => {
    try {
      // Test database connection
      await fastify.prisma.$queryRaw`SELECT 1`;

      return reply.send({
        status: "ready",
        timestamp: new Date().toISOString(),
        database: "connected",
      });
    } catch (error) {
      fastify.log.error("Database health check failed:", error as Error);
      return reply.status(503).send({
        status: "not ready",
        timestamp: new Date().toISOString(),
        database: "disconnected",
        error: "Database connection failed",
      });
    }
  });
};

export default healthRoutes;
