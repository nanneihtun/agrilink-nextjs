"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { SimplifiedProductForm } from "@/components/SimplifiedProductForm";
import { useAuth } from "@/hooks/useAuth";

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  category: string;
  image?: string;
  images?: string[];
  location: string;
  sellerId: string;
  sellerName: string;
  sellerType: string;
  quantity?: string;
  minimumOrder?: string;
  availableQuantity?: string;
  deliveryOptions?: string[];
  paymentTerms?: string[];
  lastUpdated?: string;
  additionalNotes?: string;
  priceChange?: string;
}

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const productId = params.id as string;

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products/${productId}`);

        if (!response.ok) {
          throw new Error('Failed to fetch product');
        }

        const data = await response.json();
        setProduct(data.product);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const handleSave = async (productData: any) => {
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
        },
        body: JSON.stringify(productData)
      });

      if (!response.ok) {
        throw new Error('Failed to update product');
      }

      // Redirect back to the product details page
      router.push(`/product/${productId}`);
    } catch (err) {
      console.error('Error updating product:', err);
      alert('Failed to update product. Please try again.');
    }
  };

  const handleBack = () => {
    router.push(`/product/${productId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AppHeader />
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-pulse">Loading product...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AppHeader />
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="text-red-600">{error}</div>
            <button 
              onClick={() => router.push('/dashboard')}
              className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AppHeader />
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="text-gray-600">Product not found</div>
            <button 
              onClick={() => router.push('/dashboard')}
              className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <SimplifiedProductForm
          currentUser={currentUser || { id: 'temp', name: 'User', location: 'Myanmar' }}
          onBack={handleBack}
          onSave={handleSave}
          editingProduct={product}
        />
      </div>
    </div>
  );
}
