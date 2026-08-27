import { index } from "drizzle-orm/pg-core";
import { date } from "drizzle-orm/pg-core";
import { numeric } from "drizzle-orm/pg-core";
import { text } from "drizzle-orm/pg-core";
import { pgEnum } from "drizzle-orm/pg-core";
import { integer } from "drizzle-orm/pg-core";
import { uuid, pgTable, varchar, timestamp } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  clerkId: varchar("clerk_id").notNull().unique(),
  name: varchar().notNull(),
  email: varchar().notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const clientsTable = pgTable(
  "clients",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").references(() => usersTable.id, {
      onDelete: "cascade",
    }),
    name: varchar().notNull(),
    email: varchar().notNull().unique(),
    phone: varchar(),
    company: varchar(),
    gstNumber: varchar("gst_number"),
  },
  (table) => [
    index("email_idx").on(table.email),
    index("clients_user_id_idx").on(table.userId),
  ],
);

export const invoiceStatusEnum = pgEnum("invoice_status", [
  "draft",
  "sent",
  "paid",
  "overdue",
]);

export const invoicesTable = pgTable(
  "invoices",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    clientId: uuid("client_id")
      .notNull()
      .references(() => clientsTable.id, { onDelete: "cascade" }),
    invoiceNumber: integer("invoice_number").notNull(),
    status: invoiceStatusEnum("status").notNull(),
    dueDate: date("due_date").notNull(),
    issueDate: date("issue_date").notNull(),
    notes: text("notes"),
    currency: varchar("currency").default("INR"),
    totalAmount: numeric("total_amount", { precision: 10, scale: 2 })
      .notNull()
      .default("0"),
  },
  (table) => [
    index("status_index").on(table.status),
    index("invoices_user_id_idx").on(table.userId),
  ],
);

export const invoiceItemsTable = pgTable("invoice_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  invoiceId: uuid("invoice_id")
    .notNull()
    .references(() => invoicesTable.id, { onDelete: "cascade" }),
  description: varchar().notNull(),
  quantity: integer().notNull(),
  unitPrice: numeric("unit_price", { precision: 10, scale: 2 }).notNull(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
});

export const reminderToneEnum = pgEnum("reminder_tone", [
  "gentle",
  "firm",
  "final",
]);

export const reminderLogsTable = pgTable("reminder_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  invoiceId: uuid("invoice_id")
    .notNull()
    .references(() => invoicesTable.id, {
      onDelete: "cascade",
    }),
  timestamp: timestamp().defaultNow(),
  tone: reminderToneEnum().notNull(),
  message: text("message").notNull(),
});
