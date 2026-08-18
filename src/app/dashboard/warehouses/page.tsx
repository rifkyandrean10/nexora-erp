import {
  getWarehouses,
} from "@/app/actions/warehouse";

import {
  WarehousePage,
} from "@/components/warehouses/warehouse-page";

export default async function WarehousesPage() {
  const warehouses =
    await getWarehouses();

  return (
    <WarehousePage
      warehouses={warehouses}
    />
  );
}