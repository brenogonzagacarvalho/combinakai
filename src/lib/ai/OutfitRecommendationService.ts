import { ClothingItem, Outfit, ClothingOccasion } from '@/types/wardrobe';
import { OutfitGenerator } from './OutfitGenerator';

export class OutfitRecommendationService {
  /**
   * Generates the "Look do Dia" (Daily curated outfit)
   */
  static getLookOfTheDay(wardrobe: ClothingItem[]): Outfit | null {
    if (wardrobe.length === 0) return null;

    // Detect daytime vs night context
    const currentHour = new Date().getHours();
    const isNight = currentHour >= 18 || currentHour < 5;
    const targetOccasion: ClothingOccasion = isNight ? 'jantar' : 'casual';

    // Prioritize pieces that have been worn least, so the user rediscovers their wardrobe!
    const leastWorn = [...wardrobe].sort((a, b) => a.wearCount - b.wearCount);
    const anchor = leastWorn[0];

    const outfits = OutfitGenerator.generateOutfits(wardrobe, {
      occasion: targetOccasion,
      anchorItemId: anchor?.id,
      surpriseMe: true,
    });

    if (outfits.length > 0) {
      const topPick = outfits[0];
      topPick.title = isNight ? 'Look da Noite: Elegância Natural' : 'Look do Dia: Harmonia & Praticidade';
      return topPick;
    }

    // Fallback general generate
    const general = OutfitGenerator.generateOutfits(wardrobe, {
      occasion: 'casual',
      surpriseMe: true,
    });
    return general[0] || null;
  }
}
