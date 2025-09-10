#!/usr/bin/env node

/**
 * Prompt Template Registry - Changelog Generator
 * 
 * Generates changelogs for prompt updates
 */

import fs from 'node:fs';
import path from 'node:path';
import { generateChangelogEntry, analyzePromptChanges, compareVersions } from './version-utils.js';

/**
 * Generates a changelog for a prompt update
 * @param {string} promptId - The prompt ID
 * @param {object} oldPrompt - The old prompt data
 * @param {object} newPrompt - The new prompt data
 * @param {string} version - The version being added
 * @returns {string} Formatted changelog entry
 */
export function generatePromptChangelog(promptId, oldPrompt, newPrompt, version) {
  const changes = analyzePromptChanges(oldPrompt, newPrompt);
  const changeTypes = [];
  
  if (changes.hasBreakingChanges) changeTypes.push('breaking');
  if (changes.hasNewFeatures) changeTypes.push('feature');
  if (changes.hasBugFixes) changeTypes.push('fix');
  
  return generateChangelogEntry(version, changes, changeTypes);
}

/**
 * Updates the main changelog file with a new entry
 * @param {string} changelogEntry - The changelog entry to add
 */
export function updateMainChangelog(changelogEntry) {
  const changelogPath = path.join(process.cwd(), 'CHANGELOG.md');
  let changelogContent = '';
  
  // Read existing changelog if it exists
  if (fs.existsSync(changelogPath)) {
    changelogContent = fs.readFileSync(changelogPath, 'utf8');
  }
  
  // If this is a new changelog, add header
  if (!changelogContent) {
    changelogContent = '# Changelog\n\nAll notable changes to prompt templates will be documented in this file.\n\n';
  }
  
  // Insert new entry after the header
  const lines = changelogContent.split('\n');
  const headerEndIndex = lines.findIndex(line => line.startsWith('## [')) || 3;
  
  // Insert the new entry
  lines.splice(headerEndIndex, 0, '\n' + changelogEntry);
  
  // Write back to file
  fs.writeFileSync(changelogPath, lines.join('\n'), 'utf8');
}

/**
 * Generates a version tree visualization for a prompt
 * @param {object} promptEntry - Prompt entry from registry
 * @returns {string} ASCII tree representation
 */
export function generateVersionTree(promptEntry) {
  const versions = Object.keys(promptEntry.versions).sort((a, b) => compareVersions(a, b));
  let tree = `Version tree for ${Object.keys(promptEntry.versions)[0].split('@')[0]}:\n`;
  
  versions.forEach((version, index) => {
    const isLatest = version === promptEntry.latest;
    const prefix = index === versions.length - 1 ? '└── ' : '├── ';
    tree += `${prefix}${version}${isLatest ? ' (latest)' : ''}\n`;
  });
  
  return tree;
}

export default {
  generatePromptChangelog,
  updateMainChangelog,
  generateVersionTree
};