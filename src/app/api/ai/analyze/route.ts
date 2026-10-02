import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { image, color } = await req.json();

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ fallback: true, message: 'Gemini API Key not provided, using local heuristic' });
    }

    // Call Gemini 2.5 Flash / 1.5 Flash via REST
    const prompt = `
Você é um Personal Stylist e especialista em moda de alta costura.
Analise esta peça de roupa e a cor aproximada informada (${color?.name || 'neutra'}).
Retorne APENAS um JSON no seguinte formato:
{
  "category": "tops" | "bottoms" | "dresses" | "outerwear" | "shoes" | "accessories",
  "subCategory": "Nome específico em português (ex: Camisa Social, Camiseta Básica, Calça Jeans Reta, Blazer)",
  "color": { "name": "nome da cor", "hex": "#hex", "family": "branco|preto|cinza|azul|bege|marrom|verde|vermelho|amarelo|rosa|roxo|laranja" },
  "style": "minimalista" | "casual" | "elegante" | "social" | "streetwear" | "romantico" | "confortavel" | "moderno",
  "occasions": ["trabalho", "jantar", "encontro", "festa", "casual", "praia", "noite", "viagem"],
  "seasons": ["verao", "inverno", "meia-estacao", "todas"],
  "formality": 1 | 2 | 3 | 4 | 5,
  "material": "Algodão | Linho | Denim | Seda | Couro | etc",
  "confidence": 0.95
}
`;

    // Strip base64 prefix if needed
    const base64Data = image.includes('base64,') ? image.split('base64,')[1] : image;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt },
                {
                  inline_data: {
                    mime_type: 'image/jpeg',
                    data: base64Data,
                  },
                },
              ],
            },
          ],
          generationConfig: {
            response_mime_type: 'application/json',
          },
        }),
      }
    );

    if (!res.ok) {
      return NextResponse.json({ fallback: true });
    }

    const data = await res.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (candidateText) {
      const parsed = JSON.parse(candidateText);
      return NextResponse.json({ classification: parsed });
    }

    return NextResponse.json({ fallback: true });
  } catch (error) {
    console.error('AI analyze error:', error);
    return NextResponse.json({ fallback: true });
  }
}
