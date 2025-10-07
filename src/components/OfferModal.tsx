"use client";

import React, { useState } from "react";
import { X, Package, DollarSign, Calendar, User, MapPin } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

interface OfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    id: string;
    name: string;
    price: number;
    unit: string;
    seller: {
      name: string;
      location: string;
    };
  };
}

export function OfferModal({ isOpen, onClose, product }: OfferModalProps) {
  const [offerData, setOfferData] = useState({
    offerPrice: "",
    quantity: "",
    deliveryDate: "",
    deliveryLocation: "",
    paymentTerms: "Cash on Delivery",
    additionalNotes: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/offers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: product.id,
          offerPrice: parseFloat(offerData.offerPrice),
          quantity: parseInt(offerData.quantity),
          deliveryDate: offerData.deliveryDate,
          deliveryLocation: offerData.deliveryLocation,
          paymentTerms: offerData.paymentTerms,
          additionalNotes: offerData.additionalNotes,
        }),
      });

      if (response.ok) {
        alert("Offer submitted successfully!");
        onClose();
        // Reset form
        setOfferData({
          offerPrice: "",
          quantity: "",
          deliveryDate: "",
          deliveryLocation: "",
          paymentTerms: "Cash on Delivery",
          additionalNotes: ""
        });
      } else {
        const data = await response.json();
        alert(data.message || "Failed to submit offer");
      }
    } catch (error) {
      alert("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setOfferData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="flex items-center">
            <Package className="h-5 w-5 mr-2 text-green-600" />
            Make an Offer
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent>
          {/* Product Info */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center">
                <DollarSign className="h-4 w-4 mr-2 text-gray-500" />
                <span>Current Price: {product.price} MMK / {product.unit}</span>
              </div>
              <div className="flex items-center">
                <User className="h-4 w-4 mr-2 text-gray-500" />
                <span>Seller: {product.seller.name}</span>
              </div>
              <div className="flex items-center col-span-2">
                <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                <span>Location: {product.seller.location}</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="offerPrice" className="block text-sm font-medium text-gray-700 mb-1">
                  Your Offer Price (MMK) *
                </label>
                <Input
                  type="number"
                  id="offerPrice"
                  name="offerPrice"
                  value={offerData.offerPrice}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  placeholder="Enter your offer"
                />
              </div>

              <div>
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity *
                </label>
                <Input
                  type="number"
                  id="quantity"
                  name="quantity"
                  value={offerData.quantity}
                  onChange={handleChange}
                  required
                  min="1"
                  placeholder="Enter quantity"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="deliveryDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Preferred Delivery Date
                </label>
                <Input
                  type="date"
                  id="deliveryDate"
                  name="deliveryDate"
                  value={offerData.deliveryDate}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div>
                <label htmlFor="paymentTerms" className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Terms
                </label>
                <select
                  id="paymentTerms"
                  name="paymentTerms"
                  value={offerData.paymentTerms}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="Cash on Delivery">Cash on Delivery</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Mobile Payment">Mobile Payment</option>
                  <option value="Credit">Credit</option>
                  <option value="Installments">Installments</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="deliveryLocation" className="block text-sm font-medium text-gray-700 mb-1">
                Delivery Location
              </label>
              <Input
                type="text"
                id="deliveryLocation"
                name="deliveryLocation"
                value={offerData.deliveryLocation}
                onChange={handleChange}
                placeholder="Enter delivery address"
              />
            </div>

            <div>
              <label htmlFor="additionalNotes" className="block text-sm font-medium text-gray-700 mb-1">
                Additional Notes
              </label>
              <textarea
                id="additionalNotes"
                name="additionalNotes"
                value={offerData.additionalNotes}
                onChange={handleChange}
                rows={3}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Any additional requirements or notes..."
              />
            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-green-600 hover:bg-green-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit Offer"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}