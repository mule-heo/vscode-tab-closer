import * as vscode from "vscode";

interface TabInfo {
  lastActive: number;
}

const tabMap: Map<string, TabInfo> = new Map();

const MAX_TABS = 10;
const INACTIVE_TIMEOUT = 300000; // 5 minutes
const INACTIVE_CHECK_INTERVAL = 5000; // 5 seconds

export function activate(context: vscode.ExtensionContext) {
  const config = vscode.workspace.getConfiguration("tabCloser");
  let enabled = config.get<boolean>("enabled", true);
  let inactiveTimeout = config.get<number>("inactiveTimeout", INACTIVE_TIMEOUT);
  let maxTabs = config.get<number>("maxTabs", MAX_TABS);

  const toggleCommand = vscode.commands.registerCommand(
    "tabCloser.toggle",
    async () => {
      const config = vscode.workspace.getConfiguration("tabCloser");
      const current = enabled ?? false;
      await config.update(
        "enabled",
        !current,
        vscode.ConfigurationTarget.Global
      );
      enabled = !current;
      vscode.window.showInformationMessage(
        `Tab Closer is now ${enabled ? "enabled" : "disabled"}.`
      );
    }
  );
  context.subscriptions.push(toggleCommand);

  vscode.workspace.onDidChangeConfiguration((e) => {
    if (
      e.affectsConfiguration("tabCloser.enabled") ||
      e.affectsConfiguration("tabCloser.inactiveTimeout") ||
      e.affectsConfiguration("tabCloser.maxTabs")
    ) {
      const updatedConfig = vscode.workspace.getConfiguration("tabCloser");
      enabled = updatedConfig.get<boolean>("enabled", true);
      inactiveTimeout = updatedConfig.get<number>(
        "inactiveTimeout",
        INACTIVE_TIMEOUT
      );
      maxTabs = updatedConfig.get<number>("maxTabs", MAX_TABS);
    }
  });

  vscode.window.onDidChangeActiveTextEditor((editor) => {
    const doc = editor?.document;
    if (doc && doc.uri.scheme === "file") {
      tabMap.set(doc.uri.toString(), { lastActive: Date.now() });
    }
  });

  vscode.workspace.onDidCloseTextDocument((doc) => {
    tabMap.delete(doc.uri.toString());
  });

  const interval = setInterval(() => {
    if (!enabled) {
      return;
    }

    const now = Date.now();

    for (const [uri, info] of tabMap.entries()) {
      if (now - info.lastActive > inactiveTimeout) {
        const editor = vscode.window.visibleTextEditors.find(
          (ed) => ed.document.uri.toString() === uri
        );
        if (editor && !editor.document.isDirty) {
          vscode.commands.executeCommand("workbench.action.closeActiveEditor");
          tabMap.delete(uri);
          return;
        }
      }
    }

    const openTabs = getOpenEditorTabs().map(
      (tab) => tab.input as vscode.TabInputText
    );
    const closableTabs = getLRUClosableTabs();

    vscode.window.showInformationMessage(
      `Open tabs: ${openTabs.length}, Closable tabs: ${closableTabs.length}, Max tabs: ${maxTabs}`
    );
    while (tabMap.size > maxTabs && closableTabs.length > 0) {
      const { tab } = closableTabs.shift()!;
      vscode.window.tabGroups.close(tab);
      tabMap.delete(
        (
          tab as vscode.Tab & { input: vscode.TabInputText }
        ).input.uri.toString()
      );
    }
  }, INACTIVE_CHECK_INTERVAL);

  context.subscriptions.push({ dispose: () => clearInterval(interval) });
}

function getOpenEditorTabs(): vscode.Tab[] {
  return vscode.window.tabGroups.all
    .flatMap((group) => group.tabs)
    .filter(
      (tab) =>
        tab.input instanceof vscode.TabInputText &&
        tab.input.uri.scheme === "file"
    );
}

function getClosableTabs(): vscode.Tab[] {
  return vscode.window.tabGroups.all
    .flatMap((group) => group.tabs)
    .filter(
      (tab): tab is vscode.Tab & { input: vscode.TabInputText } =>
        tab.input instanceof vscode.TabInputText &&
        tab.input.uri.scheme === "file" &&
        !vscode.workspace.textDocuments.find(
          (d) =>
            d.uri.toString() ===
            (
              tab as vscode.Tab & { input: vscode.TabInputText }
            ).input.uri.toString()
        )?.isDirty
    );
}

function getLRUClosableTabs(): { tab: vscode.Tab; lastActive: number }[] {
  return getClosableTabs()
    .map((tab) => ({
      tab,
      lastActive:
        tabMap.get(
          (
            tab as vscode.Tab & { input: vscode.TabInputText }
          ).input.uri.toString()
        )?.lastActive ?? 0,
    }))
    .sort((a, b) => a.lastActive - b.lastActive); // Oldest first
}

export function deactivate() {}
