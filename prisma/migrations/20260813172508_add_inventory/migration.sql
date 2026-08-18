-- CreateTable
CREATE TABLE "Inventory" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "warehouseId" TEXT NOT NULL,
    "quantity" DECIMAL(15,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Inventory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Inventory_organizationId_idx" ON "Inventory"("organizationId");

-- CreateIndex
CREATE INDEX "Inventory_organizationId_productId_idx" ON "Inventory"("organizationId", "productId");

-- CreateIndex
CREATE INDEX "Inventory_organizationId_warehouseId_idx" ON "Inventory"("organizationId", "warehouseId");

-- CreateIndex
CREATE UNIQUE INDEX "Inventory_organizationId_productId_warehouseId_key" ON "Inventory"("organizationId", "productId", "warehouseId");

-- AddForeignKey
ALTER TABLE "Inventory" ADD CONSTRAINT "Inventory_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inventory" ADD CONSTRAINT "Inventory_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inventory" ADD CONSTRAINT "Inventory_warehouseId_fkey" FOREIGN KEY ("warehouseId") REFERENCES "Warehouse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
