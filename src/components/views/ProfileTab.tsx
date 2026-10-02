'use client';

import React from 'react';
import {
  Smartphone,
  ShieldCheck,
  RefreshCw,
  Trash2,
  Share2,
  Sparkles,
  PieChart,
  Sliders,
  CheckCircle2,
} from 'lucide-react';
import { useWardrobe } from '@/context/WardrobeContext';
import { WardrobeAnalyzer } from '@/lib/ai/WardrobeAnalyzer';
import { ShareHelper } from '@/lib/shareHelper';

interface ProfileTabProps {
  onOpenPwaModal: () => void;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({ onOpenPwaModal }) => {
  const { wardrobe, savedOutfits, loadDemoWardrobe, clearWardrobe, isDemoActive } = useWardrobe();

  const stats = WardrobeAnalyzer.analyze(wardrobe);

  const handleShareWardrobe = () => {
    const text = ShareHelper.formatWardrobeText(wardrobe.length);
    ShareHelper.shareToWhatsApp(text);
  };

  const handleClear = () => {
    if (confirm('Tem certeza que deseja apagar todas as roupas e começar do zero?')) {
      clearWardrobe();
    }
  };

  return (
    <div className="space-y-5 pb-28 pt-2 px-4 animate-in fade-in duration-200">
      {/* Title */}
      <div className="pt-1">
        <h1 className="font-serif text-2xl font-bold tracking-tight text-[#111110]">
          Perfil & Inteligência
        </h1>
        <p className="text-xs text-[#78756E] mt-0.5">
          Estatísticas do armário e preferências de estilo
        </p>
      </div>

      {/* WARDROBE ANALYTICS CARD */}
      <div className="bg-white rounded-3xl border border-[#EAE5DC] p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#F2EDE4] pb-3">
          <div className="flex items-center gap-2">
            <PieChart size={18} className="text-[#C29F68]" />
            <h2 className="font-serif font-bold text-sm text-[#111110]">
              Saúde do seu Guarda-Roupa
            </h2>
          </div>
          <span className="text-xs font-bold text-[#111110] bg-[#F2EDE4] px-2.5 py-0.5 rounded-full">
            {wardrobe.length} Peças
          </span>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-3 text-center">
          <div className="bg-[#FAF8F5] p-3 rounded-2xl border border-[#EAE5DC]">
            <span className="text-[10px] text-[#78756E] uppercase font-bold tracking-wider block">
              Diversidade de Cores
            </span>
            <span className="font-serif text-xl font-bold text-[#111110] mt-0.5 block">
              {stats.colorDiversity}%
            </span>
          </div>

          <div className="bg-[#FAF8F5] p-3 rounded-2xl border border-[#EAE5DC]">
            <span className="text-[10px] text-[#78756E] uppercase font-bold tracking-wider block">
              Looks Salvos
            </span>
            <span className="font-serif text-xl font-bold text-[#111110] mt-0.5 block">
              {savedOutfits.length}
            </span>
          </div>
        </div>

        {/* Category Breakdown Bar */}
        <div className="space-y-1.5 pt-1">
          <span className="text-[10px] text-[#78756E] uppercase font-bold tracking-wider block">
            Distribuição de Peças
          </span>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="flex items-center justify-between bg-[#FBF9F5] p-2 rounded-xl">
              <span>👕 Tops:</span>
              <strong className="text-[#111110]">{stats.byCategory.tops}</strong>
            </div>
            <div className="flex items-center justify-between bg-[#FBF9F5] p-2 rounded-xl">
              <span>👖 Calças:</span>
              <strong className="text-[#111110]">{stats.byCategory.bottoms}</strong>
            </div>
            <div className="flex items-center justify-between bg-[#FBF9F5] p-2 rounded-xl">
              <span>👗 Vestidos:</span>
              <strong className="text-[#111110]">{stats.byCategory.dresses}</strong>
            </div>
            <div className="flex items-center justify-between bg-[#FBF9F5] p-2 rounded-xl">
              <span>🧥 Casacos:</span>
              <strong className="text-[#111110]">{stats.byCategory.outerwear}</strong>
            </div>
            <div className="flex items-center justify-between bg-[#FBF9F5] p-2 rounded-xl">
              <span>👟 Calçados:</span>
              <strong className="text-[#111110]">{stats.byCategory.shoes}</strong>
            </div>
            <div className="flex items-center justify-between bg-[#FBF9F5] p-2 rounded-xl">
              <span>👜 Acessórios:</span>
              <strong className="text-[#111110]">{stats.byCategory.accessories}</strong>
            </div>
          </div>
        </div>

        {/* Stylist Insights */}
        {stats.insights.length > 0 && (
          <div className="bg-[#FAF8F5] p-3 rounded-2xl border border-[#EAE5DC] space-y-1 text-xs text-[#4A4843]">
            <p className="font-bold text-[#111110] flex items-center gap-1">
              <Sparkles size={13} className="text-[#C29F68]" />
              <span>Diagnóstico do Stylist:</span>
            </p>
            {stats.insights.map((insight, idx) => (
              <p key={idx} className="text-[11px] leading-relaxed">
                • {insight}
              </p>
            ))}
          </div>
        )}
      </div>

      {/* QUICK ACTIONS & PWA */}
      <div className="space-y-2.5">
        {/* PWA / iPhone Install Button */}
        <button
          onClick={onOpenPwaModal}
          className="w-full p-4 bg-white hover:bg-[#FAF8F5] border border-[#EAE5DC] rounded-3xl flex items-center justify-between text-left shadow-xs transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#F2EDE4] text-[#111110] flex items-center justify-center">
              <Smartphone size={20} />
            </div>
            <div>
              <p className="text-xs font-bold text-[#111110]">
                Como Usar no iPhone (PWA)
              </p>
              <p className="text-[10px] text-[#78756E]">
                Adicione à tela de início para abrir como app nativo
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-[#C29F68]">Ver guia</span>
        </button>

        {/* WhatsApp Share Wardrobe */}
        <button
          onClick={handleShareWardrobe}
          className="w-full p-4 bg-white hover:bg-[#FAF8F5] border border-[#EAE5DC] rounded-3xl flex items-center justify-between text-left shadow-xs transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#25D366]/15 text-[#25D366] flex items-center justify-center">
              <Share2 size={20} />
            </div>
            <div>
              <p className="text-xs font-bold text-[#111110]">
                Compartilhar meu Guarda-Roupa
              </p>
              <p className="text-[10px] text-[#78756E]">
                Envie o link para amigos pelo WhatsApp
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-[#25D366]">Enviar</span>
        </button>
      </div>

      {/* PRIVACY & SECURITY ACCREDITATION */}
      <div className="bg-[#FAF8F5] p-4 rounded-3xl border border-[#EAE5DC] space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-[#111110]">
          <ShieldCheck size={16} className="text-[#2F855A]" />
          <span>Privacidade Garantida</span>
        </div>
        <p className="text-[11px] text-[#68655E] leading-relaxed">
          Suas fotos e roupas ficam armazenadas 100% no navegador do seu próprio celular. Nenhum dado é compartilhado publicamente ou vendido.
        </p>
      </div>

      {/* DATA MANAGEMENT (DEMO & RESET) */}
      <div className="pt-2 space-y-2">
        <button
          onClick={loadDemoWardrobe}
          className="w-full py-3 px-4 bg-[#F2EDE4] hover:bg-[#EAE3D6] text-[#111110] rounded-2xl text-xs font-bold flex items-center justify-center gap-2 active:scale-98 transition-all"
        >
          <RefreshCw size={14} />
          <span>Recarregar Peças de Demonstração (14 Itens)</span>
        </button>

        <button
          onClick={handleClear}
          className="w-full py-2.5 px-4 text-[#9B2C2C] hover:text-[#741F1F] rounded-2xl text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
        >
          <Trash2 size={13} />
          <span>Apagar todas as roupas e recomeçar</span>
        </button>
      </div>
    </div>
  );
};
