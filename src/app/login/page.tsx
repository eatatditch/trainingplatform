"use client";

import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [debug, setDebug] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setDebug("");
    setLoading(true);

    try {
      const supabase = createClient();

      // Check if Supabase client is configured
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (!url) {
        setError("Configuration error: Supabase URL not set");
        setDebug("NEXT_PUBLIC_SUPABASE_URL is undefined");
        setLoading(false);
        return;
      }

      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError("Invalid email or password");
        setDebug(`Auth error: ${authError.message} (${authError.status})`);
        setLoading(false);
        return;
      }

      if (!data.session) {
        setError("Login succeeded but no session returned");
        setDebug("data.session is null — check Supabase project config");
        setLoading(false);
        return;
      }

      // Session exists — show debug info before redirecting
      setDebug(`Login OK! User: ${data.user?.email}, Session: ${data.session.access_token.substring(0, 20)}...`);

      // Verify we can reach the dashboard API
      const checkRes = await fetch("/api/auth/check", { credentials: "include" });
      const checkData = await checkRes.json().catch(() => null);

      if (checkRes.ok && checkData?.user) {
        setDebug(`Session verified server-side! Redirecting...`);
        window.location.href = "/dashboard";
      } else {
        setError("Login succeeded but server can't read your session");
        setDebug(`Server auth check: ${checkRes.status} — ${JSON.stringify(checkData)}`);
        setLoading(false);
      }
    } catch (err: any) {
      setError("An unexpected error occurred");
      setDebug(`Exception: ${err.message}`);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-ditch-navy via-ditch-navy/95 to-ditch-green/80 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-ditch-orange rounded-2xl mb-4">
            <span className="text-white text-2xl font-bold">D</span>
          </div>
          <h1 className="text-3xl font-bold text-white">Ditch Training</h1>
          <p className="text-white/70 mt-2">Sign in to access your training portal</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg text-center">
                {error}
              </div>
            )}
            {debug && (
              <div className="bg-blue-50 text-blue-700 text-xs p-3 rounded-lg font-mono break-all">
                {debug}
              </div>
            )}
            <Input
              id="email"
              label="Email"
              type="email"
              placeholder="you@ditchrestaurant.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              id="password"
              label="Password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
          <p className="text-xs text-gray-400 text-center mt-6">
            Ditch Internal Training Platform — Employees Only
          </p>
        </div>
      </div>
    </div>
  );
}
