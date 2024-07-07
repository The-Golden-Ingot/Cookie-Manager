document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('fileInput').click();
    
    document.getElementById('fileInput').addEventListener('change', function(event) {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
          try {
            const profiles = JSON.parse(e.target.result);
            chrome.storage.local.set({profiles: profiles}, function() {
              alert('Profiles imported successfully!');
              window.close();
            });
          } catch (error) {
            alert('Error importing profiles: ' + error.message);
          }
        };
        reader.readAsText(file);
      }
    });
  });