'use client';

import React, { useState, useRef } from 'react';
import {
  X,
  Camera,
  Image as ImageIcon,
  Sparkles,
  Check,
  Loader2,
  RefreshCw,
  Palette,
  Layers,
} from 'lucide-react';
import { ClothingCategory, ClothingItem, ClothingOccasion, ClothingStyle } from '@/types/wardrobe';
import { processGarmentImage } from '@/lib/imageProcessor';
import { AIService } from '@/lib/ai/AIService';
import confetti from 'canvas-confetti';

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onItemAdded: (item: ClothingItem) => void;
}

const CATEGORIES: Array<{ id: ClothingCategory; label: string; icon: string }> = [
  { id: 'tops', label: 'Tops / Camisas', icon: '👕' },
  { id: 'bottoms', label: 'Calças / Shorts', icon: '👖' },
  { id: 'dresses', label: 'Vestidos', icon: '👗' },
  { id: 'outerwear', label: 'Casacos / Blazers', icon: '🧥' },
  { id: 'shoes', label: 'Calçados', icon: '👟' },
  { id: 'accessories', label: 'Acessórios / Bolsas', icon: '👜' },
];

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

export const AddItemModal: React.FC<AddItemModalProps> = ({
  isOpen,
  onClose,
  onItemAdded,
}) => {
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<'upload' | 'analyzing' | 'confirm'>('upload');
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);

  // Editable Form Data
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ClothingCategory>('tops');
  const [subCategory, setSubCategory] = useState('');
  const [colorName, setColorName] = useState('Azul Celeste');
  const [colorHex, setColorHex] = useState('#6EA0D6');
  const [colorFamily, setColorFamily] = useState<any>('azul');
  const [style, setStyle] = useState<ClothingStyle>('casual');
  const [formality, setFormality] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [occasions, setOccasions] = useState<ClothingOccasion[]>(['casual', 'jantar']);
  const [material, setMaterial] = useState('');

  if (!isOpen) return null;

  const resetState = () => {
    setStep('upload');
    setPhotoDataUrl(null);
    setName('');
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleFileSelected = async (file: File) => {
    setStep('analyzing');
    try {
      // 1. Process image on client canvas (studio treatment + color extraction)
      const processed = await processGarmentImage(file);
      setPhotoDataUrl(processed.dataUrl);

      // 2. Classify via AI Service
      const aiResult = await AIService.classifyGarment(processed.dataUrl, processed.dominantColor);

      // 3. Populate form with AI tags
      setName(aiResult.subCategory);
      setCategory(aiResult.category);
      setSubCategory(aiResult.subCategory);
      setColorName(aiResult.color.name);
      setColorHex(aiResult.color.hex);
      setColorFamily(aiResult.color.family);
      setStyle(aiResult.style);
      setFormality(aiResult.formality);
      setOccasions(aiResult.occasions);
      if (aiResult.material) setMaterial(aiResult.material);

      setStep('confirm');
    } catch (err) {
      console.error('Image processing failed:', err);
      // Fallback preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoDataUrl(e.target?.result as string);
        setName('Minha Peça');
        setStep('confirm');
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleOccasion = (occ: ClothingOccasion) => {
    if (occasions.includes(occ)) {
      if (occasions.length > 1) {
        setOccasions(occasions.filter((o) => o !== occ));
      }
    } else {
      setOccasions([...occasions, occ]);
    }
  };

  const handleSave = () => {
    if (!photoDataUrl) return;

    const newItem: ClothingItem = {
      id: `item-user-${Date.now()}`,
      name: name.trim() || subCategory || 'Peça do Armário',
      category,
      subCategory: subCategory.trim() || name.trim(),
      imageUrl: photoDataUrl,
      color: {
        name: colorName,
        hex: colorHex,
        family: colorFamily,
      },
      pattern: 'liso',
      material: material || 'Tecido',
      style,
      occasions,
      seasons: ['todas'],
      formality,
      wearCount: 0,
      createdAt: new Date().toISOString(),
    };

    onItemAdded(newItem);

    // Micro-interaction celebration
    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.8 },
        colors: ['#C29F68', '#111110', '#EAE5DC'],
      });
    } catch {}

    handleClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#FBF9F5] rounded-t-3xl sm:rounded-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-[#EAE5DC]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#EAE5DC] bg-white/70">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#C29F68]" />
            <h2 className="font-serif font-bold text-base text-[#111110]">
              {step === 'upload' && 'Adicionar Peça'}
              {step === 'analyzing' && 'Analisando com IA...'}
              {step === 'confirm' && 'Confirmar Detalhes da Peça'}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-[#F2EDE4] text-[#6E6B65] flex items-center justify-center active:scale-90"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1 no-scrollbar space-y-5">
          {/* STEP 1: UPLOAD / CAMERA SELECTION */}
          {step === 'upload' && (
            <div className="space-y-4 py-2">
              <div className="text-center space-y-1">
                <p className="text-sm font-medium text-[#111110]">
                  Como você quer cadastrar sua roupa?
                </p>
                <p className="text-xs text-[#78756E]">
                  Fotografe sua peça estendida na cama, mesa ou cabide.
                </p>
              </div>

              {/* iPhone Camera Trigger */}
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) handleFileSelected(e.target.files[0]);
                }}
              />

              {/* Photo Gallery Trigger */}
              <input
                ref={galleryInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) handleFileSelected(e.target.files[0]);
                }}
              />

              <div className="grid grid-cols-1 gap-3 pt-2">
                <button
                  onClick={() => cameraInputRef.current?.click()}
                  className="flex items-center justify-center gap-3 w-full py-4 px-4 bg-[#18181B] text-[#FBF9F5] rounded-2xl font-medium shadow-md active:scale-[0.98] transition-all hover:bg-[#28282C]"
                >
                  <Camera size={20} className="text-[#E5C799]" />
                  <span>Tirar foto agora (Câmera)</span>
                </button>

                <button
                  onClick={() => galleryInputRef.current?.click()}
                  className="flex items-center justify-center gap-3 w-full py-3.5 px-4 bg-white text-[#18181B] border border-[#E0DACE] rounded-2xl font-medium shadow-sm active:scale-[0.98] transition-all hover:bg-[#F9F7F3]"
                >
                  <ImageIcon size={19} className="text-[#78756E]" />
                  <span>Escolher da Galeria de Fotos</span>
                </button>
              </div>

              {/* Tips for better results */}
              <div className="bg-[#F2EDE4]/60 p-4 rounded-2xl border border-[#E6DFD3] text-xs text-[#68655E] space-y-1.5">
                <div className="flex items-center gap-1.5 font-semibold text-[#18181B]">
                  <Sparkles size={14} className="text-[#C29F68]" />
                  <span>Dica para um catálogo impecável:</span>
                </div>
                <p>• Iluminação natural destaca as cores reais do tecido.</p>
                <p>• O CombinaKai isola a peça e aplica um fundo de estúdio profissional automaticamente.</p>
              </div>
            </div>
          )}

          {/* STEP 2: ANALYZING STATE */}
          {step === 'analyzing' && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-[#C29F68]/30 border-t-[#C29F68] animate-spin flex items-center justify-center" />
                <Sparkles
                  size={20}
                  className="absolute inset-0 m-auto text-[#C29F68] animate-pulse"
                />
              </div>
              <div>
                <h3 className="font-serif font-bold text-lg text-[#111110]">
                  Identificando sua roupa...
                </h3>
                <p className="text-xs text-[#78756E] mt-1 max-w-xs">
                  Detectando corte, cor predominante, estilo e ocasiões ideais.
                </p>
              </div>
            </div>
          )}

          {/* STEP 3: CONFIRM & EDIT METADATA */}
          {step === 'confirm' && photoDataUrl && (
            <div className="space-y-5">
              {/* Photo Preview Card */}
              <div className="relative aspect-square max-h-56 mx-auto rounded-2xl overflow-hidden border border-[#EAE5DC] bg-white shadow-sm flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photoDataUrl}
                  alt="Peça capturada"
                  className="w-full h-full object-contain p-2"
                />
                <button
                  onClick={() => setStep('upload')}
                  className="absolute top-2 right-2 bg-black/60 text-white p-1.5 rounded-full text-xs flex items-center gap-1 backdrop-blur-md"
                >
                  <RefreshCw size={12} />
                  <span>Trocar foto</span>
                </button>
              </div>

              {/* Garment Name Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#4A4843] uppercase tracking-wider">
                  Nome da Peça
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Camisa Social Azul, Calça Jeans Reta"
                  className="w-full px-3.5 py-2.5 bg-white border border-[#DDD7CC] rounded-xl text-sm font-medium text-[#111110] focus:outline-none focus:ring-2 focus:ring-[#C29F68]"
                />
              </div>

              {/* Category Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#4A4843] uppercase tracking-wider flex items-center gap-1">
                  <Layers size={13} />
                  <span>Categoria</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-medium text-left transition-all ${
                        category === cat.id
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

              {/* Color & Material */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#4A4843] uppercase tracking-wider flex items-center gap-1">
                    <Palette size={13} />
                    <span>Cor</span>
                  </label>
                  <div className="flex items-center gap-2 bg-white border border-[#DDD7CC] rounded-xl p-2">
                    <div
                      className="w-6 h-6 rounded-full border border-black/10 shrink-0"
                      style={{ backgroundColor: colorHex }}
                    />
                    <input
                      type="text"
                      value={colorName}
                      onChange={(e) => setColorName(e.target.value)}
                      className="w-full text-xs font-medium bg-transparent focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#4A4843] uppercase tracking-wider">
                    Tecido / Material
                  </label>
                  <input
                    type="text"
                    value={material}
                    onChange={(e) => setMaterial(e.target.value)}
                    placeholder="Ex: Algodão, Linho"
                    className="w-full px-3 py-2 bg-white border border-[#DDD7CC] rounded-xl text-xs font-medium focus:outline-none"
                  />
                </div>
              </div>

              {/* Style Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#4A4843] uppercase tracking-wider">
                  Estilo
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {STYLES.map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setStyle(st)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-all ${
                        style === st
                          ? 'bg-[#18181B] text-white shadow-xs'
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
                    {formality === 1 && 'Super Casual'}
                    {formality === 2 && 'Casual Urbano'}
                    {formality === 3 && 'Casual Elegante'}
                    {formality === 4 && 'Social / Formal'}
                    {formality === 5 && 'Gala / Festa'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setFormality(lvl as any)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        formality >= lvl
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
                <label className="text-xs font-semibold text-[#4A4843] uppercase tracking-wider">
                  Ocasiões Recomendadas
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {OCCASIONS.map((occ) => {
                    const isSelected = occasions.includes(occ.id);
                    return (
                      <button
                        key={occ.id}
                        type="button"
                        onClick={() => toggleOccasion(occ.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                          isSelected
                            ? 'bg-[#18181B] text-white shadow-xs'
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
            </div>
          )}
        </div>

        {/* Modal Footer */}
        {step === 'confirm' && (
          <div className="p-4 border-t border-[#EAE5DC] bg-white/80 flex items-center gap-3">
            <button
              onClick={handleClose}
              className="flex-1 py-3 text-xs font-medium text-[#78756E] hover:text-[#111110] transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="flex-[2] py-3 px-4 bg-[#18181B] text-[#FBF9F5] rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all hover:bg-[#28282C]"
            >
              <Check size={16} className="text-[#E5C799]" />
              <span>Salvar no Armário</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
