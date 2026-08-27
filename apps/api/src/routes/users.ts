import { db } from "../db";
import express from "express";
import { usersTable } from "../db/schema";
import { clerkClient, getAuth } from "@clerk/express";
import { Request, Response } from "express";

const usersRouter = express.Router();

usersRouter.post("/sync", async (req: Request, res: Response) => {
  const { userId } = getAuth(req);
  if (!userId) {
    return res.status(401).json({ err: "Unauthorized" });
  }
  const clerkUser = await clerkClient.users.getUser(userId);
  const name = `${clerkUser.firstName} ${clerkUser.lastName}`.trim();
  const email = clerkUser.emailAddresses[0].emailAddress;
  const clerkId = userId;

  try {
    const [user] = await db
      .insert(usersTable)
      .values({
        name,
        email,
        clerkId,
      })
      .onConflictDoUpdate({
        target: usersTable.clerkId,
        set: { name, email },
      })
      .returning();
    res.json({ user });
  } catch (err) {
    if (err instanceof Error) {
      return res.status(500).json({ err: err.message });
    }
    res.status(500).json({ err: "Something went wrong!" });
  }
});

export default usersRouter;
