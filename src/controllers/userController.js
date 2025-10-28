const prisma = require("../config/prisma");

const createUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const user = await prisma.user.create({
            data: { username, email, password },
        });
        res.status(201).json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getAllUsers = async (_req, res) => {
    try {
        const users = await prisma.user.findMany();
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await prisma.user.findUnique({ where: { id } });
        if (!user) return res.status(404).json({ error: "User not found" });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getMyUser = async (req, res) => {
    try {
        const id = req.userId;
        // console.log("User ID from token:", id);

        const user = await prisma.user.findUnique({
            where: { id },
        });

        if (!user) {
            console.log("User not found in database for ID:", id);
            return res.status(404).json({ error: `User not found: ${id}` });
        }
        const { password, ...safeUser } = user;
        res.json(safeUser);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

const getUserByEmail = async (req, res) => {
    try {
        const { email } = req.params;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return res.status(404).json({ error: "User not found" });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { username, email, password } = req.body;
        const user = await prisma.user.update({
            where: { id },
            data: { username, email, password },
        });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.user.delete({ where: { id } });
        res.json({ message: "User deleted" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { createUser, getAllUsers, getUserById, updateUser, deleteUser, getUserByEmail, getMyUser };
