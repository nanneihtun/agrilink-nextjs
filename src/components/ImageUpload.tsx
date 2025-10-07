"use client";

import React, { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";

interface ImageUploadProps {
  onImageUpload: (imageUrl: string) => void;
  currentImage?: string;
  className?: string;
}

export function ImageUpload({ onImageUpload, currentImage, className = "" }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB');
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // Upload file
      uploadFile(file);
    }
  };

  const uploadFile = async (file: File) => {
    setIsUploading(true);

    try {
      // In a real app, you would upload to Cloudinary, AWS S3, or similar
      // For now, we'll simulate the upload and return a placeholder URL
      
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate a mock URL (in production, this would be the actual uploaded image URL)
      const mockImageUrl = `/api/placeholder/400/300`;
      
      onImageUpload(mockImageUrl);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
      setPreview(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onImageUpload("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={className}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*"
        className="hidden"
        id="image-upload"
        name="image-upload"
      />
      
      {preview ? (
        <Card className="relative">
          <CardContent className="p-0">
            <div className="relative">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-48 object-cover rounded-lg"
              />
              <div className="absolute top-2 right-2 flex space-x-2">
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleRemove}
                  disabled={isUploading}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
              {isUploading && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                  <div className="text-center text-white">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                    <p className="text-sm">Uploading...</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card 
          className="border-2 border-dashed border-gray-300 hover:border-gray-400 cursor-pointer transition-colors"
          onClick={handleClick}
        >
          <CardContent className="p-8 text-center">
            {isUploading ? (
              <div>
                <Loader2 className="h-12 w-12 text-gray-400 mx-auto mb-4 animate-spin" />
                <p className="text-gray-600">Uploading image...</p>
              </div>
            ) : (
              <div>
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">Click to upload an image</p>
                <p className="text-sm text-gray-500">PNG, JPG, GIF up to 5MB</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
