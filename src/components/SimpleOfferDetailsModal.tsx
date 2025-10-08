"use client";

import React from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Label } from "./ui/label";
import { 
  Package, 
  DollarSign, 
  Truck, 
  Calendar, 
  MapPin,
  Home,
  Building,
  CreditCard,
  Banknote,
  Smartphone,
  User,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Settings
} from "lucide-react";
import { OfferStatusManager } from "./OfferStatusManager";

interface SimpleOfferDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  offer: {
    id: string;
    productName?: string;
    productImage?: string;
    offerPrice: number;
    quantity: number;
    message?: string;
    status: string;
    deliveryAddress?: any;
    deliveryOptions: string[];
    paymentTerms: string[];
    expiresAt?: string;
    createdAt: string;
    statusUpdatedAt?: string;
    shippedAt?: string;
    receivedAt?: string;
    completedAt?: string;
    cancelledAt?: string;
    cancelledBy?: string;
    cancellationReason?: string;
    product?: {
      id: string;
      name: string;
      category?: string;
    };
    buyer?: {
      id: string;
      name: string;
      userType: string;
      accountType: string;
    };
    seller?: {
      id: string;
      name: string;
      userType: string;
      accountType: string;
    };
  } | null;
  isFromCurrentUser: boolean;
  currentUserId?: string;
  onStatusUpdate?: (offerId: string, newStatus: string, reason?: string) => Promise<void>;
}

export function SimpleOfferDetailsModal({ 
  isOpen, 
  onClose, 
  offer,
  isFromCurrentUser,
  currentUserId,
  onStatusUpdate
}: SimpleOfferDetailsModalProps) {
  if (!offer) return null;

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US').format(price);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'accepted': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'expired': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-3 h-3" />;
      case 'accepted': return <CheckCircle className="w-3 h-3" />;
      case 'rejected': return <XCircle className="w-3 h-3" />;
      case 'expired': return <AlertCircle className="w-3 h-3" />;
      default: return <Clock className="w-3 h-3" />;
    }
  };

  const formatStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const isExpired = offer.expiresAt && new Date(offer.expiresAt) < new Date();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            Offer Details
          </DialogTitle>
          <DialogDescription>
            {isFromCurrentUser ? 'Your offer' : 'Received offer'} for {offer.productName || offer.product?.name || 'Product'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Product Information */}
          <Card className="border-primary/30">
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                {offer.productImage ? (
                  <img 
                    src={offer.productImage} 
                    alt={offer.productName || offer.product?.name || 'Product'}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Package className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{offer.productName || offer.product?.name || 'Unknown Product'}</h3>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      <span className="font-medium text-green-600">
                        {formatPrice(offer.offerPrice)} MMK
                      </span>
                      <span className="text-sm text-muted-foreground">per unit</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Package className="w-4 h-4 text-blue-600" />
                      <span className="font-medium">{offer.quantity}</span>
                      <span className="text-sm text-muted-foreground">units</span>
                    </div>
                  </div>
                </div>
                <Badge className={`${getStatusColor(offer.status)} flex items-center gap-1`}>
                  {getStatusIcon(offer.status)}
                  <span>{formatStatus(offer.status)}</span>
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Parties Information */}
          <Card className="border-primary/30">
            <CardContent className="p-4">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <User className="w-4 h-4" />
                Parties
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Buyer</Label>
                  <p className="font-medium">{offer.buyer?.name || 'Unknown Buyer'}</p>
                  <p className="text-sm text-muted-foreground capitalize">
                    {offer.buyer?.userType || 'Unknown'} • {offer.buyer?.accountType || 'Unknown'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Seller</Label>
                  <p className="font-medium">{offer.seller?.name || 'Unknown Seller'}</p>
                  <p className="text-sm text-muted-foreground capitalize">
                    {offer.seller?.userType || 'Unknown'} • {offer.seller?.accountType || 'Unknown'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Delivery Options */}
          {offer.deliveryOptions && offer.deliveryOptions.length > 0 && (
            <Card className="border-primary/30">
              <CardContent className="p-4">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Truck className="w-4 h-4" />
                  Delivery Options
                </h4>
                <div className="flex flex-wrap gap-2">
                  {offer.deliveryOptions.map((option, index) => (
                    <Badge key={index} variant="outline" className="text-sm">
                      {option}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Payment Terms */}
          {offer.paymentTerms && offer.paymentTerms.length > 0 && (
            <Card className="border-primary/30">
              <CardContent className="p-4">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Payment Terms
                </h4>
                <div className="flex flex-wrap gap-2">
                  {offer.paymentTerms.map((term, index) => (
                    <Badge key={index} variant="outline" className="text-sm">
                      {term}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Delivery Address */}
          {offer.deliveryAddress && (
            <Card className="border-primary/30">
              <CardContent className="p-4">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Delivery Address
                </h4>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {offer.deliveryAddress.addressType === 'home' && <Home className="w-4 h-4 text-primary" />}
                    {offer.deliveryAddress.addressType === 'work' && <Building className="w-4 h-4 text-primary" />}
                    <span className="font-medium">{offer.deliveryAddress.label}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{offer.deliveryAddress.fullName}</p>
                  <p className="text-sm text-muted-foreground">
                    {offer.deliveryAddress.addressLine1}
                    {offer.deliveryAddress.addressLine2 && `, ${offer.deliveryAddress.addressLine2}`}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {offer.deliveryAddress.city}, {offer.deliveryAddress.state}
                    {offer.deliveryAddress.postalCode && ` ${offer.deliveryAddress.postalCode}`}
                  </p>
                  <p className="text-sm text-muted-foreground">{offer.deliveryAddress.country}</p>
                  {offer.deliveryAddress.phone && (
                    <p className="text-sm text-blue-600">{offer.deliveryAddress.phone}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Message */}
          {offer.message && (
            <Card className="border-primary/30">
              <CardContent className="p-4">
                <h4 className="font-semibold mb-3">Message</h4>
                <p className="text-sm text-muted-foreground bg-gray-50 p-3 rounded-lg">
                  {offer.message}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Timestamps */}
          <Card className="border-primary/30">
            <CardContent className="p-4">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Timeline
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Created:</span>
                  <span className="text-sm font-medium">{formatDate(offer.createdAt)}</span>
                </div>
                {offer.expiresAt && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Expires:</span>
                    <span className={`text-sm font-medium ${isExpired ? 'text-red-600' : ''}`}>
                      {formatDate(offer.expiresAt)}
                      {isExpired && <span className="ml-1 text-red-600">(Expired)</span>}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Offer Status Management */}
        {onStatusUpdate && currentUserId && (
          <OfferStatusManager
            offer={{
              id: offer.id,
              status: offer.status as any,
              statusUpdatedAt: offer.statusUpdatedAt || offer.createdAt,
              shippedAt: offer.shippedAt,
              receivedAt: offer.receivedAt,
              completedAt: offer.completedAt,
              cancelledAt: offer.cancelledAt,
              cancelledBy: offer.cancelledBy,
              cancellationReason: offer.cancellationReason,
              deliveryOptions: offer.deliveryOptions,
              buyerId: offer.buyer?.id || '',
              sellerId: offer.seller?.id || '',
              currentUserId: currentUserId,
              isBuyer: offer.buyer?.id === currentUserId,
              isSeller: offer.seller?.id === currentUserId
            }}
            onStatusUpdate={async (newStatus, reason) => {
              await onStatusUpdate(offer.id, newStatus, reason);
            }}
          />
        )}

        <div className="flex justify-between pt-4">
          <Button 
            variant="outline" 
            onClick={() => {
              window.location.href = '/offers';
            }}
            className="flex items-center gap-2"
          >
            <Settings className="w-4 h-4" />
            Offer Management
          </Button>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
