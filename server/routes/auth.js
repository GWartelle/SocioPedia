import express from "express";
import { login, deleteUser } from "../controllers/auth.js";
import { verifyToken } from "./../middleware/auth.js";

const router = express.Router();

router.post("/login", login);
router.delete("/delete", verifyToken, deleteUser);

export default router;
