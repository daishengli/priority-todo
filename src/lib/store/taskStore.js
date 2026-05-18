import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useTaskStore = create(
  persist(
    (set, get) => ({
      // ==================== 筛选状态 ====================
      filterQuadrant: 'all',
      filterTag: 'all',
      filterToday: false,
      showCompleted: false,
      searchQuery: '',

      // ==================== 视图状态 ====================
      currentView: 'quadrant', // 'quadrant' | 'list'

      // ==================== 设置 ====================
      threshold: 6, // 象限分界线

      // ==================== 排序状态 ====================
      sortBy: 'priorityScore', // 'priorityScore' | 'createdAt' | 'dueDate'
      sortOrder: 'desc', // 'asc' | 'desc'

      // ==================== Actions ====================

      // 筛选
      setFilterQuadrant: (quadrant) => set({ filterQuadrant: quadrant }),
      setFilterTag: (tag) => set({ filterTag: tag }),
      toggleShowCompleted: () => set((state) => ({ showCompleted: !state.showCompleted })),
      toggleFilterToday: () => set((state) => ({ filterToday: !state.filterToday })),
      setSearchQuery: (query) => set({ searchQuery: query }),

      // 视图
      setCurrentView: (view) => set({ currentView: view }),

      // 设置
      setThreshold: (threshold) => set({ threshold }),

      // 排序
      setSortBy: (sortBy) => set({ sortBy }),
      setSortOrder: (order) => set({ sortOrder: order }),

      // 重置筛选
      resetFilters: () =>
        set({
          filterQuadrant: 'all',
          filterTag: 'all',
          filterToday: false,
          showCompleted: false,
          searchQuery: '',
        }),
    }),
    {
      name: 'priority-todo-settings',
      partialize: (state) => ({
        currentView: state.currentView,
        threshold: state.threshold,
        sortBy: state.sortBy,
        sortOrder: state.sortOrder,
      }),
    }
  )
);
