import { Badge } from "./ui/badge";
import { UserBadge, getUserVerificationLevel, getUserAccountType, VERIFICATION_LEVELS } from "./UserBadgeSystem";
import { myanmarRegions } from "../utils/regions";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useState, useRef, useEffect } from "react";
import { 
  User, 
  MapPin, 
  Phone, 
  Store, 
  Shield, 
  Mail,
  Calendar,
  Star,
  CheckCircle,
  AlertCircle,
  ChevronLeft,
  Edit,
  Save,
  X,
  Camera,
  Trash2,
  Clock,
} from "lucide-react";
import { formatMemberSinceDate } from "../utils/dates";
import { AddressManagement } from "./AddressManagement";

interface ProfileProps {
  user: any;
  onBack: () => void;
  onEditProfile: () => void;
  onShowVerification: (initialStep?: number) => void;
  onUpdate?: (updates: any) => Promise<void>;
  onViewStorefront?: (sellerId: string) => void;
}

interface EditingField {
  field: string;
  value: string;
}

export function Profile({ user, onBack, onEditProfile, onShowVerification, onUpdate, onViewStorefront }: ProfileProps) {
  if (!user) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="text-center py-8">
          <p className="text-muted-foreground">User data not available</p>
          <Button onClick={onBack} className="mt-4">Go Back</Button>
        </div>
      </div>
    );
  }

  const [editing, setEditing] = useState<EditingField | null>(null);
  const [editingImage, setEditingImage] = useState(false);
  const [formData, setFormData] = useState(() => {
    return {
      name: user.name || '',
      phone: user.phone || '',
      location: user.location || '',
      profileImage: user.profileImage || '',
      region: user.region || '',
      businessName: user.businessName || '',
    };
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSave = async (field: string, value: string) => {
    try {
      setFormData(prev => ({ ...prev, [field]: value }));
      setEditing(null);
      
      if (onUpdate) {
        await onUpdate({ [field]: value });
      }
    } catch (error) {
      console.error('Failed to save:', error);
      setFormData(prev => ({ ...prev, [field]: formData[field] }));
    }
  };

  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file');
      return;
    }
    
    if (file.size > 10 * 1024 * 1024) {
      alert('Image size must be less than 10MB');
      return;
    }

    try {
      setEditingImage(false);
      
      const reader = new FileReader();
      const dataUrl = await new Promise<string>((resolve) => {
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
      
      if (onUpdate) {
        await onUpdate({ profileImage: dataUrl });
        setFormData(prev => ({ ...prev, profileImage: dataUrl }));
      }
    } catch (error) {
      console.error('Failed to process image:', error);
      alert('Failed to process image. Please try a different image.');
    }
  };

  const startEditing = (field: string, currentValue: string) => {
    setEditing({ field, value: currentValue });
  };

  const cancelEditing = () => {
    setEditing(null);
    setEditingImage(false);
  };

  const getAvailableCities = () => {
    if (!formData.region) return [];
    const region = myanmarRegions[formData.region];
    return region ? region.cities : [];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4 mb-8">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={onBack} className="h-9 px-3 -ml-3">
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>
        
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">My Profile</h1>
          <p className="text-muted-foreground">View and manage your account information</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile Overview */}
        <div className="lg:col-span-1">
          <Card className="overflow-hidden border-primary/30">
            <CardHeader className="text-center pb-6">
              {/* Profile Picture */}
              <div className="flex justify-center mb-6">
                <div className="relative group">
                  {formData.profileImage ? (
                    <ImageWithFallback
                      src={formData.profileImage}
                      alt={`${formData.name}'s profile picture`}
                      className="w-28 h-28 rounded-full object-cover border-4 border-border shadow-lg"
                    />
                  ) : (
                    <div className="w-28 h-28 rounded-full border-4 border-border shadow-lg bg-muted flex items-center justify-center">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                        <User className="w-6 h-6 text-primary" />
                      </div>
                    </div>
                  )}
                  
                  <div 
                    className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    onClick={() => setEditingImage(true)}
                  >
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                  
                  {user.verified && (
                    <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center border-2 border-card">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                  )}
                </div>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                id="profile-image-upload"
                name="profile-image-upload"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageUpload(file);
                }}
                className="hidden"
              />
              
              {editingImage && (
                <div className="mb-4 p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-3">Update your profile picture</p>
                  <div className="flex gap-2 justify-center flex-wrap">
                    <Button size="sm" onClick={() => fileInputRef.current?.click()}>
                      <Camera className="w-4 h-4 mr-2" />
                      Choose Photo
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setEditingImage(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
              
              {/* Name and Type */}
              <div className="space-y-3 mb-6">
                {editing?.field === 'name' ? (
                  <div className="space-y-2">
                    <Input
                      value={editing.value}
                      onChange={(e) => setEditing({ ...editing, value: e.target.value })}
                      className="text-center text-xl font-bold"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSave('name', editing.value);
                        if (e.key === 'Escape') cancelEditing();
                      }}
                    />
                    <div className="flex justify-center gap-2">
                      <Button size="sm" onClick={() => handleSave('name', editing.value)}>
                        <Save className="w-4 h-4 mr-1" />
                        Save
                      </Button>
                      <Button size="sm" variant="outline" onClick={cancelEditing}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <CardTitle className="text-2xl font-bold">
                      {formData.name}
                    </CardTitle>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => startEditing('name', formData.name)}
                      className="h-8 w-8 p-0 opacity-60 hover:opacity-100"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                )}
                <div className="flex justify-center gap-2 flex-wrap">
                  <UserBadge 
                    userType={user.userType}
                    accountType={getUserAccountType(user)}
                    verificationLevel={getUserVerificationLevel(user)}
                    size="md"
                  />
                </div>
              </div>
              
              {/* Verification Actions */}
              {user.userType !== 'admin' && (() => {
                const verificationLevel = getUserVerificationLevel(user);
                const verificationConfig = VERIFICATION_LEVELS[verificationLevel] || VERIFICATION_LEVELS.unverified;
                
                return (
                  <div className="space-y-3">
                    <Button 
                      variant="outline" 
                      className={`w-full h-11 font-medium ${verificationConfig.borderColor} ${verificationConfig.color} hover:${verificationConfig.bgColor}`}
                      onClick={() => onShowVerification(1)}
                    >
                      <Shield className={`w-4 h-4 mr-2 ${verificationConfig.color}`} />
                      View Verification Details
                    </Button>
                  </div>
                );
              })()}
            </CardHeader>
          </Card>

          {/* Quick Stats */}
          <Card className="mt-6 border-primary/30">
            <CardHeader>
              <CardTitle className="text-lg">Account Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Member Since</span>
                </div>
                <span className="text-sm font-medium">{formatMemberSinceDate(user.joinedDate)}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Rating</span>
                </div>
                <span className="text-sm font-medium">
                  {user.rating > 0 ? `${user.rating}/5 (${user.totalReviews} reviews)` : 'No ratings yet'}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Information */}
          <Card className="border-primary/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6 md:gap-x-10 md:gap-y-8">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    Email Address
                  </div>
                  <p className="font-medium">{user.email}</p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="w-4 h-4" />
                    Phone Number
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium flex-1">
                      {formData.phone || 'Add phone number'}
                    </p>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onShowVerification(3)}
                      className="h-8 w-8 p-0 opacity-60 hover:opacity-100"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                  {user.phoneVerified && (
                    <Badge variant="outline" className="text-xs text-green-600 border-green-200">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  )}
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    Location
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium flex-1">
                      {formData.location || 'Add location'}
                    </p>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => startEditing('location', formData.location)}
                      className="h-8 w-8 p-0 opacity-60 hover:opacity-100"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Address Management */}
          <AddressManagement userId={user.id} />

          {/* Storefront Management */}
          {(user.userType === 'farmer' || user.userType === 'trader') && (
            <Card className="border-primary/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Store className="w-5 h-5" />
                  Business Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-muted/50 rounded-lg p-4 text-center space-y-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <Store className="w-6 h-6 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">Manage Your Storefront</h4>
                    <p className="text-sm text-muted-foreground">
                      Set up your business description, product categories, and customer information in your dedicated storefront.
                    </p>
                  </div>
                  <Button 
                    onClick={() => {
                      if (onViewStorefront && user?.id) {
                        onViewStorefront(user.id);
                      }
                    }}
                    className="w-full"
                  >
                    View My Storefront
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}