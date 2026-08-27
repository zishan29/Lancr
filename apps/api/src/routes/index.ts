import usersRouter from "./users";
import clientRouter from "./clients";
import { Router } from "express";

const indexRouter = Router();

indexRouter.use("/users", usersRouter);
indexRouter.use("/clients", clientRouter);

export default indexRouter;
