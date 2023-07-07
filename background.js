chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.closeWindow) {
    if (message.is_last == true) {
      chrome.downloads.showDefaultFolder();
    }
    chrome.tabs.remove(sender.tab.id);
  } else {
    chrome.windows.create({ url: "https://certify.stibc.org/" }, () => {});
  }

  sendResponse({ tabId, changeInfo });
});
