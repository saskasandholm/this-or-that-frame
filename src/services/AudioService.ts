/**
 * Service for playing audio effects in the app
 */
class AudioService {
  private static instance: AudioService;
  private sounds: Map<string, HTMLAudioElement> = new Map();
  private enabled: boolean = true;

  private constructor() {
    // Check if we're in a browser environment
    if (typeof window !== 'undefined') {
      this.preloadSounds();
    }
  }

  static getInstance(): AudioService {
    if (!AudioService.instance) {
      AudioService.instance = new AudioService();
    }
    return AudioService.instance;
  }

  private preloadSounds(): void {
    // Preload common sounds
    this.loadSound('vote', '/audio/vote.mp3');
    this.loadSound('success', '/audio/success.mp3');
    this.loadSound('error', '/audio/error.mp3');
  }

  private loadSound(name: string, path: string): void {
    if (typeof window !== 'undefined') {
      try {
        const audio = new Audio(path);
        audio.preload = 'auto';
        this.sounds.set(name, audio);
      } catch (error) {
        console.error(`Failed to load sound: ${name}`, error);
      }
    }
  }

  play(name: string): void {
    if (!this.enabled || typeof window === 'undefined') return;

    const sound = this.sounds.get(name);
    if (sound) {
      // Create a clone to allow for overlapping sounds
      const clone = sound.cloneNode() as HTMLAudioElement;
      clone.volume = 0.5;
      clone.play().catch(err => console.error(`Error playing sound ${name}:`, err));
    } else {
      console.warn(`Sound ${name} not found`);
    }
  }

  enable(): void {
    this.enabled = true;
  }

  disable(): void {
    this.enabled = false;
  }

  isEnabled(): boolean {
    return this.enabled;
  }
}

export default AudioService.getInstance();
