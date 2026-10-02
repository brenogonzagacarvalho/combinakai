'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { ClothingItem, Outfit, CalendarEntry } from '@/types/wardrobe';
import { INITIAL_MOCK_WARDROBE } from '@/data/mockWardrobe';

interface WardrobeContextType {
  wardrobe: ClothingItem[];
  savedOutfits: Outfit[];
  calendarEntries: CalendarEntry[];
  dislikedOutfitIds: string[];
  isLoaded: boolean;
  isDemoActive: boolean;

  // Actions
  addItem: (item: ClothingItem) => void;
  updateItem: (id: string, updates: Partial<ClothingItem>) => void;
  deleteItem: (id: string) => void;
  toggleItemFavorite: (id: string) => void;
  incrementWearCount: (itemId: string) => void;

  saveOutfit: (outfit: Outfit) => void;
  removeSavedOutfit: (outfitId: string) => void;
  rateOutfit: (outfitId: string, feedback: 'like' | 'dislike') => void;

  scheduleOutfit: (dayLabel: string, outfit: Outfit) => void;
  removeScheduledOutfit: (calendarEntryId: string) => void;

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

export const WardrobeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wardrobe, setWardrobe] = useState<ClothingItem[]>([]);
  const [savedOutfits, setSavedOutfits] = useState<Outfit[]>([]);
  const [calendarEntries, setCalendarEntries] = useState<CalendarEntry[]>([]);
  const [dislikedOutfitIds, setDislikedOutfitIds] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isDemoActive, setIsDemoActive] = useState(true);

  // Initialize from LocalStorage or Load Demo Wardrobe
  useEffect(() => {
    try {
      const storedWardrobe = localStorage.getItem(STORAGE_KEYS.WARDROBE);
      const storedOutfits = localStorage.getItem(STORAGE_KEYS.SAVED_OUTFITS);
      const storedCalendar = localStorage.getItem(STORAGE_KEYS.CALENDAR);
      const storedDisliked = localStorage.getItem(STORAGE_KEYS.DISLIKED);
      const storedIsDemo = localStorage.getItem(STORAGE_KEYS.IS_DEMO);

      if (storedWardrobe) {
        setWardrobe(JSON.parse(storedWardrobe));
        setIsDemoActive(storedIsDemo === 'true');
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
    (item: ClothingItem) => {
      const updated = [item, ...wardrobe];
      setIsDemoActive(false);
      localStorage.setItem(STORAGE_KEYS.IS_DEMO, 'false');
      syncWardrobe(updated);
    },
    [wardrobe, syncWardrobe]
  );

  const updateItem = useCallback(
    (id: string, updates: Partial<ClothingItem>) => {
      const updated = wardrobe.map((item) => (item.id === id ? { ...item, ...updates } : item));
      syncWardrobe(updated);
    },
    [wardrobe, syncWardrobe]
  );

  const deleteItem = useCallback(
    (id: string) => {
      const updated = wardrobe.filter((item) => item.id !== id);
      syncWardrobe(updated);
    },
    [wardrobe, syncWardrobe]
  );

  const toggleItemFavorite = useCallback(
    (id: string) => {
      const updated = wardrobe.map((item) =>
        item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
      );
      syncWardrobe(updated);
    },
    [wardrobe, syncWardrobe]
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
    },
    [wardrobe, syncWardrobe]
  );

  // Outfit Actions
  const saveOutfit = useCallback(
    (outfit: Outfit) => {
      const exists = savedOutfits.some((o) => o.id === outfit.id);
      if (!exists) {
        const updated = [{ ...outfit, isFavorite: true }, ...savedOutfits];
        syncSavedOutfits(updated);
        // increment wear count for items
        outfit.items.forEach((i) => incrementWearCount(i.id));
      }
    },
    [savedOutfits, syncSavedOutfits, incrementWearCount]
  );

  const removeSavedOutfit = useCallback(
    (outfitId: string) => {
      const updated = savedOutfits.filter((o) => o.id !== outfitId);
      syncSavedOutfits(updated);
    },
    [savedOutfits, syncSavedOutfits]
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
    (dayLabel: string, outfit: Outfit) => {
      const entry: CalendarEntry = {
        id: `cal-${dayLabel}-${Date.now()}`,
        dayLabel,
        occasion: outfit.occasion,
        outfit,
      };
      // Replace existing for same day or append
      const filtered = calendarEntries.filter((e) => e.dayLabel !== dayLabel);
      syncCalendar([...filtered, entry]);
    },
    [calendarEntries, syncCalendar]
  );

  const removeScheduledOutfit = useCallback(
    (calendarEntryId: string) => {
      const updated = calendarEntries.filter((e) => e.id !== calendarEntryId);
      syncCalendar(updated);
    },
    [calendarEntries, syncCalendar]
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
