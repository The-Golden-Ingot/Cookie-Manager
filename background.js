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
    return true; // Keep the message channel open for asynchronous response
  } else if (request.action === 'updateProfiles') {
    chrome.storage.local.set({profiles: request.profiles}, () => {
      sendResponse({success: true});
    });
    return true; // Keep the message channel open for asynchronous response
  } else if (request.type === 'iframeLoaded') {
    console.log('Iframe reported as loaded');
    // Implement any necessary logic here
    sendResponse({received: true}); // Always send a response
    return true; // Keep the message channel open for asynchronous response
  }
});

// Add this new listener for the extension icon click
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