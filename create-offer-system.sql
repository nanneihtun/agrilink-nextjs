-- Complete Offer System Database Schema
-- Inspired by Carousell with full transaction workflow

-- Create offers table with complete status workflow
CREATE TABLE IF NOT EXISTS offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  offer_price DECIMAL(10,2) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  message TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN (
    'pending', 'accepted', 'confirmed', 'preparing', 
    'shipped', 'picked_up', 'delivered', 'completed', 'declined', 'expired'
  )),
  delivery_method VARCHAR(20) DEFAULT 'pickup' CHECK (delivery_method IN ('pickup', 'shipping')),
  expires_at TIMESTAMP,
  accepted_at TIMESTAMP,
  confirmed_at TIMESTAMP,
  shipped_at TIMESTAMP,
  delivered_at TIMESTAMP,
  completed_at TIMESTAMP,
  auto_complete_at TIMESTAMP, -- 7 days after shipped/picked_up
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_offers_product_id ON offers(product_id);
CREATE INDEX IF NOT EXISTS idx_offers_buyer_id ON offers(buyer_id);
CREATE INDEX IF NOT EXISTS idx_offers_seller_id ON offers(seller_id);
CREATE INDEX IF NOT EXISTS idx_offers_status ON offers(status);
CREATE INDEX IF NOT EXISTS idx_offers_auto_complete ON offers(auto_complete_at) WHERE auto_complete_at IS NOT NULL;

-- Create function to auto-complete offers after 7 days
CREATE OR REPLACE FUNCTION auto_complete_offers()
RETURNS void AS $$
BEGIN
  UPDATE offers 
  SET 
    status = 'completed',
    completed_at = NOW(),
    updated_at = NOW()
  WHERE 
    status IN ('shipped', 'picked_up') 
    AND auto_complete_at IS NOT NULL 
    AND auto_complete_at <= NOW();
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_offers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_offers_updated_at
  BEFORE UPDATE ON offers
  FOR EACH ROW
  EXECUTE FUNCTION update_offers_updated_at();

-- Create trigger to set auto_complete_at when status changes to shipped/picked_up
CREATE OR REPLACE FUNCTION set_auto_complete_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status IN ('shipped', 'picked_up') AND OLD.status NOT IN ('shipped', 'picked_up') THEN
    NEW.auto_complete_at = NOW() + INTERVAL '7 days';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_auto_complete_at
  BEFORE UPDATE ON offers
  FOR EACH ROW
  EXECUTE FUNCTION set_auto_complete_at();

-- Create reviews table for after transaction completion
CREATE TABLE IF NOT EXISTS offer_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  offer_id UUID NOT NULL REFERENCES offers(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reviewee_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(offer_id, reviewer_id) -- One review per user per offer
);

-- Create indexes for reviews
CREATE INDEX IF NOT EXISTS idx_offer_reviews_offer_id ON offer_reviews(offer_id);
CREATE INDEX IF NOT EXISTS idx_offer_reviews_reviewer_id ON offer_reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_offer_reviews_reviewee_id ON offer_reviews(reviewee_id);

COMMENT ON TABLE offers IS 'Complete offer system with full transaction workflow';
COMMENT ON TABLE offer_reviews IS 'Reviews after offer completion';
