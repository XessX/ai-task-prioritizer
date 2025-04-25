import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function ChartStats({ tasks }) {
  const statusCounts = { pending: 0, in_progress: 0, completed: 0 };
  const priorityCounts = { low: 0, medium: 0, high: 0 };

  tasks.forEach(task => {
    if (task.status in statusCounts) statusCounts[task.status]++;
    if (task.priority in priorityCounts) priorityCounts[task.priority]++;
  });

  return (
    <div className="grid md:grid-cols-2 gap-6 mt-10">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow min-h-[300px] h-[350px] flex items-center justify-center">
        <Doughnut
          data={{
            labels: ['Low', 'Medium', 'High'],
            datasets: [{
              label: 'Tasks',
              data: [priorityCounts.low, priorityCounts.medium, priorityCounts.high],
              backgroundColor: ['#10b981', '#facc15', '#ef4444']
            }]
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false
          }}
        />
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow min-h-[300px] h-[350px] flex items-center justify-center">
        <Doughnut
          data={{
            labels: ['Pending', 'In Progress', 'Completed'],
            datasets: [{
              label: 'Status',
              data: [statusCounts.pending, statusCounts.in_progress, statusCounts.completed],
              backgroundColor: ['#3b82f6', '#f97316', '#22c55e']
            }]
          }}
          options={{
            responsive: true,
            maintainAspectRatio: false
          }}
        />
      </div>
    </div>
  );
}
