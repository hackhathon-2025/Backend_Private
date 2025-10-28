const express = require("express");
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

router.post("/", createGroup);
router.get("/", getPublicGroups);

// Member management
router.post("/:groupId/join", joinGroup);
router.post("/:groupId/leave", leaveGroup);
router.post("/:groupId/invite", inviteUser);
router.post("/:groupId/ban", banUser);
router.get("/:groupId/members", getGroupMembers);

module.exports = router;
