import Express from "express";
import { getUserByClerkId } from "../lib/getUserByClerkId";
import { getAuth } from "@clerk/express";
import { db } from "../db";
import {
  clientsTable,
  invoiceItemsTable,
  invoicesTable,
  usersTable,
} from "../db/schema";
import { and, eq } from "drizzle-orm";
import { generateInvoiceNumber } from "../lib/generateInvoiceNumber";
import type { InvoiceItemInput, CreateInvoiceBody } from "../types/invoice";

const invoiceRouter = Express.Router();

const VALID_STATUSES = ["draft", "sent", "paid", "overdue"] as const;

invoiceRouter.get("/", async (req, res) => {
  const { userId } = getAuth(req);
  if (!userId) {
    return res.status(401).json({ err: "Unauthorized" });
  }
  try {
    const user = await getUserByClerkId(userId);
    if (!user) return res.status(404).json({ err: "User not found" });

    const invoices = await db
      .select()
      .from(invoicesTable)
      .where(eq(invoicesTable.userId, user.id))
      .leftJoin(clientsTable, eq(clientsTable.id, invoicesTable.clientId));

    res.status(200).json(invoices);
  } catch (err) {
    if (err instanceof Error) {
      return res.status(500).json({ err: err.message });
    }

    return res.status(500).json({ err: "Something went wrong!" });
  }
});

invoiceRouter.get("/:id", async (req, res) => {
  const invoiceId = req.params.id;
  const { userId } = getAuth(req);
  if (!userId) {
    return res.status(401).json({ err: "Unauthorized" });
  }
  try {
    const user = await getUserByClerkId(userId);
    if (!user) return res.status(404).json({ err: "User not found" });

    const [invoice] = await db
      .select()
      .from(invoicesTable)
      .where(
        and(eq(invoicesTable.userId, user.id), eq(invoicesTable.id, invoiceId)),
      );

    if (!invoice) return res.status(404).json({ err: "Invoice not found" });

    const lineItems = await db
      .select()
      .from(invoiceItemsTable)
      .where(eq(invoiceItemsTable.invoiceId, invoice.id));

    const invoiceWithItems = { ...invoice, item: lineItems };

    res.status(200).json(invoiceWithItems);
  } catch (err) {
    if (err instanceof Error) {
      return res.status(500).json({ err: err.message });
    }

    return res.status(500).json({ err: "Something went wrong!" });
  }
});

invoiceRouter.post("/", async (req, res) => {
  const { invoice, items }: CreateInvoiceBody = req.body;
  const { userId } = getAuth(req);
  if (!userId) {
    return res.status(401).json({ err: "Unauthorized" });
  }
  try {
    const user = await getUserByClerkId(userId);
    if (!user) return res.status(404).json({ err: "User not found" });
    const invoiceNumber = await generateInvoiceNumber(user.id);

    const totalAmount = items
      .reduce((sum: number, item: InvoiceItemInput) => sum + item.amount, 0)
      .toString();

    const createdInvoice = await db.transaction(async (tx) => {
      const [newInvoice] = await tx
        .insert(invoicesTable)
        .values({
          userId: user.id,
          clientId: invoice.clientId,
          invoiceNumber,
          status: "draft",
          issueDate: invoice.issueDate,
          dueDate: invoice.dueDate,
          notes: invoice.notes,
          currency: invoice.currency ?? "INR",
          totalAmount,
        })
        .returning();

      const invoiceItems = items.map((item) => ({
        invoiceId: newInvoice.id,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice.toString(),
        amount: item.amount.toString(),
      }));

      const newItems = await tx
        .insert(invoiceItemsTable)
        .values(invoiceItems)
        .returning();

      return { invoice: newInvoice, items: newItems };
    });
    return res.status(201).json(createdInvoice);
  } catch (err) {
    if (err instanceof Error) {
      return res.status(500).json({ err: err.message });
    }

    return res.status(500).json({ err: "Something went wrong!" });
  }
});

invoiceRouter.patch("/:id", async (req, res) => {
  const invoiceId = req.params.id;
  const { userId } = getAuth(req);
  const { status } = req.body;

  if (!userId) {
    return res.status(401).json({ err: "Unauthorized" });
  }
  try {
    const user = await getUserByClerkId(userId);
    if (!user) {
      return res.status(404).json({ err: "User not found!" });
    }

    const [existing] = await db
      .select()
      .from(invoicesTable)
      .where(eq(invoicesTable.id, invoiceId));

    if (!existing || existing.userId !== user.id) {
      return res.status(403).json({ err: "Forbidden" });
    }

    if (!VALID_STATUSES.includes(status)) {
      return res
        .status(400)
        .json({ err: "Illegal status update, provide a suitable status type" });
    }

    const [updatedInvoice] = await db
      .update(invoicesTable)
      .set({
        status,
      })
      .where(eq(invoicesTable.id, invoiceId))
      .returning();

    res.status(200).json(updatedInvoice);
  } catch (err) {
    if (err instanceof Error) {
      return res.status(500).json({ err: err.message });
    }
  }
});

invoiceRouter.delete("/:id", async (req, res) => {
  const invoiceId = req.params.id;
  const { userId } = getAuth(req);
  if (!userId) {
    return res.status(401).json({ err: "Unauthorized" });
  }
  try {
    const user = await getUserByClerkId(userId);
    if (!user) {
      return res.status(404).json({ err: "User not found" });
    }

    const [existing] = await db
      .select()
      .from(invoicesTable)
      .where(eq(invoicesTable.id, invoiceId));

    if (!existing || existing.userId !== user.id) {
      return res.status(403).json({ err: "Forbidden" });
    }

    const [deletedInvoice] = await db
      .delete(invoicesTable)
      .where(eq(invoicesTable.id, invoiceId))
      .returning();
    res.status(200).json(deletedInvoice);
  } catch (err) {
    if (err instanceof Error) {
      return res.status(500).json({ err: err.message });
    }
  }
});
export default invoiceRouter;
