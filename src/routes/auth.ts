import { Router } from "express";
import { getMe, login, logout, register } from "../controllers/authController";
import { protect } from "../middleware/auth";

const router = Router();

router.post("/register-by-username", register);
router.post("/login-by-username", login);
router.get("/logout", logout);
router.get("/me", protect, getMe);

export default router;
