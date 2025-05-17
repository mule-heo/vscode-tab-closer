import * as vscode from "vscode";
import { getTabMap, getOpenEditorTabs, getLRUClosableTabs } from "./utils/tabs";
import { toggleCommands } from "./utils/constants";
import {
  DEFAULT_INACTIVE_CHECK_INTERVAL,
  DEFAULT_INACTIVE_TIMEOUT,
  DEFAULT_MAX_TABS,
} from "./utils/constants";

export function activate(context: vscode.ExtensionContext) {
  const tabMap = getTabMap();
  const config = vscode.workspace.getConfiguration("tabCloser");
  const enabled: { [x in string]: boolean } = {
    global: config.get<boolean>("enabled", true),
    inactiveTimeout: config.get<boolean>("inactiveTimeoutEnabled", true),
    maxTabs: config.get<boolean>("maxTabsEnabled", true),
  };

  let inactiveTimeout = config.get<number>(
    "inactiveTimeout",
    DEFAULT_INACTIVE_TIMEOUT
  );
  let maxTabs = config.get<number>("maxTabs", DEFAULT_MAX_TABS);

  const toggleEnabledCommand = ({
    command,
    configKey,
    key,
  }: {
    command: string;
    configKey: string;
    key: string;
  }) => {
    const toggleCommand = vscode.commands.registerCommand(command, async () => {
      const config = vscode.workspace.getConfiguration("tabCloser");
      const current = enabled[key] ?? false;
      await config.update(
        configKey,
        !current,
        vscode.ConfigurationTarget.Global
      );
    });
    context.subscriptions.push(toggleCommand);
  };
  toggleCommands.forEach((command) => {
    toggleEnabledCommand(command);
  });

  // Initialize the tabMap with currently open tabs
  getOpenEditorTabs().forEach((tab) => {
    const uri = (tab.input as vscode.TabInputText).uri.toString();
    tabMap.set(uri, { lastActive: Date.now() });
  });

  vscode.workspace.onDidChangeConfiguration((e) => {
    if (
      e.affectsConfiguration("tabCloser.enabled") ||
      e.affectsConfiguration("tabCloser.inactiveTimeoutEnabled") ||
      e.affectsConfiguration("tabCloser.maxTabsEnabled") ||
      e.affectsConfiguration("tabCloser.inactiveTimeout") ||
      e.affectsConfiguration("tabCloser.maxTabs")
    ) {
      const updatedConfig = vscode.workspace.getConfiguration("tabCloser");
      enabled.global = updatedConfig.get<boolean>("enabled", true);
      enabled.inactiveTimeout = updatedConfig.get<boolean>(
        "inactiveTimeoutEnabled",
        true
      );
      enabled.maxTabs = updatedConfig.get<boolean>("maxTabsEnabled", true);
      inactiveTimeout = updatedConfig.get<number>(
        "inactiveTimeout",
        DEFAULT_INACTIVE_TIMEOUT
      );
      maxTabs = updatedConfig.get<number>("maxTabs", DEFAULT_MAX_TABS);
      closeInactiveTabs();
      closeLeastRecentlyUsedTabs();
    }
  });

  // tab closing handlers
  function closeInactiveTabs() {
    if (!enabled.global || !enabled.inactiveTimeout) {
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
  }
  function closeLeastRecentlyUsedTabs() {
    if (!enabled.global || !enabled.maxTabs) {
      return;
    }

    const closableTabs = getLRUClosableTabs();

    while (tabMap.size > maxTabs && closableTabs.length > 0) {
      const { tab } = closableTabs.shift()!;
      vscode.window.tabGroups.close(tab);
      tabMap.delete(
        (
          tab as vscode.Tab & { input: vscode.TabInputText }
        ).input.uri.toString()
      );
    }
  }
  vscode.commands.registerCommand(
    "tabCloser.closeInactiveTabs",
    closeInactiveTabs
  );
  vscode.commands.registerCommand(
    "tabCloser.closeLeastRecentlyUsedTabs",
    closeLeastRecentlyUsedTabs
  );

  vscode.window.onDidChangeActiveTextEditor((editor) => {
    const doc = editor?.document;
    if (doc && doc.uri.scheme === "file") {
      const isNew = !tabMap.has(doc.uri.toString());
      tabMap.set(doc.uri.toString(), { lastActive: Date.now() });
      if (isNew && enabled.maxTabs) {
        closeLeastRecentlyUsedTabs();
      }
    }
  });

  vscode.workspace.onDidCloseTextDocument((doc) => {
    tabMap.delete(doc.uri.toString());
  });

  const interval = setInterval(() => {
    if (!enabled.global) {
      return;
    }
    if (enabled.inactiveTimeout) {
      closeInactiveTabs();
    }
  }, DEFAULT_INACTIVE_CHECK_INTERVAL);

  context.subscriptions.push({ dispose: () => clearInterval(interval) });
}

export function deactivate() {}
