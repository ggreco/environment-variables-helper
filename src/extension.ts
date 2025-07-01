import * as vscode from 'vscode';

// Store environment variables in memory only - no filesystem traces
const environmentVariables = new Map<string, string>();

export function activate(context: vscode.ExtensionContext) {
    console.log('Environment Variables Helper is now active');

    // Command to set an environment variable
    const setVariableCommand = vscode.commands.registerCommand('rustEnvHelper.setVariable', async () => {
        try {
            const varName = await vscode.window.showInputBox({
                prompt: 'Enter environment variable name',
                placeHolder: 'e.g., RUST_RULEZ',
                validateInput: (value) => {
                    if (!value || value.trim().length === 0) {
                        return 'Variable name cannot be empty';
                    }
                    if (!/^[A-Z_][A-Z0-9_]*$/i.test(value)) {
                        return 'Invalid variable name. Use letters, numbers, and underscores only.';
                    }
                    return null;
                }
            });

            if (!varName) {
                return;
            }

            const varValue = await vscode.window.showInputBox({
                prompt: `Enter value for ${varName}`,
                placeHolder: 'Variable value (input will be hidden)',
                password: true, // Hide the sensitive value
                validateInput: (value) => {
                    if (value === undefined || value === null) {
                        return 'Value cannot be null';
                    }
                    return null;
                }
            });

            if (varValue === undefined) {
                return;
            }

            // Store in memory only
            environmentVariables.set(varName, varValue);
            
            // Set in the current process environment for child processes
            process.env[varName] = varValue;

            vscode.window.showInformationMessage(
                `✅ Environment variable ${varName} set (memory only - no filesystem trace)`
            );

            // Try to restart common language servers to pick up the new environment
            const languageServers = [
                'rust-analyzer.reload', 
                'typescript.restartTsServer', 
                'python.restartLanguageServer',
                'C_Cpp.RestartIntelliSenseEngine',  // Microsoft C/C++ extension
                'clangd.restart',                   // clangd extension
                'ccls.restart'                      // ccls extension
            ];
            let reloadedAny = false;
            
            for (const command of languageServers) {
                try {
                    await vscode.commands.executeCommand(command);
                    reloadedAny = true;
                } catch (error) {
                    // Ignore errors - language server might not be active
                }
            }
            
            if (reloadedAny) {
                vscode.window.showInformationMessage('🔄 Language servers reloaded with new environment');
            } else {
                vscode.window.showInformationMessage('💡 You may need to restart your language server to use the new environment');
            }

        } catch (error) {
            vscode.window.showErrorMessage(`Failed to set environment variable: ${error}`);
        }
    });

    // Command to clear an environment variable
    const clearVariableCommand = vscode.commands.registerCommand('rustEnvHelper.clearVariable', async () => {
        if (environmentVariables.size === 0) {
            vscode.window.showInformationMessage('No environment variables are currently set');
            return;
        }

        const variableNames = Array.from(environmentVariables.keys());
        const selectedVariable = await vscode.window.showQuickPick(variableNames, {
            placeHolder: 'Select variable to clear'
        });

        if (selectedVariable) {
            environmentVariables.delete(selectedVariable);
            delete process.env[selectedVariable];
            
            vscode.window.showInformationMessage(`🗑️ Cleared environment variable: ${selectedVariable}`);
            
            // Try to restart language servers
            const languageServers = [
                'rust-analyzer.reload', 
                'typescript.restartTsServer', 
                'python.restartLanguageServer',
                'C_Cpp.RestartIntelliSenseEngine',  // Microsoft C/C++ extension
                'clangd.restart',                   // clangd extension
                'ccls.restart'                      // ccls extension
            ];
            for (const command of languageServers) {
                try {
                    await vscode.commands.executeCommand(command);
                } catch (error) {
                    // Ignore errors - language server might not be active
                }
            }
        }
    });

    // Command to list currently set variables (names only, not values for security)
    const listVariablesCommand = vscode.commands.registerCommand('rustEnvHelper.listVariables', () => {
        if (environmentVariables.size === 0) {
            vscode.window.showInformationMessage('No environment variables are currently set');
            return;
        }

        const variableNames = Array.from(environmentVariables.keys());
        const message = `Currently set variables:\n${variableNames.map(name => `• ${name}`).join('\n')}`;
        
        vscode.window.showInformationMessage(message);
    });

    // Command to run a test with current environment
    const runTestCommand = vscode.commands.registerCommand('rustEnvHelper.runTestWithEnv', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor');
            return;
        }

        // Try to detect test function name at cursor
        const document = editor.document;
        const position = editor.selection.active;
        const currentLine = document.lineAt(position.line);
        
        let testName = '';
        
        // Look for test patterns in different languages
        for (let i = Math.max(0, position.line - 5); i <= Math.min(document.lineCount - 1, position.line + 5); i++) {
            const line = document.lineAt(i).text;
            
            // Rust: #[test]
            if (line.includes('#[test]')) {
                for (let j = i + 1; j <= Math.min(document.lineCount - 1, i + 3); j++) {
                    const funcLine = document.lineAt(j).text;
                    const match = funcLine.match(/fn\s+(\w+)\s*\(/);
                    if (match) {
                        testName = match[1];
                        break;
                    }
                }
                break;
            }
            
            // JavaScript/TypeScript: test(), it(), describe()
            const jsMatch = line.match(/(?:test|it|describe)\s*\(\s*['"](.*?)['"],/);
            if (jsMatch) {
                testName = jsMatch[1];
                break;
            }
            
            // Python: def test_
            const pyMatch = line.match(/def\s+(test_\w+)\s*\(/);
            if (pyMatch) {
                testName = pyMatch[1];
                break;
            }
            
            // C++: TEST(TestSuite, TestName) or TEST_F(TestFixture, TestName) - Google Test
            const cppGTestMatch = line.match(/TEST(?:_F)?\s*\(\s*(\w+)\s*,\s*(\w+)\s*\)/);
            if (cppGTestMatch) {
                testName = `${cppGTestMatch[1]}.${cppGTestMatch[2]}`;
                break;
            }
            
            // C++: SCENARIO or TEST_CASE - Catch2
            const cppCatch2Match = line.match(/(?:SCENARIO|TEST_CASE)\s*\(\s*"([^"]+)"/);
            if (cppCatch2Match) {
                testName = cppCatch2Match[1];
                break;
            }
        }

        if (!testName) {
            testName = await vscode.window.showInputBox({
                prompt: 'Enter test function name',
                placeHolder: 'e.g., test_environment_variables'
            }) || '';
        }

        if (!testName) {
            return;
        }

        // Create terminal with environment variables
        const terminalEnv: { [key: string]: string|undefined } = { ...process.env };
        
        // Add our custom environment variables
        environmentVariables.forEach((value, key) => {
            terminalEnv[key] = value;
        });

        // Determine the appropriate test command based on file type
        const currentEditor = vscode.window.activeTextEditor;
        let testCommand = '';
        
        if (currentEditor) {
            const fileExtension = currentEditor.document.fileName.split('.').pop()?.toLowerCase();
            
            switch (fileExtension) {
                case 'rs':
                    testCommand = `cargo test ${testName} -- --nocapture`;
                    break;
                case 'js':
                case 'ts':
                    testCommand = `npm test -- --testNamePattern="${testName}"`;
                    break;
                case 'py':
                    testCommand = `python -m pytest -k "${testName}" -v`;
                    break;
                case 'cpp':
                case 'cc':
                case 'cxx':
                case 'c':
                case 'h':
                case 'hpp':
                    // Try common C++ test runners
                    testCommand = `echo "C++ test detected: ${testName}. Try: ./test_executable --gtest_filter=${testName} (gtest) or ctest -R ${testName} (cmake) or make test"`;
                    break;
                default:
                    testCommand = `echo "Test command for ${fileExtension} files not configured. Running: ${testName}"`;
            }
        } else {
            testCommand = `echo "Running test: ${testName}"`;
        }

        const terminal = vscode.window.createTerminal({
            name: `Test: ${testName}`,
            env: terminalEnv,
            cwd: vscode.workspace.workspaceFolders?.[0]?.uri.fsPath
        });

        terminal.sendText(testCommand);
        terminal.show();

        vscode.window.showInformationMessage(
            `🧪 Running test "${testName}" with ${environmentVariables.size} custom environment variable(s)`
        );
    });

    // Register all commands
    context.subscriptions.push(
        setVariableCommand,
        clearVariableCommand,
        listVariablesCommand,
        runTestCommand
    );

    // Clean up environment variables when extension is deactivated
    context.subscriptions.push({
        dispose: () => {
            environmentVariables.forEach((_, key) => {
                delete process.env[key];
            });
            environmentVariables.clear();
        }
    });
} 