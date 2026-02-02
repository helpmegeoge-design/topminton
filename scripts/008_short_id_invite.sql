-- 1. Add short_id column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS short_id TEXT UNIQUE;

-- 2. Function to generate unique short_id (2 Uppercase Letters + 3 Numbers)
CREATE OR REPLACE FUNCTION generate_unique_short_id()
RETURNS TEXT AS $$
DECLARE
    chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    nums TEXT := '0123456789';
    new_id TEXT;
    done BOOLEAN;
BEGIN
    done := FALSE;
    WHILE NOT done LOOP
        -- Generate: 2 letters + 3 numbers (e.g., AB123)
        new_id := 
            substr(chars, floor(random() * length(chars) + 1)::int, 1) ||
            substr(chars, floor(random() * length(chars) + 1)::int, 1) ||
            substr(nums, floor(random() * length(nums) + 1)::int, 1) ||
            substr(nums, floor(random() * length(nums) + 1)::int, 1) ||
            substr(nums, floor(random() * length(nums) + 1)::int, 1);
        
        -- Check uniqueness
        done := NOT EXISTS (SELECT 1 FROM public.profiles WHERE short_id = new_id);
    END LOOP;
    RETURN new_id;
END;
$$ LANGUAGE plpgsql;

-- 3. Backfill existing users (if they don't have one)
UPDATE public.profiles
SET short_id = generate_unique_short_id()
WHERE short_id IS NULL;

-- 4. Trigger to automatically assign short_id for new users
CREATE OR REPLACE FUNCTION set_short_id_for_new_user()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.short_id IS NULL THEN
        NEW.short_id := generate_unique_short_id();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_short_id ON public.profiles;
CREATE TRIGGER trigger_set_short_id
BEFORE INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION set_short_id_for_new_user();

-- 5. Add notifications table if not exists (checking schema, seems it was there but let's ensure structure)
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) NOT NULL,
    type TEXT NOT NULL, -- 'party_invite', 'payment_request', etc.
    title TEXT,
    message TEXT,
    data JSONB, -- stores { party_id: "..." }
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. RPC Function for Host to kick member
CREATE OR REPLACE FUNCTION kick_party_member(p_party_id UUID, p_user_id UUID)
RETURNS VOID AS $$
BEGIN
    DELETE FROM public.party_members
    WHERE party_id = p_party_id AND user_id = p_user_id;

    -- Decrement count (fallback if trigger doesn't exist, but it should)
    UPDATE public.parties
    SET current_players = (SELECT count(*) FROM public.party_members WHERE party_id = p_party_id)
    WHERE id = p_party_id;
END;
$$ LANGUAGE plpgsql;

-- 7. RPC Function to Invite User by Short ID
CREATE OR REPLACE FUNCTION invite_user_by_short_id(p_party_id UUID, p_short_id TEXT, p_host_name TEXT)
RETURNS JSONB AS $$
DECLARE
    target_user_id UUID;
    v_party_title TEXT;
BEGIN
    -- Find user
    SELECT id INTO target_user_id FROM public.profiles WHERE short_id = p_short_id;
    
    IF target_user_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', 'User not found');
    END IF;

    -- Check if already member
    IF EXISTS (SELECT 1 FROM public.party_members WHERE party_id = p_party_id AND user_id = target_user_id) THEN
        RETURN jsonb_build_object('success', false, 'message', 'User already in party');
    END IF;

    -- Get Party Name
    SELECT title INTO v_party_title FROM public.parties WHERE id = p_party_id;

    -- Create Notification
    INSERT INTO public.notifications (user_id, type, title, message, data)
    VALUES (
        target_user_id,
        'party_invite',
        'คำเชิญเข้าก๊วน',
        p_host_name || ' ได้ชวนคุณเข้าร่วมก๊วน "' || v_party_title || '"',
        jsonb_build_object('party_id', p_party_id)
    );

    RETURN jsonb_build_object('success', true, 'message', 'Invite sent');
END;
$$ LANGUAGE plpgsql;
