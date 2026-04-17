"use client";

import { useEffect } from "react";
import { Zap } from "lucide-react";

export default function SpecOSPage() {
  useEffect(() => {
    const t = setTimeout(() => window.location.reload(), 30000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 bg-ditch-orange rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Zap className="w-9 h-9 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">SpecOS</h1>
        <p className="text-gray-600 text-sm">Being updated — this page will refresh automatically in a moment.</p>
      </div>
    </div>
  );
}
