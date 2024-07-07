let uiInjected = false;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'toggleUI') {
    if (!uiInjected) {
      injectUI();
    } else {
      toggleUI();
    }
    sendResponse({ success: true });
  }
  // ... other message handlers
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

// ... other content script code