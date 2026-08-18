import {
  getProducts,
} from "@/app/actions/product";

import {
  getCategories,
} from "@/app/actions/category";

import {
  ProductPage,
} from "@/components/products/product-page";

export default async function ProductsPage() {
  const [
    products,
    categories,
  ] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);

  /**
   * Prisma Decimal tidak dapat langsung
   * dikirim dari Server Component ke
   * Client Component.
   *
   * Convert Decimal menjadi number.
   */
  const serializedProducts =
    products.map((product) => ({
      id: product.id,
      organizationId:
        product.organizationId,
      categoryId:
        product.categoryId,
      code: product.code,
      name: product.name,
      description:
        product.description,
      unit: product.unit,

      purchasePrice:
        Number(product.purchasePrice),

      sellingPrice:
        Number(product.sellingPrice),

      status: product.status,

      createdAt:
        product.createdAt,

      updatedAt:
        product.updatedAt,

      category: product.category,
    }));

  return (
    <ProductPage
      products={serializedProducts}
      categories={categories}
    />
  );
}