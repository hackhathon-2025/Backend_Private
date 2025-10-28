const express = require("express");
const {
    createPrediction,
    getMyPredictions,
    updatePrediction,
    deletePrediction,
} = require("../controllers/predictionController");

const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.use(authMiddleware);
router.post("/", createPrediction);
router.get("/", getMyPredictions);
router.put("/:id", updatePrediction);
router.delete("/:id", deletePrediction);

module.exports = router;
