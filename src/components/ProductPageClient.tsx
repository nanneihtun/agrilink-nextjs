"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, MessageCircle, CheckCircle, ArrowLeft, Package, User, Calendar } from "lucide-react";
import Link from "next/link";
import { OfferModal } from "./OfferModal";

interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  unit: string;
  createdAt: string;
  seller: {
    id: string;
    name: string;
    userType: string;
    location: string;
    verified: boolean;
    phoneVerified: boolean;
    verificationStatus: string;
    rating: number;
    totalReviews: number;
  };
}

interface ProductPageClientProps {
  product: Product;
}

export function ProductPageClient({ product }: ProductPageClientProps) {
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link href="/">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Marketplace
                </Button>
              </Link>
              <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">🌱</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">AgriLink</h1>
                <p className="text-sm text-gray-600">Agricultural Marketplace</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline">Login</Button>
              <Button className="bg-green-600 hover:bg-green-700">Register</Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Details */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl">{product.name}</CardTitle>
                <Badge variant="secondary">{product.category}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-2">Description</h3>
                <p className="text-gray-600">{product.description}</p>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Price</p>
                  <p className="text-3xl font-bold text-green-700">
                    {product.price} MMK
                  </p>
                  <p className="text-sm text-gray-500">per {product.unit}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Posted</p>
                  <p className="text-sm text-gray-500">
                    {new Date(product.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex space-x-4">
                <Button 
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    // Handle chat functionality
                    alert("Chat functionality will be implemented");
                  }}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Chat with Seller
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setIsOfferModalOpen(true)}
                >
                  <Package className="h-4 w-4 mr-2" />
                  Make Offer
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Seller Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Seller Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{product.seller.name}</h3>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">{product.seller.userType}</Badge>
                    {product.seller.verified && (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center text-gray-600">
                <MapPin className="h-4 w-4 mr-2" />
                <span>{product.seller.location}</span>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Rating: {product.seller.rating || 0}/5</span>
                <span>{product.seller.totalReviews || 0} reviews</span>
              </div>

              <div className="pt-4 border-t">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Start Conversation
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <OfferModal
        isOpen={isOfferModalOpen}
        onClose={() => setIsOfferModalOpen(false)}
        product={{
          id: product.id,
          name: product.name,
          price: product.price,
          unit: product.unit,
          seller: {
            name: product.seller.name,
            location: product.seller.location,
          },
        }}
      />
    </div>
  );
}
