const prisma = require("../config/prisma");

const createGroup = async (req, res) => {
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
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getPublicGroups = async (_req, res) => {
    try {
        const groups = await prisma.group.findMany({
            where: { isPublic: true },
            include: { owner: true },
        });
        res.json(groups);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { createGroup, getPublicGroups }
