-- Create reviews system for completed offers
-- This allows both buyer and seller to review each other after a completed transaction

-- Create offer_reviews table
CREATE TABLE IF NOT EXISTS offer_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    offer_id UUID NOT NULL REFERENCES offers(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reviewee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure each party can only review the other once per offer
    UNIQUE(offer_id, reviewer_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_offer_reviews_offer_id ON offer_reviews(offer_id);
CREATE INDEX IF NOT EXISTS idx_offer_reviews_reviewer_id ON offer_reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_offer_reviews_reviewee_id ON offer_reviews(reviewee_id);
CREATE INDEX IF NOT EXISTS idx_offer_reviews_created_at ON offer_reviews(created_at DESC);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_offer_reviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER trigger_update_offer_reviews_updated_at
    BEFORE UPDATE ON offer_reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_offer_reviews_updated_at();

-- Add helpful comments
COMMENT ON TABLE offer_reviews IS 'Reviews left by users for completed offers';
COMMENT ON COLUMN offer_reviews.offer_id IS 'The completed offer being reviewed';
COMMENT ON COLUMN offer_reviews.reviewer_id IS 'The user leaving the review';
COMMENT ON COLUMN offer_reviews.reviewee_id IS 'The user being reviewed';
COMMENT ON COLUMN offer_reviews.rating IS 'Rating from 1-5 stars';
COMMENT ON COLUMN offer_reviews.comment IS 'Optional text comment about the experience';
