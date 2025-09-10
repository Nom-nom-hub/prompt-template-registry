/**
 * Prompt Template Registry - Prompt Quality Analysis
 * 
 * Implements prompt quality metrics and scoring algorithms
 */

/**
 * Calculates the readability score of a prompt using a simplified Flesch-Kincaid approach
 * @param {string} text - The prompt text
 * @returns {number} Readability score (0-100, higher is more readable)
 */
export function calculateReadability(text) {
  // Remove variable placeholders for readability calculation
  const cleanText = text.replace(/\{\{[^}]+\}\}/g, 'VARIABLE');
  
  // Split into sentences and words
  const sentences = cleanText.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const words = cleanText.split(/\s+/).filter(w => w.length > 0);
  
  if (sentences.length === 0 || words.length === 0) {
    return 0;
  }
  
  // Calculate average sentence length and average word length
  const avgSentenceLength = words.length / sentences.length;
  const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length;
  
  // Simplified readability score (higher is better)
  // Penalize long sentences and long words
  const readability = 100 - (avgSentenceLength * 2) - (avgWordLength * 5);
  
  // Ensure score is between 0 and 100
  return Math.max(0, Math.min(100, readability));
}

/**
 * Counts the number of variables in a prompt
 * @param {string} prompt - The prompt text
 * @returns {number} Number of variables
 */
export function countVariables(prompt) {
  const matches = prompt.match(/\{\{[^}]+\}\}/g);
  return matches ? matches.length : 0;
}

/**
 * Checks if a prompt follows best practices
 * @param {object} promptData - The prompt data
 * @returns {object} Analysis results with checks and suggestions
 */
export function checkBestPractices(promptData) {
  const issues = [];
  const suggestions = [];
  
  // Check prompt length
  if (promptData.prompt.length < 50) {
    issues.push('Prompt is too short (less than 50 characters)');
  } else if (promptData.prompt.length > 2000) {
    suggestions.push('Consider breaking very long prompts into smaller components');
  }
  
  // Check for variables
  const variableCount = countVariables(promptData.prompt);
  if (variableCount === 0) {
    suggestions.push('Consider adding variables to make the prompt more reusable');
  }
  
  // Check description
  if (!promptData.description || promptData.description.length < 10) {
    issues.push('Description is missing or too short');
  } else if (promptData.description.length > 200) {
    suggestions.push('Consider making the description more concise');
  }
  
  // Check category
  const validCategories = ['development', 'content', 'customer_service', 'analysis', 'creative', 'education'];
  if (!promptData.category || !validCategories.includes(promptData.category)) {
    issues.push('Invalid or missing category');
  }
  
  // Check tags
  if (!Array.isArray(promptData.tags) || promptData.tags.length === 0) {
    issues.push('Missing tags');
  } else if (promptData.tags.length > 10) {
    suggestions.push('Consider reducing the number of tags for better focus');
  }
  
  // Check for placeholder text
  const lowerPrompt = promptData.prompt.toLowerCase();
  if (lowerPrompt.includes('todo') || lowerPrompt.includes('placeholder') || 
      lowerPrompt.includes('fill in') || lowerPrompt.includes('replace with')) {
    issues.push('Prompt contains placeholder text that should be replaced');
  }
  
  // Check for clear instructions
  const instructionKeywords = ['generate', 'create', 'write', 'explain', 'describe', 'list', 'summarize', 'analyze'];
  const hasClearInstruction = instructionKeywords.some(keyword => 
    lowerPrompt.includes(keyword)
  );
  
  if (!hasClearInstruction) {
    suggestions.push('Consider adding clearer action words (generate, create, explain, etc.)');
  }
  
  return {
    issues,
    suggestions,
    hasIssues: issues.length > 0,
    hasSuggestions: suggestions.length > 0
  };
}

/**
 * Calculates a quality score for a prompt (0-100)
 * @param {object} promptData - The prompt data
 * @returns {object} Quality score and breakdown
 */
export function calculateQualityScore(promptData) {
  let score = 100;
  const breakdown = {};
  
  // Readability (20% of score)
  const readability = calculateReadability(promptData.prompt);
  breakdown.readability = readability;
  score -= (100 - readability) * 0.2;
  
  // Length appropriateness (10% of score)
  const length = promptData.prompt.length;
  let lengthScore = 100;
  if (length < 50) {
    lengthScore = (length / 50) * 100; // Penalize very short prompts
  } else if (length > 2000) {
    lengthScore = Math.max(0, 100 - ((length - 2000) / 100)); // Penalize very long prompts
  }
  breakdown.length = lengthScore;
  score -= (100 - lengthScore) * 0.1;
  
  // Variable usage (15% of score)
  const variableCount = countVariables(promptData.prompt);
  let variableScore = 0;
  if (variableCount === 0) {
    variableScore = 70; // No variables is acceptable but not ideal
  } else if (variableCount >= 1 && variableCount <= 5) {
    variableScore = 100; // Ideal range
  } else if (variableCount <= 10) {
    variableScore = 80; // Acceptable but many variables
  } else {
    variableScore = 50; // Too many variables
  }
  breakdown.variables = variableScore;
  score -= (100 - variableScore) * 0.15;
  
  // Description quality (15% of score)
  let descriptionScore = 0;
  if (!promptData.description) {
    descriptionScore = 0;
  } else if (promptData.description.length < 10) {
    descriptionScore = 30;
  } else if (promptData.description.length <= 200) {
    descriptionScore = 100;
  } else {
    descriptionScore = 70;
  }
  breakdown.description = descriptionScore;
  score -= (100 - descriptionScore) * 0.15;
  
  // Category and tags (10% of score)
  const validCategories = ['development', 'content', 'customer_service', 'analysis', 'creative', 'education'];
  let categoryTagScore = 0;
  if (validCategories.includes(promptData.category) && 
      Array.isArray(promptData.tags) && promptData.tags.length > 0) {
    categoryTagScore = 100;
  } else if (validCategories.includes(promptData.category) || 
             (Array.isArray(promptData.tags) && promptData.tags.length > 0)) {
    categoryTagScore = 50; // Partially complete
  }
  breakdown.categorization = categoryTagScore;
  score -= (100 - categoryTagScore) * 0.1;
  
  // Best practices (30% of score)
  const bestPractices = checkBestPractices(promptData);
  const practiceScore = 100 - (bestPractices.issues.length * 15) - (bestPractices.suggestions.length * 5);
  breakdown.bestPractices = Math.max(0, practiceScore);
  score -= (100 - Math.max(0, practiceScore)) * 0.3;
  
  // Ensure score is between 0 and 100
  score = Math.max(0, Math.min(100, Math.round(score)));
  
  return {
    score,
    breakdown,
    bestPractices
  };
}

/**
 * Analyzes a prompt and provides detailed feedback
 * @param {object} promptData - The prompt data
 * @returns {object} Detailed analysis
 */
export function analyzePrompt(promptData) {
  const quality = calculateQualityScore(promptData);
  const bestPractices = quality.bestPractices;
  const variables = countVariables(promptData.prompt);
  const readability = calculateReadability(promptData.prompt);
  
  const feedback = [];
  
  if (quality.score >= 90) {
    feedback.push('✅ Excellent quality prompt!');
  } else if (quality.score >= 70) {
    feedback.push('👍 Good quality prompt with minor improvements possible');
  } else if (quality.score >= 50) {
    feedback.push('⚠️ Fair quality prompt - consider the suggestions below');
  } else {
    feedback.push('❌ Poor quality prompt - significant improvements needed');
  }
  
  if (bestPractices.hasIssues) {
    feedback.push('\n_issues found:_');
    bestPractices.issues.forEach(issue => feedback.push(`- ${issue}`));
  }
  
  if (bestPractices.hasSuggestions) {
    feedback.push('\n_suggestions for improvement:_');
    bestPractices.suggestions.forEach(suggestion => feedback.push(`- ${suggestion}`));
  }
  
  return {
    quality: quality.score,
    feedback: feedback.join('\n'),
    metrics: {
      variables,
      readability,
      length: promptData.prompt.length,
      descriptionLength: promptData.description ? promptData.description.length : 0
    },
    breakdown: quality.breakdown
  };
}

export default {
  calculateReadability,
  countVariables,
  checkBestPractices,
  calculateQualityScore,
  analyzePrompt
};