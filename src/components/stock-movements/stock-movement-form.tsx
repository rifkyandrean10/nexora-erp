"use client";

import {
  useState,
  type FormEvent,
} from "react";

import {
  createStockMovement,
} from "@/app/actions/stock-movement";

import {
  stockMovementSchema,
  type StockMovementInput,
} from "@/lib/validations/stock-movement";

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

type StockMovement = {
  id: string;
  organizationId: string;
  productId: string;
  warehouseId: string;
  type:
    | "IN"
    | "OUT"
    | "ADJUSTMENT";
  quantity: number;
  reference: string | null;
  notes: string | null;
  createdAt: Date;
  product: Product;
  warehouse: Warehouse;
};

type StockMovementFormProps = {
  products: Product[];
  warehouses: Warehouse[];
  onCreated: (
    movement: StockMovement
  ) => void;
  onCancel: () => void;
};

const initialForm: StockMovementInput = {
  productId: "",
  warehouseId: "",
  type: "IN",
  quantity: 0,
  reference: "",
  notes: "",
};

export function StockMovementForm({
  products,
  warehouses,
  onCreated,
  onCancel,
}: StockMovementFormProps) {
  const [form, setForm] =
    useState<StockMovementInput>(
      initialForm
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

  function updateField(
    field: keyof StockMovementInput,
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
        stockMovementSchema.safeParse(
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
        await createStockMovement(
          parsed.data
        );

      if (!result.success) {
        if (result.errors) {
          setErrors(result.errors);
        }

        setServerError(
          result.message ||
            "Stock movement gagal dibuat."
        );

        return;
      }

      if (result.data) {
        /**
         * Prisma Decimal sudah dikonversi
         * agar aman dikirim ke Client Component.
         */
        const serializedMovement = {
          ...result.data,
          quantity: Number(
            result.data.quantity
          ),
        };

        onCreated(
          serializedMovement
        );
      }
    } catch (error) {
      console.error(error);

      setServerError(
        "Terjadi kesalahan saat membuat stock movement."
      );
    } finally {
      setLoading(false);
    }
  }

  const activeProducts =
    products.filter(
      (product) =>
        product.status === "ACTIVE"
    );

  const activeWarehouses =
    warehouses.filter(
      (warehouse) =>
        warehouse.status === "ACTIVE"
    );

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
    >
      {/* SERVER ERROR */}
      {serverError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {serverError}
        </div>
      )}

      {/* FORM GRID */}
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
            className={inputClass(
              !!errors.productId
            )}
            disabled={loading}
          >
            <option value="">
              Pilih produk
            </option>

            {activeProducts.map(
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

          {activeProducts.length ===
            0 && (
            <p className="text-xs text-amber-600">
              Belum ada produk aktif.
            </p>
          )}
        </Field>

        {/* WAREHOUSE */}
        <Field
          label="Warehouse"
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
            className={inputClass(
              !!errors.warehouseId
            )}
            disabled={loading}
          >
            <option value="">
              Pilih warehouse
            </option>

            {activeWarehouses.map(
              (warehouse) => (
                <option
                  key={warehouse.id}
                  value={
                    warehouse.id
                  }
                >
                  {warehouse.code} -{" "}
                  {warehouse.name}
                </option>
              )
            )}
          </select>

          {activeWarehouses.length ===
            0 && (
            <p className="text-xs text-amber-600">
              Belum ada warehouse aktif.
            </p>
          )}
        </Field>

        {/* TYPE */}
        <Field
          label="Movement Type"
          required
          error={errors.type}
        >
          <select
            value={form.type}
            onChange={(event) =>
              updateField(
                "type",
                event.target.value
              )
            }
            className={inputClass(
              !!errors.type
            )}
            disabled={loading}
          >
            <option value="IN">
              Stock In
            </option>

            <option value="OUT">
              Stock Out
            </option>

            <option value="ADJUSTMENT">
              Adjustment
            </option>
          </select>
        </Field>

        {/* QUANTITY */}
        <Field
          label={
            form.type ===
            "ADJUSTMENT"
              ? "Stok Akhir"
              : "Quantity"
          }
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
                Number(
                  event.target.value
                )
              )
            }
            placeholder="0"
            className={inputClass(
              !!errors.quantity
            )}
            disabled={loading}
          />

          <p className="text-xs text-slate-500">
            {form.type ===
            "IN"
              ? "Quantity akan ditambahkan ke stok."
              : form.type === "OUT"
                ? "Quantity akan dikurangi dari stok."
                : "Nilai akan menjadi stok akhir."}
          </p>
        </Field>

        {/* REFERENCE */}
        <Field
          label="Reference"
          error={errors.reference}
        >
          <input
            value={
              form.reference ?? ""
            }
            onChange={(event) =>
              updateField(
                "reference",
                event.target.value
              )
            }
            placeholder="Contoh: PO-001"
            maxLength={100}
            className={inputClass(
              !!errors.reference
            )}
            disabled={loading}
          />
        </Field>

        {/* NOTES */}
        <Field
          label="Catatan"
          error={errors.notes}
        >
          <input
            value={form.notes ?? ""}
            onChange={(event) =>
              updateField(
                "notes",
                event.target.value
              )
            }
            placeholder="Catatan movement..."
            maxLength={500}
            className={inputClass(
              !!errors.notes
            )}
            disabled={loading}
          />
        </Field>
      </div>

      {/* INFORMATION */}
      <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
        <p className="text-sm font-medium text-slate-800">
          Informasi
        </p>

        <p className="mt-1 text-xs leading-5 text-slate-500">
          Stock In akan menambah stok,
          Stock Out akan mengurangi stok,
          sedangkan Adjustment akan
          menetapkan jumlah stok akhir.
        </p>
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
          disabled={
            loading ||
            activeProducts.length ===
              0 ||
            activeWarehouses.length ===
              0
          }
          className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading
            ? "Saving..."
            : "Save Movement"}
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

      {error?.map(
        (message) => (
          <p
            key={message}
            className="text-xs text-red-600"
          >
            {message}
          </p>
        )
      )}
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