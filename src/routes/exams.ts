import { Router } from "express";
import {
  createExam,
  deleteExam,
  getExam,
  getExams,
  updateExam,
} from "../controllers/examController";
import { protect } from "../middleware/auth";

const router = Router();

router.get("/", protect, getExams);
router.get("/:id", protect, getExam);
router.post("/", protect, createExam);
router.put("/:id", protect, updateExam);
router.delete("/:id", protect, deleteExam);

export default router;
