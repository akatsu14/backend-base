import { Router } from 'express';
import {
    getExamResults,
    getResult,
    getUserResults,
    submitResult
} from '../controllers/resultController';
import { protect } from '../middleware/auth';

const router = Router();

router.post('/', protect, submitResult);
router.get('/user/history', protect, getUserResults);
router.get('/:id', protect, getResult);
router.get('/exam/:examId', protect, getExamResults);

export default router;
