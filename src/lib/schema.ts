import { pgTable, bigserial, text, numeric, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ── contacts ───────────────────────────────────────────────────────────────
export const contacts = pgTable("contacts", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  message: text("message").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertContactSchema = createInsertSchema(contacts).omit({ id: true, createdAt: true });
export type InsertContact = z.infer<typeof insertContactSchema>;
export type Contact = typeof contacts.$inferSelect;

// ── orders ─────────────────────────────────────────────────────────────────
export const orders = pgTable("orders", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  orderId: text("order_id").notNull().unique(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  description: text("description").notNull(),
  fabricType: text("fabric_type").notNull(),
  placement: text("placement").notNull(),
  aiEnhancement: boolean("ai_enhancement").notNull().default(false),
  designPath: text("design_path").notNull(),
  designFilename: text("design_filename").notNull(),
  status: text("status").notNull().default("received"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertOrderSchema = createInsertSchema(orders).omit({ id: true, createdAt: true });
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;

// ── products ───────────────────────────────────────────────────────────────
export const products = pgTable("products", {
  id: bigserial("id", { mode: "number" }).primaryKey(),
  imageUrl: text("image_url").notNull(),
  price: numeric("price").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertProductSchema = createInsertSchema(products).omit({ id: true, createdAt: true });
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;
