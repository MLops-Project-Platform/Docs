---
sidebar_position: 1
---

# Contributing

How to contribute to the MLOps Platform and its documentation.

## Getting Started

### Fork and Clone

```bash
git clone https://github.com/MLops-Project-Platform/[repository].git
cd [repository]
git remote add upstream https://github.com/MLops-Project-Platform/[repository].git
```

### Set Up Development Environment

```bash
# Create virtual environment
python -m venv .venv
source .venv/bin/activate

# Install dev dependencies
pip install -r requirements-dev.txt

# Install pre-commit hooks
pre-commit install
```

## Development Workflow

### Create Feature Branch

```bash
git fetch upstream
git checkout -b feature/your-feature upstream/main
```

### Make Changes

Follow the project's coding standards and conventions.

### Run Tests

```bash
# Run all tests
pytest

# Run specific test
pytest tests/test_feature.py

# With coverage
pytest --cov=src tests/
```

### Commit Changes

```bash
git add .
git commit -m "Add feature description"
```

### Push and Create PR

```bash
git push origin feature/your-feature
```

Create pull request on GitHub with:
- Clear title
- Description of changes
- Link to related issues
- Screenshots if applicable

## Code Standards

### Python

- PEP 8 compliant
- Type hints recommended
- Docstrings for all functions
- Unit tests for new code

### YAML/Config

- Consistent indentation (2 spaces)
- Clear key names
- Document complex configurations

### Documentation

- Clear and concise
- Code examples
- Link to related docs
- Update table of contents

## Testing

### Write Tests

```python
import pytest
from src.feature import my_function

def test_my_function():
    result = my_function(input)
    assert result == expected
```

### Run Tests Locally

```bash
pytest -v
```

## Documentation

### Update Documentation

1. Edit markdown files in `docs/`
2. Follow existing formatting
3. Use clear headings
4. Include examples
5. Update navigation if needed

### Build Locally

```bash
cd Docs
npm install
npm start
# Open http://localhost:3000
```

## Review Process

1. **Automated checks**
   - Tests must pass
   - Code coverage maintained
   - Linting passes

2. **Code review**
   - At least 1 approval needed
   - Address feedback
   - Update based on suggestions

3. **Merge**
   - Squash commits if needed
   - Merge to main
   - Delete feature branch

## Issue Reporting

Use GitHub issues to report bugs or suggest features.

### Bug Report Template

```markdown
**Describe the bug**
Clear description of the issue

**To Reproduce**
Steps to reproduce the behavior

**Expected behavior**
What should happen

**Screenshots**
If applicable

**Environment**
- OS: [e.g., Ubuntu 20.04]
- Python version: 3.9
- Component: mlops-platform
```

## Licensing

By contributing, you agree that your contributions will be licensed under the project's license.

---

Thank you for contributing! 🙏
