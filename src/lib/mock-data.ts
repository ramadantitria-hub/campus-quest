import { CampusLandmark, Profile, Quest, ChatMessage, Review } from '@/types/campus-quest';

export const CAMPUS_LANDMARKS: CampusLandmark[] = [
  {
    id: 'gerbang-utama',
    name: 'Gerbang Utama & Pos Keamanan',
    category: 'gerbang',
    x: 50,
    y: 92,
    description: 'Pintu gerbang utama kampus UPI Purwakarta, pos satpam & shelter ojol'
  },
  {
    id: 'rektorat-admin',
    name: 'Gedung Layanan Administrasi / Rektorat',
    category: 'fasilitas',
    x: 26,
    y: 70,
    description: 'Pusat layanan administrasi akademik, birokrasi kampus & dekanat'
  },
  {
    id: 'normaal-school',
    name: 'Gedung Bersejarah (Normaal School)',
    category: 'fasilitas',
    x: 50,
    y: 72,
    description: 'Bangunan cagar budaya bersejarah Normaal School UPI Purwakarta'
  },
  {
    id: 'kuliah-1',
    name: 'Gedung Kuliah 1',
    category: 'fakultas',
    x: 20,
    y: 34,
    description: 'Ruang kelas perkuliahan reguler 1 & ruang dosen'
  },
  {
    id: 'kuliah-2',
    name: 'Gedung Kuliah 2',
    category: 'fakultas',
    x: 38,
    y: 32,
    description: 'Ruang kelas perkuliahan reguler 2 & laboratorium microteaching'
  },
  {
    id: 'kuliah-3',
    name: 'Gedung Kuliah 3',
    category: 'fakultas',
    x: 62,
    y: 32,
    description: 'Ruang kelas perkuliahan 3 & ruang diskusi mahasiswa'
  },
  {
    id: 'kuliah-4',
    name: 'Gedung Kuliah 4 (Smart Classroom)',
    category: 'fakultas',
    x: 80,
    y: 34,
    description: 'Gedung kuliah modern Smart Classroom dengan fasilitas multimedia'
  },
  {
    id: 'lab-terpadu',
    name: 'Gedung Laboratorium Terpadu',
    category: 'fakultas',
    x: 30,
    y: 15,
    description: 'Pusat lab komputer, hardware bengkel praktikum & sains terpadu'
  },
  {
    id: 'aula-serbaguna',
    name: 'Gedung Serbaguna (Aula / Multipurpose Hall)',
    category: 'fasilitas',
    x: 70,
    y: 15,
    description: 'Aula serbaguna pertemuan, kegiatan ormawa, wisuda & seminar kampus'
  },
  {
    id: 'perpus-sc',
    name: 'Gedung Perpustakaan & Student Center',
    category: 'fasilitas',
    x: 74,
    y: 52,
    description: 'Perpustakaan digital, ruang baca nyaman, co-working & sekretariat mahasiswa'
  },
  {
    id: 'masjid-kampus',
    name: 'Masjid / Musala Kampus',
    category: 'fasilitas',
    x: 74,
    y: 70,
    description: 'Tempat ibadah utama civitas akademika & kegiatan keagamaan'
  },
  {
    id: 'kantin-kampus',
    name: 'Kantin Kampus',
    category: 'kantin',
    x: 26,
    y: 52,
    isFoodSpot: true,
    description: 'Pusat aneka makanan, nasi rames, minuman & kantin dalam lingkungan kampus'
  },
  {
    id: 'serba-sepuluh-ribu',
    name: 'Serba Sepuluh Ribu',
    category: 'kantin',
    x: 36,
    y: 84,
    isFoodSpot: true,
    description: 'Spot jajanan serba Rp 10.000 favorit mahasiswa depan kampus'
  },
  {
    id: 'indomaret',
    name: 'Indomaret',
    category: 'kantin',
    x: 22,
    y: 90,
    isFoodSpot: true,
    description: 'Minimarket kebutuhan harian, snack, minuman dingin & ATM depan kampus'
  },
  {
    id: 'kantin-depan',
    name: 'Kantin Depan Kampus / Jalan',
    category: 'kantin',
    x: 78,
    y: 90,
    isFoodSpot: true,
    description: 'Deretan warung makan, kuliner kaki lima & jajanan pinggir jalan depan kampus'
  },
  {
    id: 'nusantara',
    name: 'Nusantara',
    category: 'kantin',
    x: 64,
    y: 84,
    isFoodSpot: true,
    description: 'Rumah makan masakan Nusantara & lauk pauk komplit sekitar kampus'
  },
  {
    id: 'theater-hexa-park',
    name: 'Open-Air Theater Park & Hexa Park',
    category: 'fasilitas',
    x: 50,
    y: 52,
    description: 'Taman terbuka hijau, teater alam, & area santai komunal Hexa Park'
  }
];

export const PURWAKARTA_SERVICE_AREAS = [
  { id: 'area-mawar', name: 'Mawar (Purwakarta)', description: 'Area Jl. Mawar, kost mahasiswa & ruko sekitar kampus' },
  { id: 'area-kemuning', name: 'Kemuning (Purwakarta)', description: 'Area hunian kost & pemukiman Jl. Kemuning Purwakarta' },
  { id: 'area-beringin', name: 'Beringin (Purwakarta)', description: 'Area Jl. Beringin & akses sekitar gerbang kampus' },
  { id: 'area-panorama', name: 'Panorama (Purwakarta)', description: 'Zona komersial, pertokoan & pasar Panorama Purwakarta' },
  { id: 'area-ciseureuh', name: 'Ciseureuh (Purwakarta)', description: 'Kawasan pemukiman & kost mahasiswa Ciseureuh' },
  { id: 'area-nagri-kaler', name: 'Nagri Kaler (Purwakarta)', description: 'Kelurahan Nagri Kaler pusat lingkungan kampus UPI' },
  { id: 'area-kost-sekitar', name: 'Kost Mahasiswa Sekitar Kampus', description: 'Lingkungan kos-kosan & kontrakan sekitar kampus UPI' }
];

// Spot jajanan & kuliner khusus JASTAP
export const JASTAP_FOOD_SPOTS = [
  'Kantin Kampus',
  'Serba Sepuluh Ribu',
  'Indomaret',
  'Kantin Depan Kampus / Jalan',
  'Nusantara',
  'Gerbang Utama & Pos Keamanan',
  'Gedung Perpustakaan & Student Center'
];

// Area servis hardware & komputer khusus JARVIS
export const JARVIS_SERVICE_LOCATIONS = [
  'Mawar (Purwakarta)',
  'Kemuning (Purwakarta)',
  'Beringin (Purwakarta)',
  'Panorama (Purwakarta)',
  'Ciseureuh (Purwakarta)',
  'Nagri Kaler (Purwakarta)',
  'Kost Mahasiswa Sekitar Kampus',
  'Gedung Laboratorium Terpadu',
  'Gedung Kuliah 4 (Smart Classroom)',
  'Gedung Kuliah 1',
  'Gedung Kuliah 2',
  'Gedung Kuliah 3',
  'Gedung Perpustakaan & Student Center',
  'Gedung Bersejarah (Normaal School)'
];

export const DEMO_STUDENTS: Profile[] = [
  {
    id: 'usr-current-001',
    full_name: 'Bima Arya Prasetya',
    nim: '2201945',
    university: 'Universitas Pendidikan Indonesia (UPI)',
    faculty: 'FPTK - Pendidikan Teknik Mesin',
    phone: '081298765432',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    ktm_url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&auto=format&fit=crop&q=80',
    student_status: 'AKTIF',
    is_verified: true,
    active_mode: 'customer',
    runner_specialty: ['JASTAP', 'JARVIS'],
    rating: 4.96,
    total_completed_orders: 28,
    wallet_balance: 145000,
    points: 145,
    created_at: new Date(Date.now() - 30 * 86400000).toISOString()
  },
  {
    id: 'usr-runner-002',
    full_name: 'Reza Fachri (The Machinist)',
    nim: '2108765',
    university: 'Universitas Pendidikan Indonesia (UPI)',
    faculty: 'FPMIPA - Ilmu Komputer',
    phone: '081388776655',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    ktm_url: 'https://images.unsplash.com/photo-1589330694653-ded6df03f754?w=500&auto=format&fit=crop&q=80',
    student_status: 'AKTIF',
    is_verified: true,
    active_mode: 'runner',
    runner_specialty: ['JARVIS', 'JASTAP'],
    rating: 4.98,
    total_completed_orders: 54,
    wallet_balance: 320000,
    points: 320,
    created_at: new Date(Date.now() - 60 * 86400000).toISOString()
  },
  {
    id: 'usr-cust-003',
    full_name: 'Nabila Putri',
    nim: '2304512',
    university: 'Universitas Pendidikan Indonesia (UPI)',
    faculty: 'FPEB - Manajemen Bisnis',
    phone: '081912345678',
    avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
    ktm_url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=500&auto=format&fit=crop&q=80',
    student_status: 'AKTIF',
    is_verified: true,
    active_mode: 'customer',
    runner_specialty: ['JASTAP'],
    rating: 4.92,
    total_completed_orders: 14,
    wallet_balance: 95000,
    points: 95,
    created_at: new Date(Date.now() - 20 * 86400000).toISOString()
  },
  {
    id: 'usr-cust-004',
    full_name: 'Dimas Kurniawan',
    nim: '2203876',
    university: 'Universitas Pendidikan Indonesia (UPI)',
    faculty: 'FPIPS - Pendidikan Geografi',
    phone: '085611223344',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    ktm_url: 'https://images.unsplash.com/photo-1589330694653-ded6df03f754?w=500&auto=format&fit=crop&q=80',
    student_status: 'AKTIF',
    is_verified: true,
    active_mode: 'customer',
    runner_specialty: ['JASTAP'],
    rating: 4.88,
    total_completed_orders: 19,
    wallet_balance: 62000,
    points: 62,
    created_at: new Date(Date.now() - 40 * 86400000).toISOString()
  },
  {
    id: 'usr-cust-005',
    full_name: 'Sarah Amalia',
    nim: '2106543',
    university: 'Universitas Pendidikan Indonesia (UPI)',
    faculty: 'FPBS - Pendidikan Bahasa Inggris',
    phone: '087799881122',
    avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
    ktm_url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&auto=format&fit=crop&q=80',
    student_status: 'AKTIF',
    is_verified: true,
    active_mode: 'customer',
    runner_specialty: ['JASTAP', 'JARVIS'],
    rating: 5.0,
    total_completed_orders: 31,
    wallet_balance: 210000,
    points: 210,
    created_at: new Date(Date.now() - 50 * 86400000).toISOString()
  }
];

export interface AuthorizedAdmin {
  name: string;
  nim: string;
  major: string;
  faculty: string;
  phone: string;
}

export const AUTHORIZED_ADMINS: AuthorizedAdmin[] = [
  {
    name: 'AIRIS RAMEYZA ASRAFI',
    nim: '2504773',
    major: 'Mekatronika dan Kecerdasan Buatan (S1)',
    faculty: 'FPTK UPI',
    phone: '081220001111'
  },
  {
    name: 'TRIA RAMADANTI',
    nim: '2502895',
    major: 'Pendidikan Teknik Mesin (S1)',
    faculty: 'FPTK UPI',
    phone: '081230002222'
  },
  {
    name: 'ABDU MUSYAFFA',
    nim: '2502537',
    major: 'Teknik Elektro (S1)',
    faculty: 'FPTK UPI',
    phone: '081240003333'
  },
  {
    name: 'RANDI PERDIANSYAH',
    nim: '2521511',
    major: 'Pendidikan Ilmu Komputer (S1)',
    faculty: 'FPMIPA UPI',
    phone: '081250004444'
  }
];

export const ADMIN_PASSWORD = '123';

export function isAuthorizedAdminNim(nim?: string): boolean {
  if (!nim) return false;
  const clean = nim.trim();
  return AUTHORIZED_ADMINS.some((a) => a.nim === clean);
}

export function getAuthorizedAdminByNim(nim?: string): AuthorizedAdmin | undefined {
  if (!nim) return undefined;
  const clean = nim.trim();
  return AUTHORIZED_ADMINS.find((a) => a.nim === clean);
}

export const ADMIN_PROFILE: Profile = {
  id: 'usr-admin-bem-001',
  full_name: 'TRIA RAMADANTI',
  nim: '2502895',
  university: 'Universitas Pendidikan Indonesia (UPI)',
  faculty: 'FPTK UPI',
  major: 'Pendidikan Teknik Mesin (S1)',
  phone: '081230002222',
  avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  is_verified: true,
  active_mode: 'admin',
  runner_specialty: ['JASTAP', 'JARVIS'],
  rating: 5.0,
  total_completed_orders: 120,
  wallet_balance: 1540000,
  points: 1540,
  created_at: new Date(Date.now() - 90 * 86400000).toISOString()
};

export const INITIAL_PROFILE: Profile = DEMO_STUDENTS[0];

export const SAMPLE_KTM_PRESETS = [
  {
    label: 'KTM UPI - FPTK (Teknik Mesin)',
    fullName: 'Bima Arya Prasetya',
    nim: '2201945',
    university: 'Universitas Pendidikan Indonesia (UPI)',
    faculty: 'FPTK - Pendidikan Teknik Mesin',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    badgeColor: 'from-rose-600 to-red-800',
    univBadge: 'UPI'
  },
  {
    label: 'KTM UPI - FPMIPA (Ilmu Komputer)',
    fullName: 'Reza Fachri',
    nim: '2108765',
    university: 'Universitas Pendidikan Indonesia (UPI)',
    faculty: 'FPMIPA - Ilmu Komputer',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    badgeColor: 'from-rose-600 to-red-800',
    univBadge: 'UPI'
  },
  {
    label: 'KTM UPI - FPEB (Manajemen)',
    fullName: 'Nabila Putri',
    nim: '2304512',
    university: 'Universitas Pendidikan Indonesia (UPI)',
    faculty: 'FPEB - Manajemen Bisnis',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
    badgeColor: 'from-rose-600 to-red-800',
    univBadge: 'UPI'
  }
];

export const INITIAL_QUESTS: Quest[] = [
  {
    id: 'qst-001',
    customer_id: 'usr-current-001',
    customer_name: 'Bima Arya Prasetya',
    customer_nim: '2206123',
    customer_phone: '081298765432',
    customer_major: 'Pendidikan Sistem Komputer (S1)',
    customer_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    runner_id: 'usr-runner-002',
    runner_name: 'Reza Fachri (The Machinist)',
    runner_phone: '081377889900',
    runner_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    category: 'JARVIS',
    title: 'Install Windows 11 & Ganti Thermal Paste Laptop Asus',
    description: 'Laptop Asus Vivobook panas dan kipas bising. Tolong dibersihkan debu kipas dan diberi pasta baru di area Mawar Purwakarta.',
    quantity: 1,
    unit: 'perangkat',
    origin_address: 'Mawar (Purwakarta) - Kost Melati No. 12',
    destination_address: 'Gedung Laboratorium Terpadu',
    bounty_fee: 65000,
    item_cost: 25000,
    receipt_image_url: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=400&auto=format&fit=crop&q=80',
    status: 'IN_PROGRESS',
    completion_otp: '419582',
    payment_method: 'QRIS',
    payment_status: 'PENDING',
    created_at: new Date(Date.now() - 3600000).toISOString(),
    updated_at: new Date(Date.now() - 1200000).toISOString(),
    landmark_origin: 'Mawar (Purwakarta)',
    landmark_destination: 'Gedung Laboratorium Terpadu',
    notes: 'Bawa obeng set presisi ya bro'
  },
  {
    id: 'qst-002',
    customer_id: 'usr-cust-003',
    customer_name: 'Nabila Putri (FPEB)',
    customer_nim: '2304512',
    customer_phone: '081922334455',
    customer_major: 'Manajemen Bisnis (S1)',
    customer_avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
    category: 'JASTAP',
    title: 'Titip Snack Serba Sepuluh Ribu & Es Jeruk Segar',
    description: 'Titip beli di Serba Sepuluh Ribu depan kampus. 2 porsi cireng isi & es jeruk. Antar ke Smart Classroom Lt 2.',
    quantity: 2,
    unit: 'porsi',
    origin_address: 'Serba Sepuluh Ribu',
    destination_address: 'Gedung Kuliah 4 (Smart Classroom), Lt 2',
    bounty_fee: 12000,
    item_cost: 0,
    status: 'OPEN',
    completion_otp: '782941',
    payment_method: 'QRIS',
    payment_status: 'PENDING',
    created_at: new Date(Date.now() - 900000).toISOString(),
    updated_at: new Date(Date.now() - 900000).toISOString(),
    landmark_origin: 'Serba Sepuluh Ribu',
    landmark_destination: 'Gedung Kuliah 4 (Smart Classroom)',
    notes: 'Uang jajan akan diganti tunai/QRIS sesuai struk'
  },
  {
    id: 'qst-003',
    customer_id: 'usr-cust-004',
    customer_name: 'Dimas Kurniawan (FPIPS)',
    customer_nim: '2201984',
    customer_phone: '085711223344',
    customer_major: 'Pendidikan Geografi (S1)',
    customer_avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    category: 'JASTAP',
    title: 'Titip Makan Siang Ayam Bakar Nusantara Komplit',
    description: 'Beli paket ayam bakar komplit di RM Nusantara jalan depan kampus. Antar ke Rektorat / Layanan Administrasi.',
    quantity: 1,
    unit: 'porsi',
    origin_address: 'Nusantara',
    destination_address: 'Gedung Layanan Administrasi / Rektorat, R. 204',
    bounty_fee: 15000,
    item_cost: 24000,
    status: 'ON_THE_WAY',
    completion_otp: '651239',
    payment_method: 'CASH',
    payment_status: 'PENDING',
    runner_id: 'usr-current-001',
    runner_name: 'Bima Arya Prasetya',
    runner_phone: '081298765432',
    runner_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    created_at: new Date(Date.now() - 5400000).toISOString(),
    updated_at: new Date(Date.now() - 1800000).toISOString(),
    landmark_origin: 'Nusantara',
    landmark_destination: 'Gedung Layanan Administrasi / Rektorat'
  },
  {
    id: 'qst-004',
    customer_id: 'usr-cust-005',
    customer_name: 'Sarah Amalia (FPBS)',
    customer_nim: '2105678',
    customer_phone: '081399887766',
    customer_major: 'Pendidikan Bahasa Inggris (S1)',
    customer_avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
    category: 'JARVIS',
    title: 'Ganti Port Charger / Service Tombol Power iPad Air',
    description: 'Tombol power macet dan port USB-C agak longgar. Jemput di Kemuning dekat kampus Purwakarta.',
    quantity: 1,
    unit: 'perangkat',
    origin_address: 'Kemuning (Purwakarta) - Gang Beringin 3',
    destination_address: 'Gedung Laboratorium Terpadu',
    bounty_fee: 80000,
    item_cost: 0,
    status: 'OPEN',
    completion_otp: '394102',
    payment_method: 'QRIS',
    payment_status: 'PENDING',
    created_at: new Date(Date.now() - 7200000).toISOString(),
    updated_at: new Date(Date.now() - 7200000).toISOString(),
    landmark_origin: 'Kemuning (Purwakarta)',
    landmark_destination: 'Gedung Laboratorium Terpadu'
  },
  {
    id: 'qst-005',
    customer_id: 'usr-current-001',
    customer_name: 'Bima Arya Prasetya',
    customer_nim: '2206123',
    customer_phone: '081298765432',
    customer_major: 'Pendidikan Sistem Komputer (S1)',
    customer_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    runner_id: 'usr-runner-003',
    runner_name: 'Fikri Haikal (The Agent)',
    runner_phone: '081233445566',
    runner_avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop&q=80',
    category: 'JASTAP',
    title: 'Titip Kopi Botol Dingin & Snack Roti Indomaret',
    description: 'Titip beli di Indomaret depan gerbang kampus. Antar ke lantai 2 perpustakaan.',
    quantity: 3,
    unit: 'bungkus',
    origin_address: 'Indomaret',
    destination_address: 'Gedung Perpustakaan & Student Center, Lantai 2',
    bounty_fee: 10000,
    item_cost: 32000,
    status: 'COMPLETED',
    completion_otp: '918274',
    payment_method: 'QRIS',
    payment_status: 'PAID',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date(Date.now() - 82800000).toISOString(),
    landmark_origin: 'Indomaret',
    landmark_destination: 'Gedung Perpustakaan & Student Center'
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

export const UPI_FACULTIES = [
  'FPTK - Fakultas Pendidikan Teknologi dan Kejuruan',
  'FPMIPA - Fakultas Pendidikan Matematika dan Ilmu Pengetahuan Alam',
  'FIP - Fakultas Ilmu Pendidikan',
  'FPIPS - Fakultas Pendidikan Ilmu Pengetahuan Sosial',
  'FPBS - Fakultas Pendidikan Bahasa dan Sastra',
  'FPEB - Fakultas Pendidikan Ekonomi dan Bisnis',
  'FPOK - Fakultas Pendidikan Olahraga dan Kesehatan',
  'FPSD - Fakultas Pendidikan Seni dan Desain',
  'SPs - Sekolah Pascasarjana UPI',
  'Kampus UPI di Cibiru',
  'Kampus UPI di Tasikmalaya',
  'Kampus UPI di Purwakarta',
  'Kampus UPI di Sumedang',
  'Kampus UPI di Serang'
];
