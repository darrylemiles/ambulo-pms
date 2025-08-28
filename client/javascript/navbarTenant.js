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
    // Sample inbox messages data
    const inboxMessages = [
        {
            id: 1,
            sender: "Property Manager",
            subject: "Monthly Rent Reminder",
            preview: "Your rent payment for this month is due on the 30th. Please ensure timely payment to avoid late fees and maintain your good standing with the property.",
            time: "2 hours ago",
            unread: true,
            priority: "high"
        },
        {
            id: 2,
            sender: "Maintenance Team",
            subject: "Work Order #2024-0156 Completed",
            preview: "The plumbing issue in your apartment has been successfully resolved. Our certified technician completed the work and performed quality checks to ensure everything is functioning properly.",
            time: "1 day ago",
            unread: true,
            priority: "medium"
        },
        {
            id: 3,
            sender: "Ambulo Properties",
            subject: "Lease Renewal Opportunity",
            preview: "Your lease agreement is set to expire in 60 days. We would like to discuss renewal options and updated terms. Please contact us at your earliest convenience.",
            time: "3 days ago",
            unread: false,
            priority: "medium"
        },
        {
            id: 4,
            sender: "Community Manager",
            subject: "Exciting Building Amenity Updates",
            preview: "We're excited to announce new premium amenities coming to your building including a state-of-the-art fitness center, rooftop garden, and co-working spaces.",
            time: "1 week ago",
            unread: false,
            priority: "low"
        },
        {
            id: 5,
            sender: "Security Office",
            subject: "Package Delivery Notification",
            preview: "A package has been delivered to your unit and is currently being held at the front desk. Please bring a valid ID to collect your delivery during office hours.",
            time: "2 weeks ago",
            unread: false,
            priority: "medium"
        }
    ];

    // Populate inbox content
    function populateInbox() {
        const inboxContent = document.getElementById('inboxContent');
        const inboxBadge = document.getElementById('inboxBadge');
        const unreadCount = inboxMessages.filter(msg => msg.unread).length;
        
        // Update badge
        if (unreadCount > 0) {
            inboxBadge.textContent = `${unreadCount} New`;
        } else {
            inboxBadge.textContent = 'All Read';
        }
        
        if (inboxMessages.length === 0) {
            inboxContent.innerHTML = `
                <div class="empty-inbox">
                    <div class="empty-inbox-icon">📭</div>
                    <div class="empty-inbox-text">No messages yet</div>
                    <div class="empty-inbox-subtext">You're all caught up!</div>
                </div>
            `;
        } else {
            inboxContent.innerHTML = inboxMessages.map(message => `
                <div class="inbox-item ${message.unread ? 'unread' : ''}" onclick="openMessage(${message.id})">
                    <div class="inbox-item-header">
                        <div class="inbox-sender-section">
                            <span class="inbox-sender">${message.sender}</span>
                            ${message.priority ? `<div class="inbox-priority ${message.priority}"></div>` : ''}
                        </div>
                        <span class="inbox-time">${message.time}</span>
                    </div>
                    <div class="inbox-subject">${message.subject}</div>
                    <div class="inbox-preview">${message.preview}</div>
                </div>
            `).join('');
        }
    }

    // Initialize inbox
    populateInbox();

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
            
            // Close inbox dropdown if open
            const inboxDropdown = document.getElementById('inboxDropdown');
            if (inboxDropdown) {
                inboxDropdown.classList.remove('active');
            }
            
            console.log('Profile clicked, dropdown active:', dropdownMenu.classList.contains('active'));
        });
    }

    // Inbox dropdown functionality
    const inboxBtn = document.getElementById('inboxBtn');
    const inboxDropdown = document.getElementById('inboxDropdown');

    if (inboxBtn && inboxDropdown) {
        inboxBtn.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            inboxDropdown.classList.toggle('active');
            
            // Close profile dropdown if open
            if (dropdownMenu) {
                dropdownMenu.classList.remove('active');
            }
        });
    }

    // Close dropdown and mobile menu when clicking outside
    document.addEventListener('click', function(e) {
        // Close profile dropdown
        if (profileBtn && dropdownMenu && !profileBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
            dropdownMenu.classList.remove('active');
        }
        
        // Close inbox dropdown
        if (inboxBtn && inboxDropdown && !inboxBtn.contains(e.target) && !inboxDropdown.contains(e.target)) {
            inboxDropdown.classList.remove('active');
        }
        
        // Close mobile menu
        if (mobileToggle && navLinks && !mobileToggle.contains(e.target) && !navLinks.contains(e.target)) {
            navLinks.classList.remove('active');
            mobileToggle.classList.remove('active');
        }
    });
}

// Function to handle message click
function openMessage(messageId) {
    alert(`Opening message with ID: ${messageId}`);
    // Here you would typically navigate to a message detail page or open a modal
}