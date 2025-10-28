const express = require("express");
const { getAllMatchs, getIDMatchs } = require("../controllers/matchController");

const router = express.Router();

router.get("/", getAllMatchs);
router.get("/:id", getIDMatchs);

module.exports = router;
