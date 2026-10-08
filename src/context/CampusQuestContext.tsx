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
import { supabase } from '@/lib/supabase';

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

  // Load from localStorage on mount & sync with Supabase
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
