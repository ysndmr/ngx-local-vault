import { Component, computed, effect, inject, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { VaultService } from '@ngx-vault/local-vault';

interface DemoProfile {
  name: string;
  token: string;
}

@Component({
  selector: 'app-root',
  imports: [JsonPipe],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private readonly vault = inject(VaultService);

  protected readonly theme = this.vault.watchSignal<'light' | 'dark'>('theme', 'light');
  protected readonly profile = this.vault.watchSignal<DemoProfile | null>('profile', null, { expiresIn: '1m' });

  protected readonly nameInput = signal('');
  protected readonly tokenInput = signal('');
  protected readonly savedAt = signal<number | null>(null);
  protected readonly now = signal(Date.now());
  protected readonly rawStorage = signal(this.readRawStorage());

  protected readonly secondsLeft = computed(() => {
    const saved = this.savedAt();
    if (saved === null) {
      return 0;
    }
    const elapsed = Math.floor((this.now() - saved) / 1000);
    return Math.max(60 - elapsed, 0);
  });

  constructor() {
    this.applyTheme(this.theme());

    effect(() => {
      this.applyTheme(this.theme());
    });

    effect(() => {
      if (this.profile() === null) {
        this.savedAt.set(null);
      }
    });

    setInterval(() => {
      this.now.set(Date.now());
      this.rawStorage.set(this.readRawStorage());
    }, 500);
  }

  toggleTheme(): void {
    this.theme.update((current) => (current === 'light' ? 'dark' : 'light'));
  }

  saveProfile(): void {
    const name = this.nameInput().trim();
    const token = this.tokenInput().trim();

    if (!name || !token) {
      return;
    }

    this.profile.set({ name, token });
    this.savedAt.set(Date.now());
    this.nameInput.set('');
    this.tokenInput.set('');
  }

  onNameInput(event: Event): void {
    this.nameInput.set((event.target as HTMLInputElement).value);
  }

  onTokenInput(event: Event): void {
    this.tokenInput.set((event.target as HTMLInputElement).value);
  }

  private applyTheme(value: 'light' | 'dark'): void {
    document.documentElement.setAttribute('data-theme', value);
  }

  private readRawStorage(): string {
    return localStorage.getItem('demo_profile') ?? 'empty — nothing saved yet';
  }
}
