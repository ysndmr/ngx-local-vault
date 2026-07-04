import { EnvironmentProviders, InjectionToken, makeEnvironmentProviders } from '@angular/core';
import { VaultConfig } from '../types/vault.types';

export const DEFAULT_VAULT_CONFIG: VaultConfig = {
  prefix: 'vault_',
  encryptionKey: 'ngx-local-vault',
  driver: 'local'
};

export const VAULT_CONFIG = new InjectionToken<VaultConfig>('VAULT_CONFIG', {
  factory: () => DEFAULT_VAULT_CONFIG
});

export function provideVault(config?: Partial<VaultConfig>): EnvironmentProviders {
  return makeEnvironmentProviders([
    {
      provide: VAULT_CONFIG,
      useValue: { ...DEFAULT_VAULT_CONFIG, ...config }
    }
  ]);
}
