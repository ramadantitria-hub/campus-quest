'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useCampusQuest } from '@/context/CampusQuestContext';
import { compressImage } from '@/lib/image-compressor';
import {
  X,
  Send,
  Image as ImageIcon,
  Paperclip,
  User,
  Sparkles,
  CheckCheck,
  Check
} from 'lucide-react';

interface LiveChatDrawerProps {
  questId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function LiveChatDrawer({ questId, isOpen, onClose }: LiveChatDrawerProps) {
  const { quests, chats, sendChatMessage, profile, activeRole } = useCampusQuest();

  const [messageText, setMessageText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const quest = quests.find((q) => q.id === questId);
  const questMessages = chats[questId] || [];

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen, questMessages.length]);

  if (!isOpen || !quest) return null;

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!messageText.trim() && !selectedImage) return;

    sendChatMessage(questId, messageText.trim(), selectedImage || undefined);
    setMessageText('');
    setSelectedImage(null);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCompressing(true);
    try {
      const res = await compressImage(file, 900, 900, 0.75);
      setSelectedImage(res.dataUrl);
    } catch {
      alert('Gagal mengompres gambar lampiran');
    } finally {
      setIsCompressing(false);
    }
  };

  const quickTemplates = [
    'Halo, pesanan sedang diproses ya!',
    'Saya sudah sampai di titik temu 👍',
    'Nota belanja sudah saya input ke rincian.',
    'Bisa tolong share foto detail barangnya?'
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-end">
      <div className="bg-slate-900 border-l border-slate-800 w-full max-w-md h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        {/* Chat Header */}
        <div className="p-4 bg-slate-950/90 border-b border-slate-800 flex items-center justify-between">
          <div className="min-w-0 pr-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <h4 className="text-sm font-bold text-white truncate">
                Live Chat: {quest.title}
              </h4>
            </div>
            <p className="text-xs text-slate-400 truncate mt-0.5">
              {activeRole === 'customer'
                ? `Runner: ${quest.runner_name || 'Menunggu Runner...'}`
                : `Pemesan: ${quest.customer_name}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-950/50">
          {questMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
              <div className="w-12 h-12 rounded-full bg-slate-800/80 flex items-center justify-center mb-2 text-sky-400">
                <Sparkles className="w-6 h-6" />
              </div>
              <p className="text-xs font-semibold text-slate-300">Belum ada obrolan</p>
              <p className="text-[11px] text-slate-500 mt-1 max-w-xs">
                Mulai percakapan untuk koordinasi titik temu, foto kondisi barang, atau bukti nota belanja!
              </p>
            </div>
          ) : (
            questMessages.map((msg) => {
              const isMe = msg.sender_id === profile.id;
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-1.5 mb-1 px-1 text-[11px] text-slate-400">
                    <span className="font-semibold text-slate-300">{msg.sender_name}</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-slate-800 text-sky-300">
                      {msg.sender_role === 'customer' ? 'Customer' : 'Runner'}
                    </span>
                  </div>

                  <div
                    className={`max-w-[85%] rounded-2xl p-3 shadow-md text-xs leading-relaxed ${
                      isMe
                        ? 'bg-gradient-to-r from-sky-600 to-blue-600 text-white rounded-br-none'
                        : 'bg-slate-800 border border-slate-700/80 text-slate-100 rounded-bl-none'
                    }`}
                  >
                    {msg.media_url && (
                      <div className="mb-2 rounded-xl overflow-hidden border border-white/10 bg-black/30">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={msg.media_url}
                          alt="Lampiran chat"
                          className="w-full max-h-56 object-cover cursor-pointer hover:scale-105 transition-transform"
                          onClick={() => window.open(msg.media_url, '_blank')}
                        />
                      </div>
                    )}
                    {msg.content && <p className="whitespace-pre-wrap">{msg.content}</p>}
                    <div
                      className={`text-[9px] mt-1 text-right flex items-center justify-end gap-1 ${
                        isMe ? 'text-sky-200' : 'text-slate-400'
                      }`}
                    >
                      <span>
                        {new Date(msg.created_at).toLocaleTimeString('id-ID', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      {isMe && <CheckCheck className="w-3 h-3 text-sky-300" />}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Response Chips */}
        <div className="px-3 py-2 bg-slate-900 border-t border-slate-800/80 overflow-x-auto flex gap-1.5 no-scrollbar">
          {quickTemplates.map((tmpl, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setMessageText(tmpl)}
              className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 whitespace-nowrap transition-colors shrink-0"
            >
              {tmpl}
            </button>
          ))}
        </div>

        {/* Image Attachment Preview */}
        {selectedImage && (
          <div className="px-4 py-2 bg-slate-900 border-t border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedImage}
                alt="Selected preview"
                className="w-12 h-12 object-cover rounded-lg border border-slate-700"
              />
              <span className="text-xs text-emerald-400 font-medium">
                Foto siap dikirim (Auto-Compressed)
              </span>
            </div>
            <button
              onClick={() => setSelectedImage(null)}
              className="text-slate-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Input Bar */}
        <form
          onSubmit={handleSend}
          className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          <button
            type="button"
            disabled={isCompressing}
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors cursor-pointer"
            title="Upload Nota / Foto Barang"
          >
            <ImageIcon className="w-4 h-4 text-sky-400" />
          </button>

          <input
            type="text"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-sky-500 transition-colors"
            placeholder="Ketik pesan atau koordinasi..."
          />

          <button
            type="submit"
            disabled={!messageText.trim() && !selectedImage}
            className="p-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 transition-colors shadow-md shadow-sky-500/20 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
