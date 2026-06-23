// Keyboard typing sound hook
"use client";

import { useEffect, useRef } from "react";

export const useKeyboardSound = (
  enabled: boolean,
  targetRef?: React.RefObject<HTMLElement | null>,
  soundType: string = "default"
) => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!enabled) return;

    // Initialize AudioContext if we are using synthesized sounds
    if (soundType !== "default" && typeof window !== "undefined" && !audioContextRef.current) {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioContextRef.current = new AudioContextClass();
    }

    const playKeySound = () => {
      if (soundType === "default" && typeof window !== "undefined") {
        // Play typewriter audio file
        if (!audioElementRef.current) {
          audioElementRef.current = new Audio("/audio/keypress-sound.mp3");
          audioElementRef.current.volume = 0.3;
          audioElementRef.current.preload = "auto";
        }
        const audio = audioElementRef.current.cloneNode() as HTMLAudioElement;
        audio.volume = 0.3;
        audio.play().catch(() => {
          // Ignore play errors
        });
      } else {
        // Synthesize sound using AudioContext (mechanical, digital, bubble)
        if (typeof window === "undefined") return;
        const ctx = audioContextRef.current || new (window.AudioContext || (window as any).webkitAudioContext)();
        if (!audioContextRef.current) {
          audioContextRef.current = ctx;
        }

        // Resume AudioContext if suspended (browser security block)
        if (ctx.state === "suspended") {
          ctx.resume();
        }

        const now = ctx.currentTime;
        const gainNode = ctx.createGain();
        gainNode.connect(ctx.destination);

        if (soundType === "mechanical") {
          // Cherry MX Clicky Switch Synthesis
          // Click transient (high-frequency sharp tick)
          const osc1 = ctx.createOscillator();
          const gain1 = ctx.createGain();
          osc1.connect(gain1);
          gain1.connect(gainNode);

          osc1.type = "triangle";
          osc1.frequency.setValueAtTime(3200, now);
          osc1.frequency.exponentialRampToValueAtTime(900, now + 0.008);
          
          gain1.gain.setValueAtTime(0.18, now);
          gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.012);

          // Plastic bottom-out thud (low-frequency resonance)
          const osc2 = ctx.createOscillator();
          const gain2 = ctx.createGain();
          osc2.connect(gain2);
          gain2.connect(gainNode);

          osc2.type = "sine";
          osc2.frequency.setValueAtTime(140, now);
          osc2.frequency.linearRampToValueAtTime(70, now + 0.035);

          gain2.gain.setValueAtTime(0.35, now);
          gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

          osc1.start(now);
          osc1.stop(now + 0.015);
          osc2.start(now);
          osc2.stop(now + 0.04);

        } else if (soundType === "digital") {
          // Digital Click / Beep
          const osc = ctx.createOscillator();
          osc.connect(gainNode);

          osc.type = "sine";
          osc.frequency.setValueAtTime(950 + Math.random() * 80, now);

          gainNode.gain.setValueAtTime(0.06, now);
          gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.022);

          osc.start(now);
          osc.stop(now + 0.025);

        } else if (soundType === "bubble") {
          // Bubble Pop Sound
          const osc = ctx.createOscillator();
          osc.connect(gainNode);

          osc.type = "sine";
          osc.frequency.setValueAtTime(220, now);
          osc.frequency.exponentialRampToValueAtTime(1300, now + 0.04); // rapid frequency sweep up

          gainNode.gain.setValueAtTime(0.18, now);
          gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.042);

          osc.start(now);
          osc.stop(now + 0.045);
        }
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Only play sound for actual character keys
      if (
        e.key.length === 1 ||
        e.key === "Enter" ||
        e.key === "Backspace" ||
        e.key === "Space"
      ) {
        playKeySound();
      }
    };

    const target = targetRef?.current || document;
    target.addEventListener("keydown", handleKeyDown as EventListener);

    return () => {
      target.removeEventListener("keydown", handleKeyDown as EventListener);
    };
  }, [enabled, targetRef, soundType]);
};
