import { ClothingItem, ClothingCategory } from '@/types/wardrobe';

export interface WardrobeStats {
  totalItems: number;
  byCategory: Record<ClothingCategory, number>;
  underutilizedItems: ClothingItem[];
  mostWornItems: ClothingItem[];
  colorDiversity: number; // percentage 0-100
  dominantColorFamily: string;
  insights: string[];
}

export class WardrobeAnalyzer {
  static analyze(items: ClothingItem[]): WardrobeStats {
    const totalItems = items.length;
    const byCategory: Record<ClothingCategory, number> = {
      tops: 0,
      bottoms: 0,
      dresses: 0,
      outerwear: 0,
      shoes: 0,
      accessories: 0,
    };

    const colorCounts: Record<string, number> = {};

    for (const item of items) {
      if (byCategory[item.category] !== undefined) {
        byCategory[item.category]++;
      }
      const fam = item.color.family;
      colorCounts[fam] = (colorCounts[fam] || 0) + 1;
    }

    // Sort by wearCount
    const sortedByWear = [...items].sort((a, b) => a.wearCount - b.wearCount);
    // Neglected items: items with wearCount <= 2 or in the bottom 25%
    const underutilizedItems = sortedByWear.filter((item) => item.wearCount <= 2);
    const mostWornItems = [...items].sort((a, b) => b.wearCount - a.wearCount).slice(0, 4);

    // Color diversity
    const distinctColors = Object.keys(colorCounts).length;
    const colorDiversity = Math.min(100, Math.round((distinctColors / 8) * 100));

    let dominantColorFamily = 'neutros';
    let maxColorCount = 0;
    for (const [family, count] of Object.entries(colorCounts)) {
      if (count > maxColorCount) {
        maxColorCount = count;
        dominantColorFamily = family;
      }
    }

    // Generate actionable stylist insights
    const insights: string[] = [];

    if (underutilizedItems.length > 0) {
      insights.push(
        `Você tem ${underutilizedItems.length} ${
          underutilizedItems.length === 1 ? 'peça' : 'peças'
        } pouco aproveitada(s). Vamos criar novos looks com ela hoje!`
      );
    }

    if (byCategory.tops > 0 && byCategory.bottoms > 0) {
      const combinationsPossible = byCategory.tops * byCategory.bottoms;
      insights.push(
        `Suas peças atuais podem gerar mais de ${Math.max(6, combinationsPossible * 2)} combinações exclusivas.`
      );
    }

    if (byCategory.outerwear === 0) {
      insights.push(
        'Dica de stylist: Adicionar uma terceira peça (como um blazer ou cardigã) multiplica o poder das suas composições.'
      );
    }

    return {
      totalItems,
      byCategory,
      underutilizedItems,
      mostWornItems,
      colorDiversity,
      dominantColorFamily,
      insights,
    };
  }
}
