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
  ServiceCategory
} from '@/types/campus-quest';
import {
  INITIAL_PROFILE,
  INITIAL_QUESTS,
  INITIAL_CHATS,
  INITIAL_REVIEWS,
  DEMO_STUDENTS
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
  loginWithKtm: (data: {
    fullName: string;
    nim: string;
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
  updateProfile: (updated: Partial<Profile>) => void;
  withdrawWallet: (amount: number, method: string) => boolean;
  resetToDefaultData: () => void;
}

const CampusQuestContext = createContext<CampusQuestContextType | null>(null);

const STORAGE_KEYS = {
  PROFILE: 'cq_profile_v2_upi',
  IS_LOGGED_IN: 'cq_is_logged_in_v2_upi',
  QUESTS: 'cq_quests_v2_upi',
  CHATS: 'cq_chats_v2_upi',
  REVIEWS: 'cq_reviews_v2_upi'
};

export function CampusQuestProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<Profile>(INITIAL_PROFILE);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [quests, setQuests] = useState<Quest[]>(INITIAL_QUESTS);
  const [chats, setChats] = useState<Record<string, ChatMessage[]>>(INITIAL_CHATS);
  const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS);
  const [selectedQuestId, setSelectedQuestId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'home' | 'quests' | 'map' | 'wallet' | 'profile'>('home');
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount & sync with Supabase
  useEffect(() => {
    queueMicrotask(() => {
      try {
        const savedProfile = localStorage.getItem(STORAGE_KEYS.PROFILE);
        const savedLogin = localStorage.getItem(STORAGE_KEYS.IS_LOGGED_IN);
        const savedQuests = localStorage.getItem(STORAGE_KEYS.QUESTS);
        const savedChats = localStorage.getItem(STORAGE_KEYS.CHATS);
        const savedReviews = localStorage.getItem(STORAGE_KEYS.REVIEWS);

        if (savedProfile) setProfile(JSON.parse(savedProfile));
        if (savedLogin !== null) {
          setIsLoggedIn(savedLogin === 'true');
        } else {
          setIsLoggedIn(false);
        }
        if (savedQuests) setQuests(JSON.parse(savedQuests));
        if (savedChats) setChats(JSON.parse(savedChats));
        if (savedReviews) setReviews(JSON.parse(savedReviews));
      } catch {
        setIsLoggedIn(false);
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

  // Save to localStorage when state updates
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
      localStorage.setItem(STORAGE_KEYS.IS_LOGGED_IN, String(isLoggedIn));
      localStorage.setItem(STORAGE_KEYS.QUESTS, JSON.stringify(quests));
      localStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(chats));
      localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(reviews));
    } catch {
      // quota or private browsing
    }
  }, [profile, isLoggedIn, quests, chats, reviews, isLoaded]);

  // Generate 6 digit OTP
  const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const switchRole = (role: UserRole) => {
    soundFX.pop();
    setProfile((prev) => ({
      ...prev,
      active_mode: role
    }));
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

    if (supabase) {
      supabase
        .from('quests')
        .insert({
          id: newQuest.id,
          customer_id: newQuest.customer_id,
          customer_name: newQuest.customer_name,
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
        })
        .then(({ error }) => {
          if (error) console.warn('Supabase insert quest warning:', error.message);
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
            runner_avatar: profile.avatar_url,
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
          status: 'ACCEPTED',
          runner_id: profile.id,
          runner_name: profile.full_name,
          runner_avatar: profile.avatar_url,
          updated_at: new Date().toISOString()
        })
        .eq('id', questId)
        .then(({ error }) => {
          if (error) console.warn('Supabase acceptQuest warning:', error.message);
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

    const earning = quest.bounty_fee;

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

    // If current profile is runner or customer, reward wallet
    setProfile((prev) => ({
      ...prev,
      total_completed_orders: prev.total_completed_orders + 1,
      wallet_balance: prev.wallet_balance + earning
    }));

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
          if (error) console.warn('Supabase completeQuest warning:', error.message);
        });
    }

    return { success: true, message: 'Transaksi Terverifikasi! Quest Berhasil Diselesaikan.' };
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
      if (supabase) {
        supabase.from('profiles').upsert(merged).then(({ error }) => {
          if (error) console.warn('Supabase updateProfile error:', error.message);
        });
      }
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

  const loginWithKtm = (data: {
    fullName: string;
    nim: string;
    university?: string;
    faculty?: string;
    major?: string;
    phone?: string;
    ktmUrl: string;
    avatarUrl?: string;
    role?: UserRole;
  }) => {
    soundFX.success();
    fireCelebrationConfetti();
    const cleanNim = data.nim.trim();
    const existing = DEMO_STUDENTS.find((s) => s.nim === cleanNim);
    const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(data.fullName)}&background=e11d48&color=fff&size=200`;
    const newProfile: Profile = {
      ...(existing || profile),
      id: existing ? existing.id : (profile.id.startsWith('usr-') ? profile.id : `usr-${Date.now().toString(36)}`),
      full_name: data.fullName,
      nim: cleanNim,
      university: data.university || existing?.university || 'Universitas Pendidikan Indonesia (UPI)',
      faculty: data.faculty || existing?.faculty || 'Kampus UPI di Purwakarta',
      major: data.major || existing?.major || 'Mekatronika dan Kecerdasan Buatan (S1)',
      phone: data.phone || existing?.phone || profile.phone,
      avatar_url: data.avatarUrl || existing?.avatar_url || fallbackAvatar,
      ktm_url: data.ktmUrl,
      is_verified: true,
      active_mode: data.role || existing?.active_mode || profile.active_mode,
      student_status: 'AKTIF'
    };
    setProfile(newProfile);
    setIsLoggedIn(true);
    setIsGuestMode(false);
    setIsLoginModalOpen(false);

    if (supabase) {
      supabase.from('profiles').upsert({
        id: newProfile.id,
        full_name: newProfile.full_name,
        nim: newProfile.nim,
        phone: newProfile.phone,
        avatar_url: newProfile.avatar_url,
        ktm_url: newProfile.ktm_url,
        faculty: newProfile.faculty,
        major: newProfile.major,
        is_verified: true,
        active_mode: newProfile.active_mode
      }).then(({ error }) => {
        if (error) console.warn('Supabase profile upsert:', error.message);
      });
    }
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
    localStorage.setItem(STORAGE_KEYS.IS_LOGGED_IN, 'false');
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
        updateProfile,
        withdrawWallet,
        resetToDefaultData
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
