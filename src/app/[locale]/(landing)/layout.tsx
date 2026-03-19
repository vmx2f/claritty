import type { Metadata } from "next";
import { getExtracted } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getExtracted('metadata' );
  const t2 = await getExtracted('metadata.keywords');

  const keywords = [
    t2('keyword-1'),
    t2('keyword-2'),
  ];

  return {
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
  auth: React.ReactNode;
};

export default function LandingLayout({ children, auth }: Props) {
  return (
    <section className="flex flex-col lg:flex-row h-screen">
      <main className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 items-center py-12">
        {children}
        </main>
        <aside className="lg:w-1/2 bg-main/60 flex items-center justify-center flex-col gap-8 py-12 border-t lg:border-t-0 lg:border-l border-border">
        {auth}
        </aside>
    </section>
  );
}
