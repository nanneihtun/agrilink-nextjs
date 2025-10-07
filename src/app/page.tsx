"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { MarketplaceHero } from "@/components/MarketplaceHero";
import { SearchFilters } from "@/components/SearchFilters";
import { ProductCard } from "@/components/ProductCard";
import { ProductCardSkeleton } from "@/components/ProductCardSkeleton";
import { AppFooter } from "@/components/AppFooter";
import { Pagination } from "@/components/Pagination";

interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  unit: string;
  imageUrl?: string;
  seller: {
    id: string;
    name: string;
    userType: string;
    location: string;
    verified?: boolean;
    phoneVerified?: boolean;
    verificationStatus?: string;
    accountType?: string;
  };
  createdAt: string;
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const router = useRouter();

  useEffect(() => {
    // Start loading products immediately
    loadProducts();
    
    // Check for existing user session (non-blocking)
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    
    if (token && userData) {
      try {
        setCurrentUser(JSON.parse(userData));
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  const loadProducts = async () => {
    try {
      const response = await fetch("/api/products");
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
        setFilteredProducts(data.products || []);
      }
    } catch (error) {
      console.error("Error loading products:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setCurrentUser(null);
    router.push("/");
  };

  const handleBackToMarketplace = () => {
    router.push("/");
  };

  const handleGoToLogin = () => {
    router.push("/login");
  };

  const handleGoToRegister = () => {
    router.push("/register");
  };

  const handleGoToDashboard = () => {
    router.push("/dashboard");
  };

  const handleViewMessages = () => {
    router.push("/messages");
  };

  const handleViewProfile = () => {
    router.push("/profile");
  };

  const handleEditProfile = () => {
    router.push("/profile?edit=true");
  };

  const handleShowVerification = () => {
    router.push("/verify");
  };

  const handleViewStorefront = (sellerId: string) => {
    router.push(`/seller/${sellerId}`);
  };

  const handleShowAdminVerification = () => {
    router.push("/admin");
  };

  const handleUpdateUser = (updates: any) => {
    // This would typically update the user context
    console.log("Update user:", updates);
  };

  const handleFilterChange = useCallback((filteredProducts: Product[]) => {
    setFilteredProducts(filteredProducts);
    setCurrentPage(1); // Reset to first page when filters change
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader 
        currentUser={currentUser}
        onLogout={handleLogout}
      />
      
      <div className="max-w-5xl mx-auto px-4 py-8">
        <MarketplaceHero 
          currentUser={currentUser}
          allProducts={isLoading ? [] : products}
        />
        
        <SearchFilters 
          products={products}
          onFilterChange={handleFilterChange}
        />
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <ProductCardSkeleton key={index} />
            ))}
          </div>
        ) : (() => {
          // Calculate pagination
          const startIndex = (currentPage - 1) * itemsPerPage;
          const endIndex = startIndex + itemsPerPage;
          const currentProducts = filteredProducts.slice(startIndex, endIndex);

          return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                currentUser={currentUser}
                onProductClick={(productId) => router.push(`/product/${productId}`)}
                onSellerClick={(sellerId) => router.push(`/seller/${sellerId}`)}
                onChatClick={(sellerId) => router.push(`/messages?seller=${sellerId}`)}
                onOfferClick={(productId) => {
                  // Handle offer click
                  console.log("Make offer for product:", productId);
                }}
              />
              ))}
            </div>
          );
        })()}
        
        {filteredProducts.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <p className="text-gray-600">No products found matching your criteria.</p>
          </div>
        )}

        {/* Pagination */}
        {filteredProducts.length > 0 && (
          <div className="mt-8">
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(filteredProducts.length / itemsPerPage)}
              totalItems={filteredProducts.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={(newItemsPerPage) => {
                setItemsPerPage(newItemsPerPage);
                setCurrentPage(1); // Reset to first page when changing items per page
              }}
            />
          </div>
        )}
      </div>

      {/* Footer */}
      <AppFooter
        onShowAboutUs={() => router.push("/about")}
        onShowContactUs={() => router.push("/contact")}
        onShowFAQ={() => router.push("/faq")}
      />
    </div>
  );
}