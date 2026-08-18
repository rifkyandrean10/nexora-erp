"use client";

import {
  useEffect,
  useState,
  type FormEvent,
} from "react";

import {
  adjustInventory,
} from "@/app/actions/inventory";

import {
  inventoryAdjustmentSchema,
  type InventoryAdjustmentInput,
} from "@/lib/validations/inventory";

type Product = {
  id: string;
  code: string;
  name: string;
  unit: string;
  status: "ACTIVE" | "INACTIVE";
};

type Warehouse = {
  id: string;
  code: string;
  name: string;
  status: "ACTIVE" | "INACTIVE";
};

type Inventory = {
  id: string;
  organizationId: string;
  productId: string;
  warehouseId: string;
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
  product: Product;
  warehouse: Warehouse;
};

type InventoryFormProps = {
  inventory: Inventory | null;
  products: Product[];
  warehouses: Warehouse[];
  onCreated: (inventory: Inventory) => void;
  onUpdated: (inventory: Inventory) => void;
  onCancel: () => void;
};

const initialForm: InventoryAdjustmentInput = {
  productId: "",
  warehouseId: "",
  quantity: 0,
};

function inventoryToForm(
  inventory: Inventory
): InventoryAdjustmentInput {
  return {
    productId: inventory.productId,
    warehouseId: inventory.warehouseId,
    quantity: inventory.quantity,
  };
}

export function InventoryForm({
  inventory,
  products,
  warehouses,
  onCreated,
  onUpdated,
  onCancel,
}: InventoryFormProps) {
  const [form, setForm] =
    useState<InventoryAdjustmentInput>(
      inventory
        ? inventoryToForm(inventory)
        : initialForm
    );

  const [errors, setErrors] =
    useState<
      Record<
        string,
        string[] | undefined
      >
    >({});

  const [serverError, setServerError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const isEditMode =
    Boolean(inventory);

  useEffect(() => {
    // The form must reset when the selected inventory item changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setForm(
      inventory
        ? inventoryToForm(inventory)
        : initialForm
    );

    setErrors({});
    setServerError("");
  }, [inventory]);

  function updateField(
    field: keyof InventoryAdjustmentInput,
    value: string | number
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setErrors((current) => ({
      ...current,
      [field]: undefined,
    }));

    setServerError("");
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setErrors({});
    setServerError("");
    setLoading(true);

    try {
      const parsed =
        inventoryAdjustmentSchema.safeParse(
          form
        );

      if (!parsed.success) {
        setErrors(
          parsed.error.flatten()
            .fieldErrors
        );

        return;
      }

      const result =
        await adjustInventory(
          parsed.data
        );

      if (!result.success) {
        if (result.errors) {
          setErrors(result.errors);
        }

        setServerError(
          result.message ||
            "Inventory gagal diperbarui."
        );

        return;
      }

      if (result.data) {
        const serializedInventory = {
          ...result.data,
          quantity: Number(
            result.data.quantity
          ),
        };

        if (inventory) {
          onUpdated(
            serializedInventory
          );
        } else {
          onCreated(
            serializedInventory
          );
        }
      }
    } catch (error) {
      console.error(error);

      setServerError(
        "Terjadi kesalahan saat memperbarui inventory."
      );
    } finally {
      setLoading(false);
    }
  }

  const availableProducts =
    products.filter(
      (product) =>
        product.status === "ACTIVE"
    );

  const availableWarehouses =
    warehouses.filter(
      (warehouse) =>
        warehouse.status === "ACTIVE"
    );

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      {serverError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {serverError}
        </div>
      )}

      <div className="grid gap-5 md:grid-cols-2">
        {/* PRODUCT */}
        <Field
          label="Produk"
          required
          error={errors.productId}
        >
          <select
            value={form.productId}
            onChange={(event) =>
              updateField(
                "productId",
                event.target.value
              )
            }
            disabled={isEditMode}
            className={inputClass(
              !!errors.productId
            )}
          >
            <option value="">
              Pilih produk
            </option>

            {availableProducts.map(
              (product) => (
                <option
                  key={product.id}
                  value={product.id}
                >
                  {product.code} -{" "}
                  {product.name}
                </option>
              )
            )}
          </select>
        </Field>

        {/* WAREHOUSE */}
        <Field
          label="Gudang"
          required
          error={errors.warehouseId}
        >
          <select
            value={form.warehouseId}
            onChange={(event) =>
              updateField(
                "warehouseId",
                event.target.value
              )
            }
            disabled={isEditMode}
            className={inputClass(
              !!errors.warehouseId
            )}
          >
            <option value="">
              Pilih gudang
            </option>

            {availableWarehouses.map(
              (warehouse) => (
                <option
                  key={warehouse.id}
                  value={warehouse.id}
                >
                  {warehouse.code} -{" "}
                  {warehouse.name}
                </option>
              )
            )}
          </select>
        </Field>

        {/* QUANTITY */}
        <Field
          label="Quantity"
          required
          error={errors.quantity}
        >
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.quantity}
            onChange={(event) =>
              updateField(
                "quantity",
                Number(event.target.value)
              )
            }
            placeholder="0"
            className={inputClass(
              !!errors.quantity
            )}
          />
        </Field>
      </div>

      {/* ACTIONS */}
      <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-50"
        >
          {loading
            ? "Saving..."
            : isEditMode
              ? "Update Stock"
              : "Save Stock"}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string[];
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-slate-700">
        {label}

        {required && (
          <span className="ml-1 text-red-500">
            *
          </span>
        )}
      </label>

      {children}

      {error?.map((message) => (
        <p
          key={message}
          className="text-xs text-red-600"
        >
          {message}
        </p>
      ))}
    </div>
  );
}

function inputClass(
  hasError: boolean
) {
  return `w-full rounded-lg border px-3 py-2.5 text-sm text-slate-900 outline-none transition ${
    hasError
      ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
      : "border-slate-300 focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
  } disabled:bg-slate-100 disabled:text-slate-500`;
}
