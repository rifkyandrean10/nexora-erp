import { getPayments } from "@/app/actions/payment";
import { PaymentPage } from "@/components/payments/payment-page";

export default async function PaymentsDashboardPage() {
  const payments = await getPayments();

  const serializedPayments = payments.map((pay) => ({
    id: pay.id,
    paymentNumber: pay.paymentNumber,
    paymentDate: String(pay.paymentDate),
    amount: Number(pay.amount),
    method: pay.method,
    reference: pay.reference,
    notes: pay.notes,
    createdAt: String(pay.createdAt),
    invoice: {
      invoiceNumber: pay.invoice.invoiceNumber,
      type: pay.invoice.type,
    },
  }));

  return <PaymentPage payments={serializedPayments} />;
}
