const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Doctor = require('../models/Doctor');

// Store invalidated tokens
const invalidatedTokens = new Set();

// Invalidate token (for logout)
exports.invalidateToken = (token) => {
  invalidatedTokens.add(token);
};

// Auth middleware
exports.auth = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization').replace('Bearer ', '');
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key');
    
    // Add user id and role to request
    req.user = { 
      id: decoded.id,
      role: decoded.role
    };
    
    // Check if token is invalidated
    if (invalidatedTokens.has(token)) {
      return res.status(401).json({ message: 'Token has been invalidated' });
    }
    
    // Store token for potential invalidation
    req.token = token;
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Not authorized' });
  }
};

// Authorization middleware
exports.authorize = (roles = []) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied: Insufficient permissions' });
    }
    next();
  };
};

