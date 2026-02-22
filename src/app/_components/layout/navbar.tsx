'use client';

import Link from "next/link";
import { useExtracted } from "next-intl";
import ThemeSwitch from "./theme-switch";
import LanguageToggle from "../providers/language-toggle";
import Slyv from "../../../../public/slyv"; 
import { AuthButton } from "../auth/auth-button";


export default function Navbar() {
  const t = useExtracted("Navbar");

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-gray-200">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
        
        {/* Logo */}
        <div className="flex items-center gap-2">
            <Slyv className="size-15"/> 
          <span className="text-lg font-bold tracking-tight">
            Claritty
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-6">
          <div className="hidden sm:flex items-center gap-2">
            <ThemeSwitch />
            <LanguageToggle />
          </div>
          
          <div className="h-4 w-px hidden sm:block"></div>
          <AuthButton />
        </div>
      </div>
    </header>
  );
}

