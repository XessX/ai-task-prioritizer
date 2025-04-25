// src/components/TaskForm.jsx

import React from 'react';
import { CalendarDaysIcon } from '@heroicons/react/24/outline'; // 🗓️ Make sure you have Heroicons installed!

export default function TaskForm({ form, setForm, handleSubmit, loading, editId }) {
  return (
    <form onSubmit={handleSubmit} className="space-y-3 mb-6">
      <input
        className="input"
        placeholder="Task title"
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
        required
      />

      <textarea
        className="input"
        placeholder="Task description"
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
        required
      />

      {/* 📅 Start Date */}
      <div className="relative">
        <input
          type="date"
          className="input w-full pr-10 appearance-none"
          value={form.startDate || ''}
          onChange={(e) => setForm({ ...form, startDate: e.target.value })}
        />
        <CalendarDaysIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
      </div>

      {/* 📅 End Date */}
      <div className="relative">
        <input
          type="date"
          className="input w-full pr-10 appearance-none"
          value={form.endDate || ''}
          onChange={(e) => setForm({ ...form, endDate: e.target.value })}
        />
        <CalendarDaysIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
      </div>

      <div className="flex gap-3">
        <select
          className="input"
          value={form.status}
          onChange={(e) => setForm({ ...form, status: e.target.value })}
        >
          <option value="">🤖 Auto Status</option>
          <option value="pending">🕒 Pending</option>
          <option value="in_progress">🚧 In Progress</option>
          <option value="completed">✅ Completed</option>
        </select>

        <select
          className="input"
          value={form.priority}
          onChange={(e) => setForm({ ...form, priority: e.target.value })}
        >
          <option value="">🤖 Auto Priority</option>
          <option value="low">🟢 Low</option>
          <option value="medium">🟡 Medium</option>
          <option value="high">🔴 High</option>
        </select>
      </div>

      <button className="button" disabled={loading}>
        {loading ? 'Saving...' : editId ? 'Update Task' : 'Add Task'}
      </button>
    </form>
  );
}
