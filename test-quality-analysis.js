#!/usr/bin/env node

/**
 * Test script for prompt quality analysis functionality
 */

import { calculateReadability, countVariables, checkBestPractices, calculateQualityScore, analyzePrompt } from './quality-analysis.js';

console.log('Testing prompt quality analysis functionality...\n');

// Test data
const samplePrompt = {
  id: 'test_prompt',
  description: 'A sample prompt for testing quality analysis',
  prompt: 'Generate a {{type}} about {{topic}}. Make sure to include {{details}} and follow best practices.',
  category: 'development',
  tags: ['test', 'quality', 'analysis'],
  version: '1.0.0'
};

const poorPrompt = {
  id: 'poor_prompt',
  description: 'short',
  prompt: 'TODO: write something here',
  category: 'invalid',
  tags: [],
  version: '1.0.0'
};

// Test readability calculation
console.log('1. Testing readability calculation:');
const readability1 = calculateReadability(samplePrompt.prompt);
const readability2 = calculateReadability('This is a simple sentence with short words.');
console.log(`Readability of sample prompt: ${readability1.toFixed(1)}`);
console.log(`Readability of simple text: ${readability2.toFixed(1)}`);

// Test variable counting
console.log('\n2. Testing variable counting:');
const variables1 = countVariables(samplePrompt.prompt);
const variables2 = countVariables('No variables here');
console.log(`Variables in sample prompt: ${variables1}`);
console.log(`Variables in text without variables: ${variables2}`);

// Test best practices check
console.log('\n3. Testing best practices check:');
const bestPractices1 = checkBestPractices(samplePrompt);
const bestPractices2 = checkBestPractices(poorPrompt);
console.log('Best practices for good prompt:');
console.log(`  Issues: ${bestPractices1.issues.length}`);
console.log(`  Suggestions: ${bestPractices1.suggestions.length}`);
console.log('Best practices for poor prompt:');
console.log(`  Issues: ${bestPractices2.issues.length}`);
if (bestPractices2.issues.length > 0) {
  bestPractices2.issues.forEach(issue => console.log(`    - ${issue}`));
}
console.log(`  Suggestions: ${bestPractices2.suggestions.length}`);
if (bestPractices2.suggestions.length > 0) {
  bestPractices2.suggestions.forEach(suggestion => console.log(`    - ${suggestion}`));
}

// Test quality scoring
console.log('\n4. Testing quality scoring:');
const quality1 = calculateQualityScore(samplePrompt);
const quality2 = calculateQualityScore(poorPrompt);
console.log(`Quality score for good prompt: ${quality1.score}/100`);
console.log('  Breakdown:');
Object.entries(quality1.breakdown).forEach(([key, value]) => {
  console.log(`    ${key}: ${value.toFixed(1)}`);
});
console.log(`Quality score for poor prompt: ${quality2.score}/100`);
console.log('  Breakdown:');
Object.entries(quality2.breakdown).forEach(([key, value]) => {
  console.log(`    ${key}: ${value.toFixed(1)}`);
});

// Test full analysis
console.log('\n5. Testing full analysis:');
const analysis1 = analyzePrompt(samplePrompt);
const analysis2 = analyzePrompt(poorPrompt);
console.log('Analysis for good prompt:');
console.log(`  Quality: ${analysis1.quality}/100`);
console.log(`  Feedback: ${analysis1.feedback}`);
console.log('  Metrics:');
Object.entries(analysis1.metrics).forEach(([key, value]) => {
  console.log(`    ${key}: ${value}`);
});

console.log('\nAnalysis for poor prompt:');
console.log(`  Quality: ${analysis2.quality}/100`);
console.log(`  Feedback: ${analysis2.feedback}`);
console.log('  Metrics:');
Object.entries(analysis2.metrics).forEach(([key, value]) => {
  console.log(`    ${key}: ${value}`);
});

console.log('\n✅ All tests completed successfully!');
