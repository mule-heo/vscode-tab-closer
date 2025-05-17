import * as vscode from "vscode";

interface TabInfo {
  lastActive: number;
}

const tabMap: Map<string, TabInfo> = new Map();

export function getTabMap(): Map<string, TabInfo> {
  return tabMap;
}

export function getOpenEditorTabs(): vscode.Tab[] {
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

export function getLRUClosableTabs(): {
  tab: vscode.Tab;
  lastActive: number;
}[] {
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
    .sort((a, b) => a.lastActive - b.lastActive);
}
