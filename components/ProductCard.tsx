
import { Product } from "@prisma/client";

interface ProductCardProps {
  product: Product;
}

function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="surface-elevated overflow-hidden p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_28px_45px_-34px_var(--foreground)]">
      <img
        src={product.image}
        alt={product.product_name}
        className="h-44 w-full rounded-xl object-cover"
      />

      <div className="mt-3">
        <h3 className="font-semibold text-foreground">{product.product_name}</h3>
        <p className="text-sm text-muted-foreground">
          {product.product_detail}
        </p>

        <div className="mt-2 font-bold text-primary">
          {product.price} ETB
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
