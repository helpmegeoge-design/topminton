// Modern notification sound utility - Minimal & Contemporary
export function playNotificationSound() {
    try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const now = audioContext.currentTime;

        // Create two oscillators for a pleasant two-tone chime
        const osc1 = audioContext.createOscillator();
        const osc2 = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        // Connect nodes
        osc1.connect(gainNode);
        osc2.connect(gainNode);
        gainNode.connect(audioContext.destination);

        // Modern frequencies (like iOS notification)
        osc1.frequency.setValueAtTime(1200, now); // C6
        osc2.frequency.setValueAtTime(1600, now); // E6 (major third)

        // Use sine waves for smooth, pleasant tone
        osc1.type = 'sine';
        osc2.type = 'sine';

        // Minimal volume - very subtle
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.12, now + 0.005); // Quick attack
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15); // Smooth decay

        // Very short duration - modern & non-intrusive
        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.15);
        osc2.stop(now + 0.15);

        console.log('✨ Modern notification sound played');
    } catch (error) {
        console.log('Could not play notification sound:', error);
    }
}

// Alternative: Single elegant tone
export function playSimpleBeep() {
    try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const now = audioContext.currentTime;

        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        // Clean, minimal tone
        oscillator.frequency.value = 1400;
        oscillator.type = 'sine';

        // Smooth envelope
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.08, now + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

        oscillator.start(now);
        oscillator.stop(now + 0.12);
    } catch (error) {
        console.log('Could not play beep:', error);
    }
}
