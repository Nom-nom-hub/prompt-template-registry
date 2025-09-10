/**
 * Prompt Template Registry - Advanced Search
 * 
 * Implements advanced search capabilities including semantic search and recommendations
 */

/**
 * Calculates text similarity using a simple approach
 * @param {string} text1 - First text
 * @param {string} text2 - Second text
 * @returns {number} Similarity score between 0 and 1
 */
export function calculateSimilarity(text1, text2) {
  // Convert to lowercase and remove punctuation
  const clean1 = text1.toLowerCase().replace(/[^\w\s]/g, '');
  const clean2 = text2.toLowerCase().replace(/[^\w\s]/g, '');
  
  // Split into words
  const words1 = clean1.split(/\s+/);
  const words2 = clean2.split(/\s+/);
  
  // Calculate Jaccard similarity
  const set1 = new Set(words1);
  const set2 = new Set(words2);
  
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  
  return union.size === 0 ? 0 : intersection.size / union.size;
}

/**
 * Extracts keywords from text
 * @param {string} text - Input text
 * @returns {string[]} Array of keywords
 */
export function extractKeywords(text) {
  // Convert to lowercase and remove punctuation
  const cleanText = text.toLowerCase().replace(/[^\w\s]/g, '');
  
  // Split into words and filter common stop words
  const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those']);
  
  return cleanText.split(/\s+/).filter(word => word.length > 2 && !stopWords.has(word));
}

/**
 * Performs semantic search on prompts
 * @param {object} registry - The prompt registry
 * @param {string} query - Search query
 * @param {number} limit - Maximum number of results to return
 * @returns {Array} Array of matching prompts with similarity scores
 */
export function semanticSearch(registry, query, limit = 10) {
  const results = [];
  
  // Extract keywords from query
  const queryKeywords = extractKeywords(query);
  const queryText = query.toLowerCase();
  
  // Score each prompt
  for (const [id, promptEntry] of Object.entries(registry)) {
    const latestVersion = promptEntry.versions[promptEntry.latest];
    
    // Create a combined text for comparison
    const combinedText = `
      ${latestVersion.description} 
      ${latestVersion.prompt} 
      ${latestVersion.category} 
      ${latestVersion.tags.join(' ')}
    `.toLowerCase();
    
    // Calculate similarity score
    const similarity = calculateSimilarity(query, combinedText);
    
    // Bonus for exact keyword matches
    let bonus = 0;
    const promptKeywords = extractKeywords(combinedText);
    const matchingKeywords = queryKeywords.filter(keyword => 
      promptKeywords.includes(keyword)
    );
    
    if (matchingKeywords.length > 0) {
      bonus = matchingKeywords.length / queryKeywords.length * 0.5;
    }
    
    const finalScore = similarity + bonus;
    
    if (finalScore > 0.1) { // Only include results with some relevance
      results.push({
        id,
        description: latestVersion.description,
        category: latestVersion.category,
        tags: latestVersion.tags,
        version: latestVersion.version,
        score: finalScore
      });
    }
  }
  
  // Sort by score (descending) and limit results
  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/**
 * Generates prompt recommendations based on a given prompt
 * @param {object} registry - The prompt registry
 * @param {string} promptId - ID of the prompt to find recommendations for
 * @param {number} limit - Maximum number of recommendations to return
 * @returns {Array} Array of recommended prompts
 */
export function recommendPrompts(registry, promptId, limit = 5) {
  // Check if prompt exists
  if (!registry[promptId]) {
    return [];
  }
  
  const targetPrompt = registry[promptId].versions[registry[promptId].latest];
  const targetCategory = targetPrompt.category;
  const targetTags = targetPrompt.tags;
  
  const recommendations = [];
  
  // Find prompts in the same category or with similar tags
  for (const [id, promptEntry] of Object.entries(registry)) {
    // Skip the prompt we're finding recommendations for
    if (id === promptId) continue;
    
    const latestVersion = promptEntry.versions[promptEntry.latest];
    const categoryMatch = latestVersion.category === targetCategory ? 1 : 0;
    
    // Calculate tag similarity
    const commonTags = targetTags.filter(tag => latestVersion.tags.includes(tag));
    const tagSimilarity = commonTags.length / Math.max(targetTags.length, latestVersion.tags.length);
    
    // Combined score
    const score = categoryMatch * 0.5 + tagSimilarity * 0.5;
    
    if (score > 0.1) { // Only include relevant recommendations
      recommendations.push({
        id,
        description: latestVersion.description,
        category: latestVersion.category,
        tags: latestVersion.tags,
        version: latestVersion.version,
        score
      });
    }
  }
  
  // Sort by score (descending) and limit results
  return recommendations
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/**
 * Filters prompts based on advanced criteria
 * @param {object} registry - The prompt registry
 * @param {object} filters - Filter criteria
 * @returns {Array} Array of filtered prompts
 */
export function advancedFilter(registry, filters) {
  const results = [];
  
  for (const [id, promptEntry] of Object.entries(registry)) {
    const latestVersion = promptEntry.versions[promptEntry.latest];
    
    let matches = true;
    
    // Category filter
    if (filters.category && latestVersion.category !== filters.category) {
      matches = false;
    }
    
    // Tags filter (AND logic - all specified tags must be present)
    if (filters.tags && Array.isArray(filters.tags)) {
      const hasAllTags = filters.tags.every(tag => latestVersion.tags.includes(tag));
      if (!hasAllTags) {
        matches = false;
      }
    }
    
    // Variable count filter
    if (filters.minVariables !== undefined || filters.maxVariables !== undefined) {
      const variableCount = (latestVersion.prompt.match(/\{\{([^}]+)\}\}/g) || []).length;
      
      if (filters.minVariables !== undefined && variableCount < filters.minVariables) {
        matches = false;
      }
      
      if (filters.maxVariables !== undefined && variableCount > filters.maxVariables) {
        matches = false;
      }
    }
    
    // Prompt length filter
    if (filters.minLength !== undefined && latestVersion.prompt.length < filters.minLength) {
      matches = false;
    }
    
    if (filters.maxLength !== undefined && latestVersion.prompt.length > filters.maxLength) {
      matches = false;
    }
    
    if (matches) {
      results.push({
        id,
        description: latestVersion.description,
        category: latestVersion.category,
        tags: latestVersion.tags,
        version: latestVersion.version
      });
    }
  }
  
  return results;
}

export default {
  calculateSimilarity,
  extractKeywords,
  semanticSearch,
  recommendPrompts,
  advancedFilter
};