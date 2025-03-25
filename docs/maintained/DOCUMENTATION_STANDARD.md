# Documentation Standards

*Last Updated: March 25, 2024*

This document outlines the documentation standards for the Frame project. Following these standards ensures consistency and maintainability across all documentation.

## Table of Contents

- [File Organization](#file-organization)
- [Document Structure](#document-structure)
- [Formatting Guidelines](#formatting-guidelines)
- [Maintenance Process](#maintenance-process)
- [Documentation Types](#documentation-types)

## File Organization

### Directory Structure

Documentation is organized into the following directories:

- `/docs/` - Root directory for all documentation
  - `/docs/consolidated/` - Consolidated guides that combine related topics
  - `/docs/maintained/` - Standards, processes, and other maintained documentation
  - `/docs/archive-consolidated/` - Archived documents that have been consolidated

### Naming Conventions

- Use `UPPER_SNAKE_CASE.md` for technical guides and implementation documents
- Use `lower-kebab-case.md` for user-facing guides and reference documents
- Use descriptive names that indicate the content of the document

## Document Structure

### Standard Document Template

Each document should follow this basic structure:

```markdown
# Document Title

*Last Updated: [Date]*

[Brief introduction/purpose of the document]

## Table of Contents

- [Section 1](#section-1)
- [Section 2](#section-2)
- ...

## Section 1

Content...

## Section 2

Content...

## References

- [Reference 1](url)
- [Reference 2](url)
```

### Required Elements

1. **Title**: Clear, descriptive title at the top of the document
2. **Last Updated**: Date when the document was last meaningfully updated
3. **Introduction**: Brief overview of the document's purpose
4. **Table of Contents**: For documents longer than 3 sections
5. **Headings**: Clear hierarchical structure with proper heading levels
6. **References**: Link to related documentation when applicable

## Formatting Guidelines

### Markdown Conventions

- Use `#` for main title, `##` for sections, `###` for subsections
- Use backticks for inline code (`code`)
- Use code blocks with language specifiers for multi-line code:

````markdown
```typescript
// TypeScript code here
```
````

- Use numbered lists for sequential steps:

```markdown
1. First step
2. Second step
```

- Use bullet points for unordered lists:

```markdown
- Item one
- Item two
```

### Code Examples

- Include language identifier in code blocks
- Add comments to explain complex code sections
- Keep examples concise but complete enough to be useful
- Use realistic variable and function names

### Links and References

- Use relative links for references to other documentation files
- Use absolute links for external references
- Include meaningful link text that describes the destination

## Maintenance Process

### Document Lifecycle

1. **Creation**: New document is created following these standards
2. **Updates**: Document is updated as the codebase evolves
3. **Review**: Regular reviews keep content current
4. **Consolidation**: Related documents may be consolidated over time
5. **Archiving**: Outdated documents are archived with proper notices

### Update Timestamps

- Update the "Last Updated" timestamp whenever meaningful changes are made
- Run `npm run docs:update-timestamps` to automatically update timestamps
- Only update timestamps for files with actual content changes

### Scheduled Maintenance

- Monthly documentation review to identify outdated content
- Quarterly consolidation assessment to reduce documentation sprawl
- Use the docs:maintenance script for regular maintenance:

```bash
npm run docs:maintenance
```

## Documentation Types

### API Documentation

- Document parameters, return values, and error cases
- Include example requests and responses
- Highlight authentication requirements
- Note rate limits or other constraints

### Component Documentation

- Document props/parameters with types and descriptions
- Include usage examples
- Note any side effects or performance considerations
- Document accessibility features

### Guides and Tutorials

- Provide clear step-by-step instructions
- Include screenshots or diagrams where helpful
- Specify prerequisites at the beginning
- Conclude with next steps or related resources

### Architecture Documentation

- Use diagrams to illustrate relationships
- Focus on high-level concepts rather than implementation details
- Document design decisions and trade-offs
- Keep updated when architecture changes

## References

- [Next.js Documentation](https://nextjs.org/docs)
- [GitHub Markdown Guide](https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax) 