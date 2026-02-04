-- Add missing party features columns
ALTER TABLE parties 
    ADD COLUMN IF NOT EXISTS payment_type TEXT DEFAULT 'divide',
    ADD COLUMN IF NOT EXISTS require_level BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS required_levels TEXT[] DEFAULT '{}',
    ADD COLUMN IF NOT EXISTS no_walk_in BOOLEAN DEFAULT FALSE;

-- Comments
COMMENT ON COLUMN parties.payment_type IS 'Payment method: divide or fixed';
COMMENT ON COLUMN parties.require_level IS 'Whether skill level check is required';
COMMENT ON COLUMN parties.required_levels IS 'Array of acceptable skill levels';
COMMENT ON COLUMN parties.no_walk_in IS 'If true, prevents walk-in guests';
