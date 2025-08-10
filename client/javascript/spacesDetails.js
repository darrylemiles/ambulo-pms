document.addEventListener('DOMContentLoaded', () => {
  fetch('/components/navbar.html')
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

    // Property images array
    const images = [
        'https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1556020685-ae41abfc9365?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1571624436279-b272aff752b5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'
    ];

    let currentImageIndex = 0;

    // Image Gallery Functions
    function setMainImage(thumbnail, index) {
        const mainImageElement = document.getElementById('mainImage');
        if (mainImageElement && images[index]) {
            mainImageElement.src = images[index];
            
            // Update active thumbnail
            document.querySelectorAll('.thumbnail').forEach(thumb => {
                thumb.classList.remove('active');
            });
            thumbnail.classList.add('active');
            
            currentImageIndex = index;
        }
    }

    function changeImage(direction) {
        currentImageIndex += direction;
        
        // Handle boundary conditions
        if (currentImageIndex >= images.length) {
            currentImageIndex = 0;
        }
        if (currentImageIndex < 0) {
            currentImageIndex = images.length - 1;
        }
        
        const mainImageElement = document.getElementById('mainImage');
        if (mainImageElement && images[currentImageIndex]) {
            mainImageElement.src = images[currentImageIndex];
            
            // Update active thumbnail
            document.querySelectorAll('.thumbnail').forEach((thumb, index) => {
                thumb.classList.toggle('active', index === currentImageIndex);
            });
        }
    }

    // Reveal Animation on Scroll
    function revealOnScroll() {
        const reveals = document.querySelectorAll('.reveal-element');
        const windowHeight = window.innerHeight;
        const elementVisible = 150;
        
        reveals.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            
            if (elementTop < windowHeight - elementVisible) {
                element.classList.add('revealed');
            }
        });
    }

    // Update image gallery
    function updateImageGallery(newImages) {
        // Update the images array
        images.length = 0;
        images.push(...newImages);
        
        // Update thumbnails
        const thumbnails = document.querySelectorAll('.thumbnail');
        thumbnails.forEach((thumbnail, index) => {
            if (newImages[index]) {
                thumbnail.src = newImages[index].replace('w=1000', 'w=200');
                thumbnail.onclick = () => setMainImage(thumbnail, index);
            }
        });
        
        // Reset to first image
        currentImageIndex = 0;
        const mainImage = document.getElementById('mainImage');
        if (mainImage && newImages[0]) {
            mainImage.src = newImages[0];
        }
    }
