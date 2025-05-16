# Tab Closer

Tab Closer is a lightweight VS Code extension that automatically closes inactive tabs to help you stay focused and keep your workspace clean.

# Features

Tab Closer offers two powerful features to manage editor tabs:

## 1. Close Tabs by Inactivity

Automatically closes tabs that have been inactive for a configurable amount of time.

## 2. Close Tabs by Count (Least Recently Used)

If the number of open tabs exceeds a specified limit, Tab Closer will close the least recently used (LRU) tab — as long as it has no unsaved changes.

# Requirements

No additional dependencies are required.

# Extension Settings

This extension contributes the following settings:

`tabCloser.inactiveTimeout`: Time in milliseconds after which an inactive tab will be closed.

- Default: 300000 (5 minutes).

`tabCloser.maxTabs`: Maximum number of open tabs. If exceeded, the least recently used tab without unsaved changes will be closed.

- Default: 10.

# Known Issues

Tabs with unsaved changes are never closed — even if inactive or over the tab limit.

Tabs opened by extensions or the terminal panel are not tracked or closed.

# Release Notes

To be updated.
