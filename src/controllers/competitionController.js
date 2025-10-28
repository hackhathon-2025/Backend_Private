const axios = require("axios");

const getAllCompetitions = async (req, res) => {
    try {
        const response = await axios.get("https://tennis-api-externe.onrender.com/api/competitions");
        res.json(response.data);
    } catch (error) {
        console.error("Erreur API externe:", error.message);
        res.status(500).json({ error: "Impossible de récupérer les compétitions" });
    }
};

const getIDCompetitions = async (req, res) => {
    try {
        const { id } = req.params;
        const response = await axios.get(`https://tennis-api-externe.onrender.com/api/competitions?competitionId=${id}`);
        res.json(response.data);
    } catch (error) {
        console.error("Erreur API externe:", error.message);
        res.status(500).json({ error: "Impossible de récupérer les compétitions" });
    }
};

module.exports = { getAllCompetitions, getIDCompetitions };
