"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AppHeader } from "@/components/AppHeader";
import { UserProfile } from "@/components/UserProfile";
import { SellerStorefront } from "@/components/SellerStorefront";

interface UserProfileData {
  id: string;
  name: string;
  userType: string;
  accountType: string;
  joinedDate: string;
  location: string;
  profileImage?: string;
  experience?: string;
  phone?: string;
  website?: string;
  businessName?: string;
  businessDescription?: string;
  businessHours?: string;
  specialties?: string[];
  policies?: {
    returns?: string;
    delivery?: string;
    payment?: string;
  };
  social?: {
    facebook?: string;
    instagram?: string;
    telegram?: string;
    whatsapp?: string;
    tiktok?: string;
  };
  verification?: {
    verified: boolean;
    phoneVerified: boolean;
    verificationStatus: string;
  };
  ratings?: {
    rating: number;
    totalReviews: number;
    responseTime?: string;
    qualityCertifications?: string[];
    farmingMethods?: string[];
  };
  products?: any[];
  reviews?: any[];
}

export default function UserProfilePage() {
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setCurrentUser(parsedUser);
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }

    loadUserProfile();
  }, [userId]);

  const loadUserProfile = async () => {
    try {
      const response = await fetch(`/api/user/${userId}/public`);
      if (response.ok) {
        const data = await response.json();
        setUserProfile(data.user);
        
        // For sellers, also load their products
        if (data.user.userType === 'farmer' || data.user.userType === 'trader') {
          const productsResponse = await fetch(`/api/products?sellerId=${userId}`);
          if (productsResponse.ok) {
            const productsData = await productsResponse.json();
            setUserProfile(prev => ({
              ...prev,
              products: productsData.products || []
            }));
          }
        }
      } else {
        console.error("Failed to load user profile");
        router.push("/");
      }
    } catch (error) {
      console.error("Error loading user profile:", error);
      router.push("/");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/");
  };

  // Preview mode toggle handler
  const handleTogglePreviewMode = (mode: boolean) => {
    setPreviewMode(mode);
  };

  // Handle profile updates
  const handleUpdateProfile = async (updates: any) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });

      if (response.ok) {
        const updatedUser = await response.json();
        // Update local state
        setUserProfile(prev => prev ? { ...prev, ...updates } : null);
        setCurrentUser(prev => prev ? { ...prev, ...updates } : null);
        alert('Profile updated successfully!');
      } else {
        const error = await response.json();
        alert(`Failed to update profile: ${error.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    }
  };


  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading user profile...</p>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">User profile not found</p>
          <Button onClick={() => router.push("/")} className="mt-4">
            Back to Marketplace
          </Button>
        </div>
      </div>
    );
  }

  const isOwnProfile = currentUser && currentUser.id === userProfile.id;

  const isSeller = userProfile.userType === 'farmer' || userProfile.userType === 'trader';

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader currentUser={currentUser} onLogout={handleLogout} />
      
      {isSeller ? (
        <SellerStorefront
          seller={{
            id: userProfile.id,
            name: userProfile.name,
            type: userProfile.userType,
            accountType: userProfile.accountType,
            location: userProfile.location || '',
            description: userProfile.experience || '',
            image: userProfile.profileImage || '',
            rating: userProfile.ratings?.rating || 0,
            totalReviews: userProfile.ratings?.totalReviews || 0,
            yearsActive: 0,
            responseTime: userProfile.ratings?.responseTime || '',
            certifications: userProfile.ratings?.qualityCertifications || [],
            joinedDate: userProfile.joinedDate,
            verified: userProfile.verification?.verified || false
          }}
          products={userProfile.products || []}
          onBack={() => router.push("/")}
          onViewProduct={(productId) => router.push(`/product/${productId}`)}
          onChat={(productId) => router.push(`/messages?productId=${productId}`)}
          onEditProduct={(productId) => router.push(`/product/${productId}/edit`)}
          isOwnStorefront={isOwnProfile}
          onEditStorefrontImage={() => {
            // TODO: Implement image editing
            console.log('Edit storefront image');
          }}
          onUpdateStorefront={async (updates) => {
            // TODO: Implement storefront updates
            console.log('Update storefront:', updates);
          }}
          previewMode={false}
          onTogglePreviewMode={(mode) => {
            // TODO: Implement preview mode
            console.log('Toggle preview mode:', mode);
          }}
          currentUser={currentUser}
        />
      ) : (
        <UserProfile
          userProfile={userProfile}
          currentUser={currentUser}
          onBack={() => router.push("/")}
          isOwnProfile={isOwnProfile}
          previewMode={previewMode}
          onTogglePreviewMode={handleTogglePreviewMode}
          onUpdateProfile={handleUpdateProfile}
        />
      )}
    </div>
  );
}
