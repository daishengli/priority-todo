'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '../ui/Button';
import { Dialog } from '../ui/Dialog';
import { TaskForm } from './TaskForm';

/**
 * @param {Object} props
 * @param {Function} props.onSuccess - 创建成功后回调
 * @param {Tag[]} [props.tags]
 */
export function QuickAdd({ onSuccess, tags = [] }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSuccess = () => {
    setIsOpen(false);
    onSuccess?.();
  };

  return (
    <>
      {/* 快速添加按钮 */}
      <Button onClick={() => setIsOpen(true)} className="gap-2">
        <Plus className="w-4 h-4" />
        添加任务
      </Button>

      {/* 添加任务弹窗 */}
      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        title="添加新任务"
      >
        <TaskForm
          onSubmit={handleSuccess}
          onCancel={() => setIsOpen(false)}
          tags={tags}
        />
      </Dialog>
    </>
  );
}

/**
 * 悬浮快速添加按钮（固定在右下角）
 * @param {Object} props
 * @param {Function} props.onSuccess
 * @param {Tag[]} [props.tags]
 */
export function QuickAddFloat({ onSuccess, tags = [] }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSuccess = () => {
    setIsOpen(false);
    onSuccess?.();
  };

  return (
    <>
      {/* 悬浮按钮 */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg hover:shadow-xl flex items-center justify-center transition-all z-40"
        title="快速添加任务"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* 添加任务弹窗 */}
      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        title="快速添加任务"
      >
        <TaskForm
          onSubmit={handleSuccess}
          onCancel={() => setIsOpen(false)}
          tags={tags}
        />
      </Dialog>
    </>
  );
}
