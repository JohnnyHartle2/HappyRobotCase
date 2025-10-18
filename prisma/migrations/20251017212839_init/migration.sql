-- CreateTable
CREATE TABLE "loads" (
    "load_id" TEXT NOT NULL PRIMARY KEY,
    "origin" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "pickup_datetime" DATETIME NOT NULL,
    "delivery_datetime" DATETIME NOT NULL,
    "equipment_type" TEXT NOT NULL,
    "loadboard_rate" DECIMAL NOT NULL,
    "notes" TEXT,
    "weight" INTEGER,
    "commodity_type" TEXT NOT NULL,
    "num_of_pieces" INTEGER NOT NULL,
    "miles" INTEGER NOT NULL,
    "dimensions" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
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
