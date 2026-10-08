'use client';

import React, { useState } from 'react';
import { useWardrobe } from '@/context/WardrobeContext';
import { ClothingItem, Outfit } from '@/types/wardrobe';
import { TopBar } from '@/components/navigation/TopBar';
import { BottomNav, NavTab } from '@/components/navigation/BottomNav';

// Views
import { HomeTab } from '@/components/views/HomeTab';
import { WardrobeTab } from '@/components/views/WardrobeTab';
import { SavedTab } from '@/components/views/SavedTab';
import { ProfileTab } from '@/components/views/ProfileTab';

// Modals
import { AddItemModal } from '@/components/modals/AddItemModal';
import { ItemDetailModal } from '@/components/modals/ItemDetailModal';
import { CreateOutfitModal } from '@/components/modals/CreateOutfitModal';
import { OutfitResultModal } from '@/components/modals/OutfitResultModal';
import { PwaInstallGuideModal } from '@/components/modals/PwaInstallGuideModal';
import { AuthModal } from '@/components/modals/AuthModal';

export default function App() {
  const { wardrobe, addItem, savedOutfits, isLoaded } = useWardrobe();

  // Navigation State
  const [activeTab, setActiveTab] = useState<NavTab>('home');

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ClothingItem | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [generatedOutfits, setGeneratedOutfits] = useState<Outfit[]>([]);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [isPwaModalOpen, setIsPwaModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [anchorItemForCreate, setAnchorItemForCreate] = useState<ClothingItem | undefined>(undefined);

  const handleTabChange = (tab: NavTab) => {
    if (tab === 'create') {
      setAnchorItemForCreate(undefined);
      setIsCreateModalOpen(true);
    } else {
      setActiveTab(tab);
    }
  };

  const handleOpenOutfitResults = (outfits: Outfit[]) => {
    if (outfits.length > 0) {
      setGeneratedOutfits(outfits);
      setIsResultModalOpen(true);
    }
  };

  const handleItemAdded = async (newItem: ClothingItem) => {
    await addItem(newItem);
    setSelectedItem(newItem);
  };

  // Skeleton loading while hydrating
  if (!isLoaded) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-[#FBF9F5] p-6 space-y-4">
        <div className="w-12 h-12 rounded-full border-3 border-[#C29F68]/30 border-t-[#C29F68] animate-spin" />
        <div className="text-center space-y-1">
          <p className="font-serif font-bold text-lg text-[#111110]">CombinaKai</p>
          <p className="text-xs text-[#78756E]">Carregando seu stylist pessoal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen relative bg-[#FBF9F5]">
      {/* Top Header */}
      <TopBar
        onAddClick={() => setIsAddModalOpen(true)}
        onPwaClick={() => setIsPwaModalOpen(true)}
        onAuthClick={() => setIsAuthModalOpen(true)}
        wardrobeCount={wardrobe.length}
      />

      {/* Main Tab Content */}
      <main className="flex-1">
        {activeTab === 'home' && (
          <HomeTab
            onOpenCreateModal={() => {
              setAnchorItemForCreate(undefined);
              setIsCreateModalOpen(true);
            }}
            onOpenAddModal={() => setIsAddModalOpen(true)}
            onSelectItem={(item) => setSelectedItem(item)}
            onOpenOutfitResults={handleOpenOutfitResults}
            onNavigateToWardrobe={() => setActiveTab('wardrobe')}
          />
        )}

        {activeTab === 'wardrobe' && (
          <WardrobeTab
            onSelectItem={(item) => setSelectedItem(item)}
            onOpenAddModal={() => setIsAddModalOpen(true)}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
          />
        )}

        {activeTab === 'saved' && (
          <SavedTab
            onOpenOutfitDetails={handleOpenOutfitResults}
            onNavigateToCreate={() => {
              setAnchorItemForCreate(undefined);
              setIsCreateModalOpen(true);
            }}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileTab
            onOpenPwaModal={() => setIsPwaModalOpen(true)}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
          />
        )}
      </main>

      {/* Bottom Navigation Bar */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={handleTabChange}
        savedCount={savedOutfits.length}
      />

      {/* MODALS */}
      {/* 1. Add Item with Camera/Gallery + AI Tagging */}
      <AddItemModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onItemAdded={handleItemAdded}
      />

      {/* 2. Item Detail + "O que combina com essa peça?" + Dress Transformations */}
      <ItemDetailModal
        item={selectedItem}
        isOpen={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        onOpenOutfitResults={handleOpenOutfitResults}
      />

      {/* 3. Create Outfit Assistant Wizard */}
      <CreateOutfitModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onOutfitsGenerated={handleOpenOutfitResults}
        initialAnchorItem={anchorItemForCreate}
      />

      {/* 4. Outfit Carousel Results + WhatsApp Share + Calendar */}
      <OutfitResultModal
        outfits={generatedOutfits}
        isOpen={isResultModalOpen}
        onClose={() => setIsResultModalOpen(false)}
        onRegenerate={() => {
          setIsResultModalOpen(false);
          setIsCreateModalOpen(true);
        }}
      />

      {/* 5. PWA iPhone Installation Guide */}
      <PwaInstallGuideModal
        isOpen={isPwaModalOpen}
        onClose={() => setIsPwaModalOpen(false)}
      />

      {/* 6. Firebase Cloud Sync & Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}
