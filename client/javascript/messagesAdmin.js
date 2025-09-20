// Sample Data
const messages = [
    {
        id: 1,
        sender: "Property Manager",
        subject: "Monthly Rent Reminder - Unit 4B",
        preview: "Your rent payment for this month is due on the 30th. Please ensure timely payment to avoid any late fees...",
        time: "2 hours ago",
        unread: true,
        priority: "high"
    },
    {
        id: 2,
        sender: "Maintenance Team",
        subject: "Work Order #2024-0156 Completed",
        preview: "The plumbing issue in your apartment has been successfully resolved. Our team has tested all fixtures...",
        time: "1 day ago",
        unread: true,
        priority: "medium"
    },
    {
        id: 3,
        sender: "Ambulo Properties",
        subject: "Lease Renewal Opportunity",
        preview: "Your lease agreement is set to expire in 60 days. We would like to discuss renewal options and any updates...",
        time: "3 days ago",
        unread: false,
        priority: "medium"
    },
    {
        id: 4,
        sender: "Community Manager",
        subject: "Building Amenity Updates",
        preview: "We're excited to announce new premium amenities coming to your building including a modern fitness center...",
        time: "1 week ago",
        unread: false,
        priority: "low"
    },
    {
        id: 5,
        sender: "Security Office",
        subject: "Package Delivery Notification",
        preview: "A package has been delivered to your unit and is currently being held at the front desk for pickup...",
        time: "2 weeks ago",
        unread: true,
        priority: "medium"
    },
    {
        id: 6,
        sender: "Billing Department",
        subject: "Utility Bill Statement - July 2024",
        preview: "Your utility bill for July 2024 is now available in your tenant portal. Total amount due: $125.50...",
        time: "3 weeks ago",
        unread: false,
        priority: "medium"
    },
    {
        id: 7,
        sender: "Emergency Services",
        subject: "URGENT: Water Main Break",
        preview: "Due to an unexpected water main break, water service will be interrupted from 8:00 AM to 2:00 PM today...",
        time: "1 month ago",
        unread: true,
        priority: "high"
    },
    {
        id: 8,
        sender: "Front Desk",
        subject: "Visitor Access Code Updated",
        preview: "Your visitor access code has been updated for security purposes. New code: 4729. Please share with guests...",
        time: "1 month ago",
        unread: false,
        priority: "low"
    }
];

const chatContacts = [
    {
        id: 1,
        name: "Property Manager",
        avatar: "PM",
        online: true,
        lastMessage: "Thank you for the payment confirmation",
        lastTime: "2m",
        unreadCount: 2
    },
    {
        id: 2,
        name: "Maintenance Team",
        avatar: "MT",
        online: true,
        lastMessage: "We'll be there tomorrow morning",
        lastTime: "1h",
        unreadCount: 0
    },
    {
        id: 3,
        name: "Front Desk",
        avatar: "FD",
        online: false,
        lastMessage: "Package has been delivered",
        lastTime: "2h",
        unreadCount: 1
    },
    {
        id: 4,
        name: "Emergency Line",
        avatar: "EL",
        online: true,
        lastMessage: "Issue has been resolved",
        lastTime: "1d",
        unreadCount: 0
    },
    {
        id: 5,
        name: "Ambulo Properties",
        avatar: "AP",
        online: false,
        lastMessage: "Lease documents sent",
        lastTime: "3d",
        unreadCount: 0
    }
];

const chatMessages = {
    1: [
        { id: 1, text: "Hi! I wanted to confirm that I've submitted my rent payment for this month.", sent: true, time: "10:30 AM" },
        { id: 2, text: "Thank you for the confirmation! I can see the payment has been processed successfully.", sent: false, time: "10:32 AM" },
        { id: 3, text: "Perfect! Is there anything else I need to do regarding the lease renewal?", sent: true, time: "10:35 AM" },
        { id: 4, text: "We'll send you the renewal documents by the end of this week. Please review and let us know if you have any questions.", sent: false, time: "10:37 AM" },
        { id: 5, text: "Thank you for the payment confirmation", sent: false, time: "Just now" }
    ],
    2: [
        { id: 1, text: "Hello, I'm having an issue with my bathroom faucet. It's been dripping constantly.", sent: true, time: "Yesterday" },
        { id: 2, text: "I've logged your maintenance request. Work order #2024-0157 has been created.", sent: false, time: "Yesterday" },
        { id: 3, text: "When can someone come to fix it?", sent: true, time: "Yesterday" },
        { id: 4, text: "We'll be there tomorrow morning", sent: false, time: "1h ago" }
    ],
    3: [
        { id: 1, text: "Hi, I have a package that was supposed to be delivered today. Has it arrived?", sent: true, time: "2h ago" },
        { id: 2, text: "Package has been delivered", sent: false, time: "2h ago" }
    ]
};

let currentFilter = 'all';
let currentChatContact = null;
let currentEditingMessage = null;
let messageToDelete = null;
let currentEditingChatMessage = null;
let chatMessageToDelete = null;

// Pagination variables
let currentPage = 1;
let messagesPerPage = 5;
let totalPages = 1;

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    initializeMessagesContainer(); // Initialize the container structure
    renderMessages();
    renderChatContacts();
    updateMessagesBadge();
    setupEventListeners();
});

// Initialize messages container structure
function initializeMessagesContainer() {
    const messagesTab = document.getElementById('messagesTab');
    if (!messagesTab) return;

    // Check if messages-list-container already exists
    let messagesListContainer = messagesTab.querySelector('.messages-list-container');
    
    if (!messagesListContainer) {
        // Find the existing messages-list
        const messagesList = messagesTab.querySelector('.messages-list');
        
        if (messagesList) {
            // Create the container wrapper
            messagesListContainer = document.createElement('div');
            messagesListContainer.className = 'messages-list-container';
            
            // Move the messages-list into the container
            messagesList.parentNode.insertBefore(messagesListContainer, messagesList);
            messagesListContainer.appendChild(messagesList);
        }
    }
}

// Tab Switching
function switchTab(tabName, tabElement) {
    document.querySelectorAll('.nav-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

    tabElement.classList.add('active');
    document.getElementById(tabName + 'Tab').classList.add('active');

    if (tabName === 'chat') {
        updateChatBadge();
    }
}

// Pagination Functions
function createPagination(totalMessages, currentPage, messagesPerPage) {
    const totalPages = Math.ceil(totalMessages / messagesPerPage);
    
    if (totalPages <= 1) return '';

    let paginationHTML = '<div class="pagination-container">';
    
    // Left side - Messages info
    const startItem = (currentPage - 1) * messagesPerPage + 1;
    const endItem = Math.min(currentPage * messagesPerPage, totalMessages);
    paginationHTML += `<div class="pagination-info" style="color: #64748b; font-size: 14px;">
        Showing ${startItem}-${endItem} of ${totalMessages} messages
    </div>`;
    
    // Right side - Pagination controls
    paginationHTML += '<div class="pagination-controls" style="display: flex; align-items: center; gap: 8px;">';
    
    // Messages per page selector
    paginationHTML += `
        <div class="per-page-selector" style="display: flex; align-items: center; gap: 8px; margin-right: 16px;">
            <span style="color: #64748b; font-size: 14px;">Show:</span>
            <select id="messagesPerPageSelect" onchange="changeMessagesPerPage(this.value)" style="padding: 6px 12px; border: 2px solid #e2e8f0; border-radius: 6px; font-size: 14px; background: white; cursor: pointer;">
                <option value="5" ${messagesPerPage === 5 ? 'selected' : ''}>5</option>
                <option value="10" ${messagesPerPage === 10 ? 'selected' : ''}>10</option>
                <option value="15" ${messagesPerPage === 15 ? 'selected' : ''}>15</option>
                <option value="20" ${messagesPerPage === 20 ? 'selected' : ''}>20</option>
            </select>
        </div>
    `;
    
    // Previous button
    paginationHTML += `
        <button onclick="goToPage(${currentPage - 1})" ${currentPage <= 1 ? 'disabled' : ''} 
            class="pagination-btn" style="padding: 8px 12px; border: 2px solid #e2e8f0; background: white; color: #64748b; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 500; transition: all 0.3s ease; ${currentPage <= 1 ? 'opacity: 0.5; cursor: not-allowed;' : ''}" 
            onmouseover="if(!this.disabled) { this.style.borderColor='#667eea'; this.style.color='#667eea'; }" 
            onmouseout="if(!this.disabled) { this.style.borderColor='#e2e8f0'; this.style.color='#64748b'; }">
            <i class="fas fa-chevron-left"></i> Previous
        </button>
    `;
    
    // Page numbers
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage < maxVisiblePages - 1) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    if (startPage > 1) {
        paginationHTML += `<button onclick="goToPage(1)" class="pagination-btn page-btn" style="width: 36px; height: 36px; border: 2px solid #e2e8f0; background: white; color: #64748b; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 500; display: flex; align-items: center; justify-content: center; transition: all 0.3s ease;" onmouseover="this.style.borderColor='#667eea'; this.style.color='#667eea';" onmouseout="this.style.borderColor='#e2e8f0'; this.style.color='#64748b';">1</button>`;
        if (startPage > 2) {
            paginationHTML += '<span style="color: #64748b; padding: 0 8px;">...</span>';
        }
    }
    
    for (let i = startPage; i <= endPage; i++) {
        const isActive = i === currentPage;
        paginationHTML += `
            <button onclick="goToPage(${i})" class="pagination-btn page-btn ${isActive ? 'active' : ''}" 
                style="width: 36px; height: 36px; border: 2px solid ${isActive ? '#667eea' : '#e2e8f0'}; 
                background: ${isActive ? 'linear-gradient(135deg, #667eea, #764ba2)' : 'white'}; 
                color: ${isActive ? 'white' : '#64748b'}; border-radius: 8px; cursor: pointer; 
                font-size: 14px; font-weight: 500; display: flex; align-items: center; justify-content: center; 
                transition: all 0.3s ease; ${isActive ? 'box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);' : ''}" 
                ${!isActive ? "onmouseover=\"this.style.borderColor='#667eea'; this.style.color='#667eea';\" onmouseout=\"this.style.borderColor='#e2e8f0'; this.style.color='#64748b';\"" : ''}>
                ${i}
            </button>
        `;
    }
    
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            paginationHTML += '<span style="color: #64748b; padding: 0 8px;">...</span>';
        }
        paginationHTML += `<button onclick="goToPage(${totalPages})" class="pagination-btn page-btn" style="width: 36px; height: 36px; border: 2px solid #e2e8f0; background: white; color: #64748b; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 500; display: flex; align-items: center; justify-content: center; transition: all 0.3s ease;" onmouseover="this.style.borderColor='#667eea'; this.style.color='#667eea';" onmouseout="this.style.borderColor='#e2e8f0'; this.style.color='#64748b';">${totalPages}</button>`;
    }
    
    // Next button
    paginationHTML += `
        <button onclick="goToPage(${currentPage + 1})" ${currentPage >= totalPages ? 'disabled' : ''} 
            class="pagination-btn" style="padding: 8px 12px; border: 2px solid #e2e8f0; background: white; color: #64748b; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 500; transition: all 0.3s ease; ${currentPage >= totalPages ? 'opacity: 0.5; cursor: not-allowed;' : ''}" 
            onmouseover="if(!this.disabled) { this.style.borderColor='#667eea'; this.style.color='#667eea'; }" 
            onmouseout="if(!this.disabled) { this.style.borderColor='#e2e8f0'; this.style.color='#64748b'; }">
            Next <i class="fas fa-chevron-right"></i>
        </button>
    `;
    
    paginationHTML += '</div></div>';
    
    return paginationHTML;
}

function goToPage(page) {
    if (page < 1 || page > totalPages) return;
    currentPage = page;
    renderMessages();
}

function changeMessagesPerPage(newPerPage) {
    messagesPerPage = parseInt(newPerPage);
    currentPage = 1; // Reset to first page
    renderMessages();
}

// Compose Message Functions
function openComposeModal() {
    // Clear form fields
    document.getElementById('composeRecipient').value = '';
    document.getElementById('composeSubject').value = '';
    document.getElementById('composeMessage').value = '';
    document.getElementById('composePriority').value = 'medium';
    
    showModal('composeModal');
}

function sendNewMessage() {
    const recipient = document.getElementById('composeRecipient').value;
    const subject = document.getElementById('composeSubject').value;
    const messageText = document.getElementById('composeMessage').value;
    const priority = document.getElementById('composePriority').value;

    // Validation
    if (!recipient || !subject || !messageText) {
        showNotification('Please fill in all required fields');
        return;
    }

    // Create new message
    const newMessage = {
        id: Math.max(...messages.map(m => m.id)) + 1,
        sender: "You",
        recipient: recipient,
        subject: subject,
        preview: messageText,
        time: "Just now",
        unread: false,
        priority: priority,
        sent: true
    };

    // Add to messages array at the beginning
    messages.unshift(newMessage);

    // Update or create chat contact and conversation
    updateChatFromComposedMessage(recipient, subject, messageText);

    // Update the UI
    renderMessages();
    updateMessagesBadge();
    closeModal('composeModal');
    
    // Show success notification
    showNotification(`Message sent to ${recipient}`);

    // Simulate response from recipient
    setTimeout(() => {
        simulateRecipientResponse(recipient, subject);
    }, 3000 + Math.random() * 5000);
}

function updateChatFromComposedMessage(recipient, subject, messageText) {
    // Find or create chat contact
    let chatContact = chatContacts.find(c => c.name === recipient);
    
    if (!chatContact) {
        // Create new chat contact
        const newContactId = Math.max(...chatContacts.map(c => c.id), 0) + 1;
        chatContact = {
            id: newContactId,
            name: recipient,
            avatar: recipient.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase(),
            online: Math.random() > 0.3, // Most contacts appear online
            lastMessage: messageText.length > 30 ? messageText.substring(0, 30) + '...' : messageText,
            lastTime: 'Just now',
            unreadCount: 0
        };
        chatContacts.unshift(chatContact);
        
        // Initialize chat messages array for new contact
        chatMessages[chatContact.id] = [];
    } else {
        // Update existing contact's last message info
        chatContact.lastMessage = messageText.length > 30 ? messageText.substring(0, 30) + '...' : messageText;
        chatContact.lastTime = 'Just now';
        
        // Move contact to top of the list
        const contactIndex = chatContacts.findIndex(c => c.id === chatContact.id);
        if (contactIndex > 0) {
            chatContacts.splice(contactIndex, 1);
            chatContacts.unshift(chatContact);
        }
    }

    // Add the composed message to chat history - only the message text, not the subject
    const chatMessage = {
        id: Date.now(),
        text: messageText, // Only show the message content
        sent: true,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    chatMessages[chatContact.id].push(chatMessage);

    // Update chat UI if chat tab is active
    const chatTab = document.getElementById('chatTab');
    if (chatTab && chatTab.classList.contains('active')) {
        renderChatContacts();
        
        // If this contact was already selected, update the chat main area
        if (currentChatContact === chatContact.id) {
            renderChatMain(chatContact);
        }
    }
}

function simulateRecipientResponse(originalRecipient, originalSubject) {
    const responses = {
        "Property Manager": [
            "Thank you for your message. I'll review this and get back to you within 24 hours.",
            "I've received your message and will address your concerns promptly.",
            "Thanks for reaching out. I'll look into this matter right away."
        ],
        "Maintenance Team": [
            "We've logged your request. A technician will be assigned shortly.",
            "Thank you for the report. We'll schedule a maintenance visit.",
            "Request received. We'll have someone check this out today."
        ],
        "Front Desk": [
            "Thank you for contacting us. We'll assist you with this request.",
            "Message received. We'll take care of this right away.",
            "Thanks for letting us know. We're on it!"
        ],
        "Emergency Services": [
            "Your emergency report has been logged. Response team dispatched.",
            "Thank you for the alert. We're addressing this immediately.",
            "Emergency services notified. Help is on the way."
        ]
    };

    const defaultResponses = [
        "Thank you for your message. We'll get back to you soon.",
        "Message received. We'll review and respond accordingly.",
        "Thanks for reaching out. We'll address your concerns."
    ];

    const responseList = responses[originalRecipient] || defaultResponses;
    const response = responseList[Math.floor(Math.random() * responseList.length)];

    // Create response message
    const responseMessage = {
        id: Math.max(...messages.map(m => m.id)) + 1,
        sender: originalRecipient,
        subject: "Re: " + originalSubject,
        preview: response,
        time: "Just now",
        unread: true,
        priority: "medium"
    };

    messages.unshift(responseMessage);

    // Update the corresponding chat conversation
    updateChatFromReceivedMessage(originalRecipient, response);

    // Update UI
    renderMessages();
    updateMessagesBadge();
    
    showNotification(`New response from ${originalRecipient}`);
}

function updateChatFromReceivedMessage(senderName, messageText) {
    // Find the chat contact
    let chatContact = chatContacts.find(c => c.name === senderName);
    
    if (chatContact) {
        // Add the response to chat history
        const chatMessage = {
            id: Date.now() + Math.random(), // Ensure unique ID
            text: messageText,
            sent: false,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        chatMessages[chatContact.id].push(chatMessage);

        // Update contact info
        chatContact.lastMessage = messageText.length > 30 ? messageText.substring(0, 30) + '...' : messageText;
        chatContact.lastTime = 'Just now';

        // Move contact to top of the list
        const contactIndex = chatContacts.findIndex(c => c.id === chatContact.id);
        if (contactIndex > 0) {
            chatContacts.splice(contactIndex, 1);
            chatContacts.unshift(chatContact);
        }

        // If user is not currently viewing this chat, increment unread count
        if (currentChatContact !== chatContact.id) {
            chatContact.unreadCount = (chatContact.unreadCount || 0) + 1;
            updateChatBadge();
        }

        // Update chat UI if chat tab is active
        const chatTab = document.getElementById('chatTab');
        if (chatTab && chatTab.classList.contains('active')) {
            renderChatContacts();
            
            // If this contact is currently selected, update the chat main area
            if (currentChatContact === chatContact.id) {
                renderChatMain(chatContact);
            }
        }
    }
}

// Messages Functions - UPDATED for new container structure
function renderMessages() {
    const messagesList = document.getElementById('messagesList');
    if (!messagesList) return;
    
    let filteredMessages = messages;

    if (currentFilter !== 'all') {
        filteredMessages = messages.filter(msg => {
            switch (currentFilter) {
                case 'unread': return msg.unread;
                case 'urgent': return msg.priority === 'high';
                case 'maintenance': return msg.sender.includes('Maintenance');
                default: return true;
            }
        });
    }

    const searchInput = document.getElementById('searchInput');
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    if (searchTerm) {
        filteredMessages = filteredMessages.filter(msg => 
            msg.sender.toLowerCase().includes(searchTerm) ||
            msg.subject.toLowerCase().includes(searchTerm) ||
            msg.preview.toLowerCase().includes(searchTerm)
        );
    }

    // Calculate pagination
    const totalMessages = filteredMessages.length;
    totalPages = Math.ceil(totalMessages / messagesPerPage);
    
    // Ensure current page is valid
    if (currentPage > totalPages && totalPages > 0) {
        currentPage = totalPages;
    }
    if (currentPage < 1) {
        currentPage = 1;
    }

    // Get messages for current page
    const startIndex = (currentPage - 1) * messagesPerPage;
    const endIndex = startIndex + messagesPerPage;
    const paginatedMessages = filteredMessages.slice(startIndex, endIndex);

    // Render messages
    messagesList.innerHTML = paginatedMessages.map(message => `
        <div class="message-item ${message.unread ? 'unread' : ''}" onclick="openMessage(${message.id})">
            <div class="message-checkbox">
                <input type="checkbox" onclick="event.stopPropagation()">
            </div>
            <div class="message-content">
                <div class="message-header">
                    <span class="message-sender">
                        <span class="priority-indicator priority-${message.priority}"></span>
                        ${message.sender}${message.sent ? ' → ' + message.recipient : ''}
                    </span>
                    <span class="message-time">${message.time}</span>
                </div>
                <div class="message-subject">${message.subject}</div>
                <div class="message-preview">${message.preview}</div>
            </div>
            <div class="message-actions">
                <button class="action-btn view-btn" onclick="event.stopPropagation(); viewMessage(${message.id})" title="View & Chat">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="action-btn delete-btn" onclick="event.stopPropagation(); deleteMessage(${message.id})" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');

    // UPDATED: Handle pagination with new container structure
    const messagesListContainer = messagesList.parentElement;
    let paginationContainer = messagesListContainer.querySelector('.pagination-container');
    if (paginationContainer) {
        paginationContainer.remove();
    }

    if (totalMessages > messagesPerPage) {
        const paginationHTML = createPagination(totalMessages, currentPage, messagesPerPage);
        messagesListContainer.insertAdjacentHTML('beforeend', paginationHTML);
    }

    updateStats();
}

function setFilter(filter, buttonElement) {
    currentFilter = filter;
    currentPage = 1; // Reset to first page when changing filter
    
    // Update button states
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    buttonElement.classList.add('active');
    
    renderMessages();
}

function updateStats() {
    const unreadCount = messages.filter(msg => msg.unread).length;
    const unreadCountEl = document.getElementById('unreadCount');
    const totalCountEl = document.getElementById('totalCount');
    
    if (unreadCountEl) unreadCountEl.textContent = `${unreadCount} Unread`;
    if (totalCountEl) totalCountEl.textContent = `${messages.length} Total`;
}

function updateMessagesBadge() {
    const unreadCount = messages.filter(msg => msg.unread).length;
    const badge = document.getElementById('messagesBadge');
    if (badge) {
        if (unreadCount > 0) {
            badge.textContent = unreadCount;
            badge.style.display = 'flex';
        } else {
            badge.style.display = 'none';
        }
    }
}

function updateChatBadge() {
    const totalUnread = chatContacts.reduce((sum, contact) => sum + contact.unreadCount, 0);
    const badge = document.getElementById('chatBadge');
    if (badge) {
        if (totalUnread > 0) {
            badge.textContent = totalUnread;
            badge.style.display = 'flex';
        } else {
            badge.style.display = 'none';
        }
    }
}

function openMessage(messageId) {
    const message = messages.find(m => m.id === messageId);
    if (message) {
        message.unread = false;
        renderMessages();
        updateMessagesBadge();
        showNotification(`Opened: ${message.subject}`);
    }
}

function viewMessage(messageId) {
    const message = messages.find(m => m.id === messageId);
    if (!message) return;

    message.unread = false;
    
    const senderName = message.sent ? message.recipient : message.sender;
    let chatContact = chatContacts.find(c => c.name === senderName);
    if (!chatContact) {
        const newContactId = Math.max(...chatContacts.map(c => c.id)) + 1;
        chatContact = {
            id: newContactId,
            name: senderName,
            avatar: senderName.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase(),
            online: Math.random() > 0.5,
            lastMessage: message.preview.substring(0, 30) + '...',
            lastTime: message.time,
            unreadCount: 0
        };
        chatContacts.unshift(chatContact);
        
        chatMessages[chatContact.id] = [
            {
                id: 1,
                text: message.preview, // Only show the message content, not subject
                sent: message.sent || false,
                time: message.time
            }
        ];
    }

    switchTab('chat', document.querySelector('[onclick*="chat"]'));
    setTimeout(() => {
        selectChatContact(chatContact.id);
        renderChatContacts();
        updateMessagesBadge();
        showNotification(`Started chat with ${senderName}`);
    }, 100);
}

function editMessage(messageId) {
    const message = messages.find(m => m.id === messageId);
    if (!message) return;

    currentEditingMessage = messageId;
    
    document.getElementById('editSender').value = message.sender;
    document.getElementById('editSubject').value = message.subject;
    document.getElementById('editPreview').value = message.preview;
    
    showModal('editModal');
}

function deleteMessage(messageId) {
    const message = messages.find(m => m.id === messageId);
    if (!message) return;

    messageToDelete = messageId;
    
    document.getElementById('deleteSubject').textContent = message.subject;
    document.getElementById('deleteSender').textContent = `From: ${message.sender} • ${message.time}`;
    
    showModal('deleteModal');
}

function saveMessage() {
    if (!currentEditingMessage) return;

    const message = messages.find(m => m.id === currentEditingMessage);
    if (!message) return;

    message.subject = document.getElementById('editSubject').value;
    message.preview = document.getElementById('editPreview').value;

    renderMessages();
    closeModal('editModal');
    showNotification('Message updated successfully');
    
    currentEditingMessage = null;
}

function confirmDeleteMessage() {
    if (!messageToDelete) return;

    const messageIndex = messages.findIndex(m => m.id === messageToDelete);
    if (messageIndex !== -1) {
        messages.splice(messageIndex, 1);
        
        // Check if we need to adjust current page after deletion
        const totalMessages = messages.length;
        const newTotalPages = Math.ceil(totalMessages / messagesPerPage);
        
        if (currentPage > newTotalPages && newTotalPages > 0) {
            currentPage = newTotalPages;
        }
        
        renderMessages();
        updateMessagesBadge();
        closeModal('deleteModal');
        showNotification('Message deleted');
    }
    
    messageToDelete = null;
}

// Chat Message Edit/Delete Functions
function editChatMessage(chatContactId, messageId) {
    const contact = chatContacts.find(c => c.id === chatContactId);
    if (!contact) return;

    const chatMessage = chatMessages[chatContactId]?.find(m => m.id === messageId);
    if (!chatMessage || !chatMessage.sent) return; // Only allow editing sent messages

    currentEditingChatMessage = { chatContactId, messageId };
    
    // Create and show edit modal for chat message
    const editChatModal = createEditChatMessageModal(chatMessage);
    document.body.appendChild(editChatModal);
    showModal('editChatMessageModal');
}

function deleteChatMessage(chatContactId, messageId) {
    const contact = chatContacts.find(c => c.id === chatContactId);
    if (!contact) return;

    const chatMessage = chatMessages[chatContactId]?.find(m => m.id === messageId);
    if (!chatMessage) return;

    chatMessageToDelete = { chatContactId, messageId };
    
    // Create and show delete confirmation modal for chat message
    const deleteChatModal = createDeleteChatMessageModal(chatMessage, contact);
    document.body.appendChild(deleteChatModal);
    showModal('deleteChatMessageModal');
}

function createEditChatMessageModal(chatMessage) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'editChatMessageModal';
    modal.innerHTML = `
        <div class="modal">
            <div class="modal-header">
                <h3>Edit Message</h3>
                <button class="modal-close" onclick="closeEditChatMessageModal()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="modal-field">
                    <label for="editChatMessageText">Message</label>
                    <textarea id="editChatMessageText" rows="4" placeholder="Edit your message...">${chatMessage.text}</textarea>
                </div>
            </div>
            <div class="modal-actions">
                <button class="modal-btn secondary" onclick="closeEditChatMessageModal()">Cancel</button>
                <button class="modal-btn primary" onclick="saveChatMessage()">
                    <i class="fas fa-save"></i> Save Changes
                </button>
            </div>
        </div>
    `;
    return modal;
}

function createDeleteChatMessageModal(chatMessage, contact) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'deleteChatMessageModal';
    modal.innerHTML = `
        <div class="modal">
            <div class="modal-header">
                <h3>Delete Message</h3>
                <button class="modal-close" onclick="closeDeleteChatMessageModal()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <p>Are you sure you want to delete this message? This action cannot be undone.</p>
                <div style="margin-top: 16px; padding: 12px; background: #f8f9fb; border-radius: 8px;">
                    <strong>Message:</strong> ${chatMessage.text.length > 50 ? chatMessage.text.substring(0, 50) + '...' : chatMessage.text}
                    <div style="color: #64748b; font-size: 14px; margin-top: 4px;">To: ${contact.name} • ${chatMessage.time}</div>
                </div>
            </div>
            <div class="modal-actions">
                <button class="modal-btn secondary" onclick="closeDeleteChatMessageModal()">Cancel</button>
                <button class="modal-btn danger" onclick="confirmDeleteChatMessage()">Delete Message</button>
            </div>
        </div>
    `;
    return modal;
}

function saveChatMessage() {
    if (!currentEditingChatMessage) return;

    const { chatContactId, messageId } = currentEditingChatMessage;
    const newText = document.getElementById('editChatMessageText').value.trim();
    
    if (!newText) {
        showNotification('Message cannot be empty');
        return;
    }

    const chatMessage = chatMessages[chatContactId]?.find(m => m.id === messageId);
    if (chatMessage) {
        chatMessage.text = newText;
        chatMessage.edited = true;
        
        // Update contact's last message if this was the most recent message
        const contact = chatContacts.find(c => c.id === chatContactId);
        const lastMessage = chatMessages[chatContactId][chatMessages[chatContactId].length - 1];
        if (contact && lastMessage.id === messageId) {
            contact.lastMessage = newText.length > 30 ? newText.substring(0, 30) + '...' : newText;
            renderChatContacts();
        }
        
        if (currentChatContact === chatContactId) {
            renderChatMain(contact);
        }
        
        showNotification('Message updated successfully');
    }

    closeEditChatMessageModal();
    currentEditingChatMessage = null;
}

function confirmDeleteChatMessage() {
    if (!chatMessageToDelete) return;

    const { chatContactId, messageId } = chatMessageToDelete;
    const messageIndex = chatMessages[chatContactId]?.findIndex(m => m.id === messageId);
    
    if (messageIndex !== -1) {
        chatMessages[chatContactId].splice(messageIndex, 1);
        
        // Update contact's last message
        const contact = chatContacts.find(c => c.id === chatContactId);
        if (contact) {
            const lastMessage = chatMessages[chatContactId][chatMessages[chatContactId].length - 1];
            if (lastMessage) {
                contact.lastMessage = lastMessage.text.length > 30 ? lastMessage.text.substring(0, 30) + '...' : lastMessage.text;
            } else {
                contact.lastMessage = 'No messages';
            }
            renderChatContacts();
        }
        
        if (currentChatContact === chatContactId) {
            renderChatMain(contact);
        }
        
        showNotification('Message deleted');
    }

    closeDeleteChatMessageModal();
    chatMessageToDelete = null;
}

function closeEditChatMessageModal() {
    const modal = document.getElementById('editChatMessageModal');
    if (modal) {
        closeModal('editChatMessageModal');
        setTimeout(() => modal.remove(), 300);
    }
}

function closeDeleteChatMessageModal() {
    const modal = document.getElementById('deleteChatMessageModal');
    if (modal) {
        closeModal('deleteChatMessageModal');
        setTimeout(() => modal.remove(), 300);
    }
}

// Image Upload Functions
function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
        showNotification('Please select an image file');
        return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
        showNotification('Image size should be less than 5MB');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const imageData = e.target.result;
        sendImageMessage(imageData, file.name);
    };
    reader.readAsDataURL(file);
}

function sendImageMessage(imageData, fileName) {
    if (!currentChatContact) return;

    if (!chatMessages[currentChatContact]) {
        chatMessages[currentChatContact] = [];
    }

    const newMessage = {
        id: Date.now(),
        text: '',
        image: imageData,
        fileName: fileName,
        sent: true,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    chatMessages[currentChatContact].push(newMessage);

    const contact = chatContacts.find(c => c.id === currentChatContact);
    if (contact) {
        contact.lastMessage = `📷 Image: ${fileName}`;
        contact.lastTime = 'Just now';
        
        renderChatContacts();
        renderChatMain(contact);
    }

    showNotification('Image sent');

    // Clear the file input
    const fileInput = document.getElementById('imageUpload');
    if (fileInput) fileInput.value = '';
}

// Modal Functions
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = '';
    }
}

// Close modal when clicking outside
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal-overlay')) {
        closeModal(e.target.id);
    }
});

// Chat Functions
function renderChatContacts() {
    const chatContactsContainer = document.getElementById('chatContacts');
    if (!chatContactsContainer) return;
    
    chatContactsContainer.innerHTML = chatContacts.map(contact => `
        <div class="contact-item ${currentChatContact === contact.id ? 'active' : ''}" onclick="selectChatContact(${contact.id})">
            <div class="contact-avatar ${contact.online ? 'online' : ''}">${contact.avatar}</div>
            <div class="contact-info">
                <div class="contact-name">${contact.name}</div>
                <div class="contact-last-message">${contact.lastMessage}</div>
            </div>
            <div class="contact-meta">
                <div class="contact-time">${contact.lastTime}</div>
                ${contact.unreadCount > 0 ? `<div class="unread-count">${contact.unreadCount}</div>` : ''}
            </div>
        </div>
    `).join('');
}

function selectChatContact(contactId) {
    currentChatContact = contactId;
    const contact = chatContacts.find(c => c.id === contactId);
    
    if (!contact) return;
    
    if (contact.unreadCount > 0) {
        contact.unreadCount = 0;
        renderChatContacts();
        updateChatBadge();
    }

    renderChatMain(contact);
}

function renderChatMain(contact) {
    const chatMain = document.getElementById('chatMain');
    if (!chatMain) return;
    
    const messages = chatMessages[contact.id] || [];

    chatMain.innerHTML = `
        <div class="chat-main-header" style="padding: 20px 24px; background: white; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; gap: 16px; flex-shrink: 0;">
            <div class="current-chat-avatar" style="width: 48px; height: 48px; border-radius: 50%; background: linear-gradient(135deg, #667eea, #764ba2); color: white; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 18px;">${contact.avatar}</div>
            <div class="current-chat-info">
                <h3 style="font-weight: 600; color: #1a1f23; margin-bottom: 2px; font-size: 18px;">${contact.name}</h3>
                <div class="status" style="color: ${contact.online ? '#10b981' : '#64748b'}; font-size: 13px;">${contact.online ? 'Online' : 'Offline'}</div>
            </div>
        </div>
        <div class="chat-messages" style="flex: 1; overflow-y: auto; padding: 20px; background: #f8f9fb;">
            ${renderChatMessages(messages)}
        </div>
        <div class="chat-input-container">
            <div class="chat-input-wrapper">
                <button class="image-upload-btn" onclick="document.getElementById('imageUpload').click()" title="Upload Image" style="width: 36px; height: 36px; border: none; background: #e2e8f0; color: #64748b; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s;">
                    <i class="fas fa-image"></i>
                </button>
                <input type="file" id="imageUpload" accept="image/*" onchange="handleImageUpload(event)" style="display: none;">
                <textarea class="chat-input" id="chatInput" placeholder="Type a message..." rows="1" onkeydown="handleChatKeyDown(event)" oninput="autoResizeTextarea(this)" onfocus="focusChatInput(this)" onblur="blurChatInput(this)" style="flex: 1; border: none; background: none; resize: none; font-size: 16px; min-height: 20px; max-height: 100px; line-height: 1.6; font-family: inherit; outline: none;"></textarea>
                <button class="chat-send-btn" id="chatSendBtn" onclick="sendChatMessage()" disabled style="width: 36px; height: 36px; border: none; background: linear-gradient(135deg, #667eea, #764ba2); color: white; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s;">
                    <i class="fas fa-paper-plane"></i>
                </button>
            </div>
        </div>
    `;

    // Scroll to bottom after rendering
    setTimeout(() => {
        const chatMessagesContainer = chatMain.querySelector('.chat-messages');
        if (chatMessagesContainer) {
            chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
        }
        
        // Focus on input
        const chatInput = document.getElementById('chatInput');
        if (chatInput) chatInput.focus();
    }, 100);
}

function renderChatMessages(messages) {
    return messages.map(message => `
        <div class="message-group" style="margin-bottom: 20px;">
            <div class="message-bubble ${message.sent ? 'sent' : 'received'}" style="max-width: 70%; padding: 12px 16px; border-radius: 16px; margin-bottom: 4px; position: relative; word-wrap: break-word; ${message.sent ? 'background: linear-gradient(135deg, #667eea, #764ba2); color: white; margin-left: auto; border-bottom-right-radius: 4px;' : 'background: white; color: #1a1f23; border-bottom-left-radius: 4px; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);'}" ${message.sent ? `onmouseover="showChatMessageActions(this, ${currentChatContact}, ${message.id})" onmouseleave="hideChatMessageActions(this)"` : ''}>
                ${message.image ? `
                    <div class="image-message">
                        <img src="${message.image}" alt="${message.fileName}" style="max-width: 100%; height: auto; border-radius: 8px; margin-bottom: ${message.text ? '8px' : '0'};">
                        ${message.text ? `<div class="image-caption">${message.text}</div>` : ''}
                    </div>
                ` : message.text}
                ${message.edited ? '<div style="font-size: 10px; opacity: 0.7; margin-top: 4px; font-style: italic;">edited</div>' : ''}
                <div class="message-time" style="font-size: 11px; opacity: 0.7; margin-top: 4px; ${message.sent ? 'text-align: right;' : 'text-align: left;'}">${message.time}</div>
                ${message.sent ? `
                    <div class="chat-message-actions" style="position: absolute; top: -12px; right: 8px; background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.15); display: none; padding: 4px; gap: 4px;">
                        <button onclick="editChatMessage(${currentChatContact}, ${message.id})" style="width: 24px; height: 24px; border: none; background: none; cursor: pointer; color: #64748b; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 12px;" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="deleteChatMessage(${currentChatContact}, ${message.id})" style="width: 24px; height: 24px; border: none; background: none; cursor: pointer; color: #ef4444; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 12px;" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                ` : ''}
            </div>
        </div>
    `).join('');
}

function showChatMessageActions(element, contactId, messageId) {
    const actions = element.querySelector('.chat-message-actions');
    if (actions) {
        actions.style.display = 'flex';
    }
}

function hideChatMessageActions(element) {
    const actions = element.querySelector('.chat-message-actions');
    if (actions) {
        actions.style.display = 'none';
    }
}

function sendChatMessage() {
    const input = document.getElementById('chatInput');
    if (!input) return;
    
    const message = input.value.trim();
    
    if (!message || !currentChatContact) return;

    if (!chatMessages[currentChatContact]) {
        chatMessages[currentChatContact] = [];
    }

    const newMessage = {
        id: Date.now(),
        text: message,
        sent: true,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    chatMessages[currentChatContact].push(newMessage);

    input.value = '';
    input.style.height = '20px';
    const sendBtn = document.getElementById('chatSendBtn');
    if (sendBtn) sendBtn.disabled = true;

    const contact = chatContacts.find(c => c.id === currentChatContact);
    if (contact) {
        contact.lastMessage = message;
        contact.lastTime = 'Just now';
        
        renderChatContacts();
        renderChatMain(contact);
    }

    setTimeout(() => {
        simulateResponse();
    }, 2000 + Math.random() * 3000);
}

function simulateResponse() {
    if (!currentChatContact) return;

    const responses = [
        "Thank you for reaching out! I'll look into this right away.",
        "I understand your concern. Let me check on that for you.",
        "Thanks for letting us know. We'll take care of this promptly.",
        "I'll forward this to the appropriate team and get back to you.",
        "No problem! Is there anything else I can help you with?",
        "Got it! I'll make sure this gets resolved quickly.",
        "Thank you for the update. Everything looks good on our end.",
        "I'll schedule someone to address this issue tomorrow."
    ];

    const response = responses[Math.floor(Math.random() * responses.length)];
    
    setTimeout(() => {
        const responseMessage = {
            id: Date.now(),
            text: response,
            sent: false,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        chatMessages[currentChatContact].push(responseMessage);
        
        const contact = chatContacts.find(c => c.id === currentChatContact);
        if (contact) {
            contact.lastMessage = response;
            contact.lastTime = 'Just now';
            
            renderChatContacts();
            renderChatMain(contact);

            const chatTab = document.getElementById('chatTab');
            if (chatTab && !chatTab.classList.contains('active')) {
                contact.unreadCount = (contact.unreadCount || 0) + 1;
                renderChatContacts();
                updateChatBadge();
                showNotification(`New message from ${contact.name}`);
            }
        }
    }, 1500);
}

function handleChatKeyDown(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendChatMessage();
    }
}

function focusChatInput(textarea) {
    const wrapper = textarea.parentElement;
    if (wrapper) {
        wrapper.style.borderColor = '#667eea';
        wrapper.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
    }
}

function blurChatInput(textarea) {
    const wrapper = textarea.parentElement;
    if (wrapper) {
        wrapper.style.borderColor = '#e2e8f0';
        wrapper.style.boxShadow = 'none';
    }
}

function autoResizeTextarea(textarea) {
    if (!textarea) return;
    
    textarea.style.height = '20px';
    textarea.style.height = Math.min(textarea.scrollHeight, 100) + 'px';
    
    const sendBtn = document.getElementById('chatSendBtn');
    if (sendBtn) {
        sendBtn.disabled = !textarea.value.trim();
    }
}

// Utility Functions
function setupEventListeners() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            const filter = this.textContent.toLowerCase();
            setFilter(filter, this);
        });
    });

    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            currentPage = 1; // Reset to first page when searching
            renderMessages();
        });
    }

    const chatSearchInput = document.getElementById('chatSearchInput');
    if (chatSearchInput) {
        chatSearchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const contacts = document.querySelectorAll('.contact-item');
            contacts.forEach(contact => {
                const nameEl = contact.querySelector('.contact-name');
                if (nameEl) {
                    const name = nameEl.textContent.toLowerCase();
                    contact.style.display = name.includes(searchTerm) ? 'flex' : 'none';
                }
            });
        });
    }
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 3000);
}