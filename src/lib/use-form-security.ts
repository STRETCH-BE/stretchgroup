'use client';

// ============================================================================
// useFormSecurity — one hook every public form uses for its bot defences:
//   • fetches the signed form token (GET /api/form-token) when the form
//     mounts; exposes refreshFormToken() for the 'stale_token' retry;
//   • holds the current Turnstile token (fed by <TurnstileWidget
//     ref={sec.widgetRef} onToken={sec.setTurnstileToken} />);
//   • waitForTurnstile() starts a FRESH challenge run (execute mode) and
//     waits for its token — minted seconds before the server verifies it, so
//     a token can never expire while a visitor fills a long form. Never waits
//     indefinitely: after the timeout the submit proceeds and the server
//     answers with the clear 'captcha' message.
// With none of the env vars set, everything here no-ops (zero-config rule).
// ============================================================================
import { useCallback, useEffect, useRef, useState } from 'react';
import { isTurnstileEnabled } from '@/lib/turnstile';
import type { TurnstileHandle } from '@/components/ui/TurnstileWidget';

// Generous: Cloudflare may decide THIS run needs a visible interaction.
const WAIT_MS = 30000;

export function useFormSecurity() {
  const [formToken, setFormToken] = useState<string | null>(null);
  const turnstileToken = useRef<string | null>(null);
  const waiters = useRef<((t: string | null) => void)[]>([]);
  const widgetRef = useRef<TurnstileHandle | null>(null);

  const refreshFormToken = useCallback(async (): Promise<string | null> => {
    try {
      const res = await fetch('/api/form-token', { cache: 'no-store' });
      const json = (await res.json().catch(() => null)) as { token?: string | null } | null;
      const token = json?.token ?? null;
      setFormToken(token);
      return token;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    void refreshFormToken();
  }, [refreshFormToken]);

  const setTurnstileToken = useCallback((token: string | null) => {
    turnstileToken.current = token;
    if (token) {
      for (const resolve of waiters.current.splice(0)) resolve(token);
    }
  }, []);

  /** Start a fresh challenge run and resolve with its token (or null after
   *  the wait / when the widget is unavailable) — the caller submits either
   *  way; the server-side message handles the rest. Tokens are single-use
   *  and short-lived, so every call mints a new one. */
  const waitForTurnstile = useCallback(async (): Promise<string | null> => {
    if (!isTurnstileEnabled()) return null;
    turnstileToken.current = null;
    const started = widgetRef.current?.execute() ?? false;
    if (!started) return null; // script blocked / widget not ready
    if (turnstileToken.current) return turnstileToken.current; // instant solve
    return new Promise((resolve) => {
      const timer = setTimeout(() => {
        waiters.current = waiters.current.filter((w) => w !== wrapped);
        resolve(turnstileToken.current);
      }, WAIT_MS);
      const wrapped = (t: string | null) => {
        clearTimeout(timer);
        resolve(t);
      };
      waiters.current.push(wrapped);
    });
  }, []);

  const resetTurnstile = useCallback(() => {
    widgetRef.current?.reset();
  }, []);

  return { formToken, refreshFormToken, setTurnstileToken, waitForTurnstile, resetTurnstile, widgetRef };
}
