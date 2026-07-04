# ngx-local-vault

Reactive, encrypted browser storage for Angular — built on Signals, under 2KB gzipped, zero runtime dependencies.

Most storage wrappers give you a getter/setter pair and leave persistence, encryption, and expiry as an exercise for the consumer. `ngx-local-vault` collapses all three into a single `WritableSignal`: read it like any other signal, write it like any other signal, and the library takes care of encrypting the payload, syncing it to `localStorage` or `sessionStorage`, expiring it on a TTL, and staying inert during SSR.

- **Signals-native** — `watchSignal()` returns a real `WritableSignal<T>`, no wrapper API to learn
- **Encrypted at rest** — payloads are obfuscated before they ever touch the browser's storage
- **TTL built in** — pass `expiresIn: '1m'` and the entry self-destructs, in-tab, without a reload
- **SSR-safe** — guarded by `PLATFORM_ID`, becomes a no-op persistence layer on the server
- **Zero dependencies** — `@angular/core` and `@angular/common` as peers, nothing else

## Install

```bash
npm i ngx-local-vault
```

Supports Angular `17`, `18`, `19`, and `20`.

## Configure

```ts
import { ApplicationConfig } from '@angular/core';
import { provideVault } from 'ngx-local-vault';

export const appConfig: ApplicationConfig = {
  providers: [
    provideVault({ prefix: 'app_', encryptionKey: 'change-me', driver: 'local' })
  ]
};
```

## Use

```ts
import { inject } from '@angular/core';
import { VaultService } from 'ngx-local-vault';

const vault = inject(VaultService);

const theme = vault.watchSignal<'light' | 'dark'>('theme', 'light');
theme.set('dark');
theme();

const session = vault.watchSignal<string | null>('session-token', null, { expiresIn: '15m' });
session.set('jwt-goes-here');
```

`expiresIn` accepts `ms`, `s`, `m`, `h`, or `d` suffixes — `'500ms'`, `'30s'`, `'15m'`, `'2h'`, `'1d'`.

## Demo

**Live:** https://ysndmr.github.io/ngx-local-vault/

`projects/demo-app` is a live showcase: a theme switcher backed by `watchSignal()`, and a TTL demo that saves a mock profile, shows the encrypted ciphertext sitting in `localStorage` next to the decrypted reactive value, and lets you watch it auto-delete after 60 seconds.

```bash
npm install
npm run build:lib
npm start
```

`npm start` serves `demo-app`; the library must be built first since the app imports `ngx-local-vault` from its built output (`dist/ngx-local-vault`), not the source directly — standard Angular library-workspace convention.

## Publishing (maintainer)

1. Log in to npm once, locally:

   ```bash
   npm login
   ```

2. Build the library — this also strips `tslib` from the published `dependencies` (ng-packagr adds it back on every build; `scripts/patch-lib-package.mjs` removes it) so the zero-dependency badge stays honest:

   ```bash
   npm run build:lib
   ```

3. Dry-run the publish before it's live:

   ```bash
   cd dist/ngx-local-vault
   npm publish --dry-run
   ```

4. If the file list and `package.json` look right, publish for real:

   ```bash
   npm publish --access public
   ```

CI (`.github/workflows/publish.yml`) does this automatically on every push to `main`: it builds the library and the demo app, deploys the demo to GitHub Pages, and publishes to npm if an `NPM_TOKEN` secret is configured on the repository (`Settings → Secrets and variables → Actions`). No token, no publish step — the Pages deploy still runs.

## License

MIT
# ngx-local-vault
