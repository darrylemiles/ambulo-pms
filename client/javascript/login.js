
// Toggle password visibility
const toggleButton = document.getElementById('toggleButton');
const passwordField = document.getElementById('passwordField');
const toggleIcon = document.getElementById('toggleIcon');

toggleButton.addEventListener('click', () => {
  const type = passwordField.getAttribute('type');
  if (type === 'password') {
    passwordField.setAttribute('type', 'text');
    toggleIcon.textContent = '🙈';
  } else {
    passwordField.setAttribute('type', 'password');
    toggleIcon.textContent = '👁️';
  }
});

const loginForm = document.getElementById('loginForm');

loginForm.addEventListener('submit', function (e) {
  e.preventDefault();

  window.location.href = 'adminDashboard.html';
});

