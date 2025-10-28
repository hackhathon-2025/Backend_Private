const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const userRoutes = require("./routes/userRoutes");
const groupRoutes = require("./routes/groupRoutes");
const authRoutes = require("./routes/authRoutes");
const competitionRoutes = require("./routes/competitionRoutes")
const matchRoutes = require("./routes/matchRoutes");
const resultRoutes = require("./routes/resultRoutes");
const playerRoutes = require("./routes/playerRoutes");
// const predictionRoutes = require("./routes/predictionRoutes");
const { errorHandler } = require("./middlewares/errorHandler");

const app = express();

app.use(cors());
app.use(express.json());
app.get("/", (req, res) => {
    res.send("🎾 Tennis Pronostics Backend is running!");
});
app.use("/api/users", userRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/competitions", competitionRoutes);
app.use("/api/matches", matchRoutes);
app.use("/api/results", resultRoutes);
app.use("/api/players", playerRoutes)
// app.use("/api/predictions", predictionRoutes);

app.use(errorHandler);

module.exports = app;
