import React from 'react';

export default function TaskList({ tasks, setForm, setEditId, handleDelete }) {
  return (
    <div className="space-y-4">
      {tasks.map(task => (
        <div
          key={task.id}
          className={`p-4 rounded-lg border shadow-sm flex justify-between items-start ${
            task.priority === 'high'
              ? 'border-red-400'
              : task.priority === 'medium'
              ? 'border-yellow-400'
              : 'border-green-400'
          }`}
        >
          <div>
            <h2 className="font-semibold text-lg">{task.title}</h2>
            <p>{task.description}</p>
            {task.dueDate && (
              <p className="text-xs text-gray-500">
                📅 {new Date(task.dueDate).toLocaleDateString()}
              </p>
            )}
            <p className="text-xs italic text-gray-500">
              Priority: <span className="capitalize">{task.priority || 'pending'}</span>
            </p>
          </div>
          <div className="flex flex-col gap-2 ml-4 text-sm">
            <button
              className="text-blue-500 hover:underline"
              onClick={() => {
                setForm({
                  title: task.title,
                  description: task.description,
                  dueDate: task.dueDate?.split('T')[0] || '',
                  status: task.status,
                });
                setEditId(task.id);
              }}
            >
              ✏️
            </button>
            <button
              className="text-red-500 hover:underline"
              onClick={() => handleDelete(task.id)}
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
