import type { Metadata } from 'next';
import { Lato } from 'next/font/google';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';
import '@/styles/print.css';
import { Providers } from './providers';
import { getSiteUrl } from '@/lib/site-url';

const lato = Lato({
  subsets: ['latin'],
  weight: ['300', '400', '700', '900'],
  display: 'swap',
  variable: '--font-lato',
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: 'METRO – Catalogs',
  description:
    'METRO product catalogs. QX, QS, TS, VR, FM desk systems. FOTA conference furniture. MRC reception desks.',
  authors: [{ name: 'METRO' }],
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
  openGraph: {
    title: 'METRO – Catalogs',
    description: 'Product catalogs – browse by collection',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'METRO – Catalogs',
    description: 'Product catalogs – browse by collection',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={lato.variable}>
      <body>
        <Providers>{children}</Providers>
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
