"use client";
import { motion } from "framer-motion";
import aboutImg from "@assets/about.png";

export function About() {
  return (
    <section id="about" className="relative py-24 md:py-32 bg-background overflow-hidden">
      {/* Decorative gold accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-16 bg-gradient-to-b from-transparent to-primary/40" />

      <div className="container mx-auto px-4 md:px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-xl aspect-[4/5] lg:aspect-[4/4]">
              <img
                src={aboutImg.src}
                alt="Mahalaxmi Boutiques atelier"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 via-transparent to-transparent" />
            </div>

            {/* Floating gold frame accent */}
            <div className="hidden md:block absolute -bottom-6 -right-6 w-2/3 h-2/3 border-2 border-primary/40 rounded-2xl -z-10" />
            <div className="hidden md:block absolute -top-6 -left-6 w-32 h-32 bg-secondary/40 rounded-full blur-3xl -z-10" />
          </motion.div>

          {/* Text */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.8, delay: 0.15, ease: "easeOut" }}
            className="space-y-6"
          >
            <span className="inline-block text-primary text-xs font-semibold tracking-[0.3em] uppercase">
              About Us
            </span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-semibold text-foreground leading-tight">
              Trusted stitching for every <span className="italic text-primary">Occasion</span>
            </h2>
            <div className="w-16 h-px bg-primary" />
            <div className="space-y-4 text-base md:text-lg text-muted-foreground leading-relaxed font-light">
              <p>
                Mahalaxmi Boutiques has been serving customers for many years with quality stitching and neat finishing. We stitch every dress with care and attention to detail.
              </p>
              <p>
                We stitch bridal wear, blouses, and dresses to match your size, style, and occasion.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-6 pt-6 border-t border-border">
              <div>
                <div className="text-3xl md:text-4xl font-serif font-semibold text-primary">20+</div>
                <div className="text-xs text-muted-foreground tracking-wider uppercase mt-1">
                  Years of Craft
                </div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-serif font-semibold text-primary">5K+</div>
                <div className="text-xs text-muted-foreground tracking-wider uppercase mt-1">
                  Happy Clients
                </div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-serif font-semibold text-primary">100%</div>
                <div className="text-xs text-muted-foreground tracking-wider uppercase mt-1">
                  Hand Finished
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

