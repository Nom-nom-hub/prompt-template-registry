---
name: Pull Request
description: Contribute changes to the Prompt Template Registry
labels: []
---

## 📝 Pull Request

### Type of Change
<!-- What type of change does this PR introduce? -->
- [ ] ✨ **feat**: New feature (prompt addition, new functionality)
- [ ] 🐛 **fix**: Bug fix
- [ ] 📚 **docs**: Documentation update
- [ ] 🔧 **refactor**: Code refactoring
- [ ] 🚀 **perf**: Performance improvement
- [ ] 🧪 **test**: Adding or updating tests
- [ ] 📦 **build**: Build system changes (dependencies, scripts)
- [ ] 🚧 **ci**: CI/CD changes
- [ ] 📄 **chore**: Maintenance (code formatting, etc.)

### Description
<!-- Provide a clear, concise description of your changes -->

### Why This Change?
<!-- Explain the motivation and context behind this change -->

### Changes Made
<!-- List the key changes in this PR -->

-

### Quality Assurance Checklist
<!-- Mark items as completed using [x] -->

**For New Prompt Submissions:**
- [ ] ✅ **Validation Passed**: Ran `node validate-prompt.js <filename>` with no errors
- [ ] 📝 **Schema Compliance**: Follows the registry JSON schema exactly
- [ ] 🆔 **ID Format**: Uses lowercase snake_case (e.g., `blog_post_writer`)
- [ ] 📂 **Category**: Valid category from approved list
- [ ] 🏷️ **Tags**: 1-5 appropriate tags included
- [ ] 📝 **Description**: 10-200 characters, clearly explains purpose
- [ ] 📝 **Prompt Quality**: 50+ characters, complete template, demonstrates best practices
- [ ] 🔗 **Variables**: Clear naming ({{topic}}, {{context}}, etc.), all variables used appropriately
- [ ] 🔢 **Version**: Starts at `1.0.0`, follows semantic versioning
- [ ] ⚠️ **Warnings**: Addressed any validation warnings when possible

**For Code Changes:**
- [ ] ✅ **Tests Pass**: `npm test` passes
- [ ] 📖 **Documentation**: Updated relevant docs if needed
- [ ] 🔧 **TypeScript**: Type definitions updated if applicable
- [ ] 🔒 **Security**: No security vulnerabilities introduced
- [ ] 🚀 **Performance**: No significant performance regressions

**General:**
- [ ] ✅ **Self-Review**: Reviewed own code for errors and standards
- [ ] 🔍 **Breaking Changes**: Confirmed no breaking changes or migration path provided
- [ ] 🎯 **Scope**: Changes are focused and minimal

### Testing
<!-- How have you tested these changes? -->
- [ ] ✅ **Manual Testing**: Successfully tested the following scenarios:
  - Scenario 1: _description_
  - Scenario 2: _description_
  - Scenario 3: _description_

- [ ] 🧪 **Automated Tests**: Added/updated tests for:
  - Test case 1: _description_
  - Test case 2: _description_

### Documentation Updates
<!-- What documentation has been updated? -->
- [ ] 📖 **README**: Updated if new features added
- [ ] 🔧 **Technical Docs**: Updated API docs, guides, etc.
- [ ] 💻 **Code Comments**: Added inline documentation for complex logic
- [ ] 📝 **Changelogs**: Updated CHANGELOG.md if applicable

### Screenshots/Examples
<!-- If applicable, add screenshots or code examples showing the changes -->

### Related Issues
<!-- Link any related GitHub issues this PR addresses -->
- Closes #_issue_number_
- Related to #_issue_number_

### Additional Notes
<!-- Any additional context, considerations, or follow-up required -->

---

**Thank you for contributing to the Prompt Template Registry!** 🧠✨

*This contribution will help standardize and accelerate AI development practices for developers worldwide.*