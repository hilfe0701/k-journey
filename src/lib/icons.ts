import * as LucideIcons from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';

const ICON_LIBRARY = LucideIcons as unknown as Record<string, LucideIcon>;

export function resolveIcon(name: string, fallback: LucideIcon = LucideIcons.Sparkles): LucideIcon {
  return ICON_LIBRARY[name] ?? fallback;
}
