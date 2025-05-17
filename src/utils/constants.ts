export const DEFAULT_MAX_TABS = 10;
export const DEFAULT_INACTIVE_TIMEOUT = 300000; // 5 minutes
export const DEFAULT_INACTIVE_CHECK_INTERVAL = 5000; // 5 seconds

export const toggleCommands = [
  {
    command: "tabCloser.toggle",
    configKey: "enabled",
    key: "global",
  },
  {
    command: "tabCloser.toggleCloseInactiveTabs",
    configKey: "inactiveTimeoutEnabled",
    key: "inactiveTimeout",
  },
  {
    command: "tabCloser.toggleCloseLeastRecentlyUsedTabs",
    configKey: "maxTabsEnabled",
    key: "maxTabs",
  },
];
