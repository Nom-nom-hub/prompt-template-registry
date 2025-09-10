#!/usr/bin/env node

/**
 * Test script for enterprise features
 */

import { 
  authenticateUser, 
  generateToken, 
  verifyToken, 
  hasRole, 
  isInTeam, 
  hasPermission 
} from './auth.js';

import { 
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
} from './private-registry.js';

console.log('Testing enterprise features...\n');

// Test authentication
console.log('1. Testing authentication:');
const user = authenticateUser('admin', 'password');
console.log('  Authenticated user:', user ? user.username : 'null');

// Test token generation and verification
console.log('\n2. Testing token generation and verification:');
const token = generateToken(user);
console.log('  Generated token:', token.substring(0, 20) + '...');

const verifiedUser = verifyToken(token);
console.log('  Verified user:', verifiedUser ? verifiedUser.username : 'null');

// Test role and team checks
console.log('\n3. Testing role and team checks:');
console.log('  User has admin role:', hasRole(user, 'admin'));
console.log('  User is in admins team:', isInTeam(user, 'admins'));
console.log('  User has create permission on prompts:', hasPermission(user, 'create', 'prompts'));

// Test private registry functionality
console.log('\n4. Testing private registry functionality:');
const registry = createPrivateRegistry('test-registry', 'Test Registry', '1');
console.log('  Created registry:', registry.id);

const updatedRegistry = addMember(registry, '2');
addTeam(updatedRegistry, 'developers');

const promptData = {
  latest: '1.0.0',
  versions: {
    '1.0.0': {
      description: 'Test prompt',
      prompt: 'Generate {{content}}',
      category: 'development',
      tags: ['test'],
      version: '1.0.0'
    }
  }
};

addPrompt(updatedRegistry, 'test_prompt', promptData);
console.log('  Added prompt to registry');

const retrievedPrompt = getPrompt(updatedRegistry, 'test_prompt');
console.log('  Retrieved prompt:', retrievedPrompt ? retrievedPrompt.description : 'null');

const promptList = listPrompts(updatedRegistry);
console.log('  Prompt list:', promptList);

// Test access control
console.log('\n5. Testing access control:');
const testUser = {
  id: '2',
  username: 'user1',
  roles: ['user'],
  teams: ['developers']
};

console.log('  Test user has access:', hasAccess(updatedRegistry, testUser));

const adminUser = {
  id: '1',
  username: 'admin',
  roles: ['admin'],
  teams: ['admins']
};

console.log('  Admin user has access:', hasAccess(updatedRegistry, adminUser));

// Test collection functionality
console.log('\n6. Testing collection functionality:');
const collection = createCollection('Test Collection', ['test_prompt']);
console.log('  Created collection:', collection.name);

addPromptToCollection(collection, 'another_prompt');
console.log('  Collection prompt count:', collection.promptIds.length);

// Test registry persistence
console.log('\n7. Testing registry persistence:');
const testRegistryPath = './test-registry.json';
const saveResult = saveRegistry(updatedRegistry, testRegistryPath);
console.log('  Save result:', saveResult);

const loadedRegistry = loadRegistry(testRegistryPath);
console.log('  Loaded registry:', loadedRegistry ? loadedRegistry.id : 'null');

// Clean up test file
import fs from 'node:fs';
if (fs.existsSync(testRegistryPath)) {
  fs.unlinkSync(testRegistryPath);
  console.log('  Cleaned up test file');
}

console.log('\n✅ All tests completed successfully!');