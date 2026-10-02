'use client';

import React, { useState } from 'react';
import {
  X,
  Heart,
  ThumbsDown,
  Share2,
  Bookmark,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Check,
  Send,
  RotateCw,
} from 'lucide-react';
import { Outfit } from '@/types/wardrobe';
import { useWardrobe } from '@/context/WardrobeContext';
import { ShareHelper } from '@/lib/shareHelper';
import confetti from 'canvas-confetti';

interface OutfitResultModalProps {
  outfits: Outfit[];
  isOpen: boolean;
  onClose: () => void;
  onRegenerate: () => void;
}

const WEEKDAYS = [
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
  'Domingo',
];

export const OutfitResultModal: React.FC<OutfitResultModalProps> = ({
  outfits,
  isOpen,
  onClose,
  onRegenerate,
}) => {
  const { saveOutfit, savedOutfits, rateOutfit, scheduleOutfit } = useWardrobe();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [showCalendarPicker, setShowCalendarPicker] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!isOpen || outfits.length === 0) return null;

  const currentOutfit = outfits[currentIndex] || outfits[0];
  const isAlreadySaved = savedOutfits.some((s) => s.id === currentOutfit.id);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleNext = () => {
    if (currentIndex < outfits.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    } else {
      setCurrentIndex(outfits.length - 1);
    }
  };

  const handleLike = () => {
    rateOutfit(currentOutfit.id, 'like');
    saveOutfit(currentOutfit);

    try {
      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.75 },
        colors: ['#C29F68', '#111110', '#EAE5DC'],
      });
    } catch {}

    showToast('Look salvo com sucesso! ❤️');
  };

  const handleDislike = () => {
    rateOutfit(currentOutfit.id, 'dislike');
    showToast('Anotado! Vamos sugerir outros estilos.');
    if (outfits.length > 1) {
      handleNext();
    }
  };

  const handleShareWhatsApp = () => {
    const text = ShareHelper.formatOutfitText(currentOutfit);
    ShareHelper.shareToWhatsApp(text);
  };

  const handleNativeShare = async () => {
    const result = await ShareHelper.shareOutfit(currentOutfit);
    if (result === 'copied') {
      showToast('Texto do look copiado!');
    }
  };

  const handleScheduleDay = (day: string) => {
    scheduleOutfit(day, currentOutfit);
    setShowCalendarPicker(false);
    showToast(`Agendado para ${day}! 📅`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/65 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#FBF9F5] rounded-t-3xl sm:rounded-3xl max-h-[94vh] flex flex-col shadow-2xl overflow-hidden border border-[#EAE5DC] relative">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 bg-[#18181B] text-[#FBF9F5] text-xs font-semibold px-4 py-2 rounded-full shadow-lg border border-[#C29F68]/30 animate-in fade-in slide-in-from-top-2">
            {toastMessage}
          </div>
        )}

        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#EAE5DC] bg-white/80 backdrop-blur-md">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-[#18181B] uppercase tracking-wider">
              Look {currentIndex + 1} de {outfits.length}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#C29F68]" />
            <span className="text-[11px] text-[#78756E] font-medium">
              {currentOutfit.score}% Harmonia
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleNativeShare}
              title="Compartilhar"
              className="w-8 h-8 rounded-full bg-[#F2EDE4] text-[#18181B] flex items-center justify-center active:scale-90 transition-transform"
            >
              <Share2 size={15} />
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#F2EDE4] text-[#6E6B65] flex items-center justify-center active:scale-90 transition-transform"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-5 overflow-y-auto flex-1 no-scrollbar space-y-5">
          {/* LOOK TITLE & STYLE BADGE */}
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-[#18181B] text-[#E5C799] rounded-full text-[10px] font-bold tracking-wider uppercase">
                {currentOutfit.style}
              </span>
              <span className="px-2 py-0.5 bg-[#EAE5DC] text-[#4A4843] rounded-full text-[10px] font-medium capitalize">
                {currentOutfit.occasion}
              </span>
            </div>
            <h2 className="font-serif text-xl font-bold text-[#111110] leading-snug">
              {currentOutfit.title}
            </h2>
          </div>

          {/* VISUAL COMPOSITION / COLLAGE CARD */}
          <div className="relative bg-gradient-to-b from-[#FFFFFF] to-[#FAF8F5] rounded-3xl p-4 border border-[#EAE5DC] shadow-sm">
            {/* Horizontal navigation buttons over the collage */}
            <div className="absolute top-1/2 -left-2 -translate-y-1/2 z-10">
              <button
                onClick={handlePrev}
                className="w-8 h-8 rounded-full bg-white/90 shadow-md border border-[#EAE5DC] text-[#111110] flex items-center justify-center active:scale-90"
              >
                <ChevronLeft size={18} />
              </button>
            </div>
            <div className="absolute top-1/2 -right-2 -translate-y-1/2 z-10">
              <button
                onClick={handleNext}
                className="w-8 h-8 rounded-full bg-white/90 shadow-md border border-[#EAE5DC] text-[#111110] flex items-center justify-center active:scale-90"
              >
                <ChevronRight size={18} />
              </button>
            </div>

            {/* Pieces Grid */}
            <div
              className={`grid gap-2.5 ${
                currentOutfit.items.length === 2
                  ? 'grid-cols-2'
                  : currentOutfit.items.length === 3
                  ? 'grid-cols-3'
                  : 'grid-cols-2'
              }`}
            >
              {currentOutfit.items.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl p-2.5 border border-[#ECE7DE] shadow-xs flex flex-col items-center text-center transition-transform hover:scale-[1.02]"
                >
                  <div className="w-full aspect-square relative max-h-28 flex items-center justify-center mb-1">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span className="text-[11px] font-bold text-[#111110] line-clamp-1 w-full">
                    {item.name}
                  </span>
                  <span className="text-[10px] text-[#78756E] line-clamp-1">
                    {item.color.name}
                  </span>
                </div>
              ))}
            </div>

            {/* Carousel Dots */}
            <div className="flex items-center justify-center gap-1.5 mt-3">
              {outfits.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-1.5 rounded-full transition-all ${
                    idx === currentIndex ? 'w-5 bg-[#C29F68]' : 'w-1.5 bg-[#DDD7CC]'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* STYLIST EXPLANATION ("Por que funciona?") */}
          <div className="bg-white p-4 rounded-2xl border border-[#EAE5DC] space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#18181B]">
              <Sparkles size={14} className="text-[#C29F68]" />
              <span>Por que funciona?</span>
            </div>
            <p className="text-xs text-[#4A4843] leading-relaxed">
              {currentOutfit.whyItWorks}
            </p>
            {currentOutfit.stylistTip && (
              <p className="text-[11px] text-[#78756E] italic pt-1 border-t border-[#F2EDE4]">
                {currentOutfit.stylistTip}
              </p>
            )}
          </div>

          {/* CALENDAR SCHEDULER POPUP */}
          {showCalendarPicker && (
            <div className="bg-[#18181B] text-white p-4 rounded-2xl space-y-2.5 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#E5C799]">
                  Agendar para qual dia?
                </span>
                <button
                  onClick={() => setShowCalendarPicker(false)}
                  className="text-white/60 hover:text-white text-xs"
                >
                  Fechar
                </button>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {WEEKDAYS.map((day) => (
                  <button
                    key={day}
                    onClick={() => handleScheduleDay(day)}
                    className="py-1.5 px-2 bg-white/10 hover:bg-white/20 rounded-lg text-xs font-medium text-left transition-colors"
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* SHARE ON WHATSAPP BUTTON (PROMINENT) */}
          <button
            onClick={handleShareWhatsApp}
            className="w-full py-3 px-4 bg-[#25D366] hover:bg-[#20BE5B] active:scale-98 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            <Send size={15} />
            <span>Enviar Look pelo WhatsApp</span>
          </button>
        </div>

        {/* MODAL FOOTER ACTIONS */}
        <div className="p-4 border-t border-[#EAE5DC] bg-white/95 flex items-center justify-between gap-2">
          {/* Dislike */}
          <button
            onClick={handleDislike}
            title="Não gostei"
            className="flex-1 py-2.5 rounded-xl border border-[#E0DACE] text-[#78756E] hover:text-[#18181B] active:scale-95 flex items-center justify-center gap-1.5 text-xs font-medium transition-all"
          >
            <ThumbsDown size={15} />
            <span>Não gostei</span>
          </button>

          {/* Schedule in Calendar */}
          <button
            onClick={() => setShowCalendarPicker(!showCalendarPicker)}
            title="Planejar no Calendário"
            className="p-2.5 rounded-xl border border-[#E0DACE] text-[#4A4843] hover:text-[#18181B] active:scale-95 flex items-center justify-center transition-all"
          >
            <Calendar size={17} />
          </button>

          {/* Like & Save Look (Main action) */}
          <button
            onClick={handleLike}
            className={`flex-[2] py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all ${
              isAlreadySaved
                ? 'bg-[#C29F68] text-white'
                : 'bg-[#18181B] text-[#FBF9F5] hover:bg-[#2A2A2E]'
            }`}
          >
            <Heart
              size={15}
              className={isAlreadySaved ? 'fill-white text-white' : 'text-[#E5C799]'}
            />
            <span>{isAlreadySaved ? 'Salvo nos Favoritos' : 'Gostei & Salvar'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
