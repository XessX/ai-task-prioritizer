import React from 'react';
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import TaskCard from './TaskCard';
import { markTaskCompletedAPI, markTaskInProgressAPI } from '../lib/api'; // ✅ Import

const statuses = {
  pending: '🕒 Pending',
  in_progress: '🚧 In Progress',
  completed: '✅ Completed',
};

// 📦 Sortable wrapper
function SortableTask({ task, setForm, setEditId, handleDelete, handleComplete, handleMoveToProgress }) {
  const { setNodeRef, attributes, listeners, transform, transition } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <TaskCard
        task={task}
        setForm={setForm}
        setEditId={setEditId}
        handleDelete={handleDelete}
        handleComplete={handleComplete}
        handleMoveToProgress={handleMoveToProgress}
        dragListeners={listeners}
        dragAttributes={attributes}
      />
    </div>
  );
}

export default function TaskBoard({ tasks, setTasks, setForm, setEditId, handleDelete }) {
  const sensors = useSensors(useSensor(PointerSensor));
  const guestMode = localStorage.getItem('guest_mode') === 'true';

  const getHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // ✅ Complete Handler (AUTO FADE after few sec)
  const handleComplete = async (id) => {
    try {
      if (guestMode) {
        const updated = tasks.map(t => (t.id === id ? { ...t, status: 'completed' } : t));
        setTasks(updated);
        localStorage.setItem('guest_tasks', JSON.stringify(updated));

        setTimeout(() => {
          const filtered = updated.filter(t => t.id !== id);
          setTasks(filtered);
          localStorage.setItem('guest_tasks', JSON.stringify(filtered));
        }, 3000); // ✨ 3 seconds
      } else {
        await markTaskCompletedAPI(id, guestMode, getHeaders, setTasks);

        setTimeout(() => {
          setTasks(prev => prev.filter(t => t.id !== id));
        }, 3000); // ✨ 3 seconds
      }
    } catch (err) {
      console.error('Failed to complete task:', err);
    }
  };

  // ✅ Move to In Progress
  const handleMoveToProgress = async (id) => {
    try {
      if (guestMode) {
        const updated = tasks.map(t => (t.id === id ? { ...t, status: 'in_progress' } : t));
        setTasks(updated);
        localStorage.setItem('guest_tasks', JSON.stringify(updated));
      } else {
        await markTaskInProgressAPI(id, guestMode, getHeaders, setTasks);
      }
    } catch (err) {
      console.error('Failed to move task to in progress:', err);
    }
  };

  // ✅ Drag and Drop
  const handleDragEnd = ({ active, over }) => {
    if (!over) return;
    const oldIndex = tasks.findIndex(t => t.id === active.id);
    const newIndex = tasks.findIndex(t => t.id === over.id);
    if (oldIndex !== -1 && newIndex !== -1) {
      const updatedTasks = arrayMove(tasks, oldIndex, newIndex);
      setTasks(updatedTasks);

      if (guestMode) {
        localStorage.setItem('guest_tasks', JSON.stringify(updatedTasks));
      }
    }
  };

  return (
    <div className="space-y-10 mt-10">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        {Object.entries(statuses).map(([key, label]) => {
          const list = tasks
            .filter(task => task.status === key)
            .sort((a, b) => getTaskProgress(b) - getTaskProgress(a));

          return (
            <div key={key}>
              <h2 className="text-2xl font-bold mb-4 border-b pb-1">{label}</h2>
              <SortableContext items={list.map(t => t.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-3">
                  {list.length > 0 ? (
                    list.map(task => (
                      <SortableTask
                        key={task.id}
                        task={task}
                        setForm={setForm}
                        setEditId={setEditId}
                        handleDelete={handleDelete}
                        handleComplete={handleComplete}
                        handleMoveToProgress={handleMoveToProgress}
                      />
                    ))
                  ) : (
                    <p className="text-sm text-gray-400 italic">No tasks in this section</p>
                  )}
                </div>
              </SortableContext>
            </div>
          );
        })}
      </DndContext>
    </div>
  );
}

// 🧠 Progress Helper
function getTaskProgress(task) {
  const now = new Date();
  const start = task.startDate ? new Date(task.startDate) : null;
  const end = task.endDate ? new Date(task.endDate) : null;
  if (!start || !end || now < start) return 0;
  const total = end - start;
  const done = Math.min(now - start, total);
  return Math.min(100, Math.floor((done / total) * 100));
}
