import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const laPhoenixLoads = [
  {
    load_id: "la_phx_001",
    origin: "Los Angeles, CA",
    destination: "Phoenix, AZ",
    pickup_datetime: new Date("2024-01-15T06:00:00Z"),
    delivery_datetime: new Date("2024-01-15T14:00:00Z"),
    equipment_type: "Dry Van",
    loadboard_rate: 850.0,
    notes: "Early morning pickup. Standard freight.",
    weight: 28000,
    commodity_type: "Electronics",
    num_of_pieces: 180,
    miles: 370,
    dimensions: "53ft x 8ft x 8.5ft",
  },
  {
    load_id: "la_phx_002",
    origin: "Los Angeles, CA",
    destination: "Phoenix, AZ",
    pickup_datetime: new Date("2024-01-16T10:00:00Z"),
    delivery_datetime: new Date("2024-01-16T18:00:00Z"),
    equipment_type: "Refrigerated",
    loadboard_rate: 1250.0,
    notes: "Temperature controlled at 38°F. Food grade trailer required.",
    weight: 35000,
    commodity_type: "Fresh Produce",
    num_of_pieces: 250,
    miles: 370,
    dimensions: "53ft x 8ft x 8.5ft",
  },
  {
    load_id: "la_phx_003",
    origin: "Los Angeles, CA",
    destination: "Phoenix, AZ",
    pickup_datetime: new Date("2024-01-17T08:00:00Z"),
    delivery_datetime: new Date("2024-01-17T16:00:00Z"),
    equipment_type: "Flatbed",
    loadboard_rate: 1100.0,
    notes: "Construction materials. Requires tarps and straps.",
    weight: 42000,
    commodity_type: "Building Materials",
    num_of_pieces: 15,
    miles: 370,
    dimensions: "48ft x 8ft x 5ft",
  },
  {
    load_id: "la_phx_004",
    origin: "Los Angeles, CA",
    destination: "Phoenix, AZ",
    pickup_datetime: new Date("2024-01-18T14:00:00Z"),
    delivery_datetime: new Date("2024-01-18T22:00:00Z"),
    equipment_type: "Dry Van",
    loadboard_rate: 750.0,
    notes: "Afternoon pickup. Residential furniture delivery.",
    weight: 18000,
    commodity_type: "Furniture",
    num_of_pieces: 45,
    miles: 370,
    dimensions: "53ft x 8ft x 8.5ft",
  },
  {
    load_id: "la_phx_005",
    origin: "Los Angeles, CA",
    destination: "Phoenix, AZ",
    pickup_datetime: new Date("2024-01-19T05:00:00Z"),
    delivery_datetime: new Date("2024-01-19T13:00:00Z"),
    equipment_type: "Box Truck",
    loadboard_rate: 600.0,
    notes: "Small load. Local delivery. LTL shipment.",
    weight: 9000,
    commodity_type: "Retail Goods",
    num_of_pieces: 60,
    miles: 370,
    dimensions: "26ft x 8ft x 8ft",
  },
  {
    load_id: "la_phx_006",
    origin: "Los Angeles, CA",
    destination: "Phoenix, AZ",
    pickup_datetime: new Date("2024-01-20T09:00:00Z"),
    delivery_datetime: new Date("2024-01-20T17:00:00Z"),
    equipment_type: "Dry Van",
    loadboard_rate: 900.0,
    notes: "Pharmaceutical products. Climate controlled recommended.",
    weight: 22000,
    commodity_type: "Pharmaceuticals",
    num_of_pieces: 120,
    miles: 370,
    dimensions: "53ft x 8ft x 8.5ft",
  },
  {
    load_id: "la_phx_007",
    origin: "Los Angeles, CA",
    destination: "Phoenix, AZ",
    pickup_datetime: new Date("2024-01-21T12:00:00Z"),
    delivery_datetime: new Date("2024-01-21T20:00:00Z"),
    equipment_type: "Flatbed",
    loadboard_rate: 1350.0,
    notes: "Heavy machinery. Requires specialized equipment and permits.",
    weight: 48000,
    commodity_type: "Industrial Equipment",
    num_of_pieces: 3,
    miles: 370,
    dimensions: "48ft x 8ft x 10ft",
  },
  {
    load_id: "la_phx_008",
    origin: "Los Angeles, CA",
    destination: "Phoenix, AZ",
    pickup_datetime: new Date("2024-01-22T07:00:00Z"),
    delivery_datetime: new Date("2024-01-22T15:00:00Z"),
    equipment_type: "Dry Van",
    loadboard_rate: 825.0,
    notes: "Automotive parts. Time-sensitive delivery.",
    weight: 26000,
    commodity_type: "Automotive Parts",
    num_of_pieces: 200,
    miles: 370,
    dimensions: "53ft x 8ft x 8.5ft",
  },
  {
    load_id: "la_phx_009",
    origin: "Los Angeles, CA",
    destination: "Phoenix, AZ",
    pickup_datetime: new Date("2024-01-23T11:00:00Z"),
    delivery_datetime: new Date("2024-01-23T19:00:00Z"),
    equipment_type: "Refrigerated",
    loadboard_rate: 1400.0,
    notes: "Frozen foods. Must maintain -10°F. Reefer unit required.",
    weight: 38000,
    commodity_type: "Frozen Food",
    num_of_pieces: 300,
    miles: 370,
    dimensions: "53ft x 8ft x 8.5ft",
  },
  {
    load_id: "la_phx_010",
    origin: "Los Angeles, CA",
    destination: "Phoenix, AZ",
    pickup_datetime: new Date("2024-01-24T13:00:00Z"),
    delivery_datetime: new Date("2024-01-24T21:00:00Z"),
    equipment_type: "Dry Van",
    loadboard_rate: 775.0,
    notes: "Apparel and textiles. Standard dry van.",
    weight: 16000,
    commodity_type: "Apparel",
    num_of_pieces: 85,
    miles: 370,
    dimensions: "53ft x 8ft x 8.5ft",
  },
];

async function main() {
  console.log("Starting LA to Phoenix seed...");

  // Insert loads with idempotent seeding
  const result = await prisma.load.createMany({
    data: laPhoenixLoads,
    skipDuplicates: true,
  });

  console.log(
    `Seeded ${result.count} LA to Phoenix loads (${laPhoenixLoads.length} total available)`
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
