// src/components/TaskCard.jsx
import React from 'react';

export default function TaskCard({
  task,
  setForm,
  setEditId,
  handleDelete,
  dragRef,
  dragListeners,
  dragAttributes
}) {
  const now = new Date();
  const endDate = task.endDate ? new Date(task.endDate) : null;

  let bgClass = 'bg-white dark:bg-gray-800'; // default
  if (endDate) {
    if (endDate < now) {
      bgClass = 'bg-red-100 dark:bg-red-300'; // overdue
    } else if ((endDate - now) / (1000 * 60 * 60 * 24) <= 3) {
      bgClass = 'bg-yellow-100 dark:bg-yellow-300'; // close to deadline
    }
  }

  return (
    <div
      className={`p-4 border rounded shadow-sm relative ${bgClass}`}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-lg">{task.title}</h3>
          <p className="mt-1">{task.description}</p>

          <div className="mt-2 text-xs text-gray-500 space-y-1">
            {task.startDate && (
              <p>📅 Start: {new Date(task.startDate).toLocaleDateString()}</p>
            )}
            {task.endDate && (
              <p>⏰ Due: {new Date(task.endDate).toLocaleDateString()}</p>
            )}
            <p>
              Priority: <span className="capitalize">{task.priority || 'low'}</span> | 
              Status: <span className="capitalize">{task.status || 'pending'}</span>
            </p>
          </div>
        </div>

        <div className="ml-4 flex flex-col gap-2 text-sm items-end">
          <button
            className="text-blue-500 hover:underline"
            onClick={() => {
              setForm({
                title: task.title,
                description: task.description,
                startDate: task.startDate?.split('T')[0] || '',
                endDate: task.endDate?.split('T')[0] || '',
                status: task.status,
                priority: task.priority
              });
              setEditId(task.id);
            }}
          >
            ✏️ Edit
          </button>
          <button
            className="text-red-500 hover:underline"
            onClick={() => handleDelete(task.id)}
          >
            🗑️ Delete
          </button>
        </div>
      </div>

      {/* ✅ DRAG HANDLE */}
      <div
        className="absolute bottom-2 right-2 cursor-grab text-gray-400 hover:text-gray-700 text-xl select-none"
        ref={dragRef}
        {...dragListeners}
        {...dragAttributes}
        title="Drag to move"
      >
        ⠿
      </div>
    </div>
  );
}
