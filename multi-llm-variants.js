/**
 * Prompt Template Registry - Multi-LLM Variants
 * 
 * Implements support for model-specific prompt variants
 */

// Supported LLM models
const SUPPORTED_MODELS = [
  'gpt-4',
  'gpt-3.5-turbo',
  'claude-3-opus',
  'claude-3-sonnet',
  'claude-3-haiku',
  'llama-3',
  'llama-2',
  'gemini-pro',
  'mistral-large',
  'mixtral'
];

// Model categories
const MODEL_CATEGORIES = {
  'gpt-4': 'gpt',
  'gpt-3.5-turbo': 'gpt',
  'claude-3-opus': 'claude',
  'claude-3-sonnet': 'claude',
  'claude-3-haiku': 'claude',
  'llama-3': 'llama',
  'llama-2': 'llama',
  'gemini-pro': 'gemini',
  'mistral-large': 'mistral',
  'mixtral': 'mistral'
};

/**
 * Gets the category for a model
 * @param {string} model - The model name
 * @returns {string} The model category
 */
export function getModelCategory(model) {
  // First check if it's directly mapped
  if (MODEL_CATEGORIES[model]) {
    return MODEL_CATEGORIES[model];
  }
  
  // Then check if it starts with a known category
  for (const [category, models] of Object.entries({
    'gpt': ['gpt-4', 'gpt-3.5'],
    'claude': ['claude-3', 'claude-2'],
    'llama': ['llama-3', 'llama-2'],
    'gemini': ['gemini'],
    'mistral': ['mistral', 'mixtral']
  })) {
    if (models.some(prefix => model.startsWith(prefix))) {
      return category;
    }
  }
  
  // Default to generic
  return 'generic';
}

/**
 * Gets a prompt variant for a specific model
 * @param {object} promptData - The prompt data
 * @param {string} model - The model name
 * @returns {string} The prompt variant or the default prompt
 */
export function getPromptVariant(promptData, model) {
  // If there are no variants, return the default prompt
  if (!promptData.variants) {
    return promptData.prompt;
  }
  
  // Try to get exact model match
  if (promptData.variants[model]) {
    return promptData.variants[model];
  }
  
  // Try to get category match
  const category = getModelCategory(model);
  if (promptData.variants[category]) {
    return promptData.variants[category];
  }
  
  // Try to get generic match
  if (promptData.variants['generic']) {
    return promptData.variants['generic'];
  }
  
  // Return default prompt
  return promptData.prompt;
}

/**
 * Creates a new prompt variant
 * @param {object} promptData - The prompt data
 * @param {string} model - The model name
 * @param {string} variantPrompt - The variant prompt text
 * @returns {object} Updated prompt data with the new variant
 */
export function createPromptVariant(promptData, model, variantPrompt) {
  // Create variants object if it doesn't exist
  if (!promptData.variants) {
    promptData.variants = {};
  }
  
  // Add the new variant
  promptData.variants[model] = variantPrompt;
  
  return promptData;
}

/**
 * Lists available variants for a prompt
 * @param {object} promptData - The prompt data
 * @returns {Array} Array of available variant models
 */
export function listPromptVariants(promptData) {
  if (!promptData.variants) {
    return [];
  }
  
  return Object.keys(promptData.variants);
}

/**
 * Adapts a prompt for a specific model
 * @param {string} prompt - The original prompt
 * @param {string} model - The target model
 * @returns {string} The adapted prompt
 */
export function adaptPromptForModel(prompt, model) {
  const category = getModelCategory(model);
  
  // Model-specific adaptations
  switch (category) {
    case 'gpt':
      // GPT models prefer direct instructions
      return prompt;
      
    case 'claude':
      // Claude models prefer more conversational tone
      return prompt.replace(/^(Generate|Create|Write)/, 'Please $1');
      
    case 'llama':
      // Llama models prefer explicit instructions
      if (!prompt.toLowerCase().includes('please') && !prompt.toLowerCase().includes('generate')) {
        return "Please " + prompt.charAt(0).toLowerCase() + prompt.slice(1);
      }
      return prompt;
      
    case 'gemini':
      // Gemini models prefer structured prompts
      return prompt;
      
    case 'mistral':
      // Mistral models prefer concise prompts
      return prompt.replace(/\s+/g, ' ').trim();
      
    default:
      return prompt;
  }
}

/**
 * Generates variants for all supported models
 * @param {object} promptData - The prompt data
 * @returns {object} Prompt data with generated variants
 */
export function generateAllVariants(promptData) {
  // Create variants object if it doesn't exist
  if (!promptData.variants) {
    promptData.variants = {};
  }
  
  // Generate variants for each model category
  const categories = [...new Set(Object.values(MODEL_CATEGORIES))];
  
  categories.forEach(category => {
    // Only generate if variant doesn't already exist
    if (!promptData.variants[category]) {
      promptData.variants[category] = adaptPromptForModel(promptData.prompt, category);
    }
  });
  
  return promptData;
}

export default {
  getModelCategory,
  getPromptVariant,
  createPromptVariant,
  listPromptVariants,
  adaptPromptForModel,
  generateAllVariants,
  SUPPORTED_MODELS,
  MODEL_CATEGORIES
};