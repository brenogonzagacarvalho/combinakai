import {
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  updateDoc,
} from 'firebase/firestore';
import { db } from './config';
import { ClothingItem, Outfit, CalendarEntry } from '@/types/wardrobe';

/**
 * Strips all undefined properties from objects to prevent Firestore rejection
 */
export function sanitizeForFirestore<T>(data: T): T {
  if (data === null || data === undefined) {
    return data;
  }
  if (Array.isArray(data)) {
    return data.map((item) => sanitizeForFirestore(item)) as unknown as T;
  }
  if (typeof data === 'object') {
    const cleaned: Record<string, any> = {};
    for (const [key, value] of Object.entries(data as Record<string, any>)) {
      if (value !== undefined) {
        cleaned[key] = sanitizeForFirestore(value);
      }
    }
    return cleaned as T;
  }
  return data;
}

export class FirebaseWardrobeService {
  /**
   * Stores garment images directly in Firestore (100% Free, no Storage / Credit Card required)
   */
  static async uploadGarmentImage(
    _userId: string,
    _itemId: string,
    imageDataUrl: string
  ): Promise<string> {
    // Returns the optimized base64 image data URL directly to be stored in Firestore
    return imageDataUrl;
  }

  /**
   * Saves a clothing item directly to Firestore
   */
  static async saveItem(userId: string, item: ClothingItem): Promise<void> {
    if (!db) return;
    try {
      const sanitized = sanitizeForFirestore({ ...item });
      // If originalImageUrl is identical to imageUrl or empty, don't waste Firestore document space
      if (sanitized.originalImageUrl === sanitized.imageUrl || !sanitized.originalImageUrl) {
        delete sanitized.originalImageUrl;
      }
      const itemRef = doc(db, 'users', userId, 'wardrobe', item.id);
      await setDoc(itemRef, sanitized);
    } catch (err: any) {
      console.error('Error saving item to Firestore:', err?.code || err?.message || err);
      throw err;
    }
  }

  /**
   * Updates fields of an item in Firestore
   */
  static async updateItem(
    userId: string,
    itemId: string,
    updates: Partial<ClothingItem>
  ): Promise<void> {
    if (!db) return;
    try {
      const sanitized = sanitizeForFirestore({ ...updates });
      const itemRef = doc(db, 'users', userId, 'wardrobe', itemId);
      await updateDoc(itemRef, sanitized);
    } catch (err: any) {
      console.error('Error updating item in Firestore:', err?.code || err?.message || err);
      throw err;
    }
  }

  /**
   * Deletes an item from Firestore
   */
  static async deleteItem(userId: string, itemId: string): Promise<void> {
    if (!db) return;
    try {
      const itemRef = doc(db, 'users', userId, 'wardrobe', itemId);
      await deleteDoc(itemRef);
    } catch (err) {
      console.error('Error deleting item from Firestore:', err);
      throw err;
    }
  }

  /**
   * Fetches all wardrobe items for a user from Firestore
   */
  static async loadWardrobe(userId: string): Promise<ClothingItem[]> {
    if (!db) return [];
    try {
      const colRef = collection(db, 'users', userId, 'wardrobe');
      const snapshot = await getDocs(colRef);
      const items: ClothingItem[] = [];
      snapshot.forEach((d) => items.push(d.data() as ClothingItem));
      return items;
    } catch (err) {
      console.error('Error loading wardrobe from Firestore:', err);
      return [];
    }
  }

  /**
   * Saves a favored outfit to Firestore
   */
  static async saveOutfit(userId: string, outfit: Outfit): Promise<void> {
    if (!db) return;
    try {
      const sanitized = sanitizeForFirestore({ ...outfit });
      const outfitRef = doc(db, 'users', userId, 'outfits', outfit.id);
      await setDoc(outfitRef, sanitized);
    } catch (err) {
      console.error('Error saving outfit to Firestore:', err);
    }
  }

  /**
   * Removes a saved outfit from Firestore
   */
  static async removeOutfit(userId: string, outfitId: string): Promise<void> {
    if (!db) return;
    try {
      const outfitRef = doc(db, 'users', userId, 'outfits', outfitId);
      await deleteDoc(outfitRef);
    } catch (err) {
      console.error('Error removing outfit from Firestore:', err);
    }
  }

  /**
   * Loads all saved outfits from Firestore
   */
  static async loadSavedOutfits(userId: string): Promise<Outfit[]> {
    if (!db) return [];
    try {
      const colRef = collection(db, 'users', userId, 'outfits');
      const snapshot = await getDocs(colRef);
      const outfits: Outfit[] = [];
      snapshot.forEach((d) => outfits.push(d.data() as Outfit));
      return outfits;
    } catch (err) {
      console.error('Error loading outfits from Firestore:', err);
      return [];
    }
  }

  /**
   * Saves weekly calendar entries to Firestore
   */
  static async saveCalendar(userId: string, entries: CalendarEntry[]): Promise<void> {
    if (!db) return;
    try {
      const sanitized = sanitizeForFirestore(entries);
      const calRef = doc(db, 'users', userId, 'settings', 'calendar');
      await setDoc(calRef, { entries: sanitized });
    } catch (err) {
      console.error('Error saving calendar to Firestore:', err);
    }
  }

  /**
   * Loads weekly calendar from Firestore
   */
  static async loadCalendar(userId: string): Promise<CalendarEntry[]> {
    if (!db) return [];
    try {
      const colRef = collection(db, 'users', userId, 'calendar');
      const snapshot = await getDocs(colRef);
      const entries: CalendarEntry[] = [];
      snapshot.forEach((d) => entries.push(d.data() as CalendarEntry));
      return entries;
    } catch (err) {
      console.error('Error loading calendar from Firestore:', err);
      return [];
    }
  }
}
