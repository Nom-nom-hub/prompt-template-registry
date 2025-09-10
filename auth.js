/**
 * Prompt Template Registry - Authentication
 * 
 * Implements basic authentication functionality for enterprise features
 */

// In a real implementation, this would integrate with actual authentication systems
// For now, we'll implement a simple token-based system for demonstration

/**
 * User object structure
 * @typedef {Object} User
 * @property {string} id - User ID
 * @property {string} username - Username
 * @property {string} email - Email address
 * @property {Array<string>} roles - User roles
 * @property {Array<string>} teams - Teams the user belongs to
 */

/**
 * Authenticates a user with username and password
 * @param {string} username - Username
 * @param {string} password - Password
 * @returns {object|null} User object if authentication successful, null otherwise
 */
export function authenticateUser(username, password) {
  // In a real implementation, this would check against a database
  // For demonstration, we'll use hardcoded credentials
  
  // Sample users
  const users = {
    'admin': {
      id: '1',
      username: 'admin',
      email: 'admin@example.com',
      roles: ['admin'],
      teams: ['admins']
    },
    'user1': {
      id: '2',
      username: 'user1',
      email: 'user1@example.com',
      roles: ['user'],
      teams: ['developers']
    },
    'user2': {
      id: '3',
      username: 'user2',
      email: 'user2@example.com',
      roles: ['user'],
      teams: ['designers']
    }
  };
  
  // In a real implementation, we would hash and compare passwords
  // For demonstration, we'll just check if the user exists
  if (users[username]) {
    return users[username];
  }
  
  return null;
}

/**
 * Generates an authentication token for a user
 * @param {object} user - User object
 * @returns {string} Authentication token
 */
export function generateToken(user) {
  // In a real implementation, this would be a JWT or similar
  // For demonstration, we'll create a simple token
  
  const timestamp = Date.now();
  const userData = JSON.stringify({
    id: user.id,
    username: user.username,
    roles: user.roles,
    teams: user.teams,
    timestamp
  });
  
  // Simple base64 encoding for demonstration
  return Buffer.from(userData).toString('base64');
}

/**
 * Verifies an authentication token
 * @param {string} token - Authentication token
 * @returns {object|null} User object if token is valid, null otherwise
 */
export function verifyToken(token) {
  try {
    // Decode the token
    const userData = JSON.parse(Buffer.from(token, 'base64').toString('utf8'));
    
    // Check if token is expired (24 hours)
    const now = Date.now();
    if (now - userData.timestamp > 24 * 60 * 60 * 1000) {
      return null;
    }
    
    return {
      id: userData.id,
      username: userData.username,
      email: `${userData.username}@example.com`, // For demonstration
      roles: userData.roles,
      teams: userData.teams
    };
  } catch (error) {
    return null;
  }
}

/**
 * Checks if a user has a specific role
 * @param {object} user - User object
 * @param {string} role - Role to check
 * @returns {boolean} True if user has the role
 */
export function hasRole(user, role) {
  return user.roles.includes(role);
}

/**
 * Checks if a user belongs to a specific team
 * @param {object} user - User object
 * @param {string} team - Team to check
 * @returns {boolean} True if user belongs to the team
 */
export function isInTeam(user, team) {
  return user.teams.includes(team);
}

/**
 * Checks if a user has permission to perform an action
 * @param {object} user - User object
 * @param {string} action - Action to perform
 * @param {string} resource - Resource to act on
 * @returns {boolean} True if user has permission
 */
export function hasPermission(user, action, resource) {
  // Simple permission model for demonstration
  const permissions = {
    'admin': {
      '*': ['create', 'read', 'update', 'delete']
    },
    'user': {
      'prompts': ['read'],
      'workflows': ['read']
    }
  };
  
  // Admins can do everything
  if (user.roles.includes('admin')) {
    return true;
  }
  
  // Check specific permissions
  if (permissions[user.roles[0]] && permissions[user.roles[0]][resource]) {
    return permissions[user.roles[0]][resource].includes(action);
  }
  
  return false;
}

export default {
  authenticateUser,
  generateToken,
  verifyToken,
  hasRole,
  isInTeam,
  hasPermission
};