"use client";

import {
  useEffect,
  useState,
  type FormEvent,
} from "react";

import {
  createProduct,
  updateProduct,
} from "@/app/actions/product";

import {
  productSchema,
  type ProductInput,
} from "@/lib/validations/product";

import type { Product } from "./product-page";

type ProductCategory = {
  id: string;
  name: string;
};

type ProductFormProps = {
  product: Product | null;
  categories: ProductCategory[];
  onCreated: (product: Product) => void;
  onUpdated: (product: Product) => void;
  onCancel: () => void;
};

const initialForm: ProductInput = {
  categoryId: "",
  code: "",
  name: "",
  description: "",
  unit: "",
  purchasePrice: 0,
  sellingPrice: 0,
  status: "ACTIVE",
};

function productToForm(
  product: Product
): ProductInput {
  return {
    categoryId: product.categoryId,
    code: product.code,
    name: product.name,
    description:
      product.description ?? "",
    unit: product.unit,
    purchasePrice:
      product.purchasePrice,
    sellingPrice:
      product.sellingPrice,
    status: product.status,
  };
}

export function ProductForm({
  product,
  categories,
  onCreated,
  onUpdated,
  onCancel,
}: ProductFormProps) {
  const [form, setForm] =
    useState<ProductInput>(
      product
        ? productToForm(product)
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
    Boolean(product);

  useEffect(() => {
    // The form must reset when the selected product changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setForm(
      product
        ? productToForm(product)
        : initialForm
    );

    setErrors({});
    setServerError("");
  }, [product]);

  function updateField(
    field: keyof ProductInput,
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
        productSchema.safeParse(form);

      if (!parsed.success) {
        setErrors(
          parsed.error.flatten()
            .fieldErrors
        );

        return;
      }

      const result = product
        ? await updateProduct(
            product.id,
            parsed.data
          )
        : await createProduct(
            parsed.data
          );

      if (!result.success) {
        if (result.errors) {
          setErrors(result.errors);
        }

        setServerError(
          result.message ||
            "Produk gagal disimpan."
        );

        return;
      }

      if (result.data) {
        /**
         * Prisma Decimal tidak boleh
         * diteruskan langsung ke Client
         * Component.
         *
         * Convert Decimal menjadi number.
         */
        const serializedProduct: Product = {
          id: result.data.id,
          organizationId:
            result.data.organizationId,
          categoryId:
            result.data.categoryId,
          code: result.data.code,
          name: result.data.name,
          description:
            result.data.description,
          unit: result.data.unit,

          purchasePrice:
            Number(
              result.data.purchasePrice
            ),

          sellingPrice:
            Number(
              result.data.sellingPrice
            ),

          status: result.data.status,

          createdAt:
            result.data.createdAt,

          updatedAt:
            result.data.updatedAt,

          category: {
            id:
              result.data.category.id,
            organizationId:
              result.data.category
                .organizationId,
            name:
              result.data.category.name,
            description:
              result.data.category
                .description,
            status:
              result.data.category.status,
            createdAt:
              result.data.category
                .createdAt,
            updatedAt:
              result.data.category
                .updatedAt,
          },
        };

        if (product) {
          onUpdated(
            serializedProduct
          );
        } else {
          onCreated(
            serializedProduct
          );
        }
      }
    } catch (error) {
      console.error(error);

      setServerError(
        "Terjadi kesalahan saat menyimpan produk."
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
        {/* CATEGORY */}
        <Field
          label="Kategori"
          required
          error={errors.categoryId}
        >
          <select
            value={form.categoryId}
            onChange={(event) =>
              updateField(
                "categoryId",
                event.target.value
              )
            }
            className={inputClass(
              !!errors.categoryId
            )}
          >
            <option value="">
              Pilih kategori
            </option>

            {categories.map(
              (category) => (
                <option
                  key={category.id}
                  value={category.id}
                >
                  {category.name}
                </option>
              )
            )}
          </select>
        </Field>

        {/* CODE */}
        <Field
          label="Kode Produk"
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
            placeholder="Contoh: PRD-001"
            className={inputClass(
              !!errors.code
            )}
          />
        </Field>

        {/* NAME */}
        <Field
          label="Nama Produk"
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
            placeholder="Contoh: Laptop ASUS"
            className={inputClass(
              !!errors.name
            )}
          />
        </Field>

        {/* UNIT */}
        <Field
          label="Satuan"
          required
          error={errors.unit}
        >
          <input
            value={form.unit}
            onChange={(event) =>
              updateField(
                "unit",
                event.target.value
              )
            }
            placeholder="Contoh: pcs"
            className={inputClass(
              !!errors.unit
            )}
          />
        </Field>

        {/* PURCHASE PRICE */}
        <Field
          label="Harga Beli"
          required
          error={errors.purchasePrice}
        >
          <input
            type="number"
            min="0"
            value={form.purchasePrice}
            onChange={(event) =>
              updateField(
                "purchasePrice",
                Number(
                  event.target.value
                )
              )
            }
            placeholder="0"
            className={inputClass(
              !!errors.purchasePrice
            )}
          />
        </Field>

        {/* SELLING PRICE */}
        <Field
          label="Harga Jual"
          required
          error={errors.sellingPrice}
        >
          <input
            type="number"
            min="0"
            value={form.sellingPrice}
            onChange={(event) =>
              updateField(
                "sellingPrice",
                Number(
                  event.target.value
                )
              )
            }
            placeholder="0"
            className={inputClass(
              !!errors.sellingPrice
            )}
          />
        </Field>

        {/* STATUS */}
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

        {/* DESCRIPTION */}
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
              placeholder="Deskripsi produk..."
              rows={4}
              className={inputClass(
                !!errors.description
              )}
            />
          </Field>
        </div>
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
              ? "Update Product"
              : "Save Product"}
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
