import type { Metadata } from "next";
import Navbar from "../../_components/layout/navbar";
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
};

export default function LandingLayout({ children }: Props) {
  return (
    <section>
        <Navbar />
        {children}
    </section>
  );
}
