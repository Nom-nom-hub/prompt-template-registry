#!/usr/bin/env node

/**
 * Prompt Template Registry - Validation CLI Tool
 *
 * Validates new prompt submissions against the registry schema
 * Usage: node validate-prompt.js [prompt-file.json]
 */

import fs from 'node:fs';
import path from 'node:path';

// CLI Tool Version
const CLI_VERSION = '1.0.0';

// Valid categories from registry
const VALID_CATEGORIES = [
  'development',
  'content',
  'customer_service',
  'analysis',
  'creative',
  'education'
];

/**
 * Validates snake_case format
 * @param {string} id - The prompt ID to validate
 * @returns {boolean} True if valid snake_case
 */
function isValidSnakeCase(id) {
  return /^[a-z][a-z0-9_]*$/.test(id) && !id.includes('__') && !id.endsWith('_');
}

/**
 * Validates semantic version format
 * @param {string} version - Version string to validate
 * @returns {boolean} True if valid semantic version
 */
function isValidVersion(version) {
  return /^[0-9]+\.[0-9]+\.[0-9]+$/.test(version);
}

/**
 * Extracts variables from prompt template
 * @param {string} prompt - The prompt template
 * @returns {string[]} Array of variable names
 */
function extractVariables(prompt) {
  const matches = prompt.match(/\{\{([^}]+)\}\}/g) || [];
  return matches.map(match => match.slice(2, -2));
}

/**
 * Validates prompt data against schema
 * @param {object} promptData - The prompt data to validate
 * @returns {object} Validation result with errors and warnings
 */
function validatePrompt(promptData) {
  const errors = [];
  const warnings = [];

  // Check required top-level fields
  if (!promptData.id || typeof promptData.id !== 'string') {
    errors.push('Missing or invalid "id" field (must be string)');
  }

  if (!promptData.description || typeof promptData.description !== 'string') {
    errors.push('Missing or invalid "description" field (must be string)');
  }

  if (!promptData.prompt || typeof promptData.prompt !== 'string') {
    errors.push('Missing or invalid "prompt" field (must be string)');
  }

  if (!('category' in promptData) || typeof promptData.category !== 'string') {
    errors.push('Missing or invalid "category" field (must be string)');
  }

  if (!Array.isArray(promptData.tags)) {
    errors.push('Missing or invalid "tags" field (must be array)');
  }

  if (!promptData.version || typeof promptData.version !== 'string') {
    errors.push('Missing or invalid "version" field (must be string)');
  }

  // Early return if missing required fields
  if (errors.length > 0) {
    return { isValid: false, errors, warnings };
  }

  // Validate ID format
  if (!isValidSnakeCase(promptData.id)) {
    errors.push(`Invalid ID format "${promptData.id}". Must be lowercase snake_case (e.g., "blog_post_writer")`);
  }

  // Validate version format
  if (!isValidVersion(promptData.version)) {
    errors.push(`Invalid version format "${promptData.version}". Must follow semantic versioning (e.g., "1.0.0")`);
  }

  // Validate category
  if (!VALID_CATEGORIES.includes(promptData.category)) {
    errors.push(`Invalid category "${promptData.category}". Must be one of: ${VALID_CATEGORIES.join(', ')}`);
  }

  // Validate tags
  if (Array.isArray(promptData.tags)) {
    if (promptData.tags.length === 0) {
      warnings.push('Consider adding at least one tag for better discoverability');
    } else {
      // Check for invalid tag types
      const invalidTags = promptData.tags.filter(tag => typeof tag !== 'string');
      if (invalidTags.length > 0) {
        errors.push('All tags must be strings');
      }

      // Check for duplicate tags
      const uniqueTags = [...new Set(promptData.tags)];
      if (uniqueTags.length !== promptData.tags.length) {
        errors.push('Tags must be unique');
      }

      // Check tag format (should be lowercase with hyphens/underscores)
      const invalidTagFormat = promptData.tags.filter(tag => typeof tag === 'string' && !/^[a-z][a-z0-9_-]*$/.test(tag));
      if (invalidTagFormat.length > 0) {
        warnings.push(`Tags should use lowercase with dashes or underscores: ${invalidTagFormat.join(', ')}`);
      }
    }
  }

  // Validate description
  if (promptData.description.length < 10) {
    errors.push('Description too short (minimum 10 characters)');
  }

  if (promptData.description.length > 200) {
    warnings.push('Description is quite long (over 200 characters), consider making it more concise');
  }

  // Validate prompt content
  const prompt = promptData.prompt;

  if (prompt.length < 50) {
    errors.push('Prompt too short (minimum 50 characters) - must be a complete, useful template');
  }

  // Check for balanced variable braces
  const openBraces = (prompt.match(/\{\{/g) || []).length;
  const closeBraces = (prompt.match(/\}\}/g) || []).length;
  if (openBraces !== closeBraces) {
    errors.push('Unbalanced variable braces in prompt ({{ and }} must appear in pairs)');
  }

  // Extract and validate variables
  const variables = extractVariables(prompt);
  const uniqueVariables = [...new Set(variables)];

  if (variables.length !== uniqueVariables.length) {
    errors.push('Prompt contains duplicate variable names');
  }

  // Check for common variable naming issues
  const invalidVariables = uniqueVariables.filter(v => !/^[a-zA-Z][a-zA-Z0-9_]*$/.test(v));
  if (invalidVariables.length > 0) {
    errors.push(`Invalid variable names: ${invalidVariables.join(', ')}. Use letters, numbers, and underscores only`);
  }

  // Quality checks
  if (prompt.length > 2000) {
    warnings.push('Prompt is very long (over 2000 characters), consider breaking into smaller templates');
  }

  // Check for placeholder text
  if (prompt.toLowerCase().includes('todo') || prompt.toLowerCase().includes('placeholder')) {
    warnings.push('Prompt contains placeholder text that should be replaced with actual content');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    metadata: {
      variables: uniqueVariables,
      wordCount: prompt.split(/\s+/).filter(word => word.length > 0).length
    }
  };
}

/**
 * Loads prompt data from file or stdin
 * @param {string} filePath - Path to JSON file (optional, uses stdin if not provided)
 * @returns {object} Parsed prompt data
 */
function loadPromptData(filePath) {
  try {
    let data;
    if (filePath) {
      if (!fs.existsSync(filePath)) {
        console.error(`Error: File '${filePath}' not found`);
        process.exit(1);
      }
      data = fs.readFileSync(filePath, 'utf8');
    } else {
      // Read from stdin
      if (process.stdin.isTTY) {
        console.error('Error: No file specified and no data piped from stdin');
        printUsage();
        process.exit(1);
      }
      data = fs.readFileSync(0, 'utf8');
    }

    return JSON.parse(data);
  } catch (error) {
    console.error(`Error loading prompt data: ${error.message}`);
    process.exit(1);
  }
}

/**
 * Prints usage information
 */
function printUsage() {
  console.log(`
Prompt Template Registry Validator v${CLI_VERSION}
Usage: node validate-prompt.js [options] [file]

Arguments:
  file              Path to JSON file containing prompt data (optional, uses stdin if not provided)

Options:
  -h, --help        Show this help message
  -v, --version     Show version information

Examples:
  node validate-prompt.js prompt.json
  cat prompt.json | node validate-prompt.js
  node validate-prompt.js < prompt.json

The JSON file should contain prompt data matching the registry schema:
{
  "id": "my_prompt",
  "description": "Brief description of what this prompt does",
  "prompt": "Template text with {{variables}}",
  "category": "development",
  "tags": ["tag1", "tag2"],
  "version": "1.0.0"
}
`);
}

/**
 * Main validation function
 */
function main() {
  const args = process.argv.slice(2);
  const filePath = args.find(arg => !arg.startsWith('-'));

  // Handle help and version flags
  if (args.includes('-h') || args.includes('--help')) {
    printUsage();
    process.exit(0);
  }

  if (args.includes('-v') || args.includes('--version')) {
    console.log(`validate-prompt.js v${CLI_VERSION}`);
    process.exit(0);
  }

  // Load and validate prompt data
  const promptData = loadPromptData(filePath);
  const result = validatePrompt(promptData);

  // Output results
  console.log(`\n🔍 Validating prompt: ${promptData.id || 'unknown'}`);

  if (result.warnings.length > 0) {
    console.log('\n⚠️  Warnings:');
    result.warnings.forEach(warning => console.log(`  • ${warning}`));
  }

  if (result.isValid) {
    console.log('\n✅ Validation successful!');
    if (result.metadata) {
      console.log(`📊 Metadata: ${result.metadata.variables.length} variables, ${result.metadata.wordCount} words`);
    }
    if (result.warnings.length > 0) {
      console.log('\nℹ️  Consider addressing the warnings above for better quality.');
    }
    process.exit(0);
  } else {
    console.log('\n❌ Validation failed!');
    console.log('\n🛠️  Errors:');
    result.errors.forEach(error => console.log(`  • ${error}`));
    if (result.warnings.length > 0) {
      console.log('\n⚠️  Warnings:');
      result.warnings.forEach(warning => console.log(`  • ${warning}`));
    }
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error(`Uncaught exception: ${error.message}`);
  process.exit(1);
});

process.on('unhandledRejection', (error) => {
  console.error(`Unhandled rejection: ${error.message}`);
  process.exit(1);
});

// Run the validator
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { validatePrompt };