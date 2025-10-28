const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const {
    createUser,
    getAllUsers,
    getUserById,
    updateUser,
    deleteUser,
    getMyUser,
    updatePassword,
} = require("../controllers/userController");

const router = express.Router();
router.post("/", createUser);
router.get("/", getAllUsers);
router.get("/me", authMiddleware, getMyUser);
router.put("/me/password", authMiddleware, updatePassword);
router.get("/:id", getUserById);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

module.exports = router;
