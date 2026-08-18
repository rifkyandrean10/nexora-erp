"use client";

import {
  useState,
  useTransition,
} from "react";

import {
  confirmPurchase,
  deletePurchase,
  receivePurchase,
} from "@/app/actions/purchase";

import {
  PurchaseForm,
} from "./purchase-form";

type Product = {
  id: string;
  code: string;
  name: string;
  unit: string;
  status: "ACTIVE" | "INACTIVE";
};

type Supplier = {
  id: string;
  code: string;
  name: string;
  status: "ACTIVE" | "INACTIVE";
};

type Warehouse = {
  id: string;
  code: string;
  name: string;
  status: "ACTIVE" | "INACTIVE";
};

type PurchaseItem = {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;

  product: Product;
};

type Purchase = {
  id: string;
  organizationId: string;
  supplierId: string;
  warehouseId: string;

  invoiceNumber: string | null;
  notes: string | null;

  status:
    | "DRAFT"
    | "CONFIRMED"
    | "RECEIVED"
    | "CANCELLED";

  totalAmount: number;

  createdAt: string;
  updatedAt: string;

  supplier: Supplier;
  warehouse: Warehouse;
  items: PurchaseItem[];
};

type PurchasingPageProps = {
  purchases: Purchase[];
  products: Product[];
  suppliers: Supplier[];
  warehouses: Warehouse[];
};

const statusLabels = {
  DRAFT: "Draft",
  CONFIRMED: "Confirmed",
  RECEIVED: "Received",
  CANCELLED: "Cancelled",
};

const formatCurrency = (
  value: number
) =>
  new Intl.NumberFormat(
    "id-ID",
    {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }
  ).format(value);

const formatDate = (
  value: string
) =>
  new Intl.DateTimeFormat(
    "id-ID",
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
  ).format(new Date(value));

export function PurchasingPage({
  purchases,
  products,
  suppliers,
  warehouses,
}: PurchasingPageProps) {
  const [
    showForm,
    setShowForm,
  ] = useState(false);

  const [
    editingPurchase,
    setEditingPurchase,
  ] = useState<Purchase | null>(
    null
  );

  const [
    selectedPurchase,
    setSelectedPurchase,
  ] = useState<Purchase | null>(
    null
  );

  const [
    statusFilter,
    setStatusFilter,
  ] = useState("ALL");

  const [
    isPending,
    startTransition,
  ] = useTransition();

  const filteredPurchases =
    statusFilter === "ALL"
      ? purchases
      : purchases.filter(
          (purchase) =>
            purchase.status ===
            statusFilter
        );

  function handleCreate() {
    setEditingPurchase(null);
    setShowForm(true);
  }

  function handleEdit(
    purchase: Purchase
  ) {
    setSelectedPurchase(null);
    setEditingPurchase(purchase);
    setShowForm(true);
  }

  function handleCloseForm() {
    setShowForm(false);
    setEditingPurchase(null);
  }

  function handleDelete(
    purchase: Purchase
  ) {
    const confirmed =
      window.confirm(
        `Hapus purchase ${
          purchase.invoiceNumber ||
          purchase.id.slice(0, 8)
        }?`
      );

    if (!confirmed) {
      return;
    }

    startTransition(
      async () => {
        const result =
          await deletePurchase(
            purchase.id
          );

        window.alert(
          result.message
        );

        if (result.success) {
          window.location.reload();
        }
      }
    );
  }

  function handleConfirm(
    purchase: Purchase
  ) {
    const confirmed =
      window.confirm(
        "Konfirmasi purchase ini?"
      );

    if (!confirmed) {
      return;
    }

    startTransition(
      async () => {
        const result =
          await confirmPurchase(
            purchase.id
          );

        window.alert(
          result.message
        );

        if (result.success) {
          window.location.reload();
        }
      }
    );
  }

  function handleReceive(
    purchase: Purchase
  ) {
    const confirmed =
      window.confirm(
        "Terima purchase ini? Inventory akan langsung bertambah dan stock movement IN akan dibuat."
      );

    if (!confirmed) {
      return;
    }

    startTransition(
      async () => {
        const result =
          await receivePurchase(
            purchase.id
          );

        window.alert(
          result.message
        );

        if (result.success) {
          window.location.reload();
        }
      }
    );
  }

  if (showForm) {
    return (
      <PurchaseForm
        products={products}
        suppliers={suppliers}
        warehouses={warehouses}
        purchase={editingPurchase}
        onClose={
          handleCloseForm
        }
      />
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">
            Purchasing
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Kelola purchase dan pembelian
            barang.
          </p>
        </div>

        <button
          type="button"
          onClick={handleCreate}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          + New Purchase
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          ["ALL", "All"],
          ["DRAFT", "Draft"],
          ["CONFIRMED", "Confirmed"],
          ["RECEIVED", "Received"],
          ["CANCELLED", "Cancelled"],
        ].map(
          ([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() =>
                setStatusFilter(
                  value
                )
              }
              className={`rounded-lg border px-3 py-2 text-sm ${
                statusFilter === value
                  ? "bg-primary text-primary-foreground"
                  : "bg-background hover:bg-muted"
              }`}
            >
              {label}
            </button>
          )
        )}
      </div>

      <div className="overflow-hidden rounded-xl border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/40">
              <tr>
                <th className="px-4 py-3 text-left">
                  Invoice
                </th>

                <th className="px-4 py-3 text-left">
                  Supplier
                </th>

                <th className="px-4 py-3 text-left">
                  Warehouse
                </th>

                <th className="px-4 py-3 text-left">
                  Items
                </th>

                <th className="px-4 py-3 text-right">
                  Total
                </th>

                <th className="px-4 py-3 text-left">
                  Status
                </th>

                <th className="px-4 py-3 text-left">
                  Created
                </th>

                <th className="px-4 py-3 text-right">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredPurchases.length ===
              0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-10 text-center text-muted-foreground"
                  >
                    Belum ada purchase.
                  </td>
                </tr>
              ) : (
                filteredPurchases.map(
                  (purchase) => (
                    <tr
                      key={purchase.id}
                      className="border-b last:border-0 hover:bg-muted/30"
                    >
                      <td className="px-4 py-3 font-medium">
                        {purchase.invoiceNumber ||
                          "-"}
                      </td>

                      <td className="px-4 py-3">
                        <div className="font-medium">
                          {
                            purchase
                              .supplier
                              .name
                          }
                        </div>

                        <div className="text-xs text-muted-foreground">
                          {
                            purchase
                              .supplier
                              .code
                          }
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="font-medium">
                          {
                            purchase
                              .warehouse
                              .name
                          }
                        </div>

                        <div className="text-xs text-muted-foreground">
                          {
                            purchase
                              .warehouse
                              .code
                          }
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        {
                          purchase.items
                            .length
                        }
                      </td>

                      <td className="px-4 py-3 text-right font-medium">
                        {formatCurrency(
                          purchase.totalAmount
                        )}
                      </td>

                      <td className="px-4 py-3">
                        <span className="rounded-full border px-2.5 py-1 text-xs font-medium">
                          {
                            statusLabels[
                              purchase
                                .status
                            ]
                          }
                        </span>
                      </td>

                      <td className="px-4 py-3 text-muted-foreground">
                        {formatDate(
                          purchase.createdAt
                        )}
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedPurchase(
                                purchase
                              )
                            }
                            className="rounded-md border px-2.5 py-1.5 text-xs hover:bg-muted"
                          >
                            Detail
                          </button>

                          {purchase.status ===
                            "DRAFT" && (
                            <>
                              <button
                                type="button"
                                onClick={() =>
                                  handleEdit(
                                    purchase
                                  )
                                }
                                className="rounded-md border px-2.5 py-1.5 text-xs hover:bg-muted"
                              >
                                Edit
                              </button>

                              <button
                                type="button"
                                disabled={
                                  isPending
                                }
                                onClick={() =>
                                  handleConfirm(
                                    purchase
                                  )
                                }
                                className="rounded-md border px-2.5 py-1.5 text-xs hover:bg-muted disabled:opacity-50"
                              >
                                Confirm
                              </button>

                              <button
                                type="button"
                                disabled={
                                  isPending
                                }
                                onClick={() =>
                                  handleDelete(
                                    purchase
                                  )
                                }
                                className="rounded-md border px-2.5 py-1.5 text-xs text-destructive hover:bg-destructive/10 disabled:opacity-50"
                              >
                                Delete
                              </button>
                            </>
                          )}

                          {purchase.status ===
                            "CONFIRMED" && (
                            <button
                              type="button"
                              disabled={
                                isPending
                              }
                              onClick={() =>
                                handleReceive(
                                  purchase
                                )
                              }
                              className="rounded-md border px-2.5 py-1.5 text-xs font-medium hover:bg-muted disabled:opacity-50"
                            >
                              Receive
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                )
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedPurchase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-background p-6 shadow-xl">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h2 className="text-xl font-semibold">
                  Purchase Detail
                </h2>

                <p className="text-sm text-muted-foreground">
                  {selectedPurchase.invoiceNumber ||
                    selectedPurchase.id}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedPurchase(
                    null
                  )
                }
                className="rounded-md border px-3 py-1.5 text-sm hover:bg-muted"
              >
                Close
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <p className="text-xs text-muted-foreground">
                  Supplier
                </p>

                <p className="font-medium">
                  {
                    selectedPurchase
                      .supplier.name
                  }
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">
                  Warehouse
                </p>

                <p className="font-medium">
                  {
                    selectedPurchase
                      .warehouse.name
                  }
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">
                  Status
                </p>

                <p className="font-medium">
                  {
                    statusLabels[
                      selectedPurchase
                        .status
                    ]
                  }
                </p>
              </div>
            </div>

            <div className="mt-6 overflow-x-auto rounded-lg border">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/40">
                  <tr>
                    <th className="px-4 py-3 text-left">
                      Product
                    </th>

                    <th className="px-4 py-3 text-right">
                      Qty
                    </th>

                    <th className="px-4 py-3 text-right">
                      Unit Price
                    </th>

                    <th className="px-4 py-3 text-right">
                      Subtotal
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {selectedPurchase.items.map(
                    (item) => (
                      <tr
                        key={item.id}
                        className="border-b last:border-0"
                      >
                        <td className="px-4 py-3">
                          <div className="font-medium">
                            {
                              item.product
                                .name
                            }
                          </div>

                          <div className="text-xs text-muted-foreground">
                            {
                              item.product
                                .code
                            }
                          </div>
                        </td>

                        <td className="px-4 py-3 text-right">
                          {item.quantity}{" "}
                          {
                            item.product
                              .unit
                          }
                        </td>

                        <td className="px-4 py-3 text-right">
                          {formatCurrency(
                            item.unitPrice
                          )}
                        </td>

                        <td className="px-4 py-3 text-right font-medium">
                          {formatCurrency(
                            item.subtotal
                          )}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>

                <tfoot>
                  <tr>
                    <td
                      colSpan={3}
                      className="px-4 py-3 text-right font-semibold"
                    >
                      Total
                    </td>

                    <td className="px-4 py-3 text-right font-semibold">
                      {formatCurrency(
                        selectedPurchase.totalAmount
                      )}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {selectedPurchase.notes && (
              <div className="mt-6 rounded-lg border p-4">
                <p className="mb-1 text-xs font-medium text-muted-foreground">
                  Notes
                </p>

                <p className="whitespace-pre-wrap text-sm">
                  {
                    selectedPurchase.notes
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}