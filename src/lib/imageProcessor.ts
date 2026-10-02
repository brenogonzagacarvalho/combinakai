/**
 * CombinaKai Studio Image Processor
 * Optimizes photos taken from iPhone camera/gallery:
 * - Downscales high-res 12MP/48MP iPhone captures to lightweight luxury catalog assets
 * - Samples central garment pixels to extract dominant color and palette
 * - Applies subtle luxury studio vignette & lighting enhancement
 */

export interface ProcessedImageResult {
  dataUrl: string;
  rawOriginalUrl: string;
  dominantColor: {
    name: string;
    hex: string;
    family: 'branco' | 'preto' | 'cinza' | 'azul' | 'bege' | 'marrom' | 'verde' | 'vermelho' | 'amarelo' | 'rosa' | 'roxo' | 'laranja';
  };
  palette: string[];
  width: number;
  height: number;
}

const COLOR_MAP: Array<{
  family: 'branco' | 'preto' | 'cinza' | 'azul' | 'bege' | 'marrom' | 'verde' | 'vermelho' | 'amarelo' | 'rosa' | 'roxo' | 'laranja';
  name: string;
  r: number;
  g: number;
  b: number;
}> = [
  { family: 'branco', name: 'Branco Neve', r: 250, g: 250, b: 250 },
  { family: 'branco', name: 'Off-White', r: 242, g: 240, b: 235 },
  { family: 'preto', name: 'Preto Noir', r: 25, g: 25, b: 28 },
  { family: 'cinza', name: 'Cinza Mescla', r: 155, g: 155, b: 155 },
  { family: 'cinza', name: 'Chumbo', r: 70, g: 72, b: 76 },
  { family: 'azul', name: 'Azul Marinho', r: 20, g: 35, b: 60 },
  { family: 'azul', name: 'Azul Celeste', r: 140, g: 185, b: 225 },
  { family: 'azul', name: 'Azul Jeans Índigo', r: 50, g: 85, b: 130 },
  { family: 'bege', name: 'Bege Areia', r: 215, g: 198, b: 170 },
  { family: 'bege', name: 'Khaki Claro', r: 195, g: 180, b: 150 },
  { family: 'marrom', name: 'Caramelo / Cognac', r: 160, g: 105, b: 55 },
  { family: 'marrom', name: 'Marrom Café', r: 85, g: 50, b: 30 },
  { family: 'verde', name: 'Verde Oliva', r: 85, g: 100, b: 60 },
  { family: 'verde', name: 'Verde Esmeralda', r: 35, g: 130, b: 85 },
  { family: 'vermelho', name: 'Vermelho Carmim', r: 190, g: 35, b: 40 },
  { family: 'vermelho', name: 'Bordô / Vinho', r: 110, g: 25, b: 40 },
  { family: 'rosa', name: 'Rosa Blush', r: 235, g: 180, b: 190 },
  { family: 'amarelo', name: 'Amarelo Mostarda', r: 220, g: 175, b: 50 },
  { family: 'laranja', name: 'Terracota', r: 195, g: 90, b: 50 },
  { family: 'roxo', name: 'Lavanda', r: 175, g: 155, b: 200 },
];

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('');
}

function colorDistance(r1: number, g1: number, b1: number, r2: number, g2: number, b2: number): number {
  return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2);
}

export function findClosestColor(r: number, g: number, b: number) {
  let closest = COLOR_MAP[0];
  let minDistance = Infinity;

  for (const c of COLOR_MAP) {
    const dist = colorDistance(r, g, b, c.r, c.g, c.b);
    if (dist < minDistance) {
      minDistance = dist;
      closest = c;
    }
  }

  return {
    name: closest.name,
    family: closest.family,
    hex: rgbToHex(r, g, b),
  };
}

/**
 * Optimizes an image File or DataUrl for mobile web presentation
 */
export async function processGarmentImage(fileOrUrl: File | string): Promise<ProcessedImageResult> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          throw new Error('Canvas context unavailable');
        }

        // Target luxury catalog dimensions (800x800 square with clean framing)
        const targetSize = 800;
        canvas.width = targetSize;
        canvas.height = targetSize;

        // Subtle luxury editorial studio background
        const radial = ctx.createRadialGradient(
          targetSize / 2,
          targetSize / 2,
          targetSize * 0.1,
          targetSize / 2,
          targetSize / 2,
          targetSize * 0.7
        );
        radial.addColorStop(0, '#FFFFFF');
        radial.addColorStop(0.75, '#FAF8F5');
        radial.addColorStop(1, '#F0ECE4');
        ctx.fillStyle = radial;
        ctx.fillRect(0, 0, targetSize, targetSize);

        // Aspect ratio cover/contain calculation with padding
        const padding = 40;
        const maxDrawWidth = targetSize - padding * 2;
        const maxDrawHeight = targetSize - padding * 2;

        const scale = Math.min(maxDrawWidth / img.width, maxDrawHeight / img.height);
        const drawWidth = img.width * scale;
        const drawHeight = img.height * scale;
        const drawX = (targetSize - drawWidth) / 2;
        const drawY = (targetSize - drawHeight) / 2;

        // Soft studio shadow under garment
        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.08)';
        ctx.shadowBlur = 24;
        ctx.shadowOffsetY = 12;

        // Draw image onto canvas
        ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
        ctx.restore();

        // Sample central 50% pixels of the garment to detect dominant color
        const sampleBoxX = Math.floor(drawX + drawWidth * 0.25);
        const sampleBoxY = Math.floor(drawY + drawHeight * 0.25);
        const sampleBoxW = Math.max(10, Math.floor(drawWidth * 0.5));
        const sampleBoxH = Math.max(10, Math.floor(drawHeight * 0.5));

        const imgData = ctx.getImageData(sampleBoxX, sampleBoxY, sampleBoxW, sampleBoxH);
        const data = imgData.data;

        let totalR = 0;
        let totalG = 0;
        let totalB = 0;
        let countedPixels = 0;

        for (let i = 0; i < data.length; i += 16) {
          // step 4 pixels (16 bytes)
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          const a = data[i + 3];

          // Skip near-white studio backdrop pixels
          if (a > 200 && !(r > 240 && g > 240 && b > 240)) {
            totalR += r;
            totalG += g;
            totalB += b;
            countedPixels++;
          }
        }

        let avgR = 40;
        let avgG = 40;
        let avgB = 40;

        if (countedPixels > 0) {
          avgR = Math.round(totalR / countedPixels);
          avgG = Math.round(totalG / countedPixels);
          avgB = Math.round(totalB / countedPixels);
        }

        const dominant = findClosestColor(avgR, avgG, avgB);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        let rawOriginal = '';
        if (typeof fileOrUrl === 'string') {
          rawOriginal = fileOrUrl;
        } else {
          try {
            rawOriginal = canvas.toDataURL('image/jpeg', 0.9);
          } catch {
            rawOriginal = dataUrl;
          }
        }

        resolve({
          dataUrl,
          rawOriginalUrl: rawOriginal,
          dominantColor: dominant,
          palette: [dominant.hex, '#111111', '#FBF9F5'],
          width: targetSize,
          height: targetSize,
        });
      } catch (err) {
        reject(err);
      }
    };

    img.onerror = (e) => reject(new Error('Failed to load image: ' + e));

    if (typeof fileOrUrl === 'string') {
      img.src = fileOrUrl;
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(fileOrUrl);
    }
  });
}

/**
 * AI Auto-Framing & Studio Treatment:
 * When a photo is taken "de qualquer jeito" (messy background, bed, floor, far away),
 * this function uses the AI detected bounding box (box_2d) to automatically crop
 * out the messy room, center the garment, boost exposure & contrast, and place
 * it on a luxury catalog background with soft studio shadow.
 */
export async function autoCropAndEnhanceGarment(
  rawImageSrc: string,
  box_2d?: [number, number, number, number]
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Canvas context unavailable');

        const targetSize = 800;
        canvas.width = targetSize;
        canvas.height = targetSize;

        // Luxury studio background gradient
        const radial = ctx.createRadialGradient(
          targetSize / 2,
          targetSize / 2,
          targetSize * 0.1,
          targetSize / 2,
          targetSize / 2,
          targetSize * 0.75
        );
        radial.addColorStop(0, '#FFFFFF');
        radial.addColorStop(0.75, '#FAF8F5');
        radial.addColorStop(1, '#F0ECE4');
        ctx.fillStyle = radial;
        ctx.fillRect(0, 0, targetSize, targetSize);

        // Determine source cropping region based on AI object detection box_2d [ymin, xmin, ymax, xmax]
        let srcX = 0;
        let srcY = 0;
        let srcW = img.width;
        let srcH = img.height;

        if (box_2d && box_2d.length === 4) {
          const [ymin, xmin, ymax, xmax] = box_2d;
          // Values are normalized from 0 to 1000
          const rawY = (ymin / 1000) * img.height;
          const rawX = (xmin / 1000) * img.width;
          const rawH = Math.max(20, ((ymax - ymin) / 1000) * img.height);
          const rawW = Math.max(20, ((xmax - xmin) / 1000) * img.width);

          // Add 6% natural breathing padding around the piece
          const padX = rawW * 0.06;
          const padY = rawH * 0.06;

          srcX = Math.max(0, rawX - padX);
          srcY = Math.max(0, rawY - padY);
          srcW = Math.min(img.width - srcX, rawW + padX * 2);
          srcH = Math.min(img.height - srcY, rawH + padY * 2);
        }

        // Draw centered in 800x800 luxury square with 45px padding
        const padding = 45;
        const maxDrawW = targetSize - padding * 2;
        const maxDrawH = targetSize - padding * 2;
        const scale = Math.min(maxDrawW / srcW, maxDrawH / srcH);
        const drawW = srcW * scale;
        const drawH = srcH * scale;
        const drawX = (targetSize - drawW) / 2;
        const drawY = (targetSize - drawH) / 2;

        // Apply soft catalog drop shadow under piece
        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.09)';
        ctx.shadowBlur = 24;
        ctx.shadowOffsetY = 12;

        // Slight image contrast and brightness enhancement
        if (typeof ctx.filter !== 'undefined') {
          ctx.filter = 'contrast(105%) saturate(110%) brightness(102%)';
        }

        ctx.drawImage(img, srcX, srcY, srcW, srcH, drawX, drawY, drawW, drawH);
        ctx.restore();

        resolve(canvas.toDataURL('image/jpeg', 0.88));
      } catch (e) {
        reject(e);
      }
    };
    img.onerror = reject;
    img.src = rawImageSrc;
  });
}

/**
 * Places a cutout transparent garment onto a luxury studio canvas with soft shadow
 */
export async function placeCutoutOnStudioCanvas(cutoutPngDataUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Canvas context unavailable');

        const targetSize = 800;
        canvas.width = targetSize;
        canvas.height = targetSize;

        // Luxury studio background
        const radial = ctx.createRadialGradient(
          targetSize / 2,
          targetSize / 2,
          targetSize * 0.1,
          targetSize / 2,
          targetSize / 2,
          targetSize * 0.75
        );
        radial.addColorStop(0, '#FFFFFF');
        radial.addColorStop(0.75, '#FAF8F5');
        radial.addColorStop(1, '#F0ECE4');
        ctx.fillStyle = radial;
        ctx.fillRect(0, 0, targetSize, targetSize);

        // Aspect ratio contain with 50px margins
        const padding = 50;
        const maxDrawW = targetSize - padding * 2;
        const maxDrawH = targetSize - padding * 2;
        const scale = Math.min(maxDrawW / img.width, maxDrawH / img.height);
        const drawW = img.width * scale;
        const drawH = img.height * scale;
        const drawX = (targetSize - drawW) / 2;
        const drawY = (targetSize - drawH) / 2;

        // Realistic studio contact shadow under isolated garment
        ctx.save();
        ctx.shadowColor = 'rgba(0, 0, 0, 0.12)';
        ctx.shadowBlur = 28;
        ctx.shadowOffsetY = 16;

        ctx.drawImage(img, drawX, drawY, drawW, drawH);
        ctx.restore();

        resolve(canvas.toDataURL('image/jpeg', 0.88));
      } catch (e) {
        reject(e);
      }
    };
    img.onerror = reject;
    img.src = cutoutPngDataUrl;
  });
}

/**
 * AI Neural Background Removal:
 * Uses @imgly/background-removal in client browser to extract 100% of the clothing silhouette,
 * remove bed/room/floor background, and output both transparent PNG and studio catalog card.
 */
export async function removeGarmentBackground(
  imageSource: string | Blob,
  onProgress?: (percent: number, stage: string) => void
): Promise<{ transparentUrl: string; studioUrl: string }> {
  try {
    // Dynamic import to keep initial bundle small
    const { removeBackground } = await import('@imgly/background-removal');

    const blob = await removeBackground(imageSource, {
      model: 'isnet_quint8', // 8-bit quantized model: fastest & lowest memory for mobile
      output: {
        format: 'image/png',
        quality: 0.9,
      },
      progress: (key: string, current: number, total: number) => {
        if (total > 0 && onProgress) {
          const pct = Math.min(100, Math.round((current / total) * 100));
          const stage = key.includes('fetch') ? 'Carregando IA...' : 'Recortando peça...';
          onProgress(pct, stage);
        }
      },
    });

    // Convert blob to base64 data URL
    const reader = new FileReader();
    const transparentUrl: string = await new Promise((res, rej) => {
      reader.onload = () => res(reader.result as string);
      reader.onerror = rej;
      reader.readAsDataURL(blob);
    });

    const studioUrl = await placeCutoutOnStudioCanvas(transparentUrl);

    return {
      transparentUrl,
      studioUrl,
    };
  } catch (err) {
    console.error('AI background removal error:', err);
    throw err;
  }
}
