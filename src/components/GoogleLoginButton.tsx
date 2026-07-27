"use client";

import Script from "next/script";
import { useCallback, useEffect, useRef } from "react";
import { GOOGLE_CLIENT_ID } from "@/lib/config";
import { useGoogleLoginMutation } from "@/lib/api/apiSlice";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void;
        };
      };
    };
  }
}

// Renders our own styled button ("Get started" / "Log in" / whatever the
// caller wants) and layers Google's real Sign In With Google button
// invisibly on top of it, stretched to fill the same box. Clicks land on
// the real (cross-origin iframe) Google button - which can't be triggered
// programmatically - while the user only ever sees our button. See
// `.gsi-overlay iframe` in globals.css for the stretch rule.
export default function GoogleLoginButton({
  label = "Log in",
  className = "rounded-full bg-accent px-6 py-3 text-white font-medium shadow-card hover:bg-accent-dark transition-colors",
}: {
  label?: string;
  className?: string;
}) {
  const [googleLogin] = useGoogleLoginMutation();
  const buttonRef = useRef<HTMLDivElement>(null);

  const handleCredential = useCallback(
    async (response: { credential: string }) => {
      try {
        // Invalidates the "User" tag on success, so every useGetMeQuery()
        // subscriber (Navbar, pages) refetches automatically - no manual
        // refresh() plumbing needed.
        await googleLogin(response.credential).unwrap();
      } catch (err) {
        console.error("Google login failed", err);
      }
    },
    [googleLogin]
  );

  const initialize = useCallback(() => {
    if (!window.google || !buttonRef.current || !GOOGLE_CLIENT_ID) return;
    // Re-initializing with the same client_id is harmless - each mounted
    // instance (Navbar, hero, ...) calls this once its own script load
    // fires (or immediately, see the effect below, if another instance
    // already loaded the script first).
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleCredential,
    });
    const width = Math.min(Math.max(buttonRef.current.offsetWidth || 240, 120), 400);
    window.google.accounts.id.renderButton(buttonRef.current, {
      theme: "outline",
      size: "large",
      width,
    });
  }, [handleCredential]);

  useEffect(() => {
    if (window.google?.accounts?.id) initialize();
  }, [initialize]);

  if (!GOOGLE_CLIENT_ID) {
    return (
      <span className="text-xs text-muted">
        Set NEXT_PUBLIC_GOOGLE_CLIENT_ID to enable sign-in
      </span>
    );
  }

  return (
    <>
      <Script
        id="google-identity-services"
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={initialize}
      />
      <span className="relative inline-flex w-full rounded-full ">
        <button type="button" tabIndex={-1} aria-hidden="true" className={className}>
          {label}
        </button>
        <div
          ref={buttonRef}
          aria-label={label}
          className="gsi-overlay absolute inset-0 h-full w-full cursor-pointer overflow-hidden opacity-0"
        />
      </span>
    </>
  );
}
