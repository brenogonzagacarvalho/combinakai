import type { Metadata, Viewport } from 'next';
import { Playfair_Display, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { WardrobeProvider } from '@/context/WardrobeContext';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
});

const sans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#FBF9F5',
};

export const metadata: Metadata = {
  metadataBase: new URL('https://combinakai.vercel.app'),
  title: 'CombinaKai — Seu Stylist Pessoal no iPhone',
  description: 'Fotografe suas roupas. Seu guarda-roupa vira um stylist inteligente para criar combinações perfeitas.',
  manifest: '/manifest.json',
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'CombinaKai',
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://combinakai.vercel.app',
    title: 'CombinaKai — Fotografe suas roupas. Seu guarda-roupa vira um stylist.',
    description: 'Monte looks elegantes usando apenas as peças que você já tem no armário.',
    siteName: 'CombinaKai',
    images: [
      {
        url: '/icon.svg',
        width: 512,
        height: 512,
        alt: 'CombinaKai Stylist',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CombinaKai — Seu Stylist Pessoal',
    description: 'Fotografe suas roupas. Seu guarda-roupa vira um stylist inteligente.',
    images: ['/icon.svg'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${playfair.variable} ${sans.variable}`}>
      <body className="font-sans antialiased bg-[#FBF9F5] text-[#111110] min-h-screen selection:bg-[#C29F68]/20 selection:text-[#111110]">
        <WardrobeProvider>
          <div className="mx-auto max-w-md min-h-screen flex flex-col relative shadow-xl shadow-stone-200/50 bg-[#FBF9F5]">
            {children}
          </div>
        </WardrobeProvider>
      </body>
    </html>
  );
}
