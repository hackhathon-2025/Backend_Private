const axios = require("axios");

const getAllMatchs = async (req, res) => {
    try {
        const response = await axios.get("https://tennis-api-externe.onrender.com/api/matches");
        res.json(response.data);
    } catch (error) {
        console.error("Erreur API externe:", error.message);
        res.status(500).json({ error: "Impossible de récupérer les matchs" });
    }
};

const getIDMatchs = async (req, res) => {
    try {
        const { id } = req.params;
        const response = await axios.get(`https://tennis-api-externe.onrender.com/api/matches?matchId=${id}`);
        res.json(response.data);
    } catch (error) {
        console.error("Erreur API externe:", error.message);
        res.status(500).json({ error: "Impossible de récupérer les matchs" });
    }
};

module.exports = { getAllMatchs, getIDMatchs };
