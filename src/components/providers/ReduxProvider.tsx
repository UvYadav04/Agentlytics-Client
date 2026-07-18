"use client";

import { useRef } from "react";
import { Provider } from "react-redux";
import { makeStore, type AppStore } from "@/lib/store";

export default function ReduxProvider({ children }: { children: React.ReactNode }) {
  // One store per browser tab, created once (StrictMode-safe) - not one per
  // request like some Next.js SSR-store guides suggest, since everything
  // here is client-only (auth cookie, SSE) anyway.
  const storeRef = useRef<AppStore>();
  if (!storeRef.current) {
    storeRef.current = makeStore();
  }
  return <Provider store={storeRef.current}>{children}</Provider>;
}
