/**
 * Generates pristine, boutique-grade SVG illustrations for fashion items
 * with realistic drape, subtle shadows, highlights, and exact colors.
 * Renders as high-res data URLs so they work offline and without CDN latency.
 */

export function createGarmentSvg(
  type:
    | 'tshirt'
    | 'dress_shirt'
    | 'trousers'
    | 'jeans'
    | 'dress'
    | 'blazer'
    | 'sneaker'
    | 'heel'
    | 'bag'
    | 'skirt'
    | 'shorts',
  primaryColor: string,
  accentColor?: string
): string {
  let innerSvg = '';
  const accent = accentColor || '#333333';

  switch (type) {
    case 'tshirt':
      innerSvg = `
        <g transform="translate(100, 70)">
          <!-- Drop Shadow -->
          <ellipse cx="100" cy="235" rx="75" ry="12" fill="rgba(0,0,0,0.06)" />
          <!-- T-Shirt Body -->
          <path d="M60 20 L25 55 L45 80 L65 65 L65 210 L135 210 L135 65 L155 80 L175 55 L140 20 C125 35 75 35 60 20 Z" 
                fill="${primaryColor}" stroke="rgba(0,0,0,0.12)" stroke-width="2" stroke-linejoin="round" />
          <!-- Collar Ribbing -->
          <path d="M75 22 C85 34 115 34 125 22" fill="none" stroke="${accent}" stroke-width="3" stroke-linecap="round" opacity="0.4" />
          <!-- Fold/Drape Accents -->
          <path d="M72 75 C70 120 72 170 70 200" fill="none" stroke="rgba(0,0,0,0.07)" stroke-width="2" stroke-linecap="round" />
          <path d="M128 75 C130 120 128 170 130 200" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="1.5" stroke-linecap="round" />
          <line x1="65" y1="205" x2="135" y2="205" stroke="rgba(0,0,0,0.08)" stroke-width="2" />
        </g>
      `;
      break;

    case 'dress_shirt':
      innerSvg = `
        <g transform="translate(100, 65)">
          <ellipse cx="100" cy="240" rx="80" ry="12" fill="rgba(0,0,0,0.07)" />
          <!-- Shirt Body -->
          <path d="M55 25 L15 65 L35 88 L58 72 L58 220 C70 228 130 228 142 220 L142 72 L165 88 L185 65 L145 25 Z" 
                fill="${primaryColor}" stroke="rgba(0,0,0,0.15)" stroke-width="2" stroke-linejoin="round" />
          <!-- Stiff Collar -->
          <polygon points="100,38 72,15 90,48 100,38" fill="#FFFFFF" opacity="0.9" stroke="rgba(0,0,0,0.15)" stroke-width="1.5" />
          <polygon points="100,38 128,15 110,48 100,38" fill="#FFFFFF" opacity="0.9" stroke="rgba(0,0,0,0.15)" stroke-width="1.5" />
          <!-- Placket & Buttons -->
          <line x1="100" y1="48" x2="100" y2="222" stroke="rgba(0,0,0,0.18)" stroke-width="2" />
          <circle cx="100" cy="65" r="2.5" fill="#FFFFFF" stroke="#888" stroke-width="1" />
          <circle cx="100" cy="95" r="2.5" fill="#FFFFFF" stroke="#888" stroke-width="1" />
          <circle cx="100" cy="125" r="2.5" fill="#FFFFFF" stroke="#888" stroke-width="1" />
          <circle cx="100" cy="155" r="2.5" fill="#FFFFFF" stroke="#888" stroke-width="1" />
          <circle cx="100" cy="185" r="2.5" fill="#FFFFFF" stroke="#888" stroke-width="1" />
          <!-- Chest Pocket -->
          <rect x="68" y="80" width="22" height="24" rx="2" fill="none" stroke="rgba(0,0,0,0.12)" stroke-width="1.5" />
        </g>
      `;
      break;

    case 'trousers':
    case 'jeans':
      const isJeans = type === 'jeans';
      innerSvg = `
        <g transform="translate(100, 60)">
          <ellipse cx="100" cy="255" rx="70" ry="10" fill="rgba(0,0,0,0.08)" />
          <!-- Waistband -->
          <rect x="58" y="25" width="84" height="16" rx="3" fill="${primaryColor}" stroke="rgba(0,0,0,0.2)" stroke-width="1.5" />
          ${isJeans ? `<circle cx="100" cy="33" r="3" fill="#D4AF37" stroke="#8B6508" stroke-width="0.8" />` : ''}
          <!-- Legs -->
          <path d="M58 40 L64 245 L94 245 L100 95 L106 245 L136 245 L142 40 Z" 
                fill="${primaryColor}" stroke="rgba(0,0,0,0.18)" stroke-width="2" stroke-linejoin="round" />
          <!-- Crease / Seam -->
          <line x1="79" y1="50" x2="79" y2="240" stroke="${isJeans ? '#E6C687' : 'rgba(0,0,0,0.12)'}" stroke-width="${isJeans ? 1 : 1.5}" stroke-dasharray="${isJeans ? '3,3' : 'none'}" />
          <line x1="121" y1="50" x2="121" y2="240" stroke="${isJeans ? '#E6C687' : 'rgba(0,0,0,0.12)'}" stroke-width="${isJeans ? 1 : 1.5}" stroke-dasharray="${isJeans ? '3,3' : 'none'}" />
          <!-- Pockets -->
          <path d="M62 48 C72 58 75 75 72 82" fill="none" stroke="rgba(0,0,0,0.15)" stroke-width="1.5" />
          <path d="M138 48 C128 58 125 75 128 82" fill="none" stroke="rgba(0,0,0,0.15)" stroke-width="1.5" />
        </g>
      `;
      break;

    case 'dress':
      innerSvg = `
        <g transform="translate(100, 50)">
          <ellipse cx="100" cy="265" rx="85" ry="12" fill="rgba(0,0,0,0.08)" />
          <!-- Bodice & Flared Skirt -->
          <path d="M78 20 C85 28 115 28 122 20 L130 55 C125 80 118 105 116 115 C145 180 175 245 168 255 C140 262 60 262 32 255 C25 245 55 180 84 115 C82 105 75 80 70 55 Z" 
                fill="${primaryColor}" stroke="rgba(0,0,0,0.16)" stroke-width="2" stroke-linejoin="round" />
          <!-- Waistline cinch -->
          <path d="M84 115 C95 118 105 118 116 115" fill="none" stroke="rgba(0,0,0,0.25)" stroke-width="2.5" />
          <!-- Fluid Folds -->
          <path d="M72 135 C68 185 62 235 55 254" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="2" />
          <path d="M100 120 C100 175 100 230 100 256" fill="none" stroke="rgba(0,0,0,0.1)" stroke-width="2" />
          <path d="M128 135 C132 185 138 235 145 254" fill="none" stroke="rgba(0,0,0,0.15)" stroke-width="2" />
          <!-- Straps/Neckline -->
          <path d="M78 20 L82 45 M122 20 L118 45" stroke="${primaryColor}" stroke-width="4" stroke-linecap="round" />
        </g>
      `;
      break;

    case 'blazer':
      innerSvg = `
        <g transform="translate(100, 55)">
          <ellipse cx="100" cy="250" rx="85" ry="12" fill="rgba(0,0,0,0.08)" />
          <!-- Shoulders & Coat Body -->
          <path d="M48 30 L10 75 L30 110 L52 90 L52 235 L148 235 L148 90 L170 110 L190 75 L152 30 Z" 
                fill="${primaryColor}" stroke="rgba(0,0,0,0.2)" stroke-width="2" stroke-linejoin="round" />
          <!-- Inner Lining / Contrast Lapels -->
          <path d="M78 32 L100 135 L62 90 L60 30 Z" fill="${primaryColor}" stroke="rgba(0,0,0,0.22)" stroke-width="2" />
          <path d="M122 32 L100 135 L138 90 L140 30 Z" fill="${primaryColor}" stroke="rgba(0,0,0,0.22)" stroke-width="2" />
          <polygon points="100,75 88,135 100,165 112,135" fill="none" stroke="rgba(0,0,0,0.15)" stroke-width="1.5" />
          <!-- Tortoiseshell Buttons -->
          <circle cx="100" cy="148" r="4" fill="#3D2B1F" stroke="#B8977E" stroke-width="1" />
          <circle cx="100" cy="178" r="4" fill="#3D2B1F" stroke="#B8977E" stroke-width="1" />
          <!-- Flap Pockets -->
          <rect x="58" y="165" width="28" height="6" rx="1.5" fill="rgba(0,0,0,0.18)" />
          <rect x="114" y="165" width="28" height="6" rx="1.5" fill="rgba(0,0,0,0.18)" />
        </g>
      `;
      break;

    case 'sneaker':
      innerSvg = `
        <g transform="translate(100, 85)">
          <ellipse cx="100" cy="190" rx="90" ry="14" fill="rgba(0,0,0,0.08)" />
          <!-- Sole -->
          <path d="M25 155 C35 152 165 152 178 160 C182 174 176 182 170 182 L28 182 C20 182 18 168 25 155 Z" 
                fill="#FFFFFF" stroke="rgba(0,0,0,0.2)" stroke-width="2" />
          <line x1="28" y1="168" x2="175" y2="168" stroke="rgba(0,0,0,0.08)" stroke-width="1.5" />
          <!-- Upper -->
          <path d="M28 155 C32 120 58 100 85 96 C105 94 135 115 155 130 C168 138 175 148 178 160 L28 155 Z" 
                fill="${primaryColor}" stroke="rgba(0,0,0,0.18)" stroke-width="2" />
          <!-- Eyelets & Laces -->
          <path d="M88 105 L125 125" stroke="rgba(0,0,0,0.15)" stroke-width="2" stroke-dasharray="3,3" />
          <path d="M92 115 L128 135" stroke="rgba(0,0,0,0.15)" stroke-width="2" stroke-dasharray="3,3" />
          <!-- Heel Counter & Collar -->
          <path d="M38 120 C42 108 55 106 65 110" fill="none" stroke="rgba(0,0,0,0.2)" stroke-width="2" />
        </g>
      `;
      break;

    case 'heel':
      innerSvg = `
        <g transform="translate(100, 80)">
          <ellipse cx="100" cy="195" rx="80" ry="12" fill="rgba(0,0,0,0.08)" />
          <!-- Stiletto Heel -->
          <path d="M48 138 L42 195 L47 195 L55 138 Z" fill="#111111" />
          <!-- Sole arch -->
          <path d="M46 138 C60 145 90 178 145 178 C165 178 175 168 170 162 C150 148 115 132 82 118 C65 112 50 122 46 138 Z" 
                fill="${primaryColor}" stroke="rgba(0,0,0,0.25)" stroke-width="2" />
          <!-- Pointed Vamp -->
          <path d="M125 142 C142 145 168 158 170 162 C150 172 135 165 120 156 Z" 
                fill="${primaryColor}" stroke="rgba(0,0,0,0.15)" stroke-width="1.5" />
          <!-- Ankle Strap / Accent -->
          <path d="M68 122 C70 95 95 95 102 120" fill="none" stroke="${accent}" stroke-width="2" />
        </g>
      `;
      break;

    case 'bag':
      innerSvg = `
        <g transform="translate(100, 60)">
          <ellipse cx="100" cy="235" rx="65" ry="10" fill="rgba(0,0,0,0.08)" />
          <!-- Leather Handle / Strap -->
          <path d="M72 105 C72 35 128 35 128 105" fill="none" stroke="${accent}" stroke-width="5" stroke-linecap="round" />
          <!-- Bag Body -->
          <rect x="52" y="105" width="96" height="115" rx="16" fill="${primaryColor}" stroke="rgba(0,0,0,0.2)" stroke-width="2" />
          <!-- Flap -->
          <path d="M52 105 L52 155 C52 165 148 165 148 155 L148 105 Z" fill="${primaryColor}" stroke="rgba(0,0,0,0.15)" stroke-width="1.5" />
          <!-- Gold Metal Clasp -->
          <rect x="94" y="148" width="12" height="14" rx="2" fill="#D4AF37" stroke="#A67C1E" stroke-width="1" />
        </g>
      `;
      break;

    default:
      innerSvg = `
        <circle cx="200" cy="200" r="80" fill="${primaryColor}" />
      `;
  }

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
      <defs>
        <radialGradient id="studioGlow" cx="50%" cy="45%" r="65%">
          <stop offset="0%" stop-color="#FFFFFF" stop-opacity="1" />
          <stop offset="70%" stop-color="#F9F8F5" stop-opacity="0.9" />
          <stop offset="100%" stop-color="#EFECE6" stop-opacity="0.7" />
        </radialGradient>
      </defs>
      <!-- Luxury Studio Pedestal Backdrop -->
      <rect width="400" height="400" rx="24" fill="url(#studioGlow)" />
      ${innerSvg}
    </svg>
  `.trim();

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
