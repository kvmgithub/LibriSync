import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';

const PROVIDERS_KEY = 'enabled_providers';

export interface EnabledProviders {
  audible: boolean;
  librivox: boolean;
}

interface ProvidersContextValue {
  providers: EnabledProviders;
  setProvider: (provider: keyof EnabledProviders, enabled: boolean) => void;
}

const defaultProviders: EnabledProviders = { audible: true, librivox: true };

const ProvidersContext = createContext<ProvidersContextValue>({
  providers: defaultProviders,
  setProvider: () => {},
});

export function ProvidersProvider({ children }: { children: React.ReactNode }) {
  const [providers, setProviders] = useState<EnabledProviders>(defaultProviders);

  useEffect(() => {
    SecureStore.getItemAsync(PROVIDERS_KEY).then(value => {
      if (value) {
        try {
          setProviders({ ...defaultProviders, ...JSON.parse(value) });
        } catch {}
      }
    });
  }, []);

  const setProvider = useCallback((provider: keyof EnabledProviders, enabled: boolean) => {
    setProviders(prev => {
      // Don't allow disabling both
      const next = { ...prev, [provider]: enabled };
      if (!next.audible && !next.librivox) return prev;

      SecureStore.setItemAsync(PROVIDERS_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return (
    <ProvidersContext.Provider value={{ providers, setProvider }}>
      {children}
    </ProvidersContext.Provider>
  );
}

export function useProviders() {
  return useContext(ProvidersContext);
}
