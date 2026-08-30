import * as LucideIcons from 'lucide-react-native';
import { createElement, type ReactElement } from 'react';
import type { LucideIcon, LucideProps } from 'lucide-react-native';

const ICON_LIBRARY = LucideIcons as unknown as Record<string, LucideIcon>;

export function resolveIcon(name: string, fallback: LucideIcon = LucideIcons.Sparkles): LucideIcon {
  return ICON_LIBRARY[name] ?? fallback;
}

/** Render a data-selected icon without creating a component inside the caller's render. */
export function iconElement(
  name: string,
  props: LucideProps,
  fallback: LucideIcon = LucideIcons.Sparkles,
): ReactElement {
  return createElement(resolveIcon(name, fallback), props);
}
