import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { Providers } from "./providers";
import { getExtracted } from "next-intl/server";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getExtracted('metadata');
  const t2 = await getExtracted('metadata.keywords');

  const keywords = [
    t2('keyword-1'),
    t2('keyword-2'),
  ];

  return {
    icons: {
      icon: "../icon.svg",
    },
    title: t('Home'),
    description: t('description'),
    keywords,
    openGraph: {
      title: t('title'),
      description: t('description'),
      url: `url`,
      siteName: 'mysite',
      type: 'website',
      images: [
        {
          url: 'imageurl',
          width: 1200,
          height: 630,
          alt: t('alt text'),
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('title'),
      description: t('description'),
      images: ['imageurl'],
    },
  };
}

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function RootLayout({ children, params }: Props) {
  // Ensure the incomming locale is valid
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  return (
    <html lang={locale} suppressHydrationWarning>
      <body>
        <Providers>
          <NextIntlClientProvider>
            {children}
          </NextIntlClientProvider>
        </Providers>
      </body>
    </html>
  );
}
