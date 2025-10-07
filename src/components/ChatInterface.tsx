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
// Offer-related imports removed for now - will be added later

interface Message {
  id: string;
  sender: 'user' | 'seller';
  content: string;
  timestamp: string;
}

interface ChatInterfaceProps {
  otherPartyName: string;
  otherPartyType: 'farmer' | 'trader';
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
      console.log('✅ ChatInterface using passed user:', passedCurrentUser.email || passedCurrentUser.name);
      return passedCurrentUser;
    }
    
    if (authUser?.id) {
      console.log('✅ ChatInterface using auth user:', authUser.email || authUser.name);
      return authUser;
    }
    
    if (authLoading) {
      console.log('⏳ ChatInterface: Auth loading...');
      return null;
    }
    
    console.log('❌ ChatInterface: No user available - user needs to log in');
    return null;
  }, [passedCurrentUser?.id, authUser?.id, authLoading]);
  
  // Debug current user state - simplified
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 ChatInterface - Authentication status:', {
        hasPassedUser: !!passedCurrentUser,
        hasAuthUser: !!authUser,
        hasEffectiveUser: !!effectiveCurrentUser,
        effectiveUserId: effectiveCurrentUser?.id,
        timestamp: new Date().toISOString()
      });
    }
  }, [passedCurrentUser?.id, authUser?.id, effectiveCurrentUser?.id]);

  // Debug otherPartyProfileImage prop
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔍 ChatInterface - otherPartyProfileImage prop:', {
        otherPartyProfileImage,
        otherPartyName,
        otherPartyId,
        timestamp: new Date().toISOString()
      });
    }
  }, [otherPartyProfileImage, otherPartyName, otherPartyId]);
  
  const { messages, sendMessage, startConversation, loadMessages, startPolling } = useChat();
  const [newMessage, setNewMessage] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(initialConversationId || null);
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  // Offer functionality removed for now - will be added later

  // Get current conversation messages - moved up to avoid initialization order issues
  const currentMessages = useMemo(() => {
    const msgs = conversationId ? messages[conversationId] || [] : [];
    return msgs;
  }, [conversationId, messages]);
  
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
      loadMessages(conversationId);
    }
  }, [conversationId, effectiveCurrentUser?.id, loadMessages]);

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
        toast.warning('Chat recovered from loading state');
      }, 10000); // 10 second timeout
      
      return () => clearTimeout(timeout);
    }
  }, [isLoading]);
  
  // Offer functionality removed for now - will be added later


  // Note: localStorage cleanup removed - now using Supabase offers table

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
        toast.error('Failed to start conversation');
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
      
      const sentMessage = await sendMessage(currentConversationId, messageToSend, effectiveCurrentUser.id);
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
      toast.error('Failed to send message. Please try again.');
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

  // Offer handling functions removed for now - will be added later
  /*const handleCreateOffer = async (offer: Omit<Offer, "id" | "createdAt" | "updatedAt">) => {
    console.log('🎯 Creating offer - conversation state before:', {
      conversationId,
      productId,
      otherPartyId,
      currentUserId: passedCurrentUser?.id,
      conversationKey
    });

    const newOffer: Offer = {
      ...offer,
      id: `offer_${Date.now()}`,
      createdAt: new Date().toISOString()
    };

    try {
      // Save to Supabase
      const savedOffer = await OffersService.createOffer({
        ...offer,
        conversationId: conversationId!,
        productId,
        buyerId: effectiveCurrentUser.id,
        otherPartyId
      });
      
      console.log('💾 Offer saved to Supabase:', savedOffer.id);
      
      // Update local state with the saved offer
      setOffers(prevOffers => {
        console.log('📝 Updating offers state - previous count:', prevOffers.length);
        // Check if offer already exists to prevent duplicates
        const existingOffer = prevOffers.find(o => o.id === savedOffer.id);
        if (existingOffer) {
          console.log('⚠️ Duplicate offer detected, skipping');
          return prevOffers; // Don't add duplicate
        }
        console.log('✅ Adding new offer to state');
        return [...prevOffers, savedOffer];
      });
      
      // Close modal
      setShowCreateOffer(false);
      
      // Success feedback
      toast.success('Offer sent successfully!');
      
      console.log('🎯 Offer creation complete - conversation state after:', {
        conversationId,
        productId,
        otherPartyId,
        currentUserId: passedCurrentUser?.id,
        conversationKey
      });
      
      // Scroll to bottom to show the new offer
      setTimeout(() => {
        if (scrollAreaRef.current) {
          const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
          if (scrollContainer) {
            scrollContainer.scrollTop = scrollContainer.scrollHeight;
          }
        }
      }, 100);
      
    } catch (error) {
      console.error('❌ Failed to save offer:', error);
      toast.error('Failed to create offer');
    }
  };

  const handleAcceptOffer = (offerId: string) => {
    updateOfferStatus(offerId, "accepted", { acceptedAt: new Date().toISOString() });
  };

  const handleDeclineOffer = (offerId: string) => {
    updateOfferStatus(offerId, "declined");
  };

  const handleMarkCompleted = (offerId: string) => {
    updateOfferStatus(offerId, "completed", { completedAt: new Date().toISOString() });
  };

  const handleQuickAction = (offerId: string, action: string) => {
    switch (action) {
      case 'accept':
        handleAcceptOffer(offerId);
        break;
      case 'decline':
        handleDeclineOffer(offerId);
        break;
      case 'in_progress':
        updateOfferStatus(offerId, "in_progress");
        break;
      case 'shipped':
        updateOfferStatus(offerId, "shipped", { shippedAt: new Date().toISOString() });
        break;
      case 'delivered':
        updateOfferStatus(offerId, "delivered", { deliveredAt: new Date().toISOString() });
        break;
      case 'completed':
        updateOfferStatus(offerId, "completed", { completedAt: new Date().toISOString() });
        break;
      case 'cancel':
        updateOfferStatus(offerId, "cancelled");
        break;
      default:
        console.warn('Unknown quick action:', action);
    }
  };

  const handleUpdateOfferStatus = (offerId: string, status: Offer['status'], updates?: any) => {
    updateOfferStatus(offerId, status, updates);
  };

  const updateOfferStatus = async (offerId: string, status: Offer["status"], updates: Partial<Offer> = {}) => {
    try {
      await OffersService.updateOfferStatus(offerId, status, updates);
      
      setOffers(prev => prev.map(offer => 
        offer.id === offerId 
          ? { ...offer, status, ...updates }
          : offer
      ));
      
      toast.success(`Offer ${status}!`);
    } catch (error) {
      console.error('Failed to update offer:', error);
      toast.error('Failed to update offer');
    }
  };*/

  // Offer-related variables removed for now - will be added later

  return (
    <Card className="h-full flex flex-col border-0 rounded-none">
      {/* Header - Fixed */}
      <CardHeader className="flex-shrink-0 pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {otherPartyName}
              <AccountTypeBadge 
                userType={otherPartyType}
                accountType="individual"
                size="sm"
                className="mr-1"
              />
            </CardTitle>
          </div>
          <div className="flex gap-2">
            {/* Offer button removed for now - will be added later */}
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
            {isLoading && currentMessages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <div className="animate-pulse">Starting conversation...</div>
              </div>
            ) : currentMessages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <p>No messages yet. Say hello to start the conversation!</p>
              </div>
            ) : (
              <>
                {/* Messages */}
                {currentMessages.map((message) => {
                  const isOwnMessage = message.senderId === effectiveCurrentUser?.id;
                  const senderName = isOwnMessage ? effectiveCurrentUser?.name : otherPartyName;
                  const senderImage = isOwnMessage ? effectiveCurrentUser?.profileImage : otherPartyProfileImage;
                  
                  // Debug logging for avatar issue
                  if (process.env.NODE_ENV === 'development') {
                    console.log('🔍 Message avatar debug:', {
                      messageId: message.id,
                      messageSenderId: message.senderId,
                      currentUserId: effectiveCurrentUser?.id,
                      isOwnMessage,
                      senderName,
                      expectedAvatar: senderName ? senderName.charAt(0).toUpperCase() : 'U',
                      otherPartyProfileImage,
                      senderImage,
                      effectiveCurrentUserProfileImage: effectiveCurrentUser?.profileImage
                    });
                  }
                  
                  return (
                    <div
                      key={message.id}
                      className={`flex gap-2 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                    >
                      {/* Profile Image - Only show for received messages */}
                      {!isOwnMessage && (
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
                          {isOwnMessage && message.status && (
                            <span className="text-xs opacity-70 ml-2">
                              {message.status === 'sending' ? '⏳' : 
                               message.status === 'sent' ? '✓' : 
                               message.status === 'delivered' ? '✓✓' : 
                               message.status === 'read' ? '✓✓' : ''}
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
                })}
                
                {/* Offer display removed for now - will be added later */}
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

      {/* Offer modals removed for now - will be added later */}
    </Card>
  );
}