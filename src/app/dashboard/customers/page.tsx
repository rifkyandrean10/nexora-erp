import { getCustomers } from "@/app/actions/customer";
import { CustomerPage } from "@/components/customers/customer-page";

export default async function CustomersPage() {
  const customers = await getCustomers();

  return <CustomerPage customers={customers} />;
}