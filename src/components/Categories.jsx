import CategoryCard from "./CategoryCard";
import categories from "../data/categories";

function Categories() {
  return (
    <section className="categories">
      <h2>Shop by Category</h2>

      <div className="category-grid">
        {categories.map((category) => (
          <CategoryCard
            key={category.id}
            image={category.image}
            title={category.title}
          />
        ))}
      </div>
    </section>
  );
}

export default Categories;