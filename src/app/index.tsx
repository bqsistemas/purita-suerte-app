import React from 'react';
import { RootNavigator } from './navigation';
import { Providers } from './providers';

/**
 * Root App component: Entry point for Purita Suerte.
 * Wraps navigation and providers.
 */
export function App(): React.ReactElement {
  return (
    <Providers>
      <RootNavigator />
    </Providers>
  );
}
