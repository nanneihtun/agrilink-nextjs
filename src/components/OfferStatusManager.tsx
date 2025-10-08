"use client";

import React, { useState } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Truck, 
  Package, 
  CheckSquare, 
  Ban,
  AlertCircle,
  ArrowRight,
  User,
  Calendar
} from 'lucide-react';

export interface OfferStatus {
  id: string;
  status: 'pending' | 'accepted' | 'rejected' | 'to_ship' | 'ready_to_pickup' | 'picked_up' | 'shipped' | 'to_receive' | 'completed' | 'cancelled' | 'expired';
  statusUpdatedAt: string;
  shippedAt?: string;
  receivedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  cancelledBy?: string;
  cancellationReason?: string;
  deliveryOptions?: string[];
  buyerId: string;
  sellerId: string;
  currentUserId: string;
  isBuyer: boolean;
  isSeller: boolean;
}

interface OfferStatusManagerProps {
  offer: OfferStatus;
  onStatusUpdate: (newStatus: string, reason?: string) => Promise<void>;
  loading?: boolean;
}

const statusConfig = {
  pending: {
    label: 'Pending',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: Clock,
    description: 'Waiting for seller response'
  },
  accepted: {
    label: 'Accepted',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: CheckCircle,
    description: 'Offer accepted, preparing for shipment'
  },
  rejected: {
    label: 'Rejected',
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: XCircle,
    description: 'Offer rejected by seller'
  },
  to_ship: {
    label: 'Ready to Ship',
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    icon: Package,
    description: 'Ready to ship, seller preparing package'
  },
  shipped: {
    label: 'Shipped',
    color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    icon: Truck,
    description: 'Package shipped, in transit'
  },
  ready_to_pickup: {
    label: 'Ready to Pick Up',
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    icon: Package,
    description: 'Ready for pickup, buyer can collect'
  },
  picked_up: {
    label: 'Picked Up',
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: CheckCircle,
    description: 'Item picked up, transaction completing...'
  },
  to_receive: {
    label: 'Delivered',
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    icon: CheckSquare,
    description: 'Package delivered, transaction completing...'
  },
  completed: {
    label: 'Completed',
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: CheckCircle,
    description: 'Transaction completed successfully'
  },
  cancelled: {
    label: 'Cancelled',
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    icon: Ban,
    description: 'Offer cancelled'
  },
  expired: {
    label: 'Expired',
    color: 'bg-gray-100 text-gray-600 border-gray-200',
    icon: AlertCircle,
    description: 'Offer expired'
  }
};

const statusFlow = {
  pending: ['accepted', 'rejected', 'cancelled'],
  accepted: ['to_ship', 'ready_to_pickup', 'cancelled'], // Can go to ship OR pickup
  to_ship: ['shipped', 'cancelled'],
  shipped: ['to_receive', 'cancelled'], // to_receive auto-completes to completed
  ready_to_pickup: ['picked_up', 'cancelled'], // picked_up auto-completes to completed
  picked_up: [], // This status is automatic, no manual transitions
  to_receive: [], // This status is automatic, no manual transitions
  completed: [], // Final state
  rejected: [], // Final state
  cancelled: [], // Final state
  expired: [] // Final state
};

export function OfferStatusManager({ offer, onStatusUpdate, loading = false }: OfferStatusManagerProps) {
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const currentStatusConfig = statusConfig[offer.status];
  const StatusIcon = currentStatusConfig.icon;
  const availableTransitions = statusFlow[offer.status] || [];

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === 'cancelled') {
      setShowCancelDialog(true);
      return;
    }
    
    await onStatusUpdate(newStatus);
  };

  const handleCancel = async () => {
    await onStatusUpdate('cancelled', cancelReason);
    setShowCancelDialog(false);
    setCancelReason('');
  };

  const getActionButton = (status: string) => {
    // Check if pickup is in delivery options (case-insensitive)
    const isPickup = (offer.deliveryOptions || []).some(option => 
      option.toLowerCase() === 'pickup'
    );
    
    const actions = {
      accepted: { 
        label: isPickup ? 'Mark Ready to Pick Up' : 'Mark Ready to Ship', 
        icon: Package 
      },
      to_ship: { label: 'Mark as Shipped', icon: Truck },
      ready_to_pickup: { label: 'Mark as Received', icon: CheckCircle },
      shipped: { label: 'Mark as Received', icon: CheckCircle }
    };

    const action = actions[status as keyof typeof actions];
    if (!action) return null;

    const ActionIcon = action.icon;
    const nextStatus = getNextStatus(status);
    const hasPermission = canUpdateStatus(nextStatus);

    return (
      <Button
        onClick={() => handleStatusChange(nextStatus)}
        disabled={loading || !hasPermission}
        className="flex items-center gap-2"
        title={!hasPermission ? `You don't have permission to perform this action` : ''}
      >
        <ActionIcon className="w-4 h-4" />
        {action.label}
      </Button>
    );
  };

  const getNextStatus = (currentStatus: string): string => {
    // Check if pickup is in delivery options (case-insensitive)
    const isPickup = (offer.deliveryOptions || []).some(option => 
      option.toLowerCase() === 'pickup'
    );
    
    const nextStatusMap = {
      accepted: isPickup ? 'ready_to_pickup' : 'to_ship',
      to_ship: 'shipped',
      shipped: 'to_receive', // This will auto-complete to 'completed' in the API
      ready_to_pickup: 'to_receive' // This will auto-complete to 'completed' in the API
    };
    return nextStatusMap[currentStatus as keyof typeof nextStatusMap] || currentStatus;
  };

  const canPerformAction = (status: string) => {
    if (status === 'pending') {
      return offer.isSeller; // Only seller can accept/reject
    }
    if (status === 'accepted' || status === 'to_ship') {
      return offer.isSeller; // Only seller can mark ready to ship and ship
    }
    if (status === 'ready_to_pickup') {
      return offer.isBuyer; // Only buyer can mark as picked up (auto-completes)
    }
    if (status === 'shipped') {
      return offer.isBuyer; // Only buyer can mark as delivered (auto-completes)
    }
    return false;
  };

  const canCancelOffer = () => {
    // Both buyer and seller can cancel, but only if the offer is not already completed/cancelled/expired
    const finalStates = ['completed', 'cancelled', 'expired', 'rejected'];
    return !finalStates.includes(offer.status);
  };

  const canUpdateStatus = (newStatus: string) => {
    // Check if the user has permission to perform this specific status update
    if (newStatus === 'accepted' || newStatus === 'rejected') {
      return offer.isSeller && offer.status === 'pending';
    }
    if (newStatus === 'to_ship') {
      return offer.isSeller && offer.status === 'accepted';
    }
    if (newStatus === 'ready_to_pickup') {
      return offer.isSeller && offer.status === 'accepted';
    }
    if (newStatus === 'shipped') {
      return offer.isSeller && offer.status === 'to_ship';
    }
    if (newStatus === 'to_receive') {
      return offer.isBuyer && (offer.status === 'shipped' || offer.status === 'ready_to_pickup');
    }
    if (newStatus === 'completed') {
      // This is now handled automatically
      return false;
    }
    if (newStatus === 'cancelled') {
      return canCancelOffer();
    }
    return false;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className="border-primary/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <StatusIcon className="w-5 h-5" />
          Offer Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge className={`${currentStatusConfig.color} border`}>
              <StatusIcon className="w-3 h-3 mr-1" />
              {currentStatusConfig.label}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {currentStatusConfig.description}
            </span>
          </div>
        </div>

        {/* Status Timeline */}
        <div className="space-y-2">
          <div className="text-sm font-medium text-muted-foreground">Status Timeline</div>
          <div className="space-y-1">
            {offer.shippedAt && (
              <div className="flex items-center gap-2 text-sm">
                <Truck className="w-4 h-4 text-indigo-600" />
                <span>Shipped: {formatDate(offer.shippedAt)}</span>
              </div>
            )}
            {offer.receivedAt && (
              <div className="flex items-center gap-2 text-sm">
                <CheckSquare className="w-4 h-4 text-orange-600" />
                <span>Received: {formatDate(offer.receivedAt)}</span>
              </div>
            )}
            {offer.completedAt && (
              <div className="flex items-center gap-2 text-sm">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span>Completed: {formatDate(offer.completedAt)}</span>
              </div>
            )}
            {offer.cancelledAt && (
              <div className="flex items-center gap-2 text-sm">
                <Ban className="w-4 h-4 text-gray-600" />
                <span>Cancelled: {formatDate(offer.cancelledAt)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        {availableTransitions.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium text-muted-foreground">Actions</div>
            <div className="flex flex-wrap gap-2">
              {availableTransitions.map((status) => {
                const hasPermission = canUpdateStatus(status);
                
                // Only render buttons if user has permission
                if (!hasPermission) {
                  return null;
                }
                
                if (status === 'cancelled') {
                  return (
                    <Button
                      key={status}
                      variant="outline"
                      onClick={() => handleStatusChange(status)}
                      disabled={loading}
                      className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <Ban className="w-4 h-4" />
                      Cancel Offer
                    </Button>
                  );
                }

                if (status === 'accepted') {
                  return (
                    <Button
                      key={status}
                      onClick={() => handleStatusChange(status)}
                      disabled={loading}
                      className="flex items-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Accept Offer
                    </Button>
                  );
                }

                if (status === 'rejected') {
                  return (
                    <Button
                      key={status}
                      variant="outline"
                      onClick={() => handleStatusChange(status)}
                      disabled={loading}
                      className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject Offer
                    </Button>
                  );
                }

                return null;
              })}

              {/* Dynamic action button based on current status */}
              {canPerformAction(offer.status) && getActionButton(offer.status)}
            </div>
          </div>
        )}

        {/* Cancellation Reason */}
        {offer.status === 'cancelled' && offer.cancellationReason && (
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="text-sm font-medium text-gray-700 mb-1">Cancellation Reason:</div>
            <div className="text-sm text-gray-600">{offer.cancellationReason}</div>
          </div>
        )}
      </CardContent>

      {/* Cancel Dialog */}
      {showCancelDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Cancel Offer</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for cancellation (optional)
                </label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg resize-none"
                  rows={3}
                  placeholder="Please provide a reason for cancelling this offer..."
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCancelDialog(false);
                    setCancelReason('');
                  }}
                >
                  Keep Offer
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleCancel}
                  disabled={loading}
                >
                  Cancel Offer
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
