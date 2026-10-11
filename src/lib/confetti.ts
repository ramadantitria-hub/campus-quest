import confetti from 'canvas-confetti';

/**
 * Trigger celebration confetti burst on successful student login or KTM verification
 */
export function fireCelebrationConfetti() {
  if (typeof window === 'undefined') return;

  try {
    // Left burst
    confetti({
      particleCount: 50,
      angle: 60,
      spread: 60,
      origin: { x: 0.15, y: 0.7 },
      colors: ['#38bdf8', '#818cf8', '#34d399', '#fbbf24', '#f43f5e']
    });

    // Right burst
    confetti({
      particleCount: 50,
      angle: 120,
      spread: 60,
      origin: { x: 0.85, y: 0.7 },
      colors: ['#38bdf8', '#818cf8', '#34d399', '#fbbf24', '#f43f5e']
    });

    // Center star burst
    setTimeout(() => {
      confetti({
        particleCount: 40,
        spread: 100,
        origin: { x: 0.5, y: 0.5 },
        ticks: 200,
        gravity: 0.8,
        shapes: ['circle', 'square'],
        colors: ['#38bdf8', '#6366f1', '#10b981', '#f59e0b']
      });
    }, 200);
  } catch (err) {
    console.debug('Confetti canvas trigger skipped:', err);
  }
}
