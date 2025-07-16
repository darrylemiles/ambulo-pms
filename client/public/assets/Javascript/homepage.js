document.addEventListener('DOMContentLoaded', () => {
  const revealOnScroll = () => {
    const reveals = document.querySelectorAll('.reveal-element');
    for (let i = 0; i < reveals.length; i++) {
      const windowHeight = window.innerHeight;
      const elementTop = reveals[i].getBoundingClientRect().top;
      const elementVisible = 100;

      if (elementTop < windowHeight - elementVisible) {
        reveals[i].classList.add('revealed');
      }
    }
  };

  window.addEventListener('scroll', revealOnScroll);
  revealOnScroll(); // Trigger it on load
});
