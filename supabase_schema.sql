-- =========================================================
-- CAMPUS QUEST - DATABASE DDL (Supabase PostgreSQL)
-- Blueprint On-Demand Mahasiswa: JASTAP & JARVIS (inDrive Model)
-- =========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  nim TEXT UNIQUE NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  ktm_url TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  active_mode TEXT DEFAULT 'customer' CHECK (active_mode IN ('customer', 'runner')),
  runner_specialty TEXT[] DEFAULT '{}', -- ['JASTAP', 'JARVIS']
  rating NUMERIC(3, 2) DEFAULT 5.00,
  total_completed_orders INT DEFAULT 0,
  wallet_balance NUMERIC(12, 2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Quests Table
CREATE TABLE IF NOT EXISTS public.quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.profiles(id),
  runner_id UUID REFERENCES public.profiles(id),
  category TEXT NOT NULL CHECK (category IN ('JASTAP', 'JARVIS')),
  title TEXT NOT NULL,
  description TEXT,
  quantity INT DEFAULT 1,
  unit TEXT, -- 'pcs', 'bungkus', 'lembar', 'porsi', dll
  origin_address TEXT,
  destination_address TEXT,
  bounty_fee NUMERIC(10, 2) NOT NULL, -- Penawaran jasa dari customer (inDrive style)
  item_cost NUMERIC(10, 2) DEFAULT 0, -- Diinput runner untuk belanja/sparepart
  receipt_image_url TEXT,
  status TEXT NOT NULL DEFAULT 'OPEN'
    CHECK (status IN ('OPEN', 'ACCEPTED', 'ON_THE_WAY', 'IN_PROGRESS', 'DELIVERING', 'COMPLETED', 'CANCELLED')),
  completion_otp VARCHAR(6) NOT NULL,
  payment_method TEXT CHECK (payment_method IN ('CASH', 'QRIS')),
  payment_status TEXT DEFAULT 'PENDING' CHECK (payment_status IN ('PENDING', 'PAID')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Chat Messages Table
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quest_id UUID NOT NULL REFERENCES public.quests(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id),
  content TEXT,
  media_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Reviews Table
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quest_id UUID UNIQUE NOT NULL REFERENCES public.quests(id),
  customer_id UUID NOT NULL REFERENCES public.profiles(id),
  runner_id UUID NOT NULL REFERENCES public.profiles(id),
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS) Setup
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Public profiles are readable by authenticated users"
  ON public.profiles FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Quests Policies
CREATE POLICY "Quests are readable by authenticated users"
  ON public.quests FOR SELECT TO authenticated USING (true);

CREATE POLICY "Customers can create quests"
  ON public.quests FOR INSERT TO authenticated WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Customer or assigned runner can update quest"
  ON public.quests FOR UPDATE TO authenticated USING (auth.uid() = customer_id OR auth.uid() = runner_id);

-- Chat Messages Policies
CREATE POLICY "Quest participants can read chat messages"
  ON public.chat_messages FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.quests
      WHERE quests.id = chat_messages.quest_id
      AND (quests.customer_id = auth.uid() OR quests.runner_id = auth.uid())
    )
  );

CREATE POLICY "Quest participants can send chat messages"
  ON public.chat_messages FOR INSERT TO authenticated WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.quests
      WHERE quests.id = chat_messages.quest_id
      AND (quests.customer_id = auth.uid() OR quests.runner_id = auth.uid())
    )
  );

-- Reviews Policies
CREATE POLICY "Reviews are viewable by all authenticated users"
  ON public.reviews FOR SELECT TO authenticated USING (true);

CREATE POLICY "Customers can insert review for completed quest"
  ON public.reviews FOR INSERT TO authenticated WITH CHECK (auth.uid() = customer_id);
