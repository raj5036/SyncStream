import { Router } from "express";
import * as AuthController from "../controllers/auth.controller";
import { loginSchema, signupSchema, validate } from "../middlewares/zod/auth.middleware";

const AuthRouter = Router();

AuthRouter.post(
	"/login",
	validate(loginSchema),
	AuthController.login
);

AuthRouter.post(
	"/signup",
	validate(signupSchema),
	AuthController.signup
);

export default AuthRouter;