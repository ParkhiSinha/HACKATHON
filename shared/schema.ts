import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  role: text("role", { enum: ["civilian", "police"] }).notNull().default("civilian"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

// Crime report schema
export const crimeReports = pgTable("crime_reports", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  crimeType: text("crime_type").notNull(),
  description: text("description").notNull(),
  location: text("location").notNull(), // Address string
  latitude: text("latitude").notNull(), // Geographic coordinates
  longitude: text("longitude").notNull(), 
  date: timestamp("date").notNull(),
  status: text("status", { enum: ["pending", "in_progress", "resolved"] }).notNull().default("pending"),
  evidence: jsonb("evidence").default([]), // Array of uploaded file paths
  assignedTeam: integer("assigned_team").references(() => teams.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertCrimeReportSchema = createInsertSchema(crimeReports).omit({
  id: true, 
  createdAt: true,
  updatedAt: true,
  assignedTeam: true,
});

// Teams schema
export const teams = pgTable("teams", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // Patrol, Investigation, etc.
  members: jsonb("members").default([]), // Array of user IDs
  status: text("status", { enum: ["available", "assigned", "on_scene", "en_route"] }).notNull().default("available"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertTeamSchema = createInsertSchema(teams).omit({
  id: true,
  createdAt: true,
});

// Emergency signals schema
export const emergencySignals = pgTable("emergency_signals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  active: boolean("active").notNull().default(true),
  latitude: text("latitude").notNull(),
  longitude: text("longitude").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  resolvedAt: timestamp("resolved_at"),
});

export const insertEmergencySignalSchema = createInsertSchema(emergencySignals).omit({
  id: true,
  createdAt: true,
  resolvedAt: true,
});

// Type definitions
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type CrimeReport = typeof crimeReports.$inferSelect;
export type InsertCrimeReport = z.infer<typeof insertCrimeReportSchema>;

export type Team = typeof teams.$inferSelect;
export type InsertTeam = z.infer<typeof insertTeamSchema>;

export type EmergencySignal = typeof emergencySignals.$inferSelect;
export type InsertEmergencySignal = z.infer<typeof insertEmergencySignalSchema>;
