import { getAuth } from "@clerk/express";
import { db } from "../db";
import express from "express";
import { clientsTable, usersTable } from "../db/schema";
import { eq } from "drizzle-orm";
import { getUserByClerkId } from "../lib/getUserByClerkId";

const clientRouter = express.Router();

clientRouter.get("/", async (req, res) => {
  const { userId } = getAuth(req);
  if (!userId) {
    return res.status(401).json({ err: "Unauthorized" });
  }

  try {
    const user = await getUserByClerkId(userId);
    if (!user) return res.status(404).json({ err: "User not found" });
    const clients = await db
      .select()
      .from(clientsTable)
      .where(eq(clientsTable.userId, user.id));

    res.status(200).json(clients);
  } catch (err) {
    if (err instanceof Error) {
      return res.status(500).json({ err: err.message });
    }
    res.status(500).json({ err: "Something went wrong!" });
  }
});

clientRouter.post("/", async (req, res) => {
  const { client } = req.body;
  const { userId } = getAuth(req);

  if (!userId) {
    return res.status(401).json({ err: "Unauthorized" });
  }

  try {
    const user = await getUserByClerkId(userId);
    if (!user) return res.status(404).json({ err: "User not found" });
    const [response] = await db
      .insert(clientsTable)
      .values({
        userId: user.id,
        name: client.name,
        email: client.email,
        phone: client.phone,
        company: client.company,
        gstNumber: client.gstNumber,
      })
      .returning();

    res.status(201).json({ response });
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ err: "Something went wrong!" });
    }
  }
});

clientRouter.patch("/:id", async (req, res) => {
  const clientId = req.params.id;
  const { client } = req.body;
  const { userId } = getAuth(req);

  if (!userId) {
    return res.status(401).json({ err: "Unauthorized" });
  }

  try {
    const user = await getUserByClerkId(userId);
    if (!user) return res.status(404).json({ err: "User not found" });

    const [existing] = await db
      .select()
      .from(clientsTable)
      .where(eq(clientsTable.id, clientId));

    if (!existing || existing.userId !== user.id) {
      return res.status(403).json({ err: "Forbidden" });
    }

    const [updatedClient] = await db
      .update(clientsTable)
      .set({ ...client })
      .where(eq(clientsTable.id, clientId))
      .returning();

    res.status(200).json({ updatedClient });
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ err: "Something went wrong!" });
    }
  }
});

clientRouter.delete("/:id", async (req, res) => {
  const clientId = req.params.id;
  const { userId } = getAuth(req);

  if (!userId) {
    return res.status(401).json({ err: "Unauthorized" });
  }

  try {
    const user = await getUserByClerkId(userId);
    if (!user) return res.status(404).json({ err: "User not found" });
    const [existing] = await db
      .select()
      .from(clientsTable)
      .where(eq(clientsTable.id, clientId));

    if (!existing || existing.userId !== user.id) {
      return res.status(403).json({ err: "Forbidden" });
    }

    const [deletedClient] = await db
      .delete(clientsTable)
      .where(eq(clientsTable.id, clientId))
      .returning();

    res.status(200).json({ deletedClient });
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ err: "Something went wrong!" });
    }
  }
});

export default clientRouter;
