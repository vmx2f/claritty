import { useExtracted } from 'next-intl';
import Link from 'next/link';

export default function Home() {
  const t = useExtracted("Home");

  return (
    <div className="flex flex-col lg:flex-row h-screen px-4 py-2">
      <main className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 items-center py-12">
        <div className="max-w-md">
          <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight leading-[1.1] mb-6">
            {t("Welcome Back!")}
          </h1>
          <p className="text-lg mb-8 leading-relaxed">
            {t("Log-in to your account or register and ask your manager to invite you to your organization.")}
          </p>
          <div className="mt-12 pt-8 border-t border-border text-sm text-subtle">
            <p>{t("Made by vmx")}</p>
          </div>
        </div>
      </main>

      <aside className="w-full lg:w-1/2 bg-main/60 flex items-center justify-center border-t lg:border-t-0 lg:border-l border-border flex-col gap-12">
        <Link href="/register" className="btn w-64">
          {t('Register')}
        </Link>
        <Link href="/login" className="btn btn-reverse w-64">
          {t('Login')}
        </Link>
      </aside>
    </div>
  );
}