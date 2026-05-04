"use client";
import { motion } from "framer-motion";
import { Scissors, Sparkles, Shirt, Ruler, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import embroideryImg from "@/assets/embroidery.png";

const otherServices = [
  {
    icon: Scissors,
    title: "Custom Blouse Stitching",
    description:
      "We stitch blouses in different neck and back designs to match your size and style.",
  },
  {
    icon: Shirt,
    title: "Designer Wear",
    description:
      "We stitch lehengas, anarkalis, gowns, and bridal dresses for weddings and special occasions.",
  },
  {
    icon: Ruler,
    title: "Alterations",
    description:
      "We alter blouses, dresses, sarees, and other clothes for better fitting and comfort.",
  },
];

export function Services() {
  return (
    <section
      id="services"
      className="relative py-24 md:py-32 bg-gradient-to-b from-background via-muted/40 to-background overflow-hidden"
    >
      <div className="container mx-auto px-4 md:px-6">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.7 }}
          className="text-center max-w-2xl mx-auto mb-16 md:mb-20"
        >
          <span className="inline-block text-primary text-xs font-semibold tracking-[0.3em] uppercase">
            Our Services
          </span>
          <h2 className="mt-4 text-4xl md:text-5xl lg:text-6xl font-serif font-semibold text-foreground leading-tight">
            Made for your  <span className="italic text-primary">Style</span>
          </h2>
          <div className="w-16 h-px bg-primary mx-auto mt-6" />
          <p className="mt-6 text-muted-foreground text-base md:text-lg font-light">
            Blouses, dresses, embroidery, and alterations for every occasion.
          </p>
        </motion.div>

        {/* Featured: Computer Embroidery */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8 }}
          className="relative mb-16"
        >
          <div className="relative grid md:grid-cols-2 rounded-3xl overflow-hidden bg-card border border-card-border shadow-xl group">
            {/* Image */}
            <div className="relative aspect-[4/3] md:aspect-auto overflow-hidden">
              <Image
                src={embroideryImg}
                alt="Computer embroidery on silk"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-card/40 md:to-card/60" />
              <div className="absolute top-6 left-6">
                <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-medium tracking-widest uppercase shadow-lg">
                  <Sparkles className="w-3.5 h-3.5" />
                  Signature Service
                </span>
              </div>
            </div>

            {/* Text */}
            <div className="relative p-8 md:p-12 lg:p-16 flex flex-col justify-center">
              <div className="absolute top-6 right-6 hidden md:block">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
              </div>
              <h3 className="text-3xl md:text-4xl lg:text-5xl font-serif font-semibold text-card-foreground leading-tight">
                Computer <span className="italic text-primary">Embroidery</span>
              </h3>
              <div className="w-12 h-px bg-primary mt-4 mb-6" />
              <p className="text-muted-foreground leading-relaxed text-base md:text-lg font-light">
                Precision meets creativity with our computer embroidery services—where traditional craftsmanship is powered by advanced digital design. Using high-accuracy machines, we transform logos, patterns, and custom artwork into flawless stitched designs on fabrics of all kinds. From boutique fashion pieces to bulk uniform branding, every stitch is consistent, durable, and visually striking—bringing your ideas to life with speed and perfection.
              </p>
              
              <Link
                href="/upload-design"
                className="mt-8 inline-flex items-center gap-2 text-primary font-medium text-sm tracking-widest uppercase group/link"
              >
                Send Your Design
                <ArrowRight className="w-4 h-4 transition-transform group-hover/link:translate-x-1" />
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Other Services */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {otherServices.map((service, idx) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              className="group relative"
            >
              <div className="relative h-full p-8 lg:p-10 bg-card border border-card-border rounded-2xl shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/15 to-secondary/40 flex items-center justify-center mb-6 group-hover:from-primary/25 group-hover:to-secondary/60 transition-colors duration-500">
                  <service.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl md:text-2xl font-serif font-semibold text-card-foreground mb-3">
                  {service.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed text-sm md:text-base font-light">
                  {service.description}
                </p>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 group-hover:w-12 h-px bg-primary transition-all duration-500" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

