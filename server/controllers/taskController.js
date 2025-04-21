// server/controllers/taskController.js
import { PrismaClient } from '@prisma/client';
import { classifyTaskPriority } from '../services/aiClassifier.js';

const prisma = new PrismaClient();

// ✅ GET TASKS
export const getTasks = async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({
      where: { userId: req.user.userId },
      orderBy: { createdAt: 'desc' },
    });
    res.json(tasks);
  } catch (err) {
    console.error('❌ Fetch error:', err);
    res.status(500).json({ error: 'Fetch failed' });
  }
};

// ✅ CREATE TASK
export const createTask = async (req, res) => {
  const { title, description, dueDate } = req.body;
  const userId = req.user.userId;

  if (!title || !description)
    return res.status(400).json({ error: 'Missing fields' });

  try {
    const priority = await classifyTaskPriority(title, description);

    const task = await prisma.task.create({
      data: {
        title,
        description,
        priority,
        dueDate: dueDate ? new Date(dueDate) : null,
        status: 'pending',
        userId,
      },
    });

    res.status(201).json(task);
  } catch (err) {
    console.error('❌ Create task error:', err);
    res.status(500).json({ error: 'Create failed' });
  }
};

// ✅ UPDATE TASK (includes status/dueDate/title/desc)
export const updateTask = async (req, res) => {
  const id = req.params.id;
  const { title, description, dueDate, status } = req.body;

  try {
    const task = await prisma.task.update({
      where: { id },
      data: {
        title,
        description,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        status: status || undefined,
      },
    });

    res.json(task);
  } catch (err) {
    console.error('❌ Update error:', err);
    res.status(500).json({ error: 'Update failed' });
  }
};

// ✅ DELETE TASK
export const deleteTask = async (req, res) => {
  const id = req.params.id;

  try {
    await prisma.task.delete({ where: { id } });
    res.status(204).send();
  } catch (err) {
    console.error('❌ Delete error:', err);
    res.status(500).json({ error: 'Delete failed' });
  }
};
