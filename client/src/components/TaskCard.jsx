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
  return (
    <div
      className="p-4 border rounded shadow-sm bg-white dark:bg-gray-800 relative"
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-lg">{task.title}</h3>
          <p className="mt-1">{task.description}</p>

          {task.dueDate && (
            <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
              <span className="text-lg">📅</span>
              {new Date(task.dueDate).toLocaleDateString()}
            </p>
          )}

          <p className="text-xs italic text-gray-500 mt-1">
            Priority: <span className="capitalize">{task.priority || 'low'}</span> | Status: <span className="capitalize">{task.status || 'pending'}</span>
          </p>
        </div>

        <div className="ml-4 flex flex-col gap-2 text-sm items-end">
          <button
            className="text-blue-500 hover:underline"
            onClick={() => {
              setForm({
                title: task.title,
                description: task.description,
                dueDate: task.dueDate?.split('T')[0] || '',
                status: task.status,
                priority: task.priority
              });
              setEditId(task.id);
            }}
          >
            ✏️ Edit
          </button>
          <button className="text-red-500 hover:underline" onClick={() => handleDelete(task.id)}>
            🗑️ Delete
          </button>
        </div>
      </div>

      {/* ✅ DRAG HANDLE (BOTTOM RIGHT) */}
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
