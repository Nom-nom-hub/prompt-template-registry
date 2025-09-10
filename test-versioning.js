#!/usr/bin/env node

/**
 * Test script for versioning utilities
 */

import { compareVersions, suggestNextVersion, analyzePromptChanges, createVersionTree } from './version-utils.js';

console.log('Testing versioning utilities...\n');

// Test version comparison
console.log('1. Testing version comparison:');
console.log(`compareVersions('1.0.0', '1.0.1'): ${compareVersions('1.0.0', '1.0.1')}`); // -1
console.log(`compareVersions('1.0.1', '1.0.0'): ${compareVersions('1.0.1', '1.0.0')}`); // 1
console.log(`compareVersions('1.0.0', '1.0.0'): ${compareVersions('1.0.0', '1.0.0')}`); // 0
console.log(`compareVersions('2.0.0', '1.9.9'): ${compareVersions('2.0.0', '1.9.9')}`); // 1

// Test version suggestion
console.log('\n2. Testing version suggestion:');
console.log(`suggestNextVersion('1.0.0', {}, true, false, false): ${suggestNextVersion('1.0.0', {}, true, false, false)}`); // 2.0.0
console.log(`suggestNextVersion('1.0.0', {}, false, true, false): ${suggestNextVersion('1.0.0', {}, false, true, false)}`); // 1.1.0
console.log(`suggestNextVersion('1.0.0', {}, false, false, true): ${suggestNextVersion('1.0.0', {}, false, false, true)}`); // 1.0.1

// Test change analysis
console.log('\n3. Testing change analysis:');
const oldPrompt = {
  description: 'Generates SQL queries',
  prompt: 'Translate this request into SQL: {{request}}',
  category: 'development',
  tags: ['sql', 'database']
};

const newPrompt = {
  description: 'Generates optimized SQL queries',
  prompt: 'Translate this request into an optimized SQL query: {{request}} {{table}}',
  category: 'development',
  tags: ['sql', 'database', 'optimization']
};

const changes = analyzePromptChanges(oldPrompt, newPrompt);
console.log('Changes identified:');
console.log(`- Breaking changes: ${changes.hasBreakingChanges}`);
console.log(`- New features: ${changes.hasNewFeatures}`);
console.log(`- Bug fixes: ${changes.hasBugFixes}`);

// Test version tree creation
console.log('\n4. Testing version tree creation:');
const mockPromptEntry = {
  latest: '2.0.0',
  versions: {
    '1.0.0': {
      description: 'First version',
      prompt: 'Test prompt {{var1}}',
      category: 'development',
      tags: ['test'],
      version: '1.0.0'
    },
    '1.1.0': {
      description: 'Added variable',
      prompt: 'Test prompt {{var1}} {{var2}}',
      category: 'development',
      tags: ['test'],
      version: '1.1.0'
    },
    '2.0.0': {
      description: 'Major update',
      prompt: 'Updated prompt {{var1}} {{var2}} {{var3}}',
      category: 'development',
      tags: ['test', 'update'],
      version: '2.0.0'
    }
  }
};

const tree = createVersionTree(mockPromptEntry);
console.log('Version tree:');
console.log(tree);

console.log('\n✅ All tests completed successfully!');
