document.addEventListener('DOMContentLoaded', () => {
    // If you're loading navbar from external file
    const navbarPlaceholder = document.getElementById('navbar-tenant-placeholder');
    
    if (navbarPlaceholder) {
        // Load navbar component
        fetch('/components/navbarTenant.html')
            .then(res => res.text())
            .then(data => {
                navbarPlaceholder.innerHTML = data;
                initializeNavbar(); // Initialize after loading
            })
            .catch(error => {
                console.error('Error loading navbar:', error);
                initializeNavbar(); // Try to initialize anyway
            });
    } else {
        // If navbar is already in the DOM, initialize directly
        initializeNavbar();
    }
});

function initializeNavbar() {
    // Navbar scroll effect
    window.addEventListener('scroll', function() {
        const navbar = document.getElementById('navbar');
        if (navbar) {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }
    });

    // Mobile menu toggle
    const mobileToggle = document.getElementById('mobileToggle');
    const navLinks = document.getElementById('navLinks');

    if (mobileToggle && navLinks) {
        mobileToggle.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            mobileToggle.classList.toggle('active');
        });
    }

    // Close mobile menu when clicking on a link
    const navItems = document.querySelectorAll('.nav-links a');
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            if (navLinks && mobileToggle) {
                navLinks.classList.remove('active');
                mobileToggle.classList.remove('active');
            }
            
            // Update active state
            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Profile dropdown functionality
    const profileBtn = document.getElementById('profileBtnIcon');
    const dropdownMenu = document.getElementById('dropdownMenu');

    if (profileBtn && dropdownMenu) {
        profileBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            dropdownMenu.classList.toggle('active');
            console.log('Profile clicked, dropdown active:', dropdownMenu.classList.contains('active'));
        });
    }

    // Close dropdown and mobile menu when clicking outside
    document.addEventListener('click', function(e) {
        // Close profile dropdown
        if (profileBtn && dropdownMenu && !profileBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
            dropdownMenu.classList.remove('active');
        }
        
        // Close mobile menu
        if (mobileToggle && navLinks && !mobileToggle.contains(e.target) && !navLinks.contains(e.target)) {
            navLinks.classList.remove('active');
            mobileToggle.classList.remove('active');
        }
    });
}