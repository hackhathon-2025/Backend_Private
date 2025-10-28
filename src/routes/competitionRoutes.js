const express = require("express");
const { getAllCompetitions, getIDCompetitions } = require("../controllers/competitionController");

const router = express.Router();

router.get("/", getAllCompetitions);
router.get("/:id", getIDCompetitions);

module.exports = router;
