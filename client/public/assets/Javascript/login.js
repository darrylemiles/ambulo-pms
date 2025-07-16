  // Toggle password visibility
  const toggleButton = document.getElementById('toggleButton');
  const passwordField = document.getElementById('passwordField');
  const toggleIcon = document.getElementById('toggleIcon');

  toggleButton.addEventListener('click', () => {
    const type = passwordField.getAttribute('type');
    if (type === 'password') {
      passwordField.setAttribute('type', 'text');
      toggleIcon.textContent = '🙈'; // change icon if desired
    } else {
      passwordField.setAttribute('type', 'password');
      toggleIcon.textContent = '👁️';
    }
  });
