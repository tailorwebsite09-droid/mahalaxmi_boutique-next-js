"use client";
import { Instagram, Mail, Phone, MessageCircle } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Designs", href: "/designs" },
  { name: "Upload Design", href: "/upload-design" },
  { name: "Contact", href: "/contact" },
];

const WHATSAPP_NUMBER = "917993364017";
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}`;

export function Footer() {
  const pathname = usePathname();
  if (pathname === "/admin") return null;

  return (
    <footer className="relative bg-foreground text-background pt-16 pb-8 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-foreground via-foreground to-foreground/95" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-px bg-primary/60" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="grid md:grid-cols-3 gap-10 lg:gap-16 pb-12 border-b border-background/10">
          {/* Brand */}
          <div>
            <div className="text-2xl font-serif font-bold text-primary mb-3">
              Mahalaxmi <span className="text-background font-medium">Boutiques</span>
            </div>
            <p className="text-sm text-background/70 leading-relaxed font-light">
              Quality stitching for every occasion. Blouses, dresses, bridal wear, and alterations with good fitting.
            </p>
            <div className="flex gap-3 mt-5">
              <a
                href="https://www.instagram.com/mahalaxmi__boutiques?igsh=MTMyYnJtbHh3cWE5eA=="
                aria-label="Instagram"
                className="w-9 h-9 rounded-full border border-background/20 flex items-center justify-center hover:bg-primary hover:border-primary hover:text-primary-foreground transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Chat on WhatsApp"
                className="w-9 h-9 rounded-full border border-background/20 flex items-center justify-center hover:bg-primary hover:border-primary hover:text-primary-foreground transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Nav */}
          <div>
            <div className="text-xs uppercase tracking-widest text-primary font-semibold mb-4">
              Explore
            </div>
            <ul className="grid grid-cols-2 gap-y-2 gap-x-6 text-sm text-background/80">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <div className="text-xs uppercase tracking-widest text-primary font-semibold mb-4">
              Visit
            </div>
            <ul className="space-y-3 text-sm text-background/80">
              <li className="flex items-start gap-3">
                <Phone className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                <span>+91 79933 64017, +91 96401 74017</span>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                <span>sunchutarunkumar@gmail.com</span>
              </li>
              <li className="text-background/70 pt-1 leading-relaxed">
                DURGANAGAR MAILERDEVPALLY NEAR VIJAYA SALES, 
                <br />
                HYDERABAD ,TELANGANA 500077
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-background/60">
          <p>© {new Date().getFullYear()} Mahalaxmi Boutiques. All rights reserved.</p>
          <p className="tracking-widest uppercase">Made in India</p>
        </div>
      </div>
    </footer>
  );
}
