'use client';

import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Heart,
  Trash2,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  Tag,
  Palette,
  Calendar,
} from 'lucide-react';
import { ClothingItem, Outfit } from '@/types/wardrobe';
import { OutfitGenerator } from '@/lib/ai/OutfitGenerator';
import { useWardrobe } from '@/context/WardrobeContext';

interface ItemDetailModalProps {
  item: ClothingItem | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenOutfitResults: (outfits: Outfit[]) => void;
}

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({
  item,
  isOpen,
  onClose,
  onOpenOutfitResults,
}) => {
  const { wardrobe, toggleItemFavorite, deleteItem, incrementWearCount } = useWardrobe();
  const [activeTab, setActiveTab] = useState<'info' | 'pairings'>('info');

  if (!isOpen || !item) return null;

  const isDress = item.category === 'dresses';
  const pairings = OutfitGenerator.findPairingsForPiece(item, wardrobe);

  // Generate complete looks starting with this piece
  const handleGenerateLooksWithThisPiece = () => {
    const looks = OutfitGenerator.generateOutfits(wardrobe, {
      occasion: item.occasions[0] || 'casual',
      anchorItemId: item.id,
      surpriseMe: true,
    });
    onOpenOutfitResults(looks);
    onClose();
  };

  // Special Dress Transformations
  const handleDressTransformations = () => {
    const looks = OutfitGenerator.generateDressTransformations(item, wardrobe);
    onOpenOutfitResults(looks);
    onClose();
  };

  const handleDelete = () => {
    if (confirm(`Tem certeza que deseja remover "${item.name}" do seu armário?`)) {
      deleteItem(item.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#FBF9F5] rounded-t-3xl sm:rounded-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-[#EAE5DC]">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#EAE5DC] bg-white/70">
          <button
            onClick={() => toggleItemFavorite(item.id)}
            className="w-8 h-8 rounded-full bg-[#F2EDE4] text-[#111110] flex items-center justify-center active:scale-90"
          >
            <Heart
              size={17}
              className={item.isFavorite ? 'fill-[#B82828] text-[#B82828]' : 'text-[#6E6B65]'}
            />
          </button>

          <span className="text-xs font-semibold uppercase tracking-wider text-[#78756E]">
            {item.subCategory}
          </span>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F2EDE4] text-[#6E6B65] flex items-center justify-center active:scale-90"
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 overflow-y-auto flex-1 no-scrollbar space-y-5">
          {/* Garment Image Showcase */}
          <div className="relative aspect-square max-h-64 mx-auto rounded-2xl overflow-hidden border border-[#EAE5DC] bg-white shadow-sm flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.imageUrl}
              alt={item.name}
              className="w-full h-full object-contain p-3"
            />
            {/* Formality Tag */}
            <div className="absolute bottom-3 left-3 bg-[#111110]/80 text-[#E5C799] backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wide flex items-center gap-1">
              <span>Nível {item.formality}</span>
              <span className="text-white/60">•</span>
              <span className="capitalize">{item.style}</span>
            </div>
          </div>

          {/* Title and Wears */}
          <div className="space-y-1">
            <h2 className="font-serif text-xl font-bold text-[#111110]">{item.name}</h2>
            <div className="flex items-center gap-3 text-xs text-[#78756E]">
              <span className="flex items-center gap-1">
                <Palette size={13} style={{ color: item.color.hex }} />
                <span>{item.color.name}</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <TrendingUp size={13} />
                <span>Usado {item.wearCount} {item.wearCount === 1 ? 'vez' : 'vezes'}</span>
              </span>
            </div>
          </div>

          {/* KEY ACTION 1: Specialized Dress or Anchor Generator */}
          {isDress ? (
            <div className="bg-gradient-to-br from-[#242424] to-[#121212] p-4 rounded-2xl text-white shadow-md space-y-3">
              <div className="flex items-center gap-2 text-[#E5C799] font-medium text-xs">
                <Sparkles size={16} />
                <span>Especial para Vestidos</span>
              </div>
              <h3 className="font-serif text-base font-bold leading-snug">
                Como posso usar esse vestido?
              </h3>
              <p className="text-xs text-white/70">
                Explore transformações versáteis: do tênis casual diurno ao salto sofisticado para a noite.
              </p>
              <button
                onClick={handleDressTransformations}
                className="w-full py-2.5 bg-[#C29F68] text-white hover:bg-[#AF8B54] active:scale-95 transition-all rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-sm"
              >
                <span>Ver 3 Formas de Usar</span>
                <ArrowRight size={14} />
              </button>
            </div>
          ) : (
            <div className="bg-[#18181B] p-4 rounded-2xl text-white shadow-md space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#E5C799] font-medium text-xs">
                  <Sparkles size={15} />
                  <span>Stylist Inteligente</span>
                </div>
                <span className="text-[10px] text-white/50 uppercase tracking-widest">
                  {pairings.length} Peças Compatíveis
                </span>
              </div>
              <h3 className="font-serif text-base font-bold leading-snug">
                O que combina com essa peça?
              </h3>
              <p className="text-xs text-white/70">
                Monte composições completas partindo desta peça como elemento principal.
              </p>
              <button
                onClick={handleGenerateLooksWithThisPiece}
                className="w-full py-2.5 bg-white text-[#18181B] hover:bg-[#F2EDE4] active:scale-95 transition-all rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm"
              >
                <span>Montar Looks com essa Peça</span>
                <ArrowRight size={14} />
              </button>
            </div>
          )}

          {/* Quick Match Visual Preview ("Peças que combinam no seu armário") */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#4A4843] flex items-center justify-between">
              <span>Peças Compatíveis do Armário</span>
              <span className="text-[10px] font-normal text-[#78756E]">
                {pairings.length} encontradas
              </span>
            </h4>
            {pairings.length > 0 ? (
              <div className="flex gap-2.5 overflow-x-auto no-scrollbar pb-1">
                {pairings.slice(0, 6).map((match) => (
                  <div
                    key={match.id}
                    className="w-20 shrink-0 bg-white rounded-xl border border-[#EAE5DC] p-2 flex flex-col items-center text-center shadow-xs"
                  >
                    <div className="w-14 h-14 relative mb-1">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={match.imageUrl}
                        alt={match.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <span className="text-[10px] font-medium text-[#111110] line-clamp-1 w-full">
                      {match.name}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#78756E] italic bg-white p-3 rounded-xl border border-[#EAE5DC]">
                Adicione mais roupas para desbloquear novas combinações com esta peça.
              </p>
            )}
          </div>

          {/* Details & Specifications */}
          <div className="bg-white p-4 rounded-2xl border border-[#EAE5DC] space-y-3 text-xs">
            <div className="flex justify-between items-center py-1 border-b border-[#F2EDE4]">
              <span className="text-[#78756E]">Material / Tecido</span>
              <span className="font-medium text-[#111110]">{item.material || 'Não informado'}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-[#F2EDE4]">
              <span className="text-[#78756E]">Estilo Principal</span>
              <span className="font-medium text-[#111110] capitalize">{item.style}</span>
            </div>
            <div className="py-1">
              <span className="text-[#78756E] block mb-1.5">Ocasiões Perfeitas</span>
              <div className="flex flex-wrap gap-1">
                {item.occasions.map((occ) => (
                  <span
                    key={occ}
                    className="px-2 py-0.5 bg-[#F2EDE4] text-[#4A4843] rounded-md text-[10px] font-medium capitalize"
                  >
                    {occ}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="p-4 border-t border-[#EAE5DC] bg-white/90 flex items-center justify-between gap-3">
          <button
            onClick={() => incrementWearCount(item.id)}
            className="flex items-center gap-1.5 py-2.5 px-3.5 bg-[#F2EDE4] hover:bg-[#EAE3D6] text-[#4A4843] rounded-xl text-xs font-semibold transition-colors active:scale-95"
          >
            <CheckCircle2 size={15} className="text-[#C29F68]" />
            <span>+1 Usei Hoje</span>
          </button>

          <button
            onClick={handleDelete}
            className="flex items-center gap-1 text-xs text-[#9B2C2C] hover:text-[#741F1F] p-2 transition-colors"
          >
            <Trash2 size={15} />
            <span>Excluir peça</span>
          </button>
        </div>
      </div>
    </div>
  );
};
