"use client";
import { motion } from "framer-motion";
import { CheckCircle2, Award, IndianRupee, Clock } from "lucide-react";

const features = [
  {
    icon: CheckCircle2,
    title: "Perfect Fitting Guarantee",
    description: "Precision tailoring that complements your body perfectly.",
  },
  {
    icon: Award,
    title: "Experienced Tailors",
    description: "Skilled craftsmanship with years of expertise.",
  },
  {
    icon: IndianRupee,
    title: "Affordable Pricing",
    description: "Premium quality at budget-friendly prices.",
  },
  {
    icon: Clock,
    title: "On-Time Delivery",
    description: "We value your time with guaranteed timely service.",
  },
];

export function WhyUs() {
  return (
    <section id="why-us" className="relative py-24 md:py-32 bg-background overflow-hidden">
      {/* Soft decorative blob */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-72 h-72 bg-secondary/30 rounded-full blur-3xl -z-0" />
      <div className="absolute top-1/3 right-0 w-72 h-72 bg-accent/40 rounded-full blur-3xl -z-0" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.7 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="inline-block text-primary text-xs font-semibold tracking-[0.3em] uppercase">
            Why Choose Us
          </span>
          <h2 className="mt-4 text-4xl md:text-5xl lg:text-6xl font-serif font-semibold text-foreground leading-tight">
            The <span className="italic text-primary">Mahalaxmi</span> Promise
          </h2>
          <div className="w-16 h-px bg-primary mx-auto mt-6" />
          <p className="mt-6 text-muted-foreground text-base md:text-lg font-light">
            We offer quality stitching, good fitting, and reliable service.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {features.map((f, idx) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              className="group relative"
            >
              <div className="relative h-full p-8 bg-card/80 backdrop-blur-sm border border-card-border rounded-2xl text-center shadow-sm hover:shadow-2xl hover:scale-[1.03] transition-all duration-500">
                <div className="relative inline-flex w-16 h-16 items-center justify-center rounded-full bg-gradient-to-br from-primary/15 to-secondary/40 mb-5 group-hover:shadow-[0_0_30px_rgba(200,160,50,0.35)] transition-shadow duration-500">
                  <f.icon className="w-7 h-7 text-primary" strokeWidth={1.5} />
                  <div className="absolute inset-0 rounded-full ring-1 ring-primary/20 group-hover:ring-primary/40 transition" />
                </div>
                <h3 className="text-lg md:text-xl font-serif font-semibold text-card-foreground mb-3">
                  {f.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed font-light">
                  {f.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

