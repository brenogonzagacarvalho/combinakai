'use client';

import React, { useState } from 'react';
import {
  X,
  Sparkles,
  ArrowRight,
  Sun,
  CloudRain,
  Snowflake,
  Wind,
  Check,
  Dices,
} from 'lucide-react';
import { ClothingOccasion, ClothingStyle, Outfit, ClothingItem } from '@/types/wardrobe';
import { OutfitGenerator } from '@/lib/ai/OutfitGenerator';
import { useWardrobe } from '@/context/WardrobeContext';

interface CreateOutfitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOutfitsGenerated: (outfits: Outfit[]) => void;
  initialAnchorItem?: ClothingItem;
}

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

const STYLES: Array<{ id: ClothingStyle | 'surprise'; label: string; desc: string }> = [
  { id: 'surprise', label: '✨ Surpreenda-me', desc: 'A IA escolhe o melhor visual' },
  { id: 'casual', label: 'Casual Elegante', desc: 'Descontraído com presença' },
  { id: 'minimalista', label: 'Minimalista', desc: 'Cores sóbrias e linhas limpas' },
  { id: 'elegante', label: 'Alta Elegância', desc: 'Sofisticação sem esforço' },
  { id: 'social', label: 'Social / Office', desc: 'Formalidade e autoridade' },
  { id: 'streetwear', label: 'Streetwear Moderno', desc: 'Atitude urbana e tênis' },
  { id: 'romantico', label: 'Romântico Suave', desc: 'Fluidez e tons agradáveis' },
  { id: 'confortavel', label: 'Confortável', desc: 'Máximo bem-estar e caimento' },
];

export const CreateOutfitModal: React.FC<CreateOutfitModalProps> = ({
  isOpen,
  onClose,
  onOutfitsGenerated,
  initialAnchorItem,
}) => {
  const { wardrobe, dislikedOutfitIds } = useWardrobe();

  const [step, setStep] = useState<1 | 2>(1);
  const [selectedOccasion, setSelectedOccasion] = useState<ClothingOccasion>('casual');
  const [selectedStyle, setSelectedStyle] = useState<ClothingStyle | 'surprise'>('surprise');
  const [selectedWeather, setSelectedWeather] = useState<'quente' | 'ameno' | 'frio' | 'chuvoso'>('ameno');
  const [anchorItemId, setAnchorItemId] = useState<string | undefined>(initialAnchorItem?.id);

  if (!isOpen) return null;

  const handleGenerate = () => {
    const results = OutfitGenerator.generateOutfits(
      wardrobe,
      {
        occasion: selectedOccasion,
        style: selectedStyle,
        weather: selectedWeather,
        anchorItemId: anchorItemId || undefined,
        surpriseMe: selectedStyle === 'surprise',
      },
      dislikedOutfitIds
    );

    onOutfitsGenerated(results);
    onClose();
  };

  const handleQuickSurprise = () => {
    const randomOcc = OCCASIONS[Math.floor(Math.random() * OCCASIONS.length)].id;
    const results = OutfitGenerator.generateOutfits(
      wardrobe,
      {
        occasion: randomOcc,
        surpriseMe: true,
      },
      dislikedOutfitIds
    );
    onOutfitsGenerated(results);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#FBF9F5] rounded-t-3xl sm:rounded-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-[#EAE5DC]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#EAE5DC] bg-white/70">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[#18181B] text-[#E5C799] flex items-center justify-center text-xs">
              <Sparkles size={12} />
            </div>
            <h2 className="font-serif font-bold text-base text-[#111110]">
              {step === 1 ? 'Para onde você vai?' : 'Qual é o seu estilo hoje?'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F2EDE4] text-[#6E6B65] flex items-center justify-center active:scale-90"
          >
            <X size={16} />
          </button>
        </div>

        {/* Wizard Body */}
        <div className="p-5 overflow-y-auto flex-1 no-scrollbar space-y-5">
          {/* STEP 1: OCCASION & WEATHER */}
          {step === 1 && (
            <div className="space-y-5">
              {/* Emergency Quick Assistant Banner ("Não sei o que vestir") */}
              <button
                type="button"
                onClick={handleQuickSurprise}
                className="w-full p-3.5 bg-gradient-to-r from-[#242424] to-[#121212] rounded-2xl text-white flex items-center justify-between shadow-md active:scale-98 transition-transform group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-[#E5C799]">
                    <Dices size={18} />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold">🤔 Não sei o que vestir</p>
                    <p className="text-[10px] text-white/70">A IA monta o look ideal em 1 segundo</p>
                  </div>
                </div>
                <ArrowRight size={16} className="text-[#E5C799] group-hover:translate-x-1 transition-transform" />
              </button>

              {/* Weather Quick Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#4A4843] uppercase tracking-wider block">
                  Como está o clima?
                </label>
                <div className="grid grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedWeather('quente')}
                    className={`py-2 px-2 rounded-xl text-xs font-medium flex flex-col items-center gap-1 border transition-all ${
                      selectedWeather === 'quente'
                        ? 'bg-[#18181B] text-white border-[#18181B]'
                        : 'bg-white text-[#4A4843] border-[#E5E0D6]'
                    }`}
                  >
                    <Sun size={16} className={selectedWeather === 'quente' ? 'text-[#E5C799]' : 'text-amber-500'} />
                    <span className="text-[11px]">Quente</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedWeather('ameno')}
                    className={`py-2 px-2 rounded-xl text-xs font-medium flex flex-col items-center gap-1 border transition-all ${
                      selectedWeather === 'ameno'
                        ? 'bg-[#18181B] text-white border-[#18181B]'
                        : 'bg-white text-[#4A4843] border-[#E5E0D6]'
                    }`}
                  >
                    <Wind size={16} className={selectedWeather === 'ameno' ? 'text-[#E5C799]' : 'text-stone-500'} />
                    <span className="text-[11px]">Ameno</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedWeather('frio')}
                    className={`py-2 px-2 rounded-xl text-xs font-medium flex flex-col items-center gap-1 border transition-all ${
                      selectedWeather === 'frio'
                        ? 'bg-[#18181B] text-white border-[#18181B]'
                        : 'bg-white text-[#4A4843] border-[#E5E0D6]'
                    }`}
                  >
                    <Snowflake size={16} className={selectedWeather === 'frio' ? 'text-[#E5C799]' : 'text-sky-500'} />
                    <span className="text-[11px]">Frio</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedWeather('chuvoso')}
                    className={`py-2 px-2 rounded-xl text-xs font-medium flex flex-col items-center gap-1 border transition-all ${
                      selectedWeather === 'chuvoso'
                        ? 'bg-[#18181B] text-white border-[#18181B]'
                        : 'bg-white text-[#4A4843] border-[#E5E0D6]'
                    }`}
                  >
                    <CloudRain size={16} className={selectedWeather === 'chuvoso' ? 'text-[#E5C799]' : 'text-indigo-400'} />
                    <span className="text-[11px]">Chuva</span>
                  </button>
                </div>
              </div>

              {/* Occasion Selection Grid */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#4A4843] uppercase tracking-wider block">
                  Escolha o Destino
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {OCCASIONS.map((occ) => {
                    const isSelected = selectedOccasion === occ.id;
                    return (
                      <button
                        key={occ.id}
                        type="button"
                        onClick={() => setSelectedOccasion(occ.id)}
                        className={`flex items-center gap-3 p-3 rounded-2xl border text-left transition-all ${
                          isSelected
                            ? 'bg-[#18181B] text-white border-[#18181B] shadow-sm'
                            : 'bg-white text-[#4A4843] border-[#E5E0D6] hover:bg-[#F9F7F3]'
                        }`}
                      >
                        <span className="text-2xl">{occ.icon}</span>
                        <div className="flex-1">
                          <p className="text-xs font-bold leading-tight">{occ.label}</p>
                        </div>
                        {isSelected && <Check size={14} className="text-[#E5C799]" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: STYLE SELECTION & ANCHOR PIECE */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#4A4843] uppercase tracking-wider block">
                  Estilo Desejado
                </label>
                <div className="space-y-2">
                  {STYLES.map((st) => {
                    const isSelected = selectedStyle === st.id;
                    return (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => setSelectedStyle(st.id)}
                        className={`w-full flex items-center justify-between p-3 rounded-2xl border text-left transition-all ${
                          isSelected
                            ? 'bg-[#18181B] text-white border-[#18181B] shadow-sm'
                            : 'bg-white text-[#4A4843] border-[#E5E0D6] hover:bg-[#F9F7F3]'
                        }`}
                      >
                        <div>
                          <p className="text-xs font-bold">{st.label}</p>
                          <p className="text-[10px] text-[#78756E] mt-0.5">{st.desc}</p>
                        </div>
                        {isSelected && <Check size={16} className="text-[#E5C799]" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Optional: Anchor a specific piece ("Tenho uma peça, monte o resto") */}
              {wardrobe.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <label className="text-xs font-semibold text-[#4A4843] uppercase tracking-wider block">
                    Peça Obrigatória (Opcional)
                  </label>
                  <select
                    value={anchorItemId || ''}
                    onChange={(e) => setAnchorItemId(e.target.value || undefined)}
                    className="w-full p-3 bg-white border border-[#DDD7CC] rounded-xl text-xs font-medium text-[#111110] focus:outline-none"
                  >
                    <option value="">Nenhuma (IA escolhe livremente)</option>
                    {wardrobe.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name} ({item.subCategory})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 border-t border-[#EAE5DC] bg-white/80 flex items-center gap-3">
          {step === 2 && (
            <button
              onClick={() => setStep(1)}
              className="py-3 px-4 text-xs font-semibold text-[#78756E] hover:text-[#111110]"
            >
              Voltar
            </button>
          )}

          {step === 1 ? (
            <button
              onClick={() => setStep(2)}
              className="flex-1 py-3 px-4 bg-[#18181B] text-[#FBF9F5] rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all hover:bg-[#28282C]"
            >
              <span>Continuar para Estilo</span>
              <ArrowRight size={14} className="text-[#E5C799]" />
            </button>
          ) : (
            <button
              onClick={handleGenerate}
              className="flex-1 py-3 px-4 bg-[#18181B] text-[#FBF9F5] rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all hover:bg-[#28282C]"
            >
              <Sparkles size={16} className="text-[#E5C799]" />
              <span>Gerar Combinações</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
