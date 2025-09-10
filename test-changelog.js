#!/usr/bin/env node

/**
 * Test script for changelog generator
 */

import { generatePromptChangelog, generateVersionTree } from './changelog-generator.js';
import fs from 'node:fs';
import path from 'node:path';

console.log('Testing changelog generator...\n');

// Test changelog generation
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

const changelogEntry = generatePromptChangelog('sql_query_generation', oldPrompt, newPrompt, '1.1.0');
console.log('Generated changelog entry:');
console.log(changelogEntry);

// Test version tree generation
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

const tree = generateVersionTree(mockPromptEntry);
console.log('\nGenerated version tree:');
console.log(tree);

console.log('\n✅ All tests completed successfully!');
