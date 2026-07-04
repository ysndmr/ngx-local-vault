import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkgPath = join(__dirname, '../dist/ngx-local-vault/package.json');
const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));

pkg.dependencies = {};

writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
