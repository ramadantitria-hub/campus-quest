export type UserRole = 'customer' | 'runner';

export type ServiceCategory = 'JASTAP' | 'JARVIS';

export type QuestStatus =
  | 'OPEN'
  | 'ACCEPTED'
  | 'ON_THE_WAY'
  | 'IN_PROGRESS'
  | 'DELIVERING'
  | 'COMPLETED'
  | 'CANCELLED';

export type PaymentMethod = 'CASH' | 'QRIS';

export type PaymentStatus = 'PENDING' | 'PAID';

export interface Profile {
  id: string;
  full_name: string;
  nim: string;
  phone: string;
  avatar_url?: string;
  ktm_url?: string;
  is_verified: boolean;
  active_mode: UserRole;
  runner_specialty: ServiceCategory[];
  rating: number;
  total_completed_orders: number;
  wallet_balance: number;
  created_at: string;
}

export interface Quest {
  id: string;
  customer_id: string;
  customer_name: string;
  customer_avatar?: string;
  runner_id?: string;
  runner_name?: string;
  runner_avatar?: string;
  category: ServiceCategory;
  title: string;
  description: string;
  quantity: number;
  unit: string; // 'pcs' | 'bungkus' | 'lembar' | 'porsi' | 'perangkat'
  origin_address: string;
  destination_address: string;
  bounty_fee: number; // Harga jasa dari customer (inDrive style)
  item_cost: number; // Biaya belanja / sparepart yang diinput runner
  receipt_image_url?: string;
  status: QuestStatus;
  completion_otp: string; // 6 digits
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  payment_proof_url?: string;
  created_at: string;
  updated_at: string;
  landmark_origin?: string;
  landmark_destination?: string;
  notes?: string;
}

export interface ChatMessage {
  id: string;
  quest_id: string;
  sender_id: string;
  sender_name: string;
  sender_role: UserRole;
  content: string;
  media_url?: string;
  created_at: string;
}

export interface Review {
  id: string;
  quest_id: string;
  customer_id: string;
  customer_name: string;
  runner_id: string;
  rating: number; // 1-5
  comment: string;
  created_at: string;
}

export interface CampusLandmark {
  id: string;
  name: string;
  category: 'kantin' | 'fakultas' | 'asrama' | 'fasilitas' | 'gerbang';
  x: number; // Percentage on map canvas
  y: number; // Percentage on map canvas
  description: string;
}
