import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES_IN = '1d';

function signToken(userId: string) {
	return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

function sendAuthCookie(res: Response, token: string) {
	res.cookie("token", token, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax",
		maxAge: 24 * 60 * 60 * 1000, // 1 day in ms
	});
}

export const login = async (req: Request, res: Response) => {
	try {
		const { email, password } = req.body as {
			email?: string;
			password?: string;
		};

		if (!email || !password) {
			return res
				.status(400)
				.json({ message: "Email and password are required" });
		}

		const userRecord = await prisma.user.findUnique({ where: { email } });
		if (!userRecord) {
			return res.status(401).json({ message: "Invalid credentials" });
		}

		const isValid = await bcrypt.compare(password, userRecord.passwordHash);
		if (!isValid) {
			return res.status(401).json({ message: "Invalid credentials" });
		}

		const token = signToken(userRecord.id);
		sendAuthCookie(res, token);

		const { id, name, avatarUrl, createdAt } = userRecord;
		return res.json({
			user: { id, email, name, avatarUrl, createdAt },
		});
	} catch (err) {
		console.error("Login error", err);
		return res.status(500).json({ message: "Something went wrong" });
	}
};

export const signup = async (req: Request, res: Response) => {
	try {
		const { email, password, name } = req.body as {
			email?: string;
			password?: string;
			name?: string;
		};

		if (!email || !password) {
			return res
				.status(400)
				.json({ message: "Email and password are required" });
		}

		const existing = await prisma.user.findUnique({ where: { email } });
		if (existing) {
			return res.status(409).json({ message: "Email already in use" });
		}

		const passwordHash = await bcrypt.hash(password, 10);

		const user = await prisma.user.create({
			data: {
				email,
				passwordHash,
				name,
			},
			select: {
				id: true,
				name: true,
				email: true,
			}
		});

		const token = signToken(user.id);
		sendAuthCookie(res, token);

		return res.status(201).json({ user });
	} catch (err) {
		console.error("Signup error", err);
		return res.status(500).json({ message: "Something went wrong" });
	}
};
