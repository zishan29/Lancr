import usersRouter from "./users";
import clientRouter from "./clients";
import invoiceRouter from "./invoices";
import { Router } from "express";

const indexRouter = Router();

indexRouter.use("/users", usersRouter);
indexRouter.use("/clients", clientRouter);
indexRouter.use("/invoices", invoiceRouter);

export default indexRouter;
