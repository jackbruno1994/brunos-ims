# Path-Scoped Instructions Template

This directory contains path-scoped instructions that apply to specific parts of the codebase. Each file should follow this format:

## File Structure
```
.github/copilot/path-instructions/
├── apps-web.md          # Instructions for apps/web/**
├── services-api.md      # Instructions for services/api/**
├── packages-shared.md   # Instructions for packages/shared/**
├── packages-ui.md       # Instructions for packages/ui/**
├── db.md               # Instructions for db/**
└── docs.md             # Instructions for docs/**
```

## Template Format
Each instruction file should start with YAML frontmatter specifying the paths it applies to:

```yaml
---
applies_to:
  - "path/pattern/**"
  - "another/path/**"
---

# Component Name — Copilot Instructions

Brief description of what this component does and its role in the system.

## Architecture Guidelines
- Specific architectural patterns for this component
- Design principles to follow
- Integration patterns with other components

## Development Guidelines
- Coding standards specific to this component
- Testing requirements
- Documentation requirements

## Commands
- Component-specific build/test/lint commands
- Development workflow commands

## Examples
- Code examples showing best practices
- Common patterns and anti-patterns

## Constraints
- Specific limitations or requirements
- Dependencies to be aware of
- Performance considerations
```

## Usage
These instructions are automatically applied by GitHub Copilot when working on files within the specified paths. They supplement the repository-wide instructions with component-specific guidance.