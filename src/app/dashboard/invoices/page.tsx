import { getInvoices } from "@/app/actions/invoice";
import { InvoicePage } from "@/components/invoices/invoice-page";

export default async function InvoicesDashboardPage() {
  const invoices = await getInvoices();

  const serializedInvoices = invoices.map((inv) => ({
    id: inv.id,
    invoiceNumber: inv.invoiceNumber,
    type: inv.type,
    status: inv.status,
    dueDate: String(inv.dueDate),
    issueDate: String(inv.issueDate),
    totalAmount: Number(inv.totalAmount),
    paidAmount: Number(inv.paidAmount),
    sale: inv.sale ? {
      id: inv.sale.id,
      customerId: inv.sale.customerId,
      customer: {
        name: inv.sale.customer.name,
      },
    } : null,
    purchase: inv.purchase ? {
      id: inv.purchase.id,
      supplierId: inv.purchase.supplierId,
      supplier: {
        name: inv.purchase.supplier.name,
      },
    } : null,
  }));

  return <InvoicePage invoices={serializedInvoices} />;
}
