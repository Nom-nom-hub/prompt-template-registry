# 📝 Prompt Template Registry

<p style="text-align: center;">
  <a href="https://www.npmjs.com/package/prompt-registry">
    <img src="https://img.shields.io/npm/v/prompt-registry?style=flat" alt="npm version">
  </a>
  <a href="https://www.npmjs.com/package/prompt-registry">
    <img src="https://img.shields.io/npm/dw/prompt-registry?style=flat" alt="npm downloads">
  </a>
  <a href="https://github.com/Nom-nom-hub/prompt-template-registry/blob/main/LICENSE">
    <img src="https://img.shields.io/github/license/Nom-nom-hub/prompt-template-registry?style=flat" alt="license">
  </a>
  <a href="https://github.com/Nom-nom-hub/prompt-template-registry/stargazers">
    <img src="https://img.shields.io/github/stars/Nom-nom-hub/prompt-template-registry?style=flat" alt="GitHub stars">
  </a>
</p>


## ✨ Overview

The **Prompt Template Registry** is an open-source library that provides a centralized, versioned collection of reusable, high-quality prompt templates for AI development consistency. Developers can install it as an npm package, fetch prompts by name, and integrate them directly into their AI workflows.

This reduces prompt engineering overhead, ensures consistency across applications, and accelerates AI development by offering a community-maintained repository of best-practice prompts.

## 🚀 Installation

Install the package using npm:

```bash
npm install prompt-registry
```

## 🚀 Quick Start

### Import the Library

```javascript
import { get, search } from 'prompt-registry';
```

### Get a Prompt Template

```javascript
// Get a simple prompt
const sqlPrompt = get('sql_query_generation');

// Get a prompt with variables
const emailPrompt = get('email_response_drafting', {
  context: 'Customer is requesting a refund for a product that arrived damaged'
});

console.log(emailPrompt);
// Output: \"Draft a professional email response to this situation: Customer is requesting a refund for a product that arrived damaged\\n\\nEmail Response:\"

// Get a model-specific variant
const gptPrompt = get('code_explanation', {
  code: 'function add(a, b) { return a + b; }'
}, {
  model: 'gpt-4'
});
```

### Search for Prompts

```javascript
// Search by keyword
const sqlPrompts = search('sql');
// Returns: [{id: \"sql_query_generation\", description: \"...\", category: \"development\", tags: [...], version: \"1.0.0\"}]

// Search by category
const creativePrompts = search({ category: 'creative' });

// Search by tags
const dbPrompts = search({ tags: ['database', 'sql'] });

// Advanced search with filters
const filteredPrompts = search({}, {
  category: 'development',
  minVariables: 1,
  maxVariables: 3
});
```

## 🆕 What's New (Version 4.0.0)

Our latest release includes significant enhancements to make the Prompt Template Registry even more powerful:

### Enhanced Versioning System
- Automatic semantic versioning suggestions
- Changelog generation for prompt updates
- Version tree visualization
- Conflict resolution for multi-version prompts

### Advanced Search & Discovery
- Semantic search using text similarity algorithms
- Intelligent prompt recommendations
- Advanced filtering by multiple criteria
- Quality-based sorting

### Prompt Quality Analysis
- Automated quality scoring (0-100)
- Readability metrics
- Best practices checking
- Improvement suggestions

### Multi-LLM Prompt Variants
- Model-specific prompt templates
- Automatic prompt adaptation for different LLMs
- Support for GPT, Claude, Llama, Gemini, and more
- Generic variants for unknown models

### Prompt Chaining & Workflows
- Define complex multi-step workflows
- Chain prompts together with shared context
- Visualize workflow execution
- Reusable workflow templates

### Interactive Playground
- Web-based prompt testing environment
- Variable input forms
- Real-time prompt rendering
- Output copying and sharing

### Enhanced Contribution Tools
- Web-based prompt submission form
- Real-time quality analysis during submission
- Automated validation checks
- Suggestion-based improvements

### Enterprise Features
- Private registries with access control
- Team-based collaboration
- User authentication and permissions
- Registry collections and sharing

### Developer Experience
- VS Code extension with syntax highlighting
- Real-time validation
- Quality analysis integration
- One-click prompt testing

## 📚 API Reference

### `get(id, variables?, options?)`

Retrieves a prompt template by its unique ID and optionally interpolates variables.

#### Parameters

- `id` (string, required): The unique identifier of the prompt template
- `variables` (object, optional): An object containing variable names as keys and their replacement values
- `options` (object, optional): Additional options
  - `model` (string, optional): Specify LLM model for model-specific variants
  - `syncOnMissing` (boolean, optional): Auto-sync if prompt not found locally

#### Return Type

`object` - The rendered prompt template with metadata

#### Examples

```javascript
// Basic usage
const prompt = get('blog_post_outline');

// With variables
const prompt = get('blog_post_outline', {
  topic: 'Artificial Intelligence Ethics'
});

// With model-specific variant
const prompt = get('code_explanation', {
  code: 'function add(a, b) { return a + b; }'
}, {
  model: 'claude-3-opus'
});

// Error case - missing prompt
try {
  const prompt = get('nonexistent_prompt');
} catch (error) {
  console.error(error.message); // \"Prompt 'nonexistent_prompt' not found\"
}
```

### `search(query, options?)`

Searches for prompt templates based on a query string or filter object.

#### Parameters

- `query` (string | object): Either a search string or a filter object
- `options` (object, optional): Additional search options
  - `category` (string, optional): Filter by category
  - `tags` (string[], optional): Filter by tags (AND logic)
  - `minVariables` (number, optional): Minimum number of variables
  - `maxVariables` (number, optional): Maximum number of variables
  - `minLength` (number, optional): Minimum prompt length
  - `maxLength` (number, optional): Maximum prompt length

#### Return Type

`Array<PromptMetadata>` - An array of prompt metadata objects

#### Examples

```javascript
// Search by keyword
const results = search('sql');

// Search by category
const devPrompts = search({ category: 'development' });

// Search with advanced filtering
const filteredPrompts = search({}, {
  category: 'development',
  minVariables: 1,
  maxVariables: 3
});

// Semantic search
import { semanticSearch } from 'prompt-registry';
const semanticResults = semanticSearch(registry, 'database optimization', 5);
```

### `analyzePrompt(promptData)`

Analyzes a prompt and provides quality metrics and improvement suggestions.

#### Parameters

- `promptData` (object): Prompt template data to analyze

#### Return Type

`object` - Quality analysis results

#### Example

```javascript
import { analyzePrompt } from 'prompt-registry';

const promptData = {
  id: 'test_prompt',
  description: 'A test prompt',
  prompt: 'Generate a {{type}} about {{topic}}',
  category: 'development',
  tags: ['test'],
  version: '1.0.0'
};

const analysis = analyzePrompt(promptData);
console.log(`Quality score: ${analysis.quality}/100`);
```

### `executeWorkflow(workflow, context, getPrompt)`

Executes a multi-step prompt workflow.

#### Parameters

- `workflow` (object): Workflow definition
- `context` (object): Initial context variables
- `getPrompt` (function): Function to retrieve prompt templates

#### Return Type

`object` - Workflow execution results

#### Example

```javascript
import { executeWorkflow, createWorkflow } from 'prompt-registry';

const workflow = createWorkflow(
  'blog-post',
  'Blog Post Creation',
  'Creates a complete blog post',
  [
    {
      id: 'outline',
      prompt: 'blog_post_outline',
      variables: { topic: '{{topic}}' },
      output: 'outline'
    },
    {
      id: 'content',
      prompt: 'blog_post_content',
      variables: { topic: '{{topic}}', outline: '{{outline}}' },
      output: 'content'
    }
  ],
  'content'
);

const result = await executeWorkflow(
  workflow,
  { topic: 'AI Ethics' },
  (id, vars) => get(id, vars)
);
```

## 🏗️ Registry Structure

### JSON Schema

Each prompt in the registry follows this structure:

```json
{
  \"id\": \"sql_query_generation\",
  \"description\": \"Generates SQL queries from natural language requests\",
  \"prompt\": \"Translate this natural language request into an SQL query:\\n\\nRequest: {{request}}\\n\\nSQL Query:\",
  \"category\": \"development\",
  \"tags\": [\"sql\", \"database\", \"query\"],
  \"version\": \"1.0.0\",
  \"variants\": {
    \"gpt\": \"Optimize this natural language request into a secure SQL query...\",
    \"claude\": \"Convert the following request into an efficient SQL query...\"
  }
}
```

### Categories

Prompts are organized into the following categories:

- **development**: Code generation, debugging, documentation
- **content**: Writing, blogging, social media
- **customer_service**: Email responses, chatbot interactions, support
- **analysis**: Data analysis, market research, sentiment
- **creative**: Stories, poems, design concepts, recipes
- **education**: Lesson plans, quizzes, explanations

### Tags

Tags provide additional metadata for better discoverability:

- Content-related: `blog`, `writing`, `article`, `social`, `media`
- Code-related: `code`, `debug`, `api`, `sql`, `database`
- Creative: `story`, `poem`, `creative`, `fiction`
- Professional: `email`, `response`, `communication`

### Versioning

Each prompt follows semantic versioning (x.y.z):

- Major version (x): Breaking changes to prompt structure
- Minor version (y): New features or significant improvements
- Patch version (z): Bug fixes or minor adjustments

### Variables

Prompts support dynamic variables using `{{variableName}}` syntax:

- Variables are replaced at runtime using the `variables` object
- Missing variables will throw an error
- Variables can appear multiple times in a prompt
- Empty string values remove the variable placeholder

## 🛠️ Development Tools

### CLI Tools

- **`add-prompt.js`**: Interactive prompt creation tool with version suggestions
- **`validate-prompt.js`**: Enhanced validator with quality analysis
- **`test.mjs`**: Run existing tests to ensure no regressions

### Testing

Run all tests:
```bash
npm test
```

Run specific test suites:
```bash
npm run test:versioning
npm run test:changelog
npm run test:search
npm run test:quality
npm run test:llm
npm run test:workflows
npm run test:enterprise
```

## 🤝 Contributing

We welcome contributions from the community! The **Prompt Template Registry** thrives on community contributions, and we've made it easy for anyone to add new prompts through our streamlined GitHub contribution workflow.

### 🚀 Quick Start: Add a New Prompt

#### Using the Interactive CLI Tool (Recommended)

1. **Clone and install dependencies:**
   ```bash
    git clone https://github.com/Nom-nom-hub/prompt-template-registry.git
    cd prompt-template-registry
   npm install
   ```

2. **Create your prompt interactively:**
   ```bash
   node add-prompt.js
   ```
   Follow the prompts to create a new prompt template. The tool will:
   - Guide you through each field
   - Suggest tags based on category
   - Auto-generate snake_case IDs
   - Validate your prompt as you go
   - Save the prompt as a JSON file

3. **Validate your prompt:**
   ```bash
   node validate-prompt.js your-prompt.json
   ```
   This checks for:
   - Correct schema compliance
   - Unique ID format
   - Category validation
   - Prompt quality analysis
   - Variable naming consistency

4. **Create a feature branch:**
   ```bash
   git checkout -b feature/add-your-prompt-name
   ```

5. **Commit and push:**
   ```bash
   git add your-prompt.json
   git commit -m \"feat: add your-prompt-name prompt template\"
   git push origin feature/add-your-prompt-name
   ```

6. **Create a pull request** using the provided PR template.

### 🌐 Web-based Contribution

1. Visit our [prompt submission page](submit-prompt.html)
2. Fill in the prompt details
3. Get real-time quality analysis
4. Submit directly to GitHub

### 📋 Quality Guidelines

**Prompt Creation:**
- **Original & High-Quality**: Ensure prompts are original, well-tested, and demonstrate best practices
- **Complete Templates**: Provide full, independent prompts (50+ characters) that work without additional context
- **Variable Consistency**: Use clear variable names (`{{topic}}`, `{{context}}`, `{{data}}`) and ensure they're used appropriately
- **Description Accuracy**: Write clear, concise descriptions (10-200 characters) that explain exactly what the prompt does

**Technical Standards:**
- **ID Format**: Use lowercase snake_case (e.g., `blog_post_writer`)
- **Categories**: Choose appropriate category from: `development`, `content`, `customer_service`, `analysis`, `creative`, `education`
- **Tags**: Include 1-5 relevant tags for discoverability (use hyphens for multi-word tags)
- **Versioning**: Always start at `1.0.0` and follow semantic versioning
- **Schema Compliance**: All fields must be present and match required types

**Validation Requirements:**
Before submitting, ensure these pass:
- ✅ No schema validation errors
- ✅ ID follows snake_case format
- ✅ Category is from approved list
- ✅ All variables are properly named
- ✅ Prompt quality score > 70
- ⚠️  Address any warnings when possible

### 🔄 GitHub Contribution Workflow

1. **Fork** → Create your feature branch → **Develop** → **Validate** → **Commit** → **Push** → **Create PR** → **Review** → **Merge**

2. **Use provided templates**:
   - **Issue Template**: For bug reports, feature requests, or general suggestions
   - **PR Template**: For prompt submissions (automatically includes validation checklist)

3. **PR Review Process**:
   - Automated validation checks will run
   - Community review and feedback will be provided
   - Once approved, your prompt becomes part of the registry!

## 🚀 Roadmap

### Phase 1 ✅ **Completed**
- Core registry with JSON structure
- npm package publication
- Basic API (`get()`, `search()` functions)
- 79 prompt templates
- TypeScript definitions

### Phase 2 ✅ **Completed**
- Enhanced versioning with semantic versioning suggestions
- Remote sync with GitHub/CDN updates
- Expanded community contribution workflow
- Registry growth to 100+ prompts
- Enhanced search filters and categories
- VS Code extension
- Web-based playground
- Multi-LLM prompt variants
- Prompt chaining workflows
- Enterprise features

### Phase 3 🔮 **Future**
- A/B testing support for prompt optimization
- Usage analytics and evaluation scores
- Prompt performance benchmarking
- Integration with popular AI frameworks
- Mobile apps for prompt management
- Community voting and ranking system

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

**MIT License**

```
Copyright (c) 2024 Prompt Template Registry Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the \"Software\"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED \"AS IS\", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## 🔗 Links

- [Product Requirements Document](./PRD.md) - Detailed specification and implementation plan
- [GitHub Repository](https://github.com/Nom-nom-hub/prompt-template-registry) - Source code and issues
- [npm Package](https://www.npmjs.com/package/prompt-registry) - Package installation
- [Contributing Guide](CONTRIBUTING.md) - How to contribute to the project

## 📚 API Reference

### `get(id, variables?)`

Retrieves a prompt template by its unique ID and optionally interpolates variables.

#### Parameters

- `id` (string, required): The unique identifier of the prompt template
- `variables` (object, optional): An object containing variable names as keys and their replacement values

#### Return Type

`string` - The rendered prompt template with variables substituted

#### Error Handling

- Throws `Error` if the prompt ID is not found
- Throws `Error` if required variables are missing (detected by `{{variable}}` patterns in the template)

#### Examples

```javascript
// Basic usage
const prompt = get('blog_post_outline');
// Returns the full template text

// With variables
const prompt = get('blog_post_outline', {
  topic: 'Artificial Intelligence Ethics'
});
// Template variables like {{topic}} are replaced with provided values

// Error case - missing prompt
try {
  const prompt = get('nonexistent_prompt');
} catch (error) {
  console.error(error.message); // "Prompt 'nonexistent_prompt' not found"
}

// Error case - missing variable
try {
  const prompt = get('article_writing', {}); // Missing {{topic}} and {{length}}
} catch (error) {
  console.error(error.message); // "Missing variables: topic, length"
}
```

### `search(query)`

Searches for prompt templates based on a query string or filter object.

#### Parameters

- `query` (string | object): Either a search string or a filter object

#### Return Type

`Array<PromptMetadata>` - An array of prompt metadata objects, where each object contains:

```typescript
interface PromptMetadata {
  id: string;
  description: string;
  category: string;
  tags: string[];
  version: string;
}
```

#### Search by String

When `query` is a string, it searches across:
- Prompt IDs
- Descriptions
- Categories
- Tags

The search is case-insensitive and matches partial strings.

```javascript
const results = search('sql');
// Returns all prompts containing "sql" in id, description, category, or tags
```

#### Search by Filter Object

When `query` is an object, it supports the following filters:

- `category` (string, optional): Exact category match
- `tags` (string[], optional): Array of tags - returns prompts that have ALL specified tags
- `id` (string, optional): Exact ID match

```javascript
// Filter by category
const devPrompts = search({ category: 'development' });

// Filter by multiple tags (AND logic)
const sqlPrompts = search({ tags: ['sql', 'database'] });

// Combine filters
const specificPrompt = search({
  category: 'development',
  tags: ['api']
});
```

## 🏗️ Registry Structure

### JSON Schema

Each prompt in the registry follows this structure:

```json
{
  "id": "sql_query_generation",
  "description": "Generates SQL queries from natural language requests",
  "prompt": "Translate this natural language request into an SQL query:\n\nRequest: {{request}}\n\nSQL Query:",
  "category": "development",
  "tags": ["sql", "database", "query"],
  "version": "1.0.0"
}
```

### Categories

Prompts are organized into the following categories:

- **development**: Code generation, debugging, documentation
- **content**: Writing, blogging, social media
- **customer_service**: Email responses, chatbot interactions, support
- **analysis**: Data analysis, market research, sentiment
- **creative**: Stories, poems, design concepts, recipes
- **education**: Lesson plans, quizzes, explanations

### Tags

Tags provide additional metadata for better discoverability:

- Content-related: `blog`, `writing`, `article`, `social`, `media`
- Code-related: `code`, `debug`, `api`, `sql`, `database`
- Creative: `story`, `poem`, `creative`, `fiction`
- Professional: `email`, `response`, `communication`

### Versioning

Each prompt follows semantic versioning (x.y.z):

- Major version (x): Breaking changes to prompt structure
- Minor version (y): New features or significant improvements
- Patch version (z): Bug fixes or minor adjustments

### Variables

Prompts support dynamic variables using `{{variableName}}` syntax:

- Variables are replaced at runtime using the `variables` object
- Missing variables will throw an error
- Variables can appear multiple times in a prompt
- Empty string values remove the variable placeholder

## 🎯 Available Prompts

The registry includes **79** high-quality prompt templates across 6 categories:

| ID | Category | Description |
|----|----------|-------------|
| `sql_query_generation` | development | Generates SQL queries from natural language requests |
| `code_explanation` | development | Provides detailed explanations for given code snippets |
| `bug_fix` | development | Identifies and fixes bugs in provided code |
| `api_documentation` | development | Writes documentation for APIs |
| `code_review` | development | Provides feedback on code submissions |
| `blog_post_outline` | content | Creates an outline for a blog post on a given topic |
| `article_writing` | content | Generates complete articles for specified topics |
| `social_media_post` | content | Creates engaging social media posts |
| `presentation_outline` | content | Creates outlines for presentations |
| `newsletter_content` | content | Generates engaging newsletter content |
| `email_response_drafting` | customer_service | Drafts professional email responses based on context |
| `complaint_resolution` | customer_service | Provides suggestions for resolving customer complaints |
| `chatbot_response` | customer_service | Generates chatbot responses for given queries |
| `data_summary` | analysis | Summarizes key findings from provided data |
| `market_research` | analysis | Conducts basic market research for products |
| `sentiment_analysis` | analysis | Analyzes sentiment in text passages |
| `trend_analysis` | analysis | Identifies trends from data sets |
| `interview_preparation` | analysis | Prepares questions for job interviews |
| `resume_writing` | analysis | Writes professional resumes |
| `creative_story` | creative | Generates creative stories based on genre and opening |
| `poem_generation` | creative | Creates poems on specified themes |
| `logo_description` | creative | Describes logo designs for brands |
| `music_composition` | creative | Suggests music compositions for scenarios |
| `recipe_creation` | creative | Creates recipes for cooking scenarios |
| `lesson_plan_creation` | education | Creates structured lesson plans for subjects |
| `quiz_generation` | education | Generates quiz questions for educational purposes |
| `research_question_generation` | education | Generates research questions for topics |
| `math_problem_solving` | education | Solves and explains mathematical problems |

## 🤝 Contributing

We welcome contributions from the community! The **Prompt Template Registry** thrives on community contributions, and we've made it easy for anyone to add new prompts through our streamlined GitHub contribution workflow.

### 🚀 Quick Start: Add a New Prompt

#### Using the Interactive CLI Tool (Recommended)

1. **Clone and install dependencies:**
   ```bash
    git clone https://github.com/Nom-nom-hub/prompt-template-registry.git
    cd prompt-template-registry
   npm install
   ```

2. **Create your prompt interactively:**
   ```bash
   node add-prompt.js
   ```
   Follow the prompts to create a new prompt template. The tool will:
   - Guide you through each field
   - Suggest tags based on category
   - Auto-generate snake_case IDs
   - Validate your prompt as you go
   - Save the prompt as a JSON file

3. **Validate your prompt:**
   ```bash
   node validate-prompt.js your-prompt.json
   ```
   This checks for:
   - Correct schema compliance
   - Unique ID format
   - Category validation
   - Prompt quality analysis
   - Variable naming consistency

4. **Create a feature branch:**
   ```bash
   git checkout -b feature/add-your-prompt-name
   ```

5. **Commit and push:**
   ```bash
   git add your-prompt.json
   git commit -m "feat: add your-prompt-name prompt template"
   git push origin feature/add-your-prompt-name
   ```

6. **Create a pull request** using the provided PR template.

#### Manual Addition

1. **Fork the repository**
2. **Create a new JSON file** with your prompt data following this schema:
   ```json
   {
     "id": "your_prompt_id",
     "description": "Brief description of what this prompt does",
     "prompt": "Template text with {{variables}} for substitution",
     "category": "development|content|customer_service|analysis|creative|education",
     "tags": ["tag1", "tag2"],
     "version": "1.0.0"
   }
   ```
3. **Validate manually:**
   ```bash
   node validate-prompt.js your-prompt.json
   ```
4. **Add to registry** (optional if using CLI tool):
   ```bash
   # If not using add-prompt.js, manually edit registry.json to include your prompt
   ```

### 📋 Quality Guidelines

**Prompt Creation:**
- **Original & High-Quality**: Ensure prompts are original, well-tested, and demonstrate best practices
- **Complete Templates**: Provide full, independent prompts (50+ characters) that work without additional context
- **Variable Consistency**: Use clear variable names (`{{topic}}`, `{{context}}`, `{{data}}`) and ensure they're used appropriately
- **Description Accuracy**: Write clear, concise descriptions (10-200 characters) that explain exactly what the prompt does

**Technical Standards:**
- **ID Format**: Use lowercase snake_case (e.g., `blog_post_writer`)
- **Categories**: Choose appropriate category from: `development`, `content`, `customer_service`, `analysis`, `creative`, `education`
- **Tags**: Include 1-5 relevant tags for discoverability (use hyphens for multi-word tags)
- **Versioning**: Always start at `1.0.0` and follow semantic versioning
- **Schema Compliance**: All fields must be present and match required types

**Validation Requirements:**
Before submitting, ensure these pass:
- ✅ No schema validation errors
- ✅ ID follows snake_case format
- ✅ Category is from approved list
- ✅ All variables are properly named
- ✅ Prompt quality checks pass
- ⚠️  Address any warnings when possible

### 🔄 GitHub Contribution Workflow

1. **Fork** → Create your feature branch → **Develop** → **Validate** → **Commit** → **Push** → **Create PR** → **Review** → **Merge**

2. **Use provided templates**:
   - **Issue Template**: For bug reports, feature requests, or general suggestions
   - **PR Template**: For prompt submissions (automatically includes validation checklist)

3. **PR Review Process**:
   - Automated validation checks will run
   - Community review and feedback will be provided
   - Once approved, your prompt becomes part of the registry!

### 🛠️ Development Tools

- **`add-prompt.js`**: Interactive prompt creation tool
- **`validate-prompt.js`**: CLI validator for prompt quality assurance
- **`npm test`**: Run existing tests to ensure no regressions

### 📝 Reporting Issues

- **Bug Reports**: Use the Issue template with code examples and error messages
- **Feature Requests**: Describe the use case and benefits clearly
- **General Suggestions**: Include context and reasoning for your proposal

### 🎯 Contribution Impact

Your contributions help build a comprehensive, high-quality collection of prompt templates that benefits the entire AI development community. Each approved prompt:
- Gets distributed via npm package
- Becomes searchable and discoverable
- Helps standardize prompt engineering practices
- Benefits thousands of developers worldwide

Thank you for helping make AI development more efficient and standardized! 🤗

---

*For additional help, see [Contributing Guide](CONTRIBUTING.md) or create a GitHub Discussion.*

## 🚀 Roadmap

### Phase 1 ✅ **Completed**
- Core registry with JSON structure
- npm package publication
- Basic API (`get()`, `search()` functions)
- 79 prompt templates
- TypeScript definitions

### Phase 2 🔄 **In Development**
- Prompt versioning (`summarize@v2` syntax)
- Remote sync with GitHub/CDN updates
- Expanded community contribution workflow
- Registry growth to 100+ prompts
- Enhanced search filters and categories

### Phase 3 🔮 **Future**
- Multi-LLM prompt variants (GPT, Claude, Gemini, Llama)
- A/B testing support for prompt optimization
- Usage analytics and evaluation scores
- VSCode extension for prompt insertion
- Enterprise/private registry support
- Prompt chaining for multi-step workflows

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

**MIT License**

```
Copyright (c) 2024 Prompt Template Registry Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## 🔗 Links

- [GitHub Repository](https://github.com/Nom-nom-hub/prompt-template-registry) - Source code and issues
- [npm Package](https://www.npmjs.com/package/prompt-registry) - Package installation
- [Contributing Guide](CONTRIBUTING.md) - How to contribute to the project