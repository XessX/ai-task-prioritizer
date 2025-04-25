import React from 'react';
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter
} from '@dnd-kit/core';

import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';

import { CSS } from '@dnd-kit/utilities';
import TaskCard from './TaskCard';

const statuses = {
  pending: '🕒 Pending',
  in_progress: '🚧 In Progress',
  completed: '✅ Completed'
};

function SortableTask({ task, ...props }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskCard task={task} {...props} />
    </div>
  );
}

export default function TaskBoard({ tasks, setTasks, setForm, setEditId, handleDelete }) {
  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = ({ active, over }) => {
    if (active.id !== over?.id) {
      const oldIndex = tasks.findIndex(t => t.id === active.id);
      const newIndex = tasks.findIndex(t => t.id === over?.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        const newOrder = arrayMove(tasks, oldIndex, newIndex);
        setTasks(newOrder);
        localStorage.setItem('guest_tasks', JSON.stringify(newOrder));
      }
    }
  };

  return (
    <div className="space-y-10 mt-10">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        {Object.entries(statuses).map(([key, label]) => {
          const list = tasks
            .filter(t => t.status === key)
            .sort((a, b) => {
              const aTime = new Date(a.endDate || a.startDate || a.createdAt).getTime();
              const bTime = new Date(b.endDate || b.startDate || b.createdAt).getTime();
              return aTime - bTime;
            });

          return (
            <div key={key}>
              <h2 className="text-2xl font-bold mb-4 border-b pb-1">{label}</h2>
              <SortableContext items={list.map(t => t.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-3">
                  {list.map(task => (
                    <SortableTask
                      key={task.id}
                      task={task}
                      setForm={setForm}
                      setEditId={setEditId}
                      handleDelete={handleDelete}
                    />
                  ))}
                  {list.length === 0 && (
                    <p className="text-sm text-gray-400 italic">No tasks in this section</p>
                  )}
                </div>
              </SortableContext>
            </div>
          );
        })}
      </DndContext>
    </div>
  );
}
