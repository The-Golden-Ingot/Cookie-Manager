chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get('profiles', (result) => {
    if (!result.profiles) {
      chrome.storage.local.set({
        profiles: [
          { name: 'Personal Profile', cookies: '' },
          { name: 'Work Profile', cookies: '' },
          { name: 'Default Profile', cookies: '' }
        ]
      });
    }
  });

  // Create context menu items for exporting and importing profiles
  chrome.contextMenus.create({
    id: "exportProfiles",
    title: "Export Profiles",
    contexts: ["action"]
  });

  chrome.contextMenus.create({
    id: "importProfiles",
    title: "Import Profiles",
    contexts: ["action"]
  });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getProfiles') {
    chrome.storage.local.get('profiles', (result) => {
      sendResponse(result.profiles || []);
    });
    return true; // Keep the message channel open for asynchronous response
  } else if (request.action === 'updateProfiles') {
    chrome.storage.local.set({profiles: request.profiles}, () => {
      sendResponse({success: true});
    });
    return true; // Keep the message channel open for asynchronous response
  } else if (request.type === 'iframeLoaded') {
    console.log('Iframe reported as loaded');
    sendResponse({received: true}); // Always send a response
    return true; // Keep the message channel open for asynchronous response
  }
});

// Listener for the extension icon click
chrome.action.onClicked.addListener((tab) => {
  if (tab && tab.id) {
    chrome.tabs.sendMessage(tab.id, { action: 'toggleUI' }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('Error sending message:', chrome.runtime.lastError.message);
      } else if (response) {
        console.log('UI toggle message sent successfully');
      }
    });
  } else {
    console.error('Invalid tab or tab ID');
  }
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "exportProfiles") {
    exportProfiles();
  } else if (info.menuItemId === "importProfiles") {
    importProfiles();
  }
});

function exportProfiles() {
  chrome.storage.local.get('profiles', (result) => {
    const profiles = result.profiles || [];
    const jsonString = JSON.stringify(profiles, null, 2);
    
    const dataUrl = 'data:application/json;charset=utf-8,' + encodeURIComponent(jsonString);
    
    chrome.downloads.download({
      url: dataUrl,
      filename: "cookie_profiles.json",
      saveAs: true
    });
  });
}

function importProfiles() {
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    if (tabs[0]) {
      chrome.tabs.sendMessage(tabs[0].id, {action: 'checkContentScriptReady'}, (response) => {
        if (chrome.runtime.lastError) {
          console.error('Content script not ready:', chrome.runtime.lastError.message);
          alert('Please navigate to a web page before importing profiles.');
        } else {
          chrome.tabs.sendMessage(tabs[0].id, {action: 'importProfiles'}, (response) => {
            if (chrome.runtime.lastError) {
              console.error('Error sending message:', chrome.runtime.lastError.message);
            } else if (response && response.success) {
              console.log('Import profiles message sent successfully');
            }
          });
        }
      });
    }
  });
}