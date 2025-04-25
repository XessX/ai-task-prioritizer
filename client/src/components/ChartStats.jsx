// ✅ Updated ChartStats.jsx with Better Colors and Layout
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

  const priorityData = priorities.map((p) => ({
    name: p.charAt(0).toUpperCase() + p.slice(1),
    value: tasks.filter((t) => t.priority === p).length,
  }));

  const statusData = statuses.map((s) => ({
    name: s.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
    value: tasks.filter((t) => t.status === s).length,
  }));

  const COLORS = ['#34D399', '#FBBF24', '#F87171'];

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* 📊 Priority Bar Chart */}
      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-2">🚦 Priority Distribution</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={priorityData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="value">
              {priorityData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 📈 Status Pie Chart */}
      <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-2">📌 Status Overview</h3>
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
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
