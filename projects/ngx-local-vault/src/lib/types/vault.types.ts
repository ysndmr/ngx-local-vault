export interface VaultConfig {
  prefix: string;
  encryptionKey: string;
  driver: 'local' | 'session';
}

export interface VaultOptions {
  expiresIn?: string;
}
