import { CampusLandmark, Profile, Quest, ChatMessage, Review } from '@/types/campus-quest';

export const CAMPUS_LANDMARKS: CampusLandmark[] = [
  {
    id: 'kantin-pusat',
    name: 'Kantin Geugeut FPTK UPI',
    category: 'kantin',
    x: 22,
    y: 35,
    description: 'Pusat kuliner kampus UPI, geprek, jus, mie & warung makan'
  },
  {
    id: 'perpus-pusat',
    name: 'Perpustakaan Pusat UPI',
    category: 'fasilitas',
    x: 48,
    y: 28,
    description: 'Pusat literasi UPI, ruang baca hening, wifi kencang'
  },
  {
    id: 'rektorat',
    name: 'Gedung Isola (Rektorat UPI)',
    category: 'fasilitas',
    x: 50,
    y: 12,
    description: 'Landmark cagar budaya Isola, pusat rektorat dan administrasi UPI'
  },
  {
    id: 'fakultas-teknik',
    name: 'FPTK & Lab Komputer FPMIPA UPI',
    category: 'fakultas',
    x: 78,
    y: 38,
    description: 'Bengkel mesin FPTK, lab hardware & ruang praktikum FPMIPA UPI'
  },
  {
    id: 'asrama-b',
    name: 'Asrama Mahasiswa UPI Gedung B',
    category: 'asrama',
    x: 20,
    y: 72,
    description: 'Hunian asrama mahasiswa UPI & parkiran sepeda motor'
  },
  {
    id: 'asrama-a',
    name: 'Asrama Mahasiswa UPI Gedung A',
    category: 'asrama',
    x: 38,
    y: 78,
    description: 'Hunian asrama mahasiswi UPI & gazebo komunal'
  },
  {
    id: 'fotokopi-gerbang',
    name: 'Percetakan & Fotokopi Gegerkalong UPI',
    category: 'fasilitas',
    x: 82,
    y: 65,
    description: 'Tempat jilid skripsi UPI, print warna, scan berkas akademik'
  },
  {
    id: 'gerbang-utama',
    name: 'Gerbang Utama Setiabudi UPI & Halte Bus',
    category: 'gerbang',
    x: 50,
    y: 90,
    description: 'Titik jemput Jl. Dr. Setiabudi 229, pos satpam & shelter ojol'
  }
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
    created_at: new Date(Date.now() - 50 * 86400000).toISOString()
  }
];

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
    customer_avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    runner_id: 'usr-runner-002',
    runner_name: 'Reza Fachri (The Machinist)',
    runner_avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    category: 'JARVIS',
    title: 'Install Windows 11 & Ganti Thermal Paste Laptop Asus',
    description: 'Laptop Asus Vivobook panas dan kipas bising. Tolong dibersihkan debu kipas dan diberi pasta baru. Software office standar.',
    quantity: 1,
    unit: 'perangkat',
    origin_address: 'Lab Komputer FPMIPA UPI, Lt 2',
    destination_address: 'Asrama Mahasiswa UPI Gedung B, Kamar 314',
    bounty_fee: 65000,
    item_cost: 25000,
    receipt_image_url: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=400&auto=format&fit=crop&q=80',
    status: 'IN_PROGRESS',
    completion_otp: '419582',
    payment_method: 'QRIS',
    payment_status: 'PENDING',
    created_at: new Date(Date.now() - 3600000).toISOString(),
    updated_at: new Date(Date.now() - 1200000).toISOString(),
    landmark_origin: 'FPTK & Lab Komputer FPMIPA UPI',
    landmark_destination: 'Asrama Mahasiswa UPI Gedung B',
    notes: 'Bawa obeng set presisi ya bro'
  },
  {
    id: 'qst-002',
    customer_id: 'usr-cust-003',
    customer_name: 'Nabila Putri (FPEB)',
    customer_avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
    category: 'JASTAP',
    title: 'Jastap Nasi Geprek Sambal Matah Level 3 + Es Teh',
    description: 'Titip beli di Kantin Geugeut FPTK UPI. Sambal dipisah tolong ya. Antar ke lantai dasar perpustakaan.',
    quantity: 2,
    unit: 'porsi',
    origin_address: 'Kantin Geugeut FPTK UPI',
    destination_address: 'Perpustakaan Pusat UPI, Lobi Depan',
    bounty_fee: 12000,
    item_cost: 0,
    status: 'OPEN',
    completion_otp: '782941',
    payment_method: 'QRIS',
    payment_status: 'PENDING',
    created_at: new Date(Date.now() - 900000).toISOString(),
    updated_at: new Date(Date.now() - 900000).toISOString(),
    landmark_origin: 'Kantin Geugeut FPTK UPI',
    landmark_destination: 'Perpustakaan Pusat UPI',
    notes: 'Uang makan akan diganti sesuai struk'
  },
  {
    id: 'qst-003',
    customer_id: 'usr-cust-004',
    customer_name: 'Dimas Kurniawan (FPIPS)',
    customer_avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    category: 'JASTAP',
    title: 'Print Dokumen Jurnal & Jilid Softcover 45 Lembar',
    description: 'Cetak dokumen praktikum warna di Fotokopi Gegerkalong. Antar sebelum jam 14:00 di Gedung Isola.',
    quantity: 45,
    unit: 'lembar',
    origin_address: 'Percetakan & Fotokopi Gegerkalong UPI',
    destination_address: 'Gedung Isola (Rektorat UPI) Lt 3 Ruang Seminar',
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
    landmark_origin: 'Percetakan & Fotokopi Gegerkalong UPI',
    landmark_destination: 'Gedung Isola (Rektorat UPI)'
  },
  {
    id: 'qst-004',
    customer_id: 'usr-cust-005',
    customer_name: 'Sarah Amalia (FPBS)',
    customer_avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
    category: 'JARVIS',
    title: 'Ganti Port Charger / Service Tombol Power iPad Air',
    description: 'Tombol power macet dan port USB-C agak longgar. Butuh dicek solderannya.',
    quantity: 1,
    unit: 'perangkat',
    origin_address: 'Asrama Mahasiswa UPI Gedung A',
    destination_address: 'FPTK & Lab Komputer FPMIPA UPI',
    bounty_fee: 80000,
    item_cost: 0,
    status: 'OPEN',
    completion_otp: '394102',
    payment_method: 'QRIS',
    payment_status: 'PENDING',
    created_at: new Date(Date.now() - 7200000).toISOString(),
    updated_at: new Date(Date.now() - 7200000).toISOString(),
    landmark_origin: 'Asrama Mahasiswa UPI Gedung A',
    landmark_destination: 'FPTK & Lab Komputer FPMIPA UPI'
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
