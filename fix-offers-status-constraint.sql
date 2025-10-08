-- Fix the offers status check constraint to include ready_to_pickup
-- First, drop the existing constraint
ALTER TABLE offers DROP CONSTRAINT IF EXISTS offers_status_check;

-- Add the new constraint with all valid statuses
ALTER TABLE offers ADD CONSTRAINT offers_status_check 
CHECK (status IN (
  'pending', 
  'accepted', 
  'rejected', 
  'to_ship', 
  'ready_to_pickup', 
  'shipped', 
  'to_receive', 
  'completed', 
  'cancelled', 
  'expired'
));
