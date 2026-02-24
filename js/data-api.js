// Stream Haven V2 - Data Access Layer
// Provides simple functions for all database operations

// Stream operations
window.StreamsAPI = {
  getAll: (accountId) => SQLiteDB.getAll('streams', 'account_id = ?', [accountId], 'date ASC'),
  getById: (id) => SQLiteDB.get('streams', 'id = ?', [id]),
  create: (data) => SQLiteDB.insert('streams', data),
  update: (id, data) => SQLiteDB.update('streams', data, 'id = ?', [id]),
  delete: (id) => SQLiteDB.delete('streams', 'id = ?', [id]),
  getUpcoming: (accountId) => SQLiteDB.getAll('streams', 'account_id = ? AND date >= ? AND completed = 0', [accountId, new Date().toISOString()], 'date ASC'),
  getCompleted: (accountId) => SQLiteDB.getAll('streams', 'account_id = ? AND completed = 1', [accountId], 'date DESC')
};

// Content Planner operations
window.ContentAPI = {
  getAll: (accountId) => SQLiteDB.getAll('content_planner', 'account_id = ?', [accountId], 'date ASC'),
  getById: (id) => SQLiteDB.get('content_planner', 'id = ?', [id]),
  create: (data) => SQLiteDB.insert('content_planner', data),
  update: (id, data) => SQLiteDB.update('content_planner', data, 'id = ?', [id]),
  delete: (id) => SQLiteDB.delete('content_planner', 'id = ?', [id]),
  getByStatus: (accountId, status) => SQLiteDB.getAll('content_planner', 'account_id = ? AND status = ?', [accountId, status], 'date ASC')
};

// Goals operations
window.GoalsAPI = {
  getAll: (accountId) => SQLiteDB.getAll('goals', 'account_id = ?', [accountId], 'created_at DESC'),
  getById: (id) => SQLiteDB.get('goals', 'id = ?', [id]),
  create: (data) => SQLiteDB.insert('goals', data),
  update: (id, data) => SQLiteDB.update('goals', data, 'id = ?', [id]),
  delete: (id) => SQLiteDB.delete('goals', 'id = ?', [id]),
  getActive: (accountId) => SQLiteDB.getAll('goals', 'account_id = ? AND completed = 0', [accountId], 'created_at DESC'),
  getCompleted: (accountId) => SQLiteDB.getAll('goals', 'account_id = ? AND completed = 1', [accountId], 'created_at DESC')
};

// Sims Goals operations
window.SimsAPI = {
  getAll: (accountId) => SQLiteDB.getAll('sims_goals', 'account_id = ?', [accountId], 'created_at DESC'),
  getById: (id) => SQLiteDB.get('sims_goals', 'id = ?', [id]),
  create: (data) => SQLiteDB.insert('sims_goals', data),
  update: (id, data) => SQLiteDB.update('sims_goals', data, 'id = ?', [id]),
  delete: (id) => SQLiteDB.delete('sims_goals', 'id = ?', [id])
};

// Ideas operations
window.IdeasAPI = {
  getAll: (accountId) => SQLiteDB.getAll('ideas', 'account_id = ?', [accountId], 'created_at DESC'),
  getById: (id) => SQLiteDB.get('ideas', 'id = ?', [id]),
  create: (data) => SQLiteDB.insert('ideas', data),
  update: (id, data) => SQLiteDB.update('ideas', data, 'id = ?', [id]),
  delete: (id) => SQLiteDB.delete('ideas', 'id = ?', [id]),
  getByPriority: (accountId, priority) => SQLiteDB.getAll('ideas', 'account_id = ? AND priority = ?', [accountId, priority], 'created_at DESC')
};

// Quick Links operations
window.LinksAPI = {
  getAll: (accountId) => SQLiteDB.getAll('quick_links', 'account_id = ?', [accountId], 'created_at DESC'),
  getById: (id) => SQLiteDB.get('quick_links', 'id = ?', [id]),
  create: (data) => SQLiteDB.insert('quick_links', data),
  update: (id, data) => SQLiteDB.update('quick_links', data, 'id = ?', [id]),
  delete: (id) => SQLiteDB.delete('quick_links', 'id = ?', [id]),
  getByCategory: (accountId, category) => SQLiteDB.getAll('quick_links', 'account_id = ? AND category = ?', [accountId, category], 'created_at DESC')
};

// Growth Stats operations
window.GrowthAPI = {
  getAll: (accountId) => SQLiteDB.getAll('growth_stats', 'account_id = ?', [accountId], 'date DESC'),
  getById: (id) => SQLiteDB.get('growth_stats', 'id = ?', [id]),
  create: (data) => SQLiteDB.insert('growth_stats', data),
  update: (id, data) => SQLiteDB.update('growth_stats', data, 'id = ?', [id]),
  delete: (id) => SQLiteDB.delete('growth_stats', 'id = ?', [id]),
  getLatest: (accountId, platform) => SQLiteDB.getAll('growth_stats', 'account_id = ? AND platform = ?', [accountId, platform], 'date DESC'),
  getHistory: (accountId, platform, days) => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    return SQLiteDB.getAll('growth_stats', 'account_id = ? AND platform = ? AND date >= ?', [accountId, platform, startDate.toISOString()], 'date ASC');
  }
};

// Accounts operations
window.AccountsAPI = {
  getAll: (userId) => SQLiteDB.getAll('accounts', 'user_id = ?', [userId], 'created_at ASC'),
  getById: (id) => SQLiteDB.get('accounts', 'id = ?', [id]),
  create: (data) => SQLiteDB.insert('accounts', data),
  update: (id, data) => SQLiteDB.update('accounts', data, 'id = ?', [id]),
  delete: (id) => SQLiteDB.delete('accounts', 'id = ?', [id])
};

// Settings operations
window.SettingsAPI = {
  get: (userId) => SQLiteDB.get('user_settings', 'user_id = ?', [userId]),
  update: (userId, data) => SQLiteDB.update('user_settings', data, 'user_id = ?', [userId]),
  create: (data) => SQLiteDB.insert('user_settings', data)
};

// Calendar helper functions
window.CalendarAPI = {
  getEvents: (accountId, startDate, endDate) => {
    return SQLiteDB.getAll('streams', 'account_id = ? AND date >= ? AND date <= ?', [accountId, startDate.toISOString(), endDate.toISOString()], 'date ASC');
  },
  
  getAllEvents: (accountId, startDate, endDate) => {
    const streams = SQLiteDB.getAll('streams', 'account_id = ? AND date >= ? AND date <= ?', [accountId, startDate.toISOString(), endDate.toISOString()], 'date ASC');
    const content = SQLiteDB.getAll('content_planner', 'account_id = ? AND date >= ? AND date <= ?', [accountId, startDate.toISOString(), endDate.toISOString()], 'date ASC');
    
    return {
      data: [
        ...(streams.data || []).map(s => ({...s, type: 'stream', color: PLATFORMS[s.platform]?.color || '#7c3aed'})),
        ...(content.data || []).map(c => ({...c, type: 'content', color: CONTENT_STATUSES[c.status]?.color || '#60a5fa'}))
      ],
      error: streams.error || content.error
    };
  }
};

console.log('Stream Haven V2 - Data Access Layer loaded');
