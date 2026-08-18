import {
  getStockMovements,
} from "@/app/actions/stock-movement";

import {
  getProducts,
} from "@/app/actions/product";

import {
  getWarehouses,
} from "@/app/actions/warehouse";

import {
  StockMovementPage,
} from "@/components/stock-movements/stock-movement-page";

export default async function StockMovementsDashboardPage() {
  const [
    movements,
    products,
    warehouses,
  ] = await Promise.all([
    getStockMovements(),
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
   */
  const serializedMovements =
    movements.map((movement) => ({
      ...movement,

      quantity: Number(
        movement.quantity
      ),
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
    <StockMovementPage
      movements={serializedMovements}
      products={serializedProducts}
      warehouses={serializedWarehouses}
    />
  );
}