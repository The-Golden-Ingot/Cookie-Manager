let profiles = [];
const elements = {};

function initialize() {
    cacheElements();
    setupEventListeners();
    loadProfiles();
    displayCurrentDomain();
    initializeDraggable();
}

function cacheElements() {
    elements.profilesContainer = document.querySelector('.profiles');
    elements.addressBar = document.querySelector('.address-bar');
    elements.saveCurrentCookieBtn = document.querySelector('#saveCurrentCookieBtn');
}

function setupEventListeners() {
    elements.saveCurrentCookieBtn.addEventListener('click', handleSaveCurrentCookie);
    elements.profilesContainer.addEventListener('click', handleProfileAction);
}

function loadProfiles() {
    chrome.runtime.sendMessage({action: 'getProfiles'}, (response) => {
        profiles = response;
        renderProfiles();
    });
}

function displayCurrentDomain() {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        const url = new URL(tabs[0].url);
        let domain = url.hostname.replace(/^www\./, '');
        elements.addressBar.textContent = domain;
    });
}

function handleSaveCurrentCookie() {
    animateButton(elements.saveCurrentCookieBtn);
    getCurrentTabCookies((response) => {
        if (response && response.cookies) {
            const profileName = prompt('Enter new profile name:');
            if (profileName && profileName.trim()) {
                profiles.push({ name: profileName, cookies: response.cookies, domain: response.domain });
                updateProfiles();
                animatePulse(elements.saveCurrentCookieBtn);
            }
        } else {
            console.error('Failed to get current cookies');
        }
    });
}

function handleProfileAction(e) {
    const profile = e.target.closest('.profile');
    const actionBtn = e.target.closest('.action-btn');

    if (profile && !actionBtn) {
        applyProfile(profile);
    } else if (actionBtn) {
        const action = actionBtn.dataset.action;
        const index = parseInt(actionBtn.dataset.index);
        
        if (action === 'edit') {
            editProfile(index);
        } else if (action === 'delete') {
            deleteProfile(index);
        }
    }
}

function applyProfile(profile) {
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
}

function editProfile(index) {
    const newName = prompt('Enter new profile name:', profiles[index].name);
    if (newName && newName.trim()) {
        profiles[index].name = newName;
        updateProfiles();
    }
}
cc
function deleteProfile(index) {
    if (confirm(`Delete ${profiles[index].name}?`)) {
        profiles.splice(index, 1);
        updateProfiles();
    }
}

function renderProfiles() {
    elements.profilesContainer.innerHTML = '';
    profiles.forEach((profile, index) => {
        const profileElement = createProfileElement(profile, index);
        elements.profilesContainer.appendChild(profileElement);
    });
}

function createProfileElement(profile, index) {
    const profileElement = document.createElement('div');
    profileElement.className = 'profile';
    profileElement.innerHTML = `
        <span>${profile.name}</span>
        <div class="action-buttons">
            <button class="action-btn" data-action="edit" data-index="${index}">✏️</button>
            <button class="action-btn" data-action="delete" data-index="${index}">🗑️</button>
        </div>
    `;
    return profileElement;
}

function updateProfiles() {
    chrome.runtime.sendMessage({action: 'updateProfiles', profiles: profiles}, (response) => {
        if (response.success) {
            renderProfiles();
        }
    });
}

function initializeDraggable() {
    const sortable = new Draggable.Sortable(elements.profilesContainer, {
        draggable: '.profile',
        handle: '.profile',
        mirror: {
            constrainDimensions: true,
            xAxis: false,
            appendTo: 'body'
        }
    });

    sortable.on('sortable:stop', updateProfileOrder);
}

function updateProfileOrder() {
    profiles = Array.from(elements.profilesContainer.children).map(profile => {
        const name = profile.querySelector('span').textContent;
        return profiles.find(p => p.name === name);
    });
    updateProfiles();
}

function animateButton(button) {
    button.classList.add('clicked');
    setTimeout(() => button.classList.remove('clicked'), 600);
}

function animatePulse(element) {
    element.classList.add('pulse');
    setTimeout(() => element.classList.remove('pulse'), 500);
}

function getCurrentTabCookies(callback) {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id, {action: 'getCurrentCookies'}, callback);
    });
}

document.addEventListener('DOMContentLoaded', initialize);