/*
  Warnings:

  - You are about to drop the column `organizationId` on the `PurchaseItem` table. All the data in the column will be lost.
  - You are about to drop the column `supplierId` on the `PurchaseItem` table. All the data in the column will be lost.
  - You are about to drop the column `warehouseId` on the `PurchaseItem` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "PurchaseItem" DROP CONSTRAINT "PurchaseItem_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "PurchaseItem" DROP CONSTRAINT "PurchaseItem_supplierId_fkey";

-- DropForeignKey
ALTER TABLE "PurchaseItem" DROP CONSTRAINT "PurchaseItem_warehouseId_fkey";

-- AlterTable
ALTER TABLE "PurchaseItem" DROP COLUMN "organizationId",
DROP COLUMN "supplierId",
DROP COLUMN "warehouseId";
