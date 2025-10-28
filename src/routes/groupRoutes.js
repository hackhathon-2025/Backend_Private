const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const {
	createGroup,
	getPublicGroups,
	joinGroup,
	leaveGroup,
	inviteUser,
	banUser,
	getGroupMembers,
} = require("../controllers/groupController");

const router = express.Router();

router.post("/", authMiddleware, createGroup);
router.get("/", getPublicGroups);

// Member management
router.post("/:groupId/join", authMiddleware, joinGroup);
router.post("/:groupId/leave", authMiddleware, leaveGroup);
router.post("/:groupId/invite", authMiddleware, inviteUser);
router.post("/:groupId/ban", authMiddleware, banUser);
router.get("/:groupId/members", getGroupMembers);

module.exports = router;
