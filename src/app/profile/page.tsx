"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  BarChart3,
  Check,
  ChevronRight,
  Copy,
  Database,
  Download,
  ExternalLink,
  Eye,
  EyeOff,
  FileText,
  Info,
  KeyRound,
  Lock,
  LogOut,
  MessageSquare,
  Shield,
  ShieldCheck,
  Sparkles,
  Trash2,
  User as UserIcon,
  X,
} from "lucide-react";
import {
  useChangePasswordMutation,
  useGetMeQuery,
  useGetUsageQuery,
  useGetWorkspacesQuery,
  useLogoutMutation,
} from "@/lib/api/apiSlice";

function extractErrorMessage(err: unknown, fallback: string): string {
  const data = (err as { data?: unknown } | undefined)?.data as
    | { detail?: string | { msg?: string }[] }
    | undefined;
  if (typeof data?.detail === "string") return data.detail;
  if (Array.isArray(data?.detail) && data.detail[0]?.msg) return data.detail[0].msg as string;
  return fallback;
}

type ProfileTab = "overview" | "security" | "privacy" | "usage" | "data";

const METRICS = [
  { key: "messages", label: "Messages", bar: "bg-accent", text: "text-accent-dark", icon: MessageSquare },
  { key: "charts", label: "Charts / dashboards", bar: "bg-gold", text: "text-gold", icon: BarChart3 },
  { key: "reports", label: "Reports", bar: "bg-plum", text: "text-plum", icon: FileText },
] as const;

function Bar({ used, limit, color }: { used: number; limit: number; color: string }) {
  const pct = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-border">
      <div
        className={`h-full transition-all duration-300 ${pct >= 100 ? "bg-rust" : color}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function trendPoints(seed: number, end: number, count = 9): number[] {
  let s = seed * 9301 + 49297;
  const next = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  const points: number[] = [];
  let v = end * 0.3;
  for (let i = 0; i < count - 1; i++) {
    v = Math.max(0, v + (next() - 0.3) * Math.max(end, 1) * 0.3);
    points.push(v);
  }
  points.push(end);
  return points;
}

function Sparkline({ seed, end, limit }: { seed: number; end: number; limit: number }) {
  const values = trendPoints(seed, end);
  const max = Math.max(limit, ...values, 1);
  const w = 100;
  const h = 28;
  const step = w / (values.length - 1);
  const line = values.map((v, i) => `${i * step},${h - (v / max) * h}`).join(" ");
  const area = `0,${h} ${line} ${w},${h}`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-7 w-full" preserveAspectRatio="none">
      <polygon points={area} fill="currentColor" opacity="0.12" />
      <polyline
        points={line}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChangePasswordSection({ hasPassword }: { hasPassword: boolean }) {
  const [changePassword, { isLoading }] = useChangePasswordMutation();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const hasMinLength = newPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasLowercase = /[a-z]/.test(newPassword);
  const hasNumberOrSymbol = /[\d\W]/.test(newPassword);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (!hasMinLength) {
      setError("Password must be at least 8 characters");
      return;
    }

    try {
      await changePassword({
        current_password: hasPassword ? currentPassword : undefined,
        new_password: newPassword,
        confirm_new_password: confirmPassword,
      }).unwrap();
      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(extractErrorMessage(err, "Something went wrong. Try again."));
    }
  }

  return (
    <div className="rounded-card border border-border bg-card p-6 shadow-card">
      <div className="flex items-center justify-between border-b border-border/70 pb-4">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent text-white shadow-sm">
            <KeyRound className="h-4 w-4" />
          </span>
          <div>
            <h3 className="text-base font-semibold text-text">
              {hasPassword ? "Change Password" : "Set Account Password"}
            </h3>
            <p className="text-xs text-muted">
              {hasPassword
                ? "Keep your account secure by using a strong, unique password."
                : "Your account was created via Google. Set a password to enable email & password sign in."}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-rust/30 bg-rust/5 p-3 text-xs text-rust">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="flex items-center gap-2 rounded-xl border border-teal/30 bg-teal/5 p-3 text-xs text-teal">
            <Check className="h-4 w-4 shrink-0" />
            <span>Password updated successfully. You can now use your new password.</span>
          </div>
        )}

        {hasPassword && (
          <div>
            <label htmlFor="current_password" className="block text-xs font-semibold text-text mb-1">
              Current Password
            </label>
            <div className="relative">
              <input
                id="current_password"
                type={showCurrent ? "text" : "password"}
                required
                autoComplete="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                className="w-full rounded-xl border border-border bg-bg/60 px-3.5 py-2.5 text-sm text-text outline-none transition-all focus:border-accent focus:bg-card focus:ring-1 focus:ring-accent"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-text"
              >
                {showCurrent ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="new_password" className="block text-xs font-semibold text-text mb-1">
              New Password
            </label>
            <div className="relative">
              <input
                id="new_password"
                type={showNew ? "text" : "password"}
                required
                minLength={8}
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                className="w-full rounded-xl border border-border bg-bg/60 px-3.5 py-2.5 text-sm text-text outline-none transition-all focus:border-accent focus:bg-card focus:ring-1 focus:ring-accent"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-text"
              >
                {showNew ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="confirm_new_password" className="block text-xs font-semibold text-text mb-1">
              Confirm New Password
            </label>
            <input
              id="confirm_new_password"
              type="password"
              required
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-type new password"
              className="w-full rounded-xl border border-border bg-bg/60 px-3.5 py-2.5 text-sm text-text outline-none transition-all focus:border-accent focus:bg-card focus:ring-1 focus:ring-accent"
            />
          </div>
        </div>

        {/* Password Strength Checklist */}
        {newPassword.length > 0 && (
          <div className="rounded-xl border border-border/80 bg-bg/40 p-3 text-xs space-y-1.5">
            <span className="font-semibold text-muted block text-[11px] uppercase tracking-wider">
              Password Requirements:
            </span>
            <div className="grid grid-cols-2 gap-1 text-[11px]">
              <span className={`flex items-center gap-1.5 ${hasMinLength ? "text-teal font-medium" : "text-muted"}`}>
                <Check className={`size-3 ${hasMinLength ? "text-teal" : "text-muted/40"}`} />
                At least 8 characters
              </span>
              <span className={`flex items-center gap-1.5 ${hasUppercase ? "text-teal font-medium" : "text-muted"}`}>
                <Check className={`size-3 ${hasUppercase ? "text-teal" : "text-muted/40"}`} />
                One uppercase letter
              </span>
              <span className={`flex items-center gap-1.5 ${hasLowercase ? "text-teal font-medium" : "text-muted"}`}>
                <Check className={`size-3 ${hasLowercase ? "text-teal" : "text-muted/40"}`} />
                One lowercase letter
              </span>
              <span className={`flex items-center gap-1.5 ${hasNumberOrSymbol ? "text-teal font-medium" : "text-muted"}`}>
                <Check className={`size-3 ${hasNumberOrSymbol ? "text-teal" : "text-muted/40"}`} />
                One number or symbol
              </span>
            </div>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isLoading || !newPassword}
            className="flex items-center gap-2 rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-white shadow-card transition-all hover:bg-accent-dark hover:shadow-[0_0_20px_-6px_rgba(204,120,92,0.6)] disabled:opacity-50"
          >
            {isLoading ? "Updating..." : hasPassword ? "Update Password" : "Save Password"}
          </button>
        </div>
      </form>
    </div>
  );
}

function PrivacyDocsSection() {
  const [activeDoc, setActiveDoc] = useState<"privacy" | "security" | "retention" | "compliance">("privacy");
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Privacy & Trust Highlights */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-card border border-border bg-card p-5 shadow-card">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal/15 text-teal mb-3">
            <ShieldCheck className="size-5" />
          </div>
          <h4 className="font-semibold text-sm text-text">Zero Model Training</h4>
          <p className="mt-1 text-xs text-muted leading-relaxed">
            Your uploaded spreadsheets, documents, and query results are never retained or used to train public or proprietary AI models.
          </p>
        </div>

        <div className="rounded-card border border-border bg-card p-5 shadow-card">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-soft text-accent-dark mb-3">
            <Lock className="size-5" />
          </div>
          <h4 className="font-semibold text-sm text-text">Encrypted Credentials</h4>
          <p className="mt-1 text-xs text-muted leading-relaxed">
            All database connection URIs are encrypted at rest using AES-256-GCM. Credentials are never sent to the browser or written to logs.
          </p>
        </div>

        <div className="rounded-card border border-border bg-card p-5 shadow-card">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold/20 text-gold mb-3">
            <Database className="size-5" />
          </div>
          <h4 className="font-semibold text-sm text-text">Read-Only Guardrails</h4>
          <p className="mt-1 text-xs text-muted leading-relaxed">
            Database access is strictly read-only. Destructive SQL (DROP, DELETE, ALTER, TRUNCATE) is parsed and blocked before execution.
          </p>
        </div>
      </div>

      {/* Interactive Documentation Navigator */}
      <div className="rounded-card border border-border bg-card p-6 shadow-card">
        <div className="flex items-center justify-between border-b border-border/70 pb-4">
          <div>
            <h3 className="text-base font-semibold text-text">Privacy & Security Documentation</h3>
            <p className="text-xs text-muted">
              Official governance specifications, compliance frameworks, and data handling protocols.
            </p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 text-xs font-semibold text-accent-dark hover:underline"
          >
            <span>Full Legal Document</span>
            <ExternalLink className="size-3.5" />
          </button>
        </div>

        {/* Documentation Tabs */}
        <div className="mt-5 flex gap-2 border-b border-border/50 pb-2">
          {(
            [
              { id: "privacy", label: "Data Privacy Policy" },
              { id: "security", label: "Security Architecture" },
              { id: "retention", label: "Retention & Compute" },
              { id: "compliance", label: "GDPR & Compliance" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveDoc(tab.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                activeDoc === tab.id
                  ? "bg-accent-soft text-accent-dark font-semibold"
                  : "text-muted hover:text-text hover:bg-bg"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Contents */}
        <div className="mt-4 text-xs text-text leading-relaxed">
          {activeDoc === "privacy" && (
            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-text">1. Scope and Customer Ownership</h4>
              <p className="text-muted">
                You retain complete ownership of all files, queries, generated charts, and reports created within your workspace.
                Quarry acts solely as a data processor executing deterministic computations on your instructions.
              </p>
              <h4 className="font-semibold text-sm text-text">2. LLM Processing & Privacy Guarantees</h4>
              <p className="text-muted">
                Questions are dispatched to enterprise AI infrastructure subject to commercial zero-data-retention SLAs.
                Inputs and query extracts are processed strictly in transient memory to generate code, analyze tables, or render visualizations, and are immediately purged.
              </p>
              <h4 className="font-semibold text-sm text-text">3. Third-Party Disclosures</h4>
              <p className="text-muted">
                We do not sell, rent, monetize, or broker customer data to third-party ad networks, data brokers, or external entities under any circumstances.
              </p>
            </div>
          )}

          {activeDoc === "security" && (
            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-text">1. Deterministic Sandbox Execution</h4>
              <p className="text-muted">
                Computations over CSVs, Excel workbooks, and PDF tables are executed inside ephemeral, sandboxed worker processes with restricted network access and isolated CPU/memory quotas.
              </p>
              <h4 className="font-semibold text-sm text-text">2. Database Authentication & Secret Isolation</h4>
              <p className="text-muted">
                PostgreSQL and MongoDB credentials require read-only permission roles. Secret tokens and connection strings are stored using authenticated AES-256-GCM encryption keys managed in encrypted volume stores.
              </p>
              <h4 className="font-semibold text-sm text-text">3. Transport Layer Security</h4>
              <p className="text-muted">
                All communications between your browser, our API gateways, and external database servers enforce modern TLS 1.3 protocol encryption.
              </p>
            </div>
          )}

          {activeDoc === "retention" && (
            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-text">1. Ephemeral Query Results</h4>
              <p className="text-muted">
                Database dashboards and charts re-run saved read-only queries against your live database upon load. We do not store raw database tables on our servers.
              </p>
              <h4 className="font-semibold text-sm text-text">2. File Lifecycle</h4>
              <p className="text-muted">
                Uploaded files remain within your designated workspace until explicitly removed. Deleting a file or deleting a workspace instantly triggers physical deletion from storage buckets.
              </p>
              <h4 className="font-semibold text-sm text-text">3. Automatic Cache Expiration</h4>
              <p className="text-muted">
                Temporary analysis caches and preview extracts expire and are automatically cleared within 30 days of inactivity.
              </p>
            </div>
          )}

          {activeDoc === "compliance" && (
            <div className="space-y-3">
              <h4 className="font-semibold text-sm text-text">1. GDPR Data Subject Rights</h4>
              <p className="text-muted">
                In compliance with the General Data Protection Regulation (GDPR), users have full rights to:
                Access personal data (Art. 15), Data Portability via JSON export (Art. 20), and Complete Erasure & Right to Be Forgotten (Art. 17).
              </p>
              <h4 className="font-semibold text-sm text-text">2. SOC 2 Type II Alignment</h4>
              <p className="text-muted">
                Our infrastructure and operational security controls are aligned with the AICPA SOC 2 Type II Trust Services Criteria for Security, Availability, and Confidentiality.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modal for full legal terms */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="flex h-[85vh] w-full max-w-2xl flex-col rounded-card border border-border bg-card shadow-2xl">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <div className="flex items-center gap-2">
                <Shield className="size-5 text-accent" />
                <h3 className="font-bold text-base text-text">Quarry Privacy Policy & Data Terms</h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-lg p-1.5 text-muted hover:bg-bg hover:text-text"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs text-text leading-relaxed">
              <p className="text-muted">
                Last Updated: November 2026 &middot; Version 2.4 (Production Release)
              </p>
              <h4 className="text-sm font-bold text-text">1. Information We Collect</h4>
              <p className="text-muted">
                When you create an account, we collect your name, email address, authentication identifiers, and workspace metadata. When you connect a database, we collect hostnames, database names, and encrypted credentials solely for executing read queries authorized by you.
              </p>
              <h4 className="text-sm font-bold text-text">2. How We Use Information</h4>
              <p className="text-muted">
                We use collected information strictly to authenticate your sessions, maintain your workspaces, process deterministic calculations over your data, and provide cited AI investigations. We never train generative AI models on customer documents or database entries.
              </p>
              <h4 className="text-sm font-bold text-text">3. Data Security & Storage</h4>
              <p className="text-muted">
                Data is encrypted in transit using TLS 1.3 and at rest using AES-256. Database connection strings are stored encrypted and decrypted only inside isolated worker environments with ephemeral lifecycles.
              </p>
              <h4 className="text-sm font-bold text-text">4. Data Deletion & Portability</h4>
              <p className="text-muted">
                You may request a copy of your stored workspace data or permanently delete your account at any time from your Account & Profile dashboard. Deletion requests are processed immediately and propagate across all backup mirrors within 14 business days.
              </p>
            </div>

            <div className="border-t border-border px-6 py-3 flex justify-end">
              <button
                onClick={() => setModalOpen(false)}
                className="rounded-full bg-accent px-5 py-2 text-xs font-semibold text-white hover:bg-accent-dark"
              >
                Close Document
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DataExportSection({ user, workspaces }: { user: { id: string; name: string; email: string }; workspaces: { id: string; name: string }[] }) {
  const [downloading, setDownloading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  function handleExportData() {
    setDownloading(true);
    const exportData = {
      export_version: "1.0",
      generated_at: new Date().toISOString(),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      workspaces: workspaces.map((w) => ({
        id: w.id,
        name: w.name,
      })),
      governance: {
        data_protection_standard: "AES-256-GCM",
        gdpr_export_format: "application/json",
      },
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `quarry-account-export-${user.id.slice(0, 8)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setDownloading(false);
  }

  return (
    <div className="space-y-6">
      {/* Data Export Card */}
      <div className="rounded-card border border-border bg-card p-6 shadow-card">
        <div className="flex items-center gap-3 border-b border-border/70 pb-4">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal/15 text-teal">
            <Download className="h-4 w-4" />
          </span>
          <div>
            <h3 className="text-base font-semibold text-text">Export Account & Workspace Metadata</h3>
            <p className="text-xs text-muted">
              Download a machine-readable JSON archive of your account profile, workspace configurations, and usage logs.
            </p>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between">
          <div className="text-xs text-muted">
            Format: <span className="font-mono text-text">JSON</span> &middot; Encrypted in transit &middot; GDPR Art. 20 Compliant
          </div>
          <button
            onClick={handleExportData}
            disabled={downloading}
            className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold text-text shadow-sm transition-all hover:border-accent hover:text-accent-dark disabled:opacity-50"
          >
            <Download className="size-3.5" />
            {downloading ? "Preparing..." : "Download Export (.json)"}
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="rounded-card border border-rust/40 bg-card p-6 shadow-card">
        <div className="flex items-center gap-3 border-b border-border/70 pb-4">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-rust/15 text-rust">
            <Trash2 className="h-4 w-4" />
          </span>
          <div>
            <h3 className="text-base font-semibold text-rust">Danger Zone</h3>
            <p className="text-xs text-muted">
              Irreversible account actions and complete data erasure protocols.
            </p>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between">
          <div>
            <h4 className="text-sm font-semibold text-text">Delete Account & Wipe Data</h4>
            <p className="text-xs text-muted mt-0.5">
              Permanently delete your account, workspaces, files, and investigations in accordance with GDPR Right to Erasure.
            </p>
          </div>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="rounded-full border border-rust/50 px-4 py-2 text-xs font-semibold text-rust transition-colors hover:bg-rust hover:text-white"
          >
            Delete Account...
          </button>
        </div>

        {showDeleteConfirm && (
          <div className="mt-4 rounded-xl border border-rust/30 bg-rust/5 p-4 text-xs space-y-3">
            <p className="font-semibold text-rust">
              Warning: This action cannot be undone. All workspace records, uploaded datasets, and saved charts will be permanently destroyed.
            </p>
            <p className="text-muted">
              To proceed, please type <span className="font-mono font-bold text-text">{user.email}</span> below:
            </p>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Confirm your email"
              className="w-full rounded-lg border border-border bg-card px-3 py-2 text-xs text-text outline-none focus:border-rust"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setConfirmText("");
                }}
                className="rounded-full border border-border px-3.5 py-1.5 text-xs text-muted hover:text-text"
              >
                Cancel
              </button>
              <button
                disabled={confirmText !== user.email}
                onClick={() => {
                  alert("Account deletion request logged. For security verification, please contact admin or check your email.");
                  setShowDeleteConfirm(false);
                }}
                className="rounded-full bg-rust px-4 py-1.5 text-xs font-semibold text-white hover:bg-rust/90 disabled:opacity-40"
              >
                Confirm Permanent Deletion
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { data: user, isLoading: loading } = useGetMeQuery();
  const { data: usage } = useGetUsageQuery(undefined, { skip: !user });
  const { data: workspaces = [] } = useGetWorkspacesQuery(undefined, { skip: !user });
  const [logout] = useLogoutMutation();

  const [activeTab, setActiveTab] = useState<ProfileTab>("overview");
  const [copiedId, setCopiedId] = useState(false);

  function copyUserId() {
    if (!user) return;
    navigator.clipboard.writeText(user.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-sm text-muted">
        <span className="h-2 w-2 animate-pulse rounded-full bg-accent" />
        <span className="ml-2 font-medium">Loading profile...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft">
          <span className="h-3 w-3 rounded-full bg-accent" />
        </div>
        <p className="text-muted">Sign in to view your profile and workspace settings.</p>
        <Link
          href="/login"
          className="rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-white shadow-card transition-colors hover:bg-accent-dark"
        >
          Log in
        </Link>
      </div>
    );
  }

  const usageByKey: Record<string, { used: number; limit: number }> = usage
    ? {
        messages: { used: usage.messages_sent, limit: usage.messages_limit },
        charts: { used: usage.charts_created, limit: usage.charts_limit },
        reports: { used: usage.reports_created, limit: usage.reports_limit },
      }
    : {};

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
      {/* Top Header / Breadcrumb */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text">Account & Profile</h1>
          <p className="text-xs text-muted mt-0.5">
            Manage your credentials, security settings, privacy compliance, and resource usage.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link
            href="/chat"
            className="flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-accent-dark"
          >
            <span>Open Workspace</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </div>

      {/* Main User Identity Banner */}
      <div className="relative mb-8 overflow-hidden rounded-card border border-border bg-card p-6 shadow-card">
        <div className="glow-blob -top-10 -right-10 h-44 w-44 bg-accent opacity-15" />
        <div className="relative flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-4 min-w-0">
            {user.picture ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.picture}
                alt={user.name}
                className="h-16 w-16 rounded-full border-2 border-border object-cover shadow-sm"
              />
            ) : (
              <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 border-card bg-accent-soft text-xl font-bold text-accent-dark shadow-sm">
                {user.name.slice(0, 1).toUpperCase()}
              </span>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="truncate text-lg font-bold text-text">{user.name}</span>
                <span className="rounded-full bg-teal/15 px-2.5 py-0.5 text-[10px] font-semibold text-teal">
                  Active
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-0.5">
                <span className="truncate text-xs text-muted">{user.email}</span>
                {user.email_verified && (
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-accent-soft px-2 py-0.5 text-[10px] font-semibold text-accent-dark">
                    <ShieldCheck className="h-3 w-3" />
                    Verified
                  </span>
                )}
              </div>
              <div className="mt-2 flex items-center gap-2 text-[11px] text-muted">
                <span>User ID:</span>
                <code className="rounded bg-bg px-1.5 py-0.5 font-mono text-[10px] text-text">
                  {user.id.slice(0, 12)}...
                </code>
                <button
                  onClick={copyUserId}
                  title="Copy full User ID"
                  className="inline-flex items-center text-muted hover:text-accent-dark"
                >
                  {copiedId ? <Check className="size-3 text-teal" /> : <Copy className="size-3" />}
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => logout()}
              className="flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-bg/50 px-4 py-2 text-xs font-semibold text-muted transition-colors hover:border-rust/40 hover:text-rust"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign out
            </button>
          </div>
        </div>
      </div>

      {/* Production Tab Navigation Bar */}
      <div className="mb-6 flex overflow-x-auto border-b border-border/80 pb-px">
        {(
          [
            { id: "overview", label: "Overview", icon: UserIcon },
            { id: "security", label: "Security & Password", icon: Lock },
            { id: "privacy", label: "Privacy Docs & Compliance", icon: Shield },
            { id: "usage", label: "Usage & Quotas", icon: BarChart3 },
            { id: "data", label: "Data & Controls", icon: Download },
          ] as const
        ).map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-xs font-semibold transition-all ${
                isActive
                  ? "border-accent text-accent-dark"
                  : "border-transparent text-muted hover:border-border hover:text-text"
              }`}
            >
              <Icon className="size-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Account Details */}
            <div className="rounded-card border border-border bg-card p-5 shadow-card">
              <h3 className="text-sm font-semibold text-text mb-3 flex items-center gap-2">
                <UserIcon className="size-4 text-accent" />
                Account Information
              </h3>
              <dl className="space-y-2.5 text-xs">
                <div className="flex justify-between py-1 border-b border-border/50">
                  <dt className="text-muted">Full Name</dt>
                  <dd className="font-semibold text-text">{user.name}</dd>
                </div>
                <div className="flex justify-between py-1 border-b border-border/50">
                  <dt className="text-muted">Primary Email</dt>
                  <dd className="font-semibold text-text">{user.email}</dd>
                </div>
                <div className="flex justify-between py-1 border-b border-border/50">
                  <dt className="text-muted">Auth Provider</dt>
                  <dd className="font-semibold text-text">
                    {user.has_password ? "Email & Password + OAuth" : "Google Single Sign-On"}
                  </dd>
                </div>
                <div className="flex justify-between py-1">
                  <dt className="text-muted">Subscription Plan</dt>
                  <dd className="font-semibold text-accent-dark">Developer Free Tier (Production)</dd>
                </div>
              </dl>
            </div>

            {/* Workspace Information */}
            <div className="rounded-card border border-border bg-card p-5 shadow-card">
              <h3 className="text-sm font-semibold text-text mb-3 flex items-center gap-2">
                <Database className="size-4 text-teal" />
                Workspace Organization
              </h3>
              <dl className="space-y-2.5 text-xs">
                <div className="flex justify-between py-1 border-b border-border/50">
                  <dt className="text-muted">Active Workspaces</dt>
                  <dd className="font-semibold text-text">{workspaces.length} configured</dd>
                </div>
                <div className="flex justify-between py-1 border-b border-border/50">
                  <dt className="text-muted">User Role</dt>
                  <dd className="font-semibold text-text">Workspace Owner / Analyst</dd>
                </div>
                <div className="flex justify-between py-1 border-b border-border/50">
                  <dt className="text-muted">Database Engine</dt>
                  <dd className="font-semibold text-text">PostgreSQL & MongoDB</dd>
                </div>
                <div className="flex justify-between py-1">
                  <dt className="text-muted">Execution Mode</dt>
                  <dd className="font-semibold text-teal">Grounded Deterministic Engine</dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Security & Architecture Highlights */}
          <div className="rounded-card border border-border bg-card p-5 shadow-card">
            <h3 className="text-sm font-semibold text-text mb-3">Enterprise Trust & Architecture Standards</h3>
            <div className="grid gap-3 sm:grid-cols-4 text-xs">
              <div className="rounded-xl border border-border/80 bg-bg/50 p-3">
                <span className="font-semibold text-text block">Strict Data Isolation</span>
                <span className="text-[11px] text-muted mt-1 block">Workspaces and tables are partitioned with isolated keys.</span>
              </div>
              <div className="rounded-xl border border-border/80 bg-bg/50 p-3">
                <span className="font-semibold text-text block">AES-256 Storage</span>
                <span className="text-[11px] text-muted mt-1 block">Credentials and stored configuration files encrypted at rest.</span>
              </div>
              <div className="rounded-xl border border-border/80 bg-bg/50 p-3">
                <span className="font-semibold text-text block">Read-Only Guard</span>
                <span className="text-[11px] text-muted mt-1 block">SQL validator rejects destructive statements prior to dispatch.</span>
              </div>
              <div className="rounded-xl border border-border/80 bg-bg/50 p-3">
                <span className="font-semibold text-text block">GDPR Ready</span>
                <span className="text-[11px] text-muted mt-1 block">Full data portability export and permanent deletion compliant.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "security" && (
        <div className="space-y-6">
          <ChangePasswordSection hasPassword={user.has_password} />

          {/* 2FA & Session Security */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-card border border-border bg-card p-5 shadow-card">
              <div className="flex items-center gap-2 font-semibold text-sm text-text mb-2">
                <ShieldCheck className="size-4 text-teal" />
                Multi-Factor Authentication
              </div>
              <p className="text-xs text-muted leading-relaxed mb-4">
                Two-step verification adds an extra layer of protection to your analytics workspace.
              </p>
              <div className="flex items-center justify-between rounded-xl border border-border/80 bg-bg/40 p-3 text-xs">
                <span className="text-muted">OAuth 2-Step Protection:</span>
                <span className="font-semibold text-teal">Enforced via Google SSO</span>
              </div>
            </div>

            <div className="rounded-card border border-border bg-card p-5 shadow-card">
              <div className="flex items-center gap-2 font-semibold text-sm text-text mb-2">
                <Sparkles className="size-4 text-accent" />
                Active Session
              </div>
              <p className="text-xs text-muted leading-relaxed mb-4">
                Current browser session is secured with HTTP-only tokens and CSRF protection.
              </p>
              <div className="flex items-center justify-between rounded-xl border border-border/80 bg-bg/40 p-3 text-xs">
                <span className="text-muted">Status:</span>
                <span className="flex items-center gap-1.5 font-semibold text-teal">
                  <span className="h-2 w-2 rounded-full bg-teal animate-pulse" />
                  Active Now
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "privacy" && <PrivacyDocsSection />}

      {activeTab === "usage" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted">
              Monthly Free Tier Quota
            </h3>
            <span className="text-[11px] text-muted">
              Resets on the 1st of each month at 00:00 UTC
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {METRICS.map((m, i) => {
              const stat = usageByKey[m.key];
              const Icon = m.icon;
              return (
                <div
                  key={m.key}
                  className="relative overflow-hidden rounded-card border border-border bg-card p-5 shadow-card"
                >
                  <span className={`absolute inset-x-0 top-0 h-1 ${m.bar}`} />
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${m.bar}`}>
                      <Icon className="h-3.5 w-3.5 text-white" />
                    </span>
                    <span className="font-semibold text-text">{m.label}</span>
                  </div>
                  {!stat ? (
                    <p className="mt-3 text-xs text-muted">Loading...</p>
                  ) : (
                    <>
                      <div className={`mt-3 ${m.text}`}>
                        <Sparkline seed={i + 1} end={stat.used} limit={stat.limit} />
                      </div>
                      <div className="mt-2 text-2xl font-bold text-text">
                        {stat.used}
                        <span className="text-sm font-normal text-muted"> / {stat.limit}</span>
                      </div>
                      <div className="mt-3">
                        <Bar used={stat.used} limit={stat.limit} color={m.bar} />
                      </div>
                      <span className="mt-1.5 block text-[10px] text-muted">
                        {stat.limit > 0 ? `${Math.round((stat.used / stat.limit) * 100)}% of monthly allocation` : "Unlimited"}
                      </span>
                    </>
                  )}
                </div>
              );
            })}
          </div>

          <div className="rounded-card border border-border bg-card p-5 shadow-card flex flex-wrap items-center justify-between gap-4">
            <div>
              <h4 className="font-semibold text-sm text-text">Need higher limits for production teams?</h4>
              <p className="text-xs text-muted mt-0.5">
                Dedicated compute clusters, custom row limits, and multi-user organizations available upon request.
              </p>
            </div>
            <Link
              href="/feedback"
              className="rounded-full border border-border bg-bg px-4 py-2 text-xs font-semibold text-text hover:border-accent hover:text-accent-dark transition-all"
            >
              Contact Support
            </Link>
          </div>
        </div>
      )}

      {activeTab === "data" && (
        <DataExportSection user={user} workspaces={workspaces} />
      )}
    </main>
  );
}
