---
name: 🔧 Prompt Submission Request
description: Request a new prompt template to be added to the registry
title: "feat: add [prompt-name] prompt template"
labels: enhancement, prompt-request
---

## 📝 Prompt Submission Request

### Prompt Details
**Prompt Name/ID**: (e.g., `blog_post_writer`)

**Category**: Choose one from:
- [ ] development (code generation, debugging, documentation)
- [ ] content (writing, blogging, social media)
- [ ] customer_service (email responses, chatbot, support)
- [ ] analysis (data analysis, market research, sentiment)
- [ ] creative (stories, poems, design concepts)
- [ ] education (lesson plans, quizzes, explanations)

**Description**:
_Brief description of what this prompt should do (max 200 characters)_

**Use Case**:
_Describe the specific use case or problem this prompt would solve_

### Requirements Analysis
**Input Variables Needed**:
- Variable 1: purpose/description
- Variable 2: purpose/description
- Variable 3: purpose/description

**Expected Output**: _What should this prompt generate_

**Target Audience**: _Who would use this prompt (developers, content creators, educators, etc.)_

### Validation Requirements
- [ ] Prompts should be original and demonstrate best practices
- [ ] Clear variable naming ({{topic}}, {{context}}, {{data}})
- [ ] Complete templates that work independently
- [ ] Comprehensive descriptions
- [ ] Appropriate tags for discoverability

### Additional Notes
_Any additional context, references, or examples would be helpful_

---

**Tip**: Once approved, you can use our CLI tools to create the prompt:
```bash
node add-prompt.js    # Interactive creation
node validate-prompt.js your-prompt.json  # Quality validation