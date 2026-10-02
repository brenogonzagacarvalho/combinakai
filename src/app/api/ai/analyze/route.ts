import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { image, color } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ fallback: true, message: 'Gemini API Key not provided, using local heuristic' });
    }

    const prompt = `
Você é um Personal Stylist e especialista em moda.
Analise esta peça de roupa e a cor predominante informada (${color?.name || 'neutra'}).
Retorne ESTRITAMENTE um JSON válido no formato abaixo, sem texto adicional:
{
  "category": "tops" | "bottoms" | "dresses" | "outerwear" | "shoes" | "accessories",
  "subCategory": "Nome específico em português (ex: Camisa Social, Camiseta Básica, Calça Jeans, Blazer)",
  "color": { "name": "${color?.name || 'Cor'}", "hex": "${color?.hex || '#333333'}", "family": "${color?.family || 'azul'}" },
  "style": "minimalista" | "casual" | "elegante" | "social" | "streetwear" | "romantico" | "confortavel" | "moderno",
  "occasions": ["trabalho", "jantar", "encontro", "festa", "casual", "praia", "noite", "viagem"],
  "seasons": ["verao", "inverno", "meia-estacao", "todas"],
  "formality": 3,
  "material": "Algodão | Linho | Denim | Seda | Couro | etc",
  "confidence": 0.95
}
`;

    // Strip base64 prefix if present
    const base64Data = image && image.includes('base64,') ? image.split('base64,')[1] : image;

    // Supported models in priority order
    const candidateModels = [
      'gemini-flash-latest',
      'gemini-3.8-flash',
      'gemini-2.5-flash-lite',
      'gemini-2.5-flash',
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

        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
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

        if (res.ok) {
          const data = await res.json();
          const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (candidateText) {
            const parsed = JSON.parse(candidateText);
            return NextResponse.json({ classification: parsed, modelUsed: model });
          }
        }
      } catch {
        // Try next candidate model
        continue;
      }
    }

    // Graceful fallback to local heuristic engine if API is unavailable or busy
    return NextResponse.json({ fallback: true, message: 'Google API unavailable or busy, falling back to local heuristic' });
  } catch (error) {
    console.error('AI analyze error:', error);
    return NextResponse.json({ fallback: true });
  }
}
