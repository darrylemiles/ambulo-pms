document.addEventListener('DOMContentLoaded', () => {
  // Load navbar component
  fetch('/components/navbar.html')
    .then(res => res.text())
    .then(data => {
      document.getElementById('navbar-placeholder').innerHTML = data;
      setupNavbarFeatures();
    })
        .catch(error => {
          console.error('Error loading navbar:', error);
        });
    });

