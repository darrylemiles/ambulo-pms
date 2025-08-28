       // Extended sample data
        const allMessages = [
            {
                id: 1,
                sender: "Property Manager",
                subject: "Monthly Rent Reminder - Unit 4B",
                preview: "Your rent payment for this month is due on the 30th. Please ensure timely payment to avoid late fees and maintain your good standing with the property. You can make payments online through our tenant portal or visit our office during business hours.",
                fullText: "Dear Tenant,\n\nYour rent payment for this month is due on the 30th. Please ensure timely payment to avoid late fees and maintain your good standing with the property.\n\nYou can make payments online through our tenant portal or visit our office during business hours (9 AM - 5 PM, Monday through Friday). If you have any questions about your payment or need assistance with the online portal, please don't hesitate to contact us.\n\nThank you for your prompt attention to this matter.\n\nBest regards,\nProperty Management Team",
                time: "2 hours ago",
                fullDate: "2024-08-26 14:30",
                unread: true,
                priority: "high",
                tags: ["urgent", "payment"],
                category: "payment"
            },
            {
                id: 2,
                sender: "Maintenance Team",
                subject: "Work Order #2024-0156 Completed - Plumbing Issue",
                preview: "The plumbing issue in your apartment has been successfully resolved. Our certified technician completed the work and performed quality checks to ensure everything is functioning properly. Please test the water pressure and let us know if you experience any issues.",
                fullText: "Dear Tenant,\n\nWe are pleased to inform you that the plumbing issue in your apartment (Work Order #2024-0156) has been successfully resolved.\n\nOur certified technician completed the following work:\n- Replaced the faulty valve in the main water line\n- Tested water pressure throughout the unit\n- Checked all faucets and fixtures for proper operation\n- Cleaned up the work area\n\nThe work was completed on 2024-08-25 at 3:30 PM. Please test the water pressure in your kitchen and bathroom and let us know if you experience any issues within the next 24 hours.\n\nIf you have any concerns or notice any problems, please contact our maintenance hotline at (555) 123-4567.\n\nThank you for your patience during the repair process.\n\nBest regards,\nMaintenance Team",
                time: "1 day ago",
                fullDate: "2024-08-25 10:15",
                unread: true,
                priority: "medium",
                tags: ["maintenance", "completed"],
                category: "maintenance"
            },
            {
                id: 3,
                sender: "Ambulo Properties",
                subject: "Lease Renewal Opportunity - Special Offer",
                preview: "Your lease agreement is set to expire in 60 days. We would like to discuss renewal options and updated terms. Please contact us at your earliest convenience to secure your preferred renewal terms and avoid any disruption to your residency.",
                fullText: "Dear Valued Tenant,\n\nWe hope this message finds you well. Your current lease agreement is set to expire on October 25, 2024 (60 days from now).\n\nWe would be delighted to offer you a lease renewal with the following benefits:\n- Lock in current rental rates for 12 months\n- No application fees for renewal\n- Priority access to building amenities\n- Flexible lease terms available\n\nTo discuss your renewal options and secure your preferred terms, please contact our leasing office at:\nPhone: (555) 987-6543\nEmail: leasing@ambuloproperties.com\nOffice Hours: Monday-Friday 9AM-6PM, Saturday 10AM-4PM\n\nWe value you as a tenant and look forward to continuing our positive relationship.\n\nBest regards,\nAmbulo Properties Leasing Team",
                time: "3 days ago",
                fullDate: "2024-08-23 09:00",
                unread: false,
                priority: "medium",
                tags: ["lease", "renewal"],
                category: "lease"
            },
            {
                id: 4,
                sender: "Community Manager",
                subject: "Exciting Building Amenity Updates",
                preview: "We're excited to announce new premium amenities coming to your building including a state-of-the-art fitness center, rooftop garden, and co-working spaces. These improvements are part of our ongoing commitment to enhancing your living experience.",
                fullText: "Dear Residents,\n\nWe are thrilled to announce exciting new amenities coming to your building as part of our $2.5 million renovation project!\n\nNew Amenities Include:\n🏋️ State-of-the-art fitness center with cardio equipment, weights, and yoga studio\n🌱 Rooftop garden with seating areas and city views\n💼 Modern co-working spaces with high-speed internet and printing facilities\n🎮 Game room with pool table, gaming consoles, and entertainment area\n📚 Quiet study lounge with comfortable seating\n\nConstruction Timeline:\n- Phase 1 (Fitness Center): September 1 - October 15, 2024\n- Phase 2 (Rooftop Garden): October 16 - November 30, 2024\n- Phase 3 (Co-working Spaces): December 1 - January 15, 2025\n\nWe appreciate your patience during construction and look forward to these amazing additions to your home!\n\nBest regards,\nCommunity Management Team",
                time: "1 week ago",
                fullDate: "2024-08-19 16:45",
                unread: false,
                priority: "low",
                tags: ["amenities"],
                category: "community"
            },
            {
                id: 5,
                sender: "Security Office",
                subject: "Package Delivery Notification",
                preview: "A package has been delivered to your unit and is currently being held at the front desk. Please bring a valid ID to collect your delivery during office hours (9 AM - 6 PM, Monday through Friday). The package is from Amazon and requires signature confirmation.",
                fullText: "Dear Tenant,\n\nPackage Delivery Notification\n\nA package has been delivered for your unit and is currently being held securely at the front desk.\n\nPackage Details:\n- Sender: Amazon\n- Tracking Number: 1Z999AA1234567890\n- Delivered: August 12, 2024 at 2:15 PM\n- Requires: Signature confirmation and valid ID\n\nCollection Information:\n- Location: Building Front Desk\n- Hours: 9 AM - 6 PM, Monday through Friday\n- Required: Valid photo ID matching your lease agreement\n\nPlease collect your package within 10 business days. After this period, packages may be returned to sender.\n\nIf you have any questions or need to arrange special collection times, please contact our front desk at (555) 555-0123.\n\nBest regards,\nBuilding Security Team",
                time: "2 weeks ago",
                fullDate: "2024-08-12 11:30",
                unread: false,
                priority: "medium",
                tags: ["delivery"],
                category: "notification"
            },
            {
                id: 6,
                sender: "Property Manager",
                subject: "Building Maintenance Schedule - Elevator Service",
                preview: "Scheduled maintenance on elevator #2 will take place this Thursday from 9 AM to 2 PM. Please plan accordingly and use elevator #1 or the stairs during this time. We apologize for any inconvenience and appreciate your understanding.",
                fullText: "Dear Residents,\n\nScheduled Elevator Maintenance Notice\n\nWe will be conducting routine maintenance on Elevator #2 to ensure continued safe and reliable operation.\n\nMaintenance Schedule:\n- Date: Thursday, August 15, 2024\n- Time: 9:00 AM - 2:00 PM\n- Elevator Affected: #2 (Right elevator bank)\n- Expected Duration: 5 hours\n\nDuring this time:\n- Elevator #1 will remain in full operation\n- Stairs are available on both ends of the building\n- Moving assistance available upon request (please call ahead)\n- Maintenance crew will be on-site for any urgent needs\n\nWe recommend:\n- Planning errands outside these hours if possible\n- Using Elevator #1 for heavy items\n- Allowing extra time for vertical transportation\n\nWe apologize for any inconvenience and appreciate your understanding as we maintain our building's infrastructure.\n\nContact: (555) 999-8888 for questions or assistance\n\nBest regards,\nProperty Management Team",
                time: "2 weeks ago",
                fullDate: "2024-08-12 08:00",
                unread: true,
                priority: "medium",
                tags: ["maintenance", "schedule"],
                category: "maintenance"
            },
            {
                id: 7,
                sender: "Billing Department",
                subject: "Utility Bill Statement - July 2024",
                preview: "Your utility bill for July 2024 is now available in your tenant portal. The total amount due is $156.78, which includes electricity, water, and common area charges. Payment is due by the 15th of next month.",
                fullText: "Dear Tenant,\n\nYour utility statement for July 2024 is now available.\n\nStatement Summary:\n- Electricity: $89.45\n- Water/Sewer: $34.12\n- Common Area Charges: $24.67\n- Administrative Fee: $8.54\n- Total Amount Due: $156.78\n\nPayment Details:\n- Due Date: August 15, 2024\n- Account Number: 4458792\n- Late Fee: $25.00 (applied after due date)\n\nPayment Options:\n1. Online: Visit our tenant portal at portal.ambuloproperties.com\n2. Phone: Call (555) 333-2222 (24/7 automated system)\n3. Mail: Send check to PO Box 12345, Metro City, State 12345\n4. Office: Visit our office during business hours\n\nYour statement is also available for download in your tenant portal under 'Billing History'.\n\nFor questions about your utility charges or payment options, please contact our billing department at billing@ambuloproperties.com or (555) 333-2200.\n\nThank you for your prompt payment.\n\nBest regards,\nBilling Department",
                time: "3 weeks ago",
                fullDate: "2024-08-05 14:20",
                unread: false,
                priority: "medium",
                tags: ["billing", "utilities"],
                category: "payment"
            },
            {
                id: 8,
                sender: "Emergency Services",
                subject: "URGENT: Water Main Break - Temporary Service Interruption",
                preview: "Due to an unexpected water main break, water service to your building will be temporarily interrupted from 6 PM today until approximately 8 AM tomorrow. We have arranged for temporary water stations in the lobby. Emergency services are working to resolve this issue as quickly as possible.",
                fullText: "URGENT NOTICE - IMMEDIATE ACTION REQUIRED\n\nDear Residents,\n\nWe regret to inform you of an unexpected water main break that will affect water service to your building.\n\nService Interruption Details:\n- Start Time: Today, 6:00 PM\n- Estimated End: Tomorrow, 8:00 AM\n- Affected Services: Hot and cold water, water pressure\n- Unaffected: Electricity, internet, heating/cooling\n\nTemporary Measures:\n✓ Water stations set up in main lobby\n✓ Bottled water available (2 gallons per unit)\n✓ Portable restroom facilities on ground floor\n✓ Emergency maintenance crew on-site\n\nWhat You Should Do:\n1. Fill containers with water before 6 PM today\n2. Plan bathroom visits accordingly\n3. Collect bottled water from lobby if needed\n4. Report any urgent issues to front desk\n\nProgress Updates:\n- We will provide hourly updates via email and building notices\n- Text alerts available (text WATER to 55555 to subscribe)\n- 24-hour hotline: (555) 911-HELP\n\nWe sincerely apologize for this emergency situation and are working around the clock to restore normal service as quickly as possible.\n\nThank you for your patience and cooperation.\n\nEmergency Response Team\nAmbulo Properties",
                time: "1 month ago",
                fullDate: "2024-07-26 15:45",
                unread: true,
                priority: "high",
                tags: ["urgent", "emergency"],
                category: "emergency"
            }
        ];

        let currentFilter = 'all';
        let currentPage = 1;
        const messagesPerPage = 5;
        let filteredMessages = [...allMessages];
        let selectedMessages = new Set();
        let currentReplyMessageId = null;
        let currentViewMessageId = null;

        // Initialize the page
        function initializePage() {
            updateStats();
            renderMessages();
            setupEventListeners();
            renderPagination();
        }

        // Update statistics
        function updateStats() {
            const unreadCount = allMessages.filter(msg => msg.unread).length;
            document.getElementById('unreadCount').textContent = `${unreadCount} Unread`;
            document.getElementById('totalCount').textContent = `${allMessages.length} Total`;
        }

        // Filter messages based on current filter
        function filterMessages() {
            let filtered = [...allMessages];
            
            const searchTerm = document.getElementById('searchInput').value.toLowerCase();
            
            // Apply search filter
            if (searchTerm) {
                filtered = filtered.filter(msg => 
                    msg.sender.toLowerCase().includes(searchTerm) ||
                    msg.subject.toLowerCase().includes(searchTerm) ||
                    msg.preview.toLowerCase().includes(searchTerm)
                );
            }
            
            // Apply category filter
            if (currentFilter !== 'all') {
                filtered = filtered.filter(msg => {
                    switch (currentFilter) {
                        case 'unread':
                            return msg.unread;
                        case 'urgent':
                            return msg.priority === 'high' || msg.tags.includes('urgent');
                        case 'maintenance':
                            return msg.category === 'maintenance';
                        case 'lease':
                            return msg.category === 'lease';
                        default:
                            return true;
                    }
                });
            }
            
            filteredMessages = filtered;
            currentPage = 1; // Reset to first page when filtering
        }

        // Toggle select all functionality
        function toggleSelectAll() {
            const selectAllCheckbox = document.getElementById('selectAll');
            const currentPageMessages = getCurrentPageMessages();
            
            if (selectAllCheckbox.checked) {
                // Select all messages on current page
                currentPageMessages.forEach(msg => selectedMessages.add(msg.id));
            } else {
                // Deselect all messages on current page
                currentPageMessages.forEach(msg => selectedMessages.delete(msg.id));
            }
            
            updateBulkActions();
            renderMessages();
        }

        // Get messages for current page
        function getCurrentPageMessages() {
            const startIndex = (currentPage - 1) * messagesPerPage;
            const endIndex = startIndex + messagesPerPage;
            return filteredMessages.slice(startIndex, endIndex);
        }

        // Update select all checkbox state
        function updateSelectAllState() {
            const selectAllCheckbox = document.getElementById('selectAll');
            const currentPageMessages = getCurrentPageMessages();
            const selectedOnPage = currentPageMessages.filter(msg => selectedMessages.has(msg.id));
            
            if (selectedOnPage.length === 0) {
                selectAllCheckbox.checked = false;
                selectAllCheckbox.indeterminate = false;
            } else if (selectedOnPage.length === currentPageMessages.length) {
                selectAllCheckbox.checked = true;
                selectAllCheckbox.indeterminate = false;
            } else {
                selectAllCheckbox.checked = false;
                selectAllCheckbox.indeterminate = true;
            }
        }

        // Update bulk actions visibility and state
        function updateBulkActions() {
            const bulkActions = document.getElementById('bulkActions');
            const selectedCount = selectedMessages.size;
            
            if (selectedCount > 0) {
                bulkActions.style.display = 'flex';
                
                // Update button text with count
                const markReadBtn = document.getElementById('markReadBtn');
                const replyBtn = document.getElementById('replyBtn');
                const deleteBtn = document.getElementById('deleteBtn');
                
                markReadBtn.textContent = `✓ Mark as Read (${selectedCount})`;
                replyBtn.textContent = `💬 Reply (${selectedCount})`;
                deleteBtn.textContent = `🗑️ Delete (${selectedCount})`;
                
                // Disable reply button if more than one selected
                if (selectedCount > 1) {
                    replyBtn.style.opacity = '0.6';
                    replyBtn.title = 'Reply works with single messages only';
                } else {
                    replyBtn.style.opacity = '1';
                    replyBtn.title = 'Reply to selected message';
                }
            } else {
                bulkActions.style.display = 'none';
            }
            
            updateSelectAllState();
        }

        // Render messages for current page
        function renderMessages() {
            filterMessages();
            
            const messagesList = document.getElementById('messagesList');
            const startIndex = (currentPage - 1) * messagesPerPage;
            const endIndex = startIndex + messagesPerPage;
            const currentMessages = filteredMessages.slice(startIndex, endIndex);
            
            if (currentMessages.length === 0) {
                messagesList.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-icon">📭</div>
                        <h3 class="empty-title">No messages found</h3>
                        <p class="empty-description">Try adjusting your filters or search terms</p>
                    </div>
                `;
                updateSelectAllState();
                return;
            }
            
            messagesList.innerHTML = currentMessages.map(message => `
                <div class="message-item ${message.unread ? 'unread' : ''} ${selectedMessages.has(message.id) ? 'selected' : ''}" 
                     onclick="openMessage(${message.id})" data-id="${message.id}">
                    <div class="message-checkbox" onclick="event.stopPropagation()">
                        <input type="checkbox" 
                               ${selectedMessages.has(message.id) ? 'checked' : ''}
                               onchange="toggleMessageSelection(${message.id})">
                    </div>
                    <div class="message-content">
                        <div class="message-header">
                            <div class="message-sender-section">
                                <span class="message-sender">${message.sender}</span>
                                <div class="priority-indicator ${message.priority}"></div>
                            </div>
                            <div class="message-meta">
                                <span class="message-time">${message.time}</span>
                                <div class="message-actions">
                                    <button class="action-icon" onclick="event.stopPropagation(); replyToMessage(${message.id})" title="Reply">
                                        <i class="fa-solid fa-message"></i>
                                    </button>
                                    <button class="action-icon" onclick="event.stopPropagation(); deleteMessage(${message.id})" title="Delete">
                                        <i class="fa-solid fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div class="message-subject">${message.subject}</div>
                        <div class="message-preview">${message.preview}</div>
                        ${message.tags && message.tags.length > 0 ? `
                            <div class="message-tags">
                                ${message.tags.map(tag => `<span class="tag ${tag}">${tag}</span>`).join('')}
                            </div>
                        ` : ''}
                    </div>
                </div>
            `).join('');
            
            updateSelectAllState();
            renderPagination();
        }

        // Render pagination
        function renderPagination() {
            const pagination = document.getElementById('pagination');
            const totalPages = Math.ceil(filteredMessages.length / messagesPerPage);
            
            if (totalPages <= 1) {
                pagination.innerHTML = '';
                return;
            }
            
            let paginationHTML = '';
            
            // Previous button
            paginationHTML += `<button class="pagination-btn" ${currentPage === 1 ? 'disabled' : ''} onclick="changePage(${currentPage - 1})">← Previous</button>`;
            
            // Page numbers
            for (let i = 1; i <= totalPages; i++) {
                if (i === currentPage || i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
                    paginationHTML += `<button class="pagination-btn ${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">${i}</button>`;
                } else if (i === currentPage - 2 || i === currentPage + 2) {
                    paginationHTML += `<span class="pagination-btn" style="border: none; background: none;">...</span>`;
                }
            }
            
            // Next button
            paginationHTML += `<button class="pagination-btn" ${currentPage === totalPages ? 'disabled' : ''} onclick="changePage(${currentPage + 1})">Next →</button>`;
            
            pagination.innerHTML = paginationHTML;
        }

        // Change page
        function changePage(page) {
            currentPage = page;
            renderMessages();
            
            // Scroll to top of messages
            document.querySelector('.messages-list').scrollIntoView({ behavior: 'smooth' });
        }

        // Setup event listeners
        function setupEventListeners() {
            // Filter buttons
            document.querySelectorAll('.filter-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                    this.classList.add('active');
                    currentFilter = this.dataset.filter;
                    renderMessages();
                });
            });

            // Search input
            document.getElementById('searchInput').addEventListener('input', function() {
                renderMessages();
            });
        }

        // Toggle message selection
        function toggleMessageSelection(messageId) {
            if (selectedMessages.has(messageId)) {
                selectedMessages.delete(messageId);
            } else {
                selectedMessages.add(messageId);
            }
            
            updateBulkActions();
            renderMessages();
        }

        // Mark selected messages as read
        function markSelectedAsRead() {
            selectedMessages.forEach(id => {
                const message = allMessages.find(msg => msg.id === id);
                if (message) {
                    message.unread = false;
                }
            });
            
            selectedMessages.clear();
            updateStats();
            updateBulkActions();
            renderMessages();
            
            // Show success message
            showNotification('Messages marked as read successfully!', 'success');
        }

        // Reply to selected messages
        function replyToSelected() {
            if (selectedMessages.size === 1) {
                const messageId = Array.from(selectedMessages)[0];
                replyToMessage(messageId);
            } else if (selectedMessages.size > 1) {
                showNotification(`You have selected ${selectedMessages.size} messages. Reply functionality works with individual messages only.`, 'warning');
            }
        }

        // Delete selected messages
        function deleteSelected() {
            if (confirm(`Are you sure you want to delete ${selectedMessages.size} selected message(s)?`)) {
                selectedMessages.forEach(id => {
                    const index = allMessages.findIndex(msg => msg.id === id);
                    if (index > -1) {
                        allMessages.splice(index, 1);
                    }
                });
                
                selectedMessages.clear();
                updateStats();
                updateBulkActions();
                renderMessages();
                
                showNotification('Selected messages deleted successfully!', 'success');
            }
        }

        // Open message in detailed view
        function openMessage(messageId) {
            const message = allMessages.find(msg => msg.id === messageId);
            if (!message) return;
            
            currentViewMessageId = messageId;
            
            // Mark as read when opened
            if (message.unread) {
                message.unread = false;
                updateStats();
                renderMessages();
            }
            
            // Populate modal with message details
            document.getElementById('viewSender').textContent = message.sender;
            document.getElementById('viewDate').textContent = message.fullDate || message.time;
            document.getElementById('viewSubject').textContent = message.subject;
            document.getElementById('viewText').textContent = message.fullText || message.preview;
            
            // Show modal
            document.getElementById('messageViewModal').classList.add('active');
        }

        // Close message view modal
        function closeMessageView() {
            document.getElementById('messageViewModal').classList.remove('active');
            currentViewMessageId = null;
        }

        // Reply from message view
        function replyFromView() {
            if (currentViewMessageId) {
                closeMessageView();
                replyToMessage(currentViewMessageId);
            }
        }

        // Mark as read from view
        function markAsReadFromView() {
            if (currentViewMessageId) {
                const message = allMessages.find(msg => msg.id === currentViewMessageId);
                if (message) {
                    message.unread = false;
                    updateStats();
                    renderMessages();
                    showNotification('Message marked as read!', 'success');
                }
            }
        }

        // Delete from view
        function deleteFromView() {
            if (currentViewMessageId && confirm('Are you sure you want to delete this message?')) {
                const index = allMessages.findIndex(msg => msg.id === currentViewMessageId);
                if (index > -1) {
                    allMessages.splice(index, 1);
                    updateStats();
                    renderMessages();
                    closeMessageView();
                    showNotification('Message deleted successfully!', 'success');
                }
            }
        }

        // Reply to message
        function replyToMessage(messageId) {
            const message = allMessages.find(msg => msg.id === messageId);
            if (!message) return;
            
            currentReplyMessageId = messageId;
            
            // Populate original message in modal
            const originalMessage = document.getElementById('originalMessage');
            originalMessage.innerHTML = `
                <div class="original-header">
                    <span class="original-sender">${message.sender}</span>
                    <span class="original-date">${message.fullDate || message.time}</span>
                </div>
                <div class="original-subject">${message.subject}</div>
                <div class="original-text">${message.preview}</div>
            `;
            
            // Set reply subject
            const replySubject = document.getElementById('replySubject');
            const subjectPrefix = message.subject.startsWith('Re: ') ? '' : 'Re: ';
            replySubject.value = subjectPrefix + message.subject;
            
            // Clear reply message
            document.getElementById('replyMessage').value = '';
            
            // Show modal
            document.getElementById('replyModal').classList.add('active');
            
            // Focus on reply textarea
            setTimeout(() => {
                document.getElementById('replyMessage').focus();
            }, 300);
        }

        // Close reply modal
        function closeReplyModal() {
            document.getElementById('replyModal').classList.remove('active');
            currentReplyMessageId = null;
        }

        // Send reply
        function sendReply(event) {
            event.preventDefault();
            
            const subject = document.getElementById('replySubject').value;
            const message = document.getElementById('replyMessage').value;
            
            if (!subject.trim() || !message.trim()) {
                showNotification('Please fill in both subject and message fields.', 'error');
                return;
            }
            
            // Here you would typically send the reply to your backend
            console.log('Sending reply:', {
                originalMessageId: currentReplyMessageId,
                subject: subject,
                message: message,
                timestamp: new Date().toISOString()
            });
            
            // Show success message
            showNotification('Reply sent successfully!', 'success');
            
            // Mark original message as read if it was unread
            if (currentReplyMessageId) {
                const originalMessage = allMessages.find(msg => msg.id === currentReplyMessageId);
                if (originalMessage && originalMessage.unread) {
                    originalMessage.unread = false;
                    updateStats();
                    renderMessages();
                }
            }
            
            // Close modal
            closeReplyModal();
        }

        // Delete message
        function deleteMessage(messageId) {
            if (confirm('Are you sure you want to delete this message?')) {
                const index = allMessages.findIndex(msg => msg.id === messageId);
                if (index > -1) {
                    allMessages.splice(index, 1);
                    selectedMessages.delete(messageId);
                    updateStats();
                    updateBulkActions();
                    renderMessages();
                    showNotification('Message deleted successfully!', 'success');
                }
            }
        }

        // Show notification
        function showNotification(message, type = 'info') {
            // Create notification element
            const notification = document.createElement('div');
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: ${type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : type === 'warning' ? '#ff9800' : '#2196f3'};
                color: white;
                padding: 16px 24px;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                z-index: 10002;
                font-weight: 500;
                animation: slideIn 0.3s ease;
            `;
            notification.textContent = message;
            
            // Add slide-in animation
            const style = document.createElement('style');
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
            
            document.body.appendChild(notification);
            
            // Remove after 3 seconds
            setTimeout(() => {
                notification.style.animation = 'slideIn 0.3s ease reverse';
                setTimeout(() => {
                    document.body.removeChild(notification);
                    document.head.removeChild(style);
                }, 300);
            }, 3000);
        }

        // Close modals when clicking outside
        document.getElementById('replyModal').addEventListener('click', function(e) {
            if (e.target === this) {
                closeReplyModal();
            }
        });

        document.getElementById('messageViewModal').addEventListener('click', function(e) {
            if (e.target === this) {
                closeMessageView();
            }
        });

        // Go back function
        function goBack() {
            // In a real application, this would navigate back to the dashboard
            showNotification('Navigating back to dashboard...', 'info');
            // window.history.back();
        }

        // Initialize when DOM is loaded
        document.addEventListener('DOMContentLoaded', initializePage);

        // Keyboard shortcuts
        document.addEventListener('keydown', function(e) {
            // Escape key closes modals
            if (e.key === 'Escape') {
                closeReplyModal();
                closeMessageView();
            }
        });