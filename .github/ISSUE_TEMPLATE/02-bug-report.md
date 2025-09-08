---
name: 🐛 Bug Report
description: Report a bug or issue with the Prompt Template Registry
title: "bug: [brief description]"
labels: bug
---

## 🐛 Bug Report

### Description
**Summary**: A clear and concise description of the bug

**Expected Behavior**: What should happen

**Actual Behavior**: What actually happens

### Steps to Reproduce
1. Step 1
2. Step 2
3. Step 3

### Environment
- **OS**: (e.g., Windows 11, macOS 12.0, Ubuntu 20.04)
- **Node.js Version**: (e.g., v18.17.0)
- **NPM Version**: (run `npm --version`)
- **Package Version**: (e.g., prompt-registry@2.0.0)

### Code Example
```javascript
// If applicable, provide a code snippet demonstrating the issue
import { get, search } from 'prompt-registry';

try {
  const prompt = get('some-nonexistent-prompt');
  console.log(prompt);
} catch (error) {
  console.error('Error:', error.message);
}
```

### Additional Context
- Screenshots/screencasts
- Error logs or stack traces
- Reproduction repository (if available)
- Any other relevant information

### Impact Assessment
**Severity**: (Low/Medium/High/Critical)
- Low: Minor UI issues, edge cases
- Medium: Impacts some functionality, has workarounds
- High: Blocks key functionality, no workarounds
- Critical: Breaks the application, security issues, data loss

**Affected Components**: Core API, CLI tools, documentation, registry data, etc.

### Proposed Solution (Optional)
If you have suggestions on how to fix this, please provide them here.