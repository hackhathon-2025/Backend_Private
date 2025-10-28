const express = require("express");
const { getAllResult, getIDResult } = require("../controllers/resultController");

const router = express.Router();

router.get("/", getAllResult);
router.get("/:id", getIDResult);

module.exports = router;
