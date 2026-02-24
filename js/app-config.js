// Stream Haven V2 - Local Configuration
// Using SQLite database with local authentication

// Database is handled by SQLite adapter (js/sqlite-adapter.js)
// Authentication is handled by local auth (js/local-auth.js)

// Global variables
window.currentUser = null;
window.currentAccount = null;
window.userSettings = null;

// Configuration
window.APP_CONFIG = {
  APP_NAME: 'Stream Haven V2',
  VERSION: '2.0.0',
  DEFAULT_ACCOUNT_COLOR: '#7c3aed',
  DEFAULT_THEME: 'lavender',
  DEFAULT_THEME_MODE: 'dark',
  MIN_PASSWORD_LENGTH: 6,
  MAX_ACCOUNTS: 10
};

// Theme configuration
window.THEMES = {
  lavender: { name: 'Lavender', color: '#c4b5fd' },
  rose: { name: 'Rose', color: '#fda4af' },
  mint: { name: 'Mint', color: '#86efac' },
  sky: { name: 'Sky', color: '#7dd3fc' },
  peach: { name: 'Peach', color: '#fdba74' },
  coral: { name: 'Coral', color: '#f9a8d4' },
  lemon: { name: 'Lemon', color: '#fde047' },
  aqua: { name: 'Aqua', color: '#5eead4' }
};

// Platform configuration
window.PLATFORMS = {
  twitch: { name: 'Twitch', icon: '🟣', color: '#9146ff' },
  youtube: { name: 'YouTube', icon: '🔴', color: '#ff0000' },
  tiktok: { name: 'TikTok', icon: '⚫', color: '#000000' },
  instagram: { name: 'Instagram', icon: '🟠', color: '#e4405f' }
};

// Content types
window.CONTENT_TYPES = {
  stream: { name: 'Stream', icon: '🎥' },
  video: { name: 'Video', icon: '📹' },
  short: { name: 'Short', icon: '⏱️' },
  post: { name: 'Post', icon: '📝' }
};

// Content statuses
window.CONTENT_STATUSES = {
  idea: { name: 'Idea', color: '#60a5fa' },
  planning: { name: 'Planning', color: '#a78bfa' },
  recording: { name: 'Recording', color: '#f59e0b' },
  editing: { name: 'Editing', color: '#f97316' },
  published: { name: 'Published', color: '#10b981' }
};

// Motivational quotes for dashboard
window.MOTIVATIONAL_QUOTES = [
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill" },
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
  { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
  { text: "Everything you've ever wanted is on the other side of fear.", author: "George Addair" },
  { text: "Success is not how high you have climbed, but how you make a positive difference to the world.", author: "Roy T. Bennett" },
  { text: "Don't be pushed around by the fears in your mind. Be led by the dreams in your heart.", author: "Roy T. Bennett" },
  { text: "The harder you work for something, the greater you'll feel when you achieve it.", author: "Anonymous" }
];

// Utility functions
window.Utils = {
  // Format date for display
  formatDate: (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  },

  // Format date and time for display
  formatDateTime: (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  },

  // Get time until date
  getTimeUntil: (date) => {
    if (!date) return '';
    
    const now = new Date();
    const target = new Date(date);
    const diff = target - now;
    
    if (diff <= 0) return 'Now';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  },

  // Generate UUID
  generateUUID: () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  },

  // Show notification
  showNotification: (message, type = 'success') => {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.opacity = '0';
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  },

  // Validate email
  validateEmail: (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  },

  // Validate URL
  validateURL: (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  // Debounce function
  debounce: (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  // Get current week start and end
  getWeekRange: () => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    
    return { start: startOfWeek, end: endOfWeek };
  },

  // Get month start and end
  getMonthRange: () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    return { start: startOfMonth, end: endOfMonth };
  },

  // Calculate percentage
  calculatePercentage: (current, target) => {
    if (!target || target === 0) return 0;
    return Math.min(100, Math.round((current / target) * 100));
  },

  // Format large numbers
  formatNumber: (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  console.log('Stream Haven V2 - Supabase configuration loaded');
});
