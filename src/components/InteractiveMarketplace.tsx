"use client";

import React, { useState, useMemo } from "react";
import { SimpleProductCard } from "./SimpleProductCard";
import { SimpleSearch } from "./SimpleSearch";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";

interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  unit: string;
  seller: {
    name: string;
    userType: string;
    location: string;
    verified?: boolean;
  };
}

interface InteractiveMarketplaceProps {
  initialProducts: Product[];
}

export function InteractiveMarketplace({ initialProducts }: InteractiveMarketplaceProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    category: "",
    location: ""
  });
  const [sortBy, setSortBy] = useState("newest");

  // Filter and search products
  const filteredProducts = useMemo(() => {
    let filtered = products;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.seller.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    if (filters.category) {
      filtered = filtered.filter(product => product.category === filters.category);
    }

    // Apply location filter
    if (filters.location) {
      filtered = filtered.filter(product => 
        product.seller.location.includes(filters.location)
      );
    }

    // Apply sorting
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "name":
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default: // newest
        filtered.sort((a, b) => new Date(b.createdAt || "").getTime() - new Date(a.createdAt || "").getTime());
    }

    return filtered;
  }, [products, searchTerm, filters, sortBy]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handleFilter = (newFilters: any) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleSort = (newSortBy: string) => {
    setSortBy(newSortBy);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilters({ category: "", location: "" });
    setSortBy("newest");
  };

  return (
    <div>
      {/* Search and Filters */}
      <SimpleSearch onSearch={handleSearch} onFilter={handleFilter} />

      {/* Sort and Clear Filters */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">Sort by:</span>
          <select 
            value={sortBy}
            onChange={(e) => handleSort(e.target.value)}
            className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="newest">Newest First</option>
            <option value="price-low">Price: Low to High</option>
            <option value="price-high">Price: High to Low</option>
            <option value="name">Name A-Z</option>
          </select>
        </div>
        
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">
            {filteredProducts.length} of {products.length} products
          </span>
          {(searchTerm || filters.category || filters.location) && (
            <Button variant="outline" size="sm" onClick={clearFilters}>
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      {/* Active Filters Display */}
      {(searchTerm || filters.category || filters.location) && (
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700">Active filters:</span>
              {searchTerm && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  Search: "{searchTerm}"
                </span>
              )}
              {filters.category && (
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                  Category: {filters.category}
                </span>
              )}
              {filters.location && (
                <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                  Location: {filters.location}
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <SimpleProductCard key={product.id} product={product} />
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <div className="bg-white p-8 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No products found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || filters.category || filters.location 
                  ? "Try adjusting your search or filters"
                  : "No products available at the moment"
                }
              </p>
              {(searchTerm || filters.category || filters.location) && (
                <Button onClick={clearFilters} className="bg-green-600 hover:bg-green-700">
                  Clear All Filters
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="mt-12 text-center">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
          <div className="flex flex-wrap justify-center gap-4">
            <Button 
              onClick={() => handleFilter({ category: "Vegetables" })}
              variant="outline"
              className="hover:bg-green-50"
            >
              🥬 Browse Vegetables
            </Button>
            <Button 
              onClick={() => handleFilter({ category: "Fruits" })}
              variant="outline"
              className="hover:bg-green-50"
            >
              🍎 Browse Fruits
            </Button>
            <Button 
              onClick={() => handleFilter({ category: "Rice & Grains" })}
              variant="outline"
              className="hover:bg-green-50"
            >
              🌾 Browse Rice & Grains
            </Button>
            <Button 
              onClick={() => handleFilter({ location: "Yangon Region" })}
              variant="outline"
              className="hover:bg-green-50"
            >
              📍 Yangon Products
            </Button>
            <Button 
              onClick={() => handleFilter({ location: "Mandalay Region" })}
              variant="outline"
              className="hover:bg-green-50"
            >
              📍 Mandalay Products
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
