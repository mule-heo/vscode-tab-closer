import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
  console.log('Congratulations, your extension "tab-closer" is now active!');
  const disposable = vscode.commands.registerCommand(
    "tab-closer.helloWorld",
    () => {
      vscode.window.showInformationMessage("Hello from Tab Closer!");
    }
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {}
