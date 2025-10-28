const express = require("express");
const { getAllMatchs, getIDMatchs, getMatchsComp } = require("../controllers/matchController");

const router = express.Router();

router.get("/", getAllMatchs);
router.get("/match/:id", getIDMatchs);
router.get("/comp/:id", getMatchsComp);

module.exports = router;
