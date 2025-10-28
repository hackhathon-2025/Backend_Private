const prisma = require("../config/prisma");

const createPrediction = async (req, res) => {
    try {
        const userId = req.userId;
        const { matchId, groupId, winnerId } = req.body;

        if (!matchId || !groupId || !winnerId) {
            return res.status(400).json({ error: "matchId, groupId et predictedWinner sont requis." });
        }

        const prediction = await prisma.prediction.create({
            data: {
                userId,
                matchId,
                groupId,
                winnerId,
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

const updatePrediction = async (req, res) => {
    try {
        const userId = req.userId;
        const { id } = req.params;
        const { predictedWinner } = req.body;

        const existing = await prisma.prediction.findUnique({ where: { id } });
        if (!existing || existing.userId !== userId) {
            return res.status(403).json({ error: "Accès refusé ou prédiction introuvable" });
        }

        const updated = await prisma.prediction.update({
            where: { id },
            data: { predictedWinner },
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
    updatePrediction,
    deletePrediction,
};
