chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "showWarning") {
      alert("Warning: This tab will close in 5 seconds!");
    }
  });
  