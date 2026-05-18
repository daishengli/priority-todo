// ==================== 优先级计算 ====================

/**
 * 计算优先级分数
 * 公式：优先级分数 = 重要性 × 紧急性 + 日期加成
 * 日期越近加成越高，最多加 40 分
 * @param {number} importance - 重要性 1-10
 * @param {number} urgency - 紧急性 1-10
 * @param {string|Date|null} dueDate - 截止日期
 * @returns {number} 优先级分数 1-140
 */
export function calculatePriorityScore(importance, urgency, dueDate = null) {
  const baseScore = Math.min(100, Math.max(1, importance * urgency));

  // 日期加成
  let dateBonus = 0;
  if (dueDate) {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);

    const diffMs = due.getTime() - now.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      // 已过期：加 40 分
      dateBonus = 40;
    } else if (diffDays === 0) {
      // 今天：加 35 分
      dateBonus = 35;
    } else if (diffDays === 1) {
      // 明天：加 30 分
      dateBonus = 30;
    } else if (diffDays <= 3) {
      // 2-3 天：加 20 分
      dateBonus = 20;
    } else if (diffDays <= 7) {
      // 4-7 天：加 10 分
      dateBonus = 10;
    } else if (diffDays <= 14) {
      // 8-14 天：加 5 分
      dateBonus = 5;
    }
    // 14 天以后：无加成
  }

  return baseScore + dateBonus;
}

// ==================== 四象限分类 ====================

/**
 * 四象限类型
 * @typedef {'Q1'|'Q2'|'Q3'|'Q4'} Quadrant
 */

/**
 * 四象限配置
 */
export const QUADRANT_CONFIG = {
  Q1: {
    label: '重要且紧急',
    icon: '🔥',
    color: '#ef4444',
    bgColor: 'var(--q1-bg)',
    action: '立即执行',
    description: '危机事件、迫在眉睫的截止日期、关键问题',
  },
  Q2: {
    label: '重要不紧急',
    icon: '📅',
    color: '#3b82f6',
    bgColor: 'var(--q2-bg)',
    action: '安排时间做',
    description: '长期规划、能力提升、关系建立、预防性措施',
  },
  Q3: {
    label: '紧急不重要',
    icon: '🤝',
    color: '#eab308',
    bgColor: 'var(--q3-bg)',
    action: '尽量委托',
    description: '某些会议、临时打扰、多数电话、迎合他人期望的事务',
  },
  Q4: {
    label: '不重要不紧急',
    icon: '☕',
    color: '#6b7280',
    bgColor: 'var(--q4-bg)',
    action: '有空再做',
    description: '琐碎杂事、娱乐消遣、无意义的刷手机',
  },
};

/**
 * 将任务分类到四象限
 * @param {number} importance - 重要性 1-10
 * @param {number} urgency - 紧急性 1-10
 * @param {number} threshold - 象限分界线，默认 6
 * @returns {Quadrant}
 */
export function classifyQuadrant(importance, urgency, threshold = 6) {
  const isImportant = importance >= threshold;
  const isUrgent = urgency >= threshold;

  if (isImportant && isUrgent) return 'Q1';
  if (isImportant && !isUrgent) return 'Q2';
  if (!isImportant && isUrgent) return 'Q3';
  return 'Q4';
}

/**
 * 获取象限顺序（用于渲染）
 */
export const QUADRANT_ORDER = ['Q1', 'Q2', 'Q3', 'Q4'];

/**
 * 根据目标象限计算新的 importance 值
 * @param {Quadrant} quadrant
 * @param {number} threshold
 * @returns {number}
 */
export function getImportanceForQuadrant(quadrant, threshold = 6) {
  return quadrant === 'Q1' || quadrant === 'Q2' ? threshold : threshold - 1;
}

/**
 * 根据目标象限计算新的 urgency 值
 * @param {Quadrant} quadrant
 * @param {number} threshold
 * @returns {number}
 */
export function getUrgencyForQuadrant(quadrant, threshold = 6) {
  return quadrant === 'Q1' || quadrant === 'Q3' ? threshold : threshold - 1;
}

/**
 * 按象限对任务分组
 * @param {Task[]} tasks
 * @param {number} threshold
 * @returns {Object<Quadrant, Task[]>}
 */
export function groupTasksByQuadrant(tasks, threshold = 6) {
  const groups = {
    Q1: [],
    Q2: [],
    Q3: [],
    Q4: [],
  };

  tasks.forEach(task => {
    const quadrant = classifyQuadrant(task.importance, task.urgency, threshold);
    groups[quadrant].push(task);
  });

  // 每个象限内按优先级分数降序排列
  Object.keys(groups).forEach(key => {
    groups[key].sort((a, b) => b.priorityScore - a.priorityScore);
  });

  return groups;
}
