import { getExpenses } from "@/app/actions/finance";
import { ExpensePage } from "@/components/expenses/expense-page";

export default async function ExpensesDashboardPage() {
  const expenses = await getExpenses();

  const serializedExpenses = expenses.map((exp) => ({
    id: exp.id,
    expenseNumber: exp.expenseNumber,
    date: String(exp.date),
    category: exp.category,
    amount: Number(exp.amount),
    notes: exp.notes,
    createdAt: String(exp.createdAt),
  }));

  return <ExpensePage expenses={serializedExpenses} />;
}
