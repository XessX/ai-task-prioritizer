// ✅ Updated TaskForm.jsx with Improved Design & Side-by-Side Layout

import React from 'react';
import { CalendarDaysIcon } from '@heroicons/react/24/outline';

export default function TaskForm({ form, setForm, handleSubmit, loading, editId }) {
  return (
    <form onSubmit={handleSubmit} className="space-y-4 mb-8">
      <div>
        <label className="block text-sm font-medium mb-1">📝 Title</label>
        <input
          className="input w-full"
          placeholder="Task title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">🧾 Description</label>
        <textarea
          className="input w-full"
          placeholder="Task description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          required
        />
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-full">
          <label className="block text-sm font-medium mb-1">📅 Start Date</label>
          <div className="relative">
            <input
              type="date"
              className="input w-full pr-10"
              value={form.startDate || ''}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            />
            <CalendarDaysIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
          </div>
        </div>

        <div className="w-full">
          <label className="block text-sm font-medium mb-1">📅 End Date</label>
          <div className="relative">
            <input
              type="date"
              className="input w-full pr-10"
              value={form.endDate || ''}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
            />
            <CalendarDaysIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-full">
          <label className="block text-sm font-medium mb-1">📌 Status</label>
          <select
            className="input w-full"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          >
            <option value="">🤖 Auto Status</option>
            <option value="pending">🕒 Pending</option>
            <option value="in_progress">🚧 In Progress</option>
            <option value="completed">✅ Completed</option>
          </select>
        </div>

        <div className="w-full">
          <label className="block text-sm font-medium mb-1">🚦 Priority</label>
          <select
            className="input w-full"
            value={form.priority}
            onChange={(e) => setForm({ ...form, priority: e.target.value })}
          >
            <option value="">🤖 Auto Priority</option>
            <option value="low">🟢 Low</option>
            <option value="medium">🟡 Medium</option>
            <option value="high">🔴 High</option>
          </select>
        </div>
      </div>

      <div className="pt-4">
        <button className="button w-full md:w-auto" disabled={loading}>
          {loading ? 'Saving...' : editId ? 'Update Task' : 'Add Task'}
        </button>
      </div>
    </form>
  );
}
