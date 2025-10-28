// controllers/groupController.js
const prisma = require("../config/prisma");
// If you have auth, prefer: const authUserId = req.user.id;

const createGroup = async (req, res) => {
    try {
        const { name, isPublic = true } = req.body;
        const ownerId = req.user?.id ?? req.body.ownerId; // fallback if no auth yet

        // if (!name || !ownerId) return res.status(400).json({ error: "name and ownerId are required" });

        const group = await prisma.group.create({
            data: { name, isPublic: Boolean(isPublic), owner: { connect: { id: ownerId } } },
            select: { id: true, name: true, isPublic: true, ownerId: true }
        });

        res.status(201).json(group);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getPublicGroups = async (req, res) => {
    try {
        const take = Math.min(Number(req.query.take) || 20, 100);
        const skip = Number(req.query.skip) || 0;

        const [groups, total] = await Promise.all([
            prisma.group.findMany({
                where: { isPublic: true },
                select: {
                    id: true, name: true, isPublic: true,
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
        const userId = req.user?.id ?? req.body.userId;
        if (!userId) return res.status(400).json({ error: "userId is required" });

        const group = await getGroupOr404(groupId, res); if (!group) return;

        if (!group.isPublic) {
            return res.status(403).json({ error: "Group is private. Only owner can invite users." });
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
        const userId = req.user?.id ?? req.body.userId;
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
        const ownerId = req.user?.id ?? req.body.ownerId;
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
        const ownerId = req.user?.id ?? req.body.ownerId;
        const { userId } = req.body;
        if (!ownerId || !userId) return res.status(400).json({ error: "ownerId and userId are required" });

        const group = await getGroupOr404(groupId, res); if (!group) return;
        if (!assertOwnerOr403(group, ownerId, res)) return;
        if (userId === ownerId) return res.status(400).json({ error: "Owner cannot ban themselves" });

        await prisma.groupMember.deleteMany({ where: { groupId, userId } });
        // TODO: persist a ban in a Ban table if needed
        res.json({ message: "User removed from group" });
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

module.exports = {
    createGroup,
    getPublicGroups,
    joinGroup,
    leaveGroup,
    inviteUser,
    banUser,
    getGroupMembers,
};
