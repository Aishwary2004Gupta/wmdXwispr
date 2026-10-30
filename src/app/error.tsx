"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("OmniSync encountered a page error:", error);
  }, [error]);

  return (
    <main className="app-error-page">
      <section className="app-error-card" role="alert">
        <div className="app-error-icon"><AlertTriangle size={22} /></div>
        <p className="eyebrow">THE WORKSPACE HIT A SNAG</p>
        <h1>Let’s get you back on track.</h1>
        <p className="app-error-copy">
          This page ran into a problem while loading. Your saved profiles and activity are kept in this browser.
        </p>
        {process.env.NODE_ENV === "development" && (
          <pre className="app-error-detail">{error.message}</pre>
        )}
        <button type="button" onClick={reset} className="btn btn-primary">
          <RefreshCw size={16} /> Reload this view
        </button>
      </section>
    </main>
  );
}
