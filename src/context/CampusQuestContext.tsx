'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  Profile,
  Quest,
  ChatMessage,
  Review,
  UserRole,
  QuestStatus,
  PaymentMethod,
  ServiceCategory,
  RegisteredAccount
} from '@/types/campus-quest';
import {
  INITIAL_PROFILE,
  INITIAL_QUESTS,
  INITIAL_CHATS,
  INITIAL_REVIEWS,
  DEMO_STUDENTS,
  ADMIN_PROFILE,
  AUTHORIZED_ADMINS,
  ADMIN_PASSWORD,
  isAuthorizedAdminNim,
  getAuthorizedAdminByNim
} from '@/lib/mock-data';
import { soundFX } from '@/lib/audio';
import { fireCelebrationConfetti } from '@/lib/confetti';
import { supabase } from '@/lib/supabase';

interface CampusQuestContextType {
  profile: Profile;
  isLoggedIn: boolean;
  isLoaded: boolean;
  isGuestMode: boolean;
  activeRole: UserRole;
  quests: Quest[];
  chats: Record<string, ChatMessage[]>;
  reviews: Review[];
  selectedQuestId: string | null;
  activeTab: 'home' | 'quests' | 'map' | 'wallet' | 'profile';
  isLoginModalOpen: boolean;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  enterGuestMode: () => void;
  exitGuestMode: () => void;
  registerAccount: (data: {
    fullName: string;
    nim: string;
    password?: string;
    major?: string;
    faculty?: string;
    university?: string;
    phone?: string;
    role: UserRole;
    avatarUrl?: string;
    ktmUrl?: string;
  }) => { success: boolean; message: string };
  loginWithCredentials: (
    nim: string,
    password?: string,
    targetRole?: UserRole
  ) => { success: boolean; message: string };
  loginWithKtm: (data: {
    fullName: string;
    nim: string;
    password?: string;
    university?: string;
    faculty?: string;
    major?: string;
    phone?: string;
    ktmUrl: string;
    avatarUrl?: string;
    role?: UserRole;
  }) => void;
  loginWithNim: (nim: string, pin?: string, university?: string, faculty?: string) => { success: boolean; message: string };
  loginAsStudent: (student: Profile) => void;
  logout: () => void;
  setActiveTab: (tab: 'home' | 'quests' | 'map' | 'wallet' | 'profile') => void;
  setSelectedQuestId: (id: string | null) => void;
  switchRole: (role: UserRole) => void;
  createQuest: (newQuest: {
    category: ServiceCategory;
    title: string;
    description: string;
    quantity: number;
    unit: string;
    origin_address: string;
    destination_address: string;
    bounty_fee: number;
    payment_method: PaymentMethod;
    notes?: string;
    landmark_origin?: string;
    landmark_destination?: string;
  }) => Quest;
  acceptQuest: (questId: string) => void;
  declineQuest: (questId: string) => void;
  updateQuestStatus: (questId: string, status: QuestStatus) => void;
  updateItemCost: (questId: string, cost: number, receiptUrl?: string) => void;
  verifyOtpAndComplete: (questId: string, inputOtp: string) => { success: boolean; message: string };
  submitPaymentProof: (questId: string, proofUrl: string, method: PaymentMethod) => void;
  confirmPaymentReceived: (questId: string) => void;
  submitReview: (questId: string, rating: number, comment: string) => void;
  sendChatMessage: (questId: string, content: string, mediaUrl?: string) => void;
  updateKtm: (watermarkedKtmUrl: string) => void;
  cancelQuest: (questId: string, reason?: string) => { success: boolean; message: string };
  increaseBounty: (questId: string, addedAmount: number) => { success: boolean; message: string };
  updateProfile: (updated: Partial<Profile>) => void;
  withdrawWallet: (amount: number, method: string) => boolean;
  resetToDefaultData: () => void;
  // Admin Methods & State
  adminForceCompleteQuest: (questId: string) => { success: boolean; message: string };
  adminForceCancelQuest: (questId: string, reason?: string) => { success: boolean; message: string };
  adminResetQuest: (questId: string) => { success: boolean; message: string };
  adminVerifyUser: (nim: string, isVerified: boolean) => void;
  adminToggleUserStatus: (nim: string, status: 'AKTIF' | 'CUTI' | 'LULUS') => void;
  adminDeleteQuest: (questId: string) => { success: boolean; message: string };
  loginAsAdmin: (nim?: string, password?: string) => { success: boolean; message: string };
  isAdminAuthModalOpen: boolean;
  openAdminAuthModal: () => void;
  closeAdminAuthModal: () => void;
  isCurrentUserAdmin: boolean;
  registeredAccounts: RegisteredAccount[];
  totalPlatformFee: number;
}

const CampusQuestContext = createContext<CampusQuestContextType | null>(null);

const STORAGE_KEYS = {
  PROFILE: 'cq_profile_v2_upi',
  IS_LOGGED_IN: 'cq_is_logged_in_v2_upi',
  REGISTERED_ACCOUNTS: 'cq_registered_accounts_v2_upi',
  QUESTS: 'cq_quests_v2_upi',
  CHATS: 'cq_chats_v2_upi',
  REVIEWS: 'cq_reviews_v2_upi'
};

export function CampusQuestProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<Profile>(INITIAL_PROFILE);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isAdminAuthModalOpen, setIsAdminAuthModalOpen] = useState(false);
  const isCurrentUserAdmin = isAuthorizedAdminNim(profile.nim);
  const openAdminAuthModal = () => setIsAdminAuthModalOpen(true);
  const closeAdminAuthModal = () => setIsAdminAuthModalOpen(false);
  const [quests, setQuests] = useState<Quest[]>(INITIAL_QUESTS);
  const [chats, setChats] = useState<Record<string, ChatMessage[]>>(INITIAL_CHATS);
  const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS);
  const [selectedQuestId, setSelectedQuestId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'home' | 'quests' | 'map' | 'wallet' | 'profile'>('home');
  const [isLoaded, setIsLoaded] = useState(false);
  const [registeredAccounts, setRegisteredAccounts] = useState<RegisteredAccount[]>(() => {
    return DEMO_STUDENTS.map((s) => ({
      id: s.id,
      nim: s.nim,
      password: 'upi123',
      full_name: s.full_name,
      major: s.major || 'Mekatronika dan Kecerdasan Buatan (S1)',
      faculty: s.faculty || 'FPTK UPI',
      university: s.university || 'Universitas Pendidikan Indonesia (UPI)',
      phone: s.phone,
      role: s.active_mode,
      avatar_url: s.avatar_url,
      ktm_url: s.ktm_url,
      created_at: s.created_at
    }));
  });

  // Load from localStorage on mount & sync with Supabase
  useEffect(() => {
    queueMicrotask(() => {
      try {
        // Hapus flag login persisten agar setiap kali pengguna masuk/buka web,
        // portal menu login (KTM Login / Register / OCR) selalu tampil pertama kali
        localStorage.removeItem(STORAGE_KEYS.IS_LOGGED_IN);
        localStorage.removeItem('cq_is_logged_in');

        const savedProfile = localStorage.getItem(STORAGE_KEYS.PROFILE);
        const savedQuests = localStorage.getItem(STORAGE_KEYS.QUESTS);
        const savedChats = localStorage.getItem(STORAGE_KEYS.CHATS);
        const savedReviews = localStorage.getItem(STORAGE_KEYS.REVIEWS);
        const savedAccounts = localStorage.getItem(STORAGE_KEYS.REGISTERED_ACCOUNTS);

        if (savedProfile) setProfile(JSON.parse(savedProfile));
        if (savedQuests) setQuests(JSON.parse(savedQuests));
        if (savedChats) setChats(JSON.parse(savedChats));
        if (savedReviews) setReviews(JSON.parse(savedReviews));
        if (savedAccounts) {
          try {
            const parsed = JSON.parse(savedAccounts);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setRegisteredAccounts(parsed);
            }
          } catch {}
        }

        // WAJIB: Setiap kali membuka / masuk ke aplikasi, selalu mulai dalam status belum login
        // sehingga pengguna langsung disajikan Halaman Menu Login (KtmLoginScreen)
        setIsLoggedIn(false);
        setIsGuestMode(false);
      } catch {
        setIsLoggedIn(false);
        setIsGuestMode(false);
      }
      setIsLoaded(true);
    });

    // Supabase Live Sync & Realtime Subscription
    if (supabase) {
      const client = supabase;

      // 1. Fetch live quests from Supabase
      client
        .from('quests')
        .select('*')
        .order('created_at', { ascending: false })
        .then(({ data, error }) => {
          if (!error && data && data.length > 0) {
            setQuests(data as Quest[]);
          }
        });

      // 2. Realtime listener for Quests
      const questChannel = client
        .channel('campusquest-realtime-quests')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'quests' },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              const newQ = payload.new as Quest;
              setQuests((prev) => {
                if (prev.some((q) => q.id === newQ.id)) return prev;
                return [newQ, ...prev];
              });
            } else if (payload.eventType === 'UPDATE') {
              const updatedQ = payload.new as Quest;
              setQuests((prev) =>
                prev.map((q) => (q.id === updatedQ.id ? { ...q, ...updatedQ } : q))
              );
            }
          }
        )
        .subscribe();

      // 3. Realtime listener for Chat Messages
      const chatChannel = client
        .channel('campusquest-realtime-chats')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'chat_messages' },
          (payload) => {
            const newMsg = payload.new as ChatMessage;
            if (newMsg?.quest_id) {
              setChats((prev) => {
                const currentList = prev[newMsg.quest_id] || [];
                if (currentList.some((m) => m.id === newMsg.id)) return prev;
                return {
                  ...prev,
                  [newMsg.quest_id]: [...currentList, newMsg]
                };
              });
            }
          }
        )
        .subscribe();

      return () => {
        client.removeChannel(questChannel);
        client.removeChannel(chatChannel);
      };
    }
  }, []);

  // Save to localStorage when state updates (keep registered accounts, quests & chats)
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
      localStorage.setItem(STORAGE_KEYS.QUESTS, JSON.stringify(quests));
      localStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(chats));
      localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(reviews));
    } catch {
      // quota or private browsing
    }
  }, [profile, quests, chats, reviews, isLoaded]);

  // Generate 6 digit OTP
  const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const syncProfileToSupabase = async (p: Profile) => {
    if (!supabase) return;
    try {
      const fullPayload = {
        id: p.id,
        full_name: p.full_name,
        nim: p.nim,
        phone: p.phone,
        avatar_url: p.avatar_url,
        ktm_url: p.ktm_url,
        university: p.university,
        faculty: p.faculty,
        major: p.major,
        student_status: p.student_status,
        is_verified: p.is_verified,
        active_mode: p.active_mode,
        runner_specialty: p.runner_specialty,
        rating: p.rating,
        total_completed_orders: p.total_completed_orders,
        wallet_balance: p.wallet_balance
      };

      const { error } = await supabase.from('profiles').upsert(fullPayload, { onConflict: 'id' });
      if (error) {
        // Fallback jika kolom baru belum dimigrasi di Supabase
        const corePayload = {
          id: p.id,
          full_name: p.full_name,
          nim: p.nim,
          phone: p.phone,
          avatar_url: p.avatar_url,
          ktm_url: p.ktm_url,
          is_verified: p.is_verified,
          active_mode: p.active_mode,
          runner_specialty: p.runner_specialty,
          rating: p.rating,
          total_completed_orders: p.total_completed_orders,
          wallet_balance: p.wallet_balance
        };
        await supabase.from('profiles').upsert(corePayload, { onConflict: 'id' });
      }
    } catch (err) {
      console.warn('syncProfileToSupabase warn:', err);
    }
  };

  const switchRole = (role: UserRole) => {
    soundFX.pop();
    if (role === 'admin') {
      if (!isAuthorizedAdminNim(profile.nim)) {
        // Tampilan admin tidak bisa dilihat dan diakses oleh runner dan customer
        return;
      }
    }
    setProfile((prev) => {
      const updated = {
        ...prev,
        active_mode: role
      };
      syncProfileToSupabase(updated);
      return updated;
    });
  };

  const createQuest = (data: {
    category: ServiceCategory;
    title: string;
    description: string;
    quantity: number;
    unit: string;
    origin_address: string;
    destination_address: string;
    bounty_fee: number;
    payment_method: PaymentMethod;
    notes?: string;
    landmark_origin?: string;
    landmark_destination?: string;
  }): Quest => {
    const newQuest: Quest = {
      id: `qst-${Date.now().toString(36)}`,
      customer_id: profile.id,
      customer_name: profile.full_name,
      customer_nim: profile.nim,
      customer_phone: profile.phone,
      customer_major: profile.major,
      customer_avatar: profile.avatar_url,
      category: data.category,
      title: data.title,
      description: data.description,
      quantity: data.quantity,
      unit: data.unit,
      origin_address: data.origin_address,
      destination_address: data.destination_address,
      bounty_fee: data.bounty_fee,
      item_cost: 0,
      status: 'OPEN',
      completion_otp: generateOTP(),
      payment_method: data.payment_method,
      payment_status: 'PENDING',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      notes: data.notes,
      landmark_origin: data.landmark_origin || data.origin_address,
      landmark_destination: data.landmark_destination || data.destination_address
    };

    setQuests((prev) => [newQuest, ...prev]);
    soundFX.notification();

    const client = supabase;
    if (client) {
      // Pastikan profil tersimpan di Supabase agar lolos relasi foreign key
      syncProfileToSupabase(profile).then(() => {
        const fullPayload = {
          id: newQuest.id,
          customer_id: newQuest.customer_id,
          customer_name: newQuest.customer_name,
          customer_nim: newQuest.customer_nim,
          customer_phone: newQuest.customer_phone,
          customer_major: newQuest.customer_major,
          customer_avatar: newQuest.customer_avatar,
          category: newQuest.category,
          title: newQuest.title,
          description: newQuest.description,
          quantity: newQuest.quantity,
          unit: newQuest.unit,
          origin_address: newQuest.origin_address,
          destination_address: newQuest.destination_address,
          landmark_origin: newQuest.landmark_origin,
          landmark_destination: newQuest.landmark_destination,
          notes: newQuest.notes,
          bounty_fee: newQuest.bounty_fee,
          item_cost: 0,
          status: 'OPEN',
          completion_otp: newQuest.completion_otp,
          payment_method: newQuest.payment_method,
          payment_status: 'PENDING',
          created_at: newQuest.created_at,
          updated_at: newQuest.updated_at
        };

        client
          .from('quests')
          .insert(fullPayload)
          .then(async ({ error }) => {
            if (error) {
              console.warn('Supabase insert full payload warning (retrying core fields):', error.message);
              const { customer_nim, customer_phone, customer_major, ...corePayload } = fullPayload;
              const { error: fallbackErr } = await client.from('quests').insert(corePayload);
              if (fallbackErr) {
                console.warn('Supabase fallback insert quest warning:', fallbackErr.message);
              }
            }
          });
      });
    }

    return newQuest;
  };

  const acceptQuest = (questId: string) => {
    soundFX.notification();
    setQuests((prev) =>
      prev.map((q) => {
        if (q.id === questId) {
          return {
            ...q,
            status: 'ACCEPTED',
            runner_id: profile.id,
            runner_name: profile.full_name,
            runner_phone: profile.phone,
            runner_avatar: profile.avatar_url,
            updated_at: new Date().toISOString()
          };
        }
        return q;
      })
    );

    const client = supabase;
    if (client) {
      syncProfileToSupabase(profile).then(() => {
        const updatePayload = {
          status: 'ACCEPTED',
          runner_id: profile.id,
          runner_name: profile.full_name,
          runner_phone: profile.phone,
          runner_avatar: profile.avatar_url,
          updated_at: new Date().toISOString()
        };

        client
          .from('quests')
          .update(updatePayload)
          .eq('id', questId)
          .then(async ({ error }) => {
            if (error) {
              console.warn('Supabase acceptQuest warning (retrying core fields):', error.message);
              const { runner_phone, ...coreUpdate } = updatePayload;
              await client.from('quests').update(coreUpdate).eq('id', questId);
            }
          });
      });
    }
  };

  const declineQuest = (questId: string) => {
    soundFX.pop();
    // Decline just leaves it in open state or logs refusal
  };

  const updateQuestStatus = (questId: string, status: QuestStatus) => {
    soundFX.pop();
    setQuests((prev) =>
      prev.map((q) => {
        if (q.id === questId) {
          return {
            ...q,
            status,
            updated_at: new Date().toISOString()
          };
        }
        return q;
      })
    );

    if (supabase) {
      supabase
        .from('quests')
        .update({
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', questId)
        .then(({ error }) => {
          if (error) console.warn('Supabase updateQuestStatus warning:', error.message);
        });
    }
  };

  const updateItemCost = (questId: string, cost: number, receiptUrl?: string) => {
    soundFX.pop();
    setQuests((prev) =>
      prev.map((q) => {
        if (q.id === questId) {
          return {
            ...q,
            item_cost: cost,
            ...(receiptUrl ? { receipt_image_url: receiptUrl } : {}),
            updated_at: new Date().toISOString()
          };
        }
        return q;
      })
    );

    if (supabase) {
      supabase
        .from('quests')
        .update({
          item_cost: cost,
          ...(receiptUrl ? { receipt_image_url: receiptUrl } : {}),
          updated_at: new Date().toISOString()
        })
        .eq('id', questId)
        .then(({ error }) => {
          if (error) console.warn('Supabase updateItemCost warning:', error.message);
        });
    }
  };

  const verifyOtpAndComplete = (questId: string, inputOtp: string) => {
    const quest = quests.find((q) => q.id === questId);
    if (!quest) return { success: false, message: 'Quest tidak ditemukan' };

    if (quest.completion_otp.trim() !== inputOtp.trim()) {
      return { success: false, message: 'Kode OTP keliru! Minta kode 6 digit dari Runner.' };
    }

    // Success OTP completion
    soundFX.success();

    // =========================================================================
    // ATURAN SALDO, PAJAK PLATFORM & POIN:
    // 1. Pajak platform 10% HANYA dihitung dari upah ongkir/bounty jasa.
    // 2. Biaya barang / belanjaan / servis tambahan (item_cost) 100% diganti utuh.
    // 3. Poin loyalitas mahasiswa (CQ Points) dihitung dari ongkir (1 poin per Rp 1.000).
    // =========================================================================
    const platformFee = Math.round(quest.bounty_fee * 0.10);
    const netBounty = quest.bounty_fee - platformFee; // 90% ongkir bersih runner
    const itemCost = quest.item_cost || 0; // 100% penggantian nota belanja
    const runnerEarnings = netBounty + itemCost;
    const pointsEarned = Math.floor(quest.bounty_fee / 1000);

    setQuests((prev) =>
      prev.map((q) => {
        if (q.id === questId) {
          return {
            ...q,
            status: 'COMPLETED',
            payment_status: 'PAID',
            updated_at: new Date().toISOString()
          };
        }
        return q;
      })
    );

    // Update profil: jika runner yang login atau eksekutor misi, tambahkan penghasilan & poin
    setProfile((prev) => {
      const isRunner = prev.active_mode === 'runner' || prev.id === quest.runner_id;
      const updatedBalance = isRunner ? prev.wallet_balance + runnerEarnings : prev.wallet_balance;
      const updatedPoints = (prev.points || 0) + pointsEarned;
      const updated = {
        ...prev,
        total_completed_orders: prev.total_completed_orders + 1,
        wallet_balance: updatedBalance,
        points: updatedPoints
      };
      syncProfileToSupabase(updated);
      return updated;
    });

    const client = supabase;
    if (client) {
      client
        .from('quests')
        .update({
          status: 'COMPLETED',
          payment_status: 'PAID',
          updated_at: new Date().toISOString()
        })
        .eq('id', questId)
        .then(({ error }) => {
          if (error) console.warn('Supabase completeQuest warning:', error.message);
        });
    }

    return {
      success: true,
      message: `Transaksi Selesai! Runner menerima Rp ${runnerEarnings.toLocaleString('id-ID')} (Ongkir Bersih Rp ${netBounty.toLocaleString('id-ID')} + Penggantian Nota Rp ${itemCost.toLocaleString('id-ID')}). Pajak Platform: Rp ${platformFee.toLocaleString('id-ID')} (10% ongkir). Poin: +${pointsEarned} Poin.`
    };
  };

  const cancelQuest = (questId: string, reason?: string) => {
    const quest = quests.find((q) => q.id === questId);
    if (!quest) {
      return { success: false, message: 'Quest tidak ditemukan.' };
    }

    // CATATAN: Quest HANYA dapat dibatalkan jika BELUM diterima oleh runner!
    if (quest.status !== 'OPEN' || quest.runner_id) {
      return {
        success: false,
        message: 'Quest tidak dapat dibatalkan karena sudah diterima oleh runner dan sedang diproses.'
      };
    }

    soundFX.pop();

    setQuests((prev) =>
      prev.map((q) => {
        if (q.id === questId) {
          return {
            ...q,
            status: 'CANCELLED',
            notes: reason ? `${q.notes || ''} [Dibatalkan oleh pemesan: ${reason}]` : q.notes,
            updated_at: new Date().toISOString()
          };
        }
        return q;
      })
    );

    const client = supabase;
    if (client) {
      client
        .from('quests')
        .update({
          status: 'CANCELLED',
          updated_at: new Date().toISOString()
        })
        .eq('id', questId)
        .then(({ error }) => {
          if (error) console.warn('Supabase cancelQuest warning:', error.message);
        });
    }

    return {
      success: true,
      message: 'Quest berhasil dibatalkan. Pesanan telah dihapus dari antrean runner.'
    };
  };

  const increaseBounty = (questId: string, addedAmount: number) => {
    const quest = quests.find((q) => q.id === questId);
    if (!quest) return { success: false, message: 'Quest tidak ditemukan.' };

    if (quest.status !== 'OPEN') {
      return { success: false, message: 'Hanya quest yang belum diambil yang dapat dinaikkan bounty-nya.' };
    }

    soundFX.notification();
    const newBounty = quest.bounty_fee + addedAmount;

    setQuests((prev) =>
      prev.map((q) => {
        if (q.id === questId) {
          return {
            ...q,
            bounty_fee: newBounty,
            updated_at: new Date().toISOString()
          };
        }
        return q;
      })
    );

    const client = supabase;
    if (client) {
      client
        .from('quests')
        .update({
          bounty_fee: newBounty,
          updated_at: new Date().toISOString()
        })
        .eq('id', questId)
        .then(({ error }) => {
          if (error) console.warn('Supabase increaseBounty warning:', error.message);
        });
    }

    return {
      success: true,
      message: `Bounty berhasil dinaikkan menjadi Rp ${newBounty.toLocaleString('id-ID')} agar lebih cepat diambil runner!`
    };
  };

  const submitPaymentProof = (questId: string, proofUrl: string, method: PaymentMethod) => {
    soundFX.pop();
    setQuests((prev) =>
      prev.map((q) => {
        if (q.id === questId) {
          return {
            ...q,
            payment_proof_url: proofUrl,
            payment_method: method,
            payment_status: 'PAID',
            updated_at: new Date().toISOString()
          };
        }
        return q;
      })
    );

    if (supabase) {
      supabase
        .from('quests')
        .update({
          payment_proof_url: proofUrl,
          payment_method: method,
          payment_status: 'PAID',
          updated_at: new Date().toISOString()
        })
        .eq('id', questId)
        .then(({ error }) => {
          if (error) console.warn('Supabase submitPaymentProof warning:', error.message);
        });
    }
  };

  const confirmPaymentReceived = (questId: string) => {
    soundFX.pop();
    setQuests((prev) =>
      prev.map((q) => {
        if (q.id === questId) {
          return {
            ...q,
            payment_status: 'PAID',
            updated_at: new Date().toISOString()
          };
        }
        return q;
      })
    );

    if (supabase) {
      supabase
        .from('quests')
        .update({
          payment_status: 'PAID',
          updated_at: new Date().toISOString()
        })
        .eq('id', questId)
        .then(({ error }) => {
          if (error) console.warn('Supabase confirmPayment warning:', error.message);
        });
    }
  };

  const submitReview = (questId: string, rating: number, comment: string) => {
    soundFX.pop();
    const newReview: Review = {
      id: `rev-${Date.now().toString(36)}`,
      quest_id: questId,
      customer_id: profile.id,
      customer_name: profile.full_name,
      runner_id: 'runner-assigned',
      rating,
      comment,
      created_at: new Date().toISOString()
    };
    setReviews((prev) => [newReview, ...prev]);

    if (supabase) {
      supabase
        .from('reviews')
        .insert({
          id: newReview.id,
          quest_id: newReview.quest_id,
          customer_id: newReview.customer_id,
          customer_name: newReview.customer_name,
          runner_id: newReview.runner_id,
          rating: newReview.rating,
          comment: newReview.comment,
          created_at: newReview.created_at
        })
        .then(({ error }) => {
          if (error) console.warn('Supabase submitReview warning:', error.message);
        });
    }
  };

  const sendChatMessage = (questId: string, content: string, mediaUrl?: string) => {
    soundFX.pop();
    const newMsg: ChatMessage = {
      id: `msg-${Date.now().toString(36)}`,
      quest_id: questId,
      sender_id: profile.id,
      sender_name: profile.full_name,
      sender_role: profile.active_mode,
      content,
      media_url: mediaUrl,
      created_at: new Date().toISOString()
    };

    setChats((prev) => ({
      ...prev,
      [questId]: [...(prev[questId] || []), newMsg]
    }));

    if (supabase) {
      supabase
        .from('chat_messages')
        .insert({
          id: newMsg.id,
          quest_id: newMsg.quest_id,
          sender_id: newMsg.sender_id,
          sender_name: newMsg.sender_name,
          sender_role: newMsg.sender_role,
          content: newMsg.content,
          media_url: newMsg.media_url,
          created_at: newMsg.created_at
        })
        .then(({ error }) => {
          if (error) console.warn('Supabase sendChatMessage warning:', error.message);
        });
    }
  };

  const updateKtm = (watermarkedKtmUrl: string) => {
    soundFX.notification();
    setProfile((prev) => ({
      ...prev,
      ktm_url: watermarkedKtmUrl,
      is_verified: true
    }));
  };

  const updateProfile = (updated: Partial<Profile>) => {
    soundFX.pop();
    setProfile((prev) => {
      const merged = { ...prev, ...updated };
      syncProfileToSupabase(merged);
      return merged;
    });
  };

  const withdrawWallet = (amount: number, method: string): boolean => {
    if (amount > profile.wallet_balance || amount <= 0) return false;
    soundFX.notification();
    setProfile((prev) => ({
      ...prev,
      wallet_balance: prev.wallet_balance - amount
    }));
    return true;
  };

  const openLoginModal = () => {
    soundFX.pop();
    setIsLoginModalOpen(true);
  };

  const closeLoginModal = () => {
    setIsLoginModalOpen(false);
  };

  const enterGuestMode = () => {
    soundFX.pop();
    setIsGuestMode(true);
  };

  const exitGuestMode = () => {
    soundFX.pop();
    setIsGuestMode(false);
  };

  const registerAccount = (data: {
    fullName: string;
    nim: string;
    password?: string;
    major?: string;
    faculty?: string;
    university?: string;
    phone?: string;
    role: UserRole;
    avatarUrl?: string;
    ktmUrl?: string;
  }): { success: boolean; message: string } => {
    const cleanNim = data.nim.trim();
    const cleanName = data.fullName.trim();
    const cleanMajor = data.major?.trim() || 'Mekatronika dan Kecerdasan Buatan (S1)';
    const cleanFaculty = data.faculty?.trim() || 'Kampus UPI di Purwakarta';
    const cleanPassword = data.password?.trim() || '123456';
    const cleanRole = data.role;

    if (!cleanNim || cleanNim.length < 5) {
      return { success: false, message: 'NIM harus terdiri dari minimal 5 digit angka UPI.' };
    }
    if (!cleanName) {
      return { success: false, message: 'Nama lengkap mahasiswa wajib diisi.' };
    }

    const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(cleanName)}&background=e11d48&color=fff&size=200`;
    
    // Each registered credential has its own isolated ID based on nim + password
    const credHash = cleanPassword
      ? Math.abs(cleanPassword.split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0)).toString(36)
      : Date.now().toString(36);
    const accountId = `usr-${cleanNim}-${credHash}`;
    
    const newProfile: Profile = {
      id: accountId,
      full_name: cleanName,
      nim: cleanNim,
      university: data.university || 'Universitas Pendidikan Indonesia (UPI)',
      faculty: cleanFaculty,
      major: cleanMajor,
      phone: data.phone || '08' + Math.floor(1000000000 + Math.random() * 9000000000),
      avatar_url: data.avatarUrl || fallbackAvatar,
      ktm_url: data.ktmUrl,
      is_verified: true,
      active_mode: cleanRole,
      student_status: 'AKTIF',
      runner_specialty: ['JASTAP', 'JARVIS'],
      rating: 5.0,
      total_completed_orders: 0,
      wallet_balance: cleanRole === 'runner' ? 25000 : 50000,
      created_at: new Date().toISOString()
    };

    // Save account in REGISTERED_ACCOUNTS list (supports different passwords for same NIM!)
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.REGISTERED_ACCOUNTS);
      const accounts: RegisteredAccount[] = stored ? JSON.parse(stored) : [];
      const updatedAccounts = accounts.filter((a) => !(a.nim === cleanNim && a.password === cleanPassword));
      updatedAccounts.push({
        id: newProfile.id,
        nim: cleanNim,
        password: cleanPassword,
        full_name: cleanName,
        major: cleanMajor,
        faculty: cleanFaculty,
        university: newProfile.university || 'Universitas Pendidikan Indonesia (UPI)',
        phone: newProfile.phone,
        role: cleanRole,
        avatar_url: newProfile.avatar_url,
        ktm_url: newProfile.ktm_url,
        created_at: newProfile.created_at
      });
      localStorage.setItem(STORAGE_KEYS.REGISTERED_ACCOUNTS, JSON.stringify(updatedAccounts));
    } catch {
      // quota
    }

    soundFX.success();
    fireCelebrationConfetti();
    setProfile(newProfile);
    setIsLoggedIn(true);
    setIsGuestMode(false);
    setIsLoginModalOpen(false);
    setActiveTab('home');

    syncProfileToSupabase(newProfile);

    return {
      success: true,
      message: `Pendaftaran berhasil! Selamat datang, ${cleanName}. Masuk sebagai ${cleanRole === 'runner' ? 'Runner' : 'Customer'}.`
    };
  };

  const loginWithCredentials = (
    nim: string,
    password?: string,
    targetRole?: UserRole
  ): { success: boolean; message: string } => {
    const cleanNim = nim.trim();
    const cleanPassword = password?.trim() || '';

    if (!cleanNim) {
      return { success: false, message: 'Nomor Induk Mahasiswa (NIM) wajib diisi.' };
    }

    // Role Admin validation: Admin view is private to authorized admins only
    if (targetRole === 'admin') {
      if (!isAuthorizedAdminNim(cleanNim)) {
        return {
          success: false,
          message: 'NIM ini bukan salah satu Administrator resmi (Airis, Tria, Abdu, Randi).'
        };
      }
      return loginAsAdmin(cleanNim, cleanPassword);
    }

    // 1. Check registered accounts list
    let registeredList: RegisteredAccount[] = [];
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.REGISTERED_ACCOUNTS);
      if (stored) registeredList = JSON.parse(stored);
    } catch {
      registeredList = [];
    }

    // Look for exact match of nim + password
    const matched = registeredList.find(
      (a) => a.nim === cleanNim && (cleanPassword ? a.password === cleanPassword : true)
    );

    // If password provided and no exact match found, but NIM exists with different password:
    if (!matched && cleanPassword) {
      const nimExists = registeredList.find((a) => a.nim === cleanNim);
      if (nimExists) {
        return { success: false, message: 'Password salah untuk akun NIM ini. Silakan cek kembali atau daftar baru.' };
      }
    }

    // 2. Check DEMO_STUDENTS if not in registered accounts
    if (!matched) {
      const demo = DEMO_STUDENTS.find((s) => s.nim === cleanNim);
      if (demo) {
        soundFX.success();
        fireCelebrationConfetti();
        const roleToUse = targetRole || demo.active_mode;
        const loggedProfile = { ...demo, active_mode: roleToUse };
        setProfile(loggedProfile);
        setIsLoggedIn(true);
        setIsGuestMode(false);
        setIsLoginModalOpen(false);
        setActiveTab('home');
        return { success: true, message: `Login berhasil! Selamat datang kembali, ${demo.full_name}.` };
      }
    }

    if (matched) {
      soundFX.success();
      fireCelebrationConfetti();
      const roleToUse = targetRole || matched.role;
      const loggedProfile: Profile = {
        id: matched.id,
        full_name: matched.full_name,
        nim: matched.nim,
        university: matched.university,
        faculty: matched.faculty,
        major: matched.major,
        phone: matched.phone,
        avatar_url: matched.avatar_url,
        ktm_url: matched.ktm_url,
        is_verified: true,
        student_status: 'AKTIF',
        active_mode: roleToUse,
        runner_specialty: ['JASTAP', 'JARVIS'],
        rating: 5.0,
        total_completed_orders: 0,
        wallet_balance: roleToUse === 'runner' ? 25000 : 50000,
        created_at: matched.created_at
      };
      setProfile(loggedProfile);
      setIsLoggedIn(true);
      setIsGuestMode(false);
      setIsLoginModalOpen(false);
      setActiveTab('home');
      return {
        success: true,
        message: `Login berhasil! Selamat datang kembali, ${matched.full_name} (${roleToUse === 'runner' ? 'Runner' : 'Customer'}).`
      };
    }

    // If not found in registered accounts or demo accounts, do not allow login without prior registration
    return {
      success: false,
      message: 'Akun dengan NIM ini belum terdaftar. Mahasiswa UPI wajib mendaftar dan memindai KTM resmi pada menu "Daftar".'
    };
  };

  const loginWithKtm = (data: {
    fullName: string;
    nim: string;
    password?: string;
    university?: string;
    faculty?: string;
    major?: string;
    phone?: string;
    ktmUrl: string;
    avatarUrl?: string;
    role?: UserRole;
  }) => {
    registerAccount({
      fullName: data.fullName,
      nim: data.nim,
      password: data.password || '123456',
      major: data.major,
      faculty: data.faculty,
      university: data.university,
      phone: data.phone,
      role: data.role || 'customer',
      avatarUrl: data.avatarUrl,
      ktmUrl: data.ktmUrl
    });
  };

  const loginWithNim = (nim: string, _pin?: string, university?: string, faculty?: string): { success: boolean; message: string } => {
    const cleanNim = nim.trim();
    if (!cleanNim || cleanNim.length < 5) {
      return { success: false, message: 'NIM harus terdiri dari minimal 5 digit angka.' };
    }
    const found = DEMO_STUDENTS.find((s) => s.nim === cleanNim);
    if (found) {
      soundFX.success();
      fireCelebrationConfetti();
      setProfile(found);
      setIsLoggedIn(true);
      setIsGuestMode(false);
      setIsLoginModalOpen(false);
      return { success: true, message: `Login berhasil! Selamat datang kembali di CampusQuest UPI, ${found.full_name}.` };
    }

    const created: Profile = {
      id: `usr-upi-${cleanNim}`,
      full_name: `Mahasiswa UPI (${cleanNim})`,
      nim: cleanNim,
      university: university || 'Universitas Pendidikan Indonesia (UPI)',
      faculty: faculty || 'FPTK - Pendidikan Teknik Mesin',
      phone: '0812' + Math.floor(10000000 + Math.random() * 90000000),
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      ktm_url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&auto=format&fit=crop&q=80',
      is_verified: true,
      student_status: 'AKTIF',
      active_mode: 'customer',
      runner_specialty: ['JASTAP'],
      rating: 5.0,
      total_completed_orders: 0,
      wallet_balance: 50000,
      created_at: new Date().toISOString()
    };
    soundFX.success();
    fireCelebrationConfetti();
    setProfile(created);
    setIsLoggedIn(true);
    setIsGuestMode(false);
    setIsLoginModalOpen(false);

    if (supabase) {
      supabase.from('profiles').upsert({
        id: created.id,
        full_name: created.full_name,
        nim: created.nim,
        phone: created.phone,
        avatar_url: created.avatar_url,
        ktm_url: created.ktm_url,
        university: created.university,
        faculty: created.faculty,
        major: created.major,
        is_verified: created.is_verified,
        active_mode: created.active_mode
      }).then(({ error }) => {
        if (error) console.warn('Supabase loginWithNim upsert:', error.message);
      });
    }

    return { success: true, message: `Akun Mahasiswa dengan NIM ${cleanNim} berhasil dibuat dan masuk!` };
  };

  const loginAsStudent = (student: Profile) => {
    soundFX.success();
    fireCelebrationConfetti();
    setProfile(student);
    setIsLoggedIn(true);
    setIsGuestMode(false);
    setIsLoginModalOpen(false);

    if (supabase) {
      supabase.from('profiles').upsert(student).then(({ error }) => {
        if (error) console.warn('Supabase loginAsStudent upsert:', error.message);
      });
    }
  };

  const logout = () => {
    soundFX.pop();
    setIsLoggedIn(false);
    setIsGuestMode(false);
    setActiveTab('home');
    localStorage.removeItem(STORAGE_KEYS.IS_LOGGED_IN);
    localStorage.removeItem('cq_is_logged_in');
  };

  // =========================================================================
  // ADMIN PLATFORM METHODS & METRICS
  // =========================================================================
  const totalPlatformFee = quests
    .filter((q) => q.status === 'COMPLETED')
    .reduce((sum, q) => sum + Math.round(q.bounty_fee * 0.1), 0);

  const loginAsAdmin = (
    nim?: string,
    password?: string
  ): { success: boolean; message: string } => {
    // If credentials provided (via AdminAuthModal)
    if (nim !== undefined || password !== undefined) {
      const cleanNim = (nim || '').trim();
      const cleanPass = (password || '').trim();

      if (cleanPass !== ADMIN_PASSWORD) {
        return {
          success: false,
          message: 'Password administrator salah!'
        };
      }

      const adminData = getAuthorizedAdminByNim(cleanNim);
      if (!adminData) {
        return {
          success: false,
          message: 'NIM ini tidak terdaftar sebagai Administrator resmi.'
        };
      }

      const adminProfile: Profile = {
        id: `usr-admin-${adminData.nim}`,
        full_name: adminData.name,
        nim: adminData.nim,
        university: 'Universitas Pendidikan Indonesia (UPI)',
        faculty: adminData.faculty,
        major: adminData.major,
        phone: adminData.phone,
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
        is_verified: true,
        active_mode: 'admin',
        runner_specialty: ['JASTAP', 'JARVIS'],
        rating: 5.0,
        total_completed_orders: 150,
        wallet_balance: 2500000,
        points: 2500,
        created_at: new Date(Date.now() - 90 * 86400000).toISOString()
      };

      soundFX.success();
      fireCelebrationConfetti();
      setProfile(adminProfile);
      setIsLoggedIn(true);
      setIsGuestMode(false);
      setIsLoginModalOpen(false);
      setIsAdminAuthModalOpen(false);
      setActiveTab('home');
      syncProfileToSupabase(adminProfile);

      return {
        success: true,
        message: `Berhasil masuk sebagai Administrator: ${adminData.name}`
      };
    }

    // If called without credentials (e.g. shortcut click), check if current profile is already admin
    if (!isAuthorizedAdminNim(profile.nim)) {
      setIsAdminAuthModalOpen(true);
      return { success: false, message: 'Autentikasi administrator diperlukan.' };
    }

    soundFX.success();
    fireCelebrationConfetti();
    setProfile((prev) => ({ ...prev, active_mode: 'admin' }));
    setIsLoggedIn(true);
    setIsGuestMode(false);
    setIsLoginModalOpen(false);
    setIsAdminAuthModalOpen(false);
    setActiveTab('home');
    return { success: true, message: 'Selamat datang di Portal Admin.' };
  };

  const adminForceCompleteQuest = (questId: string) => {
    soundFX.success();
    setQuests((prev) =>
      prev.map((q) => {
        if (q.id === questId) {
          return {
            ...q,
            status: 'COMPLETED',
            payment_status: 'PAID',
            updated_at: new Date().toISOString()
          };
        }
        return q;
      })
    );

    if (supabase) {
      supabase
        .from('quests')
        .update({
          status: 'COMPLETED',
          payment_status: 'PAID',
          updated_at: new Date().toISOString()
        })
        .eq('id', questId)
        .then(({ error }) => {
          if (error) console.warn('Supabase adminForceCompleteQuest warning:', error.message);
        });
    }

    return {
      success: true,
      message: 'Quest berhasil diselesaikan paksa oleh Administrator UPI.'
    };
  };

  const adminForceCancelQuest = (questId: string, reason?: string) => {
    soundFX.pop();
    setQuests((prev) =>
      prev.map((q) => {
        if (q.id === questId) {
          return {
            ...q,
            status: 'CANCELLED',
            notes: reason ? `${q.notes || ''} [Dibatalkan Admin: ${reason}]` : q.notes,
            updated_at: new Date().toISOString()
          };
        }
        return q;
      })
    );

    if (supabase) {
      supabase
        .from('quests')
        .update({
          status: 'CANCELLED',
          updated_at: new Date().toISOString()
        })
        .eq('id', questId)
        .then(({ error }) => {
          if (error) console.warn('Supabase adminForceCancelQuest warning:', error.message);
        });
    }

    return {
      success: true,
      message: 'Quest berhasil dibatalkan oleh Administrator.'
    };
  };

  const adminResetQuest = (questId: string) => {
    soundFX.pop();
    setQuests((prev) =>
      prev.map((q) => {
        if (q.id === questId) {
          return {
            ...q,
            status: 'OPEN',
            runner_id: undefined,
            runner_name: undefined,
            runner_avatar: undefined,
            runner_phone: undefined,
            item_cost: 0,
            receipt_image_url: undefined,
            updated_at: new Date().toISOString()
          };
        }
        return q;
      })
    );

    if (supabase) {
      supabase
        .from('quests')
        .update({
          status: 'OPEN',
          runner_id: null,
          runner_name: null,
          runner_avatar: null,
          runner_phone: null,
          item_cost: 0,
          receipt_image_url: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', questId)
        .then(({ error }) => {
          if (error) console.warn('Supabase adminResetQuest warning:', error.message);
        });
    }

    return {
      success: true,
      message: 'Quest berhasil di-reset kembali ke status OPEN (antrean publik).'
    };
  };

  const adminDeleteQuest = (questId: string) => {
    soundFX.pop();
    setQuests((prev) => prev.filter((q) => q.id !== questId));

    if (supabase) {
      supabase
        .from('quests')
        .delete()
        .eq('id', questId)
        .then(({ error }) => {
          if (error) console.warn('Supabase adminDeleteQuest warning:', error.message);
        });
    }

    return {
      success: true,
      message: 'Quest berhasil dihapus permanen dari sistem.'
    };
  };

  const adminVerifyUser = (nim: string, isVerified: boolean) => {
    soundFX.notification();
    setRegisteredAccounts((prev) => {
      const updated = prev.map((a) => (a.nim === nim ? { ...a, is_verified: isVerified } : a));
      localStorage.setItem(STORAGE_KEYS.REGISTERED_ACCOUNTS, JSON.stringify(updated));
      return updated;
    });

    if (profile.nim === nim) {
      setProfile((prev) => ({ ...prev, is_verified: isVerified }));
    }
  };

  const adminToggleUserStatus = (nim: string, status: 'AKTIF' | 'CUTI' | 'LULUS') => {
    soundFX.notification();
    if (profile.nim === nim) {
      setProfile((prev) => ({ ...prev, student_status: status }));
    }
  };

  const resetToDefaultData = () => {
    setProfile(INITIAL_PROFILE);
    setIsLoggedIn(false);
    setIsGuestMode(false);
    setQuests(INITIAL_QUESTS);
    setChats(INITIAL_CHATS);
    setReviews(INITIAL_REVIEWS);
    localStorage.removeItem(STORAGE_KEYS.PROFILE);
    localStorage.removeItem(STORAGE_KEYS.IS_LOGGED_IN);
    localStorage.removeItem(STORAGE_KEYS.QUESTS);
    localStorage.removeItem(STORAGE_KEYS.CHATS);
    localStorage.removeItem(STORAGE_KEYS.REVIEWS);
    soundFX.pop();
  };

  return (
    <CampusQuestContext.Provider
      value={{
        profile,
        isLoggedIn,
        isLoaded,
        isGuestMode,
        activeRole: profile.active_mode,
        quests,
        chats,
        reviews,
        selectedQuestId,
        activeTab,
        isLoginModalOpen,
        openLoginModal,
        closeLoginModal,
        enterGuestMode,
        exitGuestMode,
        registerAccount,
        loginWithCredentials,
        loginWithKtm,
        loginWithNim,
        loginAsStudent,
        logout,
        setActiveTab,
        setSelectedQuestId,
        switchRole,
        createQuest,
        acceptQuest,
        declineQuest,
        updateQuestStatus,
        updateItemCost,
        verifyOtpAndComplete,
        submitPaymentProof,
        confirmPaymentReceived,
        submitReview,
        sendChatMessage,
        updateKtm,
        cancelQuest,
        increaseBounty,
        updateProfile,
        withdrawWallet,
        resetToDefaultData,
        // Admin
        adminForceCompleteQuest,
        adminForceCancelQuest,
        adminResetQuest,
        adminVerifyUser,
        adminToggleUserStatus,
        adminDeleteQuest,
        loginAsAdmin,
        isAdminAuthModalOpen,
        openAdminAuthModal,
        closeAdminAuthModal,
        isCurrentUserAdmin,
        registeredAccounts,
        totalPlatformFee
      }}
    >
      {children}
    </CampusQuestContext.Provider>
  );
}

export function useCampusQuest() {
  const context = useContext(CampusQuestContext);
  if (!context) {
    throw new Error('useCampusQuest must be used within a CampusQuestProvider');
  }
  return context;
}
