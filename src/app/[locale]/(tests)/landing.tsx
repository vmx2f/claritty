'use client';

import { useExtracted } from 'next-intl';
import Link from 'next/link';

export default function Home() {
  const t = useExtracted("Home");

  return (
    // Main container takes full height minus navbar
    <div className="flex flex-col lg:flex-row h-screen pt-16">
      
      {/* --- LEFT SIDE: INFO --- */}
      <main className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 lg:px-24 py-12">
        <div className="max-w-md">
          <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight  leading-[1.1] mb-6">
            {t("Management made ")}
            <br />
            <span className="underline decoration-4 decoration-text/50 underline-offset-4">
               {t("Clear.")}
            </span>
          </h1>

          {/* Subtext */}
          <p className="text-lg mb-8 leading-relaxed">
            {t("Set of tools made to have an easier business management.")}
          </p>
          {/* <div className="flex flex-col sm:flex-row gap-4">
            <button className="h-12 px-8 rounded-md font-semibold hover:bg-primary-800 transition-all">
              {t("Start for free")}
            </button>
          </div> */}

          {/* Minimal Footer Info */}
          <div className="mt-12 pt-8 border-t border-border text-sm text-subtle">
            <p>{t("Never loose track of your businesses")}</p>
          </div>
        </div>
      </main>

      <aside className="relative w-full lg:w-1/2 bg-main/60 flex items-center justify-center overflow-hidden border-t lg:border-t-0 lg:border-l border-border">
            <Link href="/register" className="text-sm font-medium px-4 py-2 rounded-md hover:bg-primary-text/10 transition-colors">
              {t('Register')}
            </Link>
            <Link href="/login" className="text-sm font-medium px-4 py-2 rounded-md hover:bg-primary-text/10 transition-colors">
              {t('Login')}
            </Link>
      </aside>
    </div>
  );
}