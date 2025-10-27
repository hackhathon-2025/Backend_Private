import { Request, Response } from "express";
import prisma from "../config/prisma.js";

export const createUser = async (req: Request, res: Response) => {
    try {
        const { username, email, password } = req.body;
        const user = await prisma.user.create({
            data: { username, email, password },
        });
        res.status(201).json(user);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getAllUsers = async (_req: Request, res: Response) => {
    const users = await prisma.user.findMany();
    res.json(users);
};
