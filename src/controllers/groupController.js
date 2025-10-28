const prisma = require("../config/prisma");

// Generate a unique invite code
function generateInviteCode(length = 8) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed ambiguous characters
    let code = '';
    for (let i = 0; i < length; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

const createGroup = async (req, res) => {
    try {
        const { name, description, ownerId, isPublic, competitionId, scoringRules } = req.body;

        // Generate unique invite code
        let inviteCode = generateInviteCode();
        let codeExists = true;
        let attempts = 0;

        // Ensure the code is unique (retry up to 5 times if collision)
        while (codeExists && attempts < 5) {
            const existing = await prisma.group.findUnique({ where: { inviteCode } });
            if (!existing) {
                codeExists = false;
            } else {
                inviteCode = generateInviteCode();
                attempts++;
            }
        }

        // Create group
        const group = await prisma.group.create({
            data: {
                name,
                description,
                isPublic,
                ownerId,
                competitionId,
                scoringRule: JSON.stringify(scoringRules),
                inviteCode,
            }
        });

        // Add owner as first member
        await prisma.groupMember.create({
            data: {
                groupId: group.id,
                userId: ownerId,
            }
        });

        res.status(201).json(group);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getMyGroups = async (req, res) => {
    try {
        const userId = req.userId;

        // Get all groups where user is a member
        const memberships = await prisma.groupMember.findMany({
            where: { userId },
            include: {
                group: {
                    include: {
                        owner: {
                            select: { id: true, username: true }
                        }
                    }
                }
            }
        });

        // Extract groups from memberships
        const groups = memberships.map(m => ({
            ...m.group,
            owner: { id: m.group.owner.id, name: m.group.owner.username }
        }));

        res.status(200).json(groups);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }

}

const getPublicGroups = async (req, res) => {
    try {
        const take = Math.min(Number(req.query.take) || 20, 100);
        const skip = Number(req.query.skip) || 0;

        const [groups, total] = await Promise.all([
            prisma.group.findMany({
                where: { isPublic: true },
                select: {
                    id: true, name: true, isPublic: true, description: true,
                    owner: { select: { id: true, username: true } }
                },
                orderBy: { name: "asc" },
                skip, take
            }),
            prisma.group.count({ where: { isPublic: true } })
        ]);

        const normalized = groups.map(g => ({
            ...g,
            owner: { id: g.owner.id, name: g.owner.username }
        }));

        res.json({ data: normalized, pagination: { total, skip, take } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// helpers
const getGroupOr404 = async (groupId, res) => {
    const group = await prisma.group.findUnique({ where: { id: groupId } });
    if (!group) { res.status(404).json({ error: "Group not found" }); return null; }
    return group;
};
const assertOwnerOr403 = (group, ownerId, res) => {
    if (group.ownerId !== ownerId) { res.status(403).json({ error: "Only owner can perform this action" }); return false; }
    return true;
};

const joinGroup = async (req, res) => {
    try {
        const { groupId } = req.params;
        const userId = req.userId ?? req.body.userId;
        if (!userId) return res.status(400).json({ error: "userId is required" });

        const group = await getGroupOr404(groupId, res); if (!group) return;

        if (!group.isPublic) {
            return res.status(403).json({ error: "Group is private. Only owner can invite users." });
        }

        // Check if user is banned
        const isBanned = await prisma.bannedUser.findUnique({
            where: { groupId_userId: { groupId, userId } }
        });

        if (isBanned) {
            return res.status(403).json({ error: "You are banned from this group" });
        }

        try {
            const member = await prisma.groupMember.create({
                data: { groupId, userId },
                select: { id: true, groupId: true, userId: true }
            });
            return res.status(201).json(member);
        } catch (e) {
            // duplicate membership -> 409
            if (e.code === "P2002") return res.status(409).json({ error: "User is already a member" });
            throw e;
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const leaveGroup = async (req, res) => {
    try {
        const { groupId } = req.params;
        const userId = req.userId ?? req.body.userId;
        if (!userId) return res.status(400).json({ error: "userId is required" });

        const group = await getGroupOr404(groupId, res); if (!group) return;

        if (group.ownerId === userId) {
            return res.status(400).json({ error: "Owner cannot leave the group. Transfer ownership first." });
        }

        const deleted = await prisma.groupMember.deleteMany({ where: { groupId, userId } });
        if (deleted.count === 0) return res.status(404).json({ error: "Membership not found" });

        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const inviteUser = async (req, res) => {
    try {
        const { groupId } = req.params;
        const ownerId = req.userId ?? req.body.ownerId;
        const { inviteeId } = req.body;
        if (!ownerId || !inviteeId) return res.status(400).json({ error: "ownerId and inviteeId are required" });

        const group = await getGroupOr404(groupId, res); if (!group) return;
        if (!assertOwnerOr403(group, ownerId, res)) return;

        if (inviteeId === ownerId) return res.status(400).json({ error: "Owner is already in the group" });

        try {
            const member = await prisma.groupMember.create({
                data: { groupId, userId: inviteeId },
                select: { id: true, groupId: true, userId: true }
            });
            res.status(201).json(member);
        } catch (e) {
            if (e.code === "P2002") return res.status(409).json({ error: "User is already a member" });
            throw e;
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const banUser = async (req, res) => {
    try {
        const { groupId } = req.params;
        const ownerId = req.userId ?? req.body.ownerId;
        const { userId } = req.body;
        if (!ownerId || !userId) return res.status(400).json({ error: "ownerId and userId are required" });

        const group = await getGroupOr404(groupId, res); if (!group) return;
        if (!assertOwnerOr403(group, ownerId, res)) return;
        if (userId === ownerId) return res.status(400).json({ error: "Owner cannot ban themselves" });

        // Remove user from group members
        await prisma.groupMember.deleteMany({ where: { groupId, userId } });

        // Add ban record
        try {
            await prisma.bannedUser.create({
                data: {
                    userId,
                    groupId,
                    bannedBy: ownerId
                }
            });
        } catch (e) {
            // If already banned, that's fine
            if (e.code !== "P2002") throw e;
        }

        res.json({ message: "User banned from group" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const unbanUser = async (req, res) => {
    try {
        const { groupId } = req.params;
        const ownerId = req.userId ?? req.body.ownerId;
        const { userId } = req.body;
        if (!ownerId || !userId) return res.status(400).json({ error: "ownerId and userId are required" });

        const group = await getGroupOr404(groupId, res); if (!group) return;
        if (!assertOwnerOr403(group, ownerId, res)) return;

        // Remove ban record
        const deleted = await prisma.bannedUser.deleteMany({ where: { groupId, userId } });
        if (deleted.count === 0) return res.status(404).json({ error: "User is not banned" });

        res.json({ message: "User unbanned from group" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getGroupMembers = async (req, res) => {
    try {
        const { groupId } = req.params;

        const group = await prisma.group.findUnique({
            where: { id: groupId },
            select: {
                id: true,
                name: true,
                members: {
                    select: {
                        id: true,
                        user: { select: { id: true, username: true, email: true } }
                    }
                }
            }
        });

        if (!group) return res.status(404).json({ error: "Group not found" });

        // normalisation : renvoyer juste une liste de users
        const members = group.members.map(m => ({
            id: m.user.id,
            username: m.user.username,
            email: m.user.email
        }));

        res.json({ groupId: group.id, name: group.name, members });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getBannedUsers = async (req, res) => {
    try {
        const { groupId } = req.params;
        const ownerId = req.userId;

        const group = await getGroupOr404(groupId, res); if (!group) return;
        if (!assertOwnerOr403(group, ownerId, res)) return;

        const bannedUsers = await prisma.bannedUser.findMany({
            where: { groupId },
            include: {
                user: {
                    select: { id: true, username: true, email: true }
                }
            }
        });

        const banned = bannedUsers.map(b => ({
            id: b.user.id,
            username: b.user.username,
            email: b.user.email,
            bannedAt: b.bannedAt
        }));

        res.json({ groupId, bannedUsers: banned });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const joinGroupByCode = async (req, res) => {
    try {
        const { inviteCode } = req.body;
        const userId = req.userId ?? req.body.userId;

        if (!userId) return res.status(400).json({ error: "userId is required" });
        if (!inviteCode) return res.status(400).json({ error: "inviteCode is required" });

        // Find group by invite code
        const group = await prisma.group.findUnique({
            where: { inviteCode: inviteCode.trim().toUpperCase() }
        });

        if (!group) return res.status(404).json({ error: "Invalid invite code" });

        // Check if user is banned
        const isBanned = await prisma.bannedUser.findUnique({
            where: { groupId_userId: { groupId: group.id, userId } }
        });

        if (isBanned) {
            return res.status(403).json({ error: "You are banned from this group" });
        }

        // Check if user is already a member
        const existingMember = await prisma.groupMember.findFirst({
            where: { groupId: group.id, userId }
        });

        if (existingMember) {
            return res.status(409).json({ error: "You are already a member of this group" });
        }

        // Add user to group
        const member = await prisma.groupMember.create({
            data: { groupId: group.id, userId },
            select: { id: true, groupId: true, userId: true }
        });

        res.status(201).json({
            message: "Successfully joined the group",
            member,
            group: {
                id: group.id,
                name: group.name,
                description: group.description
            }
        });
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
    unbanUser,
    getGroupMembers,
    getBannedUsers,
    getMyGroups,
    joinGroupByCode,
};
