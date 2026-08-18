"use client";

import {
  useEffect,
  useState,
  type FormEvent,
} from "react";

import {
  createWarehouse,
  updateWarehouse,
} from "@/app/actions/warehouse";

import {
  warehouseSchema,
  type WarehouseInput,
} from "@/lib/validations/warehouse";

import type { Warehouse } from "./warehouse-page";

type WarehouseFormProps = {
  warehouse: Warehouse | null;
  onCreated: (
    warehouse: Warehouse
  ) => void;
  onUpdated: (
    warehouse: Warehouse
  ) => void;
  onCancel: () => void;
};

const initialForm: WarehouseInput = {
  code: "",
  name: "",
  description: "",
  address: "",
  city: "",
  country: "Indonesia",
  status: "ACTIVE",
};

function warehouseToForm(
  warehouse: Warehouse
): WarehouseInput {
  return {
    code: warehouse.code,
    name: warehouse.name,
    description:
      warehouse.description ?? "",
    address:
      warehouse.address ?? "",
    city:
      warehouse.city ?? "",
    country: warehouse.country,
    status: warehouse.status,
  };
}

export function WarehouseForm({
  warehouse,
  onCreated,
  onUpdated,
  onCancel,
}: WarehouseFormProps) {
  const [form, setForm] =
    useState<WarehouseInput>(
      warehouse
        ? warehouseToForm(warehouse)
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
    Boolean(warehouse);

  useEffect(() => {
    // The form must reset when the selected warehouse changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setForm(
      warehouse
        ? warehouseToForm(warehouse)
        : initialForm
    );

    setErrors({});
    setServerError("");
  }, [warehouse]);

  function updateField(
    field: keyof WarehouseInput,
    value: string
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
        warehouseSchema.safeParse(form);

      if (!parsed.success) {
        setErrors(
          parsed.error.flatten()
            .fieldErrors
        );
        return;
      }

      const result = warehouse
        ? await updateWarehouse(
            warehouse.id,
            parsed.data
          )
        : await createWarehouse(
            parsed.data
          );

      if (!result.success) {
        if (result.errors) {
          setErrors(result.errors);
        }

        setServerError(
          result.message ||
            "Warehouse gagal disimpan."
        );

        return;
      }

      if (result.data) {
        if (warehouse) {
          onUpdated(result.data);
        } else {
          onCreated(result.data);
        }
      }
    } catch (error) {
      console.error(error);

      setServerError(
        "Terjadi kesalahan saat menyimpan warehouse."
      );
    } finally {
      setLoading(false);
    }
  }

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
        <Field
          label="Kode Warehouse"
          required
          error={errors.code}
        >
          <input
            value={form.code}
            onChange={(event) =>
              updateField(
                "code",
                event.target.value
              )
            }
            placeholder="Contoh: WH-001"
            className={inputClass(
              !!errors.code
            )}
          />
        </Field>

        <Field
          label="Nama Warehouse"
          required
          error={errors.name}
        >
          <input
            value={form.name}
            onChange={(event) =>
              updateField(
                "name",
                event.target.value
              )
            }
            placeholder="Contoh: Gudang Utama"
            className={inputClass(
              !!errors.name
            )}
          />
        </Field>

        <Field
          label="Kota"
          error={errors.city}
        >
          <input
            value={form.city ?? ""}
            onChange={(event) =>
              updateField(
                "city",
                event.target.value
              )
            }
            placeholder="Contoh: Jakarta"
            className={inputClass(
              !!errors.city
            )}
          />
        </Field>

        <Field
          label="Negara"
          required
          error={errors.country}
        >
          <input
            value={form.country}
            onChange={(event) =>
              updateField(
                "country",
                event.target.value
              )
            }
            placeholder="Indonesia"
            className={inputClass(
              !!errors.country
            )}
          />
        </Field>

        <Field
          label="Status"
          required
          error={errors.status}
        >
          <select
            value={form.status}
            onChange={(event) =>
              updateField(
                "status",
                event.target.value
              )
            }
            className={inputClass(
              !!errors.status
            )}
          >
            <option value="ACTIVE">
              Active
            </option>

            <option value="INACTIVE">
              Inactive
            </option>
          </select>
        </Field>

        <div className="md:col-span-2">
          <Field
            label="Alamat"
            error={errors.address}
          >
            <textarea
              value={
                form.address ?? ""
              }
              onChange={(event) =>
                updateField(
                  "address",
                  event.target.value
                )
              }
              placeholder="Alamat lengkap warehouse..."
              rows={3}
              className={inputClass(
                !!errors.address
              )}
            />
          </Field>
        </div>

        <div className="md:col-span-2">
          <Field
            label="Deskripsi"
            error={errors.description}
          >
            <textarea
              value={
                form.description ?? ""
              }
              onChange={(event) =>
                updateField(
                  "description",
                  event.target.value
                )
              }
              placeholder="Deskripsi warehouse..."
              rows={4}
              className={inputClass(
                !!errors.description
              )}
            />
          </Field>
        </div>
      </div>

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
              ? "Update Warehouse"
              : "Save Warehouse"}
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
  }`;
}
