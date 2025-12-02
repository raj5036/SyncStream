import { z } from "zod";
import { NextFunction, Request, Response } from 'express';

export const signupSchema = z.object({
	email: z.string().email(),
	password: z.string().min(6),
	name: z.string().optional(),
});

export const loginSchema = z.object({
	email: z.string().email(),
	password: z.string().min(6),
});

export function validate(schema: any) {
	return (req: Request, res: Response, next: NextFunction) => {
		const result = schema.safeParse(req.body);
		if (!result.success) {
			return res.status(400).json({
				errors: result.error.flatten().fieldErrors,
			});
		}
		req.body = result.data;
		next();
	};
}
