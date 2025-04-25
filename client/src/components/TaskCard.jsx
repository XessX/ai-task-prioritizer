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
  const startDate = task.startDate ? new Date(task.startDate) : null;

  let bgClass = 'bg-white dark:bg-gray-800';
  let statusTag = '';

  if (endDate) {
    const daysLeft = (endDate - now) / (1000 * 60 * 60 * 24);
    if (endDate < now) {
      bgClass = 'bg-red-100 dark:bg-red-300';
      statusTag = '🔥 Overdue';
    } else if (daysLeft <= 3) {
      bgClass = 'bg-yellow-100 dark:bg-yellow-300';
      statusTag = '⚡ Due Soon';
    }
  }

  // Optional: Progress bar based on dates
  let progress = 0;
  if (startDate && endDate && now >= startDate) {
    const total = endDate - startDate;
    const done = Math.min(now - startDate, total);
    progress = Math.min(100, Math.floor((done / total) * 100));
  }

  return (
    <div className={`p-4 border rounded shadow-sm relative ${bgClass}`}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-lg flex items-center gap-2">
            {task.title} {statusTag && <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">{statusTag}</span>}
          </h3>
          <p className="mt-1 text-sm">{task.description}</p>

          <div className="mt-2 text-xs text-gray-600 space-y-1 dark:text-gray-200">
            {task.startDate && <p>📅 Start: {new Date(task.startDate).toLocaleDateString()}</p>}
            {task.endDate && <p>⏰ Due: {new Date(task.endDate).toLocaleDateString()}</p>}
            <p>Priority: <span className="capitalize">{task.priority || 'low'}</span> | Status: <span className="capitalize">{task.status || 'pending'}</span></p>
          </div>

          {/* Progress Bar */}
          {startDate && endDate && (
            <div className="mt-2">
              <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-indigo-500 h-2 rounded-full"
                  style={{ width: `${progress}%` }}
                  title={`Progress: ${progress}%`}
                ></div>
              </div>
              <p className="text-xs text-right text-gray-500 mt-1">{progress}% complete</p>
            </div>
          )}
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
