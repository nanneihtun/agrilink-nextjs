"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Profile } from "@/components/Profile";
import { AppHeader } from "@/components/AppHeader";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

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
    } catch (error) {
      console.error("Error parsing user data:", error);
      router.push("/login");
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const handleBack = () => {
    router.push("/dashboard");
  };

  const handleEditProfile = () => {
    router.push("/profile?edit=true");
  };

  const handleShowVerification = (initialStep?: number) => {
    router.push("/verify");
  };

  const handleUpdate = async (updates: any) => {
    try {
      // Update user data in localStorage
      const updatedUser = { ...user, ...updates };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      // Here you would typically make an API call to update the user in the database
      // For now, we'll just update the local state
      console.log("User updated:", updates);
    } catch (error) {
      console.error("Failed to update user:", error);
      throw error;
    }
  };

  const handleViewStorefront = (sellerId: string) => {
    router.push(`/seller/${sellerId}`);
  };

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
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader 
        currentUser={user} 
        onLogout={handleLogout}
        onViewProfile={() => {}} // Already on profile page
        onEditProfile={handleEditProfile}
        onShowVerification={handleShowVerification}
        onViewStorefront={handleViewStorefront}
      />

      <div className="max-w-5xl mx-auto px-4 py-8">
        <Profile
          user={user}
          onBack={handleBack}
          onEditProfile={handleEditProfile}
          onShowVerification={handleShowVerification}
          onUpdate={handleUpdate}
          onViewStorefront={handleViewStorefront}
        />
      </div>
    </div>
  );
}
