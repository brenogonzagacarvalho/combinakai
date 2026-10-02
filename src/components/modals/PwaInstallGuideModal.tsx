'use client';

import React from 'react';
import { X, Share, PlusSquare, Smartphone, Check } from 'lucide-react';

interface PwaInstallGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PwaInstallGuideModal: React.FC<PwaInstallGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/65 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-[#FBF9F5] rounded-t-3xl sm:rounded-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden border border-[#EAE5DC]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#EAE5DC] bg-white/70">
          <div className="flex items-center gap-2">
            <Smartphone size={18} className="text-[#C29F68]" />
            <h2 className="font-serif font-bold text-base text-[#111110]">
              Instalar no iPhone (PWA)
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F2EDE4] text-[#6E6B65] flex items-center justify-center active:scale-90"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          <div className="text-center space-y-1">
            <h3 className="font-serif text-lg font-bold text-[#111110]">
              Use como um app nativo
            </h3>
            <p className="text-xs text-[#78756E] max-w-xs mx-auto">
              Sem precisar baixar pela App Store. Rápido, leve e com abertura instantânea.
            </p>
          </div>

          {/* 3 Step Visual Guide for iOS Safari */}
          <div className="space-y-3.5">
            {/* Step 1 */}
            <div className="flex items-start gap-3.5 bg-white p-3.5 rounded-2xl border border-[#EAE5DC]">
              <div className="w-8 h-8 rounded-full bg-[#F2EDE4] text-[#18181B] font-bold text-xs flex items-center justify-center shrink-0">
                1
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-[#111110] flex items-center gap-1.5">
                  <span>Toque no botão Compartilhar</span>
                  <Share size={14} className="text-[#007AFF]" />
                </p>
                <p className="text-[11px] text-[#78756E]">
                  Na barra inferior do seu navegador Safari no iPhone.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start gap-3.5 bg-white p-3.5 rounded-2xl border border-[#EAE5DC]">
              <div className="w-8 h-8 rounded-full bg-[#F2EDE4] text-[#18181B] font-bold text-xs flex items-center justify-center shrink-0">
                2
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-[#111110] flex items-center gap-1.5">
                  <span>Role e toque em</span>
                  <PlusSquare size={14} className="text-[#34C759]" />
                </p>
                <p className="text-[11px] text-[#78756E]">
                  Selecione <strong className="text-[#111110]">"Adicionar à Tela de Início"</strong>.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start gap-3.5 bg-white p-3.5 rounded-2xl border border-[#EAE5DC]">
              <div className="w-8 h-8 rounded-full bg-[#F2EDE4] text-[#18181B] font-bold text-xs flex items-center justify-center shrink-0">
                3
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-[#111110]">
                  Confirme em "Adicionar"
                </p>
                <p className="text-[11px] text-[#78756E]">
                  O ícone do CombinaKai aparecerá na sua tela inicial como um app normal!
                </p>
              </div>
            </div>
          </div>

          <div className="bg-[#EAE5DC]/60 p-3.5 rounded-2xl text-[11px] text-[#68655E] flex items-center gap-2">
            <Check size={16} className="text-[#2F855A] shrink-0" />
            <span>Funciona offline e salva suas roupas diretamente na memória do iPhone.</span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#EAE5DC] bg-white/80">
          <button
            onClick={onClose}
            className="w-full py-3 bg-[#18181B] text-white rounded-xl text-xs font-bold active:scale-95 transition-transform"
          >
            Entendi, fechar
          </button>
        </div>
      </div>
    </div>
  );
};
