import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { image, color } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ fallback: true, message: 'Gemini API Key not provided' });
    }

    const prompt = `
Você é um especialista em moda e Personal Stylist.
Analise a imagem da peça de roupa fornecida com atenção aos detalhes do corte.
Identifique com precisão:
- Se for calça, bermuda ou short: a category DEVE ser "bottoms".
- Se for jaqueta, casaco, blazer ou corta-vento: a category DEVE ser "outerwear".
- Se for camisa, camiseta, blusa, cropped: a category DEVE ser "tops".
- Se for vestido: a category DEVE ser "dresses".
- Se for tênis, bota, salto, sandália: a category DEVE ser "shoes".
- Se for bolsa, cinto, boné, óculos: a category DEVE ser "accessories".

Retorne ESTRITAMENTE um JSON no seguinte formato (sem formatação markdown extra, apenas o json):
{
  "category": "tops" | "bottoms" | "dresses" | "outerwear" | "shoes" | "accessories",
  "subCategory": "Tipo exato da peça em português (ex: Short Jeans, Jaqueta de Couro, Calça Alfaiataria, Camiseta Básica, Camisa Social, Vestido Midi)",
  "color": { "name": "${color?.name || 'Cor'}", "hex": "${color?.hex || '#333333'}", "family": "${color?.family || 'neutro'}" },
  "style": "minimalista" | "casual" | "elegante" | "social" | "streetwear" | "romantico" | "confortavel" | "moderno",
  "occasions": ["casual", "passeio", "trabalho", "jantar", "encontro", "festa", "noite"],
  "seasons": ["todas"],
  "formality": 2,
  "material": "Denim | Algodão | Couro | Linho | Seda | etc",
  "confidence": 0.95
}
`;

    // Strip base64 prefix if present
    const base64Data = image && image.includes('base64,') ? image.split('base64,')[1] : image;

    // Use ultrafast responsive Gemini models
    const candidateModels = [
      'gemini-flash-lite-latest',
      'gemini-3.1-flash-lite-preview',
      'gemini-3.8-flash',
      'gemini-flash-latest',
    ];

    for (const model of candidateModels) {
      try {
        const parts: any[] = [{ text: prompt }];

        if (base64Data && base64Data.length > 50) {
          parts.push({
            inline_data: {
              mime_type: 'image/jpeg',
              data: base64Data,
            },
          });
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 7000); // 7s timeout per candidate

        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            signal: controller.signal,
            headers: {
              'Content-Type': 'application/json',
              'X-goog-api-key': apiKey,
            },
            body: JSON.stringify({
              contents: [{ parts }],
              generationConfig: {
                response_mime_type: 'application/json',
              },
            }),
          }
        );

        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json();
          const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (candidateText) {
            const cleanJson = candidateText.replace(/```json/g, '').replace(/```/g, '').trim();
            const parsed = JSON.parse(cleanJson);
            return NextResponse.json({ classification: parsed, modelUsed: model });
          }
        }
      } catch (e) {
        // Try next candidate model
        continue;
      }
    }

    return NextResponse.json({ fallback: true, message: 'Gemini models busy, fallback applied' });
  } catch (error) {
    console.error('AI analyze error:', error);
    return NextResponse.json({ fallback: true });
  }
}
