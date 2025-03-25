# Testing Strategy

*Last Updated: March 25, 2025*


## Overview

This document outlines the testing strategy for the Frame application. Our testing approach is comprehensive, covering multiple types of tests to ensure the reliability, functionality, and user experience of the application.

## Testing Levels

### Unit Tests

Unit tests verify that individual components and functions work as expected in isolation.

#### Framework and Tools

- **Jest**: Primary testing framework
- **Testing Library**: For testing React components
- **@testing-library/jest-dom**: DOM testing utilities and custom matchers
- **TypeScript Type Definitions**: Using `@types/testing-library__jest-dom` for proper type checking
- **Testing Coverage**: Aim for >80% coverage for critical paths

#### Patterns

- Test pure functions thoroughly
- Mock external dependencies
- Focus on component props, state changes, and event handlers
- Separate rendering logic from business logic for easier testing

#### Key Areas for Unit Testing

- Utility functions in `/src/lib/`
- Service modules in `/src/services/`
- Individual React components in `/src/components/`
- State management logic and reducers

### Test Setup and Configuration

The project uses the following test configuration:

#### Jest Setup File

- Located at `jest.setup.js`
- Imports `@testing-library/jest-dom` for DOM testing utilities
- Sets up mocks for browser APIs (localStorage, vibration, etc.)
- Configures global test environment

#### TypeScript Configuration

- Test files use proper type definitions for Jest matchers
- `@types/testing-library__jest-dom` provides TypeScript definitions for custom DOM matchers
- Custom type declarations for service mocks

### Integration Tests

Integration tests verify that multiple components work together correctly.

#### Framework and Tools

- **Jest** with **Testing Library**
- **Mock Service Worker** for API mocking

#### Patterns

- Test component composition
- Test data flow between components
- Test interactions between services and components
- Mock external APIs but test real internal communication

#### Key Areas for Integration Testing

- Feature flows such as onboarding process
- User interaction sequences
- State management across component boundaries
- Service interactions

### End-to-End Tests

E2E tests verify the application works as expected from a user's perspective.

#### Framework and Tools

- **Playwright**: For browser automation and testing
- Visual regression tests where appropriate

#### Test Scenarios

- Critical user journeys
- Multi-step interactions
- Cross-browser compatibility
- Mobile responsiveness

#### Key Areas for E2E Testing

- Complete user flows (e.g., onboarding, frame:add functionality)
- Frame interaction with Farcaster
- Performance testing for critical paths

## Test Organization

### Directory Structure

```
/
├── __tests__/
│   ├── unit/
│   │   ├── components/
│   │   ├── lib/
│   │   └── services/
│   ├── integration/
│   │   └── features/
│   └── e2e/
│       ├── flows/
│       └── screenshots/
├── __mocks__/
│   ├── services/
│   └── data/
└── playwright/
    ├── tests/
    └── fixtures/
```

### Naming Conventions

- Unit tests: `[filename].test.ts(x)`
- Integration tests: `[feature].integration.test.ts(x)`
- E2E tests: `[user-flow].spec.ts`

## Testing Practices

### Test-Driven Development (TDD)

For critical and complex functionality, we follow TDD:

1. Write tests first
2. Implement functionality to pass tests
3. Refactor while keeping tests passing

### Continuous Integration

All tests run on CI/CD pipeline:

- Unit and integration tests on every PR
- E2E tests on main branch merges
- Visual regression tests on feature branches

### Mocking Strategy

- Use Jest mocks for internal modules
- Use MSW for API mocking
- Create fixture data for consistent test scenarios

## Testing Specific Areas

### Haptic Feedback Testing

- Mock vibration API in unit tests
- Test enable/disable functionality
- Verify correct patterns are triggered for different events

### Animation Testing

- Test animation triggers
- Mock framer-motion where needed
- Verify animation completion callbacks

### Error Handling Testing

- Test ErrorBoundary component
- Verify error recovery paths
- Test async error handling with AsyncErrorHandler

### Performance Testing

- Load time benchmarks
- Interaction responsiveness
- Memory usage monitoring

## Test Maintenance

- Update tests when requirements change
- Review and update mocks regularly
- Treat flaky tests as bugs to be fixed immediately

## Reporting and Monitoring

- Generate coverage reports in CI
- Track test success rates over time
- Document known limitations in test coverage

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright Documentation](https://playwright.dev/docs/intro)

## Changelog

| Version | Date       | Changes                                |
| ------- | ---------- | -------------------------------------- |
| 1.0.0   | YYYY-MM-DD | Initial testing strategy documentation |
