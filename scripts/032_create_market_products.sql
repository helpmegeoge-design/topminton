-- Create market_products table
CREATE TABLE IF NOT EXISTS market_products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  original_price NUMERIC,
  condition TEXT NOT NULL, -- 'new', 'used'
  category TEXT NOT NULL,
  brand TEXT,
  images TEXT[], -- Array of image URLs
  location TEXT DEFAULT 'กรุงเทพมหานคร',
  is_sold BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE market_products ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Everyone can view market products"
  ON market_products FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own products"
  ON market_products FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own products"
  ON market_products FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own products"
  ON market_products FOR DELETE
  USING (auth.uid() = user_id);

-- Create storage bucket for market images if not exists
INSERT INTO storage.buckets (id, name, public) 
VALUES ('market-images', 'market-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Give public access to market images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'market-images');

CREATE POLICY "Users can upload market images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'market-images' AND auth.uid() = owner);
