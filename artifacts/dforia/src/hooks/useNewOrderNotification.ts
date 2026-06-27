import { useEffect, useRef, useCallback } from "react";

function playChime() {
  try {
    const ctx = new AudioContext();

    const playTone = (freq: number, startTime: number, duration: number, gain: number) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      osc.connect(gainNode);
      gainNode.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, startTime);
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(gain, startTime + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
      osc.start(startTime);
      osc.stop(startTime + duration);
    };

    const now = ctx.currentTime;
    playTone(880, now, 0.3, 0.4);
    playTone(1108, now + 0.15, 0.3, 0.35);
    playTone(1318, now + 0.3, 0.5, 0.3);

    setTimeout(() => ctx.close(), 1500);
  } catch {
    // AudioContext not supported
  }
}

export function useNewOrderNotification(enabled: boolean = true) {
  const prevCountRef = useRef<number | null>(null);
  const isFirstRunRef = useRef(true);

  const getWaitingCount = useCallback(() => {
    try {
      const raw = localStorage.getItem("dforia_orders");
      if (!raw) return 0;
      const orders: any[] = JSON.parse(raw);
      return orders.filter(o => o.status === "Menunggu").length;
    } catch {
      return 0;
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const check = () => {
      const count = getWaitingCount();

      if (isFirstRunRef.current) {
        prevCountRef.current = count;
        isFirstRunRef.current = false;
        return;
      }

      if (prevCountRef.current !== null && count > prevCountRef.current) {
        playChime();
      }

      prevCountRef.current = count;
    };

    check();
    const interval = setInterval(check, 3000);
    return () => clearInterval(interval);
  }, [enabled, getWaitingCount]);
}
