-- Topminton Sports Event Management System
-- Database Schema

-- =====================================================
-- 1. USER PROFILES & AUTHENTICATION
-- =====================================================

-- User profiles with LINE integration
-- Note: In production, this references auth.users(id). For migration, we use UUID directly.
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  line_user_id TEXT UNIQUE,
  display_name TEXT,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  ai_avatar_url TEXT,
  phone TEXT,
  email TEXT,
  skill_level TEXT DEFAULT 'beginner' CHECK (skill_level IN ('beginner', 'intermediate', 'advanced', 'pro')),
  is_admin BOOLEAN DEFAULT FALSE,
  is_verified BOOLEAN DEFAULT FALSE,
  total_games INTEGER DEFAULT 0,
  total_wins INTEGER DEFAULT 0,
  points INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 2. COURTS & VENUES
-- =====================================================

CREATE TABLE IF NOT EXISTS public.courts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT,
  district TEXT,
  province TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  phone TEXT,
  line_id TEXT,
  price_per_hour DECIMAL(10, 2),
  court_count INTEGER DEFAULT 1,
  amenities TEXT[],
  images TEXT[],
  rating DECIMAL(3, 2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 3. PARTIES (DAILY GROUPS)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.parties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  court_id UUID REFERENCES public.courts(id),
  host_id UUID REFERENCES public.profiles(id) NOT NULL,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  max_players INTEGER DEFAULT 8,
  current_players INTEGER DEFAULT 0,
  skill_level TEXT DEFAULT 'all' CHECK (skill_level IN ('all', 'beginner', 'intermediate', 'advanced', 'pro')),
  price_per_person DECIMAL(10, 2),
  shuttlecock_price DECIMAL(10, 2),
  shuttlecock_count INTEGER DEFAULT 0,
  court_hours DECIMAL(4, 2),
  total_cost DECIMAL(10, 2),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'full', 'in_progress', 'completed', 'cancelled')),
  qr_payment_url TEXT,
  payment_account_name TEXT,
  payment_account_number TEXT,
  payment_bank TEXT,
  is_public BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Party members
CREATE TABLE IF NOT EXISTS public.party_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  party_id UUID REFERENCES public.parties(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'joined' CHECK (status IN ('joined', 'confirmed', 'cancelled', 'no_show')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'verified', 'refunded')),
  payment_amount DECIMAL(10, 2),
  payment_slip_url TEXT,
  payment_verified_at TIMESTAMPTZ,
  payment_verified_by UUID REFERENCES public.profiles(id),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(party_id, user_id)
);

-- =====================================================
-- 4. MATCH ROOMS & PAIRINGS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.match_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  party_id UUID REFERENCES public.parties(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  room_type TEXT DEFAULT 'doubles' CHECK (room_type IN ('singles', 'doubles', 'mixed_doubles')),
  court_number INTEGER,
  status TEXT DEFAULT 'waiting' CHECK (status IN ('waiting', 'in_progress', 'completed')),
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Match pairings
CREATE TABLE IF NOT EXISTS public.match_pairings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_room_id UUID REFERENCES public.match_rooms(id) ON DELETE CASCADE NOT NULL,
  team_a_player1_id UUID REFERENCES public.profiles(id),
  team_a_player2_id UUID REFERENCES public.profiles(id),
  team_b_player1_id UUID REFERENCES public.profiles(id),
  team_b_player2_id UUID REFERENCES public.profiles(id),
  team_a_score INTEGER DEFAULT 0,
  team_b_score INTEGER DEFAULT 0,
  winner_team TEXT CHECK (winner_team IN ('A', 'B')),
  match_number INTEGER,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 5. TOURNAMENTS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.tournaments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  banner_url TEXT,
  court_id UUID REFERENCES public.courts(id),
  organizer_id UUID REFERENCES public.profiles(id) NOT NULL,
  tournament_type TEXT DEFAULT 'single_elimination' CHECK (tournament_type IN ('single_elimination', 'double_elimination', 'round_robin', 'swiss')),
  category TEXT DEFAULT 'mixed_doubles' CHECK (category IN ('mens_singles', 'womens_singles', 'mens_doubles', 'womens_doubles', 'mixed_doubles')),
  max_teams INTEGER DEFAULT 16,
  entry_fee DECIMAL(10, 2),
  prize_pool DECIMAL(10, 2),
  registration_start DATE,
  registration_end DATE,
  tournament_start DATE NOT NULL,
  tournament_end DATE,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'registration', 'in_progress', 'completed', 'cancelled')),
  rules TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tournament registrations
CREATE TABLE IF NOT EXISTS public.tournament_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID REFERENCES public.tournaments(id) ON DELETE CASCADE NOT NULL,
  player1_id UUID REFERENCES public.profiles(id) NOT NULL,
  player2_id UUID REFERENCES public.profiles(id),
  team_name TEXT,
  seed_number INTEGER,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'eliminated', 'winner')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'verified')),
  payment_slip_url TEXT,
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tournament_id, player1_id)
);

-- Tournament matches (bracket)
CREATE TABLE IF NOT EXISTS public.tournament_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID REFERENCES public.tournaments(id) ON DELETE CASCADE NOT NULL,
  round_number INTEGER NOT NULL,
  match_number INTEGER NOT NULL,
  round_name TEXT,
  team_a_id UUID REFERENCES public.tournament_registrations(id),
  team_b_id UUID REFERENCES public.tournament_registrations(id),
  team_a_score_set1 INTEGER,
  team_b_score_set1 INTEGER,
  team_a_score_set2 INTEGER,
  team_b_score_set2 INTEGER,
  team_a_score_set3 INTEGER,
  team_b_score_set3 INTEGER,
  winner_id UUID REFERENCES public.tournament_registrations(id),
  court_number INTEGER,
  scheduled_time TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 6. EXPENSES & PAYMENTS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.expense_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  party_id UUID REFERENCES public.parties(id) ON DELETE CASCADE NOT NULL,
  item_type TEXT NOT NULL CHECK (item_type IN ('court', 'shuttlecock', 'water', 'food', 'other')),
  description TEXT,
  quantity DECIMAL(10, 2),
  unit_price DECIMAL(10, 2),
  total_price DECIMAL(10, 2),
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.payment_slips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  party_member_id UUID REFERENCES public.party_members(id) ON DELETE CASCADE,
  tournament_registration_id UUID REFERENCES public.tournament_registrations(id) ON DELETE CASCADE,
  slip_image_url TEXT NOT NULL,
  amount DECIMAL(10, 2),
  payer_name TEXT,
  payment_date DATE,
  payment_time TIME,
  bank_name TEXT,
  reference_number TEXT,
  ai_verified BOOLEAN DEFAULT FALSE,
  ai_confidence DECIMAL(5, 4),
  ai_extracted_data JSONB,
  manual_verified BOOLEAN DEFAULT FALSE,
  verified_by UUID REFERENCES public.profiles(id),
  verified_at TIMESTAMPTZ,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 7. AI PROFILE PHOTOS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.ai_profile_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  original_photo_url TEXT NOT NULL,
  ai_generated_url TEXT,
  style TEXT DEFAULT 'badminton_pro' CHECK (style IN ('badminton_pro', 'casual', 'champion', 'anime')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- =====================================================
-- 8. NOTIFICATIONS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'general' CHECK (type IN ('general', 'party_invite', 'match_start', 'payment_reminder', 'payment_verified', 'tournament')),
  related_id UUID,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 9. ENABLE ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.party_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_pairings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_slips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_profile_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 10. RLS POLICIES
-- Note: These policies use auth.uid() which requires Supabase auth
-- They will be applied via Supabase SQL Editor after table creation
-- =====================================================

-- For now, allow all operations (to be secured later with proper RLS)
CREATE POLICY "profiles_select_all" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert_all" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "profiles_update_all" ON public.profiles FOR UPDATE USING (true);

CREATE POLICY "courts_select_all" ON public.courts FOR SELECT USING (true);
CREATE POLICY "courts_insert_all" ON public.courts FOR INSERT WITH CHECK (true);
CREATE POLICY "courts_update_all" ON public.courts FOR UPDATE USING (true);

CREATE POLICY "parties_select_all" ON public.parties FOR SELECT USING (true);
CREATE POLICY "parties_insert_all" ON public.parties FOR INSERT WITH CHECK (true);
CREATE POLICY "parties_update_all" ON public.parties FOR UPDATE USING (true);

CREATE POLICY "party_members_select_all" ON public.party_members FOR SELECT USING (true);
CREATE POLICY "party_members_insert_all" ON public.party_members FOR INSERT WITH CHECK (true);
CREATE POLICY "party_members_update_all" ON public.party_members FOR UPDATE USING (true);

CREATE POLICY "match_rooms_select_all" ON public.match_rooms FOR SELECT USING (true);
CREATE POLICY "match_rooms_insert_all" ON public.match_rooms FOR INSERT WITH CHECK (true);
CREATE POLICY "match_rooms_update_all" ON public.match_rooms FOR UPDATE USING (true);

CREATE POLICY "match_pairings_select_all" ON public.match_pairings FOR SELECT USING (true);
CREATE POLICY "match_pairings_insert_all" ON public.match_pairings FOR INSERT WITH CHECK (true);
CREATE POLICY "match_pairings_update_all" ON public.match_pairings FOR UPDATE USING (true);

CREATE POLICY "tournaments_select_all" ON public.tournaments FOR SELECT USING (true);
CREATE POLICY "tournaments_insert_all" ON public.tournaments FOR INSERT WITH CHECK (true);
CREATE POLICY "tournaments_update_all" ON public.tournaments FOR UPDATE USING (true);

CREATE POLICY "tournament_registrations_select_all" ON public.tournament_registrations FOR SELECT USING (true);
CREATE POLICY "tournament_registrations_insert_all" ON public.tournament_registrations FOR INSERT WITH CHECK (true);
CREATE POLICY "tournament_registrations_update_all" ON public.tournament_registrations FOR UPDATE USING (true);

CREATE POLICY "tournament_matches_select_all" ON public.tournament_matches FOR SELECT USING (true);
CREATE POLICY "tournament_matches_insert_all" ON public.tournament_matches FOR INSERT WITH CHECK (true);
CREATE POLICY "tournament_matches_update_all" ON public.tournament_matches FOR UPDATE USING (true);

CREATE POLICY "expense_items_select_all" ON public.expense_items FOR SELECT USING (true);
CREATE POLICY "expense_items_insert_all" ON public.expense_items FOR INSERT WITH CHECK (true);
CREATE POLICY "expense_items_update_all" ON public.expense_items FOR UPDATE USING (true);

CREATE POLICY "payment_slips_select_all" ON public.payment_slips FOR SELECT USING (true);
CREATE POLICY "payment_slips_insert_all" ON public.payment_slips FOR INSERT WITH CHECK (true);

CREATE POLICY "ai_profile_requests_select_all" ON public.ai_profile_requests FOR SELECT USING (true);
CREATE POLICY "ai_profile_requests_insert_all" ON public.ai_profile_requests FOR INSERT WITH CHECK (true);

CREATE POLICY "notifications_select_all" ON public.notifications FOR SELECT USING (true);
CREATE POLICY "notifications_update_all" ON public.notifications FOR UPDATE USING (true);

-- =====================================================
-- 11. PROFILE TRIGGER (Auto-create on signup)
-- Note: This trigger should be created via Supabase Dashboard
-- as it requires access to auth.users schema
-- =====================================================

-- The trigger function and trigger will be created separately
-- via Supabase SQL Editor after migration

-- =====================================================
-- 12. INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_profiles_line_user_id ON public.profiles(line_user_id);
CREATE INDEX IF NOT EXISTS idx_parties_date ON public.parties(date);
CREATE INDEX IF NOT EXISTS idx_parties_host ON public.parties(host_id);
CREATE INDEX IF NOT EXISTS idx_parties_status ON public.parties(status);
CREATE INDEX IF NOT EXISTS idx_party_members_party ON public.party_members(party_id);
CREATE INDEX IF NOT EXISTS idx_party_members_user ON public.party_members(user_id);
CREATE INDEX IF NOT EXISTS idx_match_rooms_party ON public.match_rooms(party_id);
CREATE INDEX IF NOT EXISTS idx_tournaments_status ON public.tournaments(status);
CREATE INDEX IF NOT EXISTS idx_tournament_matches_tournament ON public.tournament_matches(tournament_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON public.notifications(user_id) WHERE is_read = false;
