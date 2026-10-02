'use client';

import React, { useState, useMemo } from 'react';
import {
  Camera,
  Search,
  Filter,
  Layers,
  Heart,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { ClothingCategory, ClothingItem, ClothingOccasion, ClothingStyle } from '@/types/wardrobe';
import { useWardrobe } from '@/context/WardrobeContext';

interface WardrobeTabProps {
  onSelectItem: (item: ClothingItem) => void;
  onOpenAddModal: () => void;
}

const CATEGORY_TABS: Array<{ id: ClothingCategory | 'all'; label: string; icon: string }> = [
  { id: 'all', label: 'Todos', icon: '✨' },
  { id: 'tops', label: 'Tops / Camisas', icon: '👕' },
  { id: 'bottoms', label: 'Calças / Shorts', icon: '👖' },
  { id: 'outerwear', label: 'Casacos / Jaquetas', icon: '🧥' },
  { id: 'dresses', label: 'Vestidos', icon: '👗' },
  { id: 'shoes', label: 'Calçados', icon: '👟' },
  { id: 'accessories', label: 'Acessórios', icon: '👜' },
];

const COLOR_FILTERS = [
  { id: 'all', label: 'Todas as Cores', hex: '' },
  { id: 'branco', label: 'Branco', hex: '#FFFFFF' },
  { id: 'preto', label: 'Preto', hex: '#1C1C1E' },
  { id: 'azul', label: 'Azul', hex: '#3B6B9B' },
  { id: 'bege', label: 'Bege', hex: '#D1BFA7' },
  { id: 'vermelho', label: 'Vermelho', hex: '#B82828' },
  { id: 'marrom', label: 'Marrom', hex: '#8B5A2B' },
];

export const WardrobeTab: React.FC<WardrobeTabProps> = ({
  onSelectItem,
  onOpenAddModal,
}) => {
  const { wardrobe, toggleItemFavorite } = useWardrobe();

  const [selectedCategory, setSelectedCategory] = useState<ClothingCategory | 'all'>('all');
  const [selectedColor, setSelectedColor] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [onlyFavorites, setOnlyFavorites] = useState(false);

  // Filtered Items Memo
  const filteredItems = useMemo(() => {
    return wardrobe.filter((item) => {
      // Category filter
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }
      // Color family filter
      if (selectedColor !== 'all' && item.color.family !== selectedColor) {
        return false;
      }
      // Favorites filter
      if (onlyFavorites && !item.isFavorite) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(query);
        const matchesSub = item.subCategory.toLowerCase().includes(query);
        const matchesColor = item.color.name.toLowerCase().includes(query);
        const matchesOccasion = item.occasions.some((occ) => occ.toLowerCase().includes(query));
        if (!matchesName && !matchesSub && !matchesColor && !matchesOccasion) {
          return false;
        }
      }
      return true;
    });
  }, [wardrobe, selectedCategory, selectedColor, onlyFavorites, searchQuery]);

  return (
    <div className="space-y-4 pb-28 pt-2 px-4 animate-in fade-in duration-200">
      {/* Title & Add Action */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h1 className="font-serif text-2xl font-bold tracking-tight text-[#111110]">
            Meu Guarda-Roupa
          </h1>
          <p className="text-xs text-[#78756E] mt-0.5">
            {filteredItems.length} {filteredItems.length === 1 ? 'peça catalogada' : 'peças catalogadas'}
          </p>
        </div>

        <button
          onClick={onOpenAddModal}
          className="flex items-center gap-1.5 py-2 px-3.5 bg-[#18181B] text-[#FBF9F5] rounded-full text-xs font-semibold shadow-sm active:scale-95 transition-all hover:bg-[#2A2A2E]"
        >
          <Camera size={14} className="text-[#E5C799]" />
          <span>+ Adicionar</span>
        </button>
      </div>

      {/* Search Input & Quick Filter Button */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#78756E]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por cor, tipo ou ocasião..."
            className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-[#DDD7CC] rounded-2xl text-xs font-medium text-[#111110] focus:outline-none focus:ring-2 focus:ring-[#C29F68]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#78756E]"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <button
          onClick={() => setOnlyFavorites(!onlyFavorites)}
          title="Filtrar Favoritos"
          className={`p-2.5 rounded-2xl border transition-all active:scale-95 ${
            onlyFavorites
              ? 'bg-[#18181B] text-[#B82828] border-[#18181B]'
              : 'bg-white text-[#78756E] border-[#DDD7CC]'
          }`}
        >
          <Heart size={16} className={onlyFavorites ? 'fill-[#B82828]' : ''} />
        </button>
      </div>

      {/* Category Pills (Horizontal Scroll) */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 pb-1">
        {CATEGORY_TABS.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          const count =
            cat.id === 'all'
              ? wardrobe.length
              : wardrobe.filter((i) => i.category === cat.id).length;

          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-medium whitespace-nowrap transition-all active:scale-95 ${
                isSelected
                  ? 'bg-[#18181B] text-white shadow-sm'
                  : 'bg-white border border-[#EAE5DC] text-[#4A4843] hover:bg-[#F9F7F3]'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-[#F2EDE4] text-[#78756E]'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Color Filter Dots */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        <span className="text-[10px] uppercase tracking-wider text-[#78756E] font-bold shrink-0">
          Cores:
        </span>
        {COLOR_FILTERS.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedColor(c.id)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${
              selectedColor === c.id
                ? 'bg-[#18181B] text-white'
                : 'bg-white border border-[#EAE5DC] text-[#68655E]'
            }`}
          >
            {c.hex && (
              <span
                className="w-2.5 h-2.5 rounded-full border border-black/10 inline-block"
                style={{ backgroundColor: c.hex }}
              />
            )}
            <span>{c.label}</span>
          </button>
        ))}
      </div>

      {/* Visual Wardrobe Catalog Grid (2 columns on mobile) */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 pt-1">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectItem(item)}
              className="group bg-white rounded-3xl border border-[#EAE5DC] p-3 flex flex-col justify-between shadow-xs hover:shadow-md transition-all cursor-pointer active:scale-[0.98]"
            >
              {/* Garment Image */}
              <div className="relative w-full aspect-square flex items-center justify-center mb-2 overflow-hidden rounded-2xl bg-[#FAF8F5]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                />

                {/* Favorite Heart Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleItemFavorite(item.id);
                  }}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center text-[#78756E] hover:text-[#B82828] active:scale-90 transition-all shadow-xs"
                >
                  <Heart
                    size={14}
                    className={item.isFavorite ? 'fill-[#B82828] text-[#B82828]' : ''}
                  />
                </button>

                {/* Formality Tag */}
                <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-xs text-white text-[9px] font-semibold px-2 py-0.5 rounded-md">
                  Nível {item.formality}
                </div>
              </div>

              {/* Title & Metadata */}
              <div className="space-y-0.5">
                <span className="text-[10px] text-[#C29F68] font-bold uppercase tracking-wider block truncate">
                  {item.subCategory || item.category}
                </span>
                <h3 className="font-serif text-xs font-bold text-[#111110] line-clamp-1">
                  {item.name}
                </h3>
                <div className="flex items-center gap-1.5 pt-1">
                  <span
                    className="w-2.5 h-2.5 rounded-full border border-black/10 shrink-0"
                    style={{ backgroundColor: item.color.hex }}
                  />
                  <span className="text-[10px] text-[#78756E] truncate">
                    {item.color.name}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center space-y-3 bg-white rounded-3xl border border-[#EAE5DC] p-6">
          <div className="w-12 h-12 rounded-full bg-[#F2EDE4] text-[#78756E] flex items-center justify-center mx-auto">
            <Search size={22} />
          </div>
          <div>
            <h3 className="font-serif font-bold text-base text-[#111110]">
              Nenhuma peça encontrada
            </h3>
            <p className="text-xs text-[#78756E] mt-1">
              Tente ajustar os filtros ou adicione uma nova roupa com a câmera.
            </p>
          </div>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSelectedColor('all');
              setSearchQuery('');
              setOnlyFavorites(false);
            }}
            className="text-xs font-semibold text-[#18181B] underline"
          >
            Limpar todos os filtros
          </button>
        </div>
      )}
    </div>
  );
};
