const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database/db');

// Secret key for JWT - in production, this should be in environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'invoicepro-secret-key-change-in-production';

/**
 * Hash a password using bcrypt
 */
async function hashPassword(password) {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

/**
 * Compare password with hash
 */
async function comparePassword(password, hash) {
  return await bcrypt.compare(password, hash);
}

/**
 * Generate JWT token
 */
function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

/**
 * Verify JWT token
 */
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

/**
 * Authentication middleware
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }

  // Check if session exists in database
  const session = db.getSessionByToken(token);
  if (!session) {
    return res.status(403).json({ error: 'Session expired or invalid' });
  }

  if (!session.active) {
    return res.status(403).json({ error: 'User account is disabled' });
  }

  // Attach user info to request
  req.user = {
    id: session.user_id,
    username: session.username,
    email: session.email,
    role: session.role
  };

  next();
}

/**
 * Role-based authorization middleware
 */
function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
}

/**
 * Audit log middleware
 */
function auditLog(action, resource_type) {
  return (req, res, next) => {
    // Store original send function
    const originalSend = res.send;

    // Override send function to log after successful response
    res.send = function (data) {
      // Only log successful operations (2xx status)
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const resource_id = req.params.id || req.body?.id || null;
        const details = JSON.stringify({
          method: req.method,
          url: req.originalUrl,
          params: req.params,
          body: req.body
        });

        db.createAuditLog({
          user_id: req.user?.id || null,
          username: req.user?.username || 'anonymous',
          action,
          resource_type,
          resource_id,
          details,
          ip_address: req.ip || req.connection.remoteAddress
        });
      }

      // Call original send
      originalSend.call(this, data);
    };

    next();
  };
}

/**
 * Login user
 */
async function loginUser(username, password, ipAddress, userAgent) {
  try {
    // Get user by username
    const user = db.getUserByUsername(username);

    if (!user) {
      return { success: false, error: 'Invalid username or password' };
    }

    if (!user.active) {
      return { success: false, error: 'Account is disabled' };
    }

    // Compare password
    const isValid = await comparePassword(password, user.password_hash);

    if (!isValid) {
      return { success: false, error: 'Invalid username or password' };
    }

    // Generate token
    const token = generateToken(user);

    // Calculate expiration (24 hours from now)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);
    const expiresAtStr = expiresAt.toISOString();

    // Create session
    db.createSession({
      user_id: user.id,
      token,
      expires_at: expiresAtStr,
      ip_address: ipAddress,
      user_agent: userAgent
    });

    // Update last login
    db.updateUserLastLogin(user.id);

    // Return user data (without password hash)
    return {
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        role: user.role
      }
    };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: 'Login failed' };
  }
}

/**
 * Logout user
 */
function logoutUser(token) {
  try {
    db.deleteSession(token);
    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    return { success: false, error: 'Logout failed' };
  }
}

/**
 * Change password
 */
async function changePassword(userId, oldPassword, newPassword) {
  try {
    const user = db.getUser(userId);

    if (!user) {
      return { success: false, error: 'User not found' };
    }

    // Verify old password
    const isValid = await comparePassword(oldPassword, user.password_hash);

    if (!isValid) {
      return { success: false, error: 'Current password is incorrect' };
    }

    // Hash new password
    const newHash = await hashPassword(newPassword);

    // Update password
    db.updateUserPassword(userId, newHash);

    // Delete all user sessions (force re-login)
    db.deleteUserSessions(userId);

    return { success: true };
  } catch (error) {
    console.error('Change password error:', error);
    return { success: false, error: 'Password change failed' };
  }
}

module.exports = {
  hashPassword,
  comparePassword,
  generateToken,
  verifyToken,
  authenticateToken,
  authorize,
  auditLog,
  loginUser,
  logoutUser,
  changePassword
};
