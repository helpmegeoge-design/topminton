-- Create competition_rooms table
CREATE TABLE IF NOT EXISTS competition_rooms (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    created_by UUID REFERENCES auth.users(id) NOT NULL,
    players JSONB DEFAULT '[]'::JSONB, -- List of players {name: string, id: string}
    status TEXT DEFAUlT 'active', -- active, finished
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE competition_rooms ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public read access" ON competition_rooms FOR SELECT USING (true);
CREATE POLICY "Users can insert their own rooms" ON competition_rooms FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "Users can update their own rooms" ON competition_rooms FOR UPDATE USING (auth.uid() = created_by);
