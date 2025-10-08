"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AppHeader } from "@/components/AppHeader";
import { SellerStorefront } from "@/components/SellerStorefront";
import { ImageUpload } from "@/components/ImageUpload";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

export default function SellerStorefrontPage() {
  const [seller, setSeller] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const router = useRouter();
  const params = useParams();
  const sellerId = params.id as string;

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }

    loadSellerData();
  }, [sellerId]);

  const loadSellerData = async () => {
    try {
      const [sellerResponse, productsResponse] = await Promise.all([
        fetch(`/api/seller/${sellerId}`),
        fetch(`/api/products?sellerId=${sellerId}`)
      ]);

      if (sellerResponse.ok) {
        const sellerData = await sellerResponse.json();
        setSeller(sellerData.seller);
      }

      if (productsResponse.ok) {
        const productsData = await productsResponse.json();
        setProducts(productsData.products || []);
      }
    } catch (error) {
      console.error("Error loading seller data:", error);
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

  // Check if current user is the storefront owner
  const isOwnStorefront = user && seller && user.id === seller.id;

  // Preview mode toggle handler
  const handleTogglePreviewMode = (mode: boolean) => {
    setPreviewMode(mode);
  };

  // Handle storefront image upload
  const handleImageUpload = async (imageFile: File) => {
    setUploadingImage(true);
    try {
      // Convert image to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(imageFile);
      });

      // Update seller profile with new image
      const token = localStorage.getItem('token');
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          profileImage: base64
        })
      });

      if (response.ok) {
        const updatedUser = await response.json();
        // Update local state
        setSeller(prev => prev ? { ...prev, image: base64 } : null);
        setUser(prev => prev ? { ...prev, profileImage: base64 } : null);
        setShowImageUpload(false);
        alert('Storefront image updated successfully!');
      } else {
        const error = await response.json();
        alert(`Failed to update image: ${error.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploadingImage(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading storefront...</p>
        </div>
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Storefront not found</p>
          <Button onClick={() => router.push("/")} className="mt-4">
            Back to Marketplace
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader currentUser={user} onLogout={handleLogout} />
      
      <div className="max-w-5xl mx-auto px-4 py-8">
        <SellerStorefront
          seller={seller}
          products={products}
          onBack={() => router.push("/")}
          onViewProduct={(productId) => router.push(`/product/${productId}`)}
          onChat={(productId) => router.push(`/messages?productId=${productId}`)}
          onEditProduct={(productId) => router.push(`/product/${productId}/edit`)}
          isOwnStorefront={isOwnStorefront}
          onEditStorefrontImage={() => {
            setShowImageUpload(true);
          }}
          onUpdateStorefront={async (updates) => {
            // TODO: Implement storefront updates
            console.log('Update storefront:', updates);
          }}
          previewMode={previewMode}
          onTogglePreviewMode={handleTogglePreviewMode}
          currentUser={user}
        />
      </div>

      {/* Image Upload Modal */}
      <Dialog open={showImageUpload} onOpenChange={setShowImageUpload}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Storefront Image</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <ImageUpload
              onImageSelect={handleImageUpload}
              disabled={uploadingImage}
              currentImage={seller?.image}
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowImageUpload(false)}
              disabled={uploadingImage}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}