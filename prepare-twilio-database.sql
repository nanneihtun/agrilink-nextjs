-- Prepare database for Twilio verification while keeping fallback support
-- Run this to add Twilio-specific fields to existing tables

-- Add Twilio fields to verification_codes table
ALTER TABLE verification_codes 
ADD COLUMN IF NOT EXISTS twilio_sid TEXT,
ADD COLUMN IF NOT EXISTS verification_method TEXT DEFAULT 'fallback', -- 'fallback' or 'twilio'
ADD COLUMN IF NOT EXISTS twilio_status TEXT, -- 'pending', 'approved', 'denied', 'expired'
ADD COLUMN IF NOT EXISTS attempts INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_attempt_at TIMESTAMP WITH TIME ZONE;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_verification_codes_twilio_sid ON verification_codes(twilio_sid);
CREATE INDEX IF NOT EXISTS idx_verification_codes_method ON verification_codes(verification_method);
CREATE INDEX IF NOT EXISTS idx_verification_codes_expires ON verification_codes(expiresAt);

-- Add phone verification tracking to user_verification table
ALTER TABLE user_verification 
ADD COLUMN IF NOT EXISTS phone_verification_method TEXT DEFAULT 'fallback', -- 'fallback' or 'twilio'
ADD COLUMN IF NOT EXISTS phone_verified_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS phone_verification_attempts INTEGER DEFAULT 0;

-- Create a table to track Twilio service configuration
CREATE TABLE IF NOT EXISTS twilio_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  environment TEXT NOT NULL, -- 'development', 'staging', 'production'
  account_sid TEXT,
  auth_token_encrypted TEXT, -- Store encrypted, never plain text
  verify_service_sid TEXT,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default development config (fallback mode)
INSERT INTO twilio_config (environment, is_active) 
VALUES ('development', false)
ON CONFLICT DO NOTHING;

-- Add comments for documentation
COMMENT ON COLUMN verification_codes.twilio_sid IS 'Twilio verification SID for tracking';
COMMENT ON COLUMN verification_codes.verification_method IS 'Method used: fallback or twilio';
COMMENT ON COLUMN verification_codes.twilio_status IS 'Status from Twilio API';
COMMENT ON COLUMN verification_codes.attempts IS 'Number of verification attempts';
COMMENT ON COLUMN user_verification.phone_verification_method IS 'Method used for phone verification';
COMMENT ON COLUMN user_verification.phone_verified_at IS 'When phone was verified';
COMMENT ON COLUMN user_verification.phone_verification_attempts IS 'Total verification attempts';
