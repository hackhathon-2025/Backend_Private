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

const getMatchsComp = async (req, res) => {
    try {
        const { id } = req.params;
        const matchesResponse = await axios.get(`https://tennis-api-externe.onrender.com/api/matches?competitionId=${id}`);
        const matches = matchesResponse.data;

        const playersResponse = await axios.get(`https://tennis-api-externe.onrender.com/api/players`);
        const players = playersResponse.data;

        const resultsResponse = await axios.get(`https://tennis-api-externe.onrender.com/api/results`);
        const results = resultsResponse.data;

        const playersMap = new Map(players.map(p => [p.id, p]));
        const resultsMap = new Map(results.map(r => [r.match_id, r]));

        const enrichedMatches = matches.map(match => {
            const result = resultsMap.get(match.id);

            return {
                ...match,
                player1: playersMap.get(match.player1_id),
                player2: playersMap.get(match.player2_id),
                result: result || null // Include the entire result object
            };
        });

        res.json(enrichedMatches);
    } catch (error) {
        console.error("Erreur API externe:", error.message);
        res.status(500).json({ error: "Impossible de récupérer les matchs" });
    }
};

module.exports = { getAllMatchs, getIDMatchs, getMatchsComp };
