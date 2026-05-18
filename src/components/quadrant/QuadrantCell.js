'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { QUADRANT_CONFIG } from '@/lib/utils/priority';
import { TaskCard } from '../task/TaskCard';

/**
 * 单个可拖拽的任务项
 * Bug修复: 把拖拽手柄从整个卡片改为只在GripVertical图标上启用
 * 避免 dnd-kit 的 listeners 拦截编辑/删除按钮的点击事件
 */
function SortableTaskCard({ task, onEdit, onDelete, onComplete, tags }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <div className="flex items-start gap-2">
        {/* 拖拽手柄 - 只在这个图标上启用拖拽 */}
        <button
          className="flex-shrink-0 p-1 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 mt-2"
          {...attributes}
          {...listeners}
          title="拖拽移动"
        >
          <GripVertical className="w-4 h-4" />
        </button>
        <div className="flex-1">
          <TaskCard
            task={task}
            onComplete={onComplete}
            onEdit={onEdit}
            onDelete={onDelete}
            tags={tags}
          />
        </div>
      </div>
    </div>
  );
}

/**
 * @param {Object} props
 * @param {'Q1'|'Q2'|'Q3'|'Q4'} props.quadrant
 * @param {Task[]} props.tasks
 * @param {number} [props.threshold]
 * @param {Function} props.onTaskMove
 * @param {Function} props.onTaskClick
 * @param {Tag[]} [props.tags]
 * @param {Function} props.onComplete
 * @param {Function} props.onDelete
 */
export function QuadrantCell({
  quadrant,
  tasks,
  threshold = 6,
  onTaskMove,
  onTaskClick,
  tags = [],
  onComplete,
  onDelete,
}) {
  const config = QUADRANT_CONFIG[quadrant];
  const taskIds = tasks.map((t) => t.id);

  const { setNodeRef, isOver } = useDroppable({
    id: quadrant,
  });

  return (
    <div
      ref={setNodeRef}
      className={`rounded-xl overflow-hidden transition-all ${
        isOver ? 'ring-2 ring-blue-400 ring-offset-2' : ''
      }`}
      style={{ backgroundColor: config.bgColor }}
    >
      {/* 象限头部 */}
      <div
        className="px-4 py-3 border-b"
        style={{ borderColor: `${config.color}30` }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">{config.icon}</span>
            <span className="font-semibold" style={{ color: config.color }}>
              {quadrant}
            </span>
            <span className="font-medium text-gray-700">{config.label}</span>
          </div>
          <span
            className="text-xs font-medium px-2 py-0.5 rounded-full"
            style={{ backgroundColor: `${config.color}20`, color: config.color }}
          >
            {tasks.length} 项
          </span>
        </div>
        <div className="mt-1 text-xs text-gray-500">
          {config.action}：{config.description}
        </div>
      </div>

      {/* 任务列表 */}
      <div className="p-3 space-y-2 min-h-[120px] max-h-[400px] overflow-y-auto">
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {tasks.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">
              拖拽任务到这里
            </div>
          ) : (
            tasks.map((task) => (
              <SortableTaskCard
                key={task.id}
                task={task}
                onEdit={onTaskClick}
                onDelete={onDelete}
                onComplete={onComplete}
                tags={tags}
                threshold={threshold}
              />
            ))
          )}
        </SortableContext>
      </div>
    </div>
  );
}
