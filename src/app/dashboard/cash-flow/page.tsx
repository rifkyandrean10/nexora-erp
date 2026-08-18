import { getCashFlows } from "@/app/actions/finance";
import { CashFlowPage } from "@/components/cash-flow/cash-flow-page";

export default async function CashFlowDashboardPage() {
  const cashFlows = await getCashFlows();

  const serializedCashFlows = cashFlows.map((cf) => ({
    id: cf.id,
    entryNumber: cf.entryNumber,
    date: String(cf.date),
    type: cf.type,
    amount: Number(cf.amount),
    category: cf.category,
    reference: cf.reference,
    notes: cf.notes,
    createdAt: String(cf.createdAt),
  }));

  return <CashFlowPage cashFlows={serializedCashFlows} />;
}
