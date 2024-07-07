chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const actions = {
    getProfiles: () => {
      chrome.storage.local.get('profiles', (result) => {
        sendResponse(result.profiles || []);
      });
    },
    updateProfiles: () => {
      console.log('Received updateProfiles request:', request.profiles);
      chrome.storage.local.set({profiles: request.profiles}, () => {
        if (chrome.runtime.lastError) {
          console.error('Error updating profiles:', chrome.runtime.lastError);
          sendResponse({success: false, error: chrome.runtime.lastError});
        } else {
          console.log('Profiles updated successfully in storage');
          sendResponse({success: true});
        }
      });
    },
    iframeLoaded: () => {
      console.log('Iframe reported as loaded');
      // Implement any necessary logic here
    }
  };

  const action = actions[request.action] || actions[request.type];
  if (action) {
    action();
    return true;
  }
});

chrome.action.onClicked.addListener((tab) => {
  chrome.tabs.sendMessage(tab.id, { action: 'toggleUI' });
});