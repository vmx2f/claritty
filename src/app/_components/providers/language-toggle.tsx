'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { useParams } from 'next/navigation';
import { useTransition } from 'react';

export default function LanguageToggle() {
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();
    const params = useParams();
    const [isPending, startTransition] = useTransition();

    const languages = [
        { code: 'en', name: 'English' },
        { code: 'es', name: 'Español' }
    ];

    function setLanguage(nextLocale: string) {
        startTransition(() => {
            router.replace(
                // @ts-expect-error -- TypeScript will validate that only known `params`
                // are used in combination with a given `pathname`. Since the two will
                // always match for the current route, we can skip runtime checks.
                { pathname, params },
                { locale: nextLocale }
            );
        });
    }

    const selectedLanguage = languages.find(l => l.code === locale);

    return (
        <label className="select-border">
            <span className="sr-only">Change language</span>
            <select
                defaultValue={locale}
                className="bg-main focus-within:outline-none active:"
                onChange={(e) => setLanguage(e.target.value)}
                disabled={isPending}
            >
                <option value="en">English</option>
                <option value="es">Español</option>
            </select>
        </label>
    );
}