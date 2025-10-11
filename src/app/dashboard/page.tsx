"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  User as UserIcon, 
  Package, 
  MessageCircle, 
  Settings, 
  LogOut, 
  Plus,
  CheckCircle,
  Clock,
  AlertCircle,
  Store,
  ShoppingCart,
  Shield
} from "lucide-react";
import { FreshDashboard } from "@/components/FreshDashboard";
import { BuyerDashboard } from "@/components/BuyerDashboard";
import { AppHeader } from "@/components/AppHeader";
import { User } from "@/hooks/useAuth";

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [userProducts, setUserProducts] = useState<any[]>([]);
  const [savedProducts, setSavedProducts] = useState<any[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const fetchUserProducts = async (userId: string) => {
    try {
      const response = await fetch(`/api/products?sellerId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setUserProducts(data.products || []);
      }
    } catch (error) {
      console.error("Error fetching user products:", error);
    }
  };

  const fetchSavedProducts = async (userId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/user/saved-products?userId=${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setSavedProducts(data.savedProducts || []);
      }
    } catch (error) {
      console.error("Error fetching saved products:", error);
    }
  };

  const fetchAllProducts = async () => {
    try {
      const response = await fetch("/api/products");
      if (response.ok) {
        const data = await response.json();
        setAllProducts(data.products || []);
      }
    } catch (error) {
      console.error("Error fetching all products:", error);
    }
  };

  const refreshUserData = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch("/api/user/profile", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const updatedUser = data.user;
        
        // Update localStorage with fresh data
        localStorage.setItem("user", JSON.stringify(updatedUser));
        
        // Update component state
        setUser(updatedUser);
        
        console.log("✅ Dashboard: User data refreshed from API");
      }
    } catch (error) {
      console.error("Error refreshing user data:", error);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      router.push("/login");
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      
      // Fetch data based on user type
      if (parsedUser.id) {
        if (parsedUser.userType === 'buyer') {
          fetchSavedProducts(parsedUser.id);
          fetchAllProducts();
        } else {
          fetchUserProducts(parsedUser.id);
        }
      }
    } catch (error) {
      console.error("Error parsing user data:", error);
      router.push("/login");
    } finally {
      setIsLoading(false);
    }

    // Refresh user data when page becomes visible (user navigates back from verification)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        refreshUserData();
      }
    };

    const handleFocus = () => {
      refreshUserData();
    };

    // Listen for page focus and visibility changes
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Also refresh user data on mount to ensure we have the latest data
    refreshUserData();

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const getVerificationStatus = () => {
    if (user.verified && user.phoneVerified) {
      return { status: "verified", color: "bg-green-100 text-green-800", icon: CheckCircle };
    } else if (user.verificationStatus === "under_review") {
      return { status: "under_review", color: "bg-blue-100 text-blue-800", icon: Clock };
    } else {
      return { status: "unverified", color: "bg-red-100 text-red-800", icon: AlertCircle };
    }
  };

  const verificationInfo = getVerificationStatus();
  const VerificationIcon = verificationInfo.icon;

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader currentUser={user} onLogout={handleLogout} />
      
      <div className="max-w-5xl mx-auto px-4 py-8">
        {user.userType === 'buyer' ? (
          <BuyerDashboard
            user={user as any}
            allProducts={allProducts}
            savedProducts={savedProducts}
            onGoToMarketplace={() => router.push("/")}
            onViewProduct={(productId) => router.push(`/product/${productId}`)}
            onStartChat={(productId, sellerId) => {
              // Handle chat functionality
              console.log("Start chat:", productId, sellerId);
            }}
            onViewMessages={() => router.push("/messages")}
            onShowVerification={() => router.push("/verify")}
          />
        ) : (
          <FreshDashboard
            user={user}
            userProducts={userProducts}
            onAddListing={() => router.push("/products/new")}
            onEditListing={(product) => router.push(`/product/${product.id}/edit`)}
            onDeleteListing={(productId) => {
              // Handle delete
              console.log("Delete product:", productId);
            }}
            onViewStorefront={() => router.push(`/seller/${user.id}`)}
            onGoToMarketplace={() => router.push("/")}
            onViewProduct={(productId) => router.push(`/product/${productId}`)}
            onShowVerification={() => router.push("/verify")}
            onViewMessages={() => router.push("/messages")}
          />
        )}
      </div>
    </div>
  );
}