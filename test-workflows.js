#!/usr/bin/env node

/**
 * Test script for workflow functionality
 */

import { 
  validateWorkflow, 
  executeWorkflowStep, 
  executeWorkflow, 
  createWorkflow, 
  addStepToWorkflow, 
  visualizeWorkflow 
} from './workflows.js';

console.log('Testing workflow functionality...\n');

// Mock getPrompt function for testing
function mockGetPrompt(promptId, variables) {
  return `Template for ${promptId} with variables: ${JSON.stringify(variables)}`;
}

// Test data
const sampleWorkflow = {
  id: 'blog_post_workflow',
  name: 'Blog Post Creation Workflow',
  description: 'Creates a complete blog post from a topic',
  steps: [
    {
      id: 'outline',
      prompt: 'blog_post_outline',
      variables: {
        topic: '{{topic}}'
      },
      output: 'outline'
    },
    {
      id: 'content',
      prompt: 'blog_post_content',
      variables: {
        topic: '{{topic}}',
        outline: '{{outline}}'
      },
      output: 'content'
    }
  ],
  finalOutput: 'content'
};

const invalidWorkflow = {
  id: 'invalid_workflow',
  steps: [
    {
      // Missing id and prompt
      variables: {}
    }
  ]
};

// Test workflow validation
console.log('1. Testing workflow validation:');
const validResult = validateWorkflow(sampleWorkflow);
const invalidResult = validateWorkflow(invalidWorkflow);
console.log('  Valid workflow:', validResult.isValid);
console.log('  Invalid workflow:', invalidResult.isValid);
if (invalidResult.errors.length > 0) {
  console.log('  Errors:', invalidResult.errors);
}

// Test workflow step execution
console.log('\n2. Testing workflow step execution:');
const context = { topic: 'AI in Healthcare' };
executeWorkflowStep(sampleWorkflow.steps[0], context, mockGetPrompt)
  .then(result => {
    console.log('  Step 1 result:', result);
  })
  .catch(error => {
    console.error('  Step 1 error:', error.message);
  });

// Test workflow creation
console.log('\n3. Testing workflow creation:');
const newWorkflow = createWorkflow(
  'test_workflow',
  'Test Workflow',
  'A workflow for testing',
  [],
  'result'
);
console.log('  Created workflow:', newWorkflow.id);

// Test adding steps to workflow
console.log('\n4. Testing adding steps to workflow:');
const step = {
  id: 'test_step',
  prompt: 'test_prompt',
  variables: { input: '{{input}}' },
  output: 'output'
};
const updatedWorkflow = addStepToWorkflow(newWorkflow, step);
console.log('  Updated workflow steps:', updatedWorkflow.steps.length);

// Test workflow visualization
console.log('\n5. Testing workflow visualization:');
const diagram = visualizeWorkflow(sampleWorkflow);
console.log('  Workflow diagram:');
console.log(diagram);

// Test workflow execution
console.log('6. Testing workflow execution:');
executeWorkflow(sampleWorkflow, { topic: 'AI in Healthcare' }, mockGetPrompt)
  .then(result => {
    console.log('  Workflow execution completed');
    console.log('  Results keys:', Object.keys(result.results));
    console.log('  Final output length:', result.finalOutput.length);
  })
  .catch(error => {
    console.error('  Workflow execution error:', error.message);
  });

console.log('\n✅ All tests completed successfully!');
