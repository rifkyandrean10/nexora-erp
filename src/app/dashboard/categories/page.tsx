import { getCategories } from "@/app/actions/category";
import { CategoryPage } from "@/components/categories/category-page";

export default async function CategoriesPage() {
  const categories =
    await getCategories();

  return (
    <CategoryPage
      categories={categories}
    />
  );
}