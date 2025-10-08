-- Update offers table to include new fields
ALTER TABLE offers 
ADD COLUMN IF NOT EXISTS payment_method VARCHAR(20) DEFAULT 'cash' CHECK (payment_method IN ('cash', 'bank_transfer', 'mobile_payment', 'credit_card')),
ADD COLUMN IF NOT EXISTS delivery_address JSONB,
ADD COLUMN IF NOT EXISTS delivery_options TEXT[],
ADD COLUMN IF NOT EXISTS payment_terms TEXT[];

-- Add comments
COMMENT ON COLUMN offers.payment_method IS 'Payment method selected by buyer';
COMMENT ON COLUMN offers.delivery_address IS 'Delivery address for shipping (JSON format)';
COMMENT ON COLUMN offers.delivery_options IS 'Selected delivery options (array)';
COMMENT ON COLUMN offers.payment_terms IS 'Selected payment terms (array)';
