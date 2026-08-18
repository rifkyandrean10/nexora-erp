import { getSuppliers } from "@/app/actions/supplier";
import { SupplierPage } from "@/components/suppliers/supplier-page";

export default async function SuppliersPage() {
  const suppliers = await getSuppliers();

  return <SupplierPage suppliers={suppliers} />;
}