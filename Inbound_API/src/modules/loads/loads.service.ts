import { PrismaClient } from "@prisma/client";
import { Load, LoadUpdate, LoadQuery, LoadResponse } from "./loads.schemas";

// Helper to convert Prisma Decimal to number
function convertDecimalToNumber(decimal: any): number {
  return typeof decimal === "number" ? decimal : parseFloat(decimal.toString());
}

// Mapper to normalize DB rows to API response format
export function mapLoadToResponse(row: any) {
  return {
    load_id: row.load_id,
    origin: row.origin,
    destination: row.destination,
    pickup_datetime: new Date(row.pickup_datetime).toISOString(),
    delivery_datetime: new Date(row.delivery_datetime).toISOString(),
    equipment_type: row.equipment_type,
    loadboard_rate: Number(row.loadboard_rate),
    notes: row.notes ?? null,
    weight: row.weight ?? null,
    commodity_type: row.commodity_type,
    num_of_pieces: row.num_of_pieces,
    miles: row.miles,
    dimensions: row.dimensions,
  };
}

export function createLoadsService(prisma: PrismaClient) {
  return {
    async findAll(query: LoadQuery): Promise<LoadResponse> {
      const {
        origin,
        destination,
        pickup_datetime_from,
        pickup_datetime_to,
        equipment_type,
        min_loadboard_rate,
        max_loadboard_rate,
        max_miles,
        q,
        page,
        page_size,
        sort_by,
        sort_dir,
      } = query;

      // Validate pagination
      const pageSize = Math.min(Math.max(page_size, 1), 100);
      const pageNum = Math.max(page, 1);
      const skip = (pageNum - 1) * pageSize;

      // Build where clause
      const where: any = {};

      if (origin) {
        where.origin = {
          contains: origin,
        };
      }

      if (destination) {
        where.destination = {
          contains: destination,
        };
      }

      if (pickup_datetime_from || pickup_datetime_to) {
        where.pickup_datetime = {};
        if (pickup_datetime_from) {
          where.pickup_datetime.gte = new Date(pickup_datetime_from);
        }
        if (pickup_datetime_to) {
          where.pickup_datetime.lte = new Date(pickup_datetime_to);
        }
      }

      if (equipment_type) {
        where.equipment_type = {
          contains: equipment_type,
        };
      }

      if (
        min_loadboard_rate !== undefined ||
        max_loadboard_rate !== undefined
      ) {
        where.loadboard_rate = {};
        if (min_loadboard_rate !== undefined) {
          where.loadboard_rate.gte = min_loadboard_rate;
        }
        if (max_loadboard_rate !== undefined) {
          where.loadboard_rate.lte = max_loadboard_rate;
        }
      }

      if (max_miles !== undefined) {
        where.miles = {
          lte: max_miles,
        };
      }

      if (q) {
        where.OR = [
          {
            notes: {
              contains: q,
            },
          },
          {
            commodity_type: {
              contains: q,
            },
          },
        ];
      }

      // Build orderBy clause
      const orderBy: any = {};
      orderBy[sort_by] = sort_dir;

      // Execute queries
      const [loads, total] = await Promise.all([
        prisma.load.findMany({
          where,
          orderBy,
          skip,
          take: pageSize,
        }),
        prisma.load.count({ where }),
      ]);

      // Convert Prisma results to API response format
      const convertedLoads = loads.map(mapLoadToResponse);

      return {
        data: convertedLoads,
        page: pageNum,
        page_size: pageSize,
        total,
      };
    },

    async findById(load_id: string) {
      const load = await prisma.load.findUnique({
        where: { load_id },
      });

      if (!load) return null;

      return mapLoadToResponse(load);
    },

    async create(data: Omit<Load, "load_id">) {
      const load = await prisma.load.create({
        data: {
          ...data,
          pickup_datetime: new Date(data.pickup_datetime),
          delivery_datetime: new Date(data.delivery_datetime),
        },
      });

      return mapLoadToResponse(load);
    },

    async update(load_id: string, data: LoadUpdate) {
      const updateData: any = { ...data };

      if (data.pickup_datetime) {
        updateData.pickup_datetime = new Date(data.pickup_datetime);
      }
      if (data.delivery_datetime) {
        updateData.delivery_datetime = new Date(data.delivery_datetime);
      }

      const load = await prisma.load.update({
        where: { load_id },
        data: updateData,
      });

      return mapLoadToResponse(load);
    },

    async delete(load_id: string): Promise<boolean> {
      try {
        await prisma.load.delete({
          where: { load_id },
        });
        return true;
      } catch (error) {
        return false;
      }
    },
  };
}
