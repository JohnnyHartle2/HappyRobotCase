import { FastifyPluginAsync } from "fastify";
import { z } from "zod";
import { createLoadsService } from "./loads.service";
import {
  LoadSchema,
  LoadUpdateSchema,
  LoadQuerySchema,
  LoadResponseSchema,
  LoadIdParamsSchema,
  ErrorResponseSchema,
  ErrorSchema,
  LoadModelResponse,
  PaginatedLoadListResponse,
} from "./loads.schemas";
import { apiKeyAuth } from "../../middleware/apiKeyAuth";

const loadsRoutes: FastifyPluginAsync = async (fastify) => {
  const loadsService = createLoadsService(fastify.prisma);

  // Apply API key auth to all routes
  fastify.addHook("preHandler", apiKeyAuth);

  // GET /loads - Search loads
  fastify.get<{
    Querystring: any;
    Reply: any;
  }>(
    "/",
    {
      schema: {
        querystring: LoadQuerySchema,
        response: {
          200: PaginatedLoadListResponse,
        },
      },
    },
    async (request, reply) => {
      try {
        const result = await loadsService.findAll(request.query);
        return reply.send(result);
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({
          error: "Internal Server Error",
          message: "Failed to fetch loads",
          statusCode: 500,
        });
      }
    }
  );

  // GET /loads/:load_id - Get single load
  fastify.get<{
    Params: { load_id: string };
    Reply: any;
  }>(
    "/:load_id",
    {
      schema: {
        params: LoadIdParamsSchema,
        response: {
          200: LoadModelResponse,
          404: ErrorSchema,
        },
      },
    },
    async (request, reply) => {
      try {
        const load = await loadsService.findById(request.params.load_id);

        if (!load) {
          return reply.status(404).send({
            error: {
              code: "NOT_FOUND",
              message: "Load not found",
            },
          });
        }

        return reply.send(load);
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({
          error: "Internal Server Error",
          message: "Failed to fetch load",
          statusCode: 500,
        });
      }
    }
  );

  // POST /loads - Create load
  fastify.post<{
    Body: any;
    Reply: any;
  }>(
    "/",
    {
      schema: {
        body: LoadSchema.omit({ load_id: true }),
        response: {
          201: LoadSchema,
          400: ErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      try {
        const load = await loadsService.create(request.body);
        return reply.status(201).send(load);
      } catch (error) {
        fastify.log.error(error);
        return reply.status(400).send({
          error: "Bad Request",
          message: "Failed to create load",
          statusCode: 400,
        });
      }
    }
  );

  // PUT /loads/:load_id - Update load
  fastify.put<{
    Params: { load_id: string };
    Body: any;
    Reply: any;
  }>(
    "/:load_id",
    {
      schema: {
        params: LoadIdParamsSchema,
        body: LoadUpdateSchema,
        response: {
          200: LoadSchema,
          404: ErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      try {
        const load = await loadsService.update(
          request.params.load_id,
          request.body
        );

        if (!load) {
          return reply.status(404).send({
            error: "Not Found",
            message: "Load not found",
            statusCode: 404,
          });
        }

        return reply.send(load);
      } catch (error) {
        fastify.log.error(error);
        return reply.status(400).send({
          error: "Bad Request",
          message: "Failed to update load",
          statusCode: 400,
        });
      }
    }
  );

  // DELETE /loads/:load_id - Delete load
  fastify.delete<{
    Params: { load_id: string };
    Reply: any;
  }>(
    "/:load_id",
    {
      schema: {
        params: LoadIdParamsSchema,
        response: {
          204: z.null(),
          404: ErrorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      try {
        const deleted = await loadsService.delete(request.params.load_id);

        if (!deleted) {
          return reply.status(404).send({
            error: "Not Found",
            message: "Load not found",
            statusCode: 404,
          });
        }

        return reply.status(204).send();
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({
          error: "Internal Server Error",
          message: "Failed to delete load",
          statusCode: 500,
        });
      }
    }
  );
};

export default loadsRoutes;
