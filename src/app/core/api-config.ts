import { InjectionToken } from '@angular/core';

interface OrderFlowRuntimeConfig {
  readonly apiBaseUrl?: string;
}

type ConfiguredGlobal = typeof globalThis & {
  readonly ORDERFLOW_CONFIG?: OrderFlowRuntimeConfig;
};

export const DEFAULT_ORDERFLOW_API_BASE_URL = 'http://localhost:5099';

export const ORDERFLOW_API_BASE_URL = new InjectionToken<string>('ORDERFLOW_API_BASE_URL', {
  providedIn: 'root',
  factory: () => {
    const configuredUrl = (globalThis as ConfiguredGlobal).ORDERFLOW_CONFIG?.apiBaseUrl?.trim();

    return (configuredUrl || DEFAULT_ORDERFLOW_API_BASE_URL).replace(/\/+$/, '');
  },
});
