import {
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  updateDoc,
} from 'firebase/firestore';
import { ref, uploadString, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from './config';
import { ClothingItem, Outfit, CalendarEntry } from '@/types/wardrobe';

export class FirebaseWardrobeService {
  /**
   * Uploads a garment photo to Firebase Storage and returns the permanent CDN URL
   */
  static async uploadGarmentImage(
    userId: string,
    itemId: string,
    imageDataUrl: string
  ): Promise<string> {
    if (!storage) return imageDataUrl;

    try {
      // If it's an SVG data url from demo items, no need to upload
      if (imageDataUrl.startsWith('data:image/svg+xml')) {
        return imageDataUrl;
      }

      const storageRef = ref(storage, `users/${userId}/clothes/${itemId}.jpg`);
      await uploadString(storageRef, imageDataUrl, 'data_url');
      const downloadUrl = await getDownloadURL(storageRef);
      return downloadUrl;
    } catch (err) {
      console.error('Firebase Storage upload error:', err);
      // Fallback to original image data url if storage upload fails
      return imageDataUrl;
    }
  }

  /**
   * Saves a clothing item to Firestore
   */
  static async saveItem(userId: string, item: ClothingItem): Promise<void> {
    if (!db) return;
    try {
      const itemRef = doc(db, 'users', userId, 'wardrobe', item.id);
      await setDoc(itemRef, item);
    } catch (err) {
      console.error('Error saving item to Firestore:', err);
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
      const itemRef = doc(db, 'users', userId, 'wardrobe', itemId);
      await updateDoc(itemRef, updates);
    } catch (err) {
      console.error('Error updating item in Firestore:', err);
      throw err;
    }
  }

  /**
   * Deletes an item from Firestore and Storage
   */
  static async deleteItem(userId: string, itemId: string): Promise<void> {
    if (!db) return;
    try {
      const itemRef = doc(db, 'users', userId, 'wardrobe', itemId);
      await deleteDoc(itemRef);

      // Attempt to delete photo from storage
      if (storage) {
        try {
          const storageRef = ref(storage, `users/${userId}/clothes/${itemId}.jpg`);
          await deleteObject(storageRef);
        } catch {
          // Ignore if image was an external url or svg
        }
      }
    } catch (err) {
      console.error('Error deleting item from Firestore:', err);
      throw err;
    }
  }

  /**
   * Fetches all wardrobe items for a user
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
      const outfitRef = doc(db, 'users', userId, 'outfits', outfit.id);
      await setDoc(outfitRef, outfit);
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
      const calRef = doc(db, 'users', userId, 'settings', 'calendar');
      await setDoc(calRef, { entries });
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
