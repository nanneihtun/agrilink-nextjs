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
    const loadUserProfile = async () => {
      const token = localStorage.getItem("token");
      const userData = localStorage.getItem("user");

      if (!token || !userData) {
        router.push("/login");
        return;
      }

      try {
        // First load from localStorage for immediate display
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);

        // Then fetch latest data from database to ensure we have the most recent profile image
        console.log('🔄 Fetching latest user profile from database...');
        const response = await fetch('/api/user/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const latestUserData = await response.json();
          console.log('✅ Latest user data fetched:', latestUserData);
          console.log('📊 Original localStorage user data:', parsedUser);
          
          // Merge data carefully - only update if the API data has actual values
          const updatedUser = { ...parsedUser };
          
          // Only update fields that have values in the API response
          if (latestUserData.user) {
            console.log('🔍 API response fields:', {
              location: latestUserData.user.location,
              phone: latestUserData.user.phone,
              hasLocation: !!latestUserData.user.location,
              hasPhone: !!latestUserData.user.phone
            });
            
            // Only update these fields from API if they have actual values
            if (latestUserData.user.location && latestUserData.user.location.trim() !== '') {
              updatedUser.location = latestUserData.user.location;
            }
            if (latestUserData.user.phone && latestUserData.user.phone.trim() !== '') {
              updatedUser.phone = latestUserData.user.phone;
            }
            updatedUser.profileImage = latestUserData.user.profileImage;
            updatedUser.name = latestUserData.user.name;
            updatedUser.email = latestUserData.user.email;
            updatedUser.verified = latestUserData.user.verified;
            updatedUser.phoneVerified = latestUserData.user.phoneVerified;
            updatedUser.businessName = latestUserData.user.businessName;
            updatedUser.businessDescription = latestUserData.user.businessDescription;
            updatedUser.verificationStatus = latestUserData.user.verificationStatus;
          }
          
          console.log('🔄 Final merged user data:', updatedUser);
          localStorage.setItem("user", JSON.stringify(updatedUser));
          setUser(updatedUser);
        } else {
          console.log('⚠️ Could not fetch latest user data, using localStorage data');
        }
      } catch (error) {
        console.error("Error loading user profile:", error);
        // If API call fails, still use localStorage data
      } finally {
        setIsLoading(false);
      }
    };

    loadUserProfile();
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
      console.log('🔄 Updating user profile:', updates);
      
      // Make API call to save to database
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }

      const result = await response.json();
      console.log('✅ Profile updated successfully:', result);

      // Update user data in localStorage
      const updatedUser = { ...user, ...updates };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      
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
