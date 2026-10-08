import { CampusLandmark, Profile, Quest, ChatMessage, Review } from '@/types/campus-quest';

export const CAMPUS_LANDMARKS: CampusLandmark[] = [
  {
    id: 'kantin-pusat',
    name: 'Kantin Pusat / Vokasi',
    category: 'kantin',
    x: 22,
    y: 35,
    description: 'Pusat kuliner kampus, geprek, jus, mie & warung makan'
  },
  {
    id: 'perpus-pusat',
    name: 'Perpustakaan Pusat',
    category: 'fasilitas',
    x: 48,
    y: 28,
    description: 'Pusat literasi, ruang baca hening, wifi kencang'
  },
  {
    id: 'rektorat',
    name: 'Gedung Rektorat',
    category: 'fasilitas',
    x: 50,
    y: 12,
    description: 'Pusat administrasi, rektorat dan aula serbaguna'
  },
  {
    id: 'fakultas-teknik',
    name: 'Fakultas Teknik & Lab Komputer',
    category: 'fakultas',
    x: 78,
    y: 38,
    description: 'Lab hardware, bengkel teknik mesin & robotika'
  },
  {
    id: 'asrama-b',
    name: 'Asrama Mahasiswa Gedung B',
    category: 'asrama',
    x: 20,
    y: 72,
    description: 'Kamar asrama mahasiswa & parkiran sepeda motor'
  },
  {
    id: 'asrama-a',
    name: 'Asrama Mahasiswa Gedung A',
    category: 'asrama',
    x: 38,
    y: 78,
    description: 'Hunian asrama putri & gazebo komunal'
  },
  {
    id: 'fotokopi-gerbang',
    name: 'Fotokopi & Percetakan Barokah',
    category: 'fasilitas',
    x: 82,
    y: 65,
    description: 'Tempat jilid skripsi, print warna, scan dokumen'
  },
  {
    id: 'gerbang-utama',
    name: 'Gerbang Utama & Halte Bus',
    category: 'gerbang',
    x: 50,
    y: 90,
    description: 'Titik temu ojek online, jemputan travel, pos satpam'
  }
];

export const INITIAL_PROFILE: Profile = {
  id: 'usr-current-001',
  full_name: 'Bima Arya Prasetya',
  nim: '2206123891',
  phone: '081298765432',
  avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  ktm_url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&auto=format&fit=crop&q=80',
  is_verified: true,
  active_mode: 'customer',
  runner_specialty: ['JASTAP', 'JARVIS'],
  rating: 4.96,
  total_completed_orders: 28,
  wallet_balance: 145000,
  created_at: new Date(Date.now() - 30 * 86400000).toISOString()
};

export const INITIAL_QUESTS: Quest[] = [
  {
    id: 'qst-001',
    customer_id: 'usr-current-001',
    customer_name: 'Bima Arya Prasetya',
    customer_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    runner_id: 'usr-runner-002',
    runner_name: 'Reza Fachri (The Machinist)',
    runner_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    category: 'JARVIS',
    title: 'Install Windows 11 & Ganti Thermal Paste Laptop Asus',
    description: 'Laptop Asus Vivobook panas dan kipas bising. Tolong dibersihkan debu kipas dan diberi pasta baru. Software office standar.',
    quantity: 1,
    unit: 'perangkat',
    origin_address: 'Lab Komputer Fakultas Teknik, Lt 2',
    destination_address: 'Asrama Mahasiswa Gedung B, Kamar 314',
    bounty_fee: 65000,
    item_cost: 25000,
    receipt_image_url: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=400&auto=format&fit=crop&q=80',
    status: 'IN_PROGRESS',
    completion_otp: '419582',
    payment_method: 'QRIS',
    payment_status: 'PENDING',
    created_at: new Date(Date.now() - 3600000).toISOString(),
    updated_at: new Date(Date.now() - 1200000).toISOString(),
    landmark_origin: 'Fakultas Teknik & Lab Komputer',
    landmark_destination: 'Asrama Mahasiswa Gedung B',
    notes: 'Bawa obeng set presisi ya bro'
  },
  {
    id: 'qst-002',
    customer_id: 'usr-cust-003',
    customer_name: 'Nabila Putri (Ilkom)',
    customer_avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
    category: 'JASTAP',
    title: 'Jastap Nasi Geprek Sambal Matah Level 3 + Es Teh',
    description: 'Titip beli di Warung Bu Siti Kantin Vokasi. Sambal dipisah tolong ya. Antar ke lantai dasar perpustakaan.',
    quantity: 2,
    unit: 'porsi',
    origin_address: 'Kantin Pusat / Vokasi',
    destination_address: 'Perpustakaan Pusat, Lobi Depan',
    bounty_fee: 12000,
    item_cost: 0,
    status: 'OPEN',
    completion_otp: '782941',
    payment_method: 'QRIS',
    payment_status: 'PENDING',
    created_at: new Date(Date.now() - 900000).toISOString(),
    updated_at: new Date(Date.now() - 900000).toISOString(),
    landmark_origin: 'Kantin Pusat / Vokasi',
    landmark_destination: 'Perpustakaan Pusat',
    notes: 'Uang makan akan diganti sesuai struk'
  },
  {
    id: 'qst-003',
    customer_id: 'usr-cust-004',
    customer_name: 'Dimas Kurniawan (Hukum)',
    customer_avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    category: 'JASTAP',
    title: 'Print Dokumen Jurnal & Jilid Softcover 45 Lembar',
    description: 'Cetak dokumen praktikum warna di Fotokopi Barokah. Antar sebelum jam 14:00 di Gedung Rektorat.',
    quantity: 45,
    unit: 'lembar',
    origin_address: 'Fotokopi & Percetakan Barokah',
    destination_address: 'Gedung Rektorat Lt 3 Ruang Seminar',
    bounty_fee: 15000,
    item_cost: 22000,
    status: 'ON_THE_WAY',
    completion_otp: '651239',
    payment_method: 'CASH',
    payment_status: 'PENDING',
    runner_id: 'usr-current-001',
    runner_name: 'Bima Arya Prasetya',
    runner_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    created_at: new Date(Date.now() - 5400000).toISOString(),
    updated_at: new Date(Date.now() - 1800000).toISOString(),
    landmark_origin: 'Fotokopi & Percetakan Barokah',
    landmark_destination: 'Gedung Rektorat'
  },
  {
    id: 'qst-004',
    customer_id: 'usr-cust-005',
    customer_name: 'Sarah Amalia (Kedokteran)',
    customer_avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
    category: 'JARVIS',
    title: 'Ganti Port Charger / Service Tombol Power iPad Air',
    description: 'Tombol power macet dan port USB-C agak longgar. Butuh dicek solderannya.',
    quantity: 1,
    unit: 'perangkat',
    origin_address: 'Asrama Mahasiswa Gedung A',
    destination_address: 'Lab Komputer Fakultas Teknik',
    bounty_fee: 80000,
    item_cost: 0,
    status: 'OPEN',
    completion_otp: '394102',
    payment_method: 'QRIS',
    payment_status: 'PENDING',
    created_at: new Date(Date.now() - 7200000).toISOString(),
    updated_at: new Date(Date.now() - 7200000).toISOString(),
    landmark_origin: 'Asrama Mahasiswa Gedung A',
    landmark_destination: 'Fakultas Teknik & Lab Komputer'
  },
  {
    id: 'qst-005',
    customer_id: 'usr-current-001',
    customer_name: 'Bima Arya Prasetya',
    customer_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    runner_id: 'usr-runner-003',
    runner_name: 'Fikri Haikal (The Agent)',
    runner_avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop&q=80',
    category: 'JASTAP',
    title: 'Beli Kopi Susu Aren Gula Sedang 3 Cup',
    description: 'Beli di Kafe Kopi Mahasiswa Dekat Gerbang Utama.',
    quantity: 3,
    unit: 'cup',
    origin_address: 'Gerbang Utama & Halte Bus',
    destination_address: 'Perpustakaan Pusat, Lantai 2',
    bounty_fee: 10000,
    item_cost: 45000,
    status: 'COMPLETED',
    completion_otp: '918274',
    payment_method: 'QRIS',
    payment_status: 'PAID',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date(Date.now() - 82800000).toISOString(),
    landmark_origin: 'Gerbang Utama & Halte Bus',
    landmark_destination: 'Perpustakaan Pusat'
  }
];

export const INITIAL_CHATS: Record<string, ChatMessage[]> = {
  'qst-001': [
    {
      id: 'msg-01',
      quest_id: 'qst-001',
      sender_id: 'usr-runner-002',
      sender_name: 'Reza Fachri (The Machinist)',
      sender_role: 'runner',
      content: 'Halo kak Bima! Saya sudah terima servis laptopnya. Sekarang saya lagi buka casing untuk bersihkan debu kipasnya.',
      created_at: new Date(Date.now() - 1500000).toISOString()
    },
    {
      id: 'msg-02',
      quest_id: 'qst-001',
      sender_id: 'usr-current-001',
      sender_name: 'Bima Arya Prasetya',
      sender_role: 'customer',
      content: 'Sip mantap bro Reza. Tolong hati-hati di kabel fleksibel keyboard-nya ya.',
      created_at: new Date(Date.now() - 1400000).toISOString()
    },
    {
      id: 'msg-03',
      quest_id: 'qst-001',
      sender_id: 'usr-runner-002',
      sender_name: 'Reza Fachri (The Machinist)',
      sender_role: 'runner',
      content: 'Aman kak! Ini thermal paste Arctic MX-4 nya sudah saya input ke rincian nota ya (Rp 25.000). Hasil suhunya turun 18 derajat.',
      media_url: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=600&auto=format&fit=crop&q=80',
      created_at: new Date(Date.now() - 800000).toISOString()
    }
  ]
};

export const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev-01',
    quest_id: 'qst-005',
    customer_id: 'usr-current-001',
    customer_name: 'Bima Arya Prasetya',
    runner_id: 'usr-runner-003',
    rating: 5,
    comment: 'Cepat banget sampainya! Kopinya masih dingin dan es batu belum mencair. Runner ramah dan komunikatif.',
    created_at: new Date(Date.now() - 82000000).toISOString()
  }
];
