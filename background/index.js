// Background Service Worker
// Runs in the browser background (not inside any webpage).
// Phase 1 role: relay messages between the Side Panel and content/index.js.
// Phase 2 role: call Claude API, manage cache, return semantic annotations.

// ── Message relay ──────────────────────────────────────────────────────
// Side Panel cannot talk to content scripts directly (different environments).
// Every message from the Side Panel comes here first, then gets forwarded
// to the content script running in the active tab.

chrome.runtime.onMessage.addListener((msg, sender) => {
  // Messages that come from a tab (i.e. from content script) are ignored here.
  // We only relay messages that come from the Side Panel or Popup.
  if (sender.tab) return;

  const forwardToActiveTab = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs[0]) return;
      chrome.tabs.sendMessage(tabs[0].id, msg);
    });
  };

  if (msg.type === 'SETTINGS_CHANGED') forwardToActiveTab();
  if (msg.type === 'FOCUS_APPLY')      forwardToActiveTab();
  if (msg.type === 'FOCUS_CLEAR')      forwardToActiveTab();
});

// ── Side Panel opener ──────────────────────────────────────────────────
// Open the Side Panel when the user clicks the extension icon in the toolbar.

chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch(console.error);
