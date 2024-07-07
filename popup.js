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

    // Get current tab URL
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        addressBar.textContent = tabs[0].url;
    });

    saveCurrentCookieBtn.addEventListener('click', () => {
        saveCurrentCookieBtn.classList.add('clicked');
        setTimeout(() => {
            saveCurrentCookieBtn.classList.remove('clicked');
        }, 600);

        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, {action: 'getCurrentCookies'}, (response) => {
                const profileName = prompt('Enter new profile name:');
                if (profileName && profileName.trim()) {
                    profiles.push({ name: profileName, cookies: response.cookies, domain: response.domain });
                    updateProfiles();
                    saveCurrentCookieBtn.classList.add('pulse');
                    setTimeout(() => {
                        saveCurrentCookieBtn.classList.remove('pulse');
                    }, 500);
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
}

document.addEventListener('DOMContentLoaded', initialize);