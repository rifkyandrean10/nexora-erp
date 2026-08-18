import { getSales } from "@/app/actions/sale";
import { getProducts } from "@/app/actions/product";
import { getCustomers } from "@/app/actions/customer";
import { getWarehouses } from "@/app/actions/warehouse";
import { SalesPage } from "@/components/sales/sales-page";

export default async function SalesDashboardPage() {
  const [sales, products, customers, warehouses] = await Promise.all([
    getSales(),
    getProducts(),
    getCustomers(),
    getWarehouses(),
  ]);

  const serializedSales = sales.map((sale) => ({
    id: sale.id,
    organizationId: sale.organizationId,
    customerId: sale.customerId,
    warehouseId: sale.warehouseId,
    invoiceNumber: sale.invoiceNumber,
    notes: sale.notes,
    status: sale.status,
    totalAmount: Number(sale.totalAmount),
    createdAt: String(sale.createdAt),
    updatedAt: String(sale.updatedAt),
    customer: {
      id: sale.customer.id,
      code: sale.customer.code,
      name: sale.customer.name,
      status: sale.customer.status,
    },
    warehouse: {
      id: sale.warehouse.id,
      code: sale.warehouse.code,
      name: sale.warehouse.name,
      status: sale.warehouse.status,
    },
    items: sale.items.map((item) => ({
      id: item.id,
      productId: item.productId,
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
    invoice: sale.invoice ? {
      id: sale.invoice.id,
      invoiceNumber: sale.invoice.invoiceNumber,
      status: sale.invoice.status,
      totalAmount: Number(sale.invoice.totalAmount),
      paidAmount: Number(sale.invoice.paidAmount),
    } : null,
  }));

  const serializedProducts = products.map((product) => ({
    id: product.id,
    code: product.code,
    name: product.name,
    unit: product.unit,
    status: product.status,
  }));

  const serializedCustomers = customers.map((c) => ({
    id: c.id,
    code: c.code,
    name: c.name,
    status: c.status,
  }));

  const serializedWarehouses = warehouses.map((w) => ({
    id: w.id,
    code: w.code,
    name: w.name,
    status: w.status,
  }));

  return (
    <SalesPage
      sales={serializedSales}
      products={serializedProducts}
      customers={serializedCustomers}
      warehouses={serializedWarehouses}
    />
  );
}
