import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { UserProvider } from './context/UserContext';
import { MediaCategoryProvider } from './context/MediaCategoryContext';
import { auth } from '@/lib/auth';
import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from '@/app/components/theme-provider';
import { Toaster } from 'sonner';
import { NavigationLoadingProvider } from '@/contexts/NavigationLoadingContext';
import { NavigationLoading } from '@/components/ui/navigation-loading';
import { SessionValidationProvider } from '@/contexts/SessionValidationContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Kent Konut',
  description: 'Kent Konut Yönetim Sistemi',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  return (
    <html lang="tr" suppressHydrationWarning>
      <body className={inter.className}>
        <NavigationLoadingProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <SessionProvider session={session}>
              <SessionValidationProvider
                validationInterval={5 * 60 * 1000} // 5 minutes
                enableAutoValidation={true}
              >
                <UserProvider>
                  <MediaCategoryProvider>
                    <NavigationLoading variant="overlay" />
                    {children}
                  </MediaCategoryProvider>
                </UserProvider>
              </SessionValidationProvider>
            </SessionProvider>
          </ThemeProvider>
          <Toaster />
        </NavigationLoadingProvider>
      </body>
    </html>
  );
}
