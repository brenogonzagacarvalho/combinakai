'use client';

import React from 'react';
import {
  Sparkles,
  Camera,
  ArrowRight,
  TrendingDown,
  RefreshCw,
  Heart,
  Share2,
  Calendar,
  Layers,
  Dices,
} from 'lucide-react';
import { ClothingItem, Outfit } from '@/types/wardrobe';
import { useWardrobe } from '@/context/WardrobeContext';
import { WardrobeAnalyzer } from '@/lib/ai/WardrobeAnalyzer';
import { OutfitRecommendationService } from '@/lib/ai/OutfitRecommendationService';
import { OutfitGenerator } from '@/lib/ai/OutfitGenerator';
import confetti from 'canvas-confetti';

interface HomeTabProps {
  onOpenCreateModal: () => void;
  onOpenAddModal: () => void;
  onSelectItem: (item: ClothingItem) => void;
  onOpenOutfitResults: (outfits: Outfit[]) => void;
  onNavigateToWardrobe: () => void;
}

export const HomeTab: React.FC<HomeTabProps> = ({
  onOpenCreateModal,
  onOpenAddModal,
  onSelectItem,
  onOpenOutfitResults,
  onNavigateToWardrobe,
}) => {
  const { wardrobe, saveOutfit, loadDemoWardrobe, isDemoActive } = useWardrobe();

  // Dynamic greeting based on time of day
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bom dia 👋' : hour < 18 ? 'Boa tarde 👋' : 'Boa noite 👋';

  // Wardrobe Analytics
  const stats = WardrobeAnalyzer.analyze(wardrobe);

  // Daily Recommended Look
  const lookOfTheDay = OutfitRecommendationService.getLookOfTheDay(wardrobe);

  const handleRefreshLookOfDay = () => {
    if (wardrobe.length === 0) return;
    const freshOutfits = OutfitGenerator.generateOutfits(wardrobe, {
      occasion: 'casual',
      surpriseMe: true,
    });
    if (freshOutfits.length > 0) {
      onOpenOutfitResults(freshOutfits);
    }
  };

  const handleNeglectedItemLook = (item: ClothingItem) => {
    const looks = OutfitGenerator.generateOutfits(wardrobe, {
      occasion: item.occasions[0] || 'casual',
      anchorItemId: item.id,
      surpriseMe: true,
    });
    onOpenOutfitResults(looks);
  };

  const handleSaveLookOfDay = () => {
    if (lookOfTheDay) {
      saveOutfit(lookOfTheDay);
      try {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#C29F68', '#111110', '#EAE5DC'],
        });
      } catch {}
    }
  };

  return (
    <div className="space-y-6 pb-28 pt-2 px-4 animate-in fade-in duration-200">
      {/* 1. HERO SECTION */}
      <section className="space-y-3 pt-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-[#78756E]">
          {greeting}
        </span>
        <h1 className="font-serif text-3xl font-bold tracking-tight text-[#111110] leading-tight">
          O que você vai vestir hoje?
        </h1>
        <p className="text-xs text-[#68655E] leading-relaxed max-w-sm">
          Fotografe suas roupas e deixe seu guarda-roupa montar os looks para você.
        </p>

        {/* PRIMARY HERO CTA BUTTON */}
        <div className="pt-2">
          <button
            onClick={onOpenCreateModal}
            className="w-full py-4 px-5 bg-gradient-to-r from-[#202022] via-[#141416] to-[#0A0A0C] text-[#FBF9F5] rounded-2xl font-bold text-sm flex items-center justify-between shadow-xl shadow-black/15 active:scale-[0.98] transition-all group border border-white/10"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-[#E5C799] group-hover:rotate-12 transition-transform">
                <Sparkles size={20} />
              </div>
              <div className="text-left">
                <span className="block text-sm font-bold text-white">✨ Montar meu look</span>
                <span className="block text-[10px] text-white/60 font-normal">
                  Para trabalho, encontro, festa ou casual
                </span>
              </div>
            </div>
            <ArrowRight size={18} className="text-[#E5C799] group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* "NÃO SEI O QUE VESTIR" EMERGENCY ASSISTANT */}
        <button
          onClick={onOpenCreateModal}
          className="w-full py-2.5 px-3.5 bg-[#F2EDE4]/70 hover:bg-[#EAE3D6] text-[#4A4843] rounded-xl text-xs font-medium flex items-center justify-between transition-colors border border-[#E4DDD1]"
        >
          <div className="flex items-center gap-2">
            <Dices size={15} className="text-[#C29F68]" />
            <span>🤔 Não sei o que vestir hoje</span>
          </div>
          <span className="text-[10px] text-[#78756E] font-semibold underline">
            Decisão Rápida
          </span>
        </button>
      </section>

      {/* 2. DEMO BANNER IF ACTIVE */}
      {isDemoActive && (
        <div className="bg-amber-50/80 border border-amber-200/70 p-3 rounded-2xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-amber-900">
            <span className="text-base">✨</span>
            <span className="font-medium text-[11px]">
              Modo Demonstração: 14 peças pré-carregadas para você testar agora!
            </span>
          </div>
          <button
            onClick={onOpenAddModal}
            className="text-[10px] font-bold text-amber-950 underline shrink-0 ml-2"
          >
            + Minha foto
          </button>
        </div>
      )}

      {/* 3. LOOK DO DIA (FEATURED OUTFIT CARD) */}
      {lookOfTheDay && (
        <section className="space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-sm">☀️</span>
              <h2 className="font-serif font-bold text-base text-[#111110]">
                Seu Look de Hoje
              </h2>
            </div>
            <button
              onClick={handleRefreshLookOfDay}
              className="text-xs text-[#78756E] hover:text-[#111110] flex items-center gap-1 active:scale-95"
            >
              <RefreshCw size={12} />
              <span>Trocar</span>
            </button>
          </div>

          {/* Look of the Day Card */}
          <div className="bg-white rounded-3xl p-4 border border-[#EAE5DC] shadow-sm space-y-3.5">
            <div className="flex items-center justify-between">
              <div>
                <span className="px-2 py-0.5 bg-[#F2EDE4] text-[#4A4843] rounded-md text-[10px] font-bold uppercase tracking-wider">
                  {lookOfTheDay.style}
                </span>
                <h3 className="font-serif font-bold text-base text-[#111110] mt-1">
                  {lookOfTheDay.title}
                </h3>
              </div>
              <span className="text-xs font-bold text-[#C29F68]">
                {lookOfTheDay.score}% Harmonia
              </span>
            </div>

            {/* Collage Thumbnail preview */}
            <div className="grid grid-cols-3 gap-2 bg-[#FBF9F5] p-2.5 rounded-2xl border border-[#F0ECE3]">
              {lookOfTheDay.items.slice(0, 3).map((item) => (
                <div key={item.id} className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 relative mb-1">
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

            {/* Stylist Explanation */}
            <p className="text-xs text-[#4A4843] leading-relaxed italic border-l-2 border-[#C29F68] pl-2.5">
              "{lookOfTheDay.whyItWorks}"
            </p>

            {/* Actions for Look of Day */}
            <div className="flex items-center gap-2 pt-1 border-t border-[#F2EDE4]">
              <button
                onClick={handleSaveLookOfDay}
                className="flex-1 py-2 px-3 bg-[#18181B] text-[#FBF9F5] rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs active:scale-95 transition-all hover:bg-[#28282C]"
              >
                <Heart size={14} className="text-[#E5C799]" />
                <span>Gostei & Salvar</span>
              </button>
              <button
                onClick={() => onOpenOutfitResults([lookOfTheDay])}
                className="py-2 px-3 bg-[#F2EDE4] hover:bg-[#EAE3D6] text-[#4A4843] rounded-xl text-xs font-semibold active:scale-95 transition-colors"
              >
                Detalhes
              </button>
            </div>
          </div>
        </section>
      )}

      {/* 4. SEU GUARDA-ROUPA (HORIZONTAL MINI-CATALOG) */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="font-serif font-bold text-base text-[#111110]">
              Seu Guarda-Roupa
            </h2>
            <span className="text-xs font-bold text-[#78756E] bg-[#F2EDE4] px-2 py-0.5 rounded-full">
              {wardrobe.length} peças
            </span>
          </div>
          <button
            onClick={onNavigateToWardrobe}
            className="text-xs font-semibold text-[#111110] hover:underline flex items-center gap-0.5"
          >
            <span>Ver tudo</span>
            <ArrowRight size={13} />
          </button>
        </div>

        {/* Carousel of pieces */}
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 pt-1 -mx-4 px-4">
          {/* Add Piece Tile */}
          <button
            onClick={onOpenAddModal}
            className="w-28 shrink-0 aspect-[3/4] rounded-2xl border-2 border-dashed border-[#DDD7CC] hover:border-[#111110] bg-white/50 flex flex-col items-center justify-center text-center p-2 text-[#78756E] hover:text-[#111110] active:scale-95 transition-all group"
          >
            <div className="w-10 h-10 rounded-full bg-[#F2EDE4] group-hover:bg-[#18181B] group-hover:text-white flex items-center justify-center transition-colors mb-2">
              <Camera size={18} />
            </div>
            <span className="text-xs font-bold leading-tight">+ Adicionar Roupa</span>
          </button>

          {/* Wardrobe Items */}
          {wardrobe.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectItem(item)}
              className="w-28 shrink-0 aspect-[3/4] bg-white rounded-2xl border border-[#EAE5DC] p-2 flex flex-col items-center justify-between text-center shadow-xs cursor-pointer active:scale-95 transition-transform"
            >
              <div className="w-full h-24 relative flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="w-full">
                <span className="text-[10px] font-bold text-[#111110] line-clamp-1 w-full block">
                  {item.name}
                </span>
                <span className="text-[9px] text-[#78756E] capitalize block">
                  {item.subCategory}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. "VOCÊ QUASE NÃO USA ESSAS PEÇAS" (WARDROBE REVIVER) */}
      {stats.underutilizedItems.length > 0 && (
        <section className="space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <TrendingDown size={16} className="text-[#C29F68]" />
              <h2 className="font-serif font-bold text-base text-[#111110]">
                Você quase não usa essas peças
              </h2>
            </div>
          </div>

          <div className="bg-[#FAF8F5] border border-[#EAE5DC] p-4 rounded-3xl space-y-3">
            <p className="text-xs text-[#68655E]">
              Essas roupas estão paradas no armário. Quer descobrir novas combinações para aproveitá-las?
            </p>

            <div className="grid grid-cols-2 gap-2.5">
              {stats.underutilizedItems.slice(0, 2).map((item) => (
                <div
                  key={item.id}
                  className="bg-white p-3 rounded-2xl border border-[#EAE5DC] flex flex-col justify-between"
                >
                  <div className="w-full h-20 relative flex items-center justify-center mb-1">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-[#111110] line-clamp-1 block">
                      {item.name}
                    </span>
                    <span className="text-[9px] text-[#78756E] block mb-2">
                      Usado apenas {item.wearCount} {item.wearCount === 1 ? 'vez' : 'vezes'}
                    </span>
                    <button
                      onClick={() => handleNeglectedItemLook(item)}
                      className="w-full py-1.5 px-2 bg-[#18181B] text-white hover:bg-[#2C2C30] rounded-lg text-[10px] font-bold active:scale-95 transition-all"
                    >
                      Criar Looks
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
