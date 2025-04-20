// server/controllers/taskController.js

import { PrismaClient } from '@prisma/client';
import { classifyTaskPriority } from '../services/aiClassifier.js';

const prisma = new PrismaClient();

// 🟢 FETCH TASKS FOR AUTHENTICATED USER
export const getTasks = async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({
      where: { userId: req.user.userId },
      orderBy: { createdAt: 'desc' },
    });
    res.json(tasks);
  } catch (err) {
    console.error('❌ Error getting tasks:', err);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
};

// 🟢 CREATE TASK WITH AI PRIORITY
export const createTask = async (req, res) => {
  const { title, description } = req.body;
  const userId = req.user?.userId;

  if (!title || !description || !userId) {
    return res.status(400).json({ error: 'Missing fields or unauthenticated' });
  }

  try {
    const priority = await classifyTaskPriority(title, description);

    const task = await prisma.task.create({
      data: {
        title,
        description,
        priority,
        userId,
      },
    });

    res.status(201).json(task);
  } catch (error) {
    console.error('❌ Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
};

// 🟢 DELETE TASK
export const deleteTask = async (req, res) => {
  const id = req.params.id;

  try {
    await prisma.task.delete({
      where: {
        id,
      },
    });

    res.status(204).send();
  } catch (err) {
    console.error('❌ Error deleting task:', err);
    res.status(500).json({ error: 'Failed to delete task' });
  }
};

// 🟢 UPDATE TASK
export const updateTask = async (req, res) => {
  const id = req.params.id;
  const { title, description } = req.body;

  try {
    const updatedTask = await prisma.task.update({
      where: { id },
      data: { title, description },
    });

    res.json(updatedTask);
  } catch (err) {
    console.error('❌ Error updating task:', err);
    res.status(500).json({ error: 'Failed to update task' });
  }
};
