"use client";

import * as React from "react";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { UserProvider } from "./context/UserContext";
import { MediaCategoryProvider } from "./context/MediaCategoryContext";

interface ThemeProviderProps {
  children: React.ReactNode;
  attribute?: "class" | "data-theme" | "data-mode";
  defaultTheme?: string;
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
}

export function Providers({ children, ...props }: ThemeProviderProps) {
  return (
    <SessionProvider>
      <MediaCategoryProvider>
        <UserProvider>
          <NextThemesProvider {...props}>
            {children}
          </NextThemesProvider>
        </UserProvider>
      </MediaCategoryProvider>
    </SessionProvider>
  );
}