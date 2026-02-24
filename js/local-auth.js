// Stream Haven V2 - Local Authentication System
// Simple username/password authentication using SQLite

// Authentication state
let authInitialized = false;
let authPromise = null;

// Password hashing (simple implementation for demo)
window.CryptoUtils = {
  // Simple hash function (for demo purposes - use bcrypt in production)
  hashPassword: async (password) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  },

  // Verify password
  verifyPassword: async (password, hash) => {
    const hashedPassword = await CryptoUtils.hashPassword(password);
    return hashedPassword === hash;
  }
};

// Main authentication check
async function checkAuth() {
  if (authPromise) {
    return authPromise;
  }

  authPromise = performAuthCheck();
  return authPromise;
}

async function performAuthCheck() {
  try {
    // Check if database is ready
    if (!window.db) {
      console.warn('Database not ready - waiting...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      if (!window.db) {
        throw new Error('Database not initialized');
      }
    }

    // Get current session from localStorage
    const sessionData = localStorage.getItem('stream_haven_session');
    if (!sessionData) {
      console.log('No session found - redirecting to login');
      redirectToLogin();
      return false;
    }

    const session = JSON.parse(sessionData);
    
    // Verify user still exists in database
    const { data: user, error } = SQLiteDB.get('users', 'id = ?', [session.userId]);
    
    if (error || !user) {
      console.log('Invalid session - redirecting to login');
      localStorage.removeItem('stream_haven_session');
      redirectToLogin();
      return false;
    }

    // Set current user
    window.currentUser = user;

    // Load user data synchronously
    await Promise.all([
      loadUserData(),
      loadThemeFromSettings()
    ]);

    // Update UI with account info
    updateAccountDisplay();

    // Mark as loaded to prevent flicker
    document.body.classList.add('data-loaded');
    authInitialized = true;

    return true;
  } catch (error) {
    console.error('Auth check failed:', error);
    redirectToLogin();
    return false;
  }
}

// Load user data (accounts and settings)
async function loadUserData() {
  try {
    // Load user settings
    const { data: settings, error: settingsError } = SQLiteDB.get('user_settings', 'user_id = ?', [window.currentUser.id]);

    if (settingsError) {
      throw settingsError;
    }

    if (settings) {
      window.userSettings = settings;
    } else {
      // Create default settings if none exist
      const { data: newSettings, error: createError } = SQLiteDB.insert('user_settings', {
        user_id: window.currentUser.id,
        pastel_theme: APP_CONFIG.DEFAULT_THEME,
        theme_mode: APP_CONFIG.DEFAULT_THEME_MODE
      });

      if (createError) throw createError;
      window.userSettings = newSettings;
    }

    // Load accounts
    const { data: accounts, error: accountsError } = SQLiteDB.getAll('accounts', 'user_id = ?', [window.currentUser.id], 'created_at ASC');

    if (accountsError) throw accountsError;

    if (!accounts || accounts.length === 0) {
      // Create default account if none exist
      const { data: defaultAccount, error: createError } = SQLiteDB.insert('accounts', {
        user_id: window.currentUser.id,
        name: 'Main Account',
        color: APP_CONFIG.DEFAULT_ACCOUNT_COLOR
      });

      if (createError) throw createError;
      window.currentAccount = defaultAccount;
      
      // Update settings with current account
      SQLiteDB.update('user_settings', 
        { current_account_id: defaultAccount.id }, 
        'user_id = ?', 
        [window.currentUser.id]
      );
      
      window.userSettings.current_account_id = defaultAccount.id;
    } else {
      // Set current account from settings or first account
      const currentAccountId = window.userSettings?.current_account_id;
      window.currentAccount = accounts.find(acc => acc.id === currentAccountId) || accounts[0];
    }

  } catch (error) {
    console.error('Failed to load user data:', error);
    Utils.showNotification('Failed to load user data', 'error');
    throw error;
  }
}

// Load and apply theme from settings
async function loadThemeFromSettings() {
  try {
    let theme = APP_CONFIG.DEFAULT_THEME;
    let themeMode = APP_CONFIG.DEFAULT_THEME_MODE;
    
    // Check localStorage first for immediate theme loading
    const savedTheme = localStorage.getItem('stream_haven_theme');
    const savedThemeMode = localStorage.getItem('stream_haven_theme_mode');
    
    if (savedTheme) theme = savedTheme;
    if (savedThemeMode) themeMode = savedThemeMode;
    
    // Override with database settings if available
    if (window.userSettings) {
      theme = window.userSettings.pastel_theme || theme;
      themeMode = window.userSettings.theme_mode || themeMode;
    }

    // Apply theme immediately
    document.body.setAttribute('data-theme', theme);
    document.body.setAttribute('data-theme-mode', themeMode);
    
  } catch (error) {
    console.error('Failed to load theme:', error);
    // Apply default theme on error
    document.body.setAttribute('data-theme', APP_CONFIG.DEFAULT_THEME);
    document.body.setAttribute('data-theme-mode', APP_CONFIG.DEFAULT_THEME_MODE);
  }
}

// Update account display in navigation
function updateAccountDisplay() {
  const accountNameElement = document.querySelector('.account-name');
  const userEmailElement = document.getElementById('userEmail');

  if (window.currentAccount && accountNameElement) {
    accountNameElement.textContent = window.currentAccount.name;
    accountNameElement.style.color = window.currentAccount.color;
  }

  if (window.currentUser && userEmailElement) {
    userEmailElement.textContent = window.currentUser.email;
  }
}

// Sign up function
async function signUp(name, email, password, confirmPassword) {
  try {
    // Wait for database to be ready
    if (!window.db) {
      console.log('Database not ready, waiting...');
      await new Promise(resolve => {
        const checkDb = setInterval(() => {
          if (window.db) {
            clearInterval(checkDb);
            resolve();
          }
        }, 100);
      });
    }

    // Validation
    if (!name || !email || !password) {
      Utils.showNotification('Please fill in all fields', 'error');
      return false;
    }

    if (!Utils.validateEmail(email)) {
      Utils.showNotification('Please enter a valid email address', 'error');
      return false;
    }

    if (password.length < APP_CONFIG.MIN_PASSWORD_LENGTH) {
      Utils.showNotification(`Password must be at least ${APP_CONFIG.MIN_PASSWORD_LENGTH} characters`, 'error');
      return false;
    }

    if (password !== confirmPassword) {
      Utils.showNotification('Passwords do not match', 'error');
      return false;
    }

    // Check if user already exists
    console.log('Checking for existing user with email:', email);
    const { data: existingUser, error: checkError } = SQLiteDB.get('users', 'email = ?', [email]);
    
    console.log('Existing user check result:', { existingUser, error: checkError });
    
    if (checkError) {
      console.error('Database error checking user:', checkError);
      Utils.showNotification('Database error: ' + checkError.message, 'error');
      return false;
    }

    if (existingUser) {
      console.log('User already exists:', existingUser);
      Utils.showNotification('Email already registered', 'error');
      return false;
    }

    // Hash password
    const hashedPassword = await CryptoUtils.hashPassword(password);
    console.log('Password hashed successfully');

    // Create user
    console.log('Creating new user...');
    const { data: user, error } = SQLiteDB.insert('users', {
      email: email,
      password: hashedPassword,
      name: name
    });

    console.log('User creation result:', { user, error });

    if (error) {
      console.error('Failed to create user:', error);
      Utils.showNotification('Failed to create account: ' + error.message, 'error');
      return false;
    }

    console.log('User created successfully:', user);

    Utils.showNotification('Account created successfully! Welcome to Stream Haven!', 'success');
    
    // Create session automatically after successful registration
    const session = {
      userId: user.id,
      email: user.email,
      name: user.name,
      createdAt: new Date().toISOString()
    };

    localStorage.setItem('stream_haven_session', JSON.stringify(session));
    
    // Set global user variables
    window.currentUser = user;
    
    // Redirect to main website after delay
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 2000);

    return true;

  } catch (error) {
    console.error('Sign up error:', error);
    Utils.showNotification('Failed to create account: ' + error.message, 'error');
    return false;
  }
}

// Sign in function
async function signIn(email, password) {
  try {
    // Validation
    if (!email || !password) {
      Utils.showNotification('Please enter email and password', 'error');
      return false;
    }

    if (!Utils.validateEmail(email)) {
      Utils.showNotification('Please enter a valid email address', 'error');
      return false;
    }

    // Get user from database
    console.log('Looking up user with email:', email);
    const { data: user, error } = SQLiteDB.get('users', 'email = ?', [email]);
    
    console.log('User lookup result:', { user, error });

    if (error || !user) {
      console.log('User not found or database error:', error);
      Utils.showNotification('Invalid email or password', 'error');
      return false;
    }

    // Verify password
    console.log('Verifying password for user:', user.email);
    const isValidPassword = await CryptoUtils.verifyPassword(password, user.password);
    console.log('Password verification result:', isValidPassword);
    
    if (!isValidPassword) {
      Utils.showNotification('Invalid email or password', 'error');
      return false;
    }

    // Create session
    const session = {
      userId: user.id,
      email: user.email,
      name: user.name,
      createdAt: new Date().toISOString()
    };

    localStorage.setItem('stream_haven_session', JSON.stringify(session));

    Utils.showNotification('Welcome back!', 'success');
    
    // Redirect to dashboard
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 1000);

    return true;

  } catch (error) {
    console.error('Sign in error:', error);
    Utils.showNotification('Failed to sign in', 'error');
    return false;
  }
}

// Log out function
async function logOut() {
  try {
    // Clear session
    localStorage.removeItem('stream_haven_session');

    // Clear global variables
    window.currentUser = null;
    window.currentAccount = null;
    window.userSettings = null;

    Utils.showNotification('Logged out successfully', 'success');
    
    // Redirect to login
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 1000);

    return true;

  } catch (error) {
    console.error('Log out error:', error);
    Utils.showNotification('Failed to log out', 'error');
    return false;
  }
}

// Switch account
async function switchAccount(accountId) {
  try {
    if (!accountId || accountId === window.currentAccount?.id) {
      return false;
    }

    // Update settings
    const { error } = SQLiteDB.update('user_settings', 
      { 
        current_account_id: accountId,
        updated_at: new Date().toISOString()
      },
      'user_id = ?',
      [window.currentUser.id]
    );

    if (error) throw error;

    // Reload user data
    await loadUserData();
    
    // Update UI
    updateAccountDisplay();
    
    // Reload page content
    if (typeof loadPageData === 'function') {
      await loadPageData();
    }

    // Dispatch account switched event
    document.dispatchEvent(new CustomEvent('accountSwitched', { 
      detail: { accountId: accountId, account: window.currentAccount } 
    }));

    Utils.showNotification(`Switched to ${window.currentAccount.name}`, 'success');
    return true;

  } catch (error) {
    console.error('Failed to switch account:', error);
    Utils.showNotification('Failed to switch account', 'error');
    return false;
  }
}

// Redirect to login
function redirectToLogin() {
  // Only redirect if not already on login page
  if (!window.location.pathname.includes('login.html')) {
    window.location.href = 'login.html';
  }
}

// Check if user is authenticated (for protected pages)
function isAuthenticated() {
  return authInitialized && window.currentUser && window.currentAccount;
}

// Initialize auth on page load
document.addEventListener('DOMContentLoaded', async () => {
  // Skip auth check on login page
  if (window.location.pathname.includes('login.html')) {
    document.body.classList.add('data-loaded');
    return;
  }

  // Apply default theme immediately to prevent flicker
  document.body.setAttribute('data-theme', APP_CONFIG.DEFAULT_THEME);
  document.body.setAttribute('data-theme-mode', APP_CONFIG.DEFAULT_THEME_MODE);
  document.body.classList.add('data-loaded');

  // Check authentication and apply saved theme
  try {
    const isAuthenticated = await checkAuth();
    if (isAuthenticated && window.userSettings) {
      // Apply saved theme immediately after auth
      const theme = window.userSettings.pastel_theme || APP_CONFIG.DEFAULT_THEME;
      const themeMode = window.userSettings.theme_mode || APP_CONFIG.DEFAULT_THEME_MODE;
      document.body.setAttribute('data-theme', theme);
      document.body.setAttribute('data-theme-mode', themeMode);
    }
  } catch (error) {
    console.error('Auth check failed:', error);
  }
});

// Expose functions globally
window.Auth = {
  checkAuth,
  signUp,
  signIn,
  logOut,
  switchAccount,
  isAuthenticated,
  loadThemeFromSettings,
  updateAccountDisplay
};

console.log('Stream Haven V2 - Local authentication loaded');
