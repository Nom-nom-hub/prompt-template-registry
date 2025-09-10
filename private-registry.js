/**
 * Prompt Template Registry - Private Registry
 * 
 * Implements private registry functionality for enterprise use
 */

import fs from 'node:fs';
import path from 'node:path';

/**
 * Private registry structure
 * 
 * Example:
 * {
 *   "id": "company-private-registry",
 *   "name": "Company Private Registry",
 *   "owner": "company-id",
 *   "members": ["user1", "user2"],
 *   "teams": ["developers", "admins"],
 *   "prompts": {
 *     "internal_tool_prompt": {
 *       "latest": "1.0.0",
 *       "versions": {
 *         "1.0.0": {
 *           "description": "Internal tool prompt",
 *           "prompt": "Generate code for internal tool: {{tool_name}}",
 *           "category": "development",
 *           "tags": ["internal", "tool"],
 *           "version": "1.0.0"
 *         }
 *       }
 *     }
 *   }
 * }
 */

/**
 * Creates a new private registry
 * @param {string} id - Registry ID
 * @param {string} name - Registry name
 * @param {string} owner - Owner ID
 * @returns {object} Private registry object
 */
export function createPrivateRegistry(id, name, owner) {
  return {
    id,
    name,
    owner,
    members: [],
    teams: [],
    prompts: {},
    workflows: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

/**
 * Adds a member to a private registry
 * @param {object} registry - Private registry
 * @param {string} userId - User ID to add
 * @returns {object} Updated registry
 */
export function addMember(registry, userId) {
  if (!registry.members.includes(userId)) {
    registry.members.push(userId);
    registry.updatedAt = new Date().toISOString();
  }
  return registry;
}

/**
 * Adds a team to a private registry
 * @param {object} registry - Private registry
 * @param {string} teamId - Team ID to add
 * @returns {object} Updated registry
 */
export function addTeam(registry, teamId) {
  if (!registry.teams.includes(teamId)) {
    registry.teams.push(teamId);
    registry.updatedAt = new Date().toISOString();
  }
  return registry;
}

/**
 * Adds a prompt to a private registry
 * @param {object} registry - Private registry
 * @param {string} promptId - Prompt ID
 * @param {object} promptData - Prompt data
 * @returns {object} Updated registry
 */
export function addPrompt(registry, promptId, promptData) {
  registry.prompts[promptId] = promptData;
  registry.updatedAt = new Date().toISOString();
  return registry;
}

/**
 * Gets a prompt from a private registry
 * @param {object} registry - Private registry
 * @param {string} promptId - Prompt ID
 * @param {string} version - Version (optional)
 * @returns {object|null} Prompt data or null if not found
 */
export function getPrompt(registry, promptId, version = null) {
  if (!registry.prompts[promptId]) {
    return null;
  }
  
  const promptEntry = registry.prompts[promptId];
  
  if (!version) {
    version = promptEntry.latest;
  }
  
  return promptEntry.versions[version] || null;
}

/**
 * Lists all prompts in a private registry
 * @param {object} registry - Private registry
 * @returns {Array} Array of prompt IDs
 */
export function listPrompts(registry) {
  return Object.keys(registry.prompts);
}

/**
 * Saves a private registry to disk
 * @param {object} registry - Private registry
 * @param {string} filepath - File path to save to
 * @returns {boolean} True if successful
 */
export function saveRegistry(registry, filepath) {
  try {
    fs.writeFileSync(filepath, JSON.stringify(registry, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error saving registry:', error.message);
    return false;
  }
}

/**
 * Loads a private registry from disk
 * @param {string} filepath - File path to load from
 * @returns {object|null} Private registry or null if not found
 */
export function loadRegistry(filepath) {
  try {
    if (fs.existsSync(filepath)) {
      const data = fs.readFileSync(filepath, 'utf8');
      return JSON.parse(data);
    }
    return null;
  } catch (error) {
    console.error('Error loading registry:', error.message);
    return null;
  }
}

/**
 * Checks if a user has access to a private registry
 * @param {object} registry - Private registry
 * @param {object} user - User object
 * @returns {boolean} True if user has access
 */
export function hasAccess(registry, user) {
  // Owner always has access
  if (registry.owner === user.id) {
    return true;
  }
  
  // Check if user is a member
  if (registry.members.includes(user.id)) {
    return true;
  }
  
  // Check if user belongs to any of the registry teams
  return registry.teams.some(team => user.teams.includes(team));
}

/**
 * Creates a registry collection
 * @param {string} name - Collection name
 * @param {Array} promptIds - Array of prompt IDs
 * @returns {object} Collection object
 */
export function createCollection(name, promptIds = []) {
  return {
    id: name.toLowerCase().replace(/\s+/g, '-'),
    name,
    promptIds,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

/**
 * Adds a prompt to a collection
 * @param {object} collection - Collection
 * @param {string} promptId - Prompt ID to add
 * @returns {object} Updated collection
 */
export function addPromptToCollection(collection, promptId) {
  if (!collection.promptIds.includes(promptId)) {
    collection.promptIds.push(promptId);
    collection.updatedAt = new Date().toISOString();
  }
  return collection;
}

export default {
  createPrivateRegistry,
  addMember,
  addTeam,
  addPrompt,
  getPrompt,
  listPrompts,
  saveRegistry,
  loadRegistry,
  hasAccess,
  createCollection,
  addPromptToCollection
};