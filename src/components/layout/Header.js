'use client';

import { LayoutGrid, List, Calendar, Settings, Search } from 'lucide-react';
import { clsx } from 'clsx';

/**
 * @param {Object} props
 * @param {'quadrant'|'list'} props.currentView
 * @param {Function} props.onViewChange
 * @param {Function} props.onSettingsClick
 * @param {string} props.searchQuery
 * @param {Function} props.onSearchChange
 */
export function Header({
  currentView,
  onViewChange,
  onSettingsClick,
  searchQuery,
  onSearchChange,
}) {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎯</span>
            <h1 className="text-xl font-bold text-gray-900">优先级 Todo</h1>
          </div>
        </div>

        {/* 视图切换 & 设置 */}
        <div className="flex items-center gap-2">
          {/* 搜索 */}
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="搜索任务..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 pr-4 py-2 w-48 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* 视图切换 */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => onViewChange('quadrant')}
              className={clsx(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                currentView === 'quadrant'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              )}
              title="四象限视图"
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden md:inline">四象限</span>
            </button>
            <button
              onClick={() => onViewChange('list')}
              className={clsx(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                currentView === 'list'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              )}
              title="列表视图"
            >
              <List className="w-4 h-4" />
              <span className="hidden md:inline">列表</span>
            </button>
          </div>

          {/* 设置 */}
          <button
            onClick={onSettingsClick}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
            title="设置"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 移动端搜索 */}
      <div className="sm:hidden px-4 pb-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="搜索任务..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg"
          />
        </div>
      </div>
    </header>
  );
}
