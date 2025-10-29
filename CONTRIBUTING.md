# Contributing to InvoicePro Desktop

Thank you for your interest in contributing to InvoicePro Desktop! We appreciate your help in making this project better.

## Table of Contents
- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [How to Contribute](#how-to-contribute)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Issue Reporting](#issue-reporting)

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for everyone. Please:
- Be respectful and constructive in all communications
- Accept constructive criticism gracefully
- Focus on what's best for the community
- Show empathy towards other community members

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/invoicepro-desktop.git`
3. Add upstream remote: `git remote add upstream https://github.com/JNicometo/Invoicing_app.git`
4. Create a new branch: `git checkout -b feature/your-feature-name`

## Development Setup

### Prerequisites
- Node.js 18+ and npm
- Git
- Basic knowledge of Electron and JavaScript

### Installation
```bash
# Install dependencies
npm install

# Run the application in development mode
npm run dev

# Run tests
npm test

# Run linter
npm run lint
```

### Project Structure
```
invoicepro-desktop/
├── src/
│   ├── main.js          # Electron main process
│   ├── preload.js       # Preload script
│   ├── renderer/        # Renderer process files
│   └── utils/           # Utility functions
├── assets/              # Images, icons, etc.
├── tests/               # Test files
└── package.json
```

## How to Contribute

### Types of Contributions
- **Bug Fixes**: Fix existing issues
- **New Features**: Implement features from the roadmap
- **Documentation**: Improve docs, add examples
- **Tests**: Add or improve test coverage
- **UI/UX**: Enhance user interface and experience

### Before You Start
1. Check existing issues to avoid duplicate work
2. For major changes, open an issue first to discuss
3. Make sure tests pass: `npm test`
4. Ensure code follows our style guide

## Coding Standards

### JavaScript Style Guide
- Use ES6+ features when appropriate
- Use meaningful variable and function names
- Add comments for complex logic
- Follow consistent indentation (2 spaces)
- Use semicolons
- Use single quotes for strings

### Example:
```javascript
// Good
const calculateTotal = (items) => {
  return items.reduce((sum, item) => sum + item.price, 0);
};

// Avoid
function calc(x) {
  var total = 0
  for(var i=0;i<x.length;i++){
    total+=x[i]["price"]
  }
  return total
}
```

### Code Organization
- Keep functions small and focused
- Separate concerns (UI, business logic, data)
- Use modules and avoid global variables
- Follow DRY (Don't Repeat Yourself) principle

### Testing
- Write unit tests for new features
- Maintain at least 70% code coverage
- Test edge cases and error handling
- Use descriptive test names

```javascript
describe('Invoice', () => {
  it('should calculate total including tax', () => {
    // Test implementation
  });
});
```

## Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/) specification:

### Commit Message Format
```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples
```bash
feat(dashboard): add revenue chart widget

fix(invoice): correct tax calculation for international clients

docs(readme): update installation instructions

test(email): add unit tests for email service
```

### Commit Best Practices
- Use present tense ("add feature" not "added feature")
- Use imperative mood ("move cursor to..." not "moves cursor to...")
- Keep subject line under 72 characters
- Reference issues and PRs in the footer

## Pull Request Process

### Before Submitting
1. ✅ Update your fork with the latest upstream changes
2. ✅ Run all tests: `npm test`
3. ✅ Run linter: `npm run lint`
4. ✅ Update documentation if needed
5. ✅ Add tests for new features
6. ✅ Ensure no merge conflicts

### PR Title Format
Use the same format as commit messages:
```
feat(scope): brief description
```

### PR Description Template
- **What**: Describe the changes
- **Why**: Explain the reason for changes
- **How**: Detail implementation approach
- **Testing**: Describe testing done
- **Screenshots**: Add if UI changes
- **Related Issues**: Link related issues

### Example
```markdown
## What
Adds dashboard analytics widget showing monthly revenue trends

## Why
Addresses issue #42 - users requested revenue visualization

## How
- Implemented Chart.js for data visualization
- Added API endpoint for revenue data
- Created reusable chart component

## Testing
- Added unit tests for revenue calculation
- Manually tested with various date ranges
- Verified responsive design

## Screenshots
![Dashboard Screenshot](url)

## Related Issues
Closes #42
```

### Review Process
1. Maintainers will review your PR within 2-3 business days
2. Address any requested changes
3. Once approved, a maintainer will merge your PR
4. Your contribution will be included in the next release

### After Your PR is Merged
- Delete your feature branch
- Update your local repository
- Celebrate your contribution! 🎉

## Issue Reporting

### Before Creating an Issue
- Search existing issues to avoid duplicates
- Use the issue templates provided
- Provide as much detail as possible

### Bug Reports Should Include
- Clear, descriptive title
- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots (if applicable)
- Environment details (OS, Node version, etc.)
- Error messages or logs

### Feature Requests Should Include
- Clear description of the feature
- Use case and benefits
- Proposed implementation (if any)
- Mockups or examples (if applicable)

## Questions?

If you have questions:
- Check the [README.md](README.md)
- Review existing issues and discussions
- Open a new issue with the "question" label

## Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Project documentation

Thank you for contributing to InvoicePro Desktop! 🙏
