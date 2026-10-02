export type ClothingCategory =
  | 'tops'
  | 'bottoms'
  | 'dresses'
  | 'outerwear'
  | 'shoes'
  | 'accessories';

export type ClothingPattern =
  | 'liso'
  | 'listrado'
  | 'estampado'
  | 'xadrez'
  | 'floral'
  | 'poa';

export type ClothingStyle =
  | 'minimalista'
  | 'casual'
  | 'elegante'
  | 'social'
  | 'streetwear'
  | 'romantico'
  | 'confortavel'
  | 'moderno';

export type ClothingOccasion =
  | 'trabalho'
  | 'jantar'
  | 'encontro'
  | 'festa'
  | 'casual'
  | 'passeio'
  | 'praia'
  | 'noite'
  | 'esporte'
  | 'viagem'
  | 'evento';

export type ClothingSeason = 'verao' | 'inverno' | 'meia-estacao' | 'todas';

export interface ColorInfo {
  name: string;
  hex: string;
  family: 'branco' | 'preto' | 'cinza' | 'azul' | 'bege' | 'marrom' | 'verde' | 'vermelho' | 'amarelo' | 'rosa' | 'roxo' | 'laranja';
}

export interface ClothingItem {
  id: string;
  name: string;
  category: ClothingCategory;
  subCategory: string; // e.g. "Camisa Social", "Camiseta Básica", "Calça Jeans", "Blazer", "Tênis", "Vestido Midi"
  imageUrl: string;
  originalImageUrl?: string;
  color: ColorInfo;
  secondaryColor?: ColorInfo;
  pattern: ClothingPattern;
  material?: string;
  style: ClothingStyle;
  occasions: ClothingOccasion[];
  seasons: ClothingSeason[];
  formality: 1 | 2 | 3 | 4 | 5; // 1: super casual, 3: smart casual, 5: black tie/formal
  wearCount: number;
  lastWorn?: string;
  isFavorite?: boolean;
  createdAt: string;
}

export interface Outfit {
  id: string;
  title: string;
  style: ClothingStyle;
  occasion: ClothingOccasion;
  weather?: string;
  items: ClothingItem[];
  whyItWorks: string;
  stylistTip?: string;
  score: number; // 85-99%
  isFavorite?: boolean;
  userFeedback?: 'like' | 'dislike' | null;
  scheduledFor?: string; // e.g. "Segunda-feira", "2026-10-05"
  createdAt: string;
}

export interface CalendarEntry {
  id: string;
  dayLabel: string; // "Segunda", "Terça", etc.
  dateString?: string;
  occasion: ClothingOccasion;
  outfit: Outfit;
}

export interface FilterOptions {
  category?: ClothingCategory | 'all';
  colorFamily?: string;
  style?: ClothingStyle | 'all';
  occasion?: ClothingOccasion | 'all';
  searchQuery?: string;
}

export interface OutfitRequest {
  occasion: ClothingOccasion;
  style?: ClothingStyle | 'surprise';
  weather?: 'quente' | 'frio' | 'ameno' | 'chuvoso';
  anchorItemId?: string; // A specific piece the user must wear
  surpriseMe?: boolean;
}
