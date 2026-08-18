import {
  getInventory,
} from "@/app/actions/inventory";

import {
  getProducts,
} from "@/app/actions/product";

import {
  getWarehouses,
} from "@/app/actions/warehouse";

import {
  InventoryPage,
} from "@/components/inventory/inventory-page";

export default async function InventoryDashboardPage() {
  const [
    inventories,
    products,
    warehouses,
  ] = await Promise.all([
    getInventory(),
    getProducts(),
    getWarehouses(),
  ]);

  /**
   * Prisma Decimal tidak dapat langsung
   * dikirim dari Server Component ke
   * Client Component.
   *
   * Karena itu quantity dikonversi
   * menjadi number.
   *
   * Relasi product dan warehouse juga
   * diserialisasi secara eksplisit agar
   * struktur data sesuai dengan type
   * Inventory pada Client Component.
   */
  const serializedInventories =
    inventories.map((inventory) => ({
      id: inventory.id,
      organizationId:
        inventory.organizationId,
      productId:
        inventory.productId,
      warehouseId:
        inventory.warehouseId,

      quantity: Number(
        inventory.quantity
      ),

      createdAt:
        inventory.createdAt,
      updatedAt:
        inventory.updatedAt,

      product: {
        id: inventory.product.id,
        code: inventory.product.code,
        name: inventory.product.name,
        unit: inventory.product.unit,
        status: inventory.product.status,
      },

      warehouse: {
        id: inventory.warehouse.id,
        code: inventory.warehouse.code,
        name: inventory.warehouse.name,
        status: inventory.warehouse.status,
      },
    }));

  const serializedProducts =
    products.map((product) => ({
      id: product.id,
      code: product.code,
      name: product.name,
      unit: product.unit,
      status: product.status,
    }));

  const serializedWarehouses =
    warehouses.map((warehouse) => ({
      id: warehouse.id,
      code: warehouse.code,
      name: warehouse.name,
      status: warehouse.status,
    }));

  return (
    <InventoryPage
      inventories={serializedInventories}
      products={serializedProducts}
      warehouses={serializedWarehouses}
    />
  );
}