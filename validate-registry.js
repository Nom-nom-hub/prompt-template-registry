#!/usr/bin/env node

/**
 * Batch validation script for registry.json
 */

import fs from 'node:fs';
import { validatePrompt } from './validate-prompt.js';

const registryPath = './registry.json';

try {
  console.log('🔍 Starting batch validation of registry.json...\n');

  const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
  const promptIds = Object.keys(registry);

  console.log(`Registry has ${promptIds.length} prompt entries (top-level keys)\n`);

  let totalPrompts = 0;
  let totalErrors = 0;
  let totalWarnings = 0;
  const categoryCount = {};

  for (const promptId of promptIds) {
    const promptData = registry[promptId];

    // Add latest version to the prompt data
    const latestVersion = promptData.versions[promptData.latest];

    if (!latestVersion) {
      console.log(`❌ ${promptId}: No version found for latest "${promptData.latest}"`);
      totalErrors++;
      continue;
    }

    const fullPromptData = {
      id: promptId,
      ...latestVersion
    };

    totalPrompts++;

    // Count categories
    if (!categoryCount[fullPromptData.category]) {
      categoryCount[fullPromptData.category] = 0;
    }
    categoryCount[fullPromptData.category]++;

    // Validate prompt
    const result = validatePrompt(fullPromptData);

    if (!result.isValid) {
      console.log(`❌ ${promptId}:`);
      result.errors.forEach(error => console.log(`  • ${error}`));
      totalErrors++;
    }

    if (result.warnings.length > 0) {
      console.log(`⚠️  ${promptId} warnings:`);
      result.warnings.forEach(warning => console.log(`  • ${warning}`));
      totalWarnings++;
    }

    if (result.isValid && result.warnings.length === 0) {
      console.log(`✅ ${promptId}: Valid`);
    }
  }

  console.log('\n📊 Validation Summary:');
  console.log(`Total prompts: ${totalPrompts}`);
  console.log(`Errors: ${totalErrors}`);
  console.log(`Warnings: ${totalWarnings}`);
  console.log('\n📋 Category Breakdown:');
  Object.entries(categoryCount)
    .sort(([,a], [,b]) => b - a)
    .forEach(([category, count]) => {
      console.log(`${category}: ${count}`);
    });

  if (totalErrors === 0) {
    console.log('\n🎉 All prompts are valid!');
    process.exit(0);
  } else {
    console.log(`\n💥 Found ${totalErrors} errors that need fixing.`);
    process.exit(1);
  }

} catch (error) {
  console.error(`❌ Error reading registry.json: ${error.message}`);
  process.exit(1);
}