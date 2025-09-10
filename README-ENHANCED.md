# 📝 Prompt Template Registry

<p align=\"center\">
  <img src=\"https://img.shields.io/npm/v/prompt-registry\" alt=\"npm version\">
  <img src=\"https://img.shields.io/npm/dw/prompt-registry\" alt=\"npm downloads\">
  <img src=\"https://img.shields.io/github/license/Nom-nom-hub/prompt-template-registry\" alt=\"license\">
  <img src=\"https://img.shields.io/github/stars/Nom-nom-hub/prompt-template-registry\" alt=\"GitHub stars\">
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
// Output: \"Draft a professional email response to this situation: Customer is requesting a refund for a product that arrived damaged

Email Response:\"
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
```

## 🆕 What's New (Version 3.0.0)

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
```

### `analyzePrompt(promptData)`

Analyzes a prompt and provides quality metrics and improvement suggestions.

#### Parameters

- `promptData` (object): Prompt template data to analyze

#### Return Type

`object` - Quality analysis results

### `executeWorkflow(workflow, context, getPrompt)`

Executes a multi-step prompt workflow.

#### Parameters

- `workflow` (object): Workflow definition
- `context` (object): Initial context variables
- `getPrompt` (function): Function to retrieve prompt templates

#### Return Type

`object` - Workflow execution results

## 🏗️ Registry Structure

### JSON Schema

Each prompt in the registry follows this structure:

```json
{
  \"id\": \"sql_query_generation\",
  \"description\": \"Generates SQL queries from natural language requests\",
  \"prompt\": \"Translate this natural language request into an SQL query:

Request: {{request}}

SQL Query:\",
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