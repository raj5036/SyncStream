import { Router } from "express";
import AuthRouter from "./auth.routes";

const ApiRouter = Router();

ApiRouter.use("/auth", AuthRouter);

export default ApiRouter;