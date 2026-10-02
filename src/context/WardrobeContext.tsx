'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { ClothingItem, Outfit, CalendarEntry } from '@/types/wardrobe';
import { INITIAL_MOCK_WARDROBE } from '@/data/mockWardrobe';
import { useAuth } from './AuthContext';
import { FirebaseWardrobeService } from '@/lib/firebase/wardrobeService';

interface WardrobeContextType {
  wardrobe: ClothingItem[];
  savedOutfits: Outfit[];
  calendarEntries: CalendarEntry[];
  dislikedOutfitIds: string[];
  isLoaded: boolean;
  isDemoActive: boolean;
  isSyncingCloud: boolean;

  // Actions
  addItem: (item: ClothingItem) => Promise<void>;
  updateItem: (id: string, updates: Partial<ClothingItem>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  toggleItemFavorite: (id: string) => void;
  incrementWearCount: (itemId: string) => void;

  saveOutfit: (outfit: Outfit) => Promise<void>;
  removeSavedOutfit: (outfitId: string) => Promise<void>;
  rateOutfit: (outfitId: string, feedback: 'like' | 'dislike') => void;

  scheduleOutfit: (dayLabel: string, outfit: Outfit) => Promise<void>;
  removeScheduledOutfit: (calendarEntryId: string) => Promise<void>;

  loadDemoWardrobe: () => void;
  clearWardrobe: () => void;
}

const WardrobeContext = createContext<WardrobeContextType | undefined>(undefined);

const STORAGE_KEYS = {
  WARDROBE: 'combinakai_wardrobe_v2',
  SAVED_OUTFITS: 'combinakai_saved_outfits_v2',
  CALENDAR: 'combinakai_calendar_v2',
  DISLIKED: 'combinakai_disliked_v2',
  IS_DEMO: 'combinakai_is_demo_v2',
};

function autoSanitizeItem(item: ClothingItem): ClothingItem {
  const nameLower = (item.name || '').toLowerCase();
  const subLower = (item.subCategory || '').toLowerCase();
  let updated = { ...item };

  // Shorts / Bermudas
  if (nameLower.includes('short') || nameLower.includes('bermuda')) {
    if (updated.category !== 'bottoms') updated.category = 'bottoms';
    if (!updated.subCategory || subLower.includes('camisa') || subLower.includes('vestido') || subLower.includes('casaco')) {
      updated.subCategory = nameLower.includes('short') ? 'Short Jeans' : 'Bermuda';
    }
  }
  // Jaquetas / Casacos / Blazers
  else if (nameLower.includes('jaqueta') || nameLower.includes('casaco') || nameLower.includes('casaquinho') || nameLower.includes('blazer')) {
    if (updated.category !== 'outerwear') updated.category = 'outerwear';
    if (!updated.subCategory || subLower.includes('calça') || subLower.includes('vestido') || subLower.includes('camisa')) {
      updated.subCategory = nameLower.includes('jaqueta') ? 'Jaqueta' : nameLower.includes('casaquinho') ? 'Casaquinho' : 'Casaco / Blazer';
    }
  }
  // Calças
  else if (nameLower.includes('calça')) {
    if (updated.category !== 'bottoms') updated.category = 'bottoms';
    if (!updated.subCategory || subLower.includes('camisa') || subLower.includes('vestido')) {
      updated.subCategory = 'Calça';
    }
  }
  // Vestidos
  else if (nameLower.includes('vestido')) {
    if (updated.category !== 'dresses') updated.category = 'dresses';
  }
  // Camisas / Camisetas / Tops
  else if (nameLower.includes('camisa') || nameLower.includes('camiseta') || nameLower.includes('blusa') || nameLower.includes('cropped')) {
    if (updated.category !== 'tops') updated.category = 'tops';
    if (nameLower.includes('camisa') && subLower.includes('camiseta básica')) {
      updated.subCategory = 'Camisa';
    }
  }

  return updated;
}

export const WardrobeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  const [wardrobe, setWardrobe] = useState<ClothingItem[]>([]);
  const [savedOutfits, setSavedOutfits] = useState<Outfit[]>([]);
  const [calendarEntries, setCalendarEntries] = useState<CalendarEntry[]>([]);
  const [dislikedOutfitIds, setDislikedOutfitIds] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isDemoActive, setIsDemoActive] = useState(true);
  const [isSyncingCloud, setIsSyncingCloud] = useState(false);

  // Initialize from LocalStorage or Load Demo Wardrobe
  useEffect(() => {
    try {
      const storedWardrobe = localStorage.getItem(STORAGE_KEYS.WARDROBE);
      const storedOutfits = localStorage.getItem(STORAGE_KEYS.SAVED_OUTFITS);
      const storedCalendar = localStorage.getItem(STORAGE_KEYS.CALENDAR);
      const storedDisliked = localStorage.getItem(STORAGE_KEYS.DISLIKED);
      const storedIsDemo = localStorage.getItem(STORAGE_KEYS.IS_DEMO);

      if (storedWardrobe) {
        const parsedItems: ClothingItem[] = JSON.parse(storedWardrobe);
        const sanitized = parsedItems.map(autoSanitizeItem);
        setWardrobe(sanitized);
        setIsDemoActive(storedIsDemo === 'true');
        localStorage.setItem(STORAGE_KEYS.WARDROBE, JSON.stringify(sanitized));
      } else {
        // First access: load mock starter wardrobe so user can experience the app immediately!
        setWardrobe(INITIAL_MOCK_WARDROBE);
        setIsDemoActive(true);
        localStorage.setItem(STORAGE_KEYS.WARDROBE, JSON.stringify(INITIAL_MOCK_WARDROBE));
        localStorage.setItem(STORAGE_KEYS.IS_DEMO, 'true');
      }

      if (storedOutfits) setSavedOutfits(JSON.parse(storedOutfits));
      if (storedCalendar) setCalendarEntries(JSON.parse(storedCalendar));
      if (storedDisliked) setDislikedOutfitIds(JSON.parse(storedDisliked));
    } catch (e) {
      console.error('Failed to load wardrobe data:', e);
      setWardrobe(INITIAL_MOCK_WARDROBE);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Sync with Firebase Firestore whenever user logs in
  useEffect(() => {
    if (!user) return;

    const syncWithFirebase = async () => {
      setIsSyncingCloud(true);
      try {
        const cloudItems = await FirebaseWardrobeService.loadWardrobe(user.uid);
        const cloudOutfits = await FirebaseWardrobeService.loadSavedOutfits(user.uid);
        const cloudCalendar = await FirebaseWardrobeService.loadCalendar(user.uid);

        if (cloudItems.length > 0) {
          // Cloud has existing items: hydrate local state with cloud state
          setWardrobe(cloudItems);
          localStorage.setItem(STORAGE_KEYS.WARDROBE, JSON.stringify(cloudItems));
          setIsDemoActive(false);
        } else if (wardrobe.length > 0 && !isDemoActive) {
          // Migrate local custom wardrobe to Firebase Cloud
          for (const item of wardrobe) {
            let finalImageUrl = item.imageUrl;
            if (item.imageUrl.startsWith('data:image')) {
              finalImageUrl = await FirebaseWardrobeService.uploadGarmentImage(user.uid, item.id, item.imageUrl);
            }
            await FirebaseWardrobeService.saveItem(user.uid, { ...item, imageUrl: finalImageUrl });
          }
        }

        if (cloudOutfits.length > 0) {
          setSavedOutfits(cloudOutfits);
          localStorage.setItem(STORAGE_KEYS.SAVED_OUTFITS, JSON.stringify(cloudOutfits));
        }

        if (cloudCalendar.length > 0) {
          setCalendarEntries(cloudCalendar);
          localStorage.setItem(STORAGE_KEYS.CALENDAR, JSON.stringify(cloudCalendar));
        }
      } catch (err) {
        console.error('Firebase sync error:', err);
      } finally {
        setIsSyncingCloud(false);
      }
    };

    syncWithFirebase();
  }, [user]);

  // Save changes to LocalStorage
  const syncWardrobe = useCallback((newItems: ClothingItem[]) => {
    setWardrobe(newItems);
    localStorage.setItem(STORAGE_KEYS.WARDROBE, JSON.stringify(newItems));
  }, []);

  const syncSavedOutfits = useCallback((newOutfits: Outfit[]) => {
    setSavedOutfits(newOutfits);
    localStorage.setItem(STORAGE_KEYS.SAVED_OUTFITS, JSON.stringify(newOutfits));
  }, []);

  const syncCalendar = useCallback((newEntries: CalendarEntry[]) => {
    setCalendarEntries(newEntries);
    localStorage.setItem(STORAGE_KEYS.CALENDAR, JSON.stringify(newEntries));
  }, []);

  const syncDisliked = useCallback((newIds: string[]) => {
    setDislikedOutfitIds(newIds);
    localStorage.setItem(STORAGE_KEYS.DISLIKED, JSON.stringify(newIds));
  }, []);

  // Item Actions
  const addItem = useCallback(
    async (item: ClothingItem) => {
      let finalItem = { ...item };
      const updated = [finalItem, ...wardrobe];
      setIsDemoActive(false);
      localStorage.setItem(STORAGE_KEYS.IS_DEMO, 'false');
      syncWardrobe(updated);

      // If user is authenticated with Firebase, upload image to Cloud Storage & save to Firestore
      if (user) {
        try {
          if (finalItem.imageUrl.startsWith('data:image')) {
            const storageUrl = await FirebaseWardrobeService.uploadGarmentImage(
              user.uid,
              finalItem.id,
              finalItem.imageUrl
            );
            finalItem.imageUrl = storageUrl;
            // update in state
            const updatedWithUrl = updated.map((i) => (i.id === finalItem.id ? finalItem : i));
            syncWardrobe(updatedWithUrl);
          }
          await FirebaseWardrobeService.saveItem(user.uid, finalItem);
        } catch (err) {
          console.error('Failed to sync added item with Firebase:', err);
        }
      }
    },
    [wardrobe, syncWardrobe, user]
  );

  const updateItem = useCallback(
    async (id: string, updates: Partial<ClothingItem>) => {
      const updated = wardrobe.map((item) => (item.id === id ? { ...item, ...updates } : item));
      syncWardrobe(updated);

      if (user) {
        try {
          await FirebaseWardrobeService.updateItem(user.uid, id, updates);
        } catch (err) {
          console.error('Failed to sync updated item with Firebase:', err);
        }
      }
    },
    [wardrobe, syncWardrobe, user]
  );

  const deleteItem = useCallback(
    async (id: string) => {
      const updated = wardrobe.filter((item) => item.id !== id);
      syncWardrobe(updated);

      if (user) {
        try {
          await FirebaseWardrobeService.deleteItem(user.uid, id);
        } catch (err) {
          console.error('Failed to sync deleted item with Firebase:', err);
        }
      }
    },
    [wardrobe, syncWardrobe, user]
  );

  const toggleItemFavorite = useCallback(
    (id: string) => {
      const updated = wardrobe.map((item) =>
        item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
      );
      syncWardrobe(updated);
      const target = updated.find((i) => i.id === id);
      if (user && target) {
        FirebaseWardrobeService.updateItem(user.uid, id, { isFavorite: target.isFavorite });
      }
    },
    [wardrobe, syncWardrobe, user]
  );

  const incrementWearCount = useCallback(
    (itemId: string) => {
      const updated = wardrobe.map((item) =>
        item.id === itemId
          ? {
              ...item,
              wearCount: (item.wearCount || 0) + 1,
              lastWorn: new Date().toISOString(),
            }
          : item
      );
      syncWardrobe(updated);
      const target = updated.find((i) => i.id === itemId);
      if (user && target) {
        FirebaseWardrobeService.updateItem(user.uid, itemId, {
          wearCount: target.wearCount,
          lastWorn: target.lastWorn,
        });
      }
    },
    [wardrobe, syncWardrobe, user]
  );

  // Outfit Actions
  const saveOutfit = useCallback(
    async (outfit: Outfit) => {
      const exists = savedOutfits.some((o) => o.id === outfit.id);
      if (!exists) {
        const updated = [{ ...outfit, isFavorite: true }, ...savedOutfits];
        syncSavedOutfits(updated);
        outfit.items.forEach((i) => incrementWearCount(i.id));

        if (user) {
          await FirebaseWardrobeService.saveOutfit(user.uid, { ...outfit, isFavorite: true });
        }
      }
    },
    [savedOutfits, syncSavedOutfits, incrementWearCount, user]
  );

  const removeSavedOutfit = useCallback(
    async (outfitId: string) => {
      const updated = savedOutfits.filter((o) => o.id !== outfitId);
      syncSavedOutfits(updated);

      if (user) {
        await FirebaseWardrobeService.removeOutfit(user.uid, outfitId);
      }
    },
    [savedOutfits, syncSavedOutfits, user]
  );

  const rateOutfit = useCallback(
    (outfitId: string, feedback: 'like' | 'dislike') => {
      if (feedback === 'dislike') {
        const updated = [...dislikedOutfitIds, outfitId];
        syncDisliked(updated);
      }
    },
    [dislikedOutfitIds, syncDisliked]
  );

  // Calendar
  const scheduleOutfit = useCallback(
    async (dayLabel: string, outfit: Outfit) => {
      const entry: CalendarEntry = {
        id: `cal-${dayLabel}-${Date.now()}`,
        dayLabel,
        occasion: outfit.occasion,
        outfit,
      };
      const filtered = calendarEntries.filter((e) => e.dayLabel !== dayLabel);
      const updated = [...filtered, entry];
      syncCalendar(updated);

      if (user) {
        await FirebaseWardrobeService.saveCalendar(user.uid, updated);
      }
    },
    [calendarEntries, syncCalendar, user]
  );

  const removeScheduledOutfit = useCallback(
    async (calendarEntryId: string) => {
      const updated = calendarEntries.filter((e) => e.id !== calendarEntryId);
      syncCalendar(updated);

      if (user) {
        await FirebaseWardrobeService.saveCalendar(user.uid, updated);
      }
    },
    [calendarEntries, syncCalendar, user]
  );

  // Demo & Reset
  const loadDemoWardrobe = useCallback(() => {
    setWardrobe(INITIAL_MOCK_WARDROBE);
    setIsDemoActive(true);
    localStorage.setItem(STORAGE_KEYS.WARDROBE, JSON.stringify(INITIAL_MOCK_WARDROBE));
    localStorage.setItem(STORAGE_KEYS.IS_DEMO, 'true');
  }, []);

  const clearWardrobe = useCallback(() => {
    setWardrobe([]);
    setSavedOutfits([]);
    setCalendarEntries([]);
    setIsDemoActive(false);
    localStorage.setItem(STORAGE_KEYS.WARDROBE, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.SAVED_OUTFITS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.CALENDAR, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.IS_DEMO, 'false');
  }, []);

  return (
    <WardrobeContext.Provider
      value={{
        wardrobe,
        savedOutfits,
        calendarEntries,
        dislikedOutfitIds,
        isLoaded,
        isDemoActive,
        isSyncingCloud,
        addItem,
        updateItem,
        deleteItem,
        toggleItemFavorite,
        incrementWearCount,
        saveOutfit,
        removeSavedOutfit,
        rateOutfit,
        scheduleOutfit,
        removeScheduledOutfit,
        loadDemoWardrobe,
        clearWardrobe,
      }}
    >
      {children}
    </WardrobeContext.Provider>
  );
};

export const useWardrobe = () => {
  const context = useContext(WardrobeContext);
  if (!context) {
    throw new Error('useWardrobe must be used within a WardrobeProvider');
  }
  return context;
};
