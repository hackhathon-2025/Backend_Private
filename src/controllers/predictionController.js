const prisma = require("../config/prisma");

const createPrediction = async (req, res) => {
    try {
        const userId = req.userId;
        const { matchId, groupId, predictedHomeScore, predictedAwayScore } = req.body;

        if (!matchId || !groupId || predictedHomeScore === undefined || predictedAwayScore === undefined) {
            return res.status(400).json({ error: "matchId, groupId, predictedHomeScore et predictedAwayScore sont requis." });
        }

        // Determine the winner based on scores
        const winnerId = predictedHomeScore > predictedAwayScore ? 1 :
                        predictedAwayScore > predictedHomeScore ? 2 : 0; // 0 for draw

        const prediction = await prisma.prediction.create({
            data: {
                userId,
                matchId,
                groupId,
                winnerId,
                predictedHomeScore: parseInt(predictedHomeScore),
                predictedAwayScore: parseInt(predictedAwayScore),
            },
        });

        res.status(201).json(prediction);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getMyPredictions = async (req, res) => {
    try {
        const userId = req.userId;

        const predictions = await prisma.prediction.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
        });

        res.json(predictions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getPredictionsByGroup = async (req, res) => {
    try {
        const userId = req.userId;
        const { groupId } = req.params;

        const predictions = await prisma.prediction.findMany({
            where: {
                userId,
                groupId,
            },
            orderBy: { createdAt: "desc" },
        });

        res.json(predictions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updatePrediction = async (req, res) => {
    try {
        const userId = req.userId;
        const { id } = req.params;
        const { predictedHomeScore, predictedAwayScore } = req.body;

        const existing = await prisma.prediction.findUnique({ where: { id } });
        if (!existing || existing.userId !== userId) {
            return res.status(403).json({ error: "Accès refusé ou prédiction introuvable" });
        }

        // Determine the winner based on scores
        const winnerId = predictedHomeScore > predictedAwayScore ? 1 :
                        predictedAwayScore > predictedHomeScore ? 2 : 0; // 0 for draw

        const updated = await prisma.prediction.update({
            where: { id },
            data: {
                predictedHomeScore: parseInt(predictedHomeScore),
                predictedAwayScore: parseInt(predictedAwayScore),
                winnerId,
            },
        });

        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deletePrediction = async (req, res) => {
    try {
        const userId = req.userId;
        const { id } = req.params;

        const existing = await prisma.prediction.findUnique({ where: { id } });
        if (!existing || existing.userId !== userId) {
            return res.status(403).json({ error: "Accès refusé ou prédiction introuvable" });
        }

        await prisma.prediction.delete({ where: { id } });
        res.json({ message: "Prédiction supprimée avec succès" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    createPrediction,
    getMyPredictions,
    getPredictionsByGroup,
    updatePrediction,
    deletePrediction,
};
