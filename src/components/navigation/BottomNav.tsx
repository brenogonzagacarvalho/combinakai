'use client';

import React from 'react';
import { Home, Shirt, Sparkles, Heart, User } from 'lucide-react';

export type NavTab = 'home' | 'wardrobe' | 'create' | 'saved' | 'profile';

interface BottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  savedCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  savedCount = 0,
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 max-w-md mx-auto glass-nav transition-all duration-200">
      <div className="flex items-center justify-around px-2 pt-2.5 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        {/* Início */}
        <button
          onClick={() => onTabChange('home')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
            activeTab === 'home'
              ? 'text-[#111110] font-medium'
              : 'text-[#8A8780] hover:text-[#4A4843]'
          }`}
        >
          <Home
            size={22}
            strokeWidth={activeTab === 'home' ? 2.3 : 1.7}
            className="transition-transform active:scale-90"
          />
          <span className="text-[10px] mt-1 tracking-tight">Início</span>
        </button>

        {/* Guarda-Roupa */}
        <button
          onClick={() => onTabChange('wardrobe')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
            activeTab === 'wardrobe'
              ? 'text-[#111110] font-medium'
              : 'text-[#8A8780] hover:text-[#4A4843]'
          }`}
        >
          <Shirt
            size={22}
            strokeWidth={activeTab === 'wardrobe' ? 2.3 : 1.7}
            className="transition-transform active:scale-90"
          />
          <span className="text-[10px] mt-1 tracking-tight">Armário</span>
        </button>

        {/* Center CTA: Criar Look */}
        <button
          onClick={() => onTabChange('create')}
          aria-label="Criar Look"
          className="flex flex-col items-center justify-center -mt-6 group focus:outline-none"
        >
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#242424] via-[#151515] to-[#0A0A0A] text-[#E8D4B8] flex items-center justify-center shadow-lg shadow-black/25 ring-4 ring-[#FBF9F5] transition-transform active:scale-95 group-hover:scale-105">
            <Sparkles size={24} className="text-[#E8D4B8] animate-pulse" />
          </div>
          <span className="text-[10px] font-semibold text-[#111110] mt-1 tracking-tight">
            Criar Look
          </span>
        </button>

        {/* Salvos */}
        <button
          onClick={() => onTabChange('saved')}
          className={`flex flex-col items-center justify-center flex-1 py-1 relative transition-all ${
            activeTab === 'saved'
              ? 'text-[#111110] font-medium'
              : 'text-[#8A8780] hover:text-[#4A4843]'
          }`}
        >
          <div className="relative">
            <Heart
              size={22}
              strokeWidth={activeTab === 'saved' ? 2.3 : 1.7}
              className={`transition-transform active:scale-90 ${
                activeTab === 'saved' ? 'fill-[#111110]' : ''
              }`}
            />
            {savedCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-[#C29F68] text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {savedCount > 9 ? '9+' : savedCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-1 tracking-tight">Salvos</span>
        </button>

        {/* Perfil / Ajustes */}
        <button
          onClick={() => onTabChange('profile')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all ${
            activeTab === 'profile'
              ? 'text-[#111110] font-medium'
              : 'text-[#8A8780] hover:text-[#4A4843]'
          }`}
        >
          <User
            size={22}
            strokeWidth={activeTab === 'profile' ? 2.3 : 1.7}
            className="transition-transform active:scale-90"
          />
          <span className="text-[10px] mt-1 tracking-tight">Perfil</span>
        </button>
      </div>
    </nav>
  );
};
