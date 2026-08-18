import { getRevenues } from "@/app/actions/finance";
import { RevenuePage } from "@/components/revenue/revenue-page";

export default async function RevenueDashboardPage() {
  const revenues = await getRevenues();

  const serializedRevenues = revenues.map((rev) => ({
    id: rev.id,
    revenueNumber: rev.revenueNumber,
    date: String(rev.date),
    category: rev.category,
    amount: Number(rev.amount),
    notes: rev.notes,
    createdAt: String(rev.createdAt),
  }));

  return <RevenuePage revenues={serializedRevenues} />;
}
