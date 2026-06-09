import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// جدول الموكلين
export const clients = mysqlTable("clients", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 320 }),
  address: text("address"),
  imageUrl: text("imageUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Client = typeof clients.$inferSelect;
export type InsertClient = typeof clients.$inferInsert;

// جدول القضايا
export const cases = mysqlTable("cases", {
  id: int("id").autoincrement().primaryKey(),
  clientId: int("clientId").notNull(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  status: mysqlEnum("status", ["جارية", "مغلقة", "معلقة"]).default("جارية").notNull(),
  caseNumber: varchar("caseNumber", { length: 100 }).unique(),
  court: varchar("court", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Case = typeof cases.$inferSelect;
export type InsertCase = typeof cases.$inferInsert;

// جدول الجلسات
export const sessions = mysqlTable("sessions", {
  id: int("id").autoincrement().primaryKey(),
  caseId: int("caseId").notNull(),
  date: timestamp("date").notNull(),
  description: text("description"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Session = typeof sessions.$inferSelect;
export type InsertSession = typeof sessions.$inferInsert;

// جدول الأحكام
export const judgments = mysqlTable("judgments", {
  id: int("id").autoincrement().primaryKey(),
  caseId: int("caseId").notNull(),
  date: timestamp("date").notNull(),
  description: text("description").notNull(),
  documentUrl: text("documentUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Judgment = typeof judgments.$inferSelect;
export type InsertJudgment = typeof judgments.$inferInsert;

// جدول المستندات
export const documents = mysqlTable("documents", {
  id: int("id").autoincrement().primaryKey(),
  caseId: int("caseId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  category: mysqlEnum("category", ["عقد_أتعاب", "مستندات_عامة", "مراسلات", "أحكام"]).notNull(),
  fileUrl: text("fileUrl").notNull(),
  fileKey: varchar("fileKey", { length: 255 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Document = typeof documents.$inferSelect;
export type InsertDocument = typeof documents.$inferInsert;

// جدول تحليلات AI
export const caseAnalyses = mysqlTable("caseAnalyses", {
  id: int("id").autoincrement().primaryKey(),
  caseId: int("caseId").notNull(),
  summary: text("summary").notNull(),
  legalArticles: text("legalArticles"),
  defensStrategy: text("defensStrategy"),
  risks: text("risks"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CaseAnalysis = typeof caseAnalyses.$inferSelect;
export type InsertCaseAnalysis = typeof caseAnalyses.$inferInsert;