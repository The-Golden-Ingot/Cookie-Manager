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
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getProfiles') {
    chrome.storage.local.get('profiles', (result) => {
      sendResponse(result.profiles || []);
    });
    return true;
  } else if (request.action === 'updateProfiles') {
    chrome.storage.local.set({profiles: request.profiles}, () => {
      sendResponse({success: true});
    });
    return true;
  } else if (request.type === 'iframeLoaded') {
    console.log('Iframe reported as loaded');
    // Implement any necessary logic here
  }
});

// Add this new listener for the extension icon click
chrome.action.onClicked.addListener((tab) => {
  chrome.tabs.sendMessage(tab.id, { action: 'toggleUI' });
});