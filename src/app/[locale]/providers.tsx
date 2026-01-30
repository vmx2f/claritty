'use client';

import { ThemeProvider } from 'next-themes';
import { ConvexClientProvider } from '../_components/providers/convex-client-provider';

type Props = {
    children: React.ReactNode;
};

export function Providers({ children }: Props) {
    return (
        <ThemeProvider attribute="class" defaultTheme="dark">
            <ConvexClientProvider>
                {children}
            </ConvexClientProvider>
        </ThemeProvider>
    );
}
