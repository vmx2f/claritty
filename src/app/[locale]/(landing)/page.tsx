'use client';

import { useExtracted } from 'next-intl';
import Slyv from "../../../../public/slyv";

export default function Home() {
  const t = useExtracted("Home");

  return (
    // Main container takes full height minus navbar
    <div className="flex flex-col lg:flex-row h-screen pt-16">
      
      {/* --- LEFT SIDE: INFO --- */}
      <main className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 lg:px-24 py-12">
        <div className="max-w-md">
          
          {/* Tagline */}
          <div className="mb-6 inline-flex items-center border border-gray-200 dark:border-gray-800 rounded-full px-3 py-1 text-xs font-medium uppercase tracking-wide">
            {t("Currently Free for Beta")}
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight  leading-[1.1] mb-6">
            {t("Management made ")}
            <br />
            <span className="underline decoration-4 decoration-gray-300 dark:decoration-gray-700 underline-offset-4">
               {t("Clear.")}
            </span>
          </h1>

          {/* Subtext */}
          <p className="text-lg mb-8 leading-relaxed">
            {t("Claritty is the clutter-free way to manage your small business. No complex spreadsheets, just the essential tools you need to grow.")}
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button className="h-12 px-8 rounded-md font-semibold hover:bg-primary-800 transition-all">
              {t("Start for free")}
            </button>
          </div>

          {/* Minimal Footer Info */}
          <div className="mt-12 pt-8 border-t border-gray-100 text-sm text-gray-400">
            <p>{t("Never loose track of your businesses")}</p>
          </div>
        </div>
      </main>

      {/* --- RIGHT SIDE: LOGO + HALFTONE --- */}
      <aside className="relative w-full lg:w-1/2 bg-gray-50 flex items-center justify-center overflow-hidden border-t lg:border-t-0 lg:border-l border-gray-200 bg-primary-text/10">
        
        {/* Halftone Pattern Background */}
        <div className="absolute inset-0 z-0 opacity-40 dark:opacity-20"
             style={{
               backgroundImage: 'radial-gradient(#9ca3af 1px, transparent 1px)',
               backgroundSize: '24px 24px'
             }}>
        </div>

        {/* Big Abstract Logo Placement */}
        <div className="relative z-10 w-64 h-64 sm:w-96 sm:h-96 animate-in fade-in zoom-in duration-1000">
           {/* Rendering the Slyv logo very large as the main graphic */}
           <Slyv className="w-full h-full drop-shadow-8xl " />
        </div>

      </aside>
    </div>
  );
}