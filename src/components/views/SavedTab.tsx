'use client';

import React, { useState } from 'react';
import {
  Heart,
  Calendar as CalendarIcon,
  Share2,
  Trash2,
  Sparkles,
  ArrowRight,
  Send,
} from 'lucide-react';
import { Outfit } from '@/types/wardrobe';
import { useWardrobe } from '@/context/WardrobeContext';
import { ShareHelper } from '@/lib/shareHelper';

interface SavedTabProps {
  onOpenOutfitDetails: (outfits: Outfit[]) => void;
  onNavigateToCreate: () => void;
}

const WEEKDAYS = [
  { label: 'Segunda-feira', short: 'Seg', defaultOccasion: '💼 Trabalho' },
  { label: 'Terça-feira', short: 'Ter', defaultOccasion: '💼 Trabalho' },
  { label: 'Quarta-feira', short: 'Qua', defaultOccasion: '🍽️ Jantar' },
  { label: 'Quinta-feira', short: 'Qui', defaultOccasion: '💼 Trabalho' },
  { label: 'Sexta-feira', short: 'Sex', defaultOccasion: '❤️ Encontro' },
  { label: 'Sábado', short: 'Sáb', defaultOccasion: '🎉 Festa / Lazer' },
  { label: 'Domingo', short: 'Dom', defaultOccasion: '☀️ Casual / Almoço' },
];

export const SavedTab: React.FC<SavedTabProps> = ({
  onOpenOutfitDetails,
  onNavigateToCreate,
}) => {
  const { savedOutfits, removeSavedOutfit, calendarEntries, removeScheduledOutfit } = useWardrobe();

  const [activeSection, setActiveSection] = useState<'favorites' | 'calendar'>('favorites');

  const handleShareWhatsApp = (outfit: Outfit) => {
    const text = ShareHelper.formatOutfitText(outfit);
    ShareHelper.shareToWhatsApp(text);
  };

  return (
    <div className="space-y-4 pb-28 pt-2 px-4 animate-in fade-in duration-200">
      {/* Title */}
      <div className="pt-1">
        <h1 className="font-serif text-2xl font-bold tracking-tight text-[#111110]">
          Salvos & Planejamento
        </h1>
        <p className="text-xs text-[#78756E] mt-0.5">
          Suas melhores combinações e calendário semanal de looks
        </p>
      </div>

      {/* Segmented Control Switcher */}
      <div className="flex bg-[#EAE5DC]/70 p-1 rounded-2xl">
        <button
          onClick={() => setActiveSection('favorites')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSection === 'favorites'
              ? 'bg-white text-[#111110] shadow-xs'
              : 'text-[#68655E] hover:text-[#111110]'
          }`}
        >
          <span className="flex items-center justify-center gap-1.5">
            <Heart size={14} className={activeSection === 'favorites' ? 'fill-[#B82828] text-[#B82828]' : ''} />
            <span>Looks Salvos ({savedOutfits.length})</span>
          </span>
        </button>

        <button
          onClick={() => setActiveSection('calendar')}
          className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSection === 'calendar'
              ? 'bg-white text-[#111110] shadow-xs'
              : 'text-[#68655E] hover:text-[#111110]'
          }`}
        >
          <span className="flex items-center justify-center gap-1.5">
            <CalendarIcon size={14} />
            <span>Meu Calendário</span>
          </span>
        </button>
      </div>

      {/* SECTION 1: SAVED FAVORITE OUTFITS */}
      {activeSection === 'favorites' && (
        <div className="space-y-4">
          {savedOutfits.length > 0 ? (
            <div className="space-y-3.5">
              {savedOutfits.map((outfit) => (
                <div
                  key={outfit.id}
                  className="bg-white rounded-3xl border border-[#EAE5DC] p-4 shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="px-2.5 py-0.5 bg-[#18181B] text-[#E5C799] rounded-md text-[9px] font-bold uppercase tracking-wider">
                        {outfit.style}
                      </span>
                      <h3 className="font-serif font-bold text-sm text-[#111110] mt-1">
                        {outfit.title}
                      </h3>
                    </div>
                    <span className="text-xs font-bold text-[#C29F68]">
                      {outfit.score}%
                    </span>
                  </div>

                  {/* Collage Preview */}
                  <div
                    onClick={() => onOpenOutfitDetails([outfit])}
                    className="grid grid-cols-3 gap-2 bg-[#FAF8F5] p-2.5 rounded-2xl border border-[#EAE5DC] cursor-pointer hover:bg-[#F2EDE4]/60 transition-colors"
                  >
                    {outfit.items.slice(0, 3).map((item) => (
                      <div key={item.id} className="flex flex-col items-center text-center">
                        <div className="w-14 h-14 relative mb-1">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <span className="text-[10px] font-medium text-[#111110] line-clamp-1">
                          {item.name}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Footer with WhatsApp & Delete */}
                  <div className="flex items-center justify-between pt-1 border-t border-[#F2EDE4]">
                    <button
                      onClick={() => handleShareWhatsApp(outfit)}
                      className="flex items-center gap-1.5 text-xs font-bold text-[#25D366] hover:text-[#20BE5B] active:scale-95 transition-all"
                    >
                      <Send size={13} />
                      <span>WhatsApp</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onOpenOutfitDetails([outfit])}
                        className="text-xs font-semibold text-[#18181B] hover:underline"
                      >
                        Ver Detalhes
                      </button>
                      <button
                        onClick={() => removeSavedOutfit(outfit.id)}
                        className="text-[#78756E] hover:text-[#B82828] p-1.5 active:scale-90"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center space-y-3 bg-white rounded-3xl border border-[#EAE5DC] p-6">
              <div className="w-12 h-12 rounded-full bg-[#F2EDE4] text-[#B82828] flex items-center justify-center mx-auto">
                <Heart size={22} />
              </div>
              <div>
                <h3 className="font-serif font-bold text-base text-[#111110]">
                  Nenhum look salvo ainda
                </h3>
                <p className="text-xs text-[#78756E] mt-1 max-w-xs mx-auto">
                  Toque em "Montar meu look" e salve as combinações que você mais amar.
                </p>
              </div>
              <button
                onClick={onNavigateToCreate}
                className="py-2.5 px-4 bg-[#18181B] text-white rounded-xl text-xs font-bold shadow-sm active:scale-95 transition-all"
              >
                ✨ Criar Meu Primeiro Look
              </button>
            </div>
          )}
        </div>
      )}

      {/* SECTION 2: CALENDAR WEEKLY PLANNER */}
      {activeSection === 'calendar' && (
        <div className="space-y-3.5">
          <div className="bg-[#FAF8F5] p-3 rounded-2xl border border-[#EAE5DC] text-xs text-[#68655E]">
            <p className="font-semibold text-[#111110] mb-0.5">Planeje sua semana com antecedência</p>
            <p className="text-[11px]">
              Evite a indecisão matinal atribuindo looks para cada compromisso da sua rotina.
            </p>
          </div>

          <div className="space-y-2.5">
            {WEEKDAYS.map((day) => {
              const entry = calendarEntries.find((e) => e.dayLabel === day.label);

              return (
                <div
                  key={day.label}
                  className="bg-white rounded-2xl border border-[#EAE5DC] p-3.5 flex items-center justify-between gap-3 shadow-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-[#F2EDE4] flex flex-col items-center justify-center text-[#18181B] shrink-0 font-serif">
                      <span className="text-[9px] uppercase tracking-wider font-bold text-[#78756E]">
                        {day.short}
                      </span>
                      <span className="text-xs font-bold leading-none mt-0.5">
                        {day.label.slice(0, 3)}
                      </span>
                    </div>

                    <div>
                      <p className="text-xs font-bold text-[#111110]">{day.label}</p>
                      {entry ? (
                        <p className="text-[11px] text-[#C29F68] font-semibold line-clamp-1">
                          {entry.outfit.title}
                        </p>
                      ) : (
                        <p className="text-[10px] text-[#78756E]">
                          Sugestão: {day.defaultOccasion}
                        </p>
                      )}
                    </div>
                  </div>

                  {entry ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onOpenOutfitDetails([entry.outfit])}
                        className="py-1 px-2.5 bg-[#F2EDE4] text-[#18181B] rounded-lg text-[10px] font-bold"
                      >
                        Ver Look
                      </button>
                      <button
                        onClick={() => removeScheduledOutfit(entry.id)}
                        className="text-[#78756E] hover:text-[#B82828] p-1"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={onNavigateToCreate}
                      className="py-1.5 px-3 bg-[#18181B] text-white rounded-xl text-[10px] font-bold active:scale-95 transition-all"
                    >
                      + Planejar
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
