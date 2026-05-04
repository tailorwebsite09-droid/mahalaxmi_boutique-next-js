"use client";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import heroImg from "@assets/hero.png";

export function Hero() {
  const scrollToServices = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const element = document.querySelector("#services");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="home" className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden bg-background">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <motion.div 
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="w-full h-full"
        >
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${heroImg.src})` }}
          />
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        </motion.div>
      </div>

      {/* Content */}
      <div className="container relative z-10 mx-auto px-4 md:px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
          className="max-w-3xl mx-auto space-y-6"
        >
          <span className="text-primary text-sm md:text-base font-semibold tracking-[0.3em] uppercase">
            Women’s Tailoring Boutique
          </span>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold text-white drop-shadow-lg leading-tight">
            Mahalaxmi <br className="hidden md:block" /> Boutiques
          </h1>
          <p className="text-lg md:text-2xl text-white/90 font-light max-w-2xl mx-auto drop-shadow-md">
            Quality stitching for every occasion. Blouses, dresses, bridal wear, and alterations with good fitting.
          </p>
          <div className="pt-8">
            <Button 
              size="lg" 
              onClick={scrollToServices}
              className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-8 py-6 rounded-full shadow-[0_0_20px_rgba(200,160,50,0.3)] hover:shadow-[0_0_30px_rgba(200,160,50,0.5)] transition-all duration-300"
            >
              Explore Services
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

