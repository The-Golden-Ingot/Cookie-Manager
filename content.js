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
  }
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

  // Refresh the page content without reloading
  refreshPageContent();
}

function refreshPageContent() {
  // This function should implement logic to refresh the page content
  // without a full page reload. The exact implementation will depend
  // on the specific website structure and requirements.
  
  // Example: Reload specific elements or trigger AJAX requests
  const dynamicElements = document.querySelectorAll('[data-dynamic]');
  dynamicElements.forEach(element => {
    // Implement logic to refresh each dynamic element
    // This could involve re-fetching data or updating the element's content
  });

  // Example: Trigger a custom event that the page can listen for to update content
  window.dispatchEvent(new CustomEvent('cookieProfileApplied'));

  console.log('Page content refreshed without reload');
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