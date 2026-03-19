import ThemeSwitch from '@/app/_components/layout/theme-switch';
import LanguageToggle from '@/app/_components/providers/language-toggle';
import { useExtracted } from 'next-intl';

export default function Home() {
  const t = useExtracted("Home");

  return (
    <div className="max-w-md">
      <h1 className='title'>
        {t("Welcome Back!")}
      </h1>
      <p>
        {t("Log-in to your account or register and ask your manager to invite you to your organization.")}
      </p>
      <div className='flex gap-2 mt-10'>
        <LanguageToggle />
        <ThemeSwitch />
      </div>
      <p className='mt-12 pt-8 border-t border-border hint'>
        {t("Made by vmx")}
      </p>
    </div>
  );
}