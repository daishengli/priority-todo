'use client';

import { Filter, Calendar, CheckCircle, X } from 'lucide-react';
import { clsx } from 'clsx';
import { QUADRANT_CONFIG, QUADRANT_ORDER } from '@/lib/utils/priority';

/**
 * @param {Object} props
 * @param {string} props.filterQuadrant
 * @param {Function} props.onFilterQuadrantChange
 * @param {string} props.filterTag
 * @param {Function} props.onFilterTagChange
 * @param {boolean} props.filterToday
 * @param {Function} props.onFilterTodayChange
 * @param {boolean} props.showCompleted
 * @param {Function} props.onShowCompletedChange
 * @param {Tag[]} [props.tags]
 * @param {Function} props.onResetFilters
 */
export function TaskFilters({
  filterQuadrant,
  onFilterQuadrantChange,
  filterTag,
  onFilterTagChange,
  filterToday,
  onFilterTodayChange,
  showCompleted,
  onShowCompletedChange,
  tags = [],
  onResetFilters,
}) {
  const hasActiveFilters =
    filterQuadrant !== 'all' ||
    filterTag !== 'all' ||
    filterToday ||
    showCompleted;

  return (
    <div className="bg-white border-b border-gray-100 px-4 py-3">
      <div className="flex flex-wrap items-center gap-3">
        {/* 象限筛选 */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={filterQuadrant}
            onChange={(e) => onFilterQuadrantChange(e.target.value)}
            className="relative z-10 text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">全部象限</option>
            {QUADRANT_ORDER.map((q) => (
              <option key={q} value={q}>
                {QUADRANT_CONFIG[q].icon} {q} {QUADRANT_CONFIG[q].label}
              </option>
            ))}
          </select>
        </div>

        {/* 标签筛选 */}
        {tags.length > 0 && (
          <div className="flex items-center gap-2">
            <select
              value={filterTag}
              onChange={(e) => onFilterTagChange(e.target.value)}
              className="relative z-10 text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">全部标签</option>
              {tags.map((tag) => (
                <option key={tag.id} value={tag.id}>
                  {tag.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* 今日筛选 */}
        <button
          onClick={onFilterTodayChange}
          className={clsx(
            'flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border transition-colors',
            filterToday
              ? 'bg-blue-100 border-blue-300 text-blue-700'
              : 'border-gray-200 text-gray-600 hover:bg-gray-50'
          )}
        >
          <Calendar className="w-4 h-4" />
          今日
        </button>

        {/* 显示已完成 */}
        <button
          onClick={onShowCompletedChange}
          className={clsx(
            'flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border transition-colors',
            showCompleted
              ? 'bg-gray-100 border-gray-300 text-gray-700'
              : 'border-gray-200 text-gray-600 hover:bg-gray-50'
          )}
        >
          <CheckCircle className="w-4 h-4" />
          已完成
        </button>

        {/* 重置筛选 */}
        {hasActiveFilters && (
          <button
            onClick={onResetFilters}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
            清除筛选
          </button>
        )}
      </div>
    </div>
  );
}
