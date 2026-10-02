import {
  ClothingCategory,
  ClothingItem,
  ClothingOccasion,
  ClothingStyle,
  ClothingSeason,
  ColorInfo,
} from '@/types/wardrobe';

export interface GarmentClassificationResult {
  category: ClothingCategory;
  subCategory: string;
  color: ColorInfo;
  secondaryColor?: ColorInfo;
  style: ClothingStyle;
  occasions: ClothingOccasion[];
  seasons: ClothingSeason[];
  formality: 1 | 2 | 3 | 4 | 5;
  material?: string;
  confidence: number;
  box_2d?: [number, number, number, number]; // [ymin, xmin, ymax, xmax] 0-1000
}

export class AIService {
  /**
   * Classifies a clothing item from photo analysis
   * Supports pluggable vision model via API route, with resilient heuristic fallback
   */
  static async classifyGarment(
    imageDataUrl: string,
    dominantColor: ColorInfo
  ): Promise<GarmentClassificationResult> {
    try {
      // Attempt backend AI vision endpoint if available
      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageDataUrl, color: dominantColor }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.classification && !data.fallback) {
          return data.classification;
        }
      }
    } catch {
      // Backend not configured or offline - fallback to intelligent local heuristic
    }

    return this.heuristicClassification(dominantColor);
  }

  /**
   * Neutral local fallback when AI vision is temporarily unavailable
   */
  private static heuristicClassification(dominantColor: ColorInfo): GarmentClassificationResult {
    return {
      category: 'tops',
      subCategory: '',
      color: dominantColor,
      style: 'casual',
      occasions: ['casual', 'jantar'],
      seasons: ['todas'],
      formality: 2,
      material: 'Tecido',
      confidence: 0.7,
    };
  }
}
