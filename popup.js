let profiles = [];

function initialize() {
    const profilesContainer = document.querySelector('.profiles');
    const addressBar = document.querySelector('.address-bar');
    const saveCurrentCookieBtn = document.querySelector('#saveCurrentCookieBtn');

    // Load profiles
    loadProfiles();

    // Get current tab URL and display only the domain
    getCurrentTabDomain();

    saveCurrentCookieBtn.addEventListener('click', saveCurrentCookie);
    profilesContainer.addEventListener('click', handleProfileClick);

    checkAndHighlightCurrentProfile();
    initializeDraggable();
}

function loadProfiles() {
    chrome.runtime.sendMessage({action: 'getProfiles'}, (response) => {
        profiles = Array.isArray(response) ? response : [];
        renderProfiles();
    });
}

function getCurrentTabDomain() {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        const url = new URL(tabs[0].url);
        let domain = url.hostname.replace(/^www\./, '');
        document.querySelector('.address-bar').textContent = domain;
    });
}

function saveCurrentCookie() {
    const saveCurrentCookieBtn = document.querySelector('#saveCurrentCookieBtn');
    saveCurrentCookieBtn.classList.add('clicked');
    setTimeout(() => saveCurrentCookieBtn.classList.remove('clicked'), 600);

    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, {action: 'getCurrentCookies'}, (response) => {
            if (response && response.cookies) {
                const profileName = prompt('Enter new profile name:');
                if (profileName && profileName.trim()) {
                    profiles.push({ name: profileName, cookies: response.cookies, domain: response.domain });
                    updateProfiles();
                    saveCurrentCookieBtn.classList.add('pulse');
                    setTimeout(() => saveCurrentCookieBtn.classList.remove('pulse'), 500);
                }
            } else {
                console.error('Failed to get current cookies');
            }
        });
    });
}

function handleProfileClick(e) {
    const profile = e.target.closest('.profile');
    const actionBtn = e.target.closest('.action-btn');

    if (profile && !actionBtn) {
        applyProfile(profile);
    } else if (actionBtn) {
        handleActionButton(actionBtn);
    }
}

function applyProfile(profile) {
    const profileName = profile.querySelector('span').textContent;
    const profileData = profiles.find(p => p.name === profileName);
    if (profileData) {
        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, {action: 'applyProfile', cookies: profileData.cookies, profileName: profileName}, (response) => {
                if (response && response.success) {
                    alert(`Applied ${profileName}`);
                    highlightCurrentProfile(profileName);
                }
            });
        });
    }
}

function handleActionButton(actionBtn) {
    const action = actionBtn.dataset.action;
    const index = parseInt(actionBtn.dataset.index);

    if (action === 'edit') {
        const newName = prompt('Enter new profile name:', profiles[index].name);
        if (newName && newName.trim()) {
            profiles[index].name = newName;
            updateProfiles();
        }
    } else if (action === 'delete') {
        if (confirm('Are you sure you want to delete this profile?')) {
            profiles.splice(index, 1);
            updateProfiles();
        }
    }
}

function renderProfiles() {
    const profilesContainer = document.querySelector('.profiles');
    profilesContainer.innerHTML = '';
    if (!Array.isArray(profiles)) {
        console.error('Profiles is not an array:', profiles);
        profiles = [];
    }
    const uniqueProfiles = new Map();
    profiles.forEach((profile, index) => {
        if (!uniqueProfiles.has(profile.name)) {
            uniqueProfiles.set(profile.name, profile);
            const profileElement = document.createElement('div');
            profileElement.className = 'profile';
            profileElement.innerHTML = `
                <span>${sanitizeHTML(profile.name)}</span>
                <div class="action-buttons">
                    <button class="action-btn" data-action="edit" data-index="${index}">✏️</button>
                    <button class="action-btn" data-action="delete" data-index="${index}">🗑️</button>
                </div>
            `;
            profilesContainer.appendChild(profileElement);
        }
    });
}

function updateProfiles() {
    chrome.runtime.sendMessage({action: 'updateProfiles', profiles: profiles}, (response) => {
        if (response && response.success) {
            renderProfiles();
        }
    });
}

function highlightCurrentProfile(profileName) {
    const profilesContainer = document.querySelector('.profiles');
    profilesContainer.querySelectorAll('.profile').forEach(profile => {
        profile.classList.remove('current');
        profile.querySelector('.current-indicator')?.remove();
        if (profile.querySelector('span').textContent === profileName) {
            profile.classList.add('current');
            const indicator = document.createElement('div');
            indicator.className = 'current-indicator';
            indicator.textContent = '✓ Active';
            profile.appendChild(indicator);
        }
    });
}

function initializeDraggable() {
    const profilesContainer = document.querySelector('.profiles');
    try {
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
    } catch (error) {
        console.error('Error initializing Draggable:', error);
    }
}

function sanitizeHTML(str) {
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
}

function checkAndHighlightCurrentProfile() {
    chrome.storage.local.get('uiState', (result) => {
        if (result.uiState && result.uiState.currentProfile) {
            highlightCurrentProfile(result.uiState.currentProfile);
        }
    });
}

document.addEventListener('DOMContentLoaded', initialize);