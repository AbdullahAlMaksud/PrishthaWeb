// Keyboard typing sound hook
"use client";

import { useEffect, useRef } from "react";

export const useKeyboardSound = (
  enabled: boolean,
  targetRef?: React.RefObject<HTMLElement | null>,
  useAudioFile: boolean = true
) => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!enabled) return;

    // Initialize audio file
    if (useAudioFile && typeof window !== "undefined") {
      if (!audioElementRef.current) {
        audioElementRef.current = new Audio("/audio/keypress-sound.mp3");
        audioElementRef.current.volume = 0.3;
        audioElementRef.current.preload = "auto";
      }
    } else {
      // Initialize AudioContext for synthesized sound
      if (typeof window !== "undefined" && !audioContextRef.current) {
        const AudioContextClass =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext })
            .webkitAudioContext;
        audioContextRef.current = new AudioContextClass();
      }
    }

    const playKeySound = () => {
      if (useAudioFile && audioElementRef.current) {
        // Play audio file
        const audio = audioElementRef.current.cloneNode() as HTMLAudioElement;
        audio.volume = 0.3;
        audio.play().catch(() => {
          // Ignore play errors
        });
      } else if (audioContextRef.current) {
        // Play synthesized sound
        const ctx = audioContextRef.current;
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.frequency.value = 800 + Math.random() * 200;
        oscillator.type = "sine";

        gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(
          0.01,
          ctx.currentTime + 0.05
        );

        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 0.05);
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
  }, [enabled, targetRef, useAudioFile]);
};
