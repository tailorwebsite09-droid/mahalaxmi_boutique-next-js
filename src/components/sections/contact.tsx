"use client";
import { useState, useRef } from "react";
import { motion } from "framer-motion";
import emailjs from "@emailjs/browser";
import { Mail, Phone, MapPin, Send, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

// EmailJS configuration — set these in your .env file (in artifacts/mahalaxmi-boutiques):
//   VITE_EMAILJS_SERVICE_ID=your_service_id
//   VITE_EMAILJS_TEMPLATE_ID=your_template_id
//   VITE_EMAILJS_PUBLIC_KEY=your_public_key
// If any are missing, the form gracefully falls back to a simulated submission so the
// site remains demoable out of the box.
const EMAILJS_SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID as string | undefined;
const EMAILJS_TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID as string | undefined;
const EMAILJS_PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY as string | undefined;

const apiBase = "/api";

interface FormState {
  name: string;
  email: string;
  phone: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
}

const initialForm: FormState = { name: "", email: "", phone: "", message: "" };

const contactInfo = [
  {
    icon: Phone,
    label: "Call Us",
    value: "+91 79933 64017",
    href: "tel:+917993364017",
  },
  {
    icon: Mail,
    label: "Email",
    value: "sunchutarunkumar@gmail.com",
    href: "mailto:sunchutarunkumar@gmail.com",
  },
  {
    icon: MapPin,
    label: "Visit Atelier",
    value: "DURGANAGAR MAILERDEVPALLY NEAR VIJAYA SALES, HYDERABAD, TELANGANA 500077",
    href: "#",
  },
];

export function Contact() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const { toast } = useToast();

  const validate = (): boolean => {
    const next: FormErrors = {};
    if (!form.name.trim()) next.name = "Please enter your name";
    if (!form.email.trim()) {
      next.email = "Please enter your email";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      next.email = "Please enter a valid email address";
    }
    if (!form.phone.trim()) next.phone = "Please enter your phone number";
    if (!form.message.trim()) next.message = "Please share a short message";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const update = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const hasEmailJs =
        !!EMAILJS_SERVICE_ID && !!EMAILJS_TEMPLATE_ID && !!EMAILJS_PUBLIC_KEY;

      // Persist the message in Supabase via our backend, while sending the
      // notification email via EmailJS in parallel.
      const persistPromise = fetch(`${apiBase}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          message: form.message.trim(),
        }),
      }).catch((err) => {
        console.warn("Contact persist failed", err);
        return null;
      });

      const emailPromise =
        hasEmailJs && formRef.current
          ? emailjs.sendForm(
              EMAILJS_SERVICE_ID!,
              EMAILJS_TEMPLATE_ID!,
              formRef.current,
              { publicKey: EMAILJS_PUBLIC_KEY! },
            )
          : new Promise((res) => setTimeout(res, 800));

      await Promise.all([persistPromise, emailPromise]);

      setIsSent(true);
      toast({
        title: "Message Sent Successfully",
        description: "Thank you. Our atelier will reach out to you shortly.",
      });
      setForm(initialForm);
      setTimeout(() => setIsSent(false), 3500);
    } catch (err) {
      toast({
        title: "Something went wrong",
        description: "We couldn't send your message. Please try again or call us directly.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="relative py-24 md:py-32 bg-background overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-secondary/10 to-background" />

      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.7 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="inline-block text-primary text-xs font-semibold tracking-[0.3em] uppercase">
            Get in Touch
          </span>
          <h2 className="mt-4 text-4xl md:text-5xl lg:text-6xl font-serif font-semibold text-foreground leading-tight">
            Start Your <span className="italic text-primary">Design</span> Journey
          </h2>
          <div className="w-16 h-px bg-primary mx-auto mt-6" />
          <p className="mt-6 text-muted-foreground text-base md:text-lg font-light">
            Tell us your design, size, or requirement, and we’ll get in touch with you.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-2 space-y-6"
          >
            <div className="space-y-4">
              {contactInfo.map((info) => (
                <a
                  key={info.label}
                  href={info.href}
                  className="group flex items-start gap-4 p-5 bg-card/80 backdrop-blur-sm border border-card-border rounded-2xl hover:border-primary/50 hover:shadow-md transition-all duration-300"
                >
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/15 to-secondary/40 flex items-center justify-center shrink-0 group-hover:from-primary/30 transition-colors">
                    <info.icon className="w-5 h-5 text-primary" strokeWidth={1.5} />
                  </div>
                  <div>
                    <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
                      {info.label}
                    </div>
                    <div className="text-foreground font-medium">{info.value}</div>
                  </div>
                </a>
              ))}
            </div>

            <div className="p-6 bg-gradient-to-br from-primary/10 via-secondary/30 to-accent/30 rounded-2xl border border-primary/20">
              <div className="text-xs uppercase tracking-widest text-primary font-semibold mb-2">
                Atelier Hours
              </div>
              <div className="space-y-1 text-sm text-foreground/80">
                <div className="flex justify-between">
                  <span>Monday – Saturday</span>
                  <span className="font-medium">10:00 AM – 8:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span>Sunday</span>
                  <span className="font-medium">10:00 AM - 1:00 PM</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="lg:col-span-3"
          >
            <form
              ref={formRef}
              onSubmit={handleSubmit}
              className="bg-card border border-card-border rounded-3xl p-6 md:p-10 shadow-xl space-y-5"
              noValidate
            >
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="name" className="block text-xs uppercase tracking-widest text-muted-foreground mb-2">
                    Name
                  </label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={form.name}
                    onChange={update("name")}
                    placeholder="Your full name"
                    className="bg-background/60 border-border focus-visible:border-primary h-11"
                    aria-invalid={!!errors.name}
                  />
                  {errors.name && (
                    <p className="mt-1.5 text-xs text-destructive">{errors.name}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="phone" className="block text-xs uppercase tracking-widest text-muted-foreground mb-2">
                    Phone
                  </label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={update("phone")}
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
                <label htmlFor="email" className="block text-xs uppercase tracking-widest text-muted-foreground mb-2">
                  Email
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={update("email")}
                  placeholder="you@example.com"
                  className="bg-background/60 border-border focus-visible:border-primary h-11"
                  aria-invalid={!!errors.email}
                />
                {errors.email && (
                  <p className="mt-1.5 text-xs text-destructive">{errors.email}</p>
                )}
              </div>

              <div>
                <label htmlFor="message" className="block text-xs uppercase tracking-widest text-muted-foreground mb-2">
                  Tell us about your piece
                </label>
                <Textarea
                  id="message"
                  name="message"
                  value={form.message}
                  onChange={update("message")}
                  placeholder="Share the occasion, fabric, and any inspiration you have in mind..."
                  className="bg-background/60 border-border focus-visible:border-primary min-h-[140px] resize-y"
                  aria-invalid={!!errors.message}
                />
                {errors.message && (
                  <p className="mt-1.5 text-xs text-destructive">{errors.message}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                size="lg"
                className="w-full md:w-auto bg-primary text-primary-foreground hover:bg-primary/90 px-10 py-6 rounded-full text-sm tracking-widest uppercase shadow-[0_0_20px_rgba(200,160,50,0.25)] hover:shadow-[0_0_30px_rgba(200,160,50,0.45)] transition-all"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : isSent ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Sent
                  </>
                ) : (
                  <>
                    Send Message
                    <Send className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

