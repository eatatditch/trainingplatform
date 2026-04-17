"use client";

import { useEffect, useRef, useState } from "react";

export function useVoiceInput(onTranscript: (text: string) => void, onDisplay: (text: string) => void) {
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(false);
  const recognitionRef = useRef<any>(null);
  const transcriptRef = useRef<string>("");
  const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    setSupported(!!SR);
  }, []);

  const toggle = () => {
    if (listening) {
      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
      transcriptRef.current = "";
      recognitionRef.current?.abort();
      recognitionRef.current = null;
      setListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = "en-US";
      recognition.interimResults = true;
      recognition.continuous = true;
      recognition.maxAlternatives = 1;
      recognitionRef.current = recognition;
      transcriptRef.current = "";

      const SILENCE_MS = 1500;

      const armSilenceTimer = () => {
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = setTimeout(() => recognition.stop(), SILENCE_MS);
      };

      recognition.onresult = (event: any) => {
        let finalText = "";
        let interimText = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) finalText += result[0].transcript;
          else interimText += result[0].transcript;
        }
        if (finalText) transcriptRef.current = (transcriptRef.current + " " + finalText).trim();
        const display = (transcriptRef.current + " " + interimText).trim();
        onDisplay(display);
        armSilenceTimer();
      };

      recognition.onspeechstart = () => armSilenceTimer();

      recognition.onend = () => {
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
        recognitionRef.current = null;
        setListening(false);
        const final = transcriptRef.current.trim();
        transcriptRef.current = "";
        if (final) onTranscript(final);
      };

      recognition.onerror = () => {
        if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        silenceTimerRef.current = null;
        recognitionRef.current = null;
        transcriptRef.current = "";
        setListening(false);
      };

      recognition.start();
      setListening(true);
      armSilenceTimer();
    } catch {
      setListening(false);
    }
  };

  return { listening, supported, toggle };
}
