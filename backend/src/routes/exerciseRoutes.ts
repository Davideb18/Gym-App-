import { Router } from 'express';
import { createExercise, getAllExercises } from '../controllers/exerciseController.js';

const router = Router();

router.post('/', createExercise);
router.get('/', getAllExercises);

export default router;
