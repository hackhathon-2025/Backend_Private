const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const {
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
} = require("../controllers/groupController");

const router = express.Router();

router.post("/", authMiddleware, createGroup);
router.get("/", getPublicGroups);
router.get("/me", authMiddleware, getMyGroups);

// Member management
router.post("/join-by-code", authMiddleware, joinGroupByCode);
router.post("/:groupId/join", authMiddleware, joinGroup);
router.post("/:groupId/leave", authMiddleware, leaveGroup);
router.post("/:groupId/invite", authMiddleware, inviteUser);
router.post("/:groupId/ban", authMiddleware, banUser);
router.post("/:groupId/unban", authMiddleware, unbanUser);
router.get("/:groupId/members", getGroupMembers);
router.get("/:groupId/banned", authMiddleware, getBannedUsers);

module.exports = router;
