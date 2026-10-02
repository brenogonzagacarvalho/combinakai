'use client';

import React, { useState, useEffect } from 'react';
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
  Edit3,
  Check,
  Layers,
} from 'lucide-react';
import {
  ClothingCategory,
  ClothingItem,
  ClothingOccasion,
  ClothingStyle,
  Outfit,
} from '@/types/wardrobe';
import { OutfitGenerator } from '@/lib/ai/OutfitGenerator';
import { useWardrobe } from '@/context/WardrobeContext';

interface ItemDetailModalProps {
  item: ClothingItem | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenOutfitResults: (outfits: Outfit[]) => void;
}

const CATEGORIES: Array<{ id: ClothingCategory; label: string; icon: string }> = [
  { id: 'tops', label: 'Tops / Camisas', icon: '👕' },
  { id: 'bottoms', label: 'Calças / Shorts', icon: '👖' },
  { id: 'outerwear', label: 'Casacos / Jaquetas', icon: '🧥' },
  { id: 'dresses', label: 'Vestidos', icon: '👗' },
  { id: 'shoes', label: 'Calçados', icon: '👟' },
  { id: 'accessories', label: 'Acessórios / Bolsas', icon: '👜' },
];

const QUICK_TYPES_BY_CATEGORY: Record<ClothingCategory, string[]> = {
  bottoms: ['Short Jeans', 'Short Alfaiataria', 'Calça Jeans', 'Calça Alfaiataria', 'Calça Chino', 'Bermuda', 'Saia'],
  outerwear: ['Jaqueta de Couro', 'Jaqueta Jeans', 'Blazer', 'Casaco', 'Casaquinho', 'Corta-vento', 'Sobretudo'],
  tops: ['Camiseta Básica', 'Camisa Social', 'Camisa de Linho', 'Camisa Manga Longa', 'Cropped', 'Regata', 'Blusa'],
  dresses: ['Vestido Midi', 'Vestido Curto', 'Vestido Longo', 'Vestido Fluido', 'Macacão'],
  shoes: ['Tênis Casual', 'Tênis Branco', 'Salto Bloco', 'Salto Fino', 'Bota', 'Sandália', 'Mocassim'],
  accessories: ['Bolsa Tiracolo', 'Bolsa de Ombro', 'Cinto de Couro', 'Óculos de Sol', 'Relógio', 'Colar'],
};

const STYLES: ClothingStyle[] = [
  'minimalista',
  'casual',
  'elegante',
  'social',
  'streetwear',
  'romantico',
  'confortavel',
  'moderno',
];

const OCCASIONS: Array<{ id: ClothingOccasion; label: string; icon: string }> = [
  { id: 'trabalho', label: 'Trabalho', icon: '💼' },
  { id: 'jantar', label: 'Jantar', icon: '🍽️' },
  { id: 'encontro', label: 'Encontro', icon: '❤️' },
  { id: 'festa', label: 'Festa', icon: '🎉' },
  { id: 'casual', label: 'Dia Casual', icon: '☀️' },
  { id: 'noite', label: 'Noite', icon: '🌙' },
  { id: 'praia', label: 'Praia', icon: '🏖️' },
  { id: 'viagem', label: 'Viagem', icon: '✈️' },
];

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({
  item,
  isOpen,
  onClose,
  onOpenOutfitResults,
}) => {
  const { wardrobe, toggleItemFavorite, deleteItem, incrementWearCount, updateItem } = useWardrobe();

  // Edit Mode States
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editSubCategory, setEditSubCategory] = useState('');
  const [editCategory, setEditCategory] = useState<ClothingCategory>('tops');
  const [editColorName, setEditColorName] = useState('');
  const [editStyle, setEditStyle] = useState<ClothingStyle>('casual');
  const [editFormality, setEditFormality] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [editOccasions, setEditOccasions] = useState<ClothingOccasion[]>([]);
  const [editMaterial, setEditMaterial] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync edit state when item changes
  useEffect(() => {
    if (item) {
      setEditName(item.name);
      setEditSubCategory(item.subCategory);
      setEditCategory(item.category);
      setEditColorName(item.color.name);
      setEditStyle(item.style);
      setEditFormality(item.formality);
      setEditOccasions(item.occasions || ['casual']);
      setEditMaterial(item.material || '');
      setIsEditing(false);
    }
  }, [item]);

  if (!isOpen || !item) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleSaveEdit = () => {
    const finalSub = editSubCategory.trim() || editName.trim() || 'Peça';
    const finalName = editName.trim() || finalSub;

    updateItem(item.id, {
      name: finalName,
      subCategory: finalSub,
      category: editCategory,
      style: editStyle,
      formality: editFormality,
      occasions: editOccasions.length > 0 ? editOccasions : ['casual'],
      material: editMaterial,
      color: {
        ...item.color,
        name: editColorName.trim() || item.color.name,
      },
    });

    setIsEditing(false);
    showToast('Peça alterada com sucesso! ✨');
  };

  const isDress = item.category === 'dresses';
  const pairings = OutfitGenerator.findPairingsForPiece(item, wardrobe);

  const handleGenerateLooksWithThisPiece = () => {
    const looks = OutfitGenerator.generateOutfits(wardrobe, {
      occasion: item.occasions[0] || 'casual',
      anchorItemId: item.id,
      surpriseMe: true,
    });
    onOpenOutfitResults(looks);
    onClose();
  };

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

  const toggleOccasion = (occ: ClothingOccasion) => {
    if (editOccasions.includes(occ)) {
      if (editOccasions.length > 1) {
        setEditOccasions(editOccasions.filter((o) => o !== occ));
      }
    } else {
      setEditOccasions([...editOccasions, occ]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#FBF9F5] rounded-t-3xl sm:rounded-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-[#EAE5DC] relative">
        {/* Toast */}
        {toastMessage && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 bg-[#18181B] text-[#FBF9F5] text-xs font-semibold px-4 py-2 rounded-full shadow-lg border border-[#C29F68]/30 animate-in fade-in">
            {toastMessage}
          </div>
        )}

        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#EAE5DC] bg-white/80 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleItemFavorite(item.id)}
              className="w-8 h-8 rounded-full bg-[#F2EDE4] text-[#111110] flex items-center justify-center active:scale-90"
              title="Favoritar"
            >
              <Heart
                size={16}
                className={item.isFavorite ? 'fill-[#B82828] text-[#B82828]' : 'text-[#6E6B65]'}
              />
            </button>

            {/* Quick Edit Toggle Button in Header */}
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`flex items-center gap-1.5 py-1.5 px-3 rounded-full text-xs font-bold transition-all active:scale-95 shadow-xs ${
                isEditing
                  ? 'bg-[#C29F68] text-white'
                  : 'bg-[#18181B] text-[#FBF9F5] hover:bg-[#2A2A2E]'
              }`}
            >
              <Edit3 size={13} className={isEditing ? 'text-white' : 'text-[#E5C799]'} />
              <span>{isEditing ? 'Cancelar Edição' : 'Editar Peça'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#78756E] max-w-[130px] truncate">
              {item.subCategory || item.category}
            </span>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#F2EDE4] text-[#6E6B65] flex items-center justify-center active:scale-90"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 overflow-y-auto flex-1 no-scrollbar space-y-5">
          {/* ======================================================== */}
          {/* 1. EDIT MODE FORM */}
          {/* ======================================================== */}
          {isEditing ? (
            <div className="space-y-4 animate-in fade-in">
              <div className="bg-[#18181B] text-white p-3 rounded-2xl flex items-center gap-2 text-xs font-medium">
                <Edit3 size={15} className="text-[#E5C799]" />
                <span>Edite o nome e o tipo para corrigir a peça</span>
              </div>

              {/* Garment Name Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#4A4843] uppercase tracking-wider block">
                  Nome da Peça (Exibido no Armário)
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Ex: Short jeans 2000's, Jaqueta de Couro..."
                  className="w-full px-3.5 py-2.5 bg-white border border-[#DDD7CC] rounded-xl text-sm font-bold text-[#111110] focus:outline-none focus:ring-2 focus:ring-[#C29F68]"
                />
              </div>

              {/* Category Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#4A4843] uppercase tracking-wider flex items-center gap-1">
                  <Layers size={13} />
                  <span>Categoria Principal</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setEditCategory(cat.id);
                        // Suggest first subcategory of new category
                        const defaults = QUICK_TYPES_BY_CATEGORY[cat.id];
                        if (defaults && defaults.length > 0) {
                          setEditSubCategory(defaults[0]);
                        }
                      }}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-medium text-left transition-all ${
                        editCategory === cat.id
                          ? 'bg-[#18181B] text-white border-[#18181B] shadow-sm'
                          : 'bg-white text-[#4A4843] border-[#E5E0D6] hover:bg-[#F9F7F3]'
                      }`}
                    >
                      <span className="text-base">{cat.icon}</span>
                      <span className="truncate">{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* SubCategory / Tipo Exato */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#4A4843] uppercase tracking-wider block">
                  Tipo da Peça (Subcategoria)
                </label>
                <input
                  type="text"
                  value={editSubCategory}
                  onChange={(e) => setEditSubCategory(e.target.value)}
                  placeholder="Ex: Short Jeans, Jaqueta, Camisa..."
                  className="w-full px-3.5 py-2.5 bg-white border border-[#DDD7CC] rounded-xl text-xs font-semibold text-[#111110] focus:outline-none focus:ring-2 focus:ring-[#C29F68]"
                />

                {/* Quick Suggestion Chips */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {QUICK_TYPES_BY_CATEGORY[editCategory]?.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setEditSubCategory(t)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all ${
                        editSubCategory === t
                          ? 'bg-[#C29F68] text-white'
                          : 'bg-white border border-[#EAE5DC] text-[#68655E] hover:bg-[#F2EDE4]'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#4A4843] uppercase tracking-wider flex items-center gap-1">
                  <Palette size={13} />
                  <span>Nome da Cor</span>
                </label>
                <div className="flex items-center gap-2 bg-white border border-[#DDD7CC] rounded-xl p-2">
                  <div
                    className="w-5 h-5 rounded-full border border-black/10 shrink-0"
                    style={{ backgroundColor: item.color.hex }}
                  />
                  <input
                    type="text"
                    value={editColorName}
                    onChange={(e) => setEditColorName(e.target.value)}
                    placeholder="Ex: Azul Escuro, Caramelo, Branco..."
                    className="w-full text-xs font-medium bg-transparent focus:outline-none"
                  />
                </div>
              </div>

              {/* Style Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#4A4843] uppercase tracking-wider block">
                  Estilo
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {STYLES.map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setEditStyle(st)}
                      className={`px-3 py-1 rounded-full text-xs font-medium capitalize transition-all ${
                        editStyle === st
                          ? 'bg-[#18181B] text-white'
                          : 'bg-white border border-[#E0DACE] text-[#68655E]'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Formality Level */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold text-[#4A4843]">
                  <span className="uppercase tracking-wider">Formalidade</span>
                  <span className="text-[#C29F68]">
                    {editFormality === 1 && 'Super Casual (1)'}
                    {editFormality === 2 && 'Casual Urbano (2)'}
                    {editFormality === 3 && 'Casual Elegante (3)'}
                    {editFormality === 4 && 'Social / Formal (4)'}
                    {editFormality === 5 && 'Festa / Gala (5)'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setEditFormality(lvl as any)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        editFormality >= lvl
                          ? 'bg-[#C29F68] text-white'
                          : 'bg-[#EAE5DC] text-[#78756E]'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              {/* Occasions Multi-select */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#4A4843] uppercase tracking-wider block">
                  Ocasiões
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {OCCASIONS.map((occ) => {
                    const isSelected = editOccasions.includes(occ.id);
                    return (
                      <button
                        key={occ.id}
                        type="button"
                        onClick={() => toggleOccasion(occ.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                          isSelected
                            ? 'bg-[#18181B] text-white'
                            : 'bg-white border border-[#E0DACE] text-[#68655E]'
                        }`}
                      >
                        <span>{occ.icon}</span>
                        <span>{occ.label}</span>
                        {isSelected && <Check size={12} className="text-[#E5C799]" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Save Button for Edit Mode */}
              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 py-3 text-xs font-semibold text-[#78756E] hover:text-[#111110]"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  className="flex-[2] py-3 px-4 bg-[#18181B] text-[#FBF9F5] rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all"
                >
                  <Check size={16} className="text-[#E5C799]" />
                  <span>Salvar Alterações</span>
                </button>
              </div>
            </div>
          ) : (
            /* ======================================================== */
            /* 2. NORMAL VIEW MODE */
            /* ======================================================== */
            <>
              {/* Garment Image Showcase */}
              <div className="relative aspect-square max-h-64 mx-auto rounded-2xl overflow-hidden border border-[#EAE5DC] bg-white shadow-sm flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-full object-contain p-3"
                />
                {/* Formality & Style Tag */}
                <div className="absolute bottom-3 left-3 bg-[#111110]/80 text-[#E5C799] backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wide flex items-center gap-1">
                  <span>Nível {item.formality}</span>
                  <span className="text-white/60">•</span>
                  <span className="capitalize">{item.style}</span>
                </div>

                {/* Edit Button overlay */}
                <button
                  onClick={() => setIsEditing(true)}
                  className="absolute top-3 right-3 bg-white/90 backdrop-blur-md text-[#111110] px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 shadow-sm active:scale-95"
                >
                  <Edit3 size={11} />
                  <span>Editar</span>
                </button>
              </div>

              {/* Title, Subcategory and Wears */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-[#C29F68] uppercase tracking-wider">
                  {item.subCategory || item.category}
                </span>
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
                  <span className="text-[#78756E]">Tipo / Categoria</span>
                  <span className="font-bold text-[#111110]">{item.subCategory || item.category}</span>
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
            </>
          )}
        </div>

        {/* Modal Bottom Actions (when not editing) */}
        {!isEditing && (
          <div className="p-4 border-t border-[#EAE5DC] bg-white/90 flex items-center justify-between gap-3">
            <button
              onClick={() => incrementWearCount(item.id)}
              className="flex items-center gap-1.5 py-2.5 px-3.5 bg-[#F2EDE4] hover:bg-[#EAE3D6] text-[#4A4843] rounded-xl text-xs font-semibold transition-colors active:scale-95"
            >
              <CheckCircle2 size={15} className="text-[#C29F68]" />
              <span>+1 Usei Hoje</span>
            </button>

            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1 text-xs font-bold text-[#111110] bg-[#FAF8F5] hover:bg-[#F2EDE4] border border-[#DDD7CC] py-2 px-3 rounded-xl active:scale-95 transition-all"
            >
              <Edit3 size={13} className="text-[#C29F68]" />
              <span>Editar</span>
            </button>

            <button
              onClick={handleDelete}
              className="flex items-center gap-1 text-xs text-[#9B2C2C] hover:text-[#741F1F] p-2 transition-colors"
            >
              <Trash2 size={15} />
              <span>Excluir</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
