// src/components/TaskFilters.jsx

import React from 'react';

export default function TaskFilters({ filters, setFilters }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
      <div>
        <label className="block text-sm font-medium mb-1">🚦 Priority</label>
        <select
          value={filters.priority}
          onChange={(e) => setFilters((f) => ({ ...f, priority: e.target.value }))}
          className="input w-full"
        >
          <option value="">All Priorities</option>
          <option value="low">🟢 Low</option>
          <option value="medium">🟡 Medium</option>
          <option value="high">🔴 High</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">📌 Status</label>
        <select
          value={filters.status}
          onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
          className="input w-full"
        >
          <option value="">All Statuses</option>
          <option value="pending">🕒 Pending</option>
          <option value="in_progress">🚧 In Progress</option>
          <option value="completed">✅ Completed</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">📅 Sort By</label>
        <select
          value={filters.sortBy}
          onChange={(e) => setFilters((f) => ({ ...f, sortBy: e.target.value }))}
          className="input w-full"
        >
          <option value="">No Sorting</option>
          <option value="start">Start Date</option>
          <option value="end">Due Date</option>
        </select>
      </div>
    </div>
  );
}
