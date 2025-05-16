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

`tabCloser.enabled`: Determines whether the Tab Closer extension is active. When set to `true`, the extension will automatically close tabs based on the configured rules. Set to `false` to disable all automatic tab closing functionality.

`tabCloser.inactiveTimeout`: Time in milliseconds after which an inactive tab will be closed.

- Default: 300000 (5 minutes).

`tabCloser.maxTabs`: Maximum number of open tabs. If exceeded, the least recently used tab without unsaved changes will be closed.

- Default: 10.

## How to Customize Settings

To customize these settings:

1. Open Command Palette (Ctrl+Shift+P or Cmd+Shift+P on macOS).
2. Type and select Preferences: Open Settings (JSON).
3. Add or modify the tabCloser settings like this:

```json
{
  "tabCloser.enabled": true,
  "tabCloser.inactiveTimeout": 600000,
  "tabCloser.maxTabs": 15
}
```

Save the file to apply your custom configuration.

# License

MIT License
