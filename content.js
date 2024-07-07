chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getCurrentCookies') {
    const currentDomain = new URL(window.location.href).hostname;
    const currentCookies = document.cookie.split(';').filter(cookie => {
      const [name, value] = cookie.trim().split('=');
      return name && value;
    }).join('; ');
    sendResponse({ cookies: currentCookies, domain: currentDomain });
  } else if (request.action === 'applyProfile') {
    document.cookie = request.cookies;
    sendResponse({ success: true });
  }
  return true;
});