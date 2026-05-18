'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { DndContext, DragOverlay, closestCenter } from '@dnd-kit/core';
import { useLiveQuery } from 'dexie-react-hooks';

import { Header } from '@/components/layout/Header';
import { QuadrantView } from '@/components/quadrant/QuadrantView';
import { TaskList } from '@/components/task/TaskList';
import { TaskFilters } from '@/components/task/TaskFilters';
import { QuickAdd, QuickAddFloat } from '@/components/task/QuickAdd';
import { Dialog } from '@/components/ui/Dialog';
import { TaskForm } from '@/components/task/TaskForm';

import { db, getAllTasks, completeTask, deleteTask, updateTask, getAllTags } from '@/lib/db';
import { classifyQuadrant, getImportanceForQuadrant, getUrgencyForQuadrant } from '@/lib/utils/priority';
import { useTaskStore } from '@/lib/store/taskStore';

export default function HomePage() {
  const [editingTask, setEditingTask] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    setInitialized(true);
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // 状态管理
  const {
    currentView,
    setCurrentView,
    threshold,
    setThreshold,
    resetFilters,
    showCompleted,
    toggleShowCompleted,
    filterQuadrant,
    setFilterQuadrant,
    filterTag,
    setFilterTag,
    filterToday,
    toggleFilterToday,
    searchQuery,
    setSearchQuery,
  } = useTaskStore();

  // 移动端默认列表视图
  useEffect(() => {
    if (initialized && isMobile && currentView === 'quadrant') {
      setCurrentView('list');
    }
  }, [initialized, isMobile]);

  // 从 IndexedDB 获取数据
  const allTasks = useLiveQuery(
    () => db.tasks.orderBy('priorityScore').reverse().toArray(),
    []
  );

  const allTags = useLiveQuery(
    () => db.tags.orderBy('name').toArray(),
    []
  );

  // 筛选任务
  const filteredTasks = useMemo(() => {
    if (!allTasks) return [];

    let tasks = [...allTasks];

    // 过滤状态
    if (showCompleted) {
      tasks = tasks.filter(t => t.status === 'completed');
    } else {
      tasks = tasks.filter(t => t.status === 'active');
    }

    // 过滤象限
    if (filterQuadrant !== 'all') {
      tasks = tasks.filter(t =>
        classifyQuadrant(t.importance, t.urgency, threshold) === filterQuadrant
      );
    }

    // 过滤标签
    if (filterTag !== 'all') {
      tasks = tasks.filter(t => t.tags?.includes(filterTag));
    }

    // 过滤今日
    if (filterToday) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      tasks = tasks.filter(t => {
        if (!t.dueDate) return false;
        const dueDate = new Date(t.dueDate);
        return dueDate >= today && dueDate < tomorrow;
      });
    }

    // 搜索
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      tasks = tasks.filter(t =>
        t.title.toLowerCase().includes(query) ||
        t.description?.toLowerCase().includes(query)
      );
    }

    return tasks;
  }, [allTasks, showCompleted, filterQuadrant, filterTag, filterToday, searchQuery, threshold]);

  // 完成任务
  const handleComplete = useCallback(async (taskId) => {
    const task = allTasks?.find(t => t.id === taskId);
    if (!task) return;

    if (task.status === 'completed') {
      await db.tasks.update(taskId, {
        status: 'active',
        completedAt: null,
      });
    } else {
      await completeTask(taskId);
    }
  }, [allTasks]);

  // 删除任务
  const handleDelete = useCallback(async (taskId) => {
    await deleteTask(taskId);
  }, []);

  // 编辑任务
  const handleEdit = useCallback((task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  }, []);

  // 拖拽结束 - 跨象限移动
  const handleDragEnd = useCallback(async (event) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const taskId = active.id;
    const targetQuadrant = over.id;

    // 获取任务
    const task = allTasks?.find(t => t.id === taskId);
    if (!task) return;

    // 计算新的重要性/紧急性
    const newImportance = getImportanceForQuadrant(targetQuadrant, threshold);
    const newUrgency = getUrgencyForQuadrant(targetQuadrant, threshold);

    // 更新任务
    await updateTask(taskId, {
      importance: newImportance,
      urgency: newUrgency,
    });
  }, [allTasks, threshold]);

  // 表单提交成功
  const handleFormSuccess = useCallback(() => {
    setIsFormOpen(false);
    setEditingTask(null);
  }, []);

  // 打开编辑弹窗
  const handleOpenAdd = useCallback(() => {
    setEditingTask(null);
    setIsFormOpen(true);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        currentView={currentView}
        onViewChange={setCurrentView}
        onSettingsClick={() => setIsSettingsOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <TaskFilters
        filterQuadrant={filterQuadrant}
        onFilterQuadrantChange={setFilterQuadrant}
        filterTag={filterTag}
        onFilterTagChange={setFilterTag}
        filterToday={filterToday}
        onFilterTodayChange={toggleFilterToday}
        showCompleted={showCompleted}
        onShowCompletedChange={toggleShowCompleted}
        tags={allTags || []}
        onResetFilters={resetFilters}
      />

      <main className="pb-24">
        <DndContext
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          {currentView === 'quadrant' ? (
            <QuadrantView
              tasks={filteredTasks}
              threshold={threshold}
              onTaskClick={handleEdit}
              tags={allTags || []}
              onComplete={handleComplete}
              onDelete={handleDelete}
            />
          ) : (
            <TaskList
              tasks={filteredTasks}
              tags={allTags || []}
              threshold={threshold}
              onComplete={handleComplete}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
        </DndContext>
      </main>

      {/* 桌面端添加按钮 */}
      <div className="hidden md:block fixed top-20 right-4 z-40">
        <QuickAdd onSuccess={handleFormSuccess} tags={allTags || []} />
      </div>

      {/* 移动端悬浮添加按钮 */}
      <div className="md:hidden">
        <QuickAddFloat onSuccess={handleFormSuccess} tags={allTags || []} />
      </div>

      {/* 编辑/创建任务弹窗 */}
      <Dialog
        open={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingTask(null);
        }}
        title={editingTask ? '编辑任务' : '创建任务'}
      >
        <TaskForm
          task={editingTask}
          onSubmit={handleFormSuccess}
          onCancel={() => {
            setIsFormOpen(false);
            setEditingTask(null);
          }}
          tags={allTags || []}
        />
      </Dialog>

      {/* 设置弹窗 */}
      <Dialog
        open={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        title="设置"
      >
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              象限分界线
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={threshold}
              onChange={(e) => setThreshold(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>低</span>
              <span className="font-medium text-blue-600">当前: {threshold}</span>
              <span>高</span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              重要性/紧急性 ≥ {threshold} 的任务归入 Q1/Q2象限，否则归入 Q3/Q4象限
            </p>
          </div>

          <div className="pt-4 border-t">
            <h3 className="font-medium text-gray-900 mb-3">数据管理</h3>
            <div className="space-y-2">
              <button
                onClick={async () => {
                  const data = await db.tasks.count();
                  alert(`当前共有 ${data} 条任务`);
                }}
                className="w-full px-4 py-2 text-sm text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                查看数据统计
              </button>
              <button
                onClick={async () => {
                  if (confirm('确定要清除所有已完成任务吗？')) {
                    await db.tasks.where('status').equals('completed').delete();
                  }
                }}
                className="w-full px-4 py-2 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
              >
                清除已完成任务
              </button>
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
