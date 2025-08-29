// Global state management
const appState = {
    currentCategory: null,
    isLoading: false
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Set up event listeners
    setupEventListeners();
    
    // Initialize search functionality
    initializeSearch();
    
    // Load user data (simulated)
    loadUserData();
    
    console.log('Listings CMS initialized successfully');
}

function setupEventListeners() {
    // No sidebar/navbar elements to set up
    console.log('Event listeners setup complete');
}

function initializeSearch() {
    // No search input to initialize
    console.log('Search functionality not needed without navbar');
}

function navigateToCategory(event, category) {
    // Show loading state
    const card = event.currentTarget;
    
    // Add loading effect
    card.style.opacity = '0.7';
    card.style.transform = 'scale(0.98)';
    
    // Log navigation
    console.log('Navigating to category:', category);
    appState.currentCategory = category;
    
    // Show notification
    showNotification(`Navigating to ${category.replace('-', ' ')}...`, 'info');
    
    // Define the navigation URLs for each category
    const categoryUrls = {
        'company-information': '/company-information.html',
        'building-addresses': '/building-addresses.html',
        'faqs': '/FAQs.html',
        'website-content': '/website-content.html'
    };
    
    // Get the URL for this category
    const targetUrl = categoryUrls[category];
    
    if (targetUrl) {
        // Add a small delay for visual feedback, then navigate
        setTimeout(() => {
            window.location.href = targetUrl;
        }, 500);
    } else {
        // Fallback: try to use the href attribute from the link
        const href = card.getAttribute('href');
        if (href && href !== '#') {
            setTimeout(() => {
                window.location.href = href;
            }, 500);
        } else {
            // Reset card appearance if no valid URL
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'scale(1)';
                showNotification(`Page for ${category} not found`, 'error');
            }, 500);
        }
    }
    
    // Don't prevent default navigation - let it proceed naturally
    // event.preventDefault(); // REMOVED this line
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Remove after 4 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

function loadUserData() {
    console.log('No user data needed without navigation elements');
}

// CMS Integration Functions
const CMS = {
    // Navigate to category page
    navigateToCategory: function(category) {
        console.log(`Navigating to ${category} management page`);
        const categoryUrls = {
            'company-information': '/company-information.html',
            'building-addresses': '/building-addresses.html',
            'faqs': '/FAQs.html',
            'website-content': '/website-content.html'
        };
        
        const targetUrl = categoryUrls[category];
        if (targetUrl) {
            window.location.href = targetUrl;
        }
    },
    
    // Get category data
    getCategoryData: async function(category) {
        try {
            const response = await fetch(`/api/categories/${category}`);
            if (!response.ok) throw new Error('Failed to fetch category data');
            return await response.json();
        } catch (error) {
            console.error('CMS Error:', error);
            throw error;
        }
    },
    
    // Log activity for audit trail
    logActivity: function(action, details) {
        console.log('CMS Activity Log:', { action, details, timestamp: new Date() });
    }
};

// Export for CMS integration
window.ListingsCMS = {
    appState,
    navigateToCategory,
    CMS,
    showNotification
};