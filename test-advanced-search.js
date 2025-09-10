#!/usr/bin/env node

/**
 * Test script for advanced search functionality
 */

import fs from 'node:fs';
import path from 'node:path';
import { calculateSimilarity, extractKeywords, semanticSearch, recommendPrompts, advancedFilter } from './advanced-search.js';

console.log('Testing advanced search functionality...\n');

// Load registry for testing
const registryPath = path.join(process.cwd(), 'registry.json');
const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));

// Test similarity calculation
console.log('1. Testing similarity calculation:');
const similarity1 = calculateSimilarity('hello world', 'hello universe');
const similarity2 = calculateSimilarity('completely different', 'unrelated text');
console.log(`Similarity between "hello world" and "hello universe": ${similarity1.toFixed(2)}`);
console.log(`Similarity between "completely different" and "unrelated text": ${similarity2.toFixed(2)}`);

// Test keyword extraction
console.log('\n2. Testing keyword extraction:');
const keywords = extractKeywords('This is a sample prompt for testing purposes');
console.log(`Keywords extracted: ${keywords.join(', ')}`);

// Test semantic search
console.log('\n3. Testing semantic search:');
const searchResults = semanticSearch(registry, 'sql database query', 3);
console.log('Top 3 results for "sql database query":');
searchResults.forEach((result, index) => {
  console.log(`  ${index + 1}. ${result.id} (score: ${result.score.toFixed(2)})`);
});

// Test recommendations
console.log('\n4. Testing recommendations:');
// Find a prompt to use for recommendations
const promptIds = Object.keys(registry);
if (promptIds.length > 0) {
  const samplePromptId = promptIds[0];
  console.log(`Generating recommendations based on "${samplePromptId}":`);
  const recommendations = recommendPrompts(registry, samplePromptId, 3);
  recommendations.forEach((rec, index) => {
    console.log(`  ${index + 1}. ${rec.id} (score: ${rec.score.toFixed(2)})`);
  });
}

// Test advanced filtering
console.log('\n5. Testing advanced filtering:');
const filteredResults = advancedFilter(registry, {
  category: 'development',
  minVariables: 1,
  maxVariables: 3
});
console.log(`Found ${filteredResults.length} development prompts with 1-3 variables`);
if (filteredResults.length > 0) {
  console.log('First 3 results:');
  filteredResults.slice(0, 3).forEach(result => {
    console.log(`  - ${result.id}: ${result.description}`);
  });
}

console.log('\n✅ All tests completed successfully!');
