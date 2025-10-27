import { Request, Response } from "express";
import prisma from "../config/prisma.js";

export const createGroup = async (req: Request, res: Response) => {
    try {
        const { name, ownerId, isPublic } = req.body;
        const group = await prisma.group.create({
            data: {
                name,
                isPublic,
                owner: { connect: { id: ownerId } },
            },
        });
        res.status(201).json(group);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getPublicGroups = async (_req: Request, res: Response) => {
    const groups = await prisma.group.findMany({
        where: { isPublic: true },
        include: { owner: true },
    });
    res.json(groups);
};
