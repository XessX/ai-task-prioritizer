import React, { useEffect, useState } from 'react';
import { CalendarDaysIcon } from '@heroicons/react/24/outline';
import { predictPriorityAndStatus } from '../lib/ai';
import { toast } from 'react-hot-toast';

export default function TaskForm({ form, setForm, handleSubmit, loading, editId, guestMode }) {
  const [userOverridden, setUserOverridden] = useState({ priority: false, status: false });
  const [aiThinking, setAiThinking] = useState(false);

  useEffect(() => {
    if (guestMode) return; // 🛡️ Block AI prediction if guest
    if (!form.title && !form.description && !form.startDate && !form.endDate) return;

    const timeout = setTimeout(async () => {
      if (userOverridden.priority && userOverridden.status) return;

      try {
        setAiThinking(true);
        const result = await predictPriorityAndStatus({
          title: form.title,
          description: form.description,
          startDate: form.startDate,
          endDate: form.endDate,
        });

        setForm(prev => ({
          ...prev,
          priority: userOverridden.priority ? prev.priority : result.priority,
          status: userOverridden.status ? prev.status : result.status,
        }));

        if (!userOverridden.priority || !userOverridden.status) {
          toast.success(`🤖 AI ➔ Priority: ${result.priority.toUpperCase()} | Status: ${result.status.replace('_', ' ')}`);
        }
      } catch (error) {
        console.error('❌ AI Prediction failed:', error);
      } finally {
        setAiThinking(false);
      }
    }, 600);

    return () => clearTimeout(timeout);
  }, [form.title, form.description, form.startDate, form.endDate, userOverridden, setForm, guestMode]);

  const onFieldChange = (field, value) => {
    if (field === 'priority') setUserOverridden(prev => ({ ...prev, priority: true }));
    if (field === 'status') setUserOverridden(prev => ({ ...prev, status: true }));
    setForm(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 mb-8">
      {aiThinking && (
        <div className="text-sm text-indigo-500 animate-pulse mb-2">
          🧠 Analyzing task automatically...
        </div>
      )}

      {/* Title */}
      <div>
        <label className="block text-sm font-semibold mb-1">📝 Title</label>
        <input
          className="input w-full"
          placeholder="Task title"
          value={form.title}
          onChange={(e) => onFieldChange('title', e.target.value)}
          required
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-semibold mb-1">🧾 Description</label>
        <textarea
          className="input w-full"
          placeholder="Details about the task"
          value={form.description}
          onChange={(e) => onFieldChange('description', e.target.value)}
          required
        />
      </div>

      {/* Dates */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {['startDate', 'endDate'].map((field) => (
          <div key={field}>
            <label className="block text-sm font-semibold mb-1">
              {field === 'startDate' ? '📅 Start Date' : '📅 End Date'}
            </label>
            <div className="relative">
              <input
                type="date"
                className="input w-full pr-10"
                value={form[field] || ''}
                onChange={(e) => onFieldChange(field, e.target.value)}
              />
              <CalendarDaysIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
            </div>
          </div>
        ))}
      </div>

      {/* Status and Priority */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold mb-1">📌 Status</label>
          <select
            className="input w-full"
            value={form.status || ''}
            onChange={(e) => onFieldChange('status', e.target.value)}
          >
            <option value="">🤖 Auto</option>
            <option value="pending">🕒 Pending</option>
            <option value="in_progress">🚧 In Progress</option>
            <option value="completed">✅ Completed</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">🚦 Priority</label>
          <select
            className="input w-full"
            value={form.priority || ''}
            onChange={(e) => onFieldChange('priority', e.target.value)}
          >
            <option value="">🤖 Auto</option>
            <option value="low">🟢 Low</option>
            <option value="medium">🟡 Medium</option>
            <option value="high">🔴 High</option>
          </select>
        </div>
      </div>

      {/* Submit */}
      <div className="pt-4 text-right">
        <button type="submit" className="button" disabled={loading}>
          {loading ? 'Saving...' : editId ? 'Update Task' : 'Add Task'}
        </button>
      </div>
    </form>
  );
}
