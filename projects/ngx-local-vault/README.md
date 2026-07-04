# ngx-local-vault

Reactive, encrypted browser storage for Angular — built on Signals, under 2KB gzipped, zero runtime dependencies.

## Install

```bash
npm i @ngx-vault/local-vault
```

Supports Angular `17`, `18`, `19`, and `20`.

## Configure

```ts
import { ApplicationConfig } from '@angular/core';
import { provideVault } from '@ngx-vault/local-vault';

export const appConfig: ApplicationConfig = {
  providers: [
    provideVault({ prefix: 'app_', encryptionKey: 'change-me', driver: 'local' })
  ]
};
```

## Use

```ts
import { inject } from '@angular/core';
import { VaultService } from '@ngx-vault/local-vault';

const vault = inject(VaultService);

const theme = vault.watchSignal<'light' | 'dark'>('theme', 'light');
theme.set('dark');
theme();

const session = vault.watchSignal<string | null>('session-token', null, { expiresIn: '15m' });
session.set('jwt-goes-here');
```

`expiresIn` accepts `ms`, `s`, `m`, `h`, or `d` suffixes — `'500ms'`, `'30s'`, `'15m'`, `'2h'`, `'1d'`.

## License

MIT
