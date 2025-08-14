        // Sample message data
        let messages = [
            {
                id: 1,
                sender: "John Doe",
                email: "john@example.com",
                subject: "Project Update - Q4 Review",
                preview: "Hi team, I wanted to provide you with an update on our Q4 project progress. We've made significant headway...",
                date: "2024-01-15",
                time: "14:30",
                read: false,
                starred: true,
                avatar: "JD",
                avatarColor: "blue"
            },
            {
                id: 2,
                sender: "Sarah Wilson",
                email: "sarah@company.com",
                subject: "Meeting Reminder - Tomorrow 3PM",
                preview: "Don't forget about our scheduled meeting tomorrow at 3PM in the conference room. We'll be discussing...",
                date: "2024-01-15",
                time: "10:15",
                read: true,
                starred: false,
                avatar: "SW",
                avatarColor: "orange"
            },
            {
                id: 3,
                sender: "Mike Johnson",
                email: "mike@startup.io",
                subject: "Collaboration Opportunity",
                preview: "I hope this email finds you well. I'm reaching out regarding a potential collaboration opportunity that could...",
                date: "2024-01-14",
                time: "16:45",
                read: false,
                starred: false,
                avatar: "MJ",
                avatarColor: "green"
            },
            {
                id: 4,
                sender: "Emma Davis",
                email: "emma@design.co",
                subject: "Design Review Feedback",
                preview: "Thank you for sharing the latest design mockups. I've reviewed them thoroughly and have some feedback...",
                date: "2024-01-14",
                time: "09:20",
                read: true,
                starred: true,
                avatar: "ED",
                avatarColor: "purple"
            },
        ];

        let selectedMessages = new Set();
        let currentView = 'list';
        let composerMinimized = false;

        // Initialize the inbox
        function initializeInbox() {
            console.log('Initializing inbox with', messages.length, 'messages');
            renderMessages();
            updateSelectionCount();
            updateInboxCount();
            updateSelectAllCheckboxes();
        }

        // Render messages in both list and grid views
        function renderMessages() {
            renderListView();
            renderGridView();
        }

        // Render list view
        function renderListView() {
            const messageList = document.getElementById('messageList');
            if (!messageList) {
                console.error('Message list element not found');
                return;
            }
            
            const existingRows = messageList.querySelectorAll('.message-row');
            existingRows.forEach(row => row.remove());

            console.log('Rendering', messages.length, 'messages in list view');

            messages.forEach((message, index) => {
                const row = document.createElement('div');
                row.className = `message-row ${message.read ? '' : 'unread'} ${selectedMessages.has(message.id) ? 'selected' : ''}`;
                row.dataset.messageId = message.id;
                
                row.innerHTML = `
                    <input type="checkbox" class="row-checkbox" ${selectedMessages.has(message.id) ? 'checked' : ''} 
                           onchange="toggleMessageSelection(${message.id})">
                    <div class="row-number">${index + 1}</div>
                    <div class="sender">
                        <div class="avatar ${message.avatarColor}">${message.avatar}</div>
                        <div class="sender-name">${message.sender}</div>
                    </div>
                    <div class="subject">${message.subject}</div>
                    <div class="date-time">
                        ${message.date}<br>
                        <small>${message.time}</small>
                    </div>
                    <div class="read-status">
                        ${message.read ? '<span class="read-check">✓</span>' : ''}
                    </div>
                `;

                row.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    showContextMenu(e.clientX, e.clientY);
                    if (!selectedMessages.has(message.id)) {
                        selectedMessages.clear();
                        selectedMessages.add(message.id);
                        renderMessages();
                        updateSelectionCount();
                        updateSelectAllCheckboxes();
                    }
                });

                row.addEventListener('click', (e) => {
                    if (!e.target.matches('input[type="checkbox"]')) {
                        openMessage(message.id);
                    }
                });

                messageList.appendChild(row);
            });
        }

        // Render grid view
        function renderGridView() {
            const messageGrid = document.getElementById('messageGrid');
            messageGrid.innerHTML = '';

            messages.forEach(message => {
                const card = document.createElement('div');
                card.className = `message-card ${message.read ? '' : 'unread'} ${selectedMessages.has(message.id) ? 'selected' : ''}`;
                card.dataset.messageId = message.id;
                
                card.innerHTML = `
                    <div class="card-header">
                        <div class="card-sender">
                            <div class="card-avatar ${message.avatarColor}">${message.avatar}</div>
                            <div class="card-sender-info">
                                <div class="card-sender-name">${message.sender}</div>
                                <div class="card-date">${message.date} ${message.time}</div>
                            </div>
                        </div>
                        <div class="card-actions">
                            <input type="checkbox" class="card-checkbox" ${selectedMessages.has(message.id) ? 'checked' : ''} 
                                   onchange="toggleMessageSelection(${message.id})">
                            <div class="card-read-status ${message.read ? 'read' : ''}">
                                ${message.read ? '✓' : '●'}
                            </div>
                        </div>
                    </div>
                    <div class="card-subject">${message.subject}</div>
                    <div class="card-preview">${message.preview}</div>
                `;

                card.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    showContextMenu(e.clientX, e.clientY);
                    if (!selectedMessages.has(message.id)) {
                        selectedMessages.clear();
                        selectedMessages.add(message.id);
                        renderMessages();
                        updateSelectionCount();
                        updateSelectAllCheckboxes();
                    }
                });

                card.addEventListener('click', (e) => {
                    if (!e.target.matches('input[type="checkbox"]')) {
                        openMessage(message.id);
                    }
                });

                messageGrid.appendChild(card);
            });
        }

        // Toggle message selection
        function toggleMessageSelection(messageId) {
            if (selectedMessages.has(messageId)) {
                selectedMessages.delete(messageId);
            } else {
                selectedMessages.add(messageId);
            }
            renderMessages();
            updateSelectionCount();
            updateSelectAllCheckboxes();
        }

        // Toggle select all
        function toggleSelectAll() {
            const selectAllMain = document.getElementById('selectAllMain');
            const headerSelectAll = document.getElementById('headerSelectAll');
            
            if (selectedMessages.size === messages.length) {
                selectedMessages.clear();
                selectAllMain.checked = false;
                headerSelectAll.checked = false;
            } else {
                selectedMessages.clear();
                messages.forEach(message => selectedMessages.add(message.id));
                selectAllMain.checked = true;
                headerSelectAll.checked = true;
            }
            
            renderMessages();
            updateSelectionCount();
        }

        // Update select all checkboxes
        function updateSelectAllCheckboxes() {
            const selectAllMain = document.getElementById('selectAllMain');
            const headerSelectAll = document.getElementById('headerSelectAll');
            
            if (selectedMessages.size === 0) {
                selectAllMain.checked = false;
                headerSelectAll.checked = false;
                selectAllMain.indeterminate = false;
                headerSelectAll.indeterminate = false;
            } else if (selectedMessages.size === messages.length) {
                selectAllMain.checked = true;
                headerSelectAll.checked = true;
                selectAllMain.indeterminate = false;
                headerSelectAll.indeterminate = false;
            } else {
                selectAllMain.checked = false;
                headerSelectAll.checked = false;
                selectAllMain.indeterminate = true;
                headerSelectAll.indeterminate = true;
            }
        }

        // Select all messages
        function selectAllMessages() {
            selectedMessages.clear();
            messages.forEach(message => selectedMessages.add(message.id));
            renderMessages();
            updateSelectionCount();
            updateSelectAllCheckboxes();
            hideSelectAllDropdown();
        }

        // Select unread messages
        function selectUnreadMessages() {
            selectedMessages.clear();
            messages.filter(m => !m.read).forEach(message => selectedMessages.add(message.id));
            renderMessages();
            updateSelectionCount();
            updateSelectAllCheckboxes();
            hideSelectAllDropdown();
        }

        // Select read messages
        function selectReadMessages() {
            selectedMessages.clear();
            messages.filter(m => m.read).forEach(message => selectedMessages.add(message.id));
            renderMessages();
            updateSelectionCount();
            updateSelectAllCheckboxes();
            hideSelectAllDropdown();
        }

        // Select starred messages
        function selectStarredMessages() {
            selectedMessages.clear();
            messages.filter(m => m.starred).forEach(message => selectedMessages.add(message.id));
            renderMessages();
            updateSelectionCount();
            updateSelectAllCheckboxes();
            hideSelectAllDropdown();
        }

        // Deselect all
        function deselectAll() {
            selectedMessages.clear();
            renderMessages();
            updateSelectionCount();
            updateSelectAllCheckboxes();
            hideSelectAllDropdown();
        }

        // Update selection count
        function updateSelectionCount() {
            const countElement = document.getElementById('selectionCount');
            const count = selectedMessages.size;
            
            if (count > 0) {
                countElement.textContent = count;
                countElement.classList.add('visible');
            } else {
                countElement.classList.remove('visible');
            }
        }

        // Update inbox count
        function updateInboxCount() {
            const countElement = document.getElementById('inboxCount');
            const unreadCount = messages.filter(m => !m.read).length;
            countElement.textContent = unreadCount;
        }

        // Switch view
        function switchView(view) {
            currentView = view;
            const listViewBtn = document.getElementById('listViewBtn');
            const gridViewBtn = document.getElementById('gridViewBtn');
            const messageList = document.getElementById('messageList');
            const messageGrid = document.getElementById('messageGrid');

            if (view === 'list') {
                listViewBtn.classList.add('active');
                gridViewBtn.classList.remove('active');
                messageList.classList.remove('hidden');
                messageGrid.classList.remove('active');
            } else {
                gridViewBtn.classList.add('active');
                listViewBtn.classList.remove('active');
                messageList.classList.add('hidden');
                messageGrid.classList.add('active');
            }
        }

        // Bulk actions
        function markAsRead() {
            messages.forEach(message => {
                if (selectedMessages.has(message.id)) {
                    message.read = true;
                }
            });
            renderMessages();
            updateInboxCount();
            showNotification('Messages marked as read');
        }

        function markAsUnread() {
            messages.forEach(message => {
                if (selectedMessages.has(message.id)) {
                    message.read = false;
                }
            });
            renderMessages();
            updateInboxCount();
            showNotification('Messages marked as unread');
        }

        function archiveSelected() {
            const selectedCount = selectedMessages.size;
            if (selectedCount === 0) {
                showNotification('No messages selected');
                return;
            }
            messages = messages.filter(message => !selectedMessages.has(message.id));
            selectedMessages.clear();
            renderMessages();
            updateSelectionCount();
            updateSelectAllCheckboxes();
            updateInboxCount();
            showNotification(`${selectedCount} message(s) archived`);
        }

        function deleteSelected() {
            const selectedCount = selectedMessages.size;
            if (selectedCount === 0) {
                showNotification('No messages selected');
                return;
            }
            if (confirm(`Are you sure you want to delete ${selectedCount} message(s)?`)) {
                messages = messages.filter(message => !selectedMessages.has(message.id));
                selectedMessages.clear();
                renderMessages();
                updateSelectionCount();
                updateSelectAllCheckboxes();
                updateInboxCount();
                showNotification(`${selectedCount} message(s) deleted`);
            }
        }

        function clearSelection() {
            selectedMessages.clear();
            renderMessages();
            updateSelectionCount();
            updateSelectAllCheckboxes();
            showNotification('Selection cleared');
        }

        // Dropdown functions
        function toggleSelectAllDropdown() {
            const dropdown = document.getElementById('selectAllDropdown');
            dropdown.classList.toggle('show');
        }

        function hideSelectAllDropdown() {
            const dropdown = document.getElementById('selectAllDropdown');
            dropdown.classList.remove('show');
        }

        function toggleProfileDropdown() {
            const dropdown = document.getElementById('dropdownMenu');
            dropdown.classList.toggle('show');
        }

        // Context menu
        function showContextMenu(x, y) {
            const contextMenu = document.getElementById('contextMenu');
            contextMenu.style.display = 'block';
            contextMenu.style.left = x + 'px';
            contextMenu.style.top = y + 'px';
        }

        function hideContextMenu() {
            const contextMenu = document.getElementById('contextMenu');
            contextMenu.style.display = 'none';
        }

        // Message Composer Functions
        function newMessage() {
            const modalOverlay = document.getElementById('modalOverlay');
            const messageComposer = document.getElementById('messageComposer');
            
            modalOverlay.classList.add('show');
            messageComposer.classList.add('show');
            
            // Focus on the To field
            setTimeout(() => {
                document.getElementById('toField').focus();
            }, 300);
        }

        function closeComposer() {
            const modalOverlay = document.getElementById('modalOverlay');
            const messageComposer = document.getElementById('messageComposer');
            
            modalOverlay.classList.remove('show');
            messageComposer.classList.remove('show');
            
            // Clear form
            clearComposerForm();
        }

        function clearComposerForm() {
            document.getElementById('toField').value = '';
            document.getElementById('ccField').value = '';
            document.getElementById('bccField').value = '';
            document.getElementById('subjectField').value = '';
            document.getElementById('messageBody').value = '';
            
            // Hide CC/BCC fields
            const ccBccFields = document.getElementById('ccBccFields');
            ccBccFields.classList.remove('show');
        }

        function toggleCcBcc() {
            const ccBccFields = document.getElementById('ccBccFields');
            ccBccFields.classList.toggle('show');
        }

        function minimizeComposer() {
            const messageComposer = document.getElementById('messageComposer');
            messageComposer.style.transform = 'translate(-50%, 100%) scale(0.8)';
            composerMinimized = true;
        }

        function maximizeComposer() {
            const messageComposer = document.getElementById('messageComposer');
            if (composerMinimized) {
                messageComposer.style.transform = 'translate(-50%, -50%) scale(1)';
                composerMinimized = false;
            } else {
                // Full screen mode
                messageComposer.style.width = '95%';
                messageComposer.style.height = '90%';
                messageComposer.style.maxWidth = 'none';
                messageComposer.style.maxHeight = 'none';
            }
        }

        function sendMessage() {
            const to = document.getElementById('toField').value.trim();
            const subject = document.getElementById('subjectField').value.trim();
            const body = document.getElementById('messageBody').value.trim();
            
            if (!to) {
                showNotification('Please enter recipient email', 'error');
                return;
            }
            
            if (!subject) {
                showNotification('Please enter a subject', 'error');
                return;
            }
            
            // Simulate sending
            showNotification('Message sent successfully!');
            closeComposer();
        }

        function attachFile() {
            showNotification('File attachment feature coming soon');
        }

        function insertLink() {
            const url = prompt('Enter URL:');
            if (url) {
                const messageBody = document.getElementById('messageBody');
                const currentText = messageBody.value;
                const cursorPos = messageBody.selectionStart;
                const linkText = `[link](${url})`;
                messageBody.value = currentText.substring(0, cursorPos) + linkText + currentText.substring(cursorPos);
            }
        }

        function saveDraft() {
            showNotification('Draft saved successfully');
        }

        function discardDraft() {
            if (confirm('Are you sure you want to discard this draft?')) {
                closeComposer();
            }
        }

        // Other functions
        function openMessage(messageId) {
            const message = messages.find(m => m.id === messageId);
            if (message) {
                message.read = true;
                renderMessages();
                updateInboxCount();
                showNotification(`Opened: ${message.subject}`);
            }
        }

        function showNotification(message, type = 'success') {
            const notification = document.createElement('div');
            const bgColor = type === 'error' ? '#ef4444' : '#0ea5e9';
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: ${bgColor};
                color: white;
                padding: 12px 20px;
                border-radius: 8px;
                z-index: 10000;
                font-weight: 500;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                animation: slideIn 0.3s ease;
                max-width: 300px;
            `;
            notification.textContent = message;
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.style.animation = 'slideOut 0.3s ease';
                setTimeout(() => {
                    notification.remove();
                }, 300);
            }, 3000);
        }

        // Search functionality
        document.getElementById('searchInput').addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase();
            if (searchTerm) {
                const filteredMessages = messages.filter(message => 
                    message.sender.toLowerCase().includes(searchTerm) ||
                    message.subject.toLowerCase().includes(searchTerm) ||
                    message.preview.toLowerCase().includes(searchTerm)
                );
                showNotification(`Found ${filteredMessages.length} results`);
            }
        });

        // Click outside to close dropdowns
        document.addEventListener('click', function(e) {
            if (!e.target.closest('.select-all-dropdown')) {
                hideSelectAllDropdown();
            }
            if (!e.target.closest('.profile-dropdown')) {
                const dropdown = document.getElementById('dropdownMenu');
                dropdown.classList.remove('show');
            }
            if (!e.target.closest('.context-menu')) {
                hideContextMenu();
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', function(e) {
            // Escape key to close composer
            if (e.key === 'Escape') {
                if (document.getElementById('messageComposer').classList.contains('show')) {
                    closeComposer();
                }
            }
            
            // Ctrl/Cmd + Enter to send message
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                if (document.getElementById('messageComposer').classList.contains('show')) {
                    sendMessage();
                }
            }
            
            // Ctrl/Cmd + N for new message
            if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
                e.preventDefault();
                newMessage();
            }
        });

        // Initialize when page loads
        window.addEventListener('load', initializeInbox);
        document.addEventListener('DOMContentLoaded', initializeInbox);