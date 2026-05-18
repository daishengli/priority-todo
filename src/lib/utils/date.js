import { format, isToday, isTomorrow, isYesterday, parseISO, differenceInDays } from 'date-fns';
import { zhCN } from 'date-fns/locale';

/**
 * 格式化日期显示
 * @param {string|Date|null} date
 * @returns {string}
 */
export function formatDate(date) {
  if (!date) return '';

  const d = typeof date === 'string' ? parseISO(date) : date;

  if (isToday(d)) {
    return '今天';
  }

  if (isTomorrow(d)) {
    return '明天';
  }

  if (isYesterday(d)) {
    return '昨天';
  }

  const daysDiff = differenceInDays(d, new Date());

  if (daysDiff >= -7 && daysDiff < 0) {
    return format(d, 'EEEE', { locale: zhCN });
  }

  return format(d, 'MM月dd日', { locale: zhCN });
}

/**
 * 格式化完整日期
 * @param {string|Date|null} date
 * @returns {string}
 */
export function formatFullDate(date) {
  if (!date) return '';
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, 'yyyy年MM月dd日', { locale: zhCN });
}

/**
 * 格式化相对时间
 * @param {string|Date} date
 * @returns {string}
 */
export function formatRelativeTime(date) {
  if (!date) return '';
  const d = typeof date === 'string' ? parseISO(date) : date;
  const now = new Date();
  const diffMs = now - d;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return '刚刚';
  if (diffMins < 60) return `${diffMins}分钟前`;
  if (diffHours < 24) return `${diffHours}小时前`;
  if (diffDays < 7) return `${diffDays}天前`;
  return format(d, 'MM月dd日', { locale: zhCN });
}

/**
 * 检查日期是否是今天
 * @param {string|Date|null} date
 * @returns {boolean}
 */
export function isDateToday(date) {
  if (!date) return false;
  const d = typeof date === 'string' ? parseISO(date) : date;
  return isToday(d);
}

/**
 * 获取今天的开始时间（ISO 字符串）
 * @returns {string}
 */
export function getTodayStart() {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now.toISOString();
}

/**
 * 获取今天的结束时间（ISO 字符串）
 * @returns {string}
 */
export function getTodayEnd() {
  const now = new Date();
  now.setHours(23, 59, 59, 999);
  return now.toISOString();
}
