// server/controllers/taskController.js
import { PrismaClient } from '@prisma/client';
import { classifyTask } from '../services/aiClassifier.js';
import { broadcastTasks } from '../index.js'; // ✅ Socket.IO sync

const prisma = new PrismaClient();

// ✅ Real-time utility
export const getTasksRealtime = async (userId) => {
  try {
    return await prisma.task.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
  } catch (err) {
    console.error('❌ Real-time fetch error:', err.message);
    return [];
  }
};

// ✅ GET TASKS (for API)
export const getTasks = async (req, res) => {
  try {
    const tasks = await getTasksRealtime(req.user.userId);
    res.json(tasks);
  } catch (err) {
    console.error('❌ Fetch error:', err.message);
    res.status(500).json({ error: 'Fetch failed' });
  }
};

// ✅ CREATE TASK (AI + Broadcast)
export const createTask = async (req, res) => {
  const { title, description, dueDate } = req.body;
  const userId = req.user?.userId;

  if (!userId) return res.status(401).json({ error: 'Unauthorized user' });
  if (!title || !description) return res.status(400).json({ error: 'Missing fields' });

  try {
    const { priority, status } = await classifyTask(title, description);

    const task = await prisma.task.create({
      data: {
        title,
        description,
        priority,
        status,
        dueDate: dueDate ? new Date(dueDate) : null,
        userId,
      },
    });

    await broadcastTasks(userId); // ✅ Sync update
    res.status(201).json(task);
  } catch (err) {
    console.error('❌ Create task error:', err.message);
    res.status(500).json({ error: 'Create failed', details: err.message });
  }
};

// ✅ UPDATE TASK (with broadcast)
export const updateTask = async (req, res) => {
  const id = req.params.id;
  const { title, description, dueDate, status, priority } = req.body;

  try {
    const task = await prisma.task.update({
      where: { id },
      data: {
        title,
        description,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        status,
        priority,
      },
    });

    await broadcastTasks(req.user.userId); // ✅ Sync update
    res.json(task);
  } catch (err) {
    console.error('❌ Update error:', err.message);
    res.status(500).json({ error: 'Update failed' });
  }
};

// ✅ DELETE TASK (with broadcast)
export const deleteTask = async (req, res) => {
  const id = req.params.id;

  try {
    const task = await prisma.task.delete({
      where: { id }
    });

    await broadcastTasks(task.userId); // ✅ Sync update
    res.status(204).send();
  } catch (err) {
    console.error('❌ Delete error:', err.message);
    res.status(500).json({ error: 'Delete failed' });
  }
};
