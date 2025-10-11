
interface Product {
  id: string;
  name: string;
  price: number;
  unit: string;
  image?: string;
}
import React, { useState, useEffect, useRef, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { Send, MapPin, Star, Shield, AlertTriangle, CheckCircle, Clock, User, X, Package, Handshake, DollarSign } from "lucide-react";
import { useChat } from "../hooks/useChat";
import { useAuth } from "../hooks/useAuth";
import { AccountTypeBadge, getUserVerificationLevel } from "./UserBadgeSystem";
import { SimpleOfferModal } from "./SimpleOfferModal";
import { OfferCardCompact } from "./OfferCardCompact";
import { SimpleOfferDetailsModal } from "./SimpleOfferDetailsModal";

interface Message {
  id: string;
  sender: 'user' | 'seller';
  content: string;
  timestamp: string;
}

interface ChatInterfaceProps {
  otherPartyName: string;
  otherPartyType: 'farmer' | 'trader' | 'buyer';
  otherPartyLocation: string;
  otherPartyRating: number;
  productName: string;
  productId: string;
  otherPartyId: string;
  conversationId?: string;
  onClose: () => void;
  otherPartyVerified?: boolean;
  currentUserVerified?: boolean;
  currentUserType?: string;
  currentUser?: any; // Pass currentUser from App.tsx instead of using separate useAuth
  otherPartyProfileImage?: string; // Profile image of the other party
  otherPartyVerificationStatus?: {
    trustLevel: 'unverified' | 'under-review' | 'id-verified' | 'business-verified';
    tierLabel: string;
    levelBadge: string;
  };
  product?: Product; // Full product details for offers
}

export function ChatInterface({ 
  otherPartyName, 
  otherPartyType, 
  otherPartyLocation, 
  otherPartyRating,
  productName,
  productId,
  otherPartyId,
  conversationId: initialConversationId,
  onClose,
  otherPartyVerified = false,
  currentUserVerified = false,
  currentUserType = 'buyer',
  otherPartyProfileImage,
  otherPartyVerificationStatus,
  product,
  currentUser: passedCurrentUser
}: ChatInterfaceProps) {
  // Use useAuth hook to get current user
  const { user: authUser, loading: authLoading } = useAuth();
  
  // Use passed currentUser from App.tsx or fallback to useAuth
  const effectiveCurrentUser = useMemo(() => {
    if (passedCurrentUser?.id) {
      return passedCurrentUser;
    }
    
    if (authUser?.id) {
      return authUser;
    }
    
    if (authLoading) {
      return null;
    }
    
    return null;
  }, [passedCurrentUser?.id, authUser?.id, authLoading]);
  
  // Debug current user state - simplified
  useEffect(() => {
    // Removed debug logging
  }, [passedCurrentUser?.id, authUser?.id, effectiveCurrentUser?.id]);

  // Debug otherPartyProfileImage prop
  useEffect(() => {
    // Removed debug logging
  }, [otherPartyProfileImage, otherPartyName, otherPartyId]);
  
  const { messages, sendMessage, startConversation, loadMessages, startPolling } = useChat();
  const [newMessage, setNewMessage] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(initialConversationId || null);
  
  // Debug conversation ID
  // Sync conversationId state with initialConversationId prop
  useEffect(() => {
    if (initialConversationId && initialConversationId !== conversationId) {
      setConversationId(initialConversationId);
    }
  }, [initialConversationId, conversationId]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  

  // Offer modal state
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offers, setOffers] = useState<any[]>([]);
  const [showOfferDetailsModal, setShowOfferDetailsModal] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<any>(null);

  // Get current conversation messages - moved up to avoid initialization order issues
  const currentMessages = useMemo(() => {
    const msgs = conversationId ? messages[conversationId] || [] : [];
    // Remove duplicates based on message ID
    const uniqueMessages = msgs.filter((message, index, self) => 
      index === self.findIndex(m => m.id === message.id)
    );
    // Removed debug logging
    return uniqueMessages;
  }, [conversationId, messages]);

  // Combine messages and offers and sort chronologically
  const combinedChatItems = useMemo(() => {
    const messageItems = currentMessages.map(msg => {
      const timestamp = new Date(msg.timestamp).getTime();
      // Removed debug logging
      return {
        type: 'message' as const,
        id: msg.id,
        timestamp: timestamp,
        data: msg
      };
    });

    const offerItems = offers.map(offer => {
      const timestamp = new Date(offer.createdAt).getTime();
      // Removed debug logging
      return {
        type: 'offer' as const,
        id: offer.id,
        timestamp: timestamp,
        data: offer
      };
    });

    const combined = [...messageItems, ...offerItems];
    const sorted = combined.sort((a, b) => a.timestamp - b.timestamp);
    
    // Removed debug logging

    return sorted;
  }, [currentMessages, offers]);
  
  // Debug conversation ID changes
  useEffect(() => {
    console.log('🔄 Conversation ID changed:', {
      conversationId,
      hasMessages: currentMessages.length > 0,
      messageCount: currentMessages.length,
      messages: currentMessages.map(m => ({ id: m.id, content: m.content.substring(0, 50) + '...' })),
      timestamp: new Date().toISOString()
    });
  }, [conversationId, currentMessages.length]);

  // Load messages when conversationId changes (from Messages component)
  useEffect(() => {
    if (conversationId && effectiveCurrentUser?.id) {
      console.log('🔄 Loading messages for conversation:', conversationId);
      console.log('🔄 Current messages state before loading:', messages[conversationId]?.length || 0);
      loadMessages(conversationId);
    } else {
      console.log('🔄 Not loading messages - missing conversationId or user:', {
        conversationId,
        userId: effectiveCurrentUser?.id
      });
    }
  }, [conversationId, effectiveCurrentUser?.id, loadMessages]);

  // Fetch offers when conversationId changes
  useEffect(() => {
    if (conversationId && effectiveCurrentUser?.id) {
      console.log('🔄 Fetching offers for conversation:', conversationId);
      fetchOffers();
    }
  }, [conversationId, effectiveCurrentUser?.id]);

  // Start polling for real-time updates
  useEffect(() => {
    if (conversationId && effectiveCurrentUser?.id) {
      console.log('🔄 Starting polling for conversation:', conversationId);
      const pollInterval = startPolling(conversationId);
      
      return () => {
        console.log('🔄 Stopping polling for conversation:', conversationId);
        clearInterval(pollInterval);
      };
    }
  }, [conversationId, effectiveCurrentUser?.id, startPolling]);

  // Stable conversation key to prevent unnecessary reloads - exclude conversationId to prevent loops
  const conversationKey = useMemo(() => {
    if (!productId || !otherPartyId || !effectiveCurrentUser?.id) return null;
    return `${productId}-${otherPartyId}-${effectiveCurrentUser.id}`;
  }, [productId, otherPartyId, effectiveCurrentUser?.id]);

  // Cleanup state only when component unmounts (removed conversationKey dependency)
  useEffect(() => {
    return () => {
      setIsLoading(false); // Ensure loading state is reset
    };
  }, []); // Only run on mount/unmount

  // Recovery mechanism - reset loading state if stuck
  useEffect(() => {
    if (isLoading) {
      const timeout = setTimeout(() => {
        console.warn('Chat interface stuck in loading state, forcing recovery');
        setIsLoading(false);
        console.warn('Chat recovered from loading state');
      }, 10000); // 10 second timeout
      
      return () => clearTimeout(timeout);
    }
  }, [isLoading]);
  


  // Note: localStorage cleanup removed - now using Neon database

  // Initialize or get conversation - with stability improvements
  useEffect(() => {
    const initializeChat = async () => {
      if (!effectiveCurrentUser || !productId || !otherPartyId) {
        console.log('🔄 Chat initialization skipped - missing dependencies:', {
          hasUser: !!effectiveCurrentUser,
          hasProductId: !!productId,
          hasOtherPartyId: !!otherPartyId
        });
        return;
      }
      
      // Don't re-initialize if we already have a stable conversation
      if (conversationId) {
        console.log('✅ Chat already initialized:', conversationId);
        return;
      }
      
      try {
        console.log('🚀 Initializing chat:', {
          productId,
          otherPartyId,
          currentUserId: effectiveCurrentUser.id,
          currentUserType: effectiveCurrentUser.userType,
          otherPartyType,
          initialConversationId,
          isCurrentUserOtherParty: effectiveCurrentUser.id === otherPartyId
        });
        
        setIsLoading(true);
        
        if (initialConversationId) {
          // Use existing conversation
          console.log('📱 Using existing conversation:', initialConversationId);
          setConversationId(initialConversationId);
          console.log('🔄 Loading messages for conversation:', initialConversationId);
          await loadMessages(initialConversationId);
          console.log('✅ Messages loaded for conversation:', initialConversationId);
        } else {
          // Check if conversation already exists in localStorage first
          try {
            const storedConversations = localStorage.getItem('agriconnect-myanmar-conversations');
            if (storedConversations) {
              const conversations = JSON.parse(storedConversations);
              const existingConversation = conversations.find((conv: any) => 
                ((conv.buyerId === effectiveCurrentUser.id && conv.otherPartyId === otherPartyId) ||
                 (conv.otherPartyId === effectiveCurrentUser.id && conv.buyerId === otherPartyId)) && 
                conv.productId === productId
              );
              
              if (existingConversation) {
                console.log('📱 Found existing conversation in localStorage:', existingConversation.id);
                setConversationId(existingConversation.id);
                await loadMessages(existingConversation.id);
                return;
              }
            }
          } catch (error) {
            console.warn('Could not check for existing conversations:', error);
          }
          
          // Don't create conversation yet - wait for first message
          console.log('💬 Chat ready - conversation will be created when first message is sent');
          setConversationId(null); // No conversation ID until first message
        }
      } catch (error) {
        console.error('❌ Failed to initialize chat:', error);
        console.error('Failed to start conversation');
      } finally {
        setIsLoading(false);
      }
    };

    initializeChat();
  }, [effectiveCurrentUser?.id, productId, otherPartyId, initialConversationId]); // Removed conversationId to prevent loops

  // Auto-scroll to bottom when new messages or offers arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [currentMessages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isLoading || !effectiveCurrentUser) {
      console.log('⚠️ Cannot send message:', {
        hasMessage: !!newMessage.trim(),
        hasEffectiveUser: !!effectiveCurrentUser,
        isLoading
      });
      return;
    }

    const messageToSend = newMessage.trim();
    setNewMessage(''); // Clear immediately for better UX
    
    try {
      setIsLoading(true);
      
      let currentConversationId = conversationId;
      
      // Create conversation if it doesn't exist (first message)
      if (!currentConversationId) {
        console.log('🆕 Creating conversation for first message');
        // Determine if current user is buyer or seller
        const isCurrentUserOtherParty = effectiveCurrentUser.id === otherPartyId;
        const buyerId = isCurrentUserOtherParty ? otherPartyId : effectiveCurrentUser.id;
        const actualOtherPartyId = isCurrentUserOtherParty ? effectiveCurrentUser.id : otherPartyId;
        
        const newConversation = await startConversation(buyerId, actualOtherPartyId, productId);
        if (newConversation) {
          currentConversationId = newConversation.id;
          setConversationId(currentConversationId);
          console.log('✅ New conversation created:', currentConversationId);
        } else {
          throw new Error('Failed to create conversation');
        }
      }
      
      console.log('📤 Sending message:', {
        conversationId: currentConversationId,
        content: messageToSend,
        sender: effectiveCurrentUser.name,
        userId: effectiveCurrentUser.id
      });
      
      const sentMessage = await sendMessage(currentConversationId || '', messageToSend, effectiveCurrentUser.id);
      console.log('✅ Message sent successfully:', sentMessage);
      
      // Temporarily disabled loadMessages to prevent duplicate issues
      // TODO: Re-enable after fixing duplicate ChatInterface instances
      // if (conversationId) {
      //   console.log('🔄 Reloading messages after send...');
      //   await loadMessages(conversationId);
      // }
      
      // Verify conversation state after sending
      console.log('🔍 Post-send conversation state:', {
        conversationId,
        messageCount: currentMessages.length,
        isLoading: false
      });
      
    } catch (error) {
      console.error('❌ Failed to send message:', error);
      // Restore message on error
      setNewMessage(messageToSend);
      alert('Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
      
      // Additional check to ensure conversation ID is still valid
      console.log('🔍 Final conversation check:', {
        conversationId: conversationId,
        stillValid: !!conversationId,
        messageCount: currentMessages.length,
        timestamp: new Date().toISOString()
      });
      
      // Force scroll to bottom after sending
      setTimeout(() => {
        if (scrollAreaRef.current) {
          const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
          if (scrollContainer) {
            scrollContainer.scrollTop = scrollContainer.scrollHeight;
          }
        }
      }, 100);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Format timestamp for display
  const formatTimestamp = (timestamp: string) => {
    if (!timestamp) return 'Just now';
    
    const date = new Date(timestamp);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      console.warn('Invalid timestamp:', timestamp);
      return 'Just now';
    }
    
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString();
  };


  // Remove duplicate offers
  useEffect(() => {
    const uniqueOffers = offers.filter((offer, index, self) => 
      index === self.findIndex(o => o.id === offer.id)
    );
    
    // Update offers state if there were duplicates
    if (uniqueOffers.length !== offers.length) {
      setOffers(uniqueOffers);
    }
  }, [offers]);

  // Fetch offers for this conversation
  const fetchOffers = async () => {
    if (!conversationId) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/offers?conversationId=${conversationId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setOffers(data.offers || []);
      } else if (response.status === 401) {
        console.error('❌ Authentication failed, user needs to log in again');
        // Clear invalid token and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      } else {
        console.error('❌ Failed to fetch offers:', response.status);
      }
    } catch (error) {
      console.error('❌ Error fetching offers:', error);
    }
  };

  // Fetch offers for a specific conversation
  const fetchOffersForConversation = async (targetConversationId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/offers?conversationId=${targetConversationId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setOffers(data.offers || []);
      } else if (response.status === 401) {
        console.error('❌ Authentication failed, user needs to log in again');
        // Clear invalid token and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      } else {
        console.error('❌ Failed to fetch offers:', response.status);
      }
    } catch (error) {
      console.error('❌ Error fetching offers:', error);
    }
  };

  // Handle offer actions
  const handleViewOffer = (offerId: string) => {
    // Navigate to offer details page
    window.open(`/offers/${offerId}`, '_blank');
  };

  const handleAcceptOffer = async (offerId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/offers/${offerId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'accepted' })
      });
      
      if (response.ok) {
        await fetchOffers(); // Refresh offers
        alert('Offer accepted successfully!');
      } else {
        const responseText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(responseText);
        } catch (parseError) {
          errorData = { message: responseText || 'Unknown error' };
        }
        
        console.error('❌ Failed to accept offer:', errorData);
        alert(`Failed to accept offer: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error accepting offer:', error);
      alert('Failed to accept offer. Please try again.');
    }
  };

  const handleDeclineOffer = async (offerId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/offers/${offerId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'rejected' })
      });
      
      if (response.ok) {
        await fetchOffers(); // Refresh offers
        alert('Offer declined successfully!');
      } else {
        const responseText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(responseText);
        } catch (parseError) {
          errorData = { message: responseText || 'Unknown error' };
        }
        
        console.error('❌ Failed to decline offer:', errorData);
        alert(`Failed to decline offer: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error declining offer:', error);
      alert('Failed to decline offer. Please try again.');
    }
  };

  // Fetch offers when conversation changes
  useEffect(() => {
    if (conversationId) {
      fetchOffers();
    }
  }, [conversationId]);

  // Poll for offer updates every 3 seconds
  useEffect(() => {
    if (!conversationId) return;

    const pollOffers = () => {
      fetchOffers();
    };

    const interval = setInterval(pollOffers, 3000); // Poll every 3 seconds

    return () => clearInterval(interval);
  }, [conversationId]);

  // Handle offer submission
  const handleSubmitOffer = async (offerData: {
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
  }) => {
    try {
      const response = await fetch('/api/offers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          productId,
          offerPrice: offerData.offerPrice,
          quantity: offerData.quantity,
          message: offerData.message,
          deliveryAddress: offerData.deliveryAddress,
          deliveryOptions: offerData.deliveryOptions,
          paymentTerms: offerData.paymentTerms,
          expirationHours: offerData.expirationHours
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit offer');
      }

      const result = await response.json();
      console.log('✅ Offer submitted successfully:', result);
      
      // Update conversationId if it was created
      if (result.offer?.conversationId && result.offer.conversationId !== conversationId) {
        console.log('🔄 Updating conversationId from offer response:', result.offer.conversationId);
        setConversationId(result.offer.conversationId);
      }
      
      // Refresh offers to show the new one - use the conversationId from the response
      const targetConversationId = result.offer?.conversationId || conversationId;
      if (targetConversationId) {
        console.log('🔄 Fetching offers for conversationId:', targetConversationId);
        await fetchOffersForConversation(targetConversationId);
      }
      
      // You could add a success message here
      alert('Offer submitted successfully!');
      
    } catch (error) {
      console.error('❌ Error submitting offer:', error);
      alert('Failed to submit offer. Please try again.');
      throw error;
    }
  };

  return (
    <Card className="h-full flex flex-col border-0 rounded-none">
      {/* Header - Fixed */}
      <CardHeader className="flex-shrink-0 pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <button 
                onClick={() => {
                  const route = (otherPartyType === 'farmer' || otherPartyType === 'trader') 
                    ? `/seller/${otherPartyId}` 
                    : `/user/${otherPartyId}`;
                  window.open(route, '_blank');
                }}
                className="text-left hover:text-primary transition-colors"
              >
                {otherPartyName}
              </button>
              <AccountTypeBadge 
                userType={otherPartyType}
                accountType="individual"
                size="sm"
                className="mr-1"
              />
            </CardTitle>
          </div>
          <div className="flex gap-2">
            {/* Offer button - show for buyers and traders, but only when chatting with sellers (farmers/traders) */}
            {effectiveCurrentUser && 
             (effectiveCurrentUser.userType === 'buyer' || effectiveCurrentUser.userType === 'trader') && 
             (otherPartyType === 'farmer' || otherPartyType === 'trader') && (
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-3 text-xs"
                onClick={() => setShowOfferModal(true)}
              >
                <Handshake className="w-3 h-3 mr-1" />
                Make Offer
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      {/* Content Area - Flexible */}
      <CardContent className="flex-1 flex flex-col p-0 min-h-0">
        {/* Simplified Verification Status Alert - Public View (2-Stage System) */}
        {otherPartyVerificationStatus && (
          <div className={`mx-4 mt-3 p-3 rounded-lg border ${
            otherPartyVerificationStatus.trustLevel !== 'unverified' 
              ? 'bg-green-50 border-green-200'
              : 'bg-yellow-50 border-yellow-200'
          }`}>
            <div className="flex items-start gap-2">
              {otherPartyVerificationStatus.trustLevel === 'unverified' && (
                <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
              )}
              {otherPartyVerificationStatus.trustLevel !== 'unverified' && (
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
              )}
              <div className="flex-1">
                {otherPartyVerificationStatus.trustLevel === 'unverified' && (
                  <>
                    <p className="text-sm font-medium text-yellow-800">
                      Profile Not Confirmed
                    </p>
                    <p className="text-xs text-yellow-700 mt-1">
                      <span className="font-medium">{otherPartyName}</span> has not completed profile verification yet. 
                      Exercise appropriate caution when sharing personal information.
                    </p>
                  </>
                )}
                
                {otherPartyVerificationStatus.trustLevel !== 'unverified' && (
                  <>
                    <p className="text-sm font-medium text-green-800">
                      Verified {otherPartyType === 'farmer' ? 'Farmer' : otherPartyType === 'trader' ? 'Trader' : 'User'}
                    </p>
                    <p className="text-xs text-green-700 mt-1">
                      <span className="font-medium">{otherPartyName}</span> has completed profile verification 
                      and confirmed their identity.
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        )}


        <ScrollArea ref={scrollAreaRef} className="h-[220px] p-4">
          <div className="space-y-4 pb-4">
            {isLoading && combinedChatItems.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <div className="animate-pulse">Starting conversation...</div>
              </div>
            ) : combinedChatItems.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <p>No messages yet. Say hello to start the conversation!</p>
              </div>
            ) : (
              <>
                {/* Combined Messages and Offers */}
                {combinedChatItems.map((item, index) => {
                  if (item.type === 'message') {
                    const message = item.data;
                    const isOwnMessage = message.senderId === effectiveCurrentUser?.id;
                    const senderName = isOwnMessage ? effectiveCurrentUser?.name : otherPartyName;
                    const senderImage = isOwnMessage ? effectiveCurrentUser?.profileImage : otherPartyProfileImage;
                    
                    // Removed debug logging
                  
                  return (
                    <div
                      key={message.id}
                      className={`flex gap-2 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                    >
                      {/* Profile Image - Only show for received messages */}
                      {!isOwnMessage && (
                        <div className="flex-shrink-0">
                          <button 
                            onClick={() => {
                              const route = (otherPartyType === 'farmer' || otherPartyType === 'trader') 
                                ? `/seller/${otherPartyId}` 
                                : `/user/${otherPartyId}`;
                              window.open(route, '_blank');
                            }}
                            className="hover:opacity-80 transition-opacity"
                          >
                            <Avatar className="w-8 h-8">
                              <AvatarImage
                                src={senderImage || undefined}
                                alt={senderName || 'User'}
                              />
                              <AvatarFallback className="text-xs">
                                {senderName ? senderName.charAt(0).toUpperCase() : 'U'}
                              </AvatarFallback>
                            </Avatar>
                          </button>
                        </div>
                      )}
                      
                      <div
                        className={`max-w-[80%] p-3 rounded-lg ${
                          isOwnMessage
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-xs opacity-70">{formatTimestamp(message.timestamp)}</p>
                          {isOwnMessage && (message as any).status && (
                            <span className="text-xs opacity-70 ml-2">
                              {(message as any).status === 'sending' ? '⏳' : 
                               (message as any).status === 'sent' ? '✓' : 
                               (message as any).status === 'delivered' ? '✓✓' : 
                               (message as any).status === 'read' ? '✓✓' : ''}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Profile Image - Only show for sent messages */}
                      {isOwnMessage && (
                        <div className="flex-shrink-0">
                          <Avatar className="w-8 h-8">
                            <AvatarImage
                              src={senderImage || undefined}
                              alt={senderName || 'User'}
                            />
                            <AvatarFallback className="text-xs">
                              {senderName ? senderName.charAt(0).toUpperCase() : 'U'}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                      )}
                    </div>
                  );
                  } else if (item.type === 'offer') {
                    const offer = item.data;
                    const isFromCurrentUser = offer.buyer?.id === effectiveCurrentUser?.id;
                    // Removed debug logging
                    
                    return (
                      <div
                        key={offer.id}
                        className={`flex ${isFromCurrentUser ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className="max-w-[80%]">
                          <OfferCardCompact
                            offer={{
                              id: offer.id,
                              productName: offer.product?.name || productName,
                              productImage: offer.productImage,
                              offerPrice: offer.offerPrice,
                              quantity: offer.quantity,
                              message: offer.message,
                              status: offer.status,
                              deliveryAddress: offer.deliveryAddress,
                              deliveryOptions: offer.deliveryOptions || [],
                              paymentTerms: offer.paymentTerms || [],
                              expiresAt: offer.expiresAt,
                              createdAt: offer.createdAt,
                              buyer: offer.buyer,
                              seller: offer.seller
                            }}
                            isFromCurrentUser={isFromCurrentUser}
                            onViewOffer={handleViewOffer}
                          />
                        </div>
                      </div>
                    );
                  }
                  return null;
                })}
              </>
            )}
          </div>
        </ScrollArea>

        {/* Message Input - Always present, never conditionally rendered */}
        <div className="flex-shrink-0 p-4 border-t bg-card">
          <div className="flex gap-2">
            <Input
              placeholder={
                !conversationId 
                  ? "Initializing..." 
                  : isLoading 
                  ? "Sending..." 
                  : "Type your message..."
              }
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading || !effectiveCurrentUser}
              className="flex-1"
              autoComplete="off"
              maxLength={1000}
            />
            <Button 
              onClick={handleSendMessage} 
              size="sm"
              disabled={isLoading || !newMessage.trim() || !effectiveCurrentUser}
              className="shrink-0"
            >
              {isLoading ? (
                <div className="w-4 h-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
          
          {/* Status Messages */}
          <div className="mt-2 space-y-1">
            {!conversationId && effectiveCurrentUser && !isLoading && (
              <p className="text-xs text-muted-foreground text-center">
                Ready to chat - type a message to start the conversation
              </p>
            )}
            {isLoading && (
              <p className="text-xs text-muted-foreground text-center">
                Setting up conversation...
              </p>
            )}
            {!effectiveCurrentUser && !authLoading && (
              <p className="text-xs text-muted-foreground text-center">
                Please log in to send messages
              </p>
            )}
            {authLoading && (
              <p className="text-xs text-muted-foreground text-center">
                Loading user data...
              </p>
            )}
            
          </div>
        </div>
      </CardContent>

      {/* Offer Modal */}
      <SimpleOfferModal
        isOpen={showOfferModal}
        onClose={() => setShowOfferModal(false)}
        product={{
          id: productId,
          name: productName,
          price: 0, // We don't have product price in this context, could be passed as prop
          unit: 'kg', // Default unit, could be passed as prop
          category: 'Agricultural' // Default category, could be passed as prop
        }}
        seller={{
          id: otherPartyId,
          name: otherPartyName,
          location: otherPartyLocation
        }}
        onSubmit={handleSubmitOffer}
      />

      {/* Offer Details Modal */}
      <SimpleOfferDetailsModal
        isOpen={showOfferDetailsModal}
        onClose={() => {
          setShowOfferDetailsModal(false);
          setSelectedOffer(null);
        }}
        offer={selectedOffer}
        isFromCurrentUser={selectedOffer ? selectedOffer.buyer?.id === effectiveCurrentUser?.id : false}
        currentUserId={effectiveCurrentUser?.id}
        onStatusUpdate={async (offerId, newStatus, reason) => {
          try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/offers/${offerId}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({ 
                status: newStatus, 
                cancellationReason: reason 
              })
            });
            
            if (response.ok) {
              console.log('✅ Offer status updated successfully');
              await fetchOffers(); // Refresh offers
              alert(`Offer ${newStatus} successfully!`);
            } else {
              const errorData = await response.json();
              console.error('❌ Failed to update offer status:', errorData);
              alert(`Failed to update offer status: ${errorData.message || 'Unknown error'}`);
            }
          } catch (error) {
            console.error('Error updating offer status:', error);
            alert('Failed to update offer status. Please try again.');
          }
        }}
      />
    </Card>
  );
}