import { effect, inject, Injectable, signal, WritableSignal } from '@angular/core';
import { VAULT_CONFIG } from '../config/vault.config';
import { CryptoService } from '../crypto/crypto.service';
import { VaultOptions } from '../types/vault.types';
import { isBrowserPlatform } from '../utils/storage.utils';

interface VaultEntry<T> {
  value: T;
  expiresAt?: number;
}

@Injectable({ providedIn: 'root' })
export class VaultService {
  private readonly config = inject(VAULT_CONFIG);
  private readonly crypto = inject(CryptoService);
  private readonly isBrowser = isBrowserPlatform();
  private readonly timers = new Map<string, ReturnType<typeof setTimeout>>();

  private get storage(): Storage {
    return this.config.driver === 'session' ? sessionStorage : localStorage;
  }

  watchSignal<T>(key: string, defaultValue: T, options?: VaultOptions): WritableSignal<T> {
    const storageKey = this.config.prefix + key;
    const stored = this.isBrowser ? this.readEntry<T>(storageKey) : undefined;
    const isExpired = stored?.expiresAt !== undefined && Date.now() >= stored.expiresAt;

    if (isExpired) {
      this.storage.removeItem(storageKey);
    }

    const initialValue = stored && !isExpired ? stored.value : defaultValue;
    const state = signal<T>(initialValue);

    if (!this.isBrowser) {
      return state;
    }

    let expiresAt = stored && !isExpired ? stored.expiresAt : undefined;
    let isFirstRun = true;
    let suppressPersist = false;

    const expireNow = () => {
      suppressPersist = true;
      this.storage.removeItem(storageKey);
      state.set(defaultValue);
    };

    this.scheduleExpiry(storageKey, expiresAt, expireNow);

    effect(() => {
      const value = state();

      if (suppressPersist) {
        suppressPersist = false;
        isFirstRun = false;
        return;
      }

      if (isFirstRun) {
        isFirstRun = false;
      } else {
        expiresAt = options?.expiresIn ? Date.now() + this.parseDuration(options.expiresIn) : undefined;
        this.scheduleExpiry(storageKey, expiresAt, expireNow);
      }

      this.persist(storageKey, value, expiresAt);
    });

    return state;
  }

  private readEntry<T>(storageKey: string): VaultEntry<T> | undefined {
    const raw = this.storage.getItem(storageKey);
    if (!raw) {
      return undefined;
    }

    try {
      const decrypted = this.crypto.decrypt(raw, this.config.encryptionKey);
      return JSON.parse(decrypted) as VaultEntry<T>;
    } catch {
      return undefined;
    }
  }

  private persist<T>(storageKey: string, value: T, expiresAt: number | undefined): void {
    const entry: VaultEntry<T> = expiresAt === undefined ? { value } : { value, expiresAt };
    const serialized = JSON.stringify(entry);
    const encrypted = this.crypto.encrypt(serialized, this.config.encryptionKey);
    this.storage.setItem(storageKey, encrypted);
  }

  private scheduleExpiry(storageKey: string, expiresAt: number | undefined, onExpire: () => void): void {
    this.clearTimer(storageKey);

    if (expiresAt === undefined) {
      return;
    }

    const remaining = expiresAt - Date.now();

    if (remaining <= 0) {
      onExpire();
      return;
    }

    const timer = setTimeout(onExpire, remaining);
    this.timers.set(storageKey, timer);
  }

  private clearTimer(storageKey: string): void {
    const existing = this.timers.get(storageKey);
    if (existing) {
      clearTimeout(existing);
      this.timers.delete(storageKey);
    }
  }

  private parseDuration(expiresIn: string): number {
    const match = /^(\d+)(ms|s|m|h|d)$/.exec(expiresIn.trim());
    if (!match) {
      return 0;
    }

    const amount = Number(match[1]);
    const unit = match[2];

    switch (unit) {
      case 'ms':
        return amount;
      case 's':
        return amount * 1000;
      case 'm':
        return amount * 60 * 1000;
      case 'h':
        return amount * 60 * 60 * 1000;
      case 'd':
        return amount * 24 * 60 * 60 * 1000;
      default:
        return 0;
    }
  }
}
