document.getElementById('fileInput').addEventListener('change', (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedProfiles = JSON.parse(e.target.result);
        chrome.storage.local.set({ profiles: importedProfiles }, () => {
          alert('Profiles imported successfully');
          window.close();
        });
      } catch (error) {
        alert('Error importing profiles: ' + error.message);
      }
    };
    reader.readAsText(file);
  });