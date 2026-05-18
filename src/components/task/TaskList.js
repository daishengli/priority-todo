'use client';

import { useMemo } from 'react';
import { TaskCard } from '../task/TaskCard';
import { clsx } from 'clsx';

/**
 * @param {Object} props
 * @param {Task[]} props.tasks
 * @param {Tag[]} [props.tags]
 * @param {number} [props.threshold]
 * @param {Function} props.onComplete
 * @param {Function} props.onEdit
 * @param {Function} props.onDelete
 */
export function TaskList({
  tasks,
  tags = [],
  threshold = 6,
  onComplete,
  onEdit,
  onDelete,
}) {
  // 按优先级分数降序排列
  const sortedTasks = useMemo(() => {
    return [...tasks].sort((a, b) => b.priorityScore - a.priorityScore);
  }, [tasks]);

  if (tasks.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">📝</div>
        <h3 className="text-lg font-medium text-gray-700 mb-2">暂无任务</h3>
        <p className="text-gray-500">点击上方「添加任务」按钮创建新任务</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 p-4">
      {sortedTasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onComplete={onComplete}
          onEdit={onEdit}
          onDelete={onDelete}
          tags={tags}
          threshold={threshold}
        />
      ))}
    </div>
  );
}

/**
 * 带分组的任务列表（按象限分组展示）
 * @param {Object} props
 * @param {Task[]} props.tasks
 * @param {Tag[]} [props.tags]
 * @param {number} [props.threshold]
 * @param {Function} props.onComplete
 * @param {Function} props.onEdit
 * @param {Function} props.onDelete
 */
export function TaskListGrouped({
  tasks,
  tags = [],
  threshold = 6,
  onComplete,
  onEdit,
  onDelete,
}) {
  const { groupTasksByQuadrant, QUADRANT_ORDER, QUADRANT_CONFIG } = require('@/lib/utils/priority');

  const groupedTasks = useMemo(() => {
    return groupTasksByQuadrant(tasks, threshold);
  }, [tasks, threshold]);

  return (
    <div className="space-y-6 p-4">
      {QUADRANT_ORDER.map((quadrant) => {
        const config = QUADRANT_CONFIG[quadrant];
        const quadrantTasks = groupedTasks[quadrant];

        if (quadrantTasks.length === 0) return null;

        return (
          <div key={quadrant}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-lg">{config.icon}</span>
              <span
                className="font-semibold"
                style={{ color: config.color }}
              >
                {quadrant} {config.label}
              </span>
              <span
                className="text-xs px-2 py-0.5 rounded-full"
                style={{ backgroundColor: `${config.color}20`, color: config.color }}
              >
                {quadrantTasks.length} 项
              </span>
            </div>
            <div className="space-y-2">
              {quadrantTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onComplete={onComplete}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  tags={tags}
                  threshold={threshold}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
