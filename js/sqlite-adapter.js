// Stream Haven V2 - SQLite Database Adapter
// Local database implementation using sql.js library

// Import sql.js library (will be loaded from CDN)
window.sqlInit = null;
window.db = null;

// Database configuration
const DB_CONFIG = {
  name: 'stream_haven_v2',
  version: 1,
  tables: {
    users: `
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        name TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `,
    accounts: `
      CREATE TABLE IF NOT EXISTS accounts (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        color TEXT DEFAULT '#7c3aed',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `,
    streams: `
      CREATE TABLE IF NOT EXISTS streams (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        account_id TEXT NOT NULL,
        title TEXT NOT NULL,
        platform TEXT NOT NULL CHECK (platform IN ('twitch', 'youtube', 'tiktok', 'instagram')),
        date DATETIME NOT NULL,
        duration INTEGER,
        completed BOOLEAN DEFAULT 0,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
      )
    `,
    content_planner: `
      CREATE TABLE IF NOT EXISTS content_planner (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        account_id TEXT NOT NULL,
        title TEXT NOT NULL,
        type TEXT NOT NULL CHECK (type IN ('stream', 'video', 'short', 'post')),
        status TEXT DEFAULT 'idea' CHECK (status IN ('idea', 'planning', 'recording', 'editing', 'published')),
        date DATETIME,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
      )
    `,
    goals: `
      CREATE TABLE IF NOT EXISTS goals (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        account_id TEXT NOT NULL,
        title TEXT NOT NULL,
        target INTEGER NOT NULL,
        current INTEGER DEFAULT 0,
        unit TEXT DEFAULT 'count',
        deadline DATETIME,
        completed BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
      )
    `,
    sims_goals: `
      CREATE TABLE IF NOT EXISTS sims_goals (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        account_id TEXT NOT NULL,
        title TEXT NOT NULL,
        target INTEGER NOT NULL,
        current INTEGER DEFAULT 0,
        completed BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
      )
    `,
    ideas: `
      CREATE TABLE IF NOT EXISTS ideas (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        account_id TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT,
        category TEXT DEFAULT 'general',
        priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
      )
    `,
    quick_links: `
      CREATE TABLE IF NOT EXISTS quick_links (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        account_id TEXT NOT NULL,
        title TEXT NOT NULL,
        url TEXT NOT NULL,
        category TEXT DEFAULT 'general',
        icon TEXT DEFAULT '🔗',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
      )
    `,
    growth_stats: `
      CREATE TABLE IF NOT EXISTS growth_stats (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        account_id TEXT NOT NULL,
        platform TEXT NOT NULL,
        followers INTEGER DEFAULT 0,
        date DATE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
      )
    `,
    user_settings: `
      CREATE TABLE IF NOT EXISTS user_settings (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL UNIQUE,
        pastel_theme TEXT DEFAULT 'lavender',
        theme_mode TEXT DEFAULT 'dark',
        current_account_id TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (current_account_id) REFERENCES accounts(id) ON DELETE SET NULL
      )
    `
  }
};

// Initialize SQLite database
async function initDatabase() {
  try {
    // Load sql.js from CDN
    if (!window.sqlInit) {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/sql-wasm.js';
      script.onload = async () => {
        window.sqlInit = window.initSqlJs({
          locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`
        });
        
        try {
          const SQL = await window.sqlInit;
          
          // Try to load existing database from localStorage
          let db = null;
          const savedDb = localStorage.getItem('stream_haven_database');
          
          if (savedDb) {
            try {
              const uInt8Array = new Uint8Array(JSON.parse(savedDb));
              db = new SQL.Database(uInt8Array);
              console.log('Loaded existing database from localStorage');
            } catch (error) {
              console.log('Failed to load saved database, creating new one:', error);
              db = new SQL.Database();
            }
          } else {
            db = new SQL.Database();
            console.log('Created new database');
          }
          
          window.db = db;
          
          // Create all tables (they won't be created if they already exist)
          Object.values(DB_CONFIG.tables).forEach(createTableSQL => {
            try {
              window.db.run(createTableSQL);
            } catch (error) {
              // Table might already exist, which is fine
              console.log('Table creation info:', error.message);
            }
          });
          
          // Save database to localStorage after any changes
          const originalRun = window.db.run.bind(window.db);
          window.db.run = function(...args) {
            const result = originalRun(...args);
            saveDatabaseToStorage();
            return result;
          };
          
          console.log('SQLite database initialized successfully');
          return true;
        } catch (error) {
          console.error('Failed to initialize SQLite:', error);
          return false;
        }
      };
      document.head.appendChild(script);
      
      // Wait for initialization
      return new Promise((resolve) => {
        const checkInterval = setInterval(() => {
          if (window.db) {
            clearInterval(checkInterval);
            resolve(true);
          }
        }, 100);
      });
    }
    
    return true;
  } catch (error) {
    console.error('Database initialization error:', error);
    return false;
  }
}

// Save database to localStorage
function saveDatabaseToStorage() {
  try {
    if (window.db) {
      const data = window.db.export();
      localStorage.setItem('stream_haven_database', JSON.stringify(Array.from(data)));
    }
  } catch (error) {
    console.error('Failed to save database:', error);
  }
}

// Database helper functions
window.SQLiteDB = {
  // Generate UUID
  generateId: () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  },

  // Execute query and return results
  query: (sql, params = []) => {
    try {
      if (!window.db) {
        console.error('Database not initialized');
        return { data: null, error: 'Database not initialized' };
      }
      
      const stmt = window.db.prepare(sql);
      
      // Bind parameters if provided
      if (params && params.length > 0) {
        stmt.bind(params);
      }
      
      // Step to get the first result
      const hasResult = stmt.step();
      let result = null;
      
      if (hasResult) {
        result = stmt.getAsObject();
      }
      
      stmt.free();
      
      // Check if we got a valid result (not empty)
      if (result && Object.keys(result).length > 0) {
        return { data: result, error: null };
      } else {
        return { data: null, error: null };
      }
    } catch (error) {
      console.error('Query error:', error);
      return { data: null, error: error.message };
    }
  },

  // Execute query and return all results
  queryAll: (sql, params = []) => {
    try {
      if (!window.db) {
        console.error('Database not initialized');
        return { data: [], error: 'Database not initialized' };
      }
      
      const stmt = window.db.prepare(sql);
      
      // Bind parameters if provided
      if (params && params.length > 0) {
        stmt.bind(params);
      }
      
      const results = [];
      while (stmt.step()) {
        results.push(stmt.getAsObject());
      }
      stmt.free();
      
      return { data: results, error: null };
    } catch (error) {
      console.error('Query all error:', error);
      return { data: [], error: error.message };
    }
  },

  // Execute insert/update/delete query
  execute: (sql, params = []) => {
    try {
      if (!window.db) {
        console.error('Database not initialized');
        return { data: null, error: 'Database not initialized' };
      }
      
      const stmt = window.db.prepare(sql);
      
      // Bind parameters if provided
      if (params && params.length > 0) {
        stmt.bind(params);
      }
      
      stmt.run();
      stmt.free();
      
      return { data: { success: true }, error: null };
    } catch (error) {
      console.error('Execute error:', error);
      return { data: null, error: error.message };
    }
  },

  // Insert data and return ID
  insert: (table, data) => {
    try {
      const id = SQLiteDB.generateId();
      const columns = Object.keys(data);
      const values = Object.values(data);
      
      const sql = `INSERT INTO ${table} (id, ${columns.join(', ')}) VALUES (?, ${columns.map(() => '?').join(', ')})`;
      const params = [id, ...values];
      
      const result = SQLiteDB.execute(sql, params);
      
      if (result.error) {
        return result;
      }
      
      // Manually save database since execute() might not trigger our overridden run()
      saveDatabaseToStorage();
      
      return { data: { id, ...data }, error: null };
    } catch (error) {
      console.error('Insert error:', error);
      return { data: null, error: error.message };
    }
  },

  // Update data
  update: (table, data, whereClause, whereParams = []) => {
    try {
      const columns = Object.keys(data);
      const values = Object.values(data);
      
      const sql = `UPDATE ${table} SET ${columns.map(col => `${col} = ?`).join(', ')} WHERE ${whereClause}`;
      const params = [...values, ...whereParams];
      
      const result = SQLiteDB.execute(sql, params);
      
      // Manually save database since execute() might not trigger our overridden run()
      if (!result.error) {
        saveDatabaseToStorage();
      }
      
      return result;
    } catch (error) {
      console.error('Update error:', error);
      return { data: null, error: error.message };
    }
  },

  // Delete data
  delete: (table, whereClause, whereParams = []) => {
    try {
      const sql = `DELETE FROM ${table} WHERE ${whereClause}`;
      const result = SQLiteDB.execute(sql, whereParams);
      
      // Manually save database since execute() might not trigger our overridden run()
      if (!result.error) {
        saveDatabaseToStorage();
      }
      
      return result;
    } catch (error) {
      console.error('Delete error:', error);
      return { data: null, error: error.message };
    }
  },

  // Get single record
  get: (table, whereClause, whereParams = []) => {
    const sql = `SELECT * FROM ${table} WHERE ${whereClause}`;
    return SQLiteDB.query(sql, whereParams);
  },

  // Get all records
  getAll: (table, whereClause = '1=1', whereParams = [], orderBy = '') => {
    let sql = `SELECT * FROM ${table} WHERE ${whereClause}`;
    if (orderBy) {
      sql += ` ORDER BY ${orderBy}`;
    }
    return SQLiteDB.queryAll(sql, whereParams);
  }
};

// Initialize database on page load
document.addEventListener('DOMContentLoaded', async () => {
  await initDatabase();
  console.log('Stream Haven V2 - SQLite adapter loaded');
});
