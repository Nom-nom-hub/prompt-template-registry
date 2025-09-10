#!/usr/bin/env node

/**
 * Prompt Template Registry - Version Utilities
 * 
 * Enhanced versioning utilities for the prompt registry
 * Includes version comparison, suggestion, and changelog generation
 */

import fs from 'node:fs';
import path from 'node:path';

/**
 * Compares semantic versions
 * @param {string} a - Version string A
 * @param {string} b - Version string B
 * @returns {number} -1 if a < b, 0 if equal, 1 if a > b
 */
export function compareVersions(a, b) {
  const aParts = a.split('.').map(Number);
  const bParts = b.split('.').map(Number);

  for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
    const aPart = aParts[i] || 0;
    const bPart = bParts[i] || 0;

    if (aPart > bPart) return 1;
    if (aPart < bPart) return -1;
  }

  return 0;
}

/**
 * Suggests next version based on change analysis
 * @param {string} currentVersion - Current version string
 * @param {object} changes - Object describing changes
 * @param {boolean} hasBreakingChanges - Whether there are breaking changes
 * @param {boolean} hasNewFeatures - Whether there are new features
 * @param {boolean} hasBugFixes - Whether there are bug fixes
 * @returns {string} Suggested next version
 */
export function suggestNextVersion(currentVersion, changes = {}, hasBreakingChanges = false, hasNewFeatures = false, hasBugFixes = false) {
  const [major, minor, patch] = currentVersion.split('.').map(Number);
  
  // Default suggestion based on semantic versioning principles
  if (hasBreakingChanges) {
    return `${major + 1}.0.0`;
  } else if (hasNewFeatures) {
    return `${major}.${minor + 1}.0`;
  } else if (hasBugFixes) {
    return `${major}.${minor}.${patch + 1}`;
  }
  
  // If no specific changes identified, default to patch increment
  return `${major}.${minor}.${patch + 1}`;
}

/**
 * Generates a changelog entry for a version
 * @param {string} version - Version string
 * @param {object} changes - Object describing changes
 * @param {string[]} changeTypes - Types of changes (breaking, feature, fix, etc.)
 * @returns {string} Formatted changelog entry
 */
export function generateChangelogEntry(version, changes = {}, changeTypes = []) {
  const timestamp = new Date().toISOString().split('T')[0];
  let changelog = `## [${version}] - ${timestamp}\n`;
  
  if (changeTypes.includes('breaking')) {
    changelog += '### ⚠️ Breaking Changes\n';
    if (changes.breaking) {
      changes.breaking.forEach(change => {
        changelog += `- ${change}\n`;
      });
    } else {
      changelog += '- Major updates to prompt structure\n';
    }
    changelog += '\n';
  }
  
  if (changeTypes.includes('feature')) {
    changelog += '### ✨ New Features\n';
    if (changes.features) {
      changes.features.forEach(change => {
        changelog += `- ${change}\n`;
      });
    } else {
      changelog += '- Added new capabilities\n';
    }
    changelog += '\n';
  }
  
  if (changeTypes.includes('fix')) {
    changelog += '### 🐛 Bug Fixes\n';
    if (changes.fixes) {
      changes.fixes.forEach(change => {
        changelog += `- ${change}\n`;
      });
    } else {
      changelog += '- Resolved identified issues\n';
    }
    changelog += '\n';
  }
  
  return changelog;
}

/**
 * Analyzes changes between prompt versions
 * @param {object} oldPrompt - Old prompt data
 * @param {object} newPrompt - New prompt data
 * @returns {object} Analysis of changes
 */
export function analyzePromptChanges(oldPrompt, newPrompt) {
  const changes = {
    hasBreakingChanges: false,
    hasNewFeatures: false,
    hasBugFixes: false,
    breaking: [],
    features: [],
    fixes: []
  };
  
  // Check for breaking changes (removed variables)
  const oldVariables = extractVariables(oldPrompt.prompt);
  const newVariables = extractVariables(newPrompt.prompt);
  
  const removedVariables = oldVariables.filter(v => !newVariables.includes(v));
  if (removedVariables.length > 0) {
    changes.hasBreakingChanges = true;
    changes.breaking.push(`Removed variables: ${removedVariables.join(', ')}`);
  }
  
  // Check for new features (added variables)
  const addedVariables = newVariables.filter(v => !oldVariables.includes(v));
  if (addedVariables.length > 0) {
    changes.hasNewFeatures = true;
    changes.features.push(`Added new variables: ${addedVariables.join(', ')}`);
  }
  
  // Check for prompt text changes
  if (oldPrompt.prompt !== newPrompt.prompt) {
    // If we didn't identify specific changes, it might be a fix or improvement
    if (!changes.hasBreakingChanges && !changes.hasNewFeatures) {
      changes.hasBugFixes = true;
      changes.fixes.push('Improved prompt clarity and effectiveness');
    }
  }
  
  // Check for category changes (breaking)
  if (oldPrompt.category !== newPrompt.category) {
    changes.hasBreakingChanges = true;
    changes.breaking.push(`Changed category from ${oldPrompt.category} to ${newPrompt.category}`);
  }
  
  // Check for description changes (likely improvements)
  if (oldPrompt.description !== newPrompt.description && !changes.hasBreakingChanges && !changes.hasNewFeatures) {
    changes.hasBugFixes = true;
    changes.fixes.push('Updated description for clarity');
  }
  
  return changes;
}

/**
 * Extracts variables from prompt template
 * @param {string} prompt - The prompt template
 * @returns {string[]} Array of variable names
 */
function extractVariables(prompt) {
  const matches = prompt.match(/\\{\\{([^}]+)\\}\\}/g) || [];
  return matches.map(match => match.slice(2, -2));
}

/**
 * Creates a version tree for a prompt
 * @param {object} promptEntry - Prompt entry from registry
 * @returns {object} Version tree with relationships
 */
export function createVersionTree(promptEntry) {
  const versions = Object.keys(promptEntry.versions).sort((a, b) => compareVersions(a, b));
  const tree = {
    latest: promptEntry.latest,
    versions: {}
  };
  
  versions.forEach(version => {
    tree.versions[version] = {
      ...promptEntry.versions[version],
      previous: null,
      next: null
    };
    
    // Find previous version
    const currentIndex = versions.indexOf(version);
    if (currentIndex > 0) {
      tree.versions[version].previous = versions[currentIndex - 1];
    }
    
    // Find next version
    if (currentIndex < versions.length - 1) {
      tree.versions[version].next = versions[currentIndex + 1];
    }
  });
  
  return tree;
}

export default {
  compareVersions,
  suggestNextVersion,
  generateChangelogEntry,
  analyzePromptChanges,
  createVersionTree
};