  // Load footer component
  fetch('/components/footer.html')
    .then(res => res.text())
    .then(data => {
      document.getElementById('footer-placeholder').innerHTML = data;
    })
    .catch(error => {
      console.error('Error loading footer:', error);
    });