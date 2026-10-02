import {
  ClothingItem,
  Outfit,
  ClothingOccasion,
  ClothingStyle,
  OutfitRequest,
} from '@/types/wardrobe';

// Color harmony scoring table
const COLOR_HARMONY_PAIRS: Record<string, string[]> = {
  azul: ['bege', 'branco', 'cinza', 'preto', 'marrom'],
  branco: ['azul', 'preto', 'bege', 'cinza', 'marrom', 'verde', 'vermelho', 'laranja', 'rosa'],
  preto: ['branco', 'cinza', 'bege', 'azul', 'vermelho', 'marrom'],
  bege: ['azul', 'branco', 'preto', 'marrom', 'verde'],
  cinza: ['preto', 'branco', 'azul', 'rosa', 'vinho'],
  marrom: ['bege', 'branco', 'azul', 'preto', 'verde'],
  vermelho: ['preto', 'branco', 'bege', 'azul'],
  verde: ['bege', 'branco', 'marrom', 'preto', 'azul'],
};

export class OutfitGenerator {
  /**
   * Generates tailored outfit combinations from the user's available wardrobe
   */
  static generateOutfits(
    wardrobe: ClothingItem[],
    request: OutfitRequest,
    dislikedOutfits: string[] = []
  ): Outfit[] {
    const { occasion, style, weather, anchorItemId, surpriseMe } = request;

    if (wardrobe.length === 0) return [];

    // Separate wardrobe by category
    const tops = wardrobe.filter((i) => i.category === 'tops');
    const bottoms = wardrobe.filter((i) => i.category === 'bottoms');
    const dresses = wardrobe.filter((i) => i.category === 'dresses');
    const outerwear = wardrobe.filter((i) => i.category === 'outerwear');
    const shoes = wardrobe.filter((i) => i.category === 'shoes');
    const accessories = wardrobe.filter((i) => i.category === 'accessories');

    const anchorItem = anchorItemId ? wardrobe.find((i) => i.id === anchorItemId) : undefined;

    const candidateOutfits: Outfit[] = [];

    // 1. COMBINATIONS WITH DRESSES
    if (!anchorItem || anchorItem.category === 'dresses') {
      const eligibleDresses = anchorItem ? [anchorItem] : dresses;

      for (const dress of eligibleDresses) {
        // Find matching shoes
        const matchingShoes = shoes.length > 0 ? shoes : [];
        for (const shoe of matchingShoes) {
          const matchingOuter = this.pickOuterwear(dress, outerwear, weather);
          const matchingAcc = accessories.length > 0 ? accessories[0] : undefined;

          const items: ClothingItem[] = [dress, shoe];
          if (matchingOuter) items.push(matchingOuter);
          if (matchingAcc) items.push(matchingAcc);

          const { score, styleDetected, whyItWorks, stylistTip } = this.evaluateCombination(
            items,
            occasion,
            style,
            weather
          );

          candidateOutfits.push({
            id: `outfit-dress-${dress.id}-${shoe.id}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
            title: this.generateOutfitTitle(items, occasion, styleDetected),
            style: styleDetected,
            occasion,
            weather,
            items,
            whyItWorks,
            stylistTip,
            score,
            createdAt: new Date().toISOString(),
          });
        }
      }
    }

    // 2. COMBINATIONS WITH TOPS & BOTTOMS
    let candidateTops = tops;
    let candidateBottoms = bottoms;

    if (anchorItem) {
      if (anchorItem.category === 'tops') {
        candidateTops = [anchorItem];
      } else if (anchorItem.category === 'bottoms') {
        candidateBottoms = [anchorItem];
      } else if (anchorItem.category === 'outerwear') {
        // Will include anchor as outer
      } else if (anchorItem.category === 'shoes') {
        // Will include anchor as shoe
      }
    }

    for (const top of candidateTops) {
      for (const bottom of candidateBottoms) {
        // Test color compatibility
        const isHarmonious = this.areColorsHarmonious(top.color.family, bottom.color.family);
        if (!isHarmonious && !surpriseMe) continue;

        // Formality compatibility: top and bottom shouldn't clash drastically
        if (Math.abs(top.formality - bottom.formality) > 2 && !surpriseMe) continue;

        // Choose shoes
        const availableShoes = anchorItem && anchorItem.category === 'shoes' ? [anchorItem] : shoes;
        const chosenShoes = availableShoes.length > 0 ? availableShoes : [];

        for (const shoe of chosenShoes.slice(0, 3)) {
          // Choose outerwear if applicable
          const availableOuter = anchorItem && anchorItem.category === 'outerwear' ? [anchorItem] : outerwear;
          const chosenOuter = this.pickOuterwear(top, availableOuter, weather);

          // Choose accessory if applicable
          const chosenAcc = accessories.length > 0 ? accessories[0] : undefined;

          const items: ClothingItem[] = [top, bottom, shoe];
          if (chosenOuter) items.push(chosenOuter);
          if (chosenAcc && items.length < 5) items.push(chosenAcc);

          const { score, styleDetected, whyItWorks, stylistTip } = this.evaluateCombination(
            items,
            occasion,
            style,
            weather
          );

          candidateOutfits.push({
            id: `outfit-${top.id}-${bottom.id}-${shoe.id}-${Math.random().toString(36).substr(2, 4)}`,
            title: this.generateOutfitTitle(items, occasion, styleDetected),
            style: styleDetected,
            occasion,
            weather,
            items,
            whyItWorks,
            stylistTip,
            score,
            createdAt: new Date().toISOString(),
          });
        }
      }
    }

    // Filter out previously disliked combinations
    const filtered = candidateOutfits.filter((o) => !dislikedOutfits.includes(o.id));

    // Sort by compatibility score
    filtered.sort((a, b) => b.score - a.score);

    // Ensure distinct variety in top 6 (avoid 6 identical outfits with only 1 shoe changed)
    const diverseOutfits: Outfit[] = [];
    const seenSignatures = new Set<string>();

    for (const outfit of filtered) {
      const signature = outfit.items.map((i) => i.id).sort().join('_');
      if (!seenSignatures.has(signature)) {
        seenSignatures.add(signature);
        diverseOutfits.push(outfit);
      }
      if (diverseOutfits.length >= 6) break;
    }

    // Fallback if no strict match
    if (diverseOutfits.length === 0 && candidateOutfits.length > 0) {
      return candidateOutfits.slice(0, 4);
    }

    return diverseOutfits;
  }

  /**
   * Specialized Dress Styling ("Como posso usar esse vestido?")
   */
  static generateDressTransformations(dress: ClothingItem, wardrobe: ClothingItem[]): Outfit[] {
    const transformations: Outfit[] = [];
    const shoes = wardrobe.filter((i) => i.category === 'shoes');
    const outer = wardrobe.filter((i) => i.category === 'outerwear');
    const acc = wardrobe.filter((i) => i.category === 'accessories');

    const sneakers = shoes.find((s) => s.subCategory.toLowerCase().includes('tênis'));
    const heels = shoes.find((s) => s.subCategory.toLowerCase().includes('salto'));
    const blazer = outer.find((o) => o.subCategory.toLowerCase().includes('blazer'));
    const bag = acc.find((a) => a.category === 'accessories');

    // 1. Look Casual Diurno
    if (sneakers || shoes.length > 0) {
      const shoe = sneakers || shoes[0];
      const items = [dress, shoe];
      if (bag) items.push(bag);
      transformations.push({
        id: `dress-trans-casual-${dress.id}`,
        title: 'Casual Chic Urbano',
        style: 'casual',
        occasion: 'casual',
        items,
        whyItWorks: `O ${dress.name} ganha leveza imediata ao ser combinado com ${shoe.name}. Essa mistura equilibra feminilidade com atitude despojada para o dia a dia.`,
        stylistTip: 'Ideal para um café com amigos, passeio no shopping ou almoço no fim de semana.',
        score: 95,
        createdAt: new Date().toISOString(),
      });
    }

    // 2. Look Elegante / Jantar
    if (heels || shoes.length > 1) {
      const shoe = heels || shoes[shoes.length - 1];
      const items = [dress, shoe];
      if (bag) items.push(bag);
      transformations.push({
        id: `dress-trans-chic-${dress.id}`,
        title: 'Elegância para Encontro & Jantar',
        style: 'elegante',
        occasion: 'jantar',
        items,
        whyItWorks: `A silhueta do ${dress.name} é valorizada pelo porte do ${shoe.name}, alongando a postura e elevando o nível de sofisticação.`,
        stylistTip: 'Aposte em acessórios metálicos discretos e perfume marcante.',
        score: 98,
        createdAt: new Date().toISOString(),
      });
    }

    // 3. Look Noite com Terceira Peça
    if (blazer || outer.length > 0) {
      const coat = blazer || outer[0];
      const shoe = heels || (shoes.length > 0 ? shoes[0] : null);
      const items = [dress, coat];
      if (shoe) items.push(shoe);
      if (bag) items.push(bag);
      transformations.push({
        id: `dress-trans-night-${dress.id}`,
        title: 'Noite Cosmopolita',
        style: 'moderno',
        occasion: 'noite',
        items,
        whyItWorks: `Jogar o ${coat.name} sobre os ombros do ${dress.name} cria o clássico efeito de alfaiataria sobre fluidez, perfeito para temperaturas amenas.`,
        stylistTip: 'Use o casaco apoiado nos ombros sem vestir as mangas para uma estética editorial.',
        score: 97,
        createdAt: new Date().toISOString(),
      });
    }

    return transformations;
  }

  /**
   * "O que combina com essa peça?" - Instant pairings for a single selected garment
   */
  static findPairingsForPiece(item: ClothingItem, wardrobe: ClothingItem[]): ClothingItem[] {
    return wardrobe.filter((candidate) => {
      if (candidate.id === item.id) return false;
      if (candidate.category === item.category) return false;

      // Color harmony
      const colorMatch = this.areColorsHarmonious(item.color.family, candidate.color.family);
      // Occasion overlap
      const hasSharedOccasion = item.occasions.some((occ) => candidate.occasions.includes(occ));

      return colorMatch && (hasSharedOccasion || Math.abs(item.formality - candidate.formality) <= 2);
    });
  }

  private static areColorsHarmonious(c1: string, c2: string): boolean {
    if (c1 === c2) return true; // Monocromático elegante
    const allowed = COLOR_HARMONY_PAIRS[c1];
    if (allowed && allowed.includes(c2)) return true;
    const allowedRev = COLOR_HARMONY_PAIRS[c2];
    if (allowedRev && allowedRev.includes(c1)) return true;
    // Neutrals always pair nicely
    const neutrals = ['branco', 'preto', 'cinza', 'bege'];
    return neutrals.includes(c1) || neutrals.includes(c2);
  }

  private static pickOuterwear(
    base: ClothingItem,
    outerwearList: ClothingItem[],
    weather?: string
  ): ClothingItem | undefined {
    if (outerwearList.length === 0) return undefined;
    if (weather === 'quente') return undefined; // Avoid heavy layers in hot weather

    // Prefer outerwear matching the occasion and formality
    const match = outerwearList.find(
      (o) =>
        Math.abs(o.formality - base.formality) <= 1 &&
        this.areColorsHarmonious(o.color.family, base.color.family)
    );
    return match || (weather === 'frio' ? outerwearList[0] : undefined);
  }

  private static evaluateCombination(
    items: ClothingItem[],
    targetOccasion: ClothingOccasion,
    targetStyle?: ClothingStyle | 'surprise',
    weather?: string
  ): { score: number; styleDetected: ClothingStyle; whyItWorks: string; stylistTip: string } {
    let score = 88;

    // Check occasion alignment
    const matchesOccasion = items.every((i) => i.occasions.includes(targetOccasion));
    if (matchesOccasion) score += 6;

    // Detected style
    const styleVotes: Record<string, number> = {};
    for (const item of items) {
      styleVotes[item.style] = (styleVotes[item.style] || 0) + 1;
    }
    let dominantStyle: ClothingStyle = 'casual';
    let maxVotes = 0;
    for (const [st, count] of Object.entries(styleVotes)) {
      if (count > maxVotes) {
        maxVotes = count;
        dominantStyle = st as ClothingStyle;
      }
    }

    if (targetStyle && targetStyle !== 'surprise' && dominantStyle === targetStyle) {
      score += 4;
    }

    score = Math.min(99, score);

    // Editorial rationale
    const itemNames = items.map((i) => i.name);
    const topOrDress = items.find((i) => i.category === 'tops' || i.category === 'dresses') || items[0];
    const bottomOrShoe = items.find((i) => i.category === 'bottoms') || items[1] || items[0];

    let whyItWorks = `A combinação de ${topOrDress.color.name} com ${bottomOrShoe.color.name} gera um contraste sofisticado e atemporal.`;

    if (items.some((i) => i.category === 'outerwear')) {
      whyItWorks += ` A terceira peça adiciona profundidade visual e presença ao look de ${targetOccasion}.`;
    } else {
      whyItWorks += ` O caimento das peças equilibra conforto e estética impecável para ${targetOccasion}.`;
    }

    const tips = [
      'Dica: Experimente dobrar a barra da calça ou as mangas para um visual descontraído e moderno.',
      'Dica: Um acessório metálico dourado ou prateado sutil elevará ainda mais a produção.',
      'Dica: Mantenha a postura confiante; a harmonia das cores já faz todo o trabalho por você.',
      'Dica: Adicione óculos de sol ou relógio minimalista para fechar o visual com assinatura pessoal.',
    ];
    const stylistTip = tips[Math.floor(Math.random() * tips.length)];

    return {
      score,
      styleDetected: dominantStyle,
      whyItWorks,
      stylistTip,
    };
  }

  private static generateOutfitTitle(
    items: ClothingItem[],
    occasion: ClothingOccasion,
    style: ClothingStyle
  ): string {
    const occasionLabels: Record<ClothingOccasion, string> = {
      trabalho: 'Office Sofisticado',
      jantar: 'Jantar Elegante',
      encontro: 'Encontro Charmoso',
      festa: 'Festa & Brilho',
      casual: 'Casual Despretensioso',
      praia: 'Frescor & Brisa',
      noite: 'Noite Urbana',
      esporte: 'Athleisure Conforto',
      viagem: 'Viagem com Estilo',
      evento: 'Evento & Celebração',
    };

    const stylePrefixes: Record<ClothingStyle, string> = {
      minimalista: 'Minimalista',
      casual: 'Casual Chic',
      elegante: 'Alta Elegância',
      social: 'Alfaiataria Moderna',
      streetwear: 'Streetwear Contemporâneo',
      romantico: 'Romântico Suave',
      confortavel: 'Conforto Premium',
      moderno: 'Visual Cosmopolita',
    };

    return `${stylePrefixes[style] || 'Harmonia'} — ${occasionLabels[occasion] || 'Dia a Dia'}`;
  }
}
