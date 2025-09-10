// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const fs = require('fs');
const path = require('path');

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "prompt-registry-vscode" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('prompt-registry.validatePrompt', function () {
		// The code you place here will be executed every time your command is executed

		// Display a message box to the user
		vscode.window.showInformationMessage('Validating prompt template!');
		
		// Get the active text editor
		const editor = vscode.window.activeTextEditor;
		if (editor) {
			const document = editor.document;
			const text = document.getText();
			
			try {
				const promptData = JSON.parse(text);
				// Here you would call your validation logic
				vscode.window.showInformationMessage(`Prompt "${promptData.id}" validation complete!`);
			} catch (error) {
				vscode.window.showErrorMessage(`Invalid JSON: ${error.message}`);
			}
		}
	});

	context.subscriptions.push(disposable);
	
	// Register the quality analysis command
	let qualityDisposable = vscode.commands.registerCommand('prompt-registry.analyzeQuality', function () {
		vscode.window.showInformationMessage('Analyzing prompt quality!');
		
		// Get the active text editor
		const editor = vscode.window.activeTextEditor;
		if (editor) {
			const document = editor.document;
			const text = document.getText();
			
			try {
				const promptData = JSON.parse(text);
				// Here you would call your quality analysis logic
				vscode.window.showInformationMessage(`Quality analysis for "${promptData.id}" complete!`);
			} catch (error) {
				vscode.window.showErrorMessage(`Invalid JSON: ${error.message}`);
			}
		}
	});

	context.subscriptions.push(qualityDisposable);
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}