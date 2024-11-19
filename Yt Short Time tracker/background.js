const WATCH_LIMIT = 5 * 60 * 1000; // 5 minutes in milliseconds
let tabTimers = {};

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tab.url && tab.url.includes("youtube.com/shorts")) {
    if (!tabTimers[tabId]) {
      startTabTimer(tabId);
    }
  } else if (tabTimers[tabId]) {
    clearTimers(tabId);
  }
});

chrome.tabs.onRemoved.addListener((tabId) => {
  if (tabTimers[tabId]) {
    clearTimers(tabId);
  }
});

function startTabTimer(tabId) {
  injectContentScript(tabId).then(() => {
    const warningTimeout = setTimeout(() => {
      chrome.tabs.sendMessage(tabId, { action: "showWarning" });
    }, WATCH_LIMIT - 5000);

    const closeTimeout = setTimeout(() => {
      chrome.tabs.remove(tabId);
      clearTimers(tabId);
    }, WATCH_LIMIT);

    tabTimers[tabId] = { warningTimeout, closeTimeout };
  });
}

function clearTimers(tabId) {
  if (tabTimers[tabId]) {
    clearTimeout(tabTimers[tabId].warningTimeout);
    clearTimeout(tabTimers[tabId].closeTimeout);
    delete tabTimers[tabId];
  }
}

async function injectContentScript(tabId) {
  try {
    await chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ["content.js"],
    });
  } catch (error) {
    console.error("Failed to inject content script:", error);
  }
}
