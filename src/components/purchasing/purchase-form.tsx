"use client";

import {
  useState,
  useTransition,
} from "react";

import {
  createPurchase,
  updatePurchase,
} from "@/app/actions/purchase";

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
  items: PurchaseItem[];
};

type FormItem = {
  productId: string;
  quantity: number;
  unitPrice: number;
};

type PurchaseFormProps = {
  products: Product[];
  suppliers: Supplier[];
  warehouses: Warehouse[];
  purchase: Purchase | null;
  onClose: () => void;
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

export function PurchaseForm({
  products,
  suppliers,
  warehouses,
  purchase,
  onClose,
}: PurchaseFormProps) {
  const [
    isPending,
    startTransition,
  ] = useTransition();

  const [
    supplierId,
    setSupplierId,
  ] = useState(
    purchase?.supplierId || ""
  );

  const [
    warehouseId,
    setWarehouseId,
  ] = useState(
    purchase?.warehouseId || ""
  );

  const [
    invoiceNumber,
    setInvoiceNumber,
  ] = useState(
    purchase?.invoiceNumber || ""
  );

  const [
    notes,
    setNotes,
  ] = useState(
    purchase?.notes || ""
  );

  const [
    items,
    setItems,
  ] = useState<FormItem[]>(
    purchase?.items.map(
      (item) => ({
        productId:
          item.productId,
        quantity:
          item.quantity,
        unitPrice:
          item.unitPrice,
      })
    ) || [
      {
        productId: "",
        quantity: 1,
        unitPrice: 0,
      },
    ]
  );

  const [
    error,
    setError,
  ] = useState("");

  const totalAmount =
    items.reduce(
      (total, item) =>
        total +
        item.quantity *
          item.unitPrice,
      0
    );

  function addItem() {
    setItems((current) => [
      ...current,
      {
        productId: "",
        quantity: 1,
        unitPrice: 0,
      },
    ]);
  }

  function removeItem(
    index: number
  ) {
    setItems((current) =>
      current.filter(
        (_, itemIndex) =>
          itemIndex !== index
      )
    );
  }

  function updateItem(
    index: number,
    field: keyof FormItem,
    value: string | number
  ) {
    setItems((current) =>
      current.map(
        (item, itemIndex) =>
          itemIndex === index
            ? {
                ...item,
                [field]: value,
              }
            : item
      )
    );
  }

  function handleProductChange(
    index: number,
    productId: string
  ) {
    const product =
      products.find(
        (item) =>
          item.id === productId
      );

    setItems((current) =>
      current.map(
        (item, itemIndex) =>
          itemIndex === index
            ? {
                ...item,
                productId,
                unitPrice:
                  product &&
                  item.unitPrice ===
                    0
                    ? 0
                    : item.unitPrice,
              }
            : item
      )
    );
  }

  function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setError("");

    if (!supplierId) {
      setError(
        "Supplier wajib dipilih."
      );
      return;
    }

    if (!warehouseId) {
      setError(
        "Warehouse wajib dipilih."
      );
      return;
    }

    if (items.length === 0) {
      setError(
        "Minimal harus ada satu produk."
      );
      return;
    }

    const invalidItem =
      items.some(
        (item) =>
          !item.productId ||
          item.quantity <= 0 ||
          item.unitPrice < 0
      );

    if (invalidItem) {
      setError(
        "Pastikan seluruh item memiliki produk, quantity yang valid, dan harga yang valid."
      );
      return;
    }

    const productIds =
      items.map(
        (item) => item.productId
      );

    if (
      new Set(productIds).size !==
      productIds.length
    ) {
      setError(
        "Produk yang sama tidak boleh ditambahkan lebih dari satu kali."
      );
      return;
    }

    const input = {
      supplierId,
      warehouseId,
      invoiceNumber,
      notes,
      items,
    };

    startTransition(
      async () => {
        const result = purchase
          ? await updatePurchase(
              purchase.id,
              input
            )
          : await createPurchase(
              input
            );

        if (!result.success) {
          setError(
            result.message
          );
          return;
        }

        window.location.reload();
      }
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">
            {purchase
              ? "Edit Purchase"
              : "New Purchase"}
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Buat dan kelola purchase
            order.
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border px-4 py-2 text-sm hover:bg-muted"
        >
          Back
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="rounded-xl border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">
            Purchase Information
          </h2>

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="mb-1 block text-sm font-medium">
                Supplier
              </label>

              <select
                value={supplierId}
                onChange={(event) =>
                  setSupplierId(
                    event.target.value
                  )
                }
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
              >
                <option value="">
                  Select supplier
                </option>

                {suppliers
                  .filter(
                    (supplier) =>
                      supplier.status ===
                      "ACTIVE" ||
                      supplier.id ===
                        supplierId
                  )
                  .map(
                    (supplier) => (
                      <option
                        key={
                          supplier.id
                        }
                        value={
                          supplier.id
                        }
                      >
                        {supplier.code} -{" "}
                        {
                          supplier.name
                        }
                      </option>
                    )
                  )}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Warehouse
              </label>

              <select
                value={warehouseId}
                onChange={(event) =>
                  setWarehouseId(
                    event.target.value
                  )
                }
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
              >
                <option value="">
                  Select warehouse
                </option>

                {warehouses
                  .filter(
                    (warehouse) =>
                      warehouse.status ===
                      "ACTIVE" ||
                      warehouse.id ===
                        warehouseId
                  )
                  .map(
                    (warehouse) => (
                      <option
                        key={
                          warehouse.id
                        }
                        value={
                          warehouse.id
                        }
                      >
                        {warehouse.code} -{" "}
                        {
                          warehouse.name
                        }
                      </option>
                    )
                  )}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Invoice Number
              </label>

              <input
                value={invoiceNumber}
                onChange={(event) =>
                  setInvoiceNumber(
                    event.target.value
                  )
                }
                maxLength={100}
                placeholder="Optional"
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="mb-1 block text-sm font-medium">
              Notes
            </label>

            <textarea
              value={notes}
              onChange={(event) =>
                setNotes(
                  event.target.value
                )
              }
              maxLength={1000}
              rows={3}
              placeholder="Optional notes..."
              className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="rounded-xl border bg-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              Purchase Items
            </h2>

            <button
              type="button"
              onClick={addItem}
              className="rounded-lg border px-3 py-2 text-sm hover:bg-muted"
            >
              + Add Product
            </button>
          </div>

          <div className="space-y-4">
            {items.map(
              (item, index) => {
                const subtotal =
                  item.quantity *
                  item.unitPrice;

                return (
                  <div
                    key={index}
                    className="grid gap-3 rounded-lg border p-4 md:grid-cols-[2fr_1fr_1fr_1fr_auto]"
                  >
                    <div>
                      <label className="mb-1 block text-xs font-medium text-muted-foreground">
                        Product
                      </label>

                      <select
                        value={
                          item.productId
                        }
                        onChange={(
                          event
                        ) =>
                          handleProductChange(
                            index,
                            event
                              .target
                              .value
                          )
                        }
                        className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                      >
                        <option value="">
                          Select product
                        </option>

                        {products
                          .filter(
                            (product) =>
                              product.status ===
                                "ACTIVE" ||
                              product.id ===
                                item.productId
                          )
                          .map(
                            (
                              product
                            ) => (
                              <option
                                key={
                                  product.id
                                }
                                value={
                                  product.id
                                }
                              >
                                {
                                  product.code
                                }{" "}
                                -{" "}
                                {
                                  product.name
                                }
                              </option>
                            )
                          )}
                      </select>
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-medium text-muted-foreground">
                        Quantity
                      </label>

                      <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={
                          item.quantity
                        }
                        onChange={(
                          event
                        ) =>
                          updateItem(
                            index,
                            "quantity",
                            Number(
                              event
                                .target
                                .value
                            )
                          )
                        }
                        className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-medium text-muted-foreground">
                        Unit Price
                      </label>

                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={
                          item.unitPrice
                        }
                        onChange={(
                          event
                        ) =>
                          updateItem(
                            index,
                            "unitPrice",
                            Number(
                              event
                                .target
                                .value
                            )
                          )
                        }
                        className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-medium text-muted-foreground">
                        Subtotal
                      </label>

                      <div className="flex h-[38px] items-center rounded-lg border bg-muted/30 px-3 text-sm font-medium">
                        {formatCurrency(
                          subtotal
                        )}
                      </div>
                    </div>

                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={() =>
                          removeItem(
                            index
                          )
                        }
                        disabled={
                          items.length ===
                          1
                        }
                        className="rounded-lg border px-3 py-2 text-sm text-destructive hover:bg-destructive/10 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                );
              }
            )}
          </div>

          <div className="mt-6 flex justify-end border-t pt-4">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">
                Total Purchase
              </p>

              <p className="text-2xl font-bold">
                {formatCurrency(
                  totalAmount
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border px-4 py-2 text-sm hover:bg-muted"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isPending}
            className="rounded-lg bg-primary px-5 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending
              ? "Saving..."
              : purchase
                ? "Update Purchase"
                : "Create Purchase"}
          </button>
        </div>
      </form>
    </div>
  );
}