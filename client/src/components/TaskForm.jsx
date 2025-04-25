// ✅ Updated TaskForm.jsx with Improved Design & Responsive Layout

import React from 'react';
import { CalendarDaysIcon } from '@heroicons/react/24/outline';

export default function TaskForm({ form, setForm, handleSubmit, loading, editId }) {
  return (
    <form onSubmit={handleSubmit} className="space-y-6 mb-8">
      {/* Title Field */}
      <div>
        <label className="block text-sm font-semibold mb-1">📝 Title</label>
        <input
          className="input w-full"
          placeholder="Enter task title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
        />
      </div>

      {/* Description Field */}
      <div>
        <label className="block text-sm font-semibold mb-1">🧾 Description</label>
        <textarea
          className="input w-full"
          placeholder="Enter task details"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          required
        />
      </div>

      {/* Dates Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold mb-1">📅 Start Date</label>
          <div className="relative">
            <input
              type="date"
              className="input w-full pr-10"
              value={form.startDate || ''}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            />
            <CalendarDaysIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">📅 End Date</label>
          <div className="relative">
            <input
              type="date"
              className="input w-full pr-10"
              value={form.endDate || ''}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
            />
            <CalendarDaysIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Status & Priority Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold mb-1">📌 Status</label>
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

        <div>
          <label className="block text-sm font-semibold mb-1">🚦 Priority</label>
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

      {/* Submit Button */}
      <div className="pt-4 text-right">
        <button className="button" disabled={loading}>
          {loading ? 'Saving...' : editId ? 'Update Task' : 'Add Task'}
        </button>
      </div>
    </form>
  );
}
