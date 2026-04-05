"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock } from "lucide-react";

const REQUIRED_SECONDS = 300; // 5 minutes

export function MarkCompleteButton({ moduleId }: { moduleId: string }) {
  const [loading, setLoading] = useState(false);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [unlocked, setUnlocked] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check if this module was already timed in this session
    const storageKey = `module-timer-${moduleId}`;
    const stored = sessionStorage.getItem(storageKey);
    const startTime = stored ? parseInt(stored) : Date.now();

    if (!stored) {
      sessionStorage.setItem(storageKey, startTime.toString());
    }

    const updateTimer = () => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      setSecondsElapsed(elapsed);
      if (elapsed >= REQUIRED_SECONDS) {
        setUnlocked(true);
        if (timerRef.current) clearInterval(timerRef.current);
      }
    };

    updateTimer();
    timerRef.current = setInterval(updateTimer, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [moduleId]);

  const handleComplete = async () => {
    if (!unlocked) return;
    setLoading(true);
    try {
      const res = await fetch("/api/modules/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moduleId }),
      });
      if (res.ok) {
        // Clear timer from session storage
        sessionStorage.removeItem(`module-timer-${moduleId}`);
        router.refresh();
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  const remaining = Math.max(0, REQUIRED_SECONDS - secondsElapsed);
  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;

  if (!unlocked) {
    return (
      <div className="flex flex-col items-end gap-2">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Clock className="w-4 h-4" />
          <span>Review time remaining: <span className="font-mono font-medium text-gray-600">{minutes}:{seconds.toString().padStart(2, "0")}</span></span>
        </div>
        <Button disabled size="lg" className="flex items-center gap-2 opacity-50 cursor-not-allowed">
          <CheckCircle2 className="w-5 h-5" />
          Mark as Complete
        </Button>
        <p className="text-xs text-gray-400">Please review the module content for at least 5 minutes</p>
      </div>
    );
  }

  return (
    <Button onClick={handleComplete} disabled={loading} size="lg" className="flex items-center gap-2">
      <CheckCircle2 className="w-5 h-5" />
      {loading ? "Marking Complete..." : "Mark as Complete"}
    </Button>
  );
}
