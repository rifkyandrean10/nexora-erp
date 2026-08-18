"use client";

import {
  useState,
  type FormEvent,
} from "react";

import {
  createCategory,
  updateCategory,
} from "@/app/actions/category";

import {
  categorySchema,
  type CategoryInput,
} from "@/lib/validations/category";

type Category = {
  id: string;
  organizationId: string;
  name: string;
  description: string | null;
  status: "ACTIVE" | "INACTIVE";
  createdAt: Date;
  updatedAt: Date;
};

type CategoryFormProps = {
  category: Category | null;
  onCreated: (category: Category) => void;
  onUpdated: (category: Category) => void;
  onCancel: () => void;
};

const initialForm: CategoryInput = {
  name: "",
  description: "",
  status: "ACTIVE",
};

function categoryToForm(
  category: Category
): CategoryInput {
  return {
    name: category.name,
    description:
      category.description ?? "",
    status: category.status,
  };
}

export function CategoryForm({
  category,
  onCreated,
  onUpdated,
  onCancel,
}: CategoryFormProps) {
  const [form, setForm] =
    useState<CategoryInput>(
      () =>
        category
          ? categoryToForm(category)
          : initialForm
    );

  const [errors, setErrors] =
    useState<
      Record<string, string[] | undefined>
    >({});

  const [serverError, setServerError] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const isEditMode =
    Boolean(category);

  function updateField(
    field: keyof CategoryInput,
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
        categorySchema.safeParse(form);

      if (!parsed.success) {
        setErrors(
          parsed.error.flatten()
            .fieldErrors
        );
        return;
      }

      const result = category
        ? await updateCategory(
            category.id,
            parsed.data
          )
        : await createCategory(
            parsed.data
          );

      if (!result.success) {
        if (result.errors) {
          setErrors(result.errors);
        }

        setServerError(
          result.message ||
            "Kategori gagal disimpan."
        );

        return;
      }

      if (result.data) {
        if (category) {
          onUpdated(result.data);
        } else {
          onCreated(result.data);
        }
      }
    } catch (error) {
      console.error(error);

      setServerError(
        "Terjadi kesalahan saat menyimpan kategori."
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
          label="Nama Kategori"
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
            placeholder="Contoh: Elektronik"
            className={inputClass(
              !!errors.name
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
              placeholder="Deskripsi kategori..."
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
              ? "Update Category"
              : "Save Category"}
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