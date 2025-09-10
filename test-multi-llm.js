#!/usr/bin/env node

/**
 * Test script for multi-LLM variants functionality
 */

import { 
  getModelCategory, 
  getPromptVariant, 
  createPromptVariant, 
  listPromptVariants, 
  adaptPromptForModel,
  generateAllVariants
} from './multi-llm-variants.js';

console.log('Testing multi-LLM variants functionality...\n');

// Test data
const samplePrompt = {
  id: 'test_prompt',
  description: 'A sample prompt for testing LLM variants',
  prompt: 'Generate a {{type}} about {{topic}}. Make sure to include {{details}}.',
  category: 'development',
  tags: ['test', 'llm'],
  version: '1.0.0'
};

const promptWithVariants = {
  id: 'variant_prompt',
  description: 'A prompt with model-specific variants',
  prompt: 'Explain {{concept}} in simple terms.',
  category: 'education',
  tags: ['education', 'explanation'],
  version: '1.0.0',
  variants: {
    'gpt': 'Explain {{concept}} as if you were teaching a beginner. Use simple language and examples.',
    'claude': 'Please provide a clear explanation of {{concept}} for someone new to the topic.',
    'llama': 'Explain the following concept in simple terms: {{concept}}'
  }
};

// Test model category detection
console.log('1. Testing model category detection:');
const modelsToTest = ['gpt-4', 'claude-3-opus', 'llama-3', 'gemini-pro', 'unknown-model'];
modelsToTest.forEach(model => {
  const category = getModelCategory(model);
  console.log(`  ${model} -> ${category}`);
});

// Test getting prompt variants
console.log('\n2. Testing prompt variant retrieval:');
console.log('  Default prompt:', getPromptVariant(samplePrompt, 'gpt-4'));
console.log('  GPT variant:', getPromptVariant(promptWithVariants, 'gpt-4'));
console.log('  Claude variant:', getPromptVariant(promptWithVariants, 'claude-3-sonnet'));
console.log('  Llama variant:', getPromptVariant(promptWithVariants, 'llama-3'));
console.log('  Unknown model (fallback):', getPromptVariant(promptWithVariants, 'unknown-model'));

// Test creating prompt variants
console.log('\n3. Testing prompt variant creation:');
const updatedPrompt = createPromptVariant(samplePrompt, 'gemini', 'Explain {{topic}} clearly and concisely.');
console.log('  Added Gemini variant:', updatedPrompt.variants.gemini);

// Test listing prompt variants
console.log('\n4. Testing variant listing:');
const variants = listPromptVariants(promptWithVariants);
console.log('  Variants for prompt:', variants);

// Test prompt adaptation
console.log('\n5. Testing prompt adaptation:');
const originalPrompt = 'Generate a summary of the key points.';
const adaptedForGpt = adaptPromptForModel(originalPrompt, 'gpt-4');
const adaptedForClaude = adaptPromptForModel(originalPrompt, 'claude-3-opus');
const adaptedForLlama = adaptPromptForModel(originalPrompt, 'llama-3');
console.log('  Original:', originalPrompt);
console.log('  Adapted for GPT:', adaptedForGpt);
console.log('  Adapted for Claude:', adaptedForClaude);
console.log('  Adapted for Llama:', adaptedForLlama);

// Test generating all variants
console.log('\n6. Testing generation of all variants:');
const promptWithAllVariants = generateAllVariants({...samplePrompt});
const allVariants = listPromptVariants(promptWithAllVariants);
console.log('  Generated variants:', allVariants);
console.log('  GPT variant:', promptWithAllVariants.variants.gpt);
console.log('  Claude variant:', promptWithAllVariants.variants.claude);

console.log('\n✅ All tests completed successfully!');