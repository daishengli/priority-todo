'use client';

import { useMemo } from 'react';
import { QuadrantCell } from './QuadrantCell';
import { groupTasksByQuadrant, QUADRANT_ORDER } from '@/lib/utils/priority';

/**
 * @param {Object} props
 * @param {Task[]} props.tasks
 * @param {number} [props.threshold=6]
 * @param {Function} props.onTaskClick
 * @param {Tag[]} [props.tags]
 * @param {Function} props.onComplete
 * @param {Function} props.onDelete
 */
export function QuadrantView({
  tasks,
  threshold = 6,
  onTaskClick,
  tags = [],
  onComplete,
  onDelete,
}) {
  // 按象限分组任务
  const quadrantTasks = useMemo(() => {
    return groupTasksByQuadrant(tasks, threshold);
  }, [tasks, threshold]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
      {QUADRANT_ORDER.map((quadrant) => (
        <QuadrantCell
          key={quadrant}
          quadrant={quadrant}
          tasks={quadrantTasks[quadrant]}
          threshold={threshold}
          onTaskClick={onTaskClick}
          tags={tags}
          onComplete={onComplete}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
