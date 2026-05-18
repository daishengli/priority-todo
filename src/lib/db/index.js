import Dexie from 'dexie';
import { calculatePriorityScore } from '@/lib/utils/priority';

// 创建数据库实例
const db = new Dexie('PriorityTodoDB');

// 定义表结构 - 使用高版本号避免与旧数据冲突
db.version(12).stores({
  tasks: 'id, status, priorityScore, createdAt, dueDate, *tags',
  tags: 'id, name',
  settings: 'id'
});

// ==================== 任务表操作 ====================

/**
 * 获取所有任务
 * @returns {Promise<Task[]>}
 */
export async function getAllTasks() {
  return db.tasks.orderBy('priorityScore').reverse().toArray();
}

/**
 * 获取活跃任务（未完成的）
 * @returns {Promise<Task[]>}
 */
export async function getActiveTasks() {
  return db.tasks
    .where('status')
    .equals('active')
    .reverse()
    .sortBy('priorityScore');
}

/**
 * 获取已完成任务
 * @returns {Promise<Task[]>}
 */
export async function getCompletedTasks() {
  return db.tasks
    .where('status')
    .equals('completed')
    .reverse()
    .sortBy('completedAt');
}

/**
 * 根据 ID 获取单个任务
 * @param {string} id
 * @returns {Promise<Task|undefined>}
 */
export async function getTask(id) {
  return db.tasks.get(id);
}

/**
 * 创建新任务
 * @param {Object} data - 任务数据
 * @returns {Promise<Task>}
 */
export async function createTask(data) {
  console.log('[DB] createTask 开始, data:', JSON.stringify(data));
  const now = new Date().toISOString();
  const task = {
    id: crypto.randomUUID(),
    title: data.title,
    description: data.description || '',
    importance: data.importance,
    urgency: data.urgency,
    priorityScore: calculatePriorityScore(data.importance, data.urgency, data.dueDate),
    dueDate: data.dueDate || null,
    tags: data.tags || [],
    status: 'active',
    completedAt: null,
    createdAt: now,
    updatedAt: now,
  };
  console.log('[DB] 任务对象:', JSON.stringify(task));
  console.log('[DB] db.tasks:', db.tasks);
  console.log('[DB] 尝试添加...');
  await db.tasks.add(task);
  console.log('[DB] 添加成功!');
  return task;
}

/**
 * 更新任务
 * @param {string} id
 * @param {Object} changes
 */
export async function updateTask(id, changes) {
  const updates = {
    ...changes,
    updatedAt: new Date().toISOString(),
  };

  // 如果更新了重要性、紧急性或日期，重新计算优先级分数
  if (changes.importance !== undefined || changes.urgency !== undefined || changes.dueDate !== undefined) {
    const task = await db.tasks.get(id);
    const importance = changes.importance ?? task.importance;
    const urgency = changes.urgency ?? task.urgency;
    const dueDate = changes.dueDate !== undefined ? changes.dueDate : task.dueDate;
    updates.priorityScore = calculatePriorityScore(importance, urgency, dueDate);
  }

  await db.tasks.update(id, updates);
}

/**
 * 完成任务
 * @param {string} id
 */
export async function completeTask(id) {
  await db.tasks.update(id, {
    status: 'completed',
    completedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
}

/**
 * 取消完成（重新激活任务）
 * @param {string} id
 */
export async function uncompleteTask(id) {
  await db.tasks.update(id, {
    status: 'active',
    completedAt: null,
    updatedAt: new Date().toISOString(),
  });
}

/**
 * 删除任务
 * @param {string} id
 */
export async function deleteTask(id) {
  await db.tasks.delete(id);
}

/**
 * 批量删除任务
 * @param {string[]} ids
 */
export async function deleteTasks(ids) {
  await db.tasks.bulkDelete(ids);
}

// ==================== 标签表操作 ====================

/**
 * 获取所有标签
 * @returns {Promise<Tag[]>}
 */
export async function getAllTags() {
  return db.tags.orderBy('name').toArray();
}

/**
 * 创建标签
 * @param {string} name
 * @param {string} color
 * @returns {Promise<Tag>}
 */
export async function createTag(name, color) {
  const tag = {
    id: crypto.randomUUID(),
    name,
    color,
    createdAt: new Date().toISOString(),
  };
  await db.tags.add(tag);
  return tag;
}

/**
 * 更新标签
 * @param {string} id
 * @param {Object} changes
 */
export async function updateTag(id, changes) {
  await db.tags.update(id, changes);
}

/**
 * 删除标签
 * @param {string} id
 */
export async function deleteTag(id) {
  await db.tags.delete(id);
}

// ==================== 设置操作 ====================

/**
 * 获取应用设置
 * @returns {Promise<Object>}
 */
export async function getSettings() {
  const settings = await db.settings.get('settings');
  return settings || {
    id: 'settings',
    threshold: 6,
    defaultView: 'quadrant',
  };
}

/**
 * 更新应用设置
 * @param {Object} changes
 */
export async function updateSettings(changes) {
  const existing = await getSettings();
  await db.settings.put({ ...existing, ...changes });
}

// ==================== 数据导入导出 ====================

/**
 * 导出所有数据
 * @returns {Promise<Object>}
 */
export async function exportData() {
  const [tasks, tags, settings] = await Promise.all([
    db.tasks.toArray(),
    db.tags.toArray(),
    getSettings(),
  ]);
  return { tasks, tags, settings, exportedAt: new Date().toISOString() };
}

/**
 * 导入数据
 * @param {Object} data
 */
export async function importData(data) {
  if (data.tasks) {
    await db.tasks.clear();
    await db.tasks.bulkAdd(data.tasks);
  }
  if (data.tags) {
    await db.tags.clear();
    await db.tags.bulkAdd(data.tags);
  }
  if (data.settings) {
    await db.settings.put(data.settings);
  }
}

// 导出数据库实例
export { db };
