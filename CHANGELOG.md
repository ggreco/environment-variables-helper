# Change Log

All notable changes to the "Environment Variables Helper" extension will be documented in this file.

## [0.0.2] - 2025-07-01

### Added

- Icon

### Changed

- GIF video is now smaller, and the extension uses less space

## [0.0.1] - 2025-07-01

### Added

- Initial release of Environment Variables Helper
- Set environment variables securely in memory (no filesystem traces)
- Clear environment variables when no longer needed
- List currently set environment variables (names only for security)
- Run tests with custom environment variables
- Auto-restart language servers (Rust, TypeScript, Python, C++)
- Keyboard shortcut: Ctrl+Shift+E (Cmd+Shift+E on Mac)
- Context menu integration
- Support for multiple programming languages:
  - Rust (`#[test]` annotations)
  - JavaScript/TypeScript (`test()`, `it()`, `describe()`)
  - Python (`def test_*()` functions)
  - C++ (Google Test and Catch2 frameworks)
- Password-masked input for sensitive values
- Memory-only storage for security

### Security Features

- Environment variables stored only in memory
- No configuration files are modified
- Sensitive values are masked during input
- Variables automatically cleared when extension is deactivated
- No traces left in filesystem or version control 