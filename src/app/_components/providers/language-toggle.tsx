'use client';

import { useExtracted, useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';
import { useParams } from 'next/navigation';
import { useState, useTransition } from 'react';
import { CheckIcon, LanguageIcon } from '@heroicons/react/16/solid';
import Popover from '../layout/popover';

export default function LanguageToggle() {
    const t = useExtracted('languages');
    const locale = useLocale();
    const router = useRouter();
    const pathname = usePathname();
    const params = useParams();
    const [isPending, startTransition] = useTransition();
    const [isLanguageOpen, setIsLanguageOpen] = useState(false);

    const languages = [
        { code: 'en', name: t('English') },
        { code: 'es', name: t('Spanish') },
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

    return (
        <Popover
            mode="click"
            position="left-bottom"
            onOpenChange={setIsLanguageOpen}
            trigger={({ onClick }) => (
                <button onClick={onClick} className="btn">
                    <LanguageIcon className="h-5" />
                    <span>{t('Language')}</span>
                </button>
            )}
        >
            <div className="py-3 bg-main/90 rounded-lg shadow-lg border border-border">
                <div className="p-2 rounded-md min-w-[150px]">
                    <span className="hint mb-2 px-2 block">{t('Select language')}</span>
                    <div className="flex flex-col gap-0.5">
                        {languages.map(({ code, name }) => (
                            <button
                                key={code}
                                onClick={() => setLanguage(code)}
                                disabled={isPending}
                                className={`px-3 py-2 rounded-sm text-sm flex justify-between ${locale === code ? 'btn' : 'hover:bg-primary-text/5'}
                                `}
                            >
                                <span>{name}</span>
                                {locale === code && (
                                    <CheckIcon className="w-4"/>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </Popover>
    );
}