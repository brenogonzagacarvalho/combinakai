import { Outfit, ClothingItem } from '@/types/wardrobe';

export class ShareHelper {
  /**
   * Formats an outfit for sharing on WhatsApp or via Web Share API
   */
  static formatOutfitText(outfit: Outfit): string {
    const itemsList = outfit.items
      .map((item) => {
        const icon =
          item.category === 'tops'
            ? '👕'
            : item.category === 'bottoms'
            ? '👖'
            : item.category === 'dresses'
            ? '👗'
            : item.category === 'outerwear'
            ? '🧥'
            : item.category === 'shoes'
            ? '👟'
            : '👜';
        return `${icon} ${item.name}`;
      })
      .join('\n');

    return `✨ *Look do Dia — CombinaKai* ✨
*${outfit.title}*

👗 *Composição:*
${itemsList}

💡 *Por que funciona:*
${outfit.whyItWorks}

${outfit.stylistTip ? `📌 *Dica do Stylist:* ${outfit.stylistTip}\n` : ''}
🔗 *Monte combinações com as suas roupas também:*
${typeof window !== 'undefined' ? window.location.origin : 'https://combinakai.vercel.app'}`;
  }

  /**
   * Formats general wardrobe summary for sharing
   */
  static formatWardrobeText(wardrobeCount: number): string {
    return `✨ Estou organizando minhas roupas com o *CombinaKai*!
Já cadastrei ${wardrobeCount} peças e ele monta meus looks automaticamente com inteligência de estilo.

Experimente gratuitamente pelo navegador:
${typeof window !== 'undefined' ? window.location.origin : 'https://combinakai.vercel.app'}`;
  }

  /**
   * Shares via WhatsApp directly
   */
  static shareToWhatsApp(text: string) {
    const encoded = encodeURIComponent(text);
    const url = `https://api.whatsapp.com/send?text=${encoded}`;
    window.open(url, '_blank');
  }

  /**
   * Shares via native Web Share API on mobile (iPhone Safari / Android Chrome),
   * or falls back to WhatsApp / clipboard
   */
  static async shareOutfit(outfit: Outfit): Promise<'shared' | 'whatsapp' | 'copied'> {
    const text = this.formatOutfitText(outfit);

    if (navigator.share) {
      try {
        await navigator.share({
          title: `Look CombinaKai: ${outfit.title}`,
          text: text,
          url: window.location.origin,
        });
        return 'shared';
      } catch (err) {
        // User cancelled or share failed, fallback
      }
    }

    // Direct WhatsApp share
    this.shareToWhatsApp(text);
    return 'whatsapp';
  }

  /**
   * Copy to clipboard helper
   */
  static async copyToClipboard(text: string): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  }
}
