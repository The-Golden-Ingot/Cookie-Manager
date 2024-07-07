let profiles = [];

function initialize() {
    const profilesContainer = document.querySelector('.profiles');
    const addressBar = document.querySelector('.address-bar');
    const saveCurrentCookieBtn = document.querySelector('#saveCurrentCookieBtn');

    // Load profiles
    chrome.runtime.sendMessage({action: 'getProfiles'}, (response) => {
        profiles = response;
        renderProfiles();
    });

    // Get current tab URL and display only the domain
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        const url = new URL(tabs[0].url);
        let domain = url.hostname;
        // Remove 'www.' if present
        domain = domain.replace(/^www\./, '');
        addressBar.textContent = domain;
    });

    saveCurrentCookieBtn.addEventListener('click', () => {
        saveCurrentCookieBtn.classList.add('clicked');
        setTimeout(() => {
            saveCurrentCookieBtn.classList.remove('clicked');
        }, 600);

        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, {action: 'getCurrentCookies'}, (response) => {
                if (response && response.cookies) {
                    const profileName = prompt('Enter new profile name:');
                    if (profileName && profileName.trim()) {
                        profiles.push({ name: profileName, cookies: response.cookies, domain: response.domain });
                        updateProfiles();
                        saveCurrentCookieBtn.classList.add('pulse');
                        setTimeout(() => {
                            saveCurrentCookieBtn.classList.remove('pulse');
                        }, 500);
                    }
                } else {
                    console.error('Failed to get current cookies');
                }
            });
        });
    });

    profilesContainer.addEventListener('click', (e) => {
        const profile = e.target.closest('.profile');
        const actionBtn = e.target.closest('.action-btn');

        if (profile && !actionBtn) {
            const profileName = profile.querySelector('span').textContent;
            const profileData = profiles.find(p => p.name === profileName);
            if (profileData && confirm(`Apply ${profileName}?`)) {
                chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
                    chrome.tabs.sendMessage(tabs[0].id, {action: 'applyProfile', cookies: profileData.cookies}, (response) => {
                        if (response.success) {
                            alert(`Applied ${profileName}`);
                        }
                    });
                });
            }
        } else if (actionBtn) {
            const action = actionBtn.dataset.action;
            const index = parseInt(actionBtn.dataset.index);

            if (action === 'edit') {
                const newName = prompt('Enter new profile name:', profiles[index].name);
                if (newName && newName.trim()) {
                    profiles[index].name = newName;
                    updateProfiles();
                }
            } else if (action === 'delete') {
                if (confirm(`Delete ${profiles[index].name}?`)) {
                    profiles.splice(index, 1);
                    updateProfiles();
                }
            }
        }
    });

    function renderProfiles() {
        profilesContainer.innerHTML = '';
        profiles.forEach((profile, index) => {
            const profileElement = document.createElement('div');
            profileElement.className = 'profile';
            profileElement.innerHTML = `
                <span>${profile.name}</span>
                <div class="action-buttons">
                    <button class="action-btn" data-action="edit" data-index="${index}">✏️</button>
                    <button class="action-btn" data-action="delete" data-index="${index}">🗑️</button>
                </div>
            `;
            profilesContainer.appendChild(profileElement);
        });

        // Remove this block as it's not needed in the popup context
        // if (isIframe) {
        //     window.parent.postMessage({ action: 'resize', height: document.body.scrollHeight }, '*');
        // }
    }

    function updateProfiles() {
        chrome.runtime.sendMessage({action: 'updateProfiles', profiles: profiles}, (response) => {
            if (response.success) {
                renderProfiles();
            }
        });
    }

    // Initialize Draggable
    const sortable = new Draggable.Sortable(profilesContainer, {
        draggable: '.profile',
        handle: '.profile',
        mirror: {
            constrainDimensions: true,
            xAxis: false,
            appendTo: 'body'
        }
    });

    sortable.on('sortable:stop', () => {
        profiles = Array.from(profilesContainer.children).map(profile => {
            const name = profile.querySelector('span').textContent;
            return profiles.find(p => p.name === name);
        });
        updateProfiles();
    });

    // Remove this event listener as it's not needed in the popup context
    // window.addEventListener('message', (event) => {
    //     if (event.data.action === 'someAction') {
    //         // Handle messages from the parent window
    //     }
    // });
}

document.addEventListener('DOMContentLoaded', initialize);