-- Add conversation_id column to offers table
ALTER TABLE offers ADD COLUMN IF NOT EXISTS conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_offers_conversation_id ON offers(conversation_id);
