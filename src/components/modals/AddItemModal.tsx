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
  Wand2,
  Scissors,
} from 'lucide-react';
import { ClothingCategory, ClothingItem, ClothingOccasion, ClothingStyle } from '@/types/wardrobe';
import {
  processGarmentImage,
  autoCropAndEnhanceGarment,
  removeGarmentBackground,
} from '@/lib/imageProcessor';
import { AIService } from '@/lib/ai/AIService';
import confetti from 'canvas-confetti';

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onItemAdded: (item: ClothingItem) => void | Promise<void>;
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
  outerwear: ['Jaqueta de Couro', 'Jaqueta Jeans', 'Blazer', 'Casaco', 'Casaquinho', 'Corta-vento'],
  tops: ['Camiseta Básica', 'Camisa Social', 'Camisa de Linho', 'Camisa Manga Longa', 'Cropped', 'Regata', 'Blusa'],
  dresses: ['Vestido Midi', 'Vestido Curto', 'Vestido Longo', 'Vestido Fluido'],
  shoes: ['Tênis Casual', 'Tênis Branco', 'Salto Bloco', 'Salto Fino', 'Bota', 'Sandália'],
  accessories: ['Bolsa Tiracolo', 'Bolsa de Ombro', 'Cinto de Couro', 'Óculos de Sol'],
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
  { id: 'passeio', label: 'Passeio', icon: '🚶‍♀️' },
  { id: 'noite', label: 'Noite', icon: '🌙' },
  { id: 'praia', label: 'Praia', icon: '🏖️' },
  { id: 'viagem', label: 'Viagem', icon: '✈️' },
  { id: 'evento', label: 'Evento', icon: '⛪' },
  { id: 'esporte', label: 'Esporte', icon: '🏃' },
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

  // Image Processing & Cutout States
  const [rawOriginalUrl, setRawOriginalUrl] = useState<string | null>(null);
  const [studioPhotoUrl, setStudioPhotoUrl] = useState<string | null>(null);
  const [cutoutPhotoUrl, setCutoutPhotoUrl] = useState<string | null>(null);
  const [imageMode, setImageMode] = useState<'studio' | 'cutout' | 'original'>('studio');
  const [isRemovingBg, setIsRemovingBg] = useState(false);
  const [bgProgressPct, setBgProgressPct] = useState(0);
  const [bgProgressStage, setBgProgressStage] = useState('Processando IA...');

  // Editable Form Data
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ClothingCategory>('tops');
  const [subCategory, setSubCategory] = useState('');
  const [colorName, setColorName] = useState('Azul');
  const [colorHex, setColorHex] = useState('#3B6B9B');
  const [colorFamily, setColorFamily] = useState<any>('azul');
  const [style, setStyle] = useState<ClothingStyle>('casual');
  const [formality, setFormality] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [occasions, setOccasions] = useState<ClothingOccasion[]>(['casual', 'jantar']);
  const [material, setMaterial] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const resetState = () => {
    setIsSaving(false);
    setStep('upload');
    setPhotoDataUrl(null);
    setRawOriginalUrl(null);
    setStudioPhotoUrl(null);
    setCutoutPhotoUrl(null);
    setImageMode('studio');
    setIsRemovingBg(false);
    setName('');
    setSubCategory('');
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleCategoryChange = (newCat: ClothingCategory) => {
    setCategory(newCat);
    const defaults = QUICK_TYPES_BY_CATEGORY[newCat];
    if (defaults && defaults.length > 0) {
      setSubCategory(defaults[0]);
      if (!name) setName(defaults[0]);
    }
  };

  const handleNameChange = (newName: string) => {
    setName(newName);
    const lower = newName.toLowerCase();

    // Auto-detect category and type if recognized from name
    if (lower.includes('short') || lower.includes('bermuda')) {
      setCategory('bottoms');
      setSubCategory(lower.includes('short') ? 'Short Jeans' : 'Bermuda');
    } else if (lower.includes('jaqueta') || lower.includes('casaco') || lower.includes('casaquinho') || lower.includes('blazer')) {
      setCategory('outerwear');
      setSubCategory(lower.includes('jaqueta') ? 'Jaqueta de Couro' : lower.includes('casaquinho') ? 'Casaquinho' : 'Casaco / Blazer');
    } else if (lower.includes('vestido')) {
      setCategory('dresses');
      setSubCategory('Vestido');
    } else if (lower.includes('calça')) {
      setCategory('bottoms');
      setSubCategory('Calça Jeans');
    } else if (lower.includes('camisa') || lower.includes('camiseta') || lower.includes('blusa') || lower.includes('cropped')) {
      setCategory('tops');
      setSubCategory(lower.includes('camisa') ? 'Camisa' : 'Camiseta');
    }
  };

  const handleTriggerBgRemoval = async () => {
    const source = rawOriginalUrl || photoDataUrl;
    if (!source) return;

    setIsRemovingBg(true);
    setBgProgressPct(15);
    setBgProgressStage('Carregando modelo IA...');

    try {
      const result = await removeGarmentBackground(source, (pct, stage) => {
        setBgProgressPct(pct);
        setBgProgressStage(stage);
      });
      setCutoutPhotoUrl(result.studioUrl);
      setPhotoDataUrl(result.studioUrl);
      setImageMode('cutout');
    } catch (err) {
      console.error('Failed to remove background:', err);
      alert('Não foi possível remover o fundo automaticamente nesta imagem. A versão de estúdio ajustada foi mantida.');
    } finally {
      setIsRemovingBg(false);
    }
  };

  const handleFileSelected = async (file: File) => {
    setStep('analyzing');
    try {
      // 1. Process image on client canvas (studio treatment + color extraction)
      const processed = await processGarmentImage(file);
      setRawOriginalUrl(processed.rawOriginalUrl);
      setStudioPhotoUrl(processed.dataUrl);
      setPhotoDataUrl(processed.dataUrl);
      setImageMode('studio');

      // 2. Classify via AI Service
      const aiResult = await AIService.classifyGarment(processed.dataUrl, processed.dominantColor);

      // 3. AI Auto-Framing: if AI detected object bounding box, auto-crop & straighten piece
      if (aiResult.box_2d && aiResult.box_2d.length === 4) {
        try {
          const autoFramed = await autoCropAndEnhanceGarment(processed.rawOriginalUrl, aiResult.box_2d);
          setStudioPhotoUrl(autoFramed);
          setPhotoDataUrl(autoFramed);
        } catch (cropErr) {
          console.warn('Auto-frame adjustment skipped:', cropErr);
        }
      }

      // 4. Populate form with AI tags
      const detectedSub = aiResult.subCategory || 'Nova Peça';
      setName(detectedSub);
      setCategory(aiResult.category || 'tops');
      setSubCategory(detectedSub);
      setColorName(aiResult.color.name);
      setColorHex(aiResult.color.hex);
      setColorFamily(aiResult.color.family);
      setStyle(aiResult.style || 'casual');
      setFormality(aiResult.formality || 2);
      setOccasions(aiResult.occasions || ['casual']);
      if (aiResult.material) setMaterial(aiResult.material);

      setStep('confirm');
    } catch (err) {
      console.error('Image processing failed:', err);
      // Fallback preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const raw = e.target?.result as string;
        setPhotoDataUrl(raw);
        setRawOriginalUrl(raw);
        setStudioPhotoUrl(raw);
        setName('Minha Peça');
        setSubCategory('Peça');
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

  const handleSave = async () => {
    if (!photoDataUrl || isSaving) return;

    setIsSaving(true);
    try {
      const finalSub = subCategory.trim() || name.trim() || 'Peça do Armário';
      const finalName = name.trim() || finalSub;

      const newItem: ClothingItem = {
        id: `item-user-${Date.now()}`,
        name: finalName,
        category,
        subCategory: finalSub,
        imageUrl: photoDataUrl,
        color: {
          name: colorName,
          hex: colorHex,
          family: colorFamily,
        },
        pattern: 'liso',
        material: material.trim() || 'Tecido',
        style,
        occasions: occasions.length > 0 ? occasions : ['casual'],
        seasons: ['todas'],
        formality,
        wearCount: 0,
        createdAt: new Date().toISOString(),
      };

      // Only attach originalImageUrl if different from photoDataUrl and present
      if (rawOriginalUrl && rawOriginalUrl !== photoDataUrl) {
        newItem.originalImageUrl = rawOriginalUrl;
      }

      await onItemAdded(newItem);

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
    } catch (err: any) {
      console.error('Error saving item:', err);
      alert('Não foi possível salvar a peça: ' + (err?.message || 'Erro inesperado'));
    } finally {
      setIsSaving(false);
    }
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
                  Identificando sua roupa com IA...
                </h3>
                <p className="text-xs text-[#78756E] mt-1 max-w-xs">
                  Detectando corte, categoria exata, cor predominante e estilo.
                </p>
              </div>
            </div>
          )}

          {/* STEP 3: CONFIRM & EDIT METADATA */}
          {step === 'confirm' && photoDataUrl && (
            <div className="space-y-4">
              {/* Photo Preview Card with Studio Modes */}
              <div className="space-y-2">
                <div className="relative aspect-square max-h-56 mx-auto rounded-3xl overflow-hidden border-2 border-[#EAE5DC] bg-white shadow-sm flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photoDataUrl}
                    alt="Peça capturada"
                    className="w-full h-full object-contain p-2.5 transition-all duration-300"
                  />

                  {/* Mode badge overlay */}
                  <div className="absolute top-2.5 left-2.5 bg-black/70 backdrop-blur-md text-[#E5C799] text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
                    {imageMode === 'cutout' ? (
                      <>
                        <Scissors size={11} />
                        <span>Sem Fundo IA</span>
                      </>
                    ) : imageMode === 'studio' ? (
                      <>
                        <Wand2 size={11} />
                        <span>Estúdio Pro (Ajustado)</span>
                      </>
                    ) : (
                      <>
                        <Camera size={11} />
                        <span>Foto Original</span>
                      </>
                    )}
                  </div>

                  <button
                    onClick={() => setStep('upload')}
                    className="absolute top-2.5 right-2.5 bg-black/60 text-white p-1.5 px-2.5 rounded-full text-[10px] font-semibold flex items-center gap-1 backdrop-blur-md active:scale-95 transition-all"
                  >
                    <RefreshCw size={11} />
                    <span>Trocar</span>
                  </button>
                </div>

                {/* AI Background Removal Progress or Actions */}
                {isRemovingBg ? (
                  <div className="bg-[#FAF8F5] border border-[#EAE5DC] rounded-2xl p-3 space-y-1.5 animate-pulse">
                    <div className="flex items-center justify-between text-xs font-bold text-[#111110]">
                      <span className="flex items-center gap-1.5">
                        <Sparkles size={14} className="text-[#C29F68] animate-spin" />
                        <span>{bgProgressStage}</span>
                      </span>
                      <span>{bgProgressPct}%</span>
                    </div>
                    <div className="w-full h-2 bg-[#EAE5DC] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#C29F68] to-[#18181B] transition-all duration-200"
                        style={{ width: `${bgProgressPct}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {/* Mode Switcher Buttons */}
                    <div className="flex bg-[#F2EDE4]/70 p-1 rounded-2xl gap-1 text-xs">
                      {studioPhotoUrl && (
                        <button
                          type="button"
                          onClick={() => {
                            setImageMode('studio');
                            setPhotoDataUrl(studioPhotoUrl);
                          }}
                          className={`flex-1 py-1.5 rounded-xl font-bold transition-all text-[11px] flex items-center justify-center gap-1 ${
                            imageMode === 'studio'
                              ? 'bg-white text-[#111110] shadow-xs'
                              : 'text-[#68655E] hover:text-[#111110]'
                          }`}
                        >
                          <Wand2 size={12} />
                          <span>Estúdio Pro</span>
                        </button>
                      )}

                      {cutoutPhotoUrl && (
                        <button
                          type="button"
                          onClick={() => {
                            setImageMode('cutout');
                            setPhotoDataUrl(cutoutPhotoUrl);
                          }}
                          className={`flex-1 py-1.5 rounded-xl font-bold transition-all text-[11px] flex items-center justify-center gap-1 ${
                            imageMode === 'cutout'
                              ? 'bg-white text-[#111110] shadow-xs'
                              : 'text-[#68655E] hover:text-[#111110]'
                          }`}
                        >
                          <Scissors size={12} />
                          <span>Sem Fundo</span>
                        </button>
                      )}

                      {rawOriginalUrl && (
                        <button
                          type="button"
                          onClick={() => {
                            setImageMode('original');
                            setPhotoDataUrl(rawOriginalUrl);
                          }}
                          className={`flex-1 py-1.5 rounded-xl font-bold transition-all text-[11px] flex items-center justify-center gap-1 ${
                            imageMode === 'original'
                              ? 'bg-white text-[#111110] shadow-xs'
                              : 'text-[#68655E] hover:text-[#111110]'
                          }`}
                        >
                          <Camera size={12} />
                          <span>Original</span>
                        </button>
                      )}
                    </div>

                    {/* Button to remove background if not done yet */}
                    {!cutoutPhotoUrl && (
                      <button
                        type="button"
                        onClick={handleTriggerBgRemoval}
                        className="w-full py-2 px-3 bg-gradient-to-r from-[#18181B] to-[#2C2C32] hover:from-[#2A2A2E] hover:to-[#383840] text-[#E5C799] rounded-xl text-xs font-bold flex items-center justify-center gap-2 active:scale-98 transition-all shadow-xs"
                      >
                        <Scissors size={13} />
                        <span>✨ Remover Fundo com IA (Recorte Transparente)</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Garment Name Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#4A4843] uppercase tracking-wider block">
                  Nome da Peça
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
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
                      onClick={() => handleCategoryChange(cat.id)}
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

              {/* SubCategory / Tipo Exato com Quick Chips */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#4A4843] uppercase tracking-wider block">
                  Tipo da Peça (Subcategoria)
                </label>
                <input
                  type="text"
                  value={subCategory}
                  onChange={(e) => setSubCategory(e.target.value)}
                  placeholder="Ex: Short Jeans, Jaqueta, Camisa..."
                  className="w-full px-3.5 py-2.5 bg-white border border-[#DDD7CC] rounded-xl text-xs font-semibold text-[#111110] focus:outline-none focus:ring-2 focus:ring-[#C29F68]"
                />

                {/* Quick Suggestion Chips */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {QUICK_TYPES_BY_CATEGORY[category]?.map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setSubCategory(t)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all ${
                        subCategory === t
                          ? 'bg-[#C29F68] text-white'
                          : 'bg-white border border-[#EAE5DC] text-[#68655E] hover:bg-[#F2EDE4]'
                      }`}
                    >
                      {t}
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
                      className="w-5 h-5 rounded-full border border-black/10 shrink-0"
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
                    placeholder="Ex: Denim, Couro, Algodão"
                    className="w-full px-3 py-2 bg-white border border-[#DDD7CC] rounded-xl text-xs font-medium focus:outline-none"
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
                <label className="text-xs font-semibold text-[#4A4843] uppercase tracking-wider block">
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
              disabled={isSaving}
              className="flex-[2] py-3 px-4 bg-[#18181B] text-[#FBF9F5] rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all hover:bg-[#28282C] disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Salvando peça...</span>
                </>
              ) : (
                <>
                  <Check size={16} className="text-[#E5C799]" />
                  <span>Salvar no Armário</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
