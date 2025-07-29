document.addEventListener('DOMContentLoaded', () => {
  fetch('../client/components/navbar.html') // Adjust path if needed
    .then(res => res.text())
    .then(data => {
      document.getElementById('navbar-placeholder').innerHTML = data;
      setupNavbarFeatures();
    });

  function setupNavbarFeatures() {
    const navbar = document.querySelector('header') || document.getElementById('navbar');

    const revealElements = document.querySelectorAll('.reveal-element');

    const revealOnScroll = () => {
      revealElements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 150;

        if (elementTop < window.innerHeight - elementVisible) {
          element.classList.add('revealed');
        }
      });
    };

    // Sticky navbar
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

      if (scrollTop > 50) {
        navbar.classList.add('scrolled');
      } else {
        navbar.classList.remove('scrolled');
      }

      revealOnScroll();
    };

    // Smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          const offsetTop = target.offsetTop - 80;
          window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
          });
        }
      });
    });

    // Event listeners
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('load', revealOnScroll);
    revealOnScroll(); // Initial reveal
  }
});
