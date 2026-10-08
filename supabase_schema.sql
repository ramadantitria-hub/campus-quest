-- =========================================================
-- CAMPUS QUEST - DATABASE DDL (Supabase PostgreSQL)
-- Blueprint On-Demand Mahasiswa: JASTAP & JARVIS (inDrive Model)
-- =========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Bersihkan tabel lama jika sebelumnya terbuat dengan tipe UUID
DROP TABLE IF EXISTS public.reviews CASCADE;
DROP TABLE IF EXISTS public.chat_messages CASCADE;
DROP TABLE IF EXISTS public.quests CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- 1. Profiles Table (supports Supabase Auth UUID or custom text IDs)
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
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
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  customer_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  runner_id TEXT REFERENCES public.profiles(id) ON DELETE SET NULL,
  customer_name TEXT,
  customer_avatar TEXT,
  runner_name TEXT,
  runner_avatar TEXT,
  category TEXT NOT NULL CHECK (category IN ('JASTAP', 'JARVIS')),
  title TEXT NOT NULL,
  description TEXT,
  quantity INT DEFAULT 1,
  unit TEXT DEFAULT 'pcs', -- 'pcs', 'bungkus', 'lembar', 'porsi', 'perangkat'
  origin_address TEXT,
  destination_address TEXT,
  landmark_origin TEXT,
  landmark_destination TEXT,
  notes TEXT,
  bounty_fee NUMERIC(10, 2) NOT NULL, -- Penawaran jasa dari customer (inDrive style)
  item_cost NUMERIC(10, 2) DEFAULT 0, -- Diinput runner untuk belanja/sparepart
  receipt_image_url TEXT,
  payment_proof_url TEXT,
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
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  quest_id TEXT NOT NULL REFERENCES public.quests(id) ON DELETE CASCADE,
  sender_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  sender_name TEXT,
  sender_role TEXT DEFAULT 'customer',
  content TEXT,
  media_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Reviews Table
CREATE TABLE IF NOT EXISTS public.reviews (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  quest_id TEXT UNIQUE NOT NULL REFERENCES public.quests(id) ON DELETE CASCADE,
  customer_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  customer_name TEXT,
  runner_id TEXT NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Function: Automatic updated_at timestamp on Quests
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_quest_updated ON public.quests;
CREATE TRIGGER on_quest_updated
  BEFORE UPDATE ON public.quests
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- =========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES (Development & Production Ready)
-- =========================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Profiles Policies (Accessible to both anon & authenticated)
DROP POLICY IF EXISTS "Public profiles are readable by authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Public profiles are readable by all" ON public.profiles;
CREATE POLICY "Public profiles are readable by all"
  ON public.profiles FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert profiles" ON public.profiles;
CREATE POLICY "Users can insert profiles"
  ON public.profiles FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their profile" ON public.profiles;
CREATE POLICY "Users can update their profile"
  ON public.profiles FOR UPDATE TO anon, authenticated USING (true);

-- Quests Policies
DROP POLICY IF EXISTS "Quests are readable by authenticated users" ON public.quests;
DROP POLICY IF EXISTS "Quests are readable by all" ON public.quests;
CREATE POLICY "Quests are readable by all"
  ON public.quests FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Customers can create quests" ON public.quests;
DROP POLICY IF EXISTS "Anyone can create quests" ON public.quests;
CREATE POLICY "Anyone can create quests"
  ON public.quests FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Customer or assigned runner can update quest" ON public.quests;
DROP POLICY IF EXISTS "Customer, assigned runner, or accepting runner can update quest" ON public.quests;
DROP POLICY IF EXISTS "Anyone can update quests" ON public.quests;
CREATE POLICY "Anyone can update quests"
  ON public.quests FOR UPDATE TO anon, authenticated USING (true);

-- Chat Messages Policies
DROP POLICY IF EXISTS "Quest participants can read chat messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Chat messages are readable by all" ON public.chat_messages;
CREATE POLICY "Chat messages are readable by all"
  ON public.chat_messages FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Quest participants can send chat messages" ON public.chat_messages;
DROP POLICY IF EXISTS "Anyone can send chat messages" ON public.chat_messages;
CREATE POLICY "Anyone can send chat messages"
  ON public.chat_messages FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Reviews Policies
DROP POLICY IF EXISTS "Reviews are viewable by all authenticated users" ON public.reviews;
DROP POLICY IF EXISTS "Reviews are viewable by all" ON public.reviews;
CREATE POLICY "Reviews are viewable by all"
  ON public.reviews FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Customers can insert review for completed quest" ON public.reviews;
DROP POLICY IF EXISTS "Anyone can insert reviews" ON public.reviews;
CREATE POLICY "Anyone can insert reviews"
  ON public.reviews FOR INSERT TO anon, authenticated WITH CHECK (true);

-- =========================================================
-- STORAGE BUCKETS & POLICIES (KTM, Nota, Bukti Bayar, Chat)
-- =========================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('campusquest', 'campusquest', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Authenticated users can upload campusquest media" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload campusquest media" ON storage.objects;
CREATE POLICY "Anyone can upload campusquest media"
  ON storage.objects FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id = 'campusquest');

DROP POLICY IF EXISTS "Public can view campusquest media" ON storage.objects;
CREATE POLICY "Public can view campusquest media"
  ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'campusquest');

-- =========================================================
-- REALTIME REPLICATION (For live chat and quest board)
-- =========================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'quests'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.quests;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'chat_messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
  END IF;
END $$;

-- =========================================================
-- OPTIONAL SEED DATA (Demo Mahasiswa & Quest Kampus)
-- =========================================================
INSERT INTO public.profiles (id, full_name, nim, phone, avatar_url, is_verified, active_mode, runner_specialty, rating, total_completed_orders, wallet_balance)
VALUES 
  ('usr-current-001', 'Bima Arya Prasetya', '2206123891', '081298765432', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80', true, 'customer', ARRAY['JASTAP', 'JARVIS'], 4.96, 28, 145000),
  ('usr-runner-002', 'Reza Fachri (The Machinist)', '2106981245', '081377889900', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80', true, 'runner', ARRAY['JARVIS'], 4.98, 42, 380000),
  ('usr-cust-003', 'Nabila Putri (Ilkom)', '2306771122', '081922334455', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80', true, 'customer', ARRAY['JASTAP'], 5.00, 12, 50000)
ON CONFLICT (id) DO UPDATE SET
  full_name = EXCLUDED.full_name,
  nim = EXCLUDED.nim;

INSERT INTO public.quests (id, customer_id, customer_name, customer_avatar, runner_id, runner_name, runner_avatar, category, title, description, quantity, unit, origin_address, destination_address, landmark_origin, landmark_destination, notes, bounty_fee, item_cost, status, completion_otp, payment_method, payment_status)
VALUES
  ('qst-001', 'usr-current-001', 'Bima Arya Prasetya', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80', 'usr-runner-002', 'Reza Fachri (The Machinist)', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80', 'JARVIS', 'Install Windows 11 & Ganti Thermal Paste Laptop Asus', 'Laptop Asus Vivobook panas dan kipas bising. Tolong dibersihkan debu kipas dan diberi pasta baru. Software office standar.', 1, 'perangkat', 'Lab Komputer Fakultas Teknik, Lt 2', 'Asrama Mahasiswa Gedung B, Kamar 314', 'Fakultas Teknik & Lab Komputer', 'Asrama Mahasiswa Gedung B', 'Bawa obeng set presisi ya bro', 65000, 25000, 'IN_PROGRESS', '419582', 'QRIS', 'PENDING'),
  ('qst-002', 'usr-cust-003', 'Nabila Putri (Ilkom)', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80', NULL, NULL, NULL, 'JASTAP', 'Titip Nasi Ayam Geprek Pak Gendut Level 3 + Es Teh Manis', 'Makan siang kantin vokasi: Nasi ayam geprek paha atas sambal level 3 dipisah, es teh manis jumbo sedotan 1.', 1, 'porsi', 'Kantin Pusat / Vokasi', 'Perpustakaan Pusat, Gazebo Belakang', 'Kantin Pusat / Vokasi', 'Perpustakaan Pusat', 'Tolong jangan terlalu lama ya kak mau ada kelas jam 13.00', 12000, 0, 'OPEN', '831904', 'QRIS', 'PENDING'),
  ('qst-003', 'usr-current-001', 'Bima Arya Prasetya', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80', NULL, NULL, NULL, 'JASTAP', 'Print Tugas Laporan Akhir Praktikum 30 Lembar & Jilid Lakban', 'Print file PDF berwarna cover depan, isi hitam putih, jilid lakban hitam mika bening.', 30, 'lembar', 'Fotokopi & Percetakan Barokah', 'Gedung Rektorat Lt 3 Ruang Dosen', 'Fotokopi & Percetakan Barokah', 'Gedung Rektorat', 'File dikirim lewat chat ya kak', 15000, 0, 'OPEN', '720491', 'CASH', 'PENDING')
ON CONFLICT (id) DO NOTHING;

