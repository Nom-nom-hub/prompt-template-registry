/**
 * Prompt Template Registry - Prompt Chaining and Workflows
 * 
 * Implements prompt chaining and workflow execution capabilities
 */

/**
 * Workflow definition schema
 * 
 * Example workflow:
 * {
 *   "id": "blog_post_workflow",
 *   "name": "Blog Post Creation Workflow",
 *   "description": "Creates a complete blog post from a topic",
 *   "steps": [
 *     {
 *       "id": "outline",
 *       "prompt": "blog_post_outline",
 *       "variables": {
 *         "topic": "{{topic}}"
 *       },
 *       "output": "outline"
 *     },
 *     {
 *       "id": "content",
 *       "prompt": "blog_post_content",
 *       "variables": {
 *         "topic": "{{topic}}",
 *         "outline": "{{outline}}"
 *       },
 *       "output": "content"
 *     }
 *   ],
 *   "finalOutput": "content"
 * }
 */

/**
 * Validates a workflow definition
 * @param {object} workflow - The workflow definition
 * @returns {object} Validation result
 */
export function validateWorkflow(workflow) {
  const errors = [];
  
  // Check required fields
  if (!workflow.id) {
    errors.push('Workflow ID is required');
  }
  
  if (!workflow.name) {
    errors.push('Workflow name is required');
  }
  
  if (!workflow.steps || !Array.isArray(workflow.steps)) {
    errors.push('Workflow steps are required and must be an array');
  }
  
  // Validate each step
  if (workflow.steps) {
    workflow.steps.forEach((step, index) => {
      if (!step.id) {
        errors.push(`Step ${index + 1} is missing an ID`);
      }
      
      if (!step.prompt) {
        errors.push(`Step ${index + 1} is missing a prompt reference`);
      }
      
      if (!step.variables || typeof step.variables !== 'object') {
        errors.push(`Step ${index + 1} is missing variables or variables is not an object`);
      }
    });
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Executes a workflow step
 * @param {object} step - The workflow step definition
 * @param {object} context - The execution context with variables
 * @param {function} getPrompt - Function to retrieve prompt templates
 * @returns {Promise<string>} The result of the step execution
 */
export async function executeWorkflowStep(step, context, getPrompt) {
  // Resolve variables with context
  const resolvedVariables = {};
  for (const [key, value] of Object.entries(step.variables)) {
    // Replace context variables in the value
    let resolvedValue = value;
    for (const [contextKey, contextValue] of Object.entries(context)) {
      resolvedValue = resolvedValue.replace(new RegExp(`\\{\\{${contextKey}\\}\\}`, 'g'), contextValue || '');
    }
    resolvedVariables[key] = resolvedValue;
  }
  
  // Get the prompt template
  const promptTemplate = getPrompt(step.prompt, resolvedVariables);
  
  // In a real implementation, this would call the LLM API
  // For now, we'll simulate the response
  return `Simulated response for prompt "${step.prompt}" with variables: ${JSON.stringify(resolvedVariables)}`;
}

/**
 * Executes a complete workflow
 * @param {object} workflow - The workflow definition
 * @param {object} initialContext - The initial context/variables
 * @param {function} getPrompt - Function to retrieve prompt templates
 * @returns {Promise<object>} The workflow execution result
 */
export async function executeWorkflow(workflow, initialContext = {}, getPrompt) {
  // Validate workflow
  const validation = validateWorkflow(workflow);
  if (!validation.isValid) {
    throw new Error(`Invalid workflow: ${validation.errors.join(', ')}`);
  }
  
  // Initialize context with initial variables
  let context = { ...initialContext };
  const results = {};
  
  // Execute each step
  for (const step of workflow.steps) {
    try {
      const result = await executeWorkflowStep(step, context, getPrompt);
      results[step.id] = result;
      
      // Add result to context for use in subsequent steps
      if (step.output) {
        context[step.output] = result;
      }
    } catch (error) {
      throw new Error(`Error executing step "${step.id}": ${error.message}`);
    }
  }
  
  // Return final result
  const finalOutput = workflow.finalOutput ? context[workflow.finalOutput] : results;
  
  return {
    workflowId: workflow.id,
    results,
    finalOutput
  };
}

/**
 * Creates a workflow definition
 * @param {string} id - Workflow ID
 * @param {string} name - Workflow name
 * @param {string} description - Workflow description
 * @param {Array} steps - Workflow steps
 * @param {string} finalOutput - Key of the final output
 * @returns {object} Workflow definition
 */
export function createWorkflow(id, name, description, steps, finalOutput) {
  return {
    id,
    name,
    description,
    steps,
    finalOutput
  };
}

/**
 * Adds a step to a workflow
 * @param {object} workflow - The workflow definition
 * @param {object} step - The step to add
 * @returns {object} Updated workflow
 */
export function addStepToWorkflow(workflow, step) {
  if (!workflow.steps) {
    workflow.steps = [];
  }
  
  workflow.steps.push(step);
  return workflow;
}

/**
 * Visualizes a workflow as a text diagram
 * @param {object} workflow - The workflow definition
 * @returns {string} Text representation of the workflow
 */
export function visualizeWorkflow(workflow) {
  let diagram = `${workflow.name}\n`;
  diagram += '='.repeat(workflow.name.length) + '\n\n';
  
  if (workflow.description) {
    diagram += `${workflow.description}\n\n`;
  }
  
  workflow.steps.forEach((step, index) => {
    diagram += `${index + 1}. ${step.id}\n`;
    diagram += `   Prompt: ${step.prompt}\n`;
    diagram += `   Variables: ${JSON.stringify(step.variables)}\n`;
    if (step.output) {
      diagram += `   Output: ${step.output}\n`;
    }
    if (index < workflow.steps.length - 1) {
      diagram += `   ↓\n`;
    }
  });
  
  if (workflow.finalOutput) {
    diagram += `\nFinal Output: ${workflow.finalOutput}\n`;
  }
  
  return diagram;
}

export default {
  validateWorkflow,
  executeWorkflowStep,
  executeWorkflow,
  createWorkflow,
  addStepToWorkflow,
  visualizeWorkflow
};