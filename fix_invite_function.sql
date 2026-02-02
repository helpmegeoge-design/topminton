-- Fix: Update invite_user_by_short_id function to match actual notifications schema
-- The original schema uses 'related_id' instead of 'data'

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

    -- Add user to party
    INSERT INTO public.party_members (party_id, user_id, status, payment_status)
    VALUES (p_party_id, target_user_id, 'joined', 'pending');

    -- Update party count
    UPDATE public.parties
    SET current_players = current_players + 1
    WHERE id = p_party_id;

    -- Create Notification (using related_id instead of data)
    INSERT INTO public.notifications (user_id, type, title, message, related_id, is_read, created_at)
    VALUES (
        target_user_id,
        'party_invite',
        'คำเชิญเข้าก๊วน',
        p_host_name || ' ได้ชวนคุณเข้าร่วมก๊วน "' || v_party_title || '"',
        p_party_id,
        false,
        NOW()
    );

    RETURN jsonb_build_object('success', true, 'message', 'Invite sent');
END;
$$ LANGUAGE plpgsql;
