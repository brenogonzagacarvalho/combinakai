'use client';

import React from 'react';
import { Camera, Sparkles, Smartphone, Cloud } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useWardrobe } from '@/context/WardrobeContext';

interface TopBarProps {
  onAddClick: () => void;
  onPwaClick: () => void;
  onAuthClick: () => void;
  wardrobeCount: number;
}

export const TopBar: React.FC<TopBarProps> = ({
  onAddClick,
  onPwaClick,
  onAuthClick,
  wardrobeCount,
}) => {
  const { user } = useAuth();
  const { isSyncingCloud } = useWardrobe();

  return (
    <header className="sticky top-0 z-30 w-full bg-[#FBF9F5]/90 backdrop-blur-md border-b border-[#EAE5DC]/80 px-4 pt-safe pb-2.5 flex items-center justify-between transition-all">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-[#18181B] flex items-center justify-center text-[#E5C799] shadow-sm">
          <Sparkles size={16} />
        </div>
        <div>
          <h1 className="font-serif text-lg font-bold tracking-tight text-[#111110] leading-none">
            CombinaKai
          </h1>
          <p className="text-[10px] text-[#78756E] tracking-wider uppercase font-medium mt-0.5">
            Personal Stylist IA
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Firebase Cloud Sync Button */}
        <button
          onClick={onAuthClick}
          title={user ? 'Armário conectado à nuvem' : 'Sincronizar armário na nuvem'}
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-semibold transition-all active:scale-95 ${
            user
              ? 'bg-[#2F855A]/15 text-[#2F855A] border border-[#2F855A]/30'
              : 'bg-[#C29F68]/15 text-[#8C6D38] border border-[#C29F68]/30 hover:bg-[#C29F68]/25'
          }`}
        >
          <Cloud size={13} className={isSyncingCloud ? 'animate-bounce text-[#C29F68]' : ''} />
          <span className="text-[11px]">
            {isSyncingCloud ? 'Salvando...' : user ? 'Nuvem OK' : 'Salvar Nuvem'}
          </span>
        </button>

        {/* PWA iOS Install helper */}
        <button
          onClick={onPwaClick}
          title="Instalar no iPhone"
          aria-label="Como instalar no iPhone"
          className="w-8 h-8 rounded-full bg-[#F2EDE4] text-[#4A4843] flex items-center justify-center hover:bg-[#EAE3D6] transition-colors"
        >
          <Smartphone size={15} />
        </button>

        {/* Quick Add Piece */}
        <button
          onClick={onAddClick}
          className="flex items-center gap-1.5 bg-[#18181B] text-[#FBF9F5] hover:bg-[#2C2C30] active:scale-95 transition-all text-xs font-medium px-3 py-1.5 rounded-full shadow-sm"
        >
          <Camera size={14} className="text-[#E5C799]" />
          <span>+ Peça</span>
        </button>
      </div>
    </header>
  );
};
