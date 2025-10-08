"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { SimplifiedProductForm } from "@/components/SimplifiedProductForm";
import { useAuth } from "@/hooks/useAuth";

export default function NewProductPage() {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem("token") || localStorage.getItem("auth-token");
    const userData = localStorage.getItem("user");
    
    if (!token || !userData) {
      router.push("/login");
      return;
    }
    
    setLoading(false);
  }, [currentUser, router]);

  const handleSave = async (productData: any) => {
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("auth-token");
      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(productData),
      });

      if (!response.ok) {
        throw new Error("Failed to create product");
      }

      // Redirect back to dashboard
      router.push("/dashboard");
    } catch (err) {
      console.error("Error creating product:", err);
      alert("Failed to create product. Please try again.");
    }
  };

  const handleBack = () => {
    router.push("/dashboard");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-pulse">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  // Check if user is authenticated via localStorage (fallback)
  const token = localStorage.getItem("token") || localStorage.getItem("auth-token");
  const userData = localStorage.getItem("user");
  
  if (!currentUser && (!token || !userData)) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="text-muted-foreground">Please log in to create a product</div>
            <button 
              onClick={() => router.push("/login")}
              className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Get user data from localStorage if currentUser is not available
  let userForForm = currentUser;
  if (!userForForm && userData) {
    try {
      userForForm = JSON.parse(userData);
    } catch (error) {
      console.error("Error parsing user data:", error);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <SimplifiedProductForm
          currentUser={userForForm || { id: 'temp', name: 'User', location: 'Myanmar' }}
          onBack={handleBack}
          onSave={handleSave}
          editingProduct={null}
        />
      </div>
    </div>
  );
}