import { relations } from "drizzle-orm";
import {
  clientsTable,
  invoiceItemsTable,
  invoicesTable,
  reminderLogsTable,
  usersTable,
} from "./schema";

// 1. Users Relations
export const usersRelations = relations(usersTable, ({ many }) => ({
  clients: many(clientsTable),
  invoices: many(invoicesTable),
}));

// 2. Clients Relations
export const clientsRelations = relations(clientsTable, ({ one, many }) => ({
  user: one(usersTable, {
    fields: [clientsTable.userId],
    references: [usersTable.id],
  }),
  invoices: many(invoicesTable),
}));

// 3. Invoices Relations
export const invoicesRelations = relations(invoicesTable, ({ one, many }) => ({
  user: one(usersTable, {
    fields: [invoicesTable.userId],
    references: [usersTable.id],
  }),
  client: one(clientsTable, {
    fields: [invoicesTable.clientId],
    references: [clientsTable.id],
  }),
  invoiceItems: many(invoiceItemsTable),
  reminderLogs: many(reminderLogsTable),
}));

// 4. Invoice Items Relations
export const invoiceItemsRelations = relations(
  invoiceItemsTable,
  ({ one }) => ({
    invoice: one(invoicesTable, {
      fields: [invoiceItemsTable.invoiceId],
      references: [invoicesTable.id],
    }),
  }),
);

// 5. Reminder Logs Relations
export const reminderLogsRelations = relations(
  reminderLogsTable,
  ({ one }) => ({
    invoice: one(invoicesTable, {
      fields: [reminderLogsTable.invoiceId],
      references: [invoicesTable.id],
    }),
  }),
);
