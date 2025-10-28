const express = require("express");
const { getAllPlayers, getIDPlayer } = require("../controllers/playerController");

const router = express.Router();

router.get("/", getAllPlayers);
router.get("/:id", getIDPlayer);

module.exports = router;
