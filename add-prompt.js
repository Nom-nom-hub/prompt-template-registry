#!/usr/bin/env node

/**
 * Prompt Template Registry - Add Prompt CLI Tool
 *
 * Interactive tool for adding new prompts to the registry
 * Usage: node add-prompt.js [options]
 */

import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import { validatePrompt } from './validate-prompt.js';

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

const COMMON_TAGS = {
  development: ['code', 'debug', 'api', 'sql', 'database', 'backend', 'frontend'],
  content: ['blog', 'writing', 'article', 'social', 'media', 'marketing', 'copy'],
  customer_service: ['email', 'response', 'communication', 'support', 'help', 'chatbot'],
  analysis: ['data', 'analytics', 'research', 'insights', 'reports', 'statistics'],
  creative: ['story', 'poem', 'art', 'design', 'fiction', 'creative'],
  education: ['lesson', 'teaching', 'quiz', 'learning', 'tutorial', 'study']
};

/**
 * Creates a readline interface
 * @param {object} options - Interface options
 * @returns {readline.Interface} Readline interface
 */
function createInterface(options = {}) {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    ...options
  });
}

/**
 * Prompts user for input with optional default and validation
 * @param {string} question - The question to ask
 * @param {string} defaultValue - Default value
 * @param {function} validator - Validation function
 * @returns {Promise<string>} User response
 */
function ask(question, defaultValue = '', validator = null) {
  return new Promise((resolve, reject) => {
    const rl = createInterface();

    const prompt = defaultValue ? `${question} (${defaultValue}): ` : `${question}: `;
    const suffix = defaultValue ? ` (default: ${defaultValue})` : '';

    rl.question(`${question}? ${suffix}`, (answer) => {
      rl.close();

      const value = answer.trim() || defaultValue;

      if (validator && !validator(value)) {
        console.log('\n❌ Invalid input. Please try again.\n');
        resolve(ask(question, defaultValue, validator));
      } else {
        resolve(value);
      }
    });
  });
}

/**
 * Prompts user for yes/no confirmation
 * @param {string} question - The question to ask
 * @param {boolean} defaultValue - Default value
 * @returns {Promise<boolean>} User response
 */
function confirm(question, defaultValue = false) {
  return new Promise((resolve) => {
    const rl = createInterface();

    const prompt = defaultValue ? ` (Y/n)` : ` (y/N)`;
    const suffix = defaultValue ? 'yes' : 'no';

    rl.question(`${question}${prompt} `, (answer) => {
      rl.close();

      const normalized = answer.trim().toLowerCase();
      if (normalized === '' && defaultValue) {
        resolve(defaultValue);
      } else if (normalized === 'y' || normalized === 'yes') {
        resolve(true);
      } else if (normalized === 'n' || normalized === 'no') {
        resolve(false);
      } else {
        console.log('\nPlease enter "y" for yes or "n" for no.\n');
        resolve(confirm(question, defaultValue));
      }
    });
  });
}

/**
 * Prompts for multiple tags
 * @param {string} category - Selected category to suggest tags
 * @returns {Promise<string[]>} Array of tags
 */
async function askForTags(category) {
  const suggestions = COMMON_TAGS[category] || [];
  const suggestionText = suggestions.length > 0 ? `\nCommon tags for ${category}: ${suggestions.join(', ')}` : '';

  console.log(`\nEnter tags separated by commas:${suggestionText}`);
  const tagsInput = await ask('Tags');

  if (!tagsInput) {
    return [];
  }

  return tagsInput.split(',')
    .map(tag => tag.trim().toLowerCase())
    .filter(tag => tag.length > 0)
    .filter((tag, index, arr) => arr.indexOf(tag) === index); // Remove duplicates
}

/**
 * Generates a unique prompt ID from description
 * @param {string} description - The prompt description
 * @returns {string} Generated ID
 */
function generateId(description) {
  return description
    .toLowerCase()
    .replace(/[^\w\s]/g, '') // Remove special chars
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .replace(/_{2,}/g, '_') // Remove consecutive underscores
    .replace(/^_|_$/g, ''); // Remove leading/trailing underscores
}

/**
 * Main interactive function to collect prompt data
 * @returns {Promise<object>} Collected prompt data
 */
async function collectPromptData() {
  console.log('🚀 Prompt Template Registry - Add New Prompt');
  console.log('===========================================\n');

  // Get prompt ID
  let id;
  const customId = await confirm('Do you have a specific ID for this prompt (leave blank for auto-generated)', false);
  if (customId) {
    id = await ask('Prompt ID (snake_case format)', '', (value) => {
      if (!value) return false;
      return /^[a-z][a-z0-9_]*$/.test(value) && !value.includes('__') && !value.endsWith('_');
    });
  } else {
    const description = await ask('Brief description of what this prompt does');
    id = generateId(description);
    console.log(`🔄 Auto-generated ID: "${id}"`);

    const useGenerated = await confirm('Use this auto-generated ID', true);
    if (!useGenerated) {
      id = await ask('Prompt ID (snake_case format)', '', (value) => {
        if (!value) return false;
        return /^[a-z][a-z0-9_]*$/.test(value) && !value.includes('__') && !value.endsWith('_');
      });
    }
  }

  // Get description
  const description = await ask('Prompt description (brief, clear summary)');

  // Get prompt template
  console.log('\n📝 Enter the prompt template text:');
  console.log('💡 Tip: Use {{variableName}} for variables that will be replaced');
  console.log('💡 Tip: Make it detailed enough to be independently useful\n');
  const prompt = await ask('Prompt template');

  // Get category
  console.log('\n🏷️  Select a category:');
  VALID_CATEGORIES.forEach((cat, index) => {
    const examples = {
      development: 'code generation, debugging',
      content: 'writing, blogging, social media',
      customer_service: 'email responses, chatbot',
      analysis: 'data analysis, market research',
      creative: 'stories, poems, design ideas',
      education: 'lessons, quizzes, explanations'
    };
    console.log(`  ${index + 1}. ${cat} (${examples[cat] || ''})`);
  });

  const categoryIndex = await ask('Category number', '', (value) => {
    const num = parseInt(value);
    return num >= 1 && num <= VALID_CATEGORIES.length;
  });

  const category = VALID_CATEGORIES[parseInt(categoryIndex) - 1];

  // Get tags
  const tags = await askForTags(category);

  // Get version
  const version = await ask('Version (semantic format)', '1.0.0', (value) => {
    return /^[0-9]+\.[0-9]+\.[0-9]+$/.test(value);
  });

  const promptData = {
    id,
    description,
    prompt,
    category,
    tags,
    version
  };

  return promptData;
}

/**
 * Validates prompt data and offers to fix issues
 * @param {object} promptData - The prompt data to validate
 * @returns {Promise<object>} Validated and possibly fixed prompt data
 */
async function validateAndFix(promptData) {
  console.log('\n🔍 Validating prompt...');

  const result = validatePrompt(promptData);

  if (result.isValid) {
    console.log('✅ Prompt data is valid!');
    return promptData;
  }

  console.log('\n❌ Found some issues:');
  result.errors.forEach(error => console.log(`  • ${error}`));

  if (result.warnings.length > 0) {
    console.log('\n⚠️  Warnings:');
    result.warnings.forEach(warning => console.log(`  • ${warning}`));
  }

  const fixIssues = await confirm('Would you like to fix these issues now', true);

  if (!fixIssues) {
    console.log('\nSkipping fixes. You can still save the prompt as JSON.');
    return promptData;
  }

  // Interactive fixes could be added here for complex issues
  console.log('\n🔧 Please review and fix the issues manually.');
  console.log('You can edit the generated JSON file and validate it later.');

  return promptData;
}

/**
 * Saves prompt data to JSON file
 * @param {object} promptData - The prompt data to save
 * @returns {Promise<string>} Path to saved file
 */
async function saveToFile(promptData) {
  const filename = `${promptData.id}.json`;
  const filepath = path.join(process.cwd(), filename);

  try {
    fs.writeFileSync(filepath, JSON.stringify(promptData, null, 2), 'utf8');
    console.log(`💾 Saved prompt to: ${filename}`);
    return filepath;
  } catch (error) {
    console.error(`❌ Failed to save file: ${error.message}`);
    throw error;
  }
}

/**
 * Adds prompt directly to registry.json
 * @param {object} promptData - The prompt data to add
 * @returns {Promise<void>}
 */
async function addToRegistry(promptData) {
  const registryPath = path.join(process.cwd(), 'registry.json');

  try {
    const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));

    // Check for existing prompt
    if (registry[promptData.id]) {
      const overwrite = await confirm(`Prompt "${promptData.id}" already exists. Overwrite`, false);
      if (!overwrite) {
        console.log('❌ Cancelled adding to registry.');
        return;
      }
    }

    // Add the new prompt with version structure
    registry[promptData.id] = {
      latest: promptData.version,
      versions: {
        [promptData.version]: {
          description: promptData.description,
          prompt: promptData.prompt,
          category: promptData.category,
          tags: promptData.tags,
          version: promptData.version
        }
      }
    };

    fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2), 'utf8');
    console.log(`➕ Added "${promptData.id}" to registry.json`);
  } catch (error) {
    console.error(`❌ Failed to add to registry: ${error.message}`);
  }
}

/**
 * Main function
 */
async function main() {
  try {
    const promptData = await collectPromptData();
    const validatedData = await validateAndFix(promptData);

    const savedPath = await saveToFile(validatedData);

    const addToRegistryNow = await confirm('Add this prompt to registry.json now', true);
    if (addToRegistryNow) {
      await addToRegistry(validatedData);
    }

    const validateNow = await confirm('Run validation on the saved file now', true);
    if (validateNow) {
      console.log('\n🔍 Running final validation...');
      const validationProcess = process.spawn('node', ['validate-prompt.js', savedPath], {
        stdio: 'inherit'
      });

      validationProcess.on('close', (code) => {
        if (code === 0) {
          console.log('\n🎉 Success! Your prompt has been created and validated.');
          console.log('You can now submit it via GitHub pull request.');
        } else {
          console.log('\n⚠️  Validation issues found. Please review and fix them before submitting.');
        }
        process.exit(code);
      });
    } else {
      console.log('\n✅ Prompt created successfully!');
      console.log(`📄 File: ${savedPath}`);
      console.log('💡 Run "node validate-prompt.js <filename>" to validate it later.');
      process.exit(0);
    }

  } catch (error) {
    console.error(`\n💥 Error: ${error.message}`);
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

// Print help if requested
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
Prompt Template Registry - Add Prompt Tool v${CLI_VERSION}
Usage: node add-prompt.js [options]

Options:
  -h, --help     Show this help message
  -v, --version  Show version information

This tool will interactively guide you through creating a new prompt template.

Examples:
  node add-prompt.js
  node add-prompt.js --help

The created prompt will be saved as a JSON file and can optionally be added
directly to the registry. Remember to run the validator to ensure quality!
`);
  process.exit(0);
}

if (process.argv.includes('--version') || process.argv.includes('-v')) {
  console.log(`add-prompt.js v${CLI_VERSION}`);
  process.exit(0);
}

// Run the interactive tool
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { generateId, collectPromptData };