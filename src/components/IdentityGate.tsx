"use client";

import { useCallback, useState } from "react";

type MePayload = {
  name: string;
  lastSession: { at: string; mode: string; summary: string } | null;
};

interface IdentityGateProps {
  onIdentified: (payload: MePayload) => void;
}

/**
 * First screen: register with name only, or enter existing token.
 * Server sets httpOnly cookie after success; client never stores token in localStorage.
 */
export function IdentityGate({ onIdentified }: IdentityGateProps) {
  const [tab, setTab] = useState<"token" | "register">("token");
  const [name, setName] = useState("");
  const [token, setToken] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [registeredToken, setRegisteredToken] = useState<string | null>(null);
  const [pendingName, setPendingName] = useState<string | null>(null);

  const handleRegister = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/identity/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: name.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "Registration failed");
        return;
      }
      setRegisteredToken(data.token);
      setPendingName(data.name);
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }, [name, onIdentified]);

  const handleTokenSubmit = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/identity/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ token: token.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "Invalid token");
        return;
      }
      onIdentified({
        name: data.name,
        lastSession: data.lastSession ?? null,
      });
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }, [token, onIdentified]);

  return (
    <div
      className="flex min-h-dvh w-full max-w-[100%] flex-col items-center justify-center overflow-x-hidden bg-[#f5f6f8] py-12 pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] dark:bg-[#050608]"
      style={{ paddingBottom: "max(3rem, env(safe-area-inset-bottom))" }}
    >
      <div className="w-full min-w-0 max-w-md rounded-2xl border border-black/8 bg-white p-6 shadow-lg dark:border-white/10 dark:bg-zinc-900">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-black/45 dark:text-white/45">
          Innernet
        </p>
        <h1 className="mt-1 text-xl font-semibold tracking-tight text-black dark:text-white">
          Identify
        </h1>
        <p className="mt-2 text-sm text-black/55 dark:text-white/55">
          Enter your token each visit, or register with your first name only. No
          email — we only store a display name and rough session notes tied to
          your token.
        </p>

        <div className="mt-6 flex rounded-xl bg-black/5 p-1 dark:bg-white/10">
          <button
            type="button"
            onClick={() => setTab("token")}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${
              tab === "token"
                ? "bg-white text-black shadow dark:bg-zinc-800 dark:text-white"
                : "text-black/60 dark:text-white/60"
            }`}
          >
            Enter token
          </button>
          <button
            type="button"
            onClick={() => setTab("register")}
            className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${
              tab === "register"
                ? "bg-white text-black shadow dark:bg-zinc-800 dark:text-white"
                : "text-black/60 dark:text-white/60"
            }`}
          >
            Register
          </button>
        </div>

        {tab === "token" && (
          <div className="mt-6 space-y-3">
            <label className="block text-xs font-medium text-black/70 dark:text-white/70">
              Token
            </label>
            <input
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleTokenSubmit()}
              placeholder="Paste your token"
              autoComplete="off"
              className="w-full rounded-xl border border-black/10 bg-black/[0.03] px-3 py-2.5 text-base text-black placeholder:text-black/40 focus:border-black/20 focus:outline-none focus:ring-2 focus:ring-black/10 sm:text-sm dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/40"
            />
            <button
              type="button"
              disabled={loading || !token.trim()}
              onClick={handleTokenSubmit}
              className="w-full rounded-xl bg-black py-2.5 text-sm font-semibold text-white transition hover:bg-black/90 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-white/90"
            >
              {loading ? "Checking…" : "Continue"}
            </button>
          </div>
        )}

        {tab === "register" && !registeredToken && (
          <div className="mt-6 space-y-3">
            <label className="block text-xs font-medium text-black/70 dark:text-white/70">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleRegister()}
              placeholder="What should we call you?"
              autoComplete="name"
              className="w-full rounded-xl border border-black/10 bg-black/[0.03] px-3 py-2.5 text-base text-black placeholder:text-black/40 focus:border-black/20 focus:outline-none focus:ring-2 focus:ring-black/10 sm:text-sm dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/40"
            />
            <button
              type="button"
              disabled={loading || !name.trim()}
              onClick={handleRegister}
              className="w-full rounded-xl bg-black py-2.5 text-sm font-semibold text-white transition hover:bg-black/90 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-white/90"
            >
              {loading ? "Creating…" : "Create token"}
            </button>
          </div>
        )}

        {registeredToken && (
          <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/50 dark:bg-amber-950/40">
            <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
              Save this token — you&apos;ll need it next time.
            </p>
            <p className="mt-2 break-all font-mono text-xs text-amber-800 dark:text-amber-200">
              {registeredToken}
            </p>
            <button
              type="button"
              onClick={() => {
                setRegisteredToken(null);
                if (pendingName) {
                  onIdentified({ name: pendingName, lastSession: null });
                  setPendingName(null);
                }
              }}
              className="mt-3 w-full rounded-lg bg-amber-900/10 py-2 text-sm font-medium text-amber-900 dark:bg-amber-100/10 dark:text-amber-100"
            >
              I&apos;ve saved it — continue
            </button>
          </div>
        )}

        {error && (
          <p className="mt-4 text-center text-sm text-red-600 dark:text-red-400" role="alert">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
