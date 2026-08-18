import { getPurchases } from "@/app/actions/purchase";
import { getProducts } from "@/app/actions/product";
import { getSuppliers } from "@/app/actions/supplier";
import { getWarehouses } from "@/app/actions/warehouse";

import { PurchasingPage } from "@/components/purchasing/purchasing-page";

export default async function PurchasingDashboardPage() {
  const [purchases, products, suppliers, warehouses] =
    await Promise.all([
      getPurchases(),
      getProducts(),
      getSuppliers(),
      getWarehouses(),
    ]);

  const serializedPurchases = purchases.map((purchase) => ({
    id: purchase.id,
    organizationId: purchase.organizationId,
    supplierId: purchase.supplierId,
    warehouseId: purchase.warehouseId,

    invoiceNumber: purchase.invoiceNumber,
    notes: purchase.notes,
    status: purchase.status,

    // Prisma Decimal → number
    totalAmount: Number(purchase.totalAmount),

    // Pastikan selalu string
    createdAt: String(purchase.createdAt),
    updatedAt: String(purchase.updatedAt),

    supplier: {
      id: purchase.supplier.id,
      code: purchase.supplier.code,
      name: purchase.supplier.name,
      status: purchase.supplier.status,
    },

    warehouse: {
      id: purchase.warehouse.id,
      code: purchase.warehouse.code,
      name: purchase.warehouse.name,
      status: purchase.warehouse.status,
    },

    items: purchase.items.map((item) => ({
      id: item.id,
      productId: item.productId,

      // Prisma Decimal → number
      quantity: Number(item.quantity),
      unitPrice: Number(item.unitPrice),
      subtotal: Number(item.subtotal),

      product: {
        id: item.product.id,
        code: item.product.code,
        name: item.product.name,
        unit: item.product.unit,
        status: item.product.status,
      },
    })),
  }));

  const serializedProducts = products.map((product) => ({
    id: product.id,
    code: product.code,
    name: product.name,
    unit: product.unit,
    status: product.status,
  }));

  const serializedSuppliers = suppliers.map((supplier) => ({
    id: supplier.id,
    code: supplier.code,
    name: supplier.name,
    status: supplier.status,
  }));

  const serializedWarehouses = warehouses.map((warehouse) => ({
    id: warehouse.id,
    code: warehouse.code,
    name: warehouse.name,
    status: warehouse.status,
  }));

  return (
    <PurchasingPage
      purchases={serializedPurchases}
      products={serializedProducts}
      suppliers={serializedSuppliers}
      warehouses={serializedWarehouses}
    />
  );
}