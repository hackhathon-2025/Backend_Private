const express = require("express");
const { createGroup, getPublicGroups } = require("../controllers/groupController");

const router = express.Router();

router.post("/", createGroup);
router.get("/", getPublicGroups);

module.exports = router;
