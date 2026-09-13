import { and, count, eq, gte } from "drizzle-orm";
import { db } from "../db";
import { invoicesTable } from "../db/schema";

export async function generateInvoiceNumber(userId: string) {
  const startOfYear = `${new Date().getFullYear()}-01-01`;
  const [invoices] = await db
    .select({ count: count() })
    .from(invoicesTable)
    .where(
      and(
        gte(invoicesTable.issueDate, startOfYear),
        eq(invoicesTable.userId, userId),
      ),
    );

  const sequence = String(invoices.count + 1).padStart(3, "0");

  return `INV-${new Date().getFullYear()}-${sequence}`;
}
