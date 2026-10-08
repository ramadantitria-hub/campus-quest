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
  INITIAL_REVIEWS
} from '@/lib/mock-data';
import { soundFX } from '@/lib/audio';

interface CampusQuestContextType {
  profile: Profile;
  activeRole: UserRole;
  quests: Quest[];
  chats: Record<string, ChatMessage[]>;
  reviews: Review[];
  selectedQuestId: string | null;
  activeTab: 'home' | 'quests' | 'map' | 'wallet' | 'profile';
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
  PROFILE: 'cq_profile_v1',
  QUESTS: 'cq_quests_v1',
  CHATS: 'cq_chats_v1',
  REVIEWS: 'cq_reviews_v1'
};

export function CampusQuestProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<Profile>(INITIAL_PROFILE);
  const [quests, setQuests] = useState<Quest[]>(INITIAL_QUESTS);
  const [chats, setChats] = useState<Record<string, ChatMessage[]>>(INITIAL_CHATS);
  const [reviews, setReviews] = useState<Review[]>(INITIAL_REVIEWS);
  const [selectedQuestId, setSelectedQuestId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'home' | 'quests' | 'map' | 'wallet' | 'profile'>('home');
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    queueMicrotask(() => {
      try {
        const savedProfile = localStorage.getItem(STORAGE_KEYS.PROFILE);
        const savedQuests = localStorage.getItem(STORAGE_KEYS.QUESTS);
        const savedChats = localStorage.getItem(STORAGE_KEYS.CHATS);
        const savedReviews = localStorage.getItem(STORAGE_KEYS.REVIEWS);

        if (savedProfile) setProfile(JSON.parse(savedProfile));
        if (savedQuests) setQuests(JSON.parse(savedQuests));
        if (savedChats) setChats(JSON.parse(savedChats));
        if (savedReviews) setReviews(JSON.parse(savedReviews));
      } catch {
        // Fallback to initial
      }
      setIsLoaded(true);
    });
  }, []);

  // Save to localStorage when state updates
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
    setProfile((prev) => ({
      ...prev,
      ...updated
    }));
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

  const resetToDefaultData = () => {
    setProfile(INITIAL_PROFILE);
    setQuests(INITIAL_QUESTS);
    setChats(INITIAL_CHATS);
    setReviews(INITIAL_REVIEWS);
    localStorage.removeItem(STORAGE_KEYS.PROFILE);
    localStorage.removeItem(STORAGE_KEYS.QUESTS);
    localStorage.removeItem(STORAGE_KEYS.CHATS);
    localStorage.removeItem(STORAGE_KEYS.REVIEWS);
    soundFX.pop();
  };

  return (
    <CampusQuestContext.Provider
      value={{
        profile,
        activeRole: profile.active_mode,
        quests,
        chats,
        reviews,
        selectedQuestId,
        activeTab,
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
