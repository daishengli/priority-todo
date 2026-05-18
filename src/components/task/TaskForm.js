'use client';

import { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Input, Textarea } from '../ui/Input';
import { createTask, updateTask } from '@/lib/db';

/**
 * @param {Object} props
 * @param {Task} [props.task] - 如果有值则是编辑模式
 * @param {Function} props.onSubmit
 * @param {Function} props.onCancel
 * @param {Tag[]} [props.tags]
 */
export function TaskForm({ task, onSubmit, onCancel, tags = [] }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [importance, setImportance] = useState(5);
  const [urgency, setUrgency] = useState(5);
  const [dueDate, setDueDate] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 编辑模式：填充数据
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setImportance(task.importance);
      setUrgency(task.urgency);
      setDueDate(task.dueDate ? task.dueDate.split('T')[0] : '');
      setSelectedTags(task.tags || []);
    }
  }, [task]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      console.log('[TaskForm] 开始创建任务...');
      const taskData = {
        title: title.trim(),
        description: description.trim(),
        importance,
        urgency,
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
        tags: selectedTags,
      };
      console.log('[TaskForm] taskData:', JSON.stringify(taskData));

      if (task) {
        await updateTask(task.id, taskData);
      } else {
        console.log('[TaskForm] 调用 createTask...');
        const result = await createTask(taskData);
        console.log('[TaskForm] createTask 返回:', result);
      }

      console.log('[TaskForm] 调用 onSubmit...');
      onSubmit();
      console.log('[TaskForm] 完成');
    } catch (err) {
      console.error('[TaskForm] 错误:', err);
      alert('创建任务失败: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleTag = (tagId) => {
    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* 任务标题 */}
      <Input
        label="任务标题"
        placeholder="输入任务标题..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        maxLength={100}
        required
      />

      {/* 任务描述 */}
      <Textarea
        label="任务描述"
        placeholder="输入任务详细描述（可选）..."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={3}
      />

      {/* 重要性 */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">
            重要性 <span className="text-red-500">*</span>
          </label>
          <span className="text-lg font-bold text-blue-600" key={importance}>{importance}</span>
        </div>
        <input
          type="range"
          min="1"
          max="10"
          value={importance}
          onChange={(e) => setImportance(Number(e.target.value))}
          onInput={(e) => {
            const val = Number(e.target.value);
            setImportance(val);
            // 即时更新相邻 span 显示
            const span = e.target.parentElement.querySelector('.importance-value');
            if (span) span.textContent = val;
          }}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>低</span>
          <span className="importance-value font-bold text-orange-600" key={importance}>{importance}</span>
          <span>高</span>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          任务对目标的贡献程度，越高越重要
        </p>
      </div>

      {/* 紧急性 */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">
            紧急性 <span className="text-red-500">*</span>
          </label>
          <span className="text-lg font-bold text-orange-600" key={urgency}>{urgency}</span>
        </div>
        <input
          type="range"
          min="1"
          max="10"
          value={urgency}
          onChange={(e) => setUrgency(Number(e.target.value))}
          onInput={(e) => {
            const val = Number(e.target.value);
            setUrgency(val);
            // 即时更新相邻 span 显示
            const span = e.target.parentElement.querySelector('.urgency-value');
            if (span) span.textContent = val;
          }}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>低</span>
          <span className="urgency-value font-bold text-orange-600" key={urgency}>{urgency}</span>
          <span>高</span>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          任务的时间敏感程度，越高越紧急
        </p>
      </div>

      {/* 优先级预览 */}
      <div className="bg-gray-50 rounded-lg p-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">优先级分数</span>
          <span className="text-xl font-bold text-purple-600">
            ⭐ {importance * urgency}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-xs text-gray-500">象限：</span>
          {importance >= 6 && urgency >= 6 && (
            <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">🔥 Q1 重要且紧急</span>
          )}
          {importance >= 6 && urgency < 6 && (
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">📅 Q2 重要不紧急</span>
          )}
          {importance < 6 && urgency >= 6 && (
            <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">🤝 Q3 紧急不重要</span>
          )}
          {importance < 6 && urgency < 6 && (
            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">☕ Q4 不重要不紧急</span>
          )}
        </div>
      </div>

      {/* 截止日期 */}
      <Input
        label="截止日期"
        type="date"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
        min={new Date().toISOString().split('T')[0]}
      />

      {/* 标签 */}
      {tags.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            标签
          </label>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={() => toggleTag(tag.id)}
                className={`px-3 py-1 rounded-full text-sm transition-all ${
                  selectedTags.includes(tag.id)
                    ? 'ring-2 ring-offset-1'
                    : 'opacity-60 hover:opacity-100'
                }`}
                style={{
                  backgroundColor: `${tag.color}20`,
                  color: tag.color,
                  borderColor: tag.color,
                  ...(selectedTags.includes(tag.id) && { ringColor: tag.color }),
                }}
              >
                {tag.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 操作按钮 */}
      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          取消
        </Button>
        <Button type="submit" disabled={isSubmitting || !title.trim()}>
          {isSubmitting ? '保存中...' : task ? '保存修改' : '创建任务'}
        </Button>
      </div>
    </form>
  );
}
