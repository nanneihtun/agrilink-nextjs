"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { 
  Star, 
  MessageSquare, 
  User, 
  Calendar,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import { AccountTypeBadge } from './UserBadgeSystem';

interface Review {
  id: string;
  rating: number;
  comment?: string;
  createdAt: string;
  updatedAt: string;
  reviewer: {
    id: string;
    name: string;
    userType: string;
    accountType: string;
    profileImage?: string;
  };
  reviewee: {
    id: string;
    name: string;
    userType: string;
    accountType: string;
    profileImage?: string;
  };
}

interface ReviewSectionProps {
  offerId: string;
  currentUserId: string;
  isBuyer: boolean;
  otherParty: {
    id: string;
    name: string;
    userType: string;
    accountType: string;
    image?: string;
  };
  onReviewSubmitted?: () => void;
}

export function ReviewSection({ 
  offerId, 
  currentUserId, 
  isBuyer, 
  otherParty, 
  onReviewSubmitted 
}: ReviewSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [hasReviewed, setHasReviewed] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, [offerId]);

  const fetchReviews = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/reviews?offerId=${offerId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setReviews(data.reviews || []);
        
        // Check if current user has already reviewed
        const userReview = data.reviews.find((review: Review) => 
          review.reviewer.id === currentUserId
        );
        setHasReviewed(!!userReview);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async () => {
    if (rating === 0) {
      alert('Please select a rating');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          offerId,
          rating,
          comment: comment.trim() || null
        })
      });

      if (response.ok) {
        setShowReviewForm(false);
        setRating(0);
        setComment('');
        setHasReviewed(true);
        await fetchReviews(); // Refresh reviews
        onReviewSubmitted?.();
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to submit review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating: number, interactive = false, onRatingChange?: (rating: number) => void) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${
              star <= rating 
                ? 'text-yellow-400 fill-yellow-400' 
                : 'text-gray-300'
            } ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''}`}
            onClick={interactive ? () => onRatingChange?.(star) : undefined}
          />
        ))}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getRatingLabel = (rating: number) => {
    switch (rating) {
      case 1: return 'Poor';
      case 2: return 'Fair';
      case 3: return 'Good';
      case 4: return 'Very Good';
      case 5: return 'Excellent';
      default: return '';
    }
  };

  if (loading) {
    return (
      <Card className="border-primary/30">
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
              <div className="h-3 bg-gray-200 rounded"></div>
              <div className="h-3 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/30">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ThumbsUp className="w-5 h-5 text-green-600" />
          Reviews & Feedback
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Review Form */}
        {!hasReviewed && (
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">
                Leave a review for {otherParty.name}
              </h3>
              {!showReviewForm && (
                <Button
                  onClick={() => setShowReviewForm(true)}
                  size="sm"
                >
                  Write Review
                </Button>
              )}
            </div>

            {showReviewForm && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rating *
                  </label>
                  <div className="flex items-center gap-3">
                    {renderStars(rating, true, setRating)}
                    {rating > 0 && (
                      <span className="text-sm text-gray-600">
                        {getRatingLabel(rating)}
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Comment (optional)
                  </label>
                  <Textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Share your experience with this transaction..."
                    rows={3}
                    className="resize-none"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleSubmitReview}
                    disabled={submitting || rating === 0}
                  >
                    {submitting ? 'Submitting...' : 'Submit Review'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowReviewForm(false);
                      setRating(0);
                      setComment('');
                    }}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Reviews List */}
        {reviews.length > 0 ? (
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">
              Reviews ({reviews.length})
            </h3>
            {reviews.map((review) => (
              <div key={review.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={review.reviewer.profileImage} />
                    <AvatarFallback>
                      <User className="w-5 h-5" />
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold">{review.reviewer.name}</span>
                      <AccountTypeBadge 
                        userType={review.reviewer.userType}
                        accountType={review.reviewer.accountType}
                      />
                      <span className="text-sm text-gray-500">
                        {formatDate(review.createdAt)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                      {renderStars(review.rating)}
                      <span className="text-sm text-gray-600">
                        {getRatingLabel(review.rating)}
                      </span>
                    </div>

                    {review.comment && (
                      <p className="text-gray-700 text-sm leading-relaxed">
                        "{review.comment}"
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No reviews yet</p>
            <p className="text-sm">Be the first to leave a review!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
