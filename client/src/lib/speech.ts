export class SpeechService {
  private static instance: SpeechService;
  private synth: SpeechSynthesis;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isPlaying = false;
  private onStateChange?: (isPlaying: boolean) => void;

  private constructor() {
    this.synth = window.speechSynthesis;
  }

  static getInstance(): SpeechService {
    if (!SpeechService.instance) {
      SpeechService.instance = new SpeechService();
    }
    return SpeechService.instance;
  }

  setStateChangeCallback(callback: (isPlaying: boolean) => void) {
    this.onStateChange = callback;
  }

  speak(text: string, language: 'english' | 'hindi' = 'english'): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!('speechSynthesis' in window)) {
        reject(new Error('Speech synthesis not supported'));
        return;
      }

      // Stop any current speech
      this.stop();

      const utterance = new SpeechSynthesisUtterance(text);
      
      // Set language
      utterance.lang = language === 'hindi' ? 'hi-IN' : 'en-US';
      
      // Set voice properties
      utterance.rate = 0.8; // Slower for kids
      utterance.pitch = 1.1; // Slightly higher pitch
      utterance.volume = 1;

      // Find appropriate voice
      const voices = this.synth.getVoices();
      const preferredVoice = voices.find(voice => 
        voice.lang.startsWith(language === 'hindi' ? 'hi' : 'en')
      );
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onstart = () => {
        this.isPlaying = true;
        this.onStateChange?.(true);
      };

      utterance.onend = () => {
        this.isPlaying = false;
        this.currentUtterance = null;
        this.onStateChange?.(false);
        resolve();
      };

      utterance.onerror = (event) => {
        this.isPlaying = false;
        this.currentUtterance = null;
        this.onStateChange?.(false);
        reject(new Error(`Speech synthesis error: ${event.error}`));
      };

      this.currentUtterance = utterance;
      this.synth.speak(utterance);
    });
  }

  stop() {
    if (this.synth.speaking) {
      this.synth.cancel();
    }
    this.isPlaying = false;
    this.currentUtterance = null;
    this.onStateChange?.(false);
  }

  pause() {
    if (this.synth.speaking && !this.synth.paused) {
      this.synth.pause();
      this.isPlaying = false;
      this.onStateChange?.(false);
    }
  }

  resume() {
    if (this.synth.paused) {
      this.synth.resume();
      this.isPlaying = true;
      this.onStateChange?.(true);
    }
  }

  get playing() {
    return this.isPlaying;
  }
}

export const speechService = SpeechService.getInstance();
