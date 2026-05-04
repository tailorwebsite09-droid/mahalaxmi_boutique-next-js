"use client";
import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import {
  AlertTriangle,
  Check,
  Copy,
  ExternalLink,
  ImageIcon,
  Loader2,
  LogOut,
  Plus,
  RefreshCw,
  Trash2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiBase } from "@/lib/api";
import {
  clearAdminToken,
  getAdminToken,
  isAdminLoggedIn,
  setAdminToken,
} from "@/lib/admin-auth";

interface Product {
  id: number;
  imageUrl: string;
  price: number;
  createdAt: string;
}

interface SetupStatus {
  ready: boolean;
  reason?: string;
  setupSql?: string;
  sqlEditorUrl?: string | null;
}

const formatPrice = (n: number) =>
  new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n);

function LoginForm({ onSuccess }: { onSuccess: () => void }) {
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await fetch(`${apiBase}/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const json = (await res.json().catch(() => ({}))) as {
        token?: string;
        error?: string;
      };
      if (!res.ok || !json.token) {
        setError(json.error ?? "Login failed");
        return;
      }
      setAdminToken(json.token);
      toast({ title: "Welcome back", description: "You are now signed in." });
      onSuccess();
    } catch {
      setError("Could not reach the server. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/15 px-4">
      <div className="w-full max-w-sm bg-card border border-border rounded-2xl shadow-sm p-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-serif font-bold text-primary">
            Admin Sign In
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            Mahalaxmi Boutiques · Designs Management
          </p>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1.5"
              placeholder="Enter admin password"
              required
            />
          </div>
          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
          <Button
            type="submit"
            disabled={submitting || !password}
            className="w-full"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Signing in…
              </>
            ) : (
              "Sign in"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}

function SetupBanner({
  status,
  onRecheck,
  rechecking,
}: {
  status: SetupStatus;
  onRecheck: () => void;
  rechecking: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const sql = status.setupSql ?? "";

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(sql);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard may be blocked; the SQL is also visible in the textarea
      // so the user can manually copy it.
    }
  };

  return (
    <div className="mb-8 rounded-2xl border border-amber-300 bg-amber-50/80 p-5 md:p-6 shadow-sm">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <h3 className="font-serif text-lg font-semibold text-amber-900">
            One-time setup needed
          </h3>
          <p className="text-sm text-amber-900/90 mt-1">
            {status.reason ??
              "Your Supabase database isn't ready for designs yet."}
          </p>

          <ol className="mt-4 space-y-2 text-sm text-amber-900/90 list-decimal list-inside">
            <li>Click <span className="font-semibold">Copy SQL</span> below.</li>
            <li>
              Click <span className="font-semibold">Open Supabase SQL Editor</span>,
              paste the SQL, and press <span className="font-semibold">Run</span>.
            </li>
            <li>
              Come back here and click{" "}
              <span className="font-semibold">I've run it — recheck</span>.
            </li>
          </ol>

          <div className="mt-4 rounded-lg border border-amber-200 bg-white">
            <textarea
              readOnly
              value={sql}
              rows={8}
              className="w-full text-xs font-mono p-3 bg-transparent resize-none focus:outline-none"
              onFocus={(e) => e.currentTarget.select()}
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              onClick={copy}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2" /> Copied
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" /> Copy SQL
                </>
              )}
            </Button>
            {status.sqlEditorUrl ? (
              <a
                href={status.sqlEditorUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-md border border-amber-300 bg-white px-3 py-1.5 text-sm font-medium text-amber-900 hover:bg-amber-100 transition-colors"
              >
                <ExternalLink className="w-4 h-4" /> Open Supabase SQL Editor
              </a>
            ) : null}
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={onRecheck}
              disabled={rechecking}
              className="border-amber-300 text-amber-900 hover:bg-amber-100"
            >
              {rechecking ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              I've run it — recheck
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

type DraftStatus = "pending" | "uploading" | "done" | "error";

interface DesignDraft {
  id: string;
  file: File;
  previewUrl: string;
  price: string;
  status: DraftStatus;
  error?: string;
}

let draftCounter = 0;
const nextDraftId = () => `draft-${++draftCounter}-${Date.now()}`;

function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [drafts, setDrafts] = useState<DesignDraft[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [setup, setSetup] = useState<SetupStatus | null>(null);
  const [recheckingSetup, setRecheckingSetup] = useState(false);

  const checkSetup = async () => {
    setRecheckingSetup(true);
    try {
      const token = getAdminToken();
      const res = await fetch(`${apiBase}/admin/setup-status`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (res.status === 401) {
        clearAdminToken();
        onLogout();
        return;
      }
      if (!res.ok) return;
      const json = (await res.json()) as SetupStatus;
      setSetup(json);
      if (json.ready) {
        // Reload products in case the table was just created.
        await loadProducts();
      }
    } catch {
      // Silent — the upload error path will surface a clearer message.
    } finally {
      setRecheckingSetup(false);
    }
  };

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/products`);
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const json = (await res.json().catch(() => ({}))) as {
        products?: Product[];
      };
      setProducts(Array.isArray(json.products) ? json.products : []);
    } catch (err) {
      console.warn("Could not load designs", err);
      setProducts([]);
      toast({
        title: "Could not load designs",
        description: "You can still add new ones below.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
    checkSetup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onFilesChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    const additions: DesignDraft[] = files.map((file) => ({
      id: nextDraftId(),
      file,
      previewUrl: URL.createObjectURL(file),
      price: "",
      status: "pending",
    }));
    setDrafts((prev) => [...prev, ...additions]);
    // Allow re-selecting the same file again later.
    e.target.value = "";
  };

  const updateDraft = (id: string, patch: Partial<DesignDraft>) => {
    setDrafts((prev) =>
      prev.map((d) => (d.id === id ? { ...d, ...patch } : d)),
    );
  };

  const removeDraft = (id: string) => {
    setDrafts((prev) => {
      const target = prev.find((d) => d.id === id);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return prev.filter((d) => d.id !== id);
    });
  };

  const clearDoneDrafts = () => {
    setDrafts((prev) => {
      prev.forEach((d) => {
        if (d.status === "done") URL.revokeObjectURL(d.previewUrl);
      });
      return prev.filter((d) => d.status !== "done");
    });
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (drafts.length === 0) {
      toast({ title: "Pick one or more images first", variant: "destructive" });
      return;
    }

    const queue = drafts.filter(
      (d) => d.status === "pending" || d.status === "error",
    );
    if (queue.length === 0) {
      toast({ title: "Nothing left to upload" });
      return;
    }

    // Validate prices up front.
    for (const d of queue) {
      const n = Number(d.price);
      if (!d.price || !Number.isFinite(n) || n < 0) {
        toast({
          title: "Enter a price for every design",
          description: "All selected images need a valid ₹ price.",
          variant: "destructive",
        });
        return;
      }
    }

    setSubmitting(true);
    let successes = 0;
    let failures = 0;
    let stoppedForAuth = false;

    for (const d of queue) {
      updateDraft(d.id, { status: "uploading", error: undefined });
      try {
        const fd = new FormData();
        fd.append("image", d.file);
        fd.append("price", String(Number(d.price)));

        const token = getAdminToken();
        const res = await fetch(`${apiBase}/admin/products`, {
          method: "POST",
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          body: fd,
        });

        if (res.status === 401) {
          clearAdminToken();
          stoppedForAuth = true;
          break;
        }

        const json = (await res.json().catch(() => ({}))) as {
          product?: Product;
          error?: string;
          needsSetup?: boolean;
        };

        if (!res.ok || !json.product) {
          if (json.needsSetup) await checkSetup();
          updateDraft(d.id, {
            status: "error",
            error: json.error ?? `HTTP ${res.status}`,
          });
          failures++;
          continue;
        }

        setProducts((prev) => [json.product!, ...prev]);
        updateDraft(d.id, { status: "done" });
        successes++;
      } catch (err) {
        updateDraft(d.id, {
          status: "error",
          error: err instanceof Error ? err.message : "Upload failed",
        });
        failures++;
      }
    }

    setSubmitting(false);

    if (stoppedForAuth) {
      onLogout();
      return;
    }

    if (successes > 0 && failures === 0) {
      toast({
        title:
          successes === 1
            ? "Design added"
            : `${successes} designs added`,
        description: "Live on your site now.",
      });
    } else if (successes > 0) {
      toast({
        title: `${successes} added · ${failures} failed`,
        description: "Fix the failed items and try again.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Uploads failed",
        description: "See the per-image errors below.",
        variant: "destructive",
      });
    }
  };

  const remove = async (id: number) => {
    if (!confirm("Remove this design?")) return;
    const token = getAdminToken();
    const res = await fetch(`${apiBase}/admin/products/${id}`, {
      method: "DELETE",
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    if (res.status === 401) {
      clearAdminToken();
      onLogout();
      return;
    }
    if (!res.ok) {
      toast({ title: "Could not delete", variant: "destructive" });
      return;
    }
    setProducts((prev) => prev.filter((p) => p.id !== id));
    toast({ title: "Design removed" });
  };

  return (
    <div className="min-h-screen bg-secondary/10">
      <header className="border-b border-border bg-background">
        <div className="container mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          <div>
            <div className="text-xl font-serif font-bold text-primary">
              Admin · Mahalaxmi Boutiques
            </div>
            <p className="text-xs text-muted-foreground tracking-widest uppercase mt-0.5">
              Designs Catalogue
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              clearAdminToken();
              onLogout();
            }}
          >
            <LogOut className="w-4 h-4 mr-2" /> Sign out
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 md:px-6 py-10">
        {setup && !setup.ready ? (
          <SetupBanner
            status={setup}
            onRecheck={checkSetup}
            rechecking={recheckingSetup}
          />
        ) : null}

      <div className="grid lg:grid-cols-[420px_1fr] gap-10">
        {/* Add Design form */}
        <section>
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm sticky top-6">
            <h2 className="font-serif text-2xl font-semibold mb-1">
              Add Designs
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              Pick one or many images, set a price for each, then upload them
              all in one go.
            </p>

            <form onSubmit={submit} className="space-y-5">
              <div>
                <Label>Design Images</Label>
                <div className="mt-1.5 space-y-3">
                  {drafts.length > 0 && (
                    <ul className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                      {drafts.map((d) => (
                        <li
                          key={d.id}
                          className="flex items-start gap-3 p-2 rounded-xl border border-border bg-background"
                        >
                          <div className="relative w-16 h-20 shrink-0 rounded-lg overflow-hidden bg-secondary/30">
                            <img
                              src={d.previewUrl}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-muted-foreground truncate">
                              {d.file.name}
                            </p>
                            <Input
                              type="number"
                              inputMode="decimal"
                              min={0}
                              step="1"
                              value={d.price}
                              onChange={(e) =>
                                updateDraft(d.id, { price: e.target.value })
                              }
                              placeholder="Price ₹"
                              disabled={
                                d.status === "uploading" || d.status === "done"
                              }
                              className="mt-1 h-9 text-sm"
                            />
                            <div className="mt-1 text-[11px] uppercase tracking-widest font-medium">
                              {d.status === "pending" && (
                                <span className="text-muted-foreground">
                                  Ready
                                </span>
                              )}
                              {d.status === "uploading" && (
                                <span className="text-primary inline-flex items-center gap-1">
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                  Uploading…
                                </span>
                              )}
                              {d.status === "done" && (
                                <span className="text-emerald-600 inline-flex items-center gap-1">
                                  <Check className="w-3 h-3" /> Added
                                </span>
                              )}
                              {d.status === "error" && (
                                <span className="text-destructive">
                                  Failed{d.error ? `: ${d.error}` : ""}
                                </span>
                              )}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeDraft(d.id)}
                            disabled={d.status === "uploading"}
                            className="text-muted-foreground hover:text-destructive disabled:opacity-40 transition-colors p-1"
                            aria-label="Remove image"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}

                  <label
                    htmlFor="images"
                    className="flex flex-col items-center justify-center py-6 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-primary/60 hover:bg-secondary/20 transition-colors"
                  >
                    <ImageIcon className="w-7 h-7 text-muted-foreground mb-1.5" />
                    <span className="text-sm text-muted-foreground">
                      {drafts.length > 0
                        ? "Add more images"
                        : "Click to choose images"}
                    </span>
                    <span className="text-xs text-muted-foreground mt-1">
                      JPG, PNG or WEBP · up to 10 MB each
                    </span>
                  </label>
                  <Input
                    id="images"
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={onFilesChange}
                    className="sr-only"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={submitting || drafts.length === 0}
                className="w-full"
                size="lg"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Uploading…
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    {(() => {
                      const pending = drafts.filter(
                        (d) => d.status === "pending" || d.status === "error",
                      ).length;
                      if (pending === 0) return "Add Designs";
                      return pending === 1
                        ? "Add 1 Design"
                        : `Add ${pending} Designs`;
                    })()}
                  </>
                )}
              </Button>

              {drafts.some((d) => d.status === "done") && (
                <button
                  type="button"
                  onClick={clearDoneDrafts}
                  className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Clear uploaded items from this list
                </button>
              )}
            </form>
          </div>
        </section>

        {/* Existing designs */}
        <section>
          <div className="flex items-baseline justify-between mb-5">
            <h2 className="font-serif text-2xl font-semibold">
              Live Designs
            </h2>
            <span className="text-sm text-muted-foreground">
              {products.length} total
            </span>
          </div>
          {loading ? (
            <div className="flex items-center text-muted-foreground py-12 justify-center">
              <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading…
            </div>
          ) : products.length === 0 ? (
            <p className="text-muted-foreground py-12 text-center">
              No designs yet. Add your first one on the left.
            </p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {products.map((p) => (
                <div
                  key={p.id}
                  className="group relative bg-card border border-border rounded-2xl overflow-hidden"
                >
                  <div className="aspect-[3/4] bg-secondary/20">
                    <img
                      src={p.imageUrl}
                      alt="Design"
                      loading="lazy"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-3 flex items-center justify-between">
                    <span className="font-serif font-semibold">
                      ₹{formatPrice(p.price)}
                    </span>
                    <button
                      onClick={() => remove(p.id)}
                      className="text-destructive/80 hover:text-destructive transition-colors"
                      aria-label="Remove design"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
      </main>
    </div>
  );
}

export default function AdminPage() {
  const [loggedIn, setLoggedIn] = useState(() => isAdminLoggedIn());

  return loggedIn ? (
    <AdminDashboard onLogout={() => setLoggedIn(false)} />
  ) : (
    <LoginForm onSuccess={() => setLoggedIn(true)} />
  );
}
