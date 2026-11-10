function CategoryCard({ image, title }) {
  return (
    <div className="category-card">
      <img src={image} alt={title} className="category-image" />
      <h3>{title}</h3>
    </div>
  );
}

export default CategoryCard;