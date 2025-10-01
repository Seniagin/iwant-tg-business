const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const sqlite3 = require('sqlite3').verbose();
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const BOT_TOKEN = process.env.BOT_TOKEN; // Your bot token from BotFather

// Middleware
app.use(cors());
app.use(express.json());

// Database setup
const db = new sqlite3.Database('./database.sqlite');

// Initialize database tables
db.serialize(() => {
  // Users table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    telegram_id INTEGER UNIQUE,
    first_name TEXT,
    last_name TEXT,
    username TEXT,
    photo_url TEXT,
    is_premium BOOLEAN,
    activity_description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Requests table
  db.run(`CREATE TABLE IF NOT EXISTS requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    title TEXT,
    description TEXT,
    category TEXT,
    budget TEXT,
    location TEXT,
    contact_info TEXT,
    is_matched BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
  )`);
});

// Telegram WebApp authentication verification
function verifyTelegramWebAppData(initData, botToken) {
  try {
    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get('hash');
    urlParams.delete('hash');
    
    // Sort parameters alphabetically
    const dataCheckString = Array.from(urlParams.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');
    
    // Create secret key
    const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
    
    // Calculate hash
    const calculatedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');
    
    return calculatedHash === hash;
  } catch (error) {
    console.error('Error verifying Telegram data:', error);
    return false;
  }
}

// Extract user data from initData
function extractUserData(initData) {
  try {
    const urlParams = new URLSearchParams(initData);
    const userParam = urlParams.get('user');
    if (userParam) {
      return JSON.parse(decodeURIComponent(userParam));
    }
    return null;
  } catch (error) {
    console.error('Error extracting user data:', error);
    return null;
  }
}

// Middleware to verify JWT token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
}

// Routes

// Telegram authentication
app.post('/api/auth/telegram', async (req, res) => {
  try {
    const { initData } = req.body;

    if (!initData) {
      return res.status(400).json({ success: false, error: 'initData is required' });
    }

    if (!BOT_TOKEN) {
      return res.status(500).json({ success: false, error: 'Bot token not configured' });
    }

    // Verify the Telegram WebApp data
    const isValid = verifyTelegramWebAppData(initData, BOT_TOKEN);
    if (!isValid) {
      return res.status(401).json({ success: false, error: 'Invalid Telegram data' });
    }

    // Extract user data
    const telegramUser = extractUserData(initData);
    if (!telegramUser) {
      return res.status(400).json({ success: false, error: 'Invalid user data' });
    }

    // Check if user exists in database
    const existingUser = await new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM users WHERE telegram_id = ?',
        [telegramUser.id],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    let user;
    if (existingUser) {
      // Update existing user
      await new Promise((resolve, reject) => {
        db.run(
          `UPDATE users SET 
           first_name = ?, last_name = ?, username = ?, photo_url = ?, is_premium = ?, updated_at = CURRENT_TIMESTAMP
           WHERE telegram_id = ?`,
          [
            telegramUser.first_name,
            telegramUser.last_name || null,
            telegramUser.username || null,
            telegramUser.photo_url || null,
            telegramUser.is_premium || false,
            telegramUser.id
          ],
          function(err) {
            if (err) reject(err);
            else resolve(this);
          }
        );
      });
      user = { ...existingUser, ...telegramUser };
    } else {
      // Create new user
      const userId = await new Promise((resolve, reject) => {
        db.run(
          `INSERT INTO users (telegram_id, first_name, last_name, username, photo_url, is_premium)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            telegramUser.id,
            telegramUser.first_name,
            telegramUser.last_name || null,
            telegramUser.username || null,
            telegramUser.photo_url || null,
            telegramUser.is_premium || false
          ],
          function(err) {
            if (err) reject(err);
            else resolve(this.lastID);
          }
        );
      });
      user = { id: userId, ...telegramUser };
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        telegramId: user.telegram_id,
        username: user.username 
      },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      success: true,
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        username: user.username,
        photo_url: user.photo_url,
        is_premium: user.is_premium,
        activity_description: user.activity_description || ''
      },
      token
    });

  } catch (error) {
    console.error('Telegram auth error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Get user profile
app.get('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const user = await new Promise((resolve, reject) => {
      db.get(
        'SELECT * FROM users WHERE id = ?',
        [req.user.userId],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        username: user.username,
        photo_url: user.photo_url,
        is_premium: user.is_premium,
        activity_description: user.activity_description || ''
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Update activity description
app.put('/api/user/activity', authenticateToken, async (req, res) => {
  try {
    const { description } = req.body;

    await new Promise((resolve, reject) => {
      db.run(
        'UPDATE users SET activity_description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [description, req.user.userId],
        function(err) {
          if (err) reject(err);
          else resolve(this);
        }
      );
    });

    res.json({ success: true, message: 'Activity description updated' });

  } catch (error) {
    console.error('Update activity error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Get requests
app.get('/api/requests', authenticateToken, async (req, res) => {
  try {
    const requests = await new Promise((resolve, reject) => {
      db.all(
        'SELECT * FROM requests ORDER BY created_at DESC',
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });

    res.json({ success: true, requests });

  } catch (error) {
    console.error('Get requests error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Add new request
app.post('/api/requests', authenticateToken, async (req, res) => {
  try {
    const { title, description, category, budget, location, contact_info } = req.body;

    const requestId = await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO requests (user_id, title, description, category, budget, location, contact_info)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [req.user.userId, title, description, category, budget, location, contact_info],
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });

    res.json({ success: true, requestId, message: 'Request added successfully' });

  } catch (error) {
    console.error('Add request error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Mark request as matched
app.put('/api/requests/:id/match', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    await new Promise((resolve, reject) => {
      db.run(
        'UPDATE requests SET is_matched = TRUE WHERE id = ?',
        [id],
        function(err) {
          if (err) reject(err);
          else resolve(this);
        }
      );
    });

    res.json({ success: true, message: 'Request marked as matched' });

  } catch (error) {
    console.error('Match request error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Server is running' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});
