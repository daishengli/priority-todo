'use client';

import { useState } from 'react';
import { Check, Pencil, Trash2, Calendar, Tag as TagIcon } from 'lucide-react';
import { clsx } from 'clsx';
import { Badge } from '../ui/Badge';
import { formatDate } from '@/lib/utils/date';
import { QUADRANT_CONFIG, classifyQuadrant } from '@/lib/utils/priority';

/**
 * @param {Object} props
 * @param {Task} props.task
 * @param {Function} props.onComplete
 * @param {Function} props.onEdit
 * @param {Function} props.onDelete
 * @param {Tag[]} [props.tags]
 * @param {number} [props.threshold]
 */
export function TaskCard({ task, onComplete, onEdit, onDelete, tags = [], threshold = 6 }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const quadrant = classifyQuadrant(task.importance, task.urgency, threshold);
  const quadrantInfo = QUADRANT_CONFIG[quadrant];

  // 获取任务关联的标签详情
  const taskTags = task.tags
    ? tags.filter((t) => task.tags.includes(t.id))
    : [];

  const handleDelete = () => {
    if (confirmDelete) {
      onDelete(task.id);
      setConfirmDelete(false);
    } else {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
    }
  };

  return (
    <div
      className={clsx(
        'group bg-white rounded-lg shadow-sm border transition-all hover:shadow-md',
        task.status === 'completed' && 'opacity-60'
      )}
      style={{ borderLeftColor: quadrantInfo.color, borderLeftWidth: '3px' }}
    >
      <div className="p-3">
        <div className="flex items-start gap-3">
          {/* 完成按钮 */}
          <button
            onClick={() => onComplete(task.id)}
            className={clsx(
              'flex-shrink-0 w-5 h-5 rounded-full border-2 mt-0.5 transition-colors',
              task.status === 'completed'
                ? 'bg-green-500 border-green-500 text-white'
                : 'border-gray-300 hover:border-green-500'
            )}
          >
            {task.status === 'completed' && (
              <Check className="w-3 h-3 mx-auto" />
            )}
          </button>

          {/* 任务内容 */}
          <div className="flex-1 min-w-0">
            <div
              className={clsx(
                'font-medium cursor-pointer truncate',
                task.status === 'completed' && 'line-through text-gray-500'
              )}
              onClick={() => onEdit(task)}
            >
              {task.title}
            </div>

            {/* 元信息 */}
            <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500">
              {/* 优先级分数 */}
              <span className="flex items-center gap-1 font-medium">
                ⭐ {task.importance}×{task.urgency}={task.priorityScore}
              </span>

              {/* 截止日期 */}
              {task.dueDate && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatDate(task.dueDate)}
                </span>
              )}
            </div>

            {/* 标签 */}
            {taskTags.length > 0 && (
              <div className="flex items-center gap-1 mt-2 flex-wrap">
                {taskTags.map((tag) => (
                  <Badge key={tag.id} color={tag.color} size="sm">
                    {tag.name}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* 操作按钮 */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit(task)}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
              title="编辑"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              onClick={handleDelete}
              className={clsx(
                'p-1.5 rounded-lg transition-colors',
                confirmDelete
                  ? 'bg-red-100 text-red-600'
                  : 'hover:bg-gray-100 text-gray-500'
              )}
              title={confirmDelete ? '再次点击确认删除' : '删除'}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
