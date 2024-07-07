let uiInjected = false;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'toggleUI') {
    if (!uiInjected) {
      injectUI();
    } else {
      toggleUI();
    }
    sendResponse({ success: true });
  } else if (request.action === 'getCurrentCookies') {
    const cookies = document.cookie.split(';').map(cookie => cookie.trim());
    const domain = window.location.hostname;
    sendResponse({ cookies, domain });
  } else if (request.action === 'applyProfile') {
    applyProfile(request.cookies);
    sendResponse({ success: true });
  } else if (request.action === 'importProfiles') {
    importProfiles();
    sendResponse({ success: true });
  } else if (request.action === 'checkContentScriptReady') {
    sendResponse({ready: true});
  }
  return true; // Keep the message channel open for asynchronous responses
});

function injectUI() {
  const iframe = document.createElement('iframe');
  iframe.src = chrome.runtime.getURL('iframe.html');
  iframe.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    width: 360px;
    height: 600px;
    z-index: 9999;
    border: none;
    border-radius: 10px;
    box-shadow: 0 0 10px rgba(0,0,0,0.5);
  `;
  iframe.id = 'cookie-manager-iframe';
  document.body.appendChild(iframe);
  uiInjected = true;
}

function toggleUI() {
  const iframe = document.getElementById('cookie-manager-iframe');
  if (iframe) {
    iframe.style.display = iframe.style.display === 'none' ? 'block' : 'none';
  }
}

function applyProfile(cookies) {
  // Clear existing cookies
  const existingCookies = document.cookie.split(';');
  for (let i = 0; i < existingCookies.length; i++) {
    const cookie = existingCookies[i];
    const eqPos = cookie.indexOf('=');
    const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
    document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;';
  }

  // Set new cookies
  cookies.forEach(cookie => {
    document.cookie = cookie;
  });

  // Notify the page that cookies have changed
  window.dispatchEvent(new Event('cookiesChanged'));

  // Save UI state before reloading
  chrome.storage.local.set({ uiState: { injected: true } }, () => {
    // Reload the page
    location.reload();
  });
}

function importProfiles() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';

  input.onchange = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const importedProfiles = JSON.parse(e.target.result);
        chrome.storage.local.set({ profiles: importedProfiles }, () => {
          alert('Profiles imported successfully');
        });
      } catch (error) {
        alert('Error importing profiles: ' + error.message);
      }
    };

    reader.readAsText(file);
  };

  input.click();
}

// Listen for messages from the iframe
window.addEventListener('message', (event) => {
  if (event.data.action === 'resize') {
    const iframe = document.getElementById('cookie-manager-iframe');
    if (iframe) {
      iframe.style.height = event.data.height + 'px';
    }
  }
});

// Check and restore UI state
function checkAndRestoreUI() {
  chrome.storage.local.get('uiState', (result) => {
    if (result.uiState && result.uiState.injected) {
      injectUI();
      chrome.storage.local.remove('uiState'); // Clear the state after restoring
    }
  });
}

// Call this function when the content script is first loaded
checkAndRestoreUI();