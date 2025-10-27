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

// Member management
const joinGroup = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { userId } = req.body;

        if (!userId) return res.status(400).json({ error: "userId is required" });

        const group = await prisma.group.findUnique({ where: { id: groupId } });
        if (!group) return res.status(404).json({ error: "Group not found" });

        const existing = await prisma.groupMember.findFirst({
            where: { groupId, userId },
        });
        if (existing) return res.status(400).json({ error: "User is already a member" });

        if (!group.isPublic) {
            return res.status(403).json({ error: "Group is private. Only owner can invite users." });
        }

        const member = await prisma.groupMember.create({
            data: { groupId, userId },
        });

        res.status(201).json(member);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const leaveGroup = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { userId } = req.body;

        if (!userId) return res.status(400).json({ error: "userId is required" });

        const group = await prisma.group.findUnique({ where: { id: groupId } });
        if (!group) return res.status(404).json({ error: "Group not found" });

        if (group.ownerId === userId) {
            return res.status(400).json({ error: "Owner cannot leave the group. Transfer ownership first." });
        }

        const deleted = await prisma.groupMember.deleteMany({ where: { groupId, userId } });
        if (deleted.count === 0) return res.status(404).json({ error: "Membership not found" });

        res.json({ message: "Left group successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const inviteUser = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { ownerId, inviteeId } = req.body;

        if (!ownerId || !inviteeId) return res.status(400).json({ error: "ownerId and inviteeId are required" });

        const group = await prisma.group.findUnique({ where: { id: groupId } });
        if (!group) return res.status(404).json({ error: "Group not found" });

        if (group.ownerId !== ownerId) return res.status(403).json({ error: "Only owner can invite users" });

        const existing = await prisma.groupMember.findFirst({ where: { groupId, userId: inviteeId } });
        if (existing) return res.status(400).json({ error: "User is already a member" });

        const member = await prisma.groupMember.create({ data: { groupId, userId: inviteeId } });
        res.status(201).json(member);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const banUser = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { ownerId, userId } = req.body;

        if (!ownerId || !userId) return res.status(400).json({ error: "ownerId and userId are required" });

        const group = await prisma.group.findUnique({ where: { id: groupId } });
        if (!group) return res.status(404).json({ error: "Group not found" });

        if (group.ownerId !== ownerId) return res.status(403).json({ error: "Only owner can ban users" });

        // remove membership if exists
        await prisma.groupMember.deleteMany({ where: { groupId, userId } });

        // Note: no persistent ban list implemented. This action only removes the user from the group.
        res.json({ message: "User removed from group (banned)" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    createGroup,
    getPublicGroups,
    joinGroup,
    leaveGroup,
    inviteUser,
    banUser,
};

