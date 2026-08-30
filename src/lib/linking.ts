import { Linking } from 'react-native';

import { showOperationError } from './errorAlert';

/** Opens an external destination and always gives a recoverable failure surface. */
export async function openExternalLink(href: string, action = 'open this link'): Promise<boolean> {
  try {
    await Linking.openURL(href);
    return true;
  } catch (error) {
    showOperationError(action, error);
    return false;
  }
}
