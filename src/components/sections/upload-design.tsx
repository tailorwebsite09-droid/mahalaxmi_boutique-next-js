"use client";
import { useState, useRef, useCallback, type DragEvent, type ChangeEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import emailjs from "@emailjs/browser";
import {
  UploadCloud,
  ImageIcon,
  X,
  Sparkles,
  Loader2,
  CheckCircle2,
  Copy,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const EMAILJS_SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID as string | undefined;
const EMAILJS_TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID as string | undefined;
const EMAILJS_PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY as string | undefined;

const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB
const ACCEPTED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/svg+xml"];
const ACCEPT_ATTR = ".jpg,.jpeg,.png,.svg,image/jpeg,image/png,image/svg+xml";

const FABRICS = [
  "Silk",
  "Cotton",
  "Georgette",
  "Chiffon",
  "Velvet",
  "Net",
  "Banarasi Brocade",
  "Linen",
  "Other",
];

const PLACEMENTS = [
  "Front (Chest / Yoke)",
  "Back",
  "Left Sleeve",
  "Right Sleeve",
  "Both Sleeves",
  "Neckline",
  "Hemline / Border",
  "All-Over Pattern",
];

interface FormState {
  name: string;
  phone: string;
  email: string;
  description: string;
  fabricType: string;
  placement: string;
  aiEnhancement: boolean;
}

interface FormErrors {
  name?: string;
  phone?: string;
  email?: string;
  description?: string;
  fabricType?: string;
  placement?: string;
  file?: string;
}

const initialForm: FormState = {
  name: "",
  phone: "",
  email: "",
  description: "",
  fabricType: "",
  placement: "",
  aiEnhancement: false,
};

const apiBase = "/api";

// WhatsApp business number for design submissions (digits only, country code first).
const WHATSAPP_NUMBER = "917993364017";

interface UploadResult {
  orderId: string;
  designUrl: string;
}

/**
 * Compress + (optionally) enhance a raster image client-side using a canvas.
 * - Resizes longest edge to 1600px max
 * - Re-encodes as JPEG @ 0.85 quality (PNG/JPG inputs)
 * - When `enhance` is true, lifts contrast and slightly sharpens to make the
 *   embroidery outline cleaner.
 * - SVG and animated formats are returned untouched.
 */
async function optimiseImage(file: File, enhance: boolean): Promise<File> {
  if (file.type === "image/svg+xml") return file;

  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const i = new Image();
    i.onload = () => resolve(i);
    i.onerror = () => reject(new Error("Could not decode image"));
    i.src = dataUrl;
  });

  const MAX_EDGE = 1600;
  const scale = Math.min(1, MAX_EDGE / Math.max(img.width, img.height));
  const w = Math.max(1, Math.round(img.width * scale));
  const h = Math.max(1, Math.round(img.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;

  if (enhance) {
    ctx.filter = "contrast(1.18) saturate(1.05) brightness(1.02)";
  }
  ctx.drawImage(img, 0, 0, w, h);

  if (enhance) {
    // Light unsharp mask via difference of two scaled draws.
    try {
      const sharp = document.createElement("canvas");
      sharp.width = w;
      sharp.height = h;
      const sctx = sharp.getContext("2d");
      if (sctx) {
        sctx.filter = "blur(1.2px)";
        sctx.drawImage(canvas, 0, 0);
        ctx.globalCompositeOperation = "difference";
        ctx.globalAlpha = 0.18;
        ctx.filter = "none";
        ctx.drawImage(sharp, 0, 0);
        ctx.globalCompositeOperation = "source-over";
        ctx.globalAlpha = 1;
      }
    } catch {
      /* sharpening is best-effort */
    }
  }

  const blob: Blob = await new Promise((resolve) => {
    canvas.toBlob((b) => resolve(b ?? new Blob([])), "image/jpeg", 0.85);
  });

  if (!blob.size) return file;

  const newName = file.name.replace(/\.(png|jpg|jpeg)$/i, "") + ".jpg";
  return new File([blob], newName, { type: "image/jpeg" });
}

export function UploadDesign() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusText, setStatusText] = useState<string | null>(null);
  const [result, setResult] = useState<UploadResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const acceptFile = useCallback(
    (f: File): boolean => {
      if (!ACCEPTED_TYPES.includes(f.type)) {
        setErrors((p) => ({ ...p, file: "Please upload a JPG, PNG, or SVG image." }));
        return false;
      }
      if (f.size > MAX_FILE_BYTES) {
        setErrors((p) => ({ ...p, file: "File is larger than 5 MB. Please choose a smaller image." }));
        return false;
      }
      setErrors((p) => ({ ...p, file: undefined }));
      setFile(f);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(URL.createObjectURL(f));
      return true;
    },
    [previewUrl],
  );

  const onPickFile = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) acceptFile(f);
    if (inputRef.current) inputRef.current.value = "";
  };

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) acceptFile(f);
  };

  const clearFile = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(null);
    setPreviewUrl(null);
  };

  const update =
    <K extends keyof FormState>(field: K) =>
    (value: FormState[K]) => {
      setForm((prev) => ({ ...prev, [field]: value }));
      if (field in errors) {
        setErrors((p) => ({ ...p, [field as keyof FormErrors]: undefined }));
      }
    };

  const validate = (): boolean => {
    const next: FormErrors = {};
    if (!file) next.file = "Please upload your design image first.";
    if (!form.name.trim()) next.name = "Please enter your name";
    if (!form.phone.trim()) next.phone = "Please enter your phone number";
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      next.email = "Please enter a valid email";
    if (!form.description.trim()) next.description = "Please describe your design";
    if (!form.fabricType) next.fabricType = "Please choose a fabric";
    if (!form.placement) next.placement = "Please choose a placement";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const sendOrderEmail = async (order: UploadResult, optimisedFileName: string) => {
    if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) return;

    const absoluteDesignUrl = `${window.location.origin}${order.designUrl}`;
    const messageBody = [
      `New Design Order: ${order.orderId}`,
      ``,
      `Customer: ${form.name}`,
      `Phone:    ${form.phone}`,
      form.email.trim() ? `Email:    ${form.email}` : null,
      ``,
      `Fabric:    ${form.fabricType}`,
      `Placement: ${form.placement}`,
      `AI Enhancement: ${form.aiEnhancement ? "Yes" : "No"}`,
      ``,
      `Design Description:`,
      form.description,
      ``,
      `Design File: ${optimisedFileName}`,
      `View Design: ${absoluteDesignUrl}`,
    ]
      .filter(Boolean)
      .join("\n");

    await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      {
        name: `Design Order ${order.orderId} — ${form.name}`,
        email: form.email.trim() || "noreply@mahalaxmiboutiques.in",
        phone: form.phone,
        message: messageBody,
      },
      { publicKey: EMAILJS_PUBLIC_KEY },
    );
  };

  const handleSubmit = async () => {
    if (!validate() || !file) return;

    setIsSubmitting(true);
    setStatusText("Preparing your design for embroidery…");

    try {
      const optimised = await optimiseImage(file, form.aiEnhancement);

      setStatusText("Securely uploading your design…");
      const urlRes = await fetch(`${apiBase}/storage/uploads/request-url`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: optimised.name,
          size: optimised.size,
          contentType: optimised.type,
        }),
      });
      if (!urlRes.ok) throw new Error("Could not get upload URL");
      const { uploadURL, objectPath } = (await urlRes.json()) as {
        uploadURL: string;
        objectPath: string;
      };

      const putRes = await fetch(uploadURL, {
        method: "PUT",
        headers: { "Content-Type": optimised.type },
        body: optimised,
      });
      if (!putRes.ok) throw new Error("Upload failed");

      setStatusText("Saving your order details…");
      const orderRes = await fetch(`${apiBase}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          phone: form.phone.trim(),
          email: form.email.trim(),
          description: form.description.trim(),
          fabricType: form.fabricType,
          placement: form.placement,
          aiEnhancement: form.aiEnhancement,
          designPath: `/objects/${objectPath}`,
          designFileName: optimised.name,
        }),
      });
      if (!orderRes.ok) throw new Error("Order creation failed");
      const order = (await orderRes.json()) as UploadResult;

      setStatusText("Notifying our atelier…");
      try {
        await sendOrderEmail(order, optimised.name);
      } catch (emailErr) {
        // The order is saved; email notification is best-effort.
        console.warn("Order saved but email notification failed", emailErr);
      }

      setResult(order);

      // Build pre-filled WhatsApp message and open the chat in a new tab so
      // the customer can attach the design image manually and send.
      const waMessage =
        `Hello, I want to send my embroidery design:\n\n` +
        `Order ID: ${order.orderId}\n` +
        `Name: ${form.name.trim()}\n` +
        `Phone: ${form.phone.trim()}\n` +
        `Fabric: ${form.fabricType}\n` +
        `Placement: ${form.placement}\n` +
        `Details: ${form.description.trim()}\n\n` +
        `I am attaching my design image.`;
      const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(waMessage)}`;

      setStatusText("Opening WhatsApp…");
      toast({
        title: "Opening WhatsApp…",
        description: "Please attach your design image and send.",
      });
      window.open(waUrl, "_blank", "noopener,noreferrer");
    } catch (err) {
      console.error(err);
      toast({
        title: "Could not send your order",
        description: "Please try again in a moment, or call us directly.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      setStatusText(null);
    }
  };

  const startNewOrder = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setForm(initialForm);
    setErrors({});
    setFile(null);
    setPreviewUrl(null);
    setResult(null);
  };

  const copyOrderId = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.orderId);
      toast({ title: "Copied", description: "Order ID copied to clipboard" });
    } catch {
      /* ignore */
    }
  };

  return (
    <section
      id="upload-design"
      className="relative py-24 md:py-32 bg-gradient-to-b from-secondary/15 via-background to-background overflow-hidden"
    >
      <div
        className="absolute inset-0 -z-10 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 10% 10%, hsl(var(--primary)) 1px, transparent 1px), radial-gradient(circle at 90% 80%, hsl(var(--primary)) 1px, transparent 1px)",
          backgroundSize: "60px 60px, 80px 80px",
        }}
      />

      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.7 }}
          className="text-center max-w-2xl mx-auto mb-14"
        >
          <span className="inline-block text-primary text-xs font-semibold tracking-[0.3em] uppercase">
            Custom Embroidery Studio
          </span>
          <h2 className="mt-4 text-4xl md:text-5xl lg:text-6xl font-serif font-semibold text-foreground leading-tight">
            Turn Your Design Into <span className="italic text-primary">Reality</span>
          </h2>
          <div className="w-16 h-px bg-primary mx-auto mt-6" />
          <p className="mt-6 text-muted-foreground text-base md:text-lg font-light">
            Upload your sketch, design, or idea. Choose the fabric and where you want the embroidery. We’ll turn it into beautiful embroidery work.
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          {result ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-2xl mx-auto bg-card border border-card-border rounded-3xl shadow-xl p-8 md:p-12 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-primary/15 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-8 h-8 text-primary" strokeWidth={1.5} />
              </div>
              <h3 className="text-2xl md:text-3xl font-serif font-semibold text-foreground">
                Your design is in safe hands
              </h3>
              <p className="mt-3 text-muted-foreground">
                Thank you, {form.name || "there"}. Our atelier has received your order
                and will reach out within one business day.
              </p>

              <div className="mt-8 inline-flex items-center gap-3 px-5 py-3 rounded-full bg-primary/10 border border-primary/20">
                <span className="text-xs uppercase tracking-widest text-primary font-semibold">
                  Order ID
                </span>
                <span className="font-mono text-foreground text-base">{result.orderId}</span>
                <button
                  onClick={copyOrderId}
                  className="text-primary hover:text-primary/80 transition-colors"
                  aria-label="Copy order ID"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-8 grid sm:grid-cols-2 gap-3 max-w-md mx-auto">
                <a
                  href={result.designUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full border border-border text-foreground hover:border-primary hover:text-primary transition-colors text-sm uppercase tracking-widest"
                >
                  <ImageIcon className="w-4 h-4" />
                  View Design
                </a>
                <Button
                  onClick={startNewOrder}
                  className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 px-5 py-3 text-sm uppercase tracking-widest"
                >
                  Place Another Order
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="grid lg:grid-cols-5 gap-8 lg:gap-10 items-start"
            >
              {/* Upload card */}
              <div className="lg:col-span-2">
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={onDrop}
                  className={`relative rounded-3xl border-2 border-dashed transition-all duration-300 overflow-hidden ${
                    isDragging
                      ? "border-primary bg-primary/5 scale-[1.01]"
                      : "border-border bg-card/60 hover:border-primary/60"
                  } ${previewUrl ? "p-0" : "p-8 md:p-10"}`}
                >
                  {previewUrl && file ? (
                    <div className="relative">
                      <div className="aspect-square w-full bg-gradient-to-br from-secondary/30 to-accent/20 flex items-center justify-center overflow-hidden">
                        <img
                          src={previewUrl}
                          alt="Design preview"
                          className="w-full h-full object-contain p-4"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={clearFile}
                        className="absolute top-3 right-3 w-9 h-9 rounded-full bg-background/90 backdrop-blur-sm border border-border flex items-center justify-center text-foreground hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-colors shadow-md"
                        aria-label="Remove design"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <div className="px-5 py-4 bg-card border-t border-card-border">
                        <p className="text-sm font-medium text-foreground truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {(file.size / 1024).toFixed(1)} KB · {file.type.split("/")[1].toUpperCase()}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-center py-6">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/15 to-secondary/40 flex items-center justify-center mb-5">
                        <UploadCloud className="w-8 h-8 text-primary" strokeWidth={1.5} />
                      </div>
                      <h3 className="font-serif text-xl text-foreground mb-2">Upload Design</h3>
                      <p className="text-sm text-muted-foreground mb-5 max-w-xs">
                        Drag & drop your sketch or motif here, or click below to browse.
                        JPG, PNG or SVG up to 5 MB.
                      </p>
                      <Button
                        type="button"
                        onClick={() => inputRef.current?.click()}
                        className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 px-6 py-2.5 text-sm tracking-widest uppercase"
                      >
                        Choose File
                      </Button>
                    </div>
                  )}
                  <input
                    ref={inputRef}
                    type="file"
                    accept={ACCEPT_ATTR}
                    className="hidden"
                    onChange={onPickFile}
                  />
                </div>
                {errors.file && (
                  <p className="mt-2 text-xs text-destructive">{errors.file}</p>
                )}

                {/* AI enhancement toggle */}
                <div className="mt-5 p-5 rounded-2xl bg-gradient-to-br from-primary/8 via-secondary/20 to-accent/20 border border-primary/15 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
                    <Sparkles className="w-5 h-5 text-primary" strokeWidth={1.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          AI Design Enhancement
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Cleans edges and lifts contrast for sharper embroidery clarity.
                        </p>
                      </div>
                      <Switch
                        checked={form.aiEnhancement}
                        onCheckedChange={update("aiEnhancement")}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Form */}
              <div className="lg:col-span-3">
                <div className="bg-card border border-card-border rounded-3xl shadow-xl p-6 md:p-10 space-y-5">
                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-2">
                        Name
                      </label>
                      <Input
                        value={form.name}
                        onChange={(e) => update("name")(e.target.value)}
                        placeholder="Your full name"
                        className="bg-background/60 border-border focus-visible:border-primary h-11"
                        aria-invalid={!!errors.name}
                      />
                      {errors.name && (
                        <p className="mt-1.5 text-xs text-destructive">{errors.name}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-2">
                        Phone Number
                      </label>
                      <Input
                        type="tel"
                        value={form.phone}
                        onChange={(e) => update("phone")(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="bg-background/60 border-border focus-visible:border-primary h-11"
                        aria-invalid={!!errors.phone}
                      />
                      {errors.phone && (
                        <p className="mt-1.5 text-xs text-destructive">{errors.phone}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-2">
                      Email <span className="normal-case text-muted-foreground/60">(optional)</span>
                    </label>
                    <Input
                      type="email"
                      value={form.email}
                      onChange={(e) => update("email")(e.target.value)}
                      placeholder="you@example.com"
                      className="bg-background/60 border-border focus-visible:border-primary h-11"
                      aria-invalid={!!errors.email}
                    />
                    {errors.email && (
                      <p className="mt-1.5 text-xs text-destructive">{errors.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-2">
                      Design Description
                    </label>
                    <Textarea
                      value={form.description}
                      onChange={(e) => update("description")(e.target.value)}
                      placeholder="Describe colours, motif, thread style, occasion..."
                      className="bg-background/60 border-border focus-visible:border-primary min-h-[110px] resize-y"
                      aria-invalid={!!errors.description}
                    />
                    {errors.description && (
                      <p className="mt-1.5 text-xs text-destructive">{errors.description}</p>
                    )}
                  </div>

                  <div className="grid md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-2">
                        Fabric Type
                      </label>
                      <Select value={form.fabricType} onValueChange={update("fabricType")}>
                        <SelectTrigger
                          className="bg-background/60 border-border focus:border-primary h-11"
                          aria-invalid={!!errors.fabricType}
                        >
                          <SelectValue placeholder="Choose a fabric" />
                        </SelectTrigger>
                        <SelectContent>
                          {FABRICS.map((f) => (
                            <SelectItem key={f} value={f}>
                              {f}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.fabricType && (
                        <p className="mt-1.5 text-xs text-destructive">{errors.fabricType}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-2">
                        Placement
                      </label>
                      <Select value={form.placement} onValueChange={update("placement")}>
                        <SelectTrigger
                          className="bg-background/60 border-border focus:border-primary h-11"
                          aria-invalid={!!errors.placement}
                        >
                          <SelectValue placeholder="Choose placement" />
                        </SelectTrigger>
                        <SelectContent>
                          {PLACEMENTS.map((p) => (
                            <SelectItem key={p} value={p}>
                              {p}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.placement && (
                        <p className="mt-1.5 text-xs text-destructive">{errors.placement}</p>
                      )}
                    </div>
                  </div>

                  <Button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    size="lg"
                    className="w-full md:w-auto bg-primary text-primary-foreground hover:bg-primary/90 px-10 py-6 rounded-full text-sm tracking-widest uppercase shadow-[0_0_20px_rgba(200,160,50,0.25)] hover:shadow-[0_0_30px_rgba(200,160,50,0.45)] transition-all"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {statusText ?? "Sending your design…"}
                      </>
                    ) : (
                      <>
                        Send via WhatsApp
                        <MessageCircle className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

