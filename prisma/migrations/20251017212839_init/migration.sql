-- CreateTable
CREATE TABLE "loads" (
    "load_id" TEXT NOT NULL,
    "origin" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "pickup_datetime" TIMESTAMP(3) NOT NULL,
    "delivery_datetime" TIMESTAMP(3) NOT NULL,
    "equipment_type" TEXT NOT NULL,
    "loadboard_rate" DECIMAL(65,30) NOT NULL,
    "notes" TEXT,
    "weight" INTEGER,
    "commodity_type" TEXT NOT NULL,
    "num_of_pieces" INTEGER NOT NULL,
    "miles" INTEGER NOT NULL,
    "dimensions" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "loads_pkey" PRIMARY KEY ("load_id")
);

-- CreateIndex
CREATE INDEX "loads_origin_destination_pickup_datetime_idx" ON "loads"("origin", "destination", "pickup_datetime");

-- CreateIndex
CREATE INDEX "loads_equipment_type_pickup_datetime_idx" ON "loads"("equipment_type", "pickup_datetime");

-- CreateIndex
CREATE INDEX "loads_pickup_datetime_idx" ON "loads"("pickup_datetime");

-- CreateIndex
CREATE INDEX "loads_delivery_datetime_idx" ON "loads"("delivery_datetime");

-- CreateIndex
CREATE INDEX "loads_weight_idx" ON "loads"("weight");
