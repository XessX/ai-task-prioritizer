// src/components/Filters.jsx (recommended to put it in a separate component)
import React from 'react';

export default function Filters({
  filterPriority,
  setFilterPriority,
  filterStatus,
  setFilterStatus,
  sortOption,
  setSortOption
}) {
  return (
    <div className="flex flex-col md:flex-row gap-4 items-center mb-6">
      <select
        className="input w-full md:w-auto"
        value={filterPriority}
        onChange={(e) => setFilterPriority(e.target.value)}
      >
        <option value="">All Priorities</option>
        <option value="low">🟢 Low</option>
        <option value="medium">🟡 Medium</option>
        <option value="high">🔴 High</option>
      </select>

      <select
        className="input w-full md:w-auto"
        value={filterStatus}
        onChange={(e) => setFilterStatus(e.target.value)}
      >
        <option value="">All Statuses</option>
        <option value="pending">🕒 Pending</option>
        <option value="in_progress">🚧 In Progress</option>
        <option value="completed">✅ Completed</option>
      </select>

      <select
        className="input w-full md:w-auto"
        value={sortOption}
        onChange={(e) => setSortOption(e.target.value)}
      >
        <option value="">No Sorting</option>
        <option value="startDate">📆 Start Date</option>
        <option value="endDate">⏰ End Date</option>
        <option value="priority">🚦 Priority</option>
      </select>
    </div>
  );
}
