import React from 'react';

export default function TaskCard({
  task,
  setForm,
  setEditId,
  handleDelete,
  handleComplete,
  handleMoveToProgress,
  dragRef,
  dragListeners,
  dragAttributes
}) {
  const now = new Date();
  const endDate = task.endDate ? new Date(task.endDate) : null;
  const startDate = task.startDate ? new Date(task.startDate) : null;

  // 🎨 Background & Urgency
  let bgClass = 'bg-white dark:bg-gray-800';
  let textClass = 'text-gray-800 dark:text-gray-200';
  let statusTag = '';

  if (endDate) {
    const daysLeft = (endDate - now) / (1000 * 60 * 60 * 24);
    if (endDate < now) {
      bgClass = 'bg-red-200 dark:bg-red-500';
      textClass = 'text-white';
      statusTag = '🔥 Overdue';
    } else if (daysLeft <= 2) {
      bgClass = 'bg-yellow-100 dark:bg-yellow-500';
      textClass = 'text-black dark:text-gray-900';
      statusTag = '⚡ Due Soon';
    }
  }

  // 📈 Progress Calculation
  let progress = 0;
  if (startDate && endDate && now >= startDate) {
    const total = endDate - startDate;
    const done = Math.min(now - startDate, total);
    progress = Math.min(100, Math.floor((done / total) * 100));
  }

  let progressColor = 'bg-indigo-500';
  if (progress === 100) progressColor = 'bg-green-500';
  else if (progress >= 70) progressColor = 'bg-blue-500';
  else if (progress >= 40) progressColor = 'bg-yellow-400';
  else progressColor = 'bg-red-500';

  // ✏️ Handlers
  const handleEditClick = () => {
    setForm({
      title: task.title,
      description: task.description,
      startDate: task.startDate?.split('T')[0] || '',
      endDate: task.endDate?.split('T')[0] || '',
      status: task.status || 'pending',
      priority: task.priority || 'medium'
    });
    setEditId(task.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteClick = () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      handleDelete(task.id);
    }
  };

  const handleCompleteClick = () => {
    if (task.status !== 'completed') {
      handleComplete(task.id);
    }
  };

  const handleMoveToProgressClick = () => {
    if (task.status === 'pending') {
      handleMoveToProgress(task.id);
    }
  };

  // 🎯 Button with Tooltip wrapper
  const TooltipButton = ({ label, children, onClick, className }) => (
    <div className="relative group">
      <button
        onClick={onClick}
        className={`rounded-md px-3 py-1 text-xs ${className}`}
      >
        {children}
      </button>
      <div className="absolute bottom-full mb-1 hidden group-hover:block bg-black text-white text-xs rounded py-1 px-2 whitespace-nowrap z-10">
        {label}
      </div>
    </div>
  );

  return (
    <div
      className={`relative p-5 border rounded-lg shadow-md transition-all duration-300 ${bgClass} ${
        task.status === 'completed' ? 'opacity-50' : ''
      }`}
    >
      <div className="flex flex-col gap-5 pb-10">
        {/* ✨ Task Info */}
        <div className={`flex justify-between items-start ${textClass}`}>
          <div className="flex-1 space-y-2">
            <h3 className="font-bold text-xl flex items-center gap-2">
              {task.title}
              {statusTag && (
                <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">
                  {statusTag}
                </span>
              )}
            </h3>

            <p className="text-sm">{task.description}</p>

            <div className="text-xs space-y-1">
              {task.startDate && (
                <p>📅 Start: {new Date(task.startDate).toLocaleDateString()}</p>
              )}
              {task.endDate && (
                <p>⏰ Due: {new Date(task.endDate).toLocaleDateString()}</p>
              )}
              <p>
                Priority: <span className="capitalize font-bold">{task.priority || 'low'}</span> |{' '}
                Status: <span className="capitalize font-bold">{task.status || 'pending'}</span>
              </p>
            </div>
          </div>
        </div>

        {/* 📈 Progress Bar */}
        {startDate && endDate && (
          <div className="space-y-1">
            <div className="bg-gray-300 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
              <div
                className={`${progressColor} h-3`}
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-xs text-right text-gray-500">{progress}% complete</p>
          </div>
        )}

        {/* 🛠️ Buttons */}
        <div className="flex flex-wrap justify-end gap-2">
          <TooltipButton label="Edit Task" onClick={handleEditClick} className="bg-blue-500 hover:bg-blue-600 text-white">
            ✏️ Edit
          </TooltipButton>
          <TooltipButton label="Delete Task" onClick={handleDeleteClick} className="bg-red-500 hover:bg-red-600 text-white">
            🗑️ Delete
          </TooltipButton>
          {task.status === 'pending' && (
            <TooltipButton label="Move to In Progress" onClick={handleMoveToProgressClick} className="bg-yellow-500 hover:bg-yellow-600 text-black">
              🚀 Start
            </TooltipButton>
          )}
          {task.status !== 'completed' && (
            <TooltipButton label="Mark as Complete" onClick={handleCompleteClick} className="bg-green-500 hover:bg-green-600 text-white">
              ✅ Complete
            </TooltipButton>
          )}
        </div>
      </div>

      {/* 🏗️ Drag Handle */}
      <div className="absolute bottom-2 right-2">
        <button
          ref={dragRef}
          {...dragListeners}
          {...dragAttributes}
          className="cursor-grab text-gray-400 hover:text-gray-700 text-2xl select-none"
          title="Drag to reorder"
          style={{ background: 'none', border: 'none' }}
        >
          ⠿
        </button>
      </div>
    </div>
  );
}
