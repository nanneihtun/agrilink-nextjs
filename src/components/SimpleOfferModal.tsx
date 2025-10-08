"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Checkbox } from "./ui/checkbox";
import { 
  Package, 
  DollarSign, 
  Truck, 
  Calendar, 
  MapPin,
  AlertCircle,
  Plus,
  Home,
  Building,
  CreditCard,
  Banknote,
  Smartphone
} from "lucide-react";

interface SimpleOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    id: string;
    name: string;
    price: number;
    unit: string;
    category: string;
  };
  seller: {
    id: string;
    name: string;
    location: string;
  };
  onSubmit: (offer: {
    offerPrice: number;
    quantity: number;
    message: string;
    deliveryAddress?: {
      addressType: string;
      label: string;
      fullName: string;
      phone: string;
      addressLine1: string;
      addressLine2?: string;
      city: string;
      state: string;
      postalCode?: string;
      country: string;
    };
    deliveryOptions: string[];
    paymentTerms: string[];
    expirationHours: number;
  }) => void;
}

export function SimpleOfferModal({
  isOpen,
  onClose,
  product,
  seller,
  onSubmit
}: SimpleOfferModalProps) {
  const [offerPrice, setOfferPrice] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('1');
  const [message, setMessage] = useState<string>('');
  const [deliveryOptions, setDeliveryOptions] = useState<string[]>(['']);
  const [paymentTerms, setPaymentTerms] = useState<string[]>(['']);
  const [expirationHours, setExpirationHours] = useState<number>(24);
  const [productData, setProductData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Fetch product data when modal opens
  useEffect(() => {
    if (isOpen && product.id) {
      fetchProductData();
    }
  }, [isOpen, product.id]);

  // Pre-populate offer price when product data is loaded
  useEffect(() => {
    const currentProductData = productData || product;
    if (currentProductData && currentProductData.price && !offerPrice) {
      console.log('💰 Pre-populating offer price:', currentProductData.price);
      setOfferPrice(currentProductData.price.toString());
    }
  }, [productData, product, offerPrice]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setOfferPrice('');
      setQuantity('1');
      setMessage('');
      setDeliveryOptions(['']);
      setPaymentTerms(['']);
      setExpirationHours(24);
      setProductData(null);
      setShowNewAddress(false);
      setNewAddress({
        addressType: 'home',
        label: '',
        fullName: '',
        phone: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'Myanmar'
      });
    }
  }, [isOpen]);

  const fetchProductData = async () => {
    setLoading(true);
    try {
      console.log('🔍 Fetching product data for ID:', product.id);
      const response = await fetch(`/api/products/${product.id}`);
      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', response.headers);
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Product data fetched:', data);
        // The API returns data wrapped in a 'product' object
        const productData = data.product || data;
        console.log('💰 Product price:', productData.price);
        console.log('🖼️ Product image:', productData.imageUrl);
        setProductData(productData);
      } else {
        const errorText = await response.text();
        console.error('❌ Failed to fetch product data, status:', response.status);
        console.error('❌ Error response:', errorText);
        // Fallback to prop data
        setProductData(product);
      }
    } catch (error) {
      console.error('❌ Error fetching product data:', error);
      // Fallback to prop data
      setProductData(product);
    } finally {
      setLoading(false);
    }
  };

  // Comprehensive options from all product forms (SimplifiedProductForm + products/new + AddListingPage)
  const deliveryOptionsList = [
    // From SimplifiedProductForm
    'Pickup',
    'Local Delivery (Within 10km)',
    'Regional Delivery', 
    'Nationwide Shipping',
    'Express Delivery',
    'Cold Chain Transport',
    // From products/new page
    'Delivery',
    'Shipping',
    'Local Transport',
    // From AddListingPage
    'Farm Pickup',
    'Local Delivery',
    'Regional Transport',
    'Cold Chain Delivery',
    'Bulk Transport',
    'Custom Logistics'
  ];

  const paymentTermOptionsList = [
    // From SimplifiedProductForm
    'Cash on Delivery',
    'Bank Transfer',
    'Mobile Payment',
    'Cash on Pickup',
    '50% Advance, 50% on Delivery',
    '30% Advance, 70% on Delivery',
    // From products/new page
    'Credit',
    'Installments',
    // From AddListingPage
    'Advance Payment',
    '30 Days Credit',
    '15 Days Credit',
    'Letter of Credit'
  ];
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Address states
  const [userAddresses, setUserAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [showNewAddress, setShowNewAddress] = useState(false);
  const [newAddress, setNewAddress] = useState({
    addressType: 'home',
    label: '',
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Myanmar'
  });

  // Fetch user addresses when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchUserAddresses();
    }
  }, [isOpen]);

  const fetchUserAddresses = async () => {
    try {
      const response = await fetch('/api/user/addresses', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUserAddresses(data.addresses);
        // Set default address if available
        const defaultAddress = data.addresses.find((addr: any) => addr.isDefault);
        if (defaultAddress) {
          setSelectedAddressId(defaultAddress.id);
        }
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!offerPrice || !quantity) {
      alert('Please fill in all required fields (Price and Quantity)');
      return;
    }

    // Validate delivery options
    const validDeliveryOptions = deliveryOptions.filter(opt => opt && opt !== '');
    if (validDeliveryOptions.length === 0) {
      alert('Please select at least one delivery option');
      return;
    }

    // Validate payment terms
    const validPaymentTerms = paymentTerms.filter(term => term && term !== '');
    if (validPaymentTerms.length === 0) {
      alert('Please select at least one payment term');
      return;
    }

    setIsSubmitting(true);
    
    // Get selected address or new address (only if delivery option requires address)
    let deliveryAddress = undefined;
    const selectedDeliveryOption = deliveryOptions[0];
    const requiresAddress = selectedDeliveryOption && 
      [
        // From SimplifiedProductForm
        'Local Delivery (Within 10km)', 'Regional Delivery', 'Nationwide Shipping', 'Express Delivery', 'Cold Chain Transport',
        // From products/new page
        'Delivery', 'Shipping', 'Local Transport',
        // From AddListingPage
        'Local Delivery', 'Regional Transport', 'Cold Chain Delivery', 'Bulk Transport', 'Custom Logistics'
      ].includes(selectedDeliveryOption);
    
    if (requiresAddress) {
      if (showNewAddress) {
        deliveryAddress = newAddress;
      } else {
        const selectedAddress = userAddresses.find(addr => addr.id === selectedAddressId);
        if (selectedAddress) {
          deliveryAddress = {
            addressType: selectedAddress.addressType,
            label: selectedAddress.label,
            fullName: selectedAddress.fullName,
            phone: selectedAddress.phone,
            addressLine1: selectedAddress.addressLine1,
            addressLine2: selectedAddress.addressLine2,
            city: selectedAddress.city,
            state: selectedAddress.state,
            postalCode: selectedAddress.postalCode,
            country: selectedAddress.country
          };
        }
      }
    }

    try {
      await onSubmit({
        offerPrice: parseFloat(offerPrice),
        quantity: parseInt(quantity),
        message: message.trim(),
        deliveryAddress,
        deliveryOptions: validDeliveryOptions,
        paymentTerms: validPaymentTerms,
        expirationHours
      });
      
      // Reset form
      setOfferPrice('');
      setQuantity('1');
      setMessage('');
      setDeliveryOptions(['']);
      setPaymentTerms(['']);
      setShowNewAddress(false);
      setNewAddress({
        addressType: 'home',
        label: '',
        fullName: '',
        phone: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'Myanmar'
      });
      onClose();
    } catch (error) {
      console.error('Error submitting offer:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentProductData = productData || product;
  const originalPrice = currentProductData?.price || 0;
  const offerPriceNum = parseFloat(offerPrice) || 0;
  const discountPercentage = originalPrice > 0 ? ((originalPrice - offerPriceNum) / originalPrice * 100) : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-w-[90vw]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Make an Offer
          </DialogTitle>
          <DialogDescription>
            Submit your offer for {productData?.name || product.name}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Product Info */}
          <Card>
            <CardContent className="p-3">
              {loading ? (
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center animate-pulse">
                    <Package className="w-6 h-6 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded animate-pulse mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3"></div>
                  </div>
                  <div className="text-right">
                    <div className="h-4 bg-gray-200 rounded animate-pulse mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-16"></div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                    {productData?.imageUrl ? (
                      <img 
                        src={productData.imageUrl} 
                        alt={productData.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Package className="w-6 h-6 text-gray-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{productData?.name || product.name}</h4>
                    <p className="text-xs text-muted-foreground">{productData?.category || product.category}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{seller.location}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{originalPrice.toLocaleString()} MMK</p>
                    <p className="text-xs text-muted-foreground">per {productData?.unit || product.unit}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Offer Price and Quantity - Side by Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="offerPrice">Your Offer Price (MMK)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="offerPrice"
                  type="number"
                  placeholder="Enter your offer"
                  value={offerPrice}
                  onChange={(e) => setOfferPrice(e.target.value)}
                  className="pl-10"
                  required
                  min="1"
                />
              </div>
              {originalPrice > 0 && offerPriceNum > 0 && (
                <div className="flex items-center gap-2 text-xs">
                  {discountPercentage > 0 ? (
                    <Badge variant="secondary" className="text-green-600">
                      {discountPercentage.toFixed(1)}% discount
                    </Badge>
                  ) : discountPercentage < 0 ? (
                    <Badge variant="destructive">
                      {Math.abs(discountPercentage).toFixed(1)}% above asking
                    </Badge>
                  ) : (
                    <Badge variant="outline">Same as asking price</Badge>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                placeholder="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
                min="1"
              />
            </div>
          </div>

          {/* Delivery Options and Payment Terms - Side by Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Delivery Options *</Label>
              <Select 
                value={deliveryOptions[0] || ''} 
                onValueChange={(value) => setDeliveryOptions([value])}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select delivery option *" />
                </SelectTrigger>
                <SelectContent>
                  {deliveryOptionsList.map((option) => (
                    <SelectItem key={option} value={option}>
                      <div className="flex items-center gap-2">
                        <Truck className="w-4 h-4" />
                        {option}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Payment Terms *</Label>
              <Select 
                value={paymentTerms[0] || ''} 
                onValueChange={(value) => setPaymentTerms([value])}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select payment terms *" />
                </SelectTrigger>
                <SelectContent>
                  {paymentTermOptionsList.map((term) => (
                    <SelectItem key={term} value={term}>
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        {term}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Address Selection for Delivery Options that require address */}
          {deliveryOptions[0] && 
           [
             // From SimplifiedProductForm
             'Local Delivery (Within 10km)', 'Regional Delivery', 'Nationwide Shipping', 'Express Delivery', 'Cold Chain Transport',
             // From products/new page
             'Delivery', 'Shipping', 'Local Transport',
             // From AddListingPage
             'Local Delivery', 'Regional Transport', 'Cold Chain Delivery', 'Bulk Transport', 'Custom Logistics'
           ].includes(deliveryOptions[0]) && (
            <div className="space-y-3">
              <Label>Delivery Address</Label>
              
              {!showNewAddress && userAddresses.length > 0 && (
                <div className="space-y-2">
                  <Select value={selectedAddressId} onValueChange={setSelectedAddressId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an address">
                        {selectedAddressId && userAddresses.find(addr => addr.id === selectedAddressId) && (
                          <div className="flex items-start gap-2 w-full text-left">
                            {(() => {
                              const selectedAddress = userAddresses.find(addr => addr.id === selectedAddressId);
                              return (
                                <>
                                  {selectedAddress?.addressType === 'home' && <Home className="w-4 h-4 mt-0.5" />}
                                  {selectedAddress?.addressType === 'work' && <Building className="w-4 h-4 mt-0.5" />}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <p className="font-medium text-sm">{selectedAddress?.label}</p>
                                      {selectedAddress?.isDefault && (
                                        <Badge variant="secondary" className="text-xs">Default</Badge>
                                      )}
                                    </div>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                      {selectedAddress?.addressLine1}
                                      {selectedAddress?.addressLine2 && `, ${selectedAddress.addressLine2}`}
                                    </p>
                                    <p className="text-xs text-muted-foreground leading-relaxed">
                                      {selectedAddress?.city}, {selectedAddress?.state}
                                    </p>
                                  </div>
                                </>
                              );
                            })()}
                          </div>
                        )}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {userAddresses.map((address) => (
                        <SelectItem key={address.id} value={address.id}>
                          <div className="flex items-start gap-2 w-full">
                            {address.addressType === 'home' && <Home className="w-4 h-4 mt-1" />}
                            {address.addressType === 'work' && <Building className="w-4 h-4 mt-1" />}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-medium text-sm">{address.label}</p>
                                {address.isDefault && (
                                  <Badge variant="secondary" className="text-xs">Default</Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground leading-relaxed">
                                {address.fullName}
                              </p>
                              <p className="text-xs text-muted-foreground leading-relaxed">
                                {address.addressLine1}
                                {address.addressLine2 && `, ${address.addressLine2}`}
                              </p>
                              <p className="text-xs text-muted-foreground leading-relaxed">
                                {address.city}, {address.state}
                                {address.postalCode && ` ${address.postalCode}`}
                              </p>
                              <p className="text-xs text-muted-foreground leading-relaxed">
                                {address.country}
                              </p>
                              {address.phone && (
                                <p className="text-xs text-blue-600 leading-relaxed">
                                  {address.phone}
                                </p>
                              )}
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowNewAddress(true)}
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Address
                  </Button>
                </div>
              )}

              {showNewAddress && (
                <Card>
                  <CardContent className="p-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">New Address</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowNewAddress(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label htmlFor="addressType" className="text-xs">Type</Label>
                        <Select value={newAddress.addressType} onValueChange={(value) => setNewAddress({...newAddress, addressType: value})}>
                          <SelectTrigger className="h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="home">Home</SelectItem>
                            <SelectItem value="work">Work</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="label" className="text-xs">Label</Label>
                        <Input
                          id="label"
                          placeholder="e.g., Home, Office"
                          value={newAddress.label}
                          onChange={(e) => setNewAddress({...newAddress, label: e.target.value})}
                          className="h-8"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label htmlFor="fullName" className="text-xs">Full Name</Label>
                        <Input
                          id="fullName"
                          value={newAddress.fullName}
                          onChange={(e) => setNewAddress({...newAddress, fullName: e.target.value})}
                          className="h-8"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="phone" className="text-xs">Phone</Label>
                        <Input
                          id="phone"
                          value={newAddress.phone}
                          onChange={(e) => setNewAddress({...newAddress, phone: e.target.value})}
                          className="h-8"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="addressLine1" className="text-xs">Address Line 1</Label>
                      <Input
                        id="addressLine1"
                        value={newAddress.addressLine1}
                        onChange={(e) => setNewAddress({...newAddress, addressLine1: e.target.value})}
                        className="h-8"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="addressLine2" className="text-xs">Address Line 2 (Optional)</Label>
                      <Input
                        id="addressLine2"
                        value={newAddress.addressLine2}
                        onChange={(e) => setNewAddress({...newAddress, addressLine2: e.target.value})}
                        className="h-8"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label htmlFor="city" className="text-xs">City</Label>
                        <Input
                          id="city"
                          value={newAddress.city}
                          onChange={(e) => setNewAddress({...newAddress, city: e.target.value})}
                          className="h-8"
                        />
                      </div>
                      <div>
                        <Label htmlFor="state" className="text-xs">State/Region</Label>
                        <Input
                          id="state"
                          value={newAddress.state}
                          onChange={(e) => setNewAddress({...newAddress, state: e.target.value})}
                          className="h-8"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message">Message (Optional)</Label>
            <Textarea
              id="message"
              placeholder="Add a message to your offer..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
            />
          </div>

          {/* Expiration Time */}
          <div className="space-y-2">
            <Label htmlFor="expiration">Offer Expires In</Label>
            <Select 
              value={expirationHours.toString()} 
              onValueChange={(value) => setExpirationHours(parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select expiration time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 hour</SelectItem>
                <SelectItem value="6">6 hours</SelectItem>
                <SelectItem value="12">12 hours</SelectItem>
                <SelectItem value="24">1 day</SelectItem>
                <SelectItem value="48">2 days</SelectItem>
                <SelectItem value="72">3 days</SelectItem>
                <SelectItem value="168">1 week</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              How long are you willing to wait for a response?
            </p>
          </div>

          {/* Total */}
          {offerPriceNum > 0 && parseInt(quantity) > 0 && (
            <Card>
              <CardContent className="p-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Total Offer:</span>
                  <span className="text-lg font-bold">
                    {(offerPriceNum * parseInt(quantity)).toLocaleString()} MMK
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {quantity} × {offerPriceNum.toLocaleString()} MMK
                </p>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isSubmitting || !offerPrice || !quantity}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Offer'}
            </Button>
          </div>

          {/* Warning */}
          <div className="flex items-start gap-2 p-3 bg-yellow-50 rounded-lg">
            <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
            <div className="text-xs text-yellow-800">
              <p className="font-medium">Important:</p>
              <p>This offer will be sent to {seller.name}. Make sure you've discussed the terms in chat first.</p>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
