# Environment Variables Helper

## The Problem

Ever needed to test your code with sensitive environment variables like API keys, database credentials, or authentication tokens? The traditional approaches all have significant drawbacks:

- **`.env` files** - Risk accidental commits to version control, exposing secrets
- **Shell exports** - Persist in shell history and affect other projects
- **IDE configurations** - Often saved in workspace files that can be shared
- **Hard-coding** - Obviously insecure and requires code changes

## The Solution

**Environment Variables Helper** is a VSCode/Cursor extension that provides a **zero-trace** approach to setting environment variables for development and testing. Variables are stored only in memory and automatically injected into your development environment without ever touching the filesystem.

### Why This Extension?

🔐 **Maximum Security**: No traces in files, git history, or shell history  
🚀 **Instant Setup**: Set variables in seconds with a simple UI  
🔄 **Smart Integration**: Automatically restarts language servers to pick up changes  
🌍 **Universal**: Works with any programming language and testing framework  
💾 **Memory-Only**: Variables disappear when VS Code closes - no cleanup needed

![Screenshot](images/image.png)

### See It In Action

The video below demonstrates setting an environment variable and running Rust tests with the new configuration:

![Workflow](images/demo-hq.gif)

*The extension seamlessly integrates with your existing workflow while keeping sensitive data secure.*

## Features

- 🔒 **Secure**: Environment variables stored in memory only - no filesystem traces
- 🌐 **Universal**: Works with any programming language and framework
- 🔄 **Auto-reload**: Automatically restarts language servers when variables are set (Rust, TypeScript, Python, C++)
- 🧪 **Test integration**: Run tests with custom environment variables
- 🎨 **User-friendly**: Password-masked input for sensitive values

## Commands

- **Set Environment Variable** (`Ctrl+Shift+E` / `Cmd+Shift+E`): Set a new environment variable
- **Clear Environment Variable**: Remove a previously set variable
- **List Set Variables**: Show currently set variable names (values hidden for security)
- **Run Test with Environment**: Run a specific test with current environment variables

## Usage

1. **Set an environment variable**:
   - Press `Ctrl+Shift+E` (or `Cmd+Shift+E` on Mac)
   - Or use Command Palette (`Ctrl+Shift+P`) → "Env Helper: Set Environment Variable"
   - Enter variable name (e.g., `API_KEY`, `DATABASE_URL`)
   - Enter value (input will be masked for security)

2. **Run your test**:
   - Use "Env Helper: Run Test with Environment" command
   - Or use the regular "Run test" button (environment variables are inherited)

3. **Clear variables when done**:
   - Use "Env Helper: Clear Environment Variable" command
   - Or restart VSCode/Cursor to clear all variables

## Security Features

- Environment variables are stored only in memory
- No configuration files are modified
- Sensitive values are masked during input
- Variables are automatically cleared when extension is deactivated
- No traces left in filesystem or version control

## Supported Languages

### Language Server Auto-Restart

- **Rust** - `rust-analyzer`
- **TypeScript/JavaScript** - TypeScript language server
- **Python** - Python language server
- **C/C++** - Microsoft C/C++, clangd, ccls

### Test Pattern Detection

- **Rust** - `#[test]` annotations
- **JavaScript/TypeScript** - `test()`, `it()`, `describe()`
- **Python** - `def test_*()` functions
- **C++** - Google Test (`TEST`, `TEST_F`), Catch2 (`TEST_CASE`, `SCENARIO`)

## Perfect for

- Setting API keys and tokens for tests
- Database connection strings
- Feature flags
- Compiler flags and build configurations
- Any sensitive configuration that shouldn't be in files

## Development mode

1. Open the extension folder in VSCode/Cursor
2. Press `F5` to run in development mode
3. Or package and install:

   ```bash
   npm install
   npm run compile
   npm run package
   cursor --install-extension environment-variables-helper-0.0.1.vsix
   ```