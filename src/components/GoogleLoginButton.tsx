"use client";

import Script from "next/script";
import { useCallback, useRef } from "react";
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

export default function GoogleLoginButton() {
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
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleCredential,
    });
    window.google.accounts.id.renderButton(buttonRef.current, {
      theme: "outline",
      size: "medium",
      shape: "pill",
    });
  }, [handleCredential]);

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
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={initialize}
      />
      <div ref={buttonRef} />
    </>
  );
}
