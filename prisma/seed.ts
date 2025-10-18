import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const sampleLoads = [
  {
    load_id: "load_001",
    origin: "Los Angeles, CA",
    destination: "Phoenix, AZ",
    pickup_datetime: new Date("2024-01-15T08:00:00Z"),
    delivery_datetime: new Date("2024-01-15T18:00:00Z"),
    equipment_type: "Dry Van",
    loadboard_rate: 850.0,
    notes: "Expedited delivery required. Fragile cargo.",
    weight: 25000,
    commodity_type: "Electronics",
    num_of_pieces: 150,
    miles: 370,
    dimensions: "53ft x 8ft x 8.5ft",
  },
  {
    load_id: "load_002",
    origin: "Chicago, IL",
    destination: "Detroit, MI",
    pickup_datetime: new Date("2024-01-16T06:00:00Z"),
    delivery_datetime: new Date("2024-01-16T14:00:00Z"),
    equipment_type: "Flatbed",
    loadboard_rate: 1200.0,
    notes: "Heavy machinery transport. Requires special permits.",
    weight: 45000,
    commodity_type: "Machinery",
    num_of_pieces: 1,
    miles: 280,
    dimensions: "48ft x 8ft x 12ft",
  },
  {
    load_id: "load_003",
    origin: "Dallas, TX",
    destination: "Atlanta, GA",
    pickup_datetime: new Date("2024-01-17T10:00:00Z"),
    delivery_datetime: new Date("2024-01-18T08:00:00Z"),
    equipment_type: "Refrigerated",
    loadboard_rate: 1650.0,
    notes: "Temperature controlled. Food grade only.",
    weight: 32000,
    commodity_type: "Food Products",
    num_of_pieces: 200,
    miles: 875,
    dimensions: "53ft x 8ft x 8.5ft",
  },
  {
    load_id: "load_004",
    origin: "Denver, CO",
    destination: "Salt Lake City, UT",
    pickup_datetime: new Date("2024-01-18T12:00:00Z"),
    delivery_datetime: new Date("2024-01-18T20:00:00Z"),
    equipment_type: "Dry Van",
    loadboard_rate: 750.0,
    notes: "Standard freight. No special requirements.",
    weight: 18000,
    commodity_type: "General Merchandise",
    num_of_pieces: 75,
    miles: 520,
    dimensions: "53ft x 8ft x 8.5ft",
  },
  {
    load_id: "load_005",
    origin: "Miami, FL",
    destination: "Orlando, FL",
    pickup_datetime: new Date("2024-01-19T09:00:00Z"),
    delivery_datetime: new Date("2024-01-19T15:00:00Z"),
    equipment_type: "Box Truck",
    loadboard_rate: 450.0,
    notes: "Local delivery. Same day service.",
    weight: 8000,
    commodity_type: "Retail Goods",
    num_of_pieces: 50,
    miles: 235,
    dimensions: "26ft x 8ft x 8ft",
  },
  {
    load_id: "load_006",
    origin: "Seattle, WA",
    destination: "Portland, OR",
    pickup_datetime: new Date("2024-01-20T07:00:00Z"),
    delivery_datetime: new Date("2024-01-20T12:00:00Z"),
    equipment_type: "Dry Van",
    loadboard_rate: 600.0,
    notes: "Express delivery. Time sensitive.",
    weight: 15000,
    commodity_type: "Automotive Parts",
    num_of_pieces: 100,
    miles: 175,
    dimensions: "53ft x 8ft x 8.5ft",
  },
  {
    load_id: "load_007",
    origin: "Houston, TX",
    destination: "New Orleans, LA",
    pickup_datetime: new Date("2024-01-21T14:00:00Z"),
    delivery_datetime: new Date("2024-01-22T06:00:00Z"),
    equipment_type: "Tanker",
    loadboard_rate: 950.0,
    notes: "Hazardous materials. Requires hazmat certification.",
    weight: 40000,
    commodity_type: "Chemicals",
    num_of_pieces: 1,
    miles: 350,
    dimensions: "53ft x 8ft x 8.5ft",
  },
  {
    load_id: "load_008",
    origin: "Boston, MA",
    destination: "New York, NY",
    pickup_datetime: new Date("2024-01-22T11:00:00Z"),
    delivery_datetime: new Date("2024-01-22T18:00:00Z"),
    equipment_type: "Dry Van",
    loadboard_rate: 700.0,
    notes: "Urban delivery. Requires city permits.",
    weight: 22000,
    commodity_type: "Furniture",
    num_of_pieces: 25,
    miles: 215,
    dimensions: "53ft x 8ft x 8.5ft",
  },
];

async function main() {
  console.log("Starting seed...");

  // Insert sample loads with idempotent seeding
  const result = await prisma.load.createMany({
    data: sampleLoads,
    skipDuplicates: true,
  });

  console.log(
    `Seeded ${result.count} loads (${sampleLoads.length} total available)`
  );
  console.log("Seed completed!");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
