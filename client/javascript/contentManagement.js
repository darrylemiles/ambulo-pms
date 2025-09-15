<<<<<<< HEAD
        // Original JavaScript functions preserved + compact additions
=======
import fetchCompanyDetails from "../utils/loadCompanyInfo.js";

const appState = {
    currentCategory: null,
    isLoading: false
};

document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setDynamicInfo();
});

function initializeApp() {
    setupEventListeners();
    initializeSearch();
    loadUserData();
}

async function setDynamicInfo() {
  const company = await fetchCompanyDetails();
  if (!company) return;

  const favicon = document.querySelector('link[rel="icon"]');
  if (favicon && company.icon_logo_url) {
    favicon.href = company.icon_logo_url;
  }

  document.title = company.company_name
    ? `Content Management - ${company.company_name}`
    : "Content Management";
}

function setupEventListeners() {
}

function initializeSearch() {
}

function navigateToCategory(event, category) {
    const card = event.currentTarget;

    card.style.opacity = '0.7';
    card.style.transform = 'scale(0.98)';
    
    appState.currentCategory = category;
    showNotification(`Navigating to ${category.replace('-', ' ')}...`, 'info');
    
    const categoryUrls = {
        'company-information': '/company-information.html',
        'building-addresses': '/building-addresses.html',
        'faqs': '/FAQs.html',
        'website-content': '/website-content.html'
    };
    
    const targetUrl = categoryUrls[category];
    
    if (targetUrl) {
        setTimeout(() => {
            window.location.href = targetUrl;
        }, 500);
    } else {
        const href = card.getAttribute('href');
        if (href && href !== '#') {
            setTimeout(() => {
                window.location.href = href;
            }, 500);
        } else {
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'scale(1)';
                showNotification(`Page for ${category} not found`, 'error');
            }, 500);
        }
    }
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
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
>>>>>>> becb8a589efeca6e230282e032e0cc7a4b5b8c36
        
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
            // Enhanced event listeners with compact optimizations
            document.querySelectorAll('.category-card').forEach(card => {
                card.addEventListener('click', function(e) {
                    const category = this.dataset.category || 'unknown';
                    navigateToCategory(e, category);
                });
            });
            console.log('Event listeners setup complete');
        }

        function initializeSearch() {
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
            
            // Navigate after brief delay for visual feedback
            setTimeout(() => {
                window.location.href = card.href;
            }, 300);
        }

        // Enhanced compact notification system
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
            
            // Remove after 3 seconds (shorter for better UX)
            setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => notification.remove(), 300);
            }, 3000);
        }

        function loadUserData() {
            console.log('No user data needed without navigation elements');
        }

        // CMS Integration Functions (preserved)
        const CMS = {
            navigateToCategory: function(category) {
                console.log(`Navigating to ${category} management page`);
                const categoryUrls = {
                    'company-information': '/company-information.html',
                    'building-addresses': '/building-addresses.html',
                    'faqs': '/FAQs.html',
                    'lease-terms': '/lease-terms-cms.html'
                };
                
                const targetUrl = categoryUrls[category];
                if (targetUrl) {
                    window.location.href = targetUrl;
                }
            },
            
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