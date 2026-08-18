"use client";

import { useEffect, useState } from "react";

import type { Customer } from "@prisma/client";

import {
  createCustomer,
  updateCustomer,
} from "@/app/actions/customer";

import {
  customerSchema,
  type CustomerInput,
} from "@/lib/validations/customer";

type CustomerFormProps = {
  customer: Customer | null;
  onCreated: (customer: Customer) => void;
  onUpdated: (customer: Customer) => void;
  onCancel: () => void;
};

const initialForm: CustomerInput = {
  code: "",
  name: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  country: "Indonesia",
  notes: "",
  status: "ACTIVE",
};

function customerToForm(
  customer: Customer
): CustomerInput {
  return {
    code: customer.code,
    name: customer.name,
    email: customer.email ?? "",
    phone: customer.phone ?? "",
    address: customer.address ?? "",
    city: customer.city ?? "",
    country: customer.country ?? "Indonesia",
    notes: customer.notes ?? "",
    status: customer.status,
  };
}

export function CustomerForm({
  customer,
  onCreated,
  onUpdated,
  onCancel,
}: CustomerFormProps) {
  const [form, setForm] =
    useState<CustomerInput>(
      customer
        ? customerToForm(customer)
        : initialForm
    );

  const [errors, setErrors] = useState<
    Record<string, string[] | undefined>
  >({});

  const [serverError, setServerError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  /**
   * Ketika customer yang diedit berubah,
   * isi ulang form.
   */
  useEffect(() => {
    if (customer) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm(customerToForm(customer));
    } else {
      setForm(initialForm);
    }

    setErrors({});
    setServerError("");
  }, [customer]);

  const isEditMode = Boolean(customer);

  function updateField(
    field: keyof CustomerInput,
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
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setServerError("");
    setErrors({});

    const parsed =
      customerSchema.safeParse(form);

    if (!parsed.success) {
      setErrors(
        parsed.error.flatten().fieldErrors
      );

      return;
    }

    setLoading(true);

    try {
      /**
       * EDIT
       */
      if (customer) {
        const result =
          await updateCustomer(
            customer.id,
            parsed.data
          );

        if (!result.success) {
          if (result.errors) {
            setErrors(result.errors);
          }

          setServerError(
            result.message ||
              "Customer gagal diperbarui."
          );

          return;
        }

        if (result.data) {
          onUpdated(result.data);
        }

        return;
      }

      /**
       * CREATE
       */
      const result =
        await createCustomer(parsed.data);

      if (!result.success) {
        if (result.errors) {
          setErrors(result.errors);
        }

        setServerError(
          result.message ||
            "Customer gagal dibuat."
        );

        return;
      }

      if (result.data) {
        onCreated(result.data);
      }

      setForm(initialForm);
    } catch (error) {
      console.error(error);

      setServerError(
        isEditMode
          ? "Terjadi kesalahan saat memperbarui customer."
          : "Terjadi kesalahan saat membuat customer."
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
        {/* Code */}
        <Field
          label="Customer Code"
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
            placeholder="CUS-001"
            className={inputClass(
              !!errors.code
            )}
          />
        </Field>

        {/* Name */}
        <Field
          label="Customer Name"
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
            placeholder="PT Contoh Indonesia"
            className={inputClass(
              !!errors.name
            )}
          />
        </Field>

        {/* Email */}
        <Field
          label="Email"
          error={errors.email}
        >
          <input
            type="email"
            value={form.email}
            onChange={(event) =>
              updateField(
                "email",
                event.target.value
              )
            }
            placeholder="customer@example.com"
            className={inputClass(
              !!errors.email
            )}
          />
        </Field>

        {/* Phone */}
        <Field
          label="Phone"
          error={errors.phone}
        >
          <input
            value={form.phone}
            onChange={(event) =>
              updateField(
                "phone",
                event.target.value
              )
            }
            placeholder="08123456789"
            className={inputClass(
              !!errors.phone
            )}
          />
        </Field>

        {/* City */}
        <Field
          label="City"
          error={errors.city}
        >
          <input
            value={form.city}
            onChange={(event) =>
              updateField(
                "city",
                event.target.value
              )
            }
            placeholder="Jakarta"
            className={inputClass(
              !!errors.city
            )}
          />
        </Field>

        {/* Country */}
        <Field
          label="Country"
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

        {/* Status */}
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

        {/* Address */}
        <Field
          label="Address"
          error={errors.address}
        >
          <input
            value={form.address}
            onChange={(event) =>
              updateField(
                "address",
                event.target.value
              )
            }
            placeholder="Alamat customer"
            className={inputClass(
              !!errors.address
            )}
          />
        </Field>
      </div>

      {/* Notes */}
      <Field
        label="Notes"
        error={errors.notes}
      >
        <textarea
          value={form.notes}
          onChange={(event) =>
            updateField(
              "notes",
              event.target.value
            )
          }
          placeholder="Catatan tambahan..."
          rows={4}
          className={inputClass(
            !!errors.notes
          )}
        />
      </Field>

      {/* Actions */}
      <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading
            ? "Saving..."
            : isEditMode
              ? "Update Customer"
              : "Save Customer"}
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

function inputClass(hasError: boolean) {
  return `
    w-full rounded-lg border px-3 py-2.5
    text-sm text-slate-900 outline-none
    transition
    ${
      hasError
        ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
        : "border-slate-300 focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
    }
  `;
}
