let profiles = [];

function initialize() {
    const profilesContainer = document.querySelector('.profiles');
    const addressBar = document.querySelector('.address-bar');
    const saveCurrentCookieBtn = document.querySelector('#saveCurrentCookieBtn');

    // Load profiles
    chrome.runtime.sendMessage({action: 'getProfiles'}, (response) => {
        profiles = Array.isArray(response) ? response : [];
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
            if (profileData) {
                chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
                    chrome.tabs.sendMessage(tabs[0].id, {action: 'applyProfile', cookies: profileData.cookies}, (response) => {
                        if (response.success) {
                            alert(`Applied ${profileName}`);
                            highlightCurrentProfile(profileName); // Highlight the current profile
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
                profiles.splice(index, 1);
                updateProfiles();
            }
        }
    });

    function renderProfiles() {
        profilesContainer.innerHTML = '';
        if (!Array.isArray(profiles)) {
            console.error('Profiles is not an array:', profiles);
            profiles = []; // Reset to an empty array
        }
        const uniqueProfiles = new Map();
        profiles.forEach((profile, index) => {
            if (!uniqueProfiles.has(profile.name)) {
                uniqueProfiles.set(profile.name, profile);
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
            }
        });
    }

    function updateProfiles() {
        chrome.runtime.sendMessage({action: 'updateProfiles', profiles: profiles}, (response) => {
            if (response.success) {
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