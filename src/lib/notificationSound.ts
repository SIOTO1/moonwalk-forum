// Notification sound utility using Web Audio API
// Generates a pleasant notification chime without external files

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  
  if (!audioContext) {
    try {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (e) {
      console.warn('Web Audio API not supported');
      return null;
    }
  }
  return audioContext;
}

export function playNotificationSound(volume: number = 0.3) {
  const ctx = getAudioContext();
  if (!ctx) return;

  // Resume context if suspended (required for autoplay policies)
  if (ctx.state === 'suspended') {
    ctx.resume();
  }

  const now = ctx.currentTime;

  // Create a pleasant two-tone notification chime
  const frequencies = [880, 1108.73]; // A5 and C#6 - a major third interval
  
  frequencies.forEach((freq, index) => {
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(freq, now);

    // Envelope for a soft, pleasant sound
    const startTime = now + index * 0.08;
    const attackTime = 0.01;
    const decayTime = 0.15;
    const sustainLevel = 0.4;
    const releaseTime = 0.3;

    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(volume, startTime + attackTime);
    gainNode.gain.linearRampToValueAtTime(volume * sustainLevel, startTime + attackTime + decayTime);
    gainNode.gain.linearRampToValueAtTime(0, startTime + attackTime + decayTime + releaseTime);

    oscillator.start(startTime);
    oscillator.stop(startTime + attackTime + decayTime + releaseTime + 0.01);
  });
}

// Storage key for sound preference
const NOTIFICATION_SOUND_KEY = 'notification-sound-enabled';

export function isNotificationSoundEnabled(): boolean {
  if (typeof window === 'undefined') return true;
  const stored = localStorage.getItem(NOTIFICATION_SOUND_KEY);
  return stored === null ? true : stored === 'true';
}

export function setNotificationSoundEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(NOTIFICATION_SOUND_KEY, String(enabled));
}

export function toggleNotificationSound(): boolean {
  const newValue = !isNotificationSoundEnabled();
  setNotificationSoundEnabled(newValue);
  return newValue;
}
