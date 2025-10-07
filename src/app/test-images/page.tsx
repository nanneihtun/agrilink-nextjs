"use client";

import { useState, useEffect } from "react";

export default function TestImagesPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await fetch('/api/products?sellerId=af8f9dd9-eefa-4f73-b3c0-b6e1ba814afe');
        const data = await response.json();
        console.log('Products loaded:', data.products.length);
        setProducts(data.products || []);
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  if (loading) {
    return <div className="p-8">Loading products...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test Product Images</h1>
      <div className="grid grid-cols-2 gap-4">
        {products.map((product) => (
          <div key={product.id} className="border p-4 rounded">
            <h3 className="font-bold">{product.name}</h3>
            <p>Price: {product.price} MMK per {product.unit}</p>
            <p>Image URL length: {product.imageUrl?.length || 0} characters</p>
            <p>Image starts with: {product.imageUrl?.substring(0, 50)}...</p>
            <img 
              src={product.imageUrl} 
              alt={product.name}
              className="w-32 h-32 object-cover mt-2 border"
              onLoad={() => console.log('Image loaded:', product.name)}
              onError={(e) => console.error('Image error:', product.name, e)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
