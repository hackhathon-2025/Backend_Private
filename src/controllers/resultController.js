const axios = require("axios");

const getAllResult = async (req, res) => {
    try {
        const response = await axios.get("https://tennis-api-externe.onrender.com/api/results");
        res.json(response.data);
    } catch (error) {
        console.error("Erreur API externe:", error.message);
        res.status(500).json({ error: "Impossible de récupérer les résultats" });
    }
};

const getIDResult = async (req, res) => {
    try {
        const { id } = req.params;
        const response = await axios.get(`https://tennis-api-externe.onrender.com/api/results?matchId=${id}`);
        res.json(response.data);
    } catch (error) {
        console.error("Erreur API externe:", error.message);
        res.status(500).json({ error: "Impossible de récupérer les résultats" });
    }
};

module.exports = { getAllResult, getIDResult };
