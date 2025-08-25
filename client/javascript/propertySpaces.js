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

            if (navbar) {
                if (scrollTop > 50) {
                    navbar.classList.add('scrolled');
                } else {
                    navbar.classList.remove('scrolled');
                }
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

    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.reveal-element').forEach(el => {
        observer.observe(el);
    });

    const elementsInView = document.querySelectorAll('.reveal-element');
    elementsInView.forEach((el, index) => {
        setTimeout(() => {
            if (el.getBoundingClientRect().top < window.innerHeight) {
                el.classList.add('revealed');
            }
        }, index * 100);
    });
});

// Filter System Variables
let activeFilters = {
    status: [],
    type: [],
    price: [],
    area: []
};

// Filter Functions
function toggleFilter(filterType, value, buttonElement) {
    const index = activeFilters[filterType].indexOf(value);
    
    if (index > -1) {
        // Remove filter
        activeFilters[filterType].splice(index, 1);
        buttonElement.classList.remove('active');
    } else {
        // Add filter
        activeFilters[filterType].push(value);
        buttonElement.classList.add('active');
    }
    
    applyFilters();
}

function applyFilters() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const propertyCards = document.querySelectorAll('.property-card');
    let visibleCount = 0;
    
    propertyCards.forEach(card => {
        const cardStatus = card.getAttribute('data-status');
        const cardType = card.getAttribute('data-type');
        const cardPrice = parseInt(card.getAttribute('data-price'));
        const cardArea = parseInt(card.getAttribute('data-area'));
        const cardTitle = card.querySelector('.property-title').textContent.toLowerCase();
        const cardLocation = card.querySelector('.property-desc').textContent.toLowerCase();
        
        // Search filter
        const matchesSearch = !searchTerm || 
            cardTitle.includes(searchTerm) ||
            cardLocation.includes(searchTerm) ||
            cardType.toLowerCase().includes(searchTerm);
        
        // Status filter
        const matchesStatus = activeFilters.status.length === 0 || 
            activeFilters.status.includes(cardStatus);
        
        // Type filter
        const matchesType = activeFilters.type.length === 0 || 
            activeFilters.type.includes(cardType);
        
        // Price filter
        let matchesPrice = true;
        if (activeFilters.price.length > 0) {
            matchesPrice = activeFilters.price.some(priceRange => {
                if (priceRange === 'low') return cardPrice < 40000;
                if (priceRange === 'mid') return cardPrice >= 40000 && cardPrice <= 70000;
                if (priceRange === 'high') return cardPrice > 70000;
                return true;
            });
        }
        
        // Area filter
        let matchesArea = true;
        if (activeFilters.area.length > 0) {
            matchesArea = activeFilters.area.some(areaRange => {
                if (areaRange === 'small') return cardArea < 1500;
                if (areaRange === 'medium') return cardArea >= 1500 && cardArea <= 2500;
                if (areaRange === 'large') return cardArea > 2500;
                return true;
            });
        }

        const shouldShow = matchesSearch && matchesStatus && matchesType && matchesPrice && matchesArea;
        
        if (shouldShow) {
            card.style.display = 'block';
            visibleCount++;
        } else {
            card.style.display = 'none';
        }
    });
    
    // Update results count
    const resultsCount = document.getElementById('resultsCount');
    const noResults = document.getElementById('noResults');
    const totalCount = propertyCards.length;
    
    if (visibleCount === 0) {
        noResults.style.display = 'block';
        resultsCount.textContent = 'No properties found';
    } else {
        noResults.style.display = 'none';
        resultsCount.textContent = `Showing ${visibleCount} of ${totalCount} properties`;
    }
}

function clearAllFilters() {
    // Clear search
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.value = '';
    }
    
    // Clear all active filters
    activeFilters = {
        status: [],
        type: [],
        price: [],
        area: []
    };
    
    // Remove active class from all filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Reset sort dropdown
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        sortSelect.value = 'default';
    }

    // Show all properties and update count
    applyFilters();
}

function sortProperties() {
    const sortValue = document.getElementById('sortSelect').value;
    const propertyGrid = document.querySelector('.property-grid');
    const propertyCards = Array.from(document.querySelectorAll('.property-card'));
    
    propertyCards.sort((a, b) => {
        const priceA = parseInt(a.getAttribute('data-price'));
        const priceB = parseInt(b.getAttribute('data-price'));
        const areaA = parseInt(a.getAttribute('data-area'));
        const areaB = parseInt(b.getAttribute('data-area'));
        const titleA = a.querySelector('.property-title').textContent;
        const titleB = b.querySelector('.property-title').textContent;
        
        switch (sortValue) {
            case 'price-low':
                return priceA - priceB;
            case 'price-high':
                return priceB - priceA;
            case 'area-small':
                return areaA - areaB;
            case 'area-large':
                return areaB - areaA;
            case 'name':
                return titleA.localeCompare(titleB);
            case 'default':
            default:
                // Sort by original order (by data-id or DOM order)
                return 0;
        }
    });
    
    // Re-append sorted cards to the grid
    propertyCards.forEach(card => {
        propertyGrid.appendChild(card);
    });
}

function toggleFilters() {
    const filterContent = document.getElementById('filterContent');
    if (filterContent) {
        filterContent.classList.toggle('active');
    }
}

// Initialize filter system when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Real-time search
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', applyFilters);
    }

    // Filter button event listeners
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const filterType = this.getAttribute('data-filter');
            const filterValue = this.getAttribute('data-value');
            toggleFilter(filterType, filterValue, this);
        });
    });

    // Sort dropdown event listener
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
        sortSelect.addEventListener('change', sortProperties);
    }

    // Property card hover effects
    document.addEventListener('mouseover', function(e) {
        if (e.target.closest('.property-card')) {
            const card = e.target.closest('.property-card');
            card.style.transform = 'translateY(-12px) scale(1.02)';
        }
    });

    document.addEventListener('mouseout', function(e) {
        if (e.target.closest('.property-card')) {
            const card = e.target.closest('.property-card');
            card.style.transform = 'translateY(0) scale(1)';
        }
    });

    // Initial filter application
    applyFilters();
});