-- Update offers table to support comprehensive status workflow
-- This script adds new statuses and updates the existing offers table

-- First, let's check current offers table structure
-- Then update the status column to support new workflow

-- Update the offers table to include all status stages
ALTER TABLE offers 
ADD COLUMN IF NOT EXISTS status_updated_at TIMESTAMP DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS shipped_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS received_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS cancelled_by UUID REFERENCES users(id),
ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;

-- Update existing offers to have proper timestamps
UPDATE offers 
SET status_updated_at = created_at 
WHERE status_updated_at IS NULL;

-- Create a function to automatically update status_updated_at
CREATE OR REPLACE FUNCTION update_offer_status_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.status_updated_at = NOW();
    
    -- Set specific timestamps based on status
    CASE NEW.status
        WHEN 'shipped' THEN
            NEW.shipped_at = NOW();
        WHEN 'to_receive' THEN
            NEW.received_at = NOW();
        WHEN 'completed' THEN
            NEW.completed_at = NOW();
        WHEN 'cancelled' THEN
            NEW.cancelled_at = NOW();
        ELSE
            -- Keep existing timestamps for other statuses
            NULL;
    END CASE;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update timestamps
DROP TRIGGER IF EXISTS trigger_update_offer_status_timestamp ON offers;
CREATE TRIGGER trigger_update_offer_status_timestamp
    BEFORE UPDATE ON offers
    FOR EACH ROW
    WHEN (OLD.status IS DISTINCT FROM NEW.status)
    EXECUTE FUNCTION update_offer_status_timestamp();

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_offers_status ON offers(status);
CREATE INDEX IF NOT EXISTS idx_offers_buyer_status ON offers(buyer_id, status);
CREATE INDEX IF NOT EXISTS idx_offers_seller_status ON offers(seller_id, status);
CREATE INDEX IF NOT EXISTS idx_offers_status_updated_at ON offers(status_updated_at);

-- Create a view for offer status history (optional)
CREATE OR REPLACE VIEW offer_status_summary AS
SELECT 
    o.id,
    o.buyer_id,
    o.seller_id,
    o.product_id,
    o.status,
    o.offer_price,
    o.quantity,
    o.created_at,
    o.status_updated_at,
    o.shipped_at,
    o.received_at,
    o.completed_at,
    o.cancelled_at,
    o.cancelled_by,
    o.cancellation_reason,
    p.name as product_name,
    buyer.name as buyer_name,
    seller.name as seller_name,
    CASE 
        WHEN o.status = 'pending' THEN 'Offer submitted, waiting for seller response'
        WHEN o.status = 'accepted' THEN 'Offer accepted, preparing for shipment'
        WHEN o.status = 'rejected' THEN 'Offer rejected by seller'
        WHEN o.status = 'to_ship' THEN 'Ready to ship, seller preparing package'
        WHEN o.status = 'shipped' THEN 'Package shipped, in transit'
        WHEN o.status = 'to_receive' THEN 'Package delivered, buyer to confirm receipt'
        WHEN o.status = 'completed' THEN 'Transaction completed successfully'
        WHEN o.status = 'cancelled' THEN 'Offer cancelled'
        WHEN o.status = 'expired' THEN 'Offer expired'
        ELSE 'Unknown status'
    END as status_description
FROM offers o
LEFT JOIN products p ON o.product_id = p.id
LEFT JOIN users buyer ON o.buyer_id = buyer.id
LEFT JOIN users seller ON o.seller_id = seller.id;

-- Grant permissions
GRANT SELECT ON offer_status_summary TO PUBLIC;
