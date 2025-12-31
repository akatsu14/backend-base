import { Router } from "express";
import {
  createQuestion,
  deleteQuestion,
  getQuestion,
  getQuestions,
  updateQuestion,
} from "../controllers/questionController";
import { protect } from "../middleware/auth";

const router = Router();

router.get("/", protect, getQuestions);
router.get("/:id", protect, getQuestion);
router.post("/", protect, createQuestion);
router.put("/:id", protect, updateQuestion);
router.delete("/:id", protect, deleteQuestion);

export default router;
