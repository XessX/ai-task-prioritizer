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

const statuses = {
  pending: '🕒 Pending',
  in_progress: '🚧 In Progress',
  completed: '✅ Completed',
};

// 📦 Sortable Task wrapper
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

  // ✅ Complete handler
  const handleComplete = (id) => {
    const updated = tasks.map(t => (t.id === id ? { ...t, status: 'completed' } : t));
    setTasks(updated);
    if (localStorage.getItem('guest_mode') === 'true') {
      localStorage.setItem('guest_tasks', JSON.stringify(updated));
    }
  };

  // ✅ Move to "In Progress" handler
  const handleMoveToProgress = (id) => {
    const updated = tasks.map(t => (t.id === id ? { ...t, status: 'in_progress' } : t));
    setTasks(updated);
    if (localStorage.getItem('guest_mode') === 'true') {
      localStorage.setItem('guest_tasks', JSON.stringify(updated));
    }
  };

  const handleDragEnd = ({ active, over }) => {
    if (!over) return;
    const oldIndex = tasks.findIndex(t => t.id === active.id);
    const newIndex = tasks.findIndex(t => t.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const updatedTasks = arrayMove(tasks, oldIndex, newIndex);
      setTasks(updatedTasks);

      if (localStorage.getItem('guest_mode') === 'true') {
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
            .sort((a, b) => {
              const aProgress = getTaskProgress(a);
              const bProgress = getTaskProgress(b);
              return bProgress - aProgress; // 📈 Higher progress first
            });

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
                        handleMoveToProgress={handleMoveToProgress} // 💡 pass move to progress
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

// 🧠 Helper to calculate task progress
function getTaskProgress(task) {
  const now = new Date();
  const start = task.startDate ? new Date(task.startDate) : null;
  const end = task.endDate ? new Date(task.endDate) : null;
  if (!start || !end || now < start) return 0;
  const total = end - start;
  const done = Math.min(now - start, total);
  return Math.min(100, Math.floor((done / total) * 100));
}
