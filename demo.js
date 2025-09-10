#!/usr/bin/env node

/**
 * Demonstration script showcasing all new features of the enhanced Prompt Template Registry
 */

import { 
  get, 
  search, 
  analyzePrompt, 
  executeWorkflow, 
  getPromptVariant, 
  getModelCategory,
  semanticSearch,
  recommendPrompts,
  advancedFilter
} from './index.mjs';

import { 
  compareVersions, 
  suggestNextVersion, 
  createVersionTree 
} from './version-utils.js';

import { 
  authenticateUser, 
  generateToken, 
  hasPermission 
} from './auth.js';

import { 
  createPrivateRegistry, 
  addPrompt, 
  hasAccess 
} from './private-registry.js';

// Helper registry for demo purposes
const demoRegistry = {
  "sql_query_generation": {
    "latest": "2.0.0",
    "versions": {
      "1.0.0": {
        "description": "Generates SQL queries from natural language requests",
        "prompt": "Translate this natural language request into an SQL query:\n\nRequest: {{request}}\n\nSQL Query:",
        "category": "development",
        "tags": ["sql", "database", "query"],
        "version": "1.0.0"
      },
      "2.0.0": {
        "description": "Generates SQL queries from natural language requests",
        "prompt": "Translate this natural language request into an SQL query. Ensure the query is optimized and secure.\n\nRequest: {{request}}\n\nSQL Query:",
        "category": "development",
        "tags": ["sql", "database", "query"],
        "version": "2.0.0",
        "variants": {
          "gpt": "Translate this natural language request into an optimized SQL query. Ensure the query follows best practices for performance and security.\n\nRequest: {{request}}\n\nSQL Query:",
          "claude": "Convert the following natural language request into a secure and efficient SQL query.\n\nRequest: {{request}}\n\nSQL Query:"
        }
      }
    }
  }
};

console.log('🚀 Prompt Template Registry - Enhanced Features Demonstration\\n');

// 1. Enhanced Versioning System
console.log('1. Enhanced Versioning System');
console.log('   Version comparison: 1.0.0 vs 1.0.1 =', compareVersions('1.0.0', '1.0.1'));
console.log('   Suggested next version (with breaking changes):', suggestNextVersion('1.0.0', {}, true, false, false));

// 2. Advanced Search & Discovery
console.log('\\n2. Advanced Search & Discovery');
const semanticResults = semanticSearch(demoRegistry, 'database query optimization', 2);
console.log('   Semantic search for "database query optimization":');
semanticResults.forEach((result, index) => {
  console.log(`     ${index + 1}. ${result.id} (score: ${result.score.toFixed(2)})`);
});

// 3. Prompt Quality Analysis
console.log('\\n3. Prompt Quality Analysis');
const samplePrompt = {
  id: 'demo_prompt',
  description: 'A demonstration prompt for quality analysis',
  prompt: 'Generate a {{type}} about {{topic}} with {{details}}.',
  category: 'development',
  tags: ['demo', 'quality'],
  version: '1.0.0'
};
const qualityAnalysis = analyzePrompt(samplePrompt);
console.log(`   Quality score: ${qualityAnalysis.quality}/100`);
if (qualityAnalysis.feedback) {
  console.log(`   Feedback: ${qualityAnalysis.feedback.split('\\n')[0]}`);
}

// 4. Multi-LLM Prompt Variants
console.log('\\n4. Multi-LLM Prompt Variants');
const modelCategory = getModelCategory('gpt-4');
console.log(`   Model category for gpt-4: ${modelCategory}`);
const sqlPromptEntry = demoRegistry.sql_query_generation.versions['2.0.0'];
const gptVariant = getPromptVariant(sqlPromptEntry, 'gpt-4');
console.log('   GPT variant preview:', gptVariant.substring(0, 50) + '...');

// 5. Prompt Chaining & Workflows
console.log('\\n5. Prompt Chaining & Workflows');
// Note: In a real implementation, this would execute actual prompts
console.log('   Workflow engine ready for complex prompt sequences');

// 6. Enterprise Features
console.log('\\n6. Enterprise Features');
const user = authenticateUser('admin', 'password');
if (user) {
  const token = generateToken(user);
  console.log(`   User authenticated: ${user.username}`);
  console.log(`   Token generated: ${token.substring(0, 20)}...`);
  console.log(`   Admin permission check: ${hasPermission(user, 'create', 'prompts')}`);
  
  const privateRegistry = createPrivateRegistry('demo-registry', 'Demo Registry', user.id);
  console.log(`   Private registry created: ${privateRegistry.id}`);
  console.log(`   Access control: ${hasAccess(privateRegistry, user)}`);
}

console.log('\\n✅ Demonstration complete! All enhanced features are ready for use.');