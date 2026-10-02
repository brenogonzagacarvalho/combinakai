'use client';

import React, { useState, useRef } from 'react';
import {
  Smartphone,
  ShieldCheck,
  RefreshCw,
  Trash2,
  Share2,
  Sparkles,
  PieChart,
  Cloud,
  CheckCircle2,
} from 'lucide-react';
import { useWardrobe } from '@/context/WardrobeContext';
import { useAuth } from '@/context/AuthContext';
import { WardrobeAnalyzer } from '@/lib/ai/WardrobeAnalyzer';
import { ShareHelper } from '@/lib/shareHelper';

interface ProfileTabProps {
  onOpenPwaModal: () => void;
  onOpenAuthModal: () => void;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({ onOpenPwaModal, onOpenAuthModal }) => {
  const {
    wardrobe,
    savedOutfits,
    loadDemoWardrobe,
    clearWardrobe,
    isDemoActive,
    isSyncingCloud,
    lastSyncTime,
    syncNow,
    exportBackup,
    importBackup,
  } = useWardrobe();
  const { user, isFirebaseReady } = useAuth();

  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const stats = WardrobeAnalyzer.analyze(wardrobe);

  const handleShareWardrobe = () => {
    const text = ShareHelper.formatWardrobeText(wardrobe.length);
    ShareHelper.shareToWhatsApp(text);
  };

  const handleManualSync = async () => {
    if (!user) {
      onOpenAuthModal();
      return;
    }
    try {
      await syncNow();
      setSyncFeedback('✅ Todas as peças foram sincronizadas com o Firebase!');
      setTimeout(() => setSyncFeedback(null), 4000);
    } catch (e) {
      setSyncFeedback('❌ Erro ao sincronizar. Verifique sua conexão.');
      setTimeout(() => setSyncFeedback(null), 4000);
    }
  };

  const handleDownloadBackup = () => {
    exportBackup();
    setSyncFeedback('📥 Cópia de segurança baixada com sucesso no seu dispositivo!');
    setTimeout(() => setSyncFeedback(null), 4000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      const res = await importBackup(content);
      if (res.success) {
        setSyncFeedback(`✅ ${res.count} peças restauradas do arquivo!`);
      } else {
        setSyncFeedback(`❌ ${res.error || 'Falha ao importar backup'}`);
      }
      setTimeout(() => setSyncFeedback(null), 4000);
    };
    reader.readAsText(file);
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
          Estatísticas do armário, backup na nuvem e preferências
        </p>
      </div>

      {/* CLOUD SYNC & BACKUP CENTER */}
      <div className="bg-gradient-to-b from-white to-[#FAF8F5] rounded-3xl border-2 border-[#EAE5DC] p-5 shadow-xs space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                user
                  ? 'bg-[#2F855A]/15 text-[#2F855A] border border-[#2F855A]/30'
                  : 'bg-[#C29F68]/15 text-[#C29F68] border border-[#C29F68]/30'
              }`}
            >
              <Cloud size={24} className={isSyncingCloud ? 'animate-bounce' : ''} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-sm font-bold text-[#111110]">
                  {user ? 'Armário Conectado à Nuvem' : 'Sincronizar com Firebase'}
                </h2>
                <span
                  className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    user
                      ? 'bg-[#2F855A]/15 text-[#2F855A]'
                      : 'bg-[#C29F68]/15 text-[#8C6D38]'
                  }`}
                >
                  {user ? 'Online' : 'Local'}
                </span>
              </div>
              <p className="text-[11px] text-[#78756E] mt-0.5">
                {user
                  ? `${user.email || 'Conta Vinculada'} • Suas ${wardrobe.length} peças estão salvas no Firebase.`
                  : `Você tem ${wardrobe.length} peças salvas no celular. Conecte ao Firebase para garantir que nada se perca.`}
              </p>
            </div>
          </div>
        </div>

        {/* Feedback message banner */}
        {syncFeedback && (
          <div className="p-3 bg-white rounded-xl border border-[#EAE5DC] text-xs font-semibold text-[#111110] shadow-sm animate-in fade-in duration-200">
            {syncFeedback}
          </div>
        )}

        {/* Action Buttons Grid */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          {user ? (
            <button
              onClick={handleManualSync}
              disabled={isSyncingCloud}
              className="py-2.5 px-3 bg-[#18181B] text-white hover:bg-[#2C2C30] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all disabled:opacity-50"
            >
              <RefreshCw size={13} className={isSyncingCloud ? 'animate-spin' : ''} />
              <span>{isSyncingCloud ? 'Sincronizando...' : 'Sincronizar Agora'}</span>
            </button>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="py-2.5 px-3 bg-[#18181B] text-white hover:bg-[#2C2C30] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
            >
              <Cloud size={13} />
              <span>Conectar ao Firebase</span>
            </button>
          )}

          {user ? (
            <button
              onClick={onOpenAuthModal}
              className="py-2.5 px-3 bg-[#F2EDE4] hover:bg-[#EAE3D6] text-[#111110] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all"
            >
              <span>Gerenciar Conta</span>
            </button>
          ) : (
            <button
              onClick={handleDownloadBackup}
              className="py-2.5 px-3 bg-[#F2EDE4] hover:bg-[#EAE3D6] text-[#111110] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all"
            >
              <span>Baixar Backup</span>
            </button>
          )}
        </div>

        {/* Extra Security Download / Restore Row */}
        <div className="pt-2 border-t border-[#EAE5DC]/80 flex items-center justify-between text-[11px] text-[#78756E]">
          <button
            onClick={handleDownloadBackup}
            className="text-[#8C6D38] hover:text-[#684F25] font-semibold underline underline-offset-2 flex items-center gap-1"
          >
            <span>📥 Baixar cópia de segurança (JSON)</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-[#78756E] hover:text-[#111110] font-medium"
          >
            Restaurar arquivo
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
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
          {user
            ? 'Suas fotos e roupas estão armazenadas de forma segura e privada na sua conta do Firebase.'
            : 'Suas fotos e roupas estão salvas com segurança no seu navegador. Conecte ao Firebase para acessar de outros aparelhos.'}
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
