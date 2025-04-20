import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  getTasks,
  createTask,
  deleteTask,
  updateTask,
} from '../controllers/taskController.js';

const router = express.Router();

router.use(requireAuth); // protect all below routes

router.get('/', getTasks);
router.post('/', createTask);
router.delete('/:id', deleteTask);
router.put('/:id', updateTask);

export default router;
