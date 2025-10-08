-- Add ready_to_pickup status to the offers table
-- First, let's check if the status column uses an enum or is just text

-- If it's using an enum, we need to add the new value
DO $$ 
BEGIN
    -- Check if the status column is using an enum type
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'offers' 
        AND column_name = 'status' 
        AND data_type = 'USER-DEFINED'
    ) THEN
        -- Add the new enum value if it doesn't exist
        BEGIN
            ALTER TYPE offer_status_enum ADD VALUE 'ready_to_pickup';
        EXCEPTION
            WHEN duplicate_object THEN
                -- Value already exists, do nothing
                NULL;
        END;
    END IF;
END $$;

-- If the status column is just text (VARCHAR), no changes needed
-- The application will handle the new status value

-- Add a comment to document the new status
COMMENT ON COLUMN offers.status IS 'Offer status: pending, accepted, rejected, to_ship, ready_to_pickup, shipped, to_receive, completed, cancelled, expired';
