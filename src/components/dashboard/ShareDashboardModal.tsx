"use client";

import { useEffect, useState } from "react";
import { Check, Copy, Loader2, Share2, Trash2, X, XCircle } from "lucide-react";
import {
  useCreateDashboardShareMutation,
  useGetDashboardSharesQuery,
  useRevokeDashboardShareMutation,
} from "@/lib/api/apiSlice";
import type { DashboardShare } from "@/lib/types";

const VALIDITY_OPTIONS = [
  { days: 1, label: "1 day" },
  { days: 7, label: "7 days" },
  { days: 30, label: "30 days" },
  { days: 90, label: "90 days" },
];

const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

function errorMessage(err: unknown, fallback: string) {
  const data = (err as { data?: { detail?: unknown } } | undefined)?.data;
  return typeof data?.detail === "string" ? data.detail : fallback;
}

function shareUrl(share: DashboardShare) {
  return typeof window === "undefined" ? share.path : `${window.location.origin}${share.path}`;
}

function CopyLinkButton({ share }: { share: DashboardShare }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(shareUrl(share));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }
  return (
    <button
      type="button"
      onClick={copy}
      className="flex shrink-0 items-center gap-1 rounded-full border border-border px-2.5 py-1 text-[11px] font-medium text-muted hover:border-accent hover:text-accent-dark"
    >
      {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
      {copied ? "Copied" : "Copy link"}
    </button>
  );
}

export default function ShareDashboardModal({
  dashboardId,
  dashboardName,
  onClose,
}: {
  dashboardId: string;
  dashboardName: string;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState("");
  const [emails, setEmails] = useState<string[]>([]);
  const [validDays, setValidDays] = useState(30);
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<DashboardShare | null>(null);
  const { data: shares = [] } = useGetDashboardSharesQuery(dashboardId);
  const [createShare, { isLoading: sharing }] = useCreateDashboardShareMutation();
  const [revokeShare] = useRevokeDashboardShareMutation();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function addDraft(): boolean {
    const parts = draft.split(/[\s,;]+/).map((p) => p.trim().toLowerCase()).filter(Boolean);
    if (parts.length === 0) return true;
    const invalid = parts.find((p) => !EMAIL_PATTERN.test(p));
    if (invalid) {
      setError(`'${invalid}' is not a valid email address.`);
      return false;
    }
    setEmails((prev) => [...prev, ...parts.filter((p) => !prev.includes(p))]);
    setDraft("");
    setError(null);
    return true;
  }

  async function share() {
    if (!addDraft()) return;
    const pending = [
      ...emails,
      ...draft.split(/[\s,;]+/).map((p) => p.trim().toLowerCase()).filter((p) => p && !emails.includes(p)),
    ];
    if (pending.length === 0) {
      setError("Add at least one email address.");
      return;
    }
    setError(null);
    try {
      const result = await createShare({ dashboardId, emails: pending, validDays }).unwrap();
      setCreated(result);
      setEmails([]);
    } catch (err) {
      setError(errorMessage(err, "Couldn't share this dashboard."));
    }
  }

  const activeShares = shares.filter((s) => s.active);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Share ${dashboardName}`}
        className="flex max-h-[90vh] w-full max-w-xl flex-col overflow-hidden rounded-2xl border border-accent/20 bg-card shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-4">
          <div className="min-w-0">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <Share2 className="size-4 text-accent-dark" />
              Share dashboard
            </h2>
            <p className="truncate text-xs text-muted">{dashboardName}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex size-7 shrink-0 items-center justify-center rounded-full text-muted hover:bg-bg hover:text-text"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto p-6">
          <div>
            <label className="text-xs font-semibold text-text" htmlFor="share-emails">
              People with a DataAnalyzer account
            </label>
            <div className="mt-1 flex flex-wrap items-center gap-1.5 rounded-lg border border-border bg-bg px-2 py-1.5 focus-within:border-accent">
              {emails.map((email) => (
                <span key={email} className="flex items-center gap-1 rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-medium text-accent-dark">
                  {email}
                  <button
                    type="button"
                    onClick={() => setEmails((prev) => prev.filter((e) => e !== email))}
                    aria-label={`Remove ${email}`}
                    className="text-accent-dark/70 hover:text-accent-dark"
                  >
                    &times;
                  </button>
                </span>
              ))}
              <input
                id="share-emails"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === "," || e.key === " ") {
                    e.preventDefault();
                    addDraft();
                  } else if (e.key === "Backspace" && !draft && emails.length) {
                    setEmails((prev) => prev.slice(0, -1));
                  }
                }}
                onBlur={() => draft && addDraft()}
                placeholder={emails.length ? "" : "name@company.com"}
                className="min-w-[10rem] flex-1 bg-transparent py-1 text-sm outline-none placeholder:text-muted"
              />
            </div>
            <p className="mt-1 text-[11px] text-muted">
              Only these people can open the link, after signing in. Data is always fetched live with your saved connection.
            </p>
          </div>

          <fieldset>
            <legend className="text-xs font-semibold text-text">Link valid for</legend>
            <div className="mt-1 grid grid-cols-4 gap-1 rounded-lg border border-border bg-bg p-1">
              {VALIDITY_OPTIONS.map((option) => (
                <button
                  key={option.days}
                  type="button"
                  onClick={() => setValidDays(option.days)}
                  aria-pressed={validDays === option.days}
                  className={`rounded-md px-2 py-1.5 text-xs font-medium transition-colors ${
                    validDays === option.days ? "bg-accent text-white shadow-card" : "text-muted hover:bg-card hover:text-text"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </fieldset>

          {error && (
            <p className="flex items-start gap-2 rounded-lg border border-rust/30 bg-rust/10 px-3 py-2 text-xs text-rust">
              <XCircle className="mt-0.5 size-3.5 shrink-0" />
              {error}
            </p>
          )}

          {created && (
            <div className="flex items-center justify-between gap-3 rounded-lg border border-accent/30 bg-accent-soft/40 px-3 py-2.5 text-xs">
              <span className="min-w-0">
                <span className="block font-semibold text-accent-dark">Shared with {created.shared_to.join(", ")}</span>
                <span className="block truncate font-mono text-[11px] text-muted">{shareUrl(created)}</span>
              </span>
              <CopyLinkButton share={created} />
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="button"
              onClick={share}
              disabled={sharing || (!draft.trim() && emails.length === 0)}
              className="flex items-center gap-1.5 rounded-full bg-accent px-5 py-2 text-sm font-medium text-white transition-all hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-40"
            >
              {sharing && <Loader2 className="size-4 animate-spin" />}
              Share
            </button>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-text">Active links</h3>
            {activeShares.length === 0 ? (
              <p className="mt-1 text-xs text-muted">Not shared with anyone yet.</p>
            ) : (
              <ul className="mt-2 space-y-2">
                {activeShares.map((share) => (
                  <li key={share.id} className="flex items-center gap-2 rounded-lg border border-border px-3 py-2">
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-xs text-text">{share.shared_to.join(", ")}</span>
                      <span className="block text-[11px] text-muted">
                        Valid until {new Date(share.valid_upto).toLocaleDateString()}
                      </span>
                    </span>
                    <CopyLinkButton share={share} />
                    <button
                      type="button"
                      onClick={() => revokeShare({ shareId: share.id, dashboardId })}
                      aria-label="Stop sharing"
                      title="Stop sharing"
                      className="flex size-7 shrink-0 items-center justify-center rounded-full text-muted hover:bg-rust/10 hover:text-rust"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
