# CombinaKai — Seu Stylist Pessoal no iPhone 👗✨

> *"Fotografe suas roupas. Seu guarda-roupa vira um stylist."*

**CombinaKai** é um webapp mobile-first de moda pessoal desenvolvido especialmente para ser utilizado no **iPhone pelo Safari**, além de Android e Desktop. Ele funciona como um **personal stylist inteligente**, criando combinações sofisticadas a partir das roupas que o usuário realmente já possui no armário.

---

## 🌟 Principais Funcionalidades

1. **Onboarding Imediato sem Fricção**:
   - Não exige cadastro prévio ou login obrigatório para começar.
   - Vem com **14 peças pré-catalogadas em alta resolução** (camisas, camisetas, jeans, alfaiataria, vestidos, calçados e blazer) para você experimentar looks imediatamente.
   - Salva tudo no `localStorage` do navegador com privacidade absoluta.

2. **Cadastro Mobile com Câmera do iPhone**:
   - Botão **+ Adicionar peça** com acesso direto à câmera (`capture="environment"`) ou galeria de fotos.
   - **Tratamento de Estúdio Automático**: Otimiza fotos de 12MP/48MP, aplica fundo de estúdio com iluminação radial suave e sombras elegantes.
   - **Auto-Classificação Inteligente**: Detecta categoria, subcategoria, cores predominantes (com paleta hex), formalidade (1 a 5), estilo e ocasiões recomendadas.

3. **✨ Montar Meu Look (Stylist Assist)**:
   - Escolha o destino: *Trabalho, Encontro, Jantar, Festa, Casual, Praia, Noite, etc.*
   - Escolha o estilo: *Minimalista, Casual Elegante, Social, Streetwear, Romântico* ou **Surpreenda-me**.
   - Clima em tempo real: *Quente, Ameno, Frio, Chuvoso*.
   - **Feed / Carrossel de Looks**: Gera de 4 a 6 combinações exclusivas com pontuação de harmonia visual (ex: *98% Harmonia*).
   - **Explicação de Stylist**: Explica exatamente o porquê a combinação funciona (*"A camisa azul cria contraste harmônico com a calça bege, enquanto o tênis branco equilibra a formalidade"*).

4. **"O que combina com essa peça?"**:
   - Toque em qualquer peça do armário para ver todas as roupas compatíveis e gerar looks completos com ela como protagonista.

5. **Transformações para Vestidos**:
   - Selecione qualquer vestido para ver 3 formas distintas de usar: *Casual Chic Diurno com Tênis*, *Elegante para Jantar com Salto* e *Noite com Blazer*.

6. **"🤔 Não sei o que vestir"**:
   - Botão de emergência matinal que gera uma combinação impecável em 1 toque.

7. **☀️ Look do Dia**:
   - Sugestão diária na tela inicial adaptada ao horário do dia (manhã vs. noite) e às peças menos utilizadas do armário.

8. **"Você quase não usa essas peças" (Wardrobe Reviver)**:
   - Identifica peças paradas no armário e sugere novas combinações para valorizar o investimento do usuário.

9. **📅 Meu Calendário de Looks**:
   - Planeje sua semana atribuindo combinações para Segunda (Trabalho), Quarta (Jantar), Sexta (Encontro), etc.

10. **📲 Compartilhamento pelo WhatsApp e Web Share**:
    - Botão direto para enviar o look formatado no WhatsApp com lista das peças, motivo e link.

11. **📱 PWA & "Adicionar à Tela de Início" no iPhone**:
    - Manifest configurado (`standalone`), ícone com cantos arredondados no estilo Apple, safe area support (Dynamic Island e barra inferior do Safari), e guia passo-a-passo no app.

---

## 🏗️ Arquitetura e Engenharia

- **Framework**: Next.js 16 (App Router) + React 19 + TypeScript
- **Estilização**: Tailwind CSS v4 + Tipografia Google Fonts (`Playfair Display` + `Plus Jakarta Sans`)
- **Ícones**: Lucide React
- **Micro-animações**: Canvas Confetti
- **Serviço de IA Pluggable**:
  - `src/lib/ai/AIService.ts`
  - `src/lib/ai/WardrobeAnalyzer.ts`
  - `src/lib/ai/OutfitGenerator.ts`
  - `src/lib/ai/OutfitRecommendationService.ts`
  - `src/app/api/ai/analyze/route.ts` (integração transparente com Gemini API quando `GEMINI_API_KEY` for configurada, e fallback para o motor heurístico local offline).

---

## 🚀 Como Executar Localmente

```bash
# Instalar dependências
npm install

# Rodar servidor de desenvolvimento
npm run dev

# Abrir no navegador (ou no Safari do iPhone pela mesma rede Wi-Fi)
http://localhost:3000
```

---

## ☁️ Como Fazer Deploy na Vercel

1. Crie um repositório no GitHub e faça o push do projeto:

   ```bash
   git add .
   git commit -m "feat: complete CombinaKai MVP mobile stylist app"
   git push origin main
   ```

2. Acesse [vercel.com](https://vercel.com) e clique em **"Add New Project"**.
3. Importe o repositório `CombinaKai`.
4. (Opcional) Adicione a variável de ambiente:
   - `GEMINI_API_KEY`: sua chave de API da Google Gemini (caso deseje análise por visão na nuvem; o app funciona perfeitamente sem ela graças ao motor local).
5. Clique em **Deploy**.
6. Pronto! O link gerado (ex: `https://combinakai.vercel.app`) pode ser aberto diretamente no iPhone ou enviado no WhatsApp!
