"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { MessageCircle, Loader2 } from "lucide-react";
import { apiBase } from "@/lib/api";

interface Product {
  id: number;
  imageUrl: string;
  price: number;
  createdAt: string;
}

const WHATSAPP_NUMBER = "917993364017";

const formatPrice = (n: number) =>
  new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n);

function openWhatsApp(price: number) {
  const message = `Hello, I am interested in this design.\nPrice: ₹${formatPrice(price)}`;
  const url = `https://api.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${encodeURIComponent(message)}`;
  // Use location.href so mobile browsers hand off cleanly to the WhatsApp app.
  window.location.href = url;
}

export function Designs() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await fetch(`${apiBase}/products`);
        if (!res.ok) throw new Error("fetch failed");
        const json = (await res.json()) as { products: Product[] };
        if (!alive) return;
        setProducts(json.products);
      } catch (e) {
        console.warn("Could not load designs", e);
        if (alive) setError("Could not load designs right now.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <section
      id="designs"
      className="relative py-24 md:py-32 bg-background overflow-hidden"
    >
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="text-primary text-xs md:text-sm font-semibold tracking-[0.3em] uppercase">
            Featured Designs
          </span>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold mt-3">
            Our Latest <span className="italic text-primary">Creations</span>
          </h2>
          <div className="w-12 h-px bg-primary mx-auto mt-5 mb-5" />
          <p className="text-base md:text-lg text-muted-foreground font-light leading-relaxed">
            Browse our designs. Tap any design to enquire on WhatsApp. We’ll share fabric options, delivery time, and styling help.
          </p>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            Loading designs…
          </div>
        ) : error ? (
          <p className="text-center text-muted-foreground py-12">{error}</p>
        ) : products.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">
            New designs coming soon. Check back shortly.
          </p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((p, idx) => (
              <motion.button
                key={p.id}
                type="button"
                onClick={() => openWhatsApp(p.price)}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: Math.min(idx, 8) * 0.05 }}
                className="group relative text-left overflow-hidden rounded-2xl bg-card border border-border shadow-sm hover:shadow-xl transition-all"
                aria-label={`Enquire about design priced at ₹${formatPrice(p.price)}`}
              >
                <div className="aspect-[3/4] overflow-hidden bg-secondary/20">
                  <img
                    src={p.imageUrl}
                    alt="Design"
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-3 md:p-4 flex items-center justify-between gap-2">
                  <span className="text-base md:text-lg font-serif font-semibold text-foreground">
                    ₹{formatPrice(p.price)}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-primary uppercase tracking-widest">
                    <MessageCircle className="w-3.5 h-3.5" />
                    Enquire
                  </span>
                </div>
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

