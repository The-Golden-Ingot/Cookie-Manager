let uiInjected = false;

const actions = {
  toggleUI: handleToggleUI,
  getCurrentCookies: handleGetCurrentCookies,
  applyProfile: handleApplyProfile
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const action = actions[request.action];
  if (action) {
    action(request, sendResponse);
    return true; // Indicates that the response is sent asynchronously
  }
});

function handleToggleUI(request, sendResponse) {
  if (!uiInjected) {
    injectUI();
  } else {
    toggleUI();
  }
  sendResponse({ success: true });
}

function handleGetCurrentCookies(request, sendResponse) {
  const cookies = document.cookie.split(';').map(cookie => cookie.trim());
  const domain = window.location.hostname;
  sendResponse({ cookies, domain });
}

function handleApplyProfile(request, sendResponse) {
  applyProfile(request.cookies);
  sendResponse({ success: true });
}

function injectUI() {
  const iframe = createIframe();
  document.body.appendChild(iframe);
  uiInjected = true;
}

function createIframe() {
  const iframe = document.createElement('iframe');
  iframe.src = chrome.runtime.getURL('iframe.html');
  iframe.id = 'cookie-manager-iframe';
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
  return iframe;
}

function toggleUI() {
  const iframe = document.getElementById('cookie-manager-iframe');
  if (iframe) {
    iframe.style.display = iframe.style.display === 'none' ? 'block' : 'none';
  }
}

function applyProfile(cookies) {
  clearExistingCookies();
  setNewCookies(cookies);
  window.location.reload();
}

function clearExistingCookies() {
  const existingCookies = document.cookie.split(';');
  existingCookies.forEach(cookie => {
    const name = cookie.split('=')[0].trim();
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;`;
  });
}

function setNewCookies(cookies) {
  cookies.forEach(cookie => {
    document.cookie = cookie;
  });
}

window.addEventListener('message', (event) => {
  if (event.data.action === 'resize') {
    const iframe = document.getElementById('cookie-manager-iframe');
    if (iframe) {
      iframe.style.height = `${event.data.height}px`;
    }
  }
});