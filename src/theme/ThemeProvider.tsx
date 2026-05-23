import React, { createContext, useContext, useMemo } from 'react';
import { palette, semantic, typography, space, radius, elevation, motion } from '../../design-tokens';
import { ERAS, EraTheme, EraKey } from './eras';

export interface Theme {
  era: EraTheme;
  palette: typeof palette;
  semantic: typeof semantic;
  typography: typeof typography;
  space: typeof space;
  radius: typeof radius;
  elevation: typeof elevation;
  motion: typeof motion;
}

const ThemeContext = createContext<Theme | null>(null);

interface ThemeProviderProps {
  era: EraKey;
  children: React.ReactNode;
}

export function ThemeProvider({ era, children }: ThemeProviderProps) {
  const theme = useMemo<Theme>(
    () => ({
      era: ERAS[era],
      palette,
      semantic,
      typography,
      space,
      radius,
      elevation,
      motion,
    }),
    [era],
  );

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used inside ThemeProvider');
  }
  return ctx;
}
