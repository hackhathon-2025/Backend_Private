const axios = require("axios");

const getAllPlayers = async (req, res) => {
    try {
        const response = await axios.get("https://tennis-api-externe.onrender.com/api/players");
        res.json(response.data);
    } catch (error) {
        console.error("Erreur API externe:", error.message);
        res.status(500).json({ error: "Impossible de récupérer les joueurs" });
    }
};

const getIDPlayer = async (req, res) => {
    try {
        const { id } = req.params;
        const response = await axios.get(`https://tennis-api-externe.onrender.com/api/players?playerId=${id}`);
        res.json(response.data);
    } catch (error) {
        console.error("Erreur API externe:", error.message);
        res.status(500).json({ error: "Impossible de récupérer les joueurs" });
    }
};

module.exports = { getAllPlayers, getIDPlayer };
