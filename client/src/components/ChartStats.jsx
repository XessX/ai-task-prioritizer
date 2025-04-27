// 📄 src/components/ChartStats.jsx - FINAL SUPER CLEAN VERSION

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

export default function ChartStats({ tasks }) {
  const priorities = ['low', 'medium', 'high'];
  const statuses = ['pending', 'in_progress', 'completed'];

  // ✅ Filter tasks to only include ones that have valid priority and status
  const validTasks = tasks.filter(t => t.priority && t.status);

  const priorityData = priorities.map((priority) => ({
    name: priority.charAt(0).toUpperCase() + priority.slice(1),
    value: validTasks.filter(task => task.priority === priority).length,
  }));

  const statusData = statuses.map((status) => ({
    name: status.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
    value: validTasks.filter(task => task.status === status).length,
  }));

  const COLORS = ['#34D399', '#FBBF24', '#F87171']; // Green, Yellow, Red

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* 📊 Priority Bar Chart */}
      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">🚦 Priority Distribution</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={priorityData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="value">
              {priorityData.map((entry, index) => (
                <Cell key={`priority-bar-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 📈 Status Pie Chart */}
      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">📌 Status Overview</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={statusData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label
            >
              {statusData.map((entry, index) => (
                <Cell key={`status-pie-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend layout="horizontal" verticalAlign="bottom" align="center" />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
