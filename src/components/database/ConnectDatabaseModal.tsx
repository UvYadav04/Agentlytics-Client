"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  CheckCircle2,
  Copy,
  Database,
  ExternalLink,
  Eye,
  EyeOff,
  Leaf,
  Loader2,
  ShieldCheck,
  X,
  XCircle,
} from "lucide-react";
import {
  useCreateDatabaseConnectionMutation,
  useReconnectDatabaseMutation,
  useTestDatabaseConnectionMutation,
} from "@/lib/api/apiSlice";
import type {
  DatabaseConnection,
  DatabaseConnectionDetail,
  DatabaseSchema,
  DatabaseType,
  RememberOption,
} from "@/lib/types";
import { DATABASE_GUIDES, REMEMBER_OPTIONS, type GuideStep } from "./guides";
import SchemaTree from "./SchemaTree";

type TestState =
  | { status: "idle" }
  | { status: "testing" }
  | {
      status: "success";
      schema: DatabaseSchema;
      warnings: string[];
      displayUri: string | null;
      database: string | null;
    }
  | { status: "error"; message: string };

const FLOW_STEPS = ["Select database", "Paste connection string", "Test connection", "Retrieve schema"];

const TYPE_ICON: Record<DatabaseType, typeof Database> = { mongodb: Leaf, postgresql: Database };

function errorMessage(err: unknown, fallback: string) {
  const data = (err as { data?: { detail?: unknown } } | undefined)?.data;
  return typeof data?.detail === "string" ? data.detail : fallback;
}

function FlowStepper({ current }: { current: number }) {
  return (
    <ol className="flex flex-wrap items-center gap-1.5 text-[11px]">
      {FLOW_STEPS.map((label, index) => {
        const done = index < current;
        const active = index === current;
        return (
          <li key={label} className="flex items-center gap-1.5">
            <span
              className={`flex items-center gap-1 rounded-full px-2 py-0.5 font-medium ${
                active
                  ? "bg-accent text-white"
                  : done
                    ? "bg-accent-soft text-accent-dark"
                    : "bg-border/60 text-muted"
              }`}
            >
              {done && <Check className="size-3" />}
              {label}
            </span>
            {index < FLOW_STEPS.length - 1 && <span className="text-muted">→</span>}
          </li>
        );
      })}
    </ol>
  );
}

function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="relative mt-2 rounded-lg border border-border bg-bg">
      <button
        type="button"
        onClick={copy}
        className="absolute right-1.5 top-1.5 flex items-center gap-1 rounded-md border border-border bg-card px-1.5 py-0.5 text-[10px] text-muted hover:text-accent-dark"
      >
        {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
        {copied ? "Copied" : "Copy"}
      </button>
      <pre className="overflow-x-auto whitespace-pre px-3 py-2.5 pr-16 font-mono text-[11px] leading-relaxed text-text">
        {code}
      </pre>
    </div>
  );
}

function GuidePanel({ dbType }: { dbType: DatabaseType }) {
  const guide = DATABASE_GUIDES[dbType];
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold">How to get your {guide.label} connection string</h3>
        <a
          href={guide.link.href}
          target="_blank"
          rel="noopener noreferrer"
          className="flex shrink-0 items-center gap-1 rounded-full border border-border px-2.5 py-1 text-[11px] font-medium text-accent-dark transition-colors hover:border-accent hover:bg-accent-soft/50"
        >
          {guide.link.label}
          <ExternalLink className="size-3" />
        </a>
      </div>
      <ol className="space-y-3">
        {guide.steps.map((step: GuideStep, index) => (
          <li key={step.title} className="flex gap-3">
            <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-accent-soft text-[11px] font-semibold text-accent-dark">
              {index + 1}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-text">{step.title}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-muted">{step.body}</p>
              {step.code && <CodeBlock code={step.code} />}
            </div>
          </li>
        ))}
      </ol>
      <div className="rounded-lg border border-border bg-bg/70 px-3 py-2.5">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">Format</p>
        <code className="mt-1 block break-all font-mono text-[11px] text-text">{guide.example}</code>
      </div>
    </div>
  );
}

function TypePicker({ onSelect }: { onSelect: (type: DatabaseType) => void }) {
  return (
    <div className="grid gap-4 p-6 sm:grid-cols-2">
      {(Object.keys(DATABASE_GUIDES) as DatabaseType[]).map((type) => {
        const guide = DATABASE_GUIDES[type];
        const Icon = TYPE_ICON[type];
        return (
          <button
            key={type}
            type="button"
            onClick={() => onSelect(type)}
            className="group flex flex-col items-start gap-3 rounded-2xl border border-border bg-bg/60 p-5 text-left transition-all hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-[0_0_30px_-12px_rgba(204,120,92,0.55)]"
          >
            <span className="flex size-11 items-center justify-center rounded-xl bg-accent-soft text-accent-dark">
              <Icon className="size-5" />
            </span>
            <span>
              <span className="block text-base font-semibold">Connect {guide.label}</span>
              <span className="mt-0.5 block text-xs text-muted">{guide.tagline}</span>
            </span>
            <code className="block w-full truncate rounded-md bg-card px-2 py-1 font-mono text-[10px] text-muted">
              {guide.example}
            </code>
            <span className="text-xs font-medium text-accent-dark group-hover:underline">Continue →</span>
          </button>
        );
      })}
      <p className="flex items-center gap-1.5 text-[11px] text-muted sm:col-span-2">
        <ShieldCheck className="size-3.5 text-accent-dark" />
        Always connect with a dedicated read-only user. Connection strings are encrypted and never shown again.
      </p>
    </div>
  );
}

export default function ConnectDatabaseModal({
  workspaceId,
  onClose,
  reconnectTarget = null,
  onConnected,
}: {
  workspaceId: string;
  onClose: () => void;
  reconnectTarget?: DatabaseConnection | null;
  onConnected?: (connection: DatabaseConnectionDetail) => void;
}) {
  const [dbType, setDbType] = useState<DatabaseType | null>(reconnectTarget?.db_type ?? null);
  const [name, setName] = useState("");
  const [connectionString, setConnectionString] = useState("");
  const [showSecret, setShowSecret] = useState(false);
  const [remember, setRemember] = useState<RememberOption>(reconnectTarget?.remember ?? "30d");
  const [test, setTest] = useState<TestState>({ status: "idle" });
  const [testedFor, setTestedFor] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState<DatabaseConnectionDetail | null>(null);

  const [testConnection, testState] = useTestDatabaseConnectionMutation();
  const [createConnection, createState] = useCreateDatabaseConnectionMutation();
  const [reconnectConnection, reconnectState] = useReconnectDatabaseMutation();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    return () => {
      setConnectionString("");
      testState.reset();
      createState.reset();
      reconnectState.reset();
    };
  }, []);

  const trimmed = connectionString.trim();
  const currentKey = dbType ? `${dbType}:${trimmed}` : null;
  const testIsCurrent = test.status === "success" && testedFor === currentKey;

  const flowStep = useMemo(() => {
    if (saved) return 4;
    if (!dbType) return 0;
    if (test.status === "success" && testIsCurrent) return 3;
    if (trimmed) return 2;
    return 1;
  }, [saved, dbType, test.status, testIsCurrent, trimmed]);

  function changeConnectionString(value: string) {
    setConnectionString(value);
    setSaveError(null);
    if (test.status !== "idle" && test.status !== "testing") setTest({ status: "idle" });
  }

  function chooseType(type: DatabaseType | null) {
    setDbType(type);
    setTest({ status: "idle" });
    setTestedFor(null);
    setSaveError(null);
  }

  async function runTest() {
    if (!dbType || !trimmed || test.status === "testing") return;
    setTest({ status: "testing" });
    setSaveError(null);
    const key = `${dbType}:${trimmed}`;
    try {
      const result = await testConnection({ workspaceId, dbType, connectionString: trimmed }).unwrap();
      if (result.ok && result.schema) {
        setTest({
          status: "success",
          schema: result.schema,
          warnings: result.warnings,
          displayUri: result.display_uri,
          database: result.database,
        });
        setTestedFor(key);
      } else {
        setTest({ status: "error", message: result.error || "Couldn't connect to the database." });
        setTestedFor(null);
      }
    } catch (err) {
      setTest({ status: "error", message: errorMessage(err, "Couldn't test the connection. Please try again.") });
      setTestedFor(null);
    } finally {
      testState.reset();
    }
  }

  async function save() {
    if (!dbType || !testIsCurrent || saving) return;
    setSaving(true);
    setSaveError(null);
    try {
      const result = reconnectTarget
        ? await reconnectConnection({
            connectionId: reconnectTarget.id,
            workspaceId,
            connectionString: trimmed,
            remember,
          }).unwrap()
        : await createConnection({
            workspaceId,
            dbType,
            connectionString: trimmed,
            name: name.trim() || undefined,
            remember,
          }).unwrap();
      setConnectionString("");
      setShowSecret(false);
      setSaved(result);
      onConnected?.(result);
    } catch (err) {
      setSaveError(errorMessage(err, "Couldn't save the connection. Please try again."));
    } finally {
      createState.reset();
      reconnectState.reset();
      setSaving(false);
    }
  }

  const guide = dbType ? DATABASE_GUIDES[dbType] : null;
  const title = reconnectTarget ? `Reconnect ${reconnectTarget.name}` : "Connect a database";
  const rememberHint = REMEMBER_OPTIONS.find((o) => o.value === remember)?.hint;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-accent/20 bg-card shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-4">
          <div className="min-w-0 space-y-2">
            <div className="flex items-center gap-2">
              {dbType && !saved && !reconnectTarget && (
                <button
                  type="button"
                  onClick={() => chooseType(null)}
                  className="flex size-6 items-center justify-center rounded-full text-muted hover:bg-bg hover:text-text"
                  aria-label="Back"
                >
                  <ArrowLeft className="size-4" />
                </button>
              )}
              <h2 className="text-lg font-semibold">{title}</h2>
            </div>
            <FlowStepper current={flowStep} />
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

        <div className="flex-1 overflow-y-auto">
          {!dbType && <TypePicker onSelect={chooseType} />}

          {dbType && guide && saved && (
            <div className="space-y-4 p-6">
              <div className="flex items-start gap-3 rounded-xl border border-accent/30 bg-accent-soft/40 px-4 py-3">
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-accent-dark" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{saved.name} is connected</p>
                  <p className="truncate font-mono text-[11px] text-muted">{saved.display_uri}</p>
                </div>
              </div>
              {saved.warnings.map((warning) => (
                <p key={warning} className="flex items-start gap-2 rounded-lg bg-gold/15 px-3 py-2 text-xs text-accent-dark">
                  <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
                  {warning}
                </p>
              ))}
              <SchemaTree schema={saved.schema} dbType={saved.db_type} maxHeightClass="max-h-[45vh]" />
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-full bg-accent px-5 py-2 text-sm font-medium text-white transition-all hover:bg-accent-dark"
                >
                  Done
                </button>
              </div>
            </div>
          )}

          {dbType && guide && !saved && (
            <div className="grid gap-0 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
              <div className="border-b border-border bg-bg/40 p-6 md:border-b-0 md:border-r">
                <GuidePanel dbType={dbType} />
              </div>

              <div className="space-y-4 p-6">
                {!reconnectTarget && (
                  <label className="block">
                    <span className="text-xs font-semibold text-text">Connection name</span>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      maxLength={80}
                      placeholder={`e.g. Production ${guide.label}`}
                      className="mt-1 w-full rounded-lg border border-border bg-bg px-3 py-2 text-sm outline-none focus:border-accent"
                    />
                  </label>
                )}

                <label className="block">
                  <span className="text-xs font-semibold text-text">{guide.label} connection string</span>
                  <div className="mt-1 flex items-center gap-2 rounded-lg border border-border bg-bg px-3 py-2 focus-within:border-accent">
                    <input
                      type={showSecret ? "text" : "password"}
                      value={connectionString}
                      onChange={(e) => changeConnectionString(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          runTest();
                        }
                      }}
                      placeholder={guide.placeholder}
                      autoComplete="off"
                      autoCorrect="off"
                      autoCapitalize="off"
                      spellCheck={false}
                      name={`${dbType}-connection-string`}
                      className="min-w-0 flex-1 bg-transparent font-mono text-xs outline-none placeholder:text-muted"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSecret((v) => !v)}
                      className="shrink-0 text-muted hover:text-text"
                      aria-label={showSecret ? "Hide connection string" : "Show connection string"}
                    >
                      {showSecret ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                  <span className="mt-1 flex items-center gap-1 text-[11px] text-muted">
                    <ShieldCheck className="size-3 text-accent-dark" />
                    Encrypted at rest and never shown again. Use a read-only user.
                  </span>
                </label>

                <fieldset>
                  <legend className="text-xs font-semibold text-text">Remember credentials</legend>
                  <div className="mt-1 grid grid-cols-4 gap-1 rounded-lg border border-border bg-bg p-1">
                    {REMEMBER_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setRemember(option.value)}
                        aria-pressed={remember === option.value}
                        className={`rounded-md px-2 py-1.5 text-xs font-medium transition-colors ${
                          remember === option.value
                            ? "bg-accent text-white shadow-card"
                            : "text-muted hover:bg-card hover:text-text"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                  {rememberHint && <p className="mt-1 text-[11px] text-muted">{rememberHint}</p>}
                </fieldset>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={runTest}
                    disabled={!trimmed || test.status === "testing"}
                    className="flex items-center gap-1.5 rounded-full border border-accent px-4 py-2 text-sm font-medium text-accent-dark transition-colors hover:bg-accent-soft/60 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {test.status === "testing" && <Loader2 className="size-4 animate-spin" />}
                    {test.status === "testing" ? "Testing..." : "Test connection"}
                  </button>
                  <button
                    type="button"
                    onClick={save}
                    disabled={!testIsCurrent || saving}
                    className="flex items-center gap-1.5 rounded-full bg-accent px-5 py-2 text-sm font-medium text-white transition-all hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {saving && <Loader2 className="size-4 animate-spin" />}
                    {reconnectTarget ? "Reconnect" : "Save connection"}
                  </button>
                  {!testIsCurrent && trimmed && test.status !== "testing" && (
                    <span className="text-[11px] text-muted">Test the connection before saving.</span>
                  )}
                </div>

                {test.status === "error" && (
                  <div className="flex items-start gap-2 rounded-lg border border-rust/30 bg-rust/10 px-3 py-2.5 text-xs text-rust">
                    <XCircle className="mt-0.5 size-4 shrink-0" />
                    <div>
                      <p className="font-semibold">Connection failed</p>
                      <p className="mt-0.5 leading-relaxed">{test.message}</p>
                    </div>
                  </div>
                )}

                {saveError && (
                  <div className="flex items-start gap-2 rounded-lg border border-rust/30 bg-rust/10 px-3 py-2.5 text-xs text-rust">
                    <XCircle className="mt-0.5 size-4 shrink-0" />
                    <p className="leading-relaxed">{saveError}</p>
                  </div>
                )}

                {test.status === "success" && testIsCurrent && (
                  <div className="space-y-3">
                    <div className="flex items-start gap-2 rounded-lg border border-accent/30 bg-accent-soft/40 px-3 py-2.5 text-xs">
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-accent-dark" />
                      <div className="min-w-0">
                        <p className="font-semibold text-accent-dark">Connection successful</p>
                        {test.displayUri && (
                          <p className="truncate font-mono text-[11px] text-muted">{test.displayUri}</p>
                        )}
                      </div>
                    </div>
                    {test.warnings.map((warning) => (
                      <p key={warning} className="flex items-start gap-2 rounded-lg bg-gold/15 px-3 py-2 text-xs text-accent-dark">
                        <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
                        {warning}
                      </p>
                    ))}
                    <SchemaTree schema={test.schema} dbType={dbType} maxHeightClass="max-h-64" />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
