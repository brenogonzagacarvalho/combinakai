'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
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
  lastSyncTime: Date | null;

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

  // Cloud & Backup Actions
  syncNow: () => Promise<void>;
  exportBackup: () => void;
  importBackup: (fileContent: string) => Promise<{ success: boolean; count: number; error?: string }>;
}

const WardrobeContext = createContext<WardrobeContextType | undefined>(undefined);

const STORAGE_KEYS = {
  WARDROBE: 'combinakai_wardrobe_v2',
  SAVED_OUTFITS: 'combinakai_saved_outfits_v2',
  CALENDAR: 'combinakai_calendar_v2',
  DISLIKED: 'combinakai_disliked_v2',
  IS_DEMO: 'combinakai_is_demo_v2',
};

/**
 * Resilient localStorage writer that protects against QuotaExceededError
 */
function safeSaveToLocalStorage(key: string, data: any): boolean {
  if (typeof window === 'undefined') return false;
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (err: any) {
    console.warn(`LocalStorage quota exceeded or write failed for ${key}:`, err?.name, err?.message);
    // If quota exceeded, try stripping originalImageUrl to save massive amount of memory
    if (key === STORAGE_KEYS.WARDROBE && Array.isArray(data)) {
      try {
        const optimized = data.map((item: ClothingItem) => {
          const copy = { ...item };
          if (copy.originalImageUrl) delete copy.originalImageUrl;
          return copy;
        });
        localStorage.setItem(key, JSON.stringify(optimized));
        console.info('Wardrobe successfully saved with lightweight optimized images!');
        return true;
      } catch (fallbackErr) {
        console.error('Critical: LocalStorage full even after stripping raw images:', fallbackErr);
      }
    }
    return false;
  }
}

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
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  const isSyncingRef = useRef(false);
  const lastSyncedUserRef = useRef<string | null>(null);

  // Initialize from LocalStorage or Load Demo Wardrobe
  useEffect(() => {
    try {
      const storedWardrobe =
        localStorage.getItem(STORAGE_KEYS.WARDROBE) ||
        localStorage.getItem('combinakai_wardrobe_v1') ||
        localStorage.getItem('combinakai_wardrobe');

      const storedOutfits =
        localStorage.getItem(STORAGE_KEYS.SAVED_OUTFITS) ||
        localStorage.getItem('combinakai_saved_outfits_v1') ||
        localStorage.getItem('combinakai_saved_outfits');

      const storedCalendar =
        localStorage.getItem(STORAGE_KEYS.CALENDAR) ||
        localStorage.getItem('combinakai_calendar_v1') ||
        localStorage.getItem('combinakai_calendar');

      const storedDisliked =
        localStorage.getItem(STORAGE_KEYS.DISLIKED) ||
        localStorage.getItem('combinakai_disliked_v1');

      const storedIsDemo =
        localStorage.getItem(STORAGE_KEYS.IS_DEMO) ||
        localStorage.getItem('combinakai_is_demo_v1');

      if (storedWardrobe) {
        const parsedItems: ClothingItem[] = JSON.parse(storedWardrobe);
        const sanitized = parsedItems.map(autoSanitizeItem);
        setWardrobe(sanitized);
        // If user already has 15+ items, it's definitely a customized wardrobe
        const isActuallyDemo = sanitized.length <= 14 && storedIsDemo === 'true';
        setIsDemoActive(isActuallyDemo);
        safeSaveToLocalStorage(STORAGE_KEYS.WARDROBE, sanitized);
      } else {
        // First access: load mock starter wardrobe so user can experience the app immediately!
        setWardrobe(INITIAL_MOCK_WARDROBE);
        setIsDemoActive(true);
        safeSaveToLocalStorage(STORAGE_KEYS.WARDROBE, INITIAL_MOCK_WARDROBE);
        safeSaveToLocalStorage(STORAGE_KEYS.IS_DEMO, 'true');
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

  // Safe Non-Destructive Sync with Firebase Firestore
  const syncNow = useCallback(async () => {
    if (!user || isSyncingRef.current) return;
    isSyncingRef.current = true;
    setIsSyncingCloud(true);
    try {
      const cloudItems = await FirebaseWardrobeService.loadWardrobe(user.uid);
      const cloudOutfits = await FirebaseWardrobeService.loadSavedOutfits(user.uid);
      const cloudCalendar = await FirebaseWardrobeService.loadCalendar(user.uid);

      // Get latest local items from storage as safety buffer
      const rawStored =
        localStorage.getItem(STORAGE_KEYS.WARDROBE) ||
        localStorage.getItem('combinakai_wardrobe_v1') ||
        localStorage.getItem('combinakai_wardrobe');
      let localItems: ClothingItem[] = [];
      try {
        localItems = rawStored ? JSON.parse(rawStored) : [];
      } catch {
        localItems = [];
      }

      // 1. NON-DESTRUCTIVE WARDROBE MERGE (NEVER OVERWRITE USER LOCAL PHOTOS)
      const itemMap = new Map<string, ClothingItem>();
      // First, preserve all local items (user's real photos take priority!)
      localItems.forEach((li) => itemMap.set(li.id, li));

      // Then, add any cloud items not already present locally
      cloudItems.forEach((ci) => {
        if (!itemMap.has(ci.id)) {
          itemMap.set(ci.id, ci);
        } else {
          // If local is missing image but cloud has it, augment
          const localItem = itemMap.get(ci.id)!;
          if (!localItem.imageUrl && ci.imageUrl) {
            itemMap.set(ci.id, { ...localItem, imageUrl: ci.imageUrl });
          }
        }
      });

      // Upload any local items missing in the cloud to Firestore
      const cloudIdSet = new Set(cloudItems.map((ci) => ci.id));
      for (const li of localItems) {
        if (!cloudIdSet.has(li.id)) {
          try {
            await FirebaseWardrobeService.saveItem(user.uid, li);
          } catch (e: any) {
            console.warn(`Could not save item ${li.id} to cloud during sync:`, e?.code || e?.message);
          }
        }
      }

      const mergedItems = Array.from(itemMap.values());
      setWardrobe(mergedItems);
      safeSaveToLocalStorage(STORAGE_KEYS.WARDROBE, mergedItems);
      setIsDemoActive(false);
      safeSaveToLocalStorage(STORAGE_KEYS.IS_DEMO, 'false');

      // 2. NON-DESTRUCTIVE OUTFITS MERGE
      const outfitMap = new Map<string, Outfit>();
      const rawOutfits = localStorage.getItem(STORAGE_KEYS.SAVED_OUTFITS);
      const localOutfits: Outfit[] = rawOutfits ? JSON.parse(rawOutfits) : [];
      localOutfits.forEach((lo) => outfitMap.set(lo.id, lo));
      cloudOutfits.forEach((co) => outfitMap.set(co.id, co));

      for (const lo of localOutfits) {
        if (!cloudOutfits.some((co) => co.id === lo.id)) {
          try {
            await FirebaseWardrobeService.saveOutfit(user.uid, lo);
          } catch (e) {
            console.warn('Error saving outfit to cloud:', e);
          }
        }
      }
      const mergedOutfits = Array.from(outfitMap.values());
      setSavedOutfits(mergedOutfits);
      safeSaveToLocalStorage(STORAGE_KEYS.SAVED_OUTFITS, mergedOutfits);

      // 3. CALENDAR MERGE
      const calMap = new Map<string, CalendarEntry>();
      const rawCal = localStorage.getItem(STORAGE_KEYS.CALENDAR);
      const localCal: CalendarEntry[] = rawCal ? JSON.parse(rawCal) : [];
      localCal.forEach((lc) => calMap.set(lc.id, lc));
      cloudCalendar.forEach((cc) => calMap.set(cc.id, cc));
      const mergedCal = Array.from(calMap.values());
      setCalendarEntries(mergedCal);
      safeSaveToLocalStorage(STORAGE_KEYS.CALENDAR, mergedCal);
      try {
        await FirebaseWardrobeService.saveCalendar(user.uid, mergedCal);
      } catch (e) {
        console.warn('Error saving calendar to cloud:', e);
      }

      setLastSyncTime(new Date());
    } catch (err) {
      console.error('Firebase sync error:', err);
    } finally {
      isSyncingRef.current = false;
      setIsSyncingCloud(false);
    }
  }, [user]);

  // Auto-sync ONCE whenever a user logs in
  useEffect(() => {
    if (user && isLoaded) {
      if (lastSyncedUserRef.current !== user.uid) {
        lastSyncedUserRef.current = user.uid;
        syncNow().catch((e) => console.warn('Auto sync error:', e));
      }
    } else if (!user) {
      lastSyncedUserRef.current = null;
    }
  }, [user, isLoaded, syncNow]);

  // 1-Click JSON Backup Export (Downloads directly to phone or PC)
  const exportBackup = useCallback(() => {
    const rawStored =
      localStorage.getItem(STORAGE_KEYS.WARDROBE) ||
      localStorage.getItem('combinakai_wardrobe_v1') ||
      localStorage.getItem('combinakai_wardrobe');
    const itemsToExport: ClothingItem[] = rawStored ? JSON.parse(rawStored) : wardrobe;

    const backupData = {
      app: 'CombinaKai',
      version: '2.0',
      exportedAt: new Date().toISOString(),
      itemCount: itemsToExport.length,
      wardrobe: itemsToExport,
      savedOutfits,
      calendarEntries,
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `combinakai_backup_${itemsToExport.length}_pecas_${new Date().toISOString().slice(0, 10)}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }, [wardrobe, savedOutfits, calendarEntries]);

  // Import JSON Backup
  const importBackup = useCallback(
    async (fileContent: string): Promise<{ success: boolean; count: number; error?: string }> => {
      try {
        const parsed = JSON.parse(fileContent);
        const importedItems: ClothingItem[] = parsed.wardrobe || (Array.isArray(parsed) ? parsed : []);
        if (!importedItems || importedItems.length === 0) {
          return { success: false, count: 0, error: 'O arquivo não contém peças válidas.' };
        }

        const sanitized = importedItems.map(autoSanitizeItem);
        const map = new Map<string, ClothingItem>();
        wardrobe.forEach((i) => map.set(i.id, i));
        sanitized.forEach((i) => map.set(i.id, i));

        const merged = Array.from(map.values());
        setWardrobe(merged);
        safeSaveToLocalStorage(STORAGE_KEYS.WARDROBE, merged);
        setIsDemoActive(false);
        safeSaveToLocalStorage(STORAGE_KEYS.IS_DEMO, 'false');

        if (user) {
          for (const item of sanitized) {
            try {
              await FirebaseWardrobeService.saveItem(user.uid, item);
            } catch (e) {
              console.warn('Error saving imported item to cloud:', e);
            }
          }
        }

        return { success: true, count: sanitized.length };
      } catch (err: any) {
        return { success: false, count: 0, error: err.message || 'Arquivo inválido.' };
      }
    },
    [wardrobe, user]
  );

  // Save changes to LocalStorage
  const syncWardrobe = useCallback((newItems: ClothingItem[]) => {
    setWardrobe(newItems);
    safeSaveToLocalStorage(STORAGE_KEYS.WARDROBE, newItems);
  }, []);

  const syncSavedOutfits = useCallback((newOutfits: Outfit[]) => {
    setSavedOutfits(newOutfits);
    safeSaveToLocalStorage(STORAGE_KEYS.SAVED_OUTFITS, newOutfits);
  }, []);

  const syncCalendar = useCallback((newEntries: CalendarEntry[]) => {
    setCalendarEntries(newEntries);
    safeSaveToLocalStorage(STORAGE_KEYS.CALENDAR, newEntries);
  }, []);

  const syncDisliked = useCallback((newIds: string[]) => {
    setDislikedOutfitIds(newIds);
    safeSaveToLocalStorage(STORAGE_KEYS.DISLIKED, newIds);
  }, []);

  // Item Actions
  const addItem = useCallback(
    async (item: ClothingItem) => {
      const finalItem = { ...item };
      setIsDemoActive(false);
      safeSaveToLocalStorage(STORAGE_KEYS.IS_DEMO, 'false');

      // 1. Immediately save to local state and local storage with quota protection
      setWardrobe((prev) => {
        const updated = [finalItem, ...prev.filter((i) => i.id !== finalItem.id)];
        safeSaveToLocalStorage(STORAGE_KEYS.WARDROBE, updated);
        return updated;
      });

      // 2. If user is authenticated with Firebase, save directly to Firestore
      if (user) {
        try {
          await FirebaseWardrobeService.saveItem(user.uid, finalItem);
        } catch (err: any) {
          console.warn('Firebase save item warning (local item safely preserved):', err?.code || err?.message || err);
        }
      }
    },
    [user]
  );

  const updateItem = useCallback(
    async (id: string, updates: Partial<ClothingItem>) => {
      setWardrobe((prev) => {
        const updated = prev.map((item) => (item.id === id ? { ...item, ...updates } : item));
        safeSaveToLocalStorage(STORAGE_KEYS.WARDROBE, updated);
        return updated;
      });

      if (user) {
        try {
          await FirebaseWardrobeService.updateItem(user.uid, id, updates);
        } catch (err: any) {
          console.warn('Firebase update item warning:', err?.code || err?.message || err);
        }
      }
    },
    [user]
  );

  const deleteItem = useCallback(
    async (id: string) => {
      setWardrobe((prev) => {
        const updated = prev.filter((item) => item.id !== id);
        safeSaveToLocalStorage(STORAGE_KEYS.WARDROBE, updated);
        return updated;
      });

      if (user) {
        try {
          await FirebaseWardrobeService.deleteItem(user.uid, id);
        } catch (err: any) {
          console.warn('Firebase delete item warning:', err?.code || err?.message || err);
        }
      }
    },
    [user]
  );

  const toggleItemFavorite = useCallback(
    (id: string) => {
      setWardrobe((prev) => {
        const updated = prev.map((item) =>
          item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
        );
        safeSaveToLocalStorage(STORAGE_KEYS.WARDROBE, updated);
        const target = updated.find((i) => i.id === id);
        if (user && target) {
          FirebaseWardrobeService.updateItem(user.uid, id, { isFavorite: target.isFavorite }).catch((e) =>
            console.warn('Favorite sync warning:', e)
          );
        }
        return updated;
      });
    },
    [user]
  );

  const incrementWearCount = useCallback(
    (itemId: string) => {
      setWardrobe((prev) => {
        const updated = prev.map((item) =>
          item.id === itemId
            ? {
                ...item,
                wearCount: (item.wearCount || 0) + 1,
                lastWorn: new Date().toISOString(),
              }
            : item
        );
        safeSaveToLocalStorage(STORAGE_KEYS.WARDROBE, updated);
        const target = updated.find((i) => i.id === itemId);
        if (user && target) {
          FirebaseWardrobeService.updateItem(user.uid, itemId, {
            wearCount: target.wearCount,
            lastWorn: target.lastWorn,
          }).catch((e) => console.warn('Wear count sync warning:', e));
        }
        return updated;
      });
    },
    [user]
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
    safeSaveToLocalStorage(STORAGE_KEYS.WARDROBE, INITIAL_MOCK_WARDROBE);
    safeSaveToLocalStorage(STORAGE_KEYS.IS_DEMO, 'true');
  }, []);

  const clearWardrobe = useCallback(() => {
    setWardrobe([]);
    setSavedOutfits([]);
    setCalendarEntries([]);
    setIsDemoActive(false);
    safeSaveToLocalStorage(STORAGE_KEYS.WARDROBE, []);
    safeSaveToLocalStorage(STORAGE_KEYS.SAVED_OUTFITS, []);
    safeSaveToLocalStorage(STORAGE_KEYS.CALENDAR, []);
    safeSaveToLocalStorage(STORAGE_KEYS.IS_DEMO, 'false');
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
        lastSyncTime,
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
        syncNow,
        exportBackup,
        importBackup,
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
