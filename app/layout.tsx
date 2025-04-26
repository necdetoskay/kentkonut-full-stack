import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { UserProvider } from './context/UserContext';
import { auth } from '@/lib/auth';
import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from '@/app/components/theme-provider';
import { Toaster } from 'sonner';

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
      <head>
        <script dangerouslySetInnerHTML={{
          __html: `
            // Global değişken, formların düzenlenip düzenlenmediğini takip etmek için
            window.isAnyFormDirty = false;
            
            // Varsayılan tarayıcı beforeunload uyarılarını kontrol etmek için
            window.addEventListener('beforeunload', function (e) {
              // Sadece bir form değiştiyse uyarı gösterelim, aksi takdirde sessizce kapatalım
              if (!window.isAnyFormDirty) {
                // Hiçbir form değişmedi, olayı engelleyelim ve sayfanın kapanmasına izin verelim
                e.preventDefault();
                e.returnValue = '';
                return '';
              }
              
              // Bir form değiştiyse, tarayıcının kendi uyarısının gösterilmesine izin ver
              // Ancak modern tarayıcılar kendi mesajlarını kullanacaklar
              // e'yi engellemeyelim, ancak boş returnValue ayarlayalım
              e.returnValue = '';
            });
          `
        }} />
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SessionProvider session={session}>
            <UserProvider>
              <div className="flex min-h-screen flex-col">
                <div className="flex-1">{children}</div>
                <div className="fixed bottom-4 right-4 w-[400px] z-50">
                  <Toaster />
                </div>
              </div>
            </UserProvider>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
