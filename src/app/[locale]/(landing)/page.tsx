'use client';

import { useExtracted } from 'next-intl';
import ThemeSwitch from "../../_components/layout/theme-switch";
import LanguageToggle from "../../_components/providers/language-toggle";
import Slyv from "../../../../public/slyv";

export default function Home() {
  const t = useExtracted("Home");

  return (
    <div className="flex items-center justify-center">
      <main className="flex gap-10 w-full max-w-3xl flex-col items-center justify-between py-24 px-16 sm:items-start">
        <Slyv />

        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight">
            {t("To get started, edit the page.tsx file.")}
          </h1>
          <div className="flex gap-4 items-center">
            <ThemeSwitch />
            <LanguageToggle />
          </div>
          <p className="max-w-md text-lg leading-8">
            {t("Looking for a starting point or more instructions? Head over to ")}
            <a href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              className="font-medium"
            >
              {t("Templates ")}
            </a>
          </p>
        </div>

        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
          <button>
            Deploy Now
          </button>
          <button className="btn-border">
            Documentation
          </button>
        </div>
      </main>
    </div>
  );
}
