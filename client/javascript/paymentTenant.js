        // Sample data with more realistic information
        let rentedSpaces = [
            {
                id: 1,
                title: "Unit 2A - Ground Floor",
                status: "Active",
                address: "Kapt. Sayas Street, Silang, Cavite",
                monthlyRent: 15000,
                selected: false,
                dueDate: "2025-09-01"
            },
            {
                id: 2, 
                title: "Storage Unit B1",
                status: "Active", 
                address: "Kapt. Sayas Street, Silang, Cavite",
                monthlyRent: 3000,
                selected: false,
                dueDate: "2025-09-01"
            },
            {
                id: 3,
                title: "Office Suite 3B",
                status: "Active",
                address: "Kapt. Sayas Street, Silang, Cavite", 
                monthlyRent: 25000,
                selected: false,
                dueDate: "2025-09-01"
            }
        ];

        let paymentHistory = [
            {
                id: 1,
                date: "2025-08-01",
                space: "Unit 2A",
                description: "Monthly Rent - August 2025",
                amount: 15000,
                reference: "GC123456789",
                status: "paid"
            },
            {
                id: 2,
                date: "2025-08-05",
                space: "Unit 2A", 
                description: "Electricity Bill - July 2025",
                amount: 2500,
                reference: "BDO987654321",
                status: "paid"
            },
            {
                id: 3,
                date: "2025-07-28",
                space: "Storage Unit B1",
                description: "Monthly Rent - July 2025", 
                amount: 3000,
                reference: "GC555666777",
                status: "paid"
            },
            {
                id: 4,
                date: "2025-07-15",
                space: "Unit 2A",
                description: "Water Bill - June 2025",
                amount: 800,
                reference: "BDO111222333",
                status: "paid"
            },
            {
                id: 5,
                date: "2025-08-25",
                space: "Office Suite 3B",
                description: "Security Deposit",
                amount: 25000,
                reference: "PENDING001",
                status: "pending"
            }
        ];

        let selectedSpace = null;
        let uploadedFile = null;

        // Initialize page
        document.addEventListener('DOMContentLoaded', function() {
            initializePage();
        });

        function initializePage() {
            loadRentedSpaces();
            loadPaymentHistory();
            showNoSpaceAlert();
            
            // Auto-select first space if available
            if (rentedSpaces.length > 0) {
                setTimeout(() => {
                    selectSpace(rentedSpaces[0].id);
                }, 500);
            }
            
            setupEventListeners();
        }

        function setupEventListeners() {
            // Close modal when clicking outside
            window.onclick = function(event) {
                const modal = document.getElementById('payment-modal');
                if (event.target === modal) {
                    closePaymentModal();
                }
            }

            // Keyboard navigation
            document.addEventListener('keydown', function(event) {
                if (event.key === 'Escape') {
                    closePaymentModal();
                } else if (event.key >= '1' && event.key <= '9') {
                    const spaceIndex = parseInt(event.key) - 1;
                    if (rentedSpaces[spaceIndex] && !document.getElementById('payment-modal').classList.contains('active')) {
                        selectSpace(rentedSpaces[spaceIndex].id);
                    }
                }
            });
        }

        function loadRentedSpaces() {
            const container = document.getElementById('spaces-grid');
            
            if (rentedSpaces.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-icon">🏠</div>
                        <div>No rented spaces found</div>
                        <small>Contact your administrator to set up rental agreements.</small>
                    </div>
                `;
                return;
            }
            
            container.innerHTML = rentedSpaces.map(space => {
                const daysUntilDue = Math.ceil((new Date(space.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
                const urgencyClass = daysUntilDue <= 3 ? 'overdue' : daysUntilDue <= 7 ? 'pending' : 'paid';
                
                return `
                    <div class="space-card ${space.selected ? 'selected' : ''}" onclick="selectSpace(${space.id})" data-space-id="${space.id}">
                        <div class="space-header">
                            <div class="space-title">${space.title}</div>
                            <div class="space-status ${urgencyClass}">${space.status}</div>
                        </div>
                        <div class="space-details">
                            <i class="fas fa-map-marker-alt"></i> ${space.address}
                        </div>
                        <div class="space-details" style="margin-top: 0.5rem; font-weight: 500;">
                            <i class="fas fa-calendar"></i> Due: ${formatDate(space.dueDate)}
                            ${daysUntilDue <= 7 ? `<span style="color: #ef4444; font-weight: 600;">(${daysUntilDue} days)</span>` : ''}
                        </div>
                        <div class="space-rent">₱${space.monthlyRent.toLocaleString()}/month</div>
                    </div>
                `;
            }).join('');
        }

        function selectSpace(spaceId) {
            // Update selection
            rentedSpaces.forEach(space => {
                space.selected = space.id === spaceId;
            });
            
            selectedSpace = rentedSpaces.find(space => space.id === spaceId);
            
            // Update UI with animation
            loadRentedSpaces();
            setTimeout(() => {
                loadPaymentBreakdown();
                // Smooth scroll to breakdown section
                const breakdownElement = document.getElementById('breakdown-container');
                if (breakdownElement) {
                    breakdownElement.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'nearest' 
                    });
                }
            }, 150);
        }

        function loadPaymentBreakdown() {
            const container = document.getElementById('breakdown-container');
            const noSpaceAlert = document.getElementById('no-space-alert');
            
            if (!selectedSpace) {
                if (noSpaceAlert) {
                    noSpaceAlert.classList.add('active');
                }
                return;
            }

            if (noSpaceAlert) {
                noSpaceAlert.classList.remove('active');
            }

            // Generate breakdown based on selected space
            const fixedCosts = [
                { label: "Monthly Rent", amount: selectedSpace.monthlyRent },
                { label: "Electricity", amount: Math.floor(Math.random() * 1000) + 2000 },
                { label: "Water", amount: Math.floor(Math.random() * 300) + 600 },
                { label: "Maintenance Fee", amount: 500 }
            ];

            const occasionalCosts = [
                { label: "Security Deposit", amount: selectedSpace.monthlyRent, due: "One-time (if applicable)" },
                { label: "Advance Rent", amount: selectedSpace.monthlyRent, due: "One-time (if applicable)" },
                { label: "Association Dues", amount: 1200, due: "Quarterly" },
                { label: "Insurance Premium", amount: 2400, due: "Annual" }
            ];

            const totalFixed = fixedCosts.reduce((sum, cost) => sum + cost.amount, 0);
            const currentMonth = new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' });

            if (container) {
                container.innerHTML = `
                    <div class="breakdown-grid">
                        <div class="breakdown-section">
                            <h3 class="breakdown-title">
                                <i class="fas fa-calendar-check"></i>
                                Monthly Fixed Costs
                            </h3>
                            ${fixedCosts.map(cost => `
                                <div class="breakdown-item">
                                    <span class="breakdown-label">${cost.label}</span>
                                    <span class="breakdown-amount">₱${cost.amount.toLocaleString()}</span>
                                </div>
                            `).join('')}
                            <div class="breakdown-item" style="border-top: 2px solid #667eea; padding-top: 0.75rem;">
                                <span class="breakdown-label">Monthly Total</span>
                                <span class="breakdown-amount">₱${totalFixed.toLocaleString()}</span>
                            </div>
                        </div>
                        
                        <div class="breakdown-section">
                            <h3 class="breakdown-title">
                                <i class="fas fa-clock"></i>
                                Occasional Payments
                            </h3>
                            ${occasionalCosts.map(cost => `
                                <div class="breakdown-item">
                                    <div>
                                        <div class="breakdown-label">${cost.label}</div>
                                        <small style="color: #6b7280; font-style: italic;">${cost.due}</small>
                                    </div>
                                    <span class="breakdown-amount">₱${cost.amount.toLocaleString()}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="total-section">
                        <div class="total-label">
                            <i class="fas fa-calendar-alt"></i>
                            ${currentMonth} - Total Due
                        </div>
                        <div class="total-amount">₱${totalFixed.toLocaleString()}</div>
                        <button class="pay-now-btn" onclick="openPaymentModal(${totalFixed})">
                            <i class="fas fa-credit-card"></i> Pay Now
                        </button>
                    </div>
                `;
            }
        }

        function loadPaymentHistory() {
            const tbody = document.getElementById('payment-tbody');
            
            if (paymentHistory.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="6" class="empty-state">
                            <div class="empty-icon">📄</div>
                            <div>No payment records found</div>
                            <small>Your payment history will appear here once you make payments.</small>
                        </td>
                    </tr>
                `;
                return;
            }

            // Sort by date (newest first)
            const sortedHistory = [...paymentHistory].sort((a, b) => new Date(b.date) - new Date(a.date));

            tbody.innerHTML = sortedHistory.map(payment => `
                <tr>
                    <td>${formatDate(payment.date)}</td>
                    <td>
                        <strong>${payment.space}</strong>
                    </td>
                    <td>${payment.description}</td>
                    <td style="font-weight: 600; color: #059669;">₱${payment.amount.toLocaleString()}</td>
                    <td>
                        <code style="background: rgba(102, 126, 234, 0.1); padding: 4px 8px; border-radius: 6px; font-size: 12px; font-family: 'Courier New', monospace;">
                            ${payment.reference}
                        </code>
                        <button class="copy-btn" onclick="copyToClipboard('${payment.reference}')" style="margin-left: 0.5rem;">
                            <i class="fas fa-copy"></i>
                        </button>
                    </td>
                    <td>
                        <span class="status ${payment.status}">
                            ${getStatusIcon(payment.status)} ${payment.status}
                        </span>
                    </td>
                </tr>
            `).join('');
        }

        function showNoSpaceAlert() {
            const alert = document.getElementById('no-space-alert');
            if (alert && !selectedSpace) {
                alert.classList.add('active');
            }
        }

        function hideNoSpaceAlert() {
            const alert = document.getElementById('no-space-alert');
            if (alert) {
                alert.classList.remove('active');
            }
        }

        function openPaymentModal(amount) {
            if (!selectedSpace) {
                showAlert('error', 'Please select a rental space first.');
                return;
            }
            
            const modal = document.getElementById('payment-modal');
            const modalAmount = document.getElementById('modal-amount');
            
            if (modalAmount) {
                modalAmount.textContent = `₱${amount.toLocaleString()}`;
            }
            
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
            
            // Reset form state
            resetModalForm();
        }

        function closePaymentModal() {
            const modal = document.getElementById('payment-modal');
            modal.classList.remove('active');
            document.body.style.overflow = 'auto';
            
            // Reset upload
            resetModalForm();
        }

        function resetModalForm() {
            uploadedFile = null;
            const filePreview = document.getElementById('file-preview');
            const fileInput = document.getElementById('payment-proof');
            const submitBtn = document.getElementById('submit-payment-btn');
            const alerts = document.querySelectorAll('.alert');
            
            if (filePreview) filePreview.classList.remove('active');
            if (fileInput) fileInput.value = '';
            if (submitBtn) submitBtn.disabled = true;
            
            alerts.forEach(alert => alert.classList.remove('active'));
        }

        function handleFileUpload(event) {
            const file = event.target.files[0];
            const filePreview = document.getElementById('file-preview');
            const fileName = document.getElementById('file-name');
            const submitBtn = document.getElementById('submit-payment-btn');
            
            if (file) {
                // Validate file type
                if (!file.type.startsWith('image/')) {
                    showModalAlert('error', 'Please upload an image file only.');
                    event.target.value = '';
                    return;
                }
                
                // Validate file size (max 5MB)
                if (file.size > 5 * 1024 * 1024) {
                    showModalAlert('error', 'File size must be less than 5MB.');
                    event.target.value = '';
                    return;
                }
                
                uploadedFile = file;
                if (fileName) {
                    fileName.textContent = `${file.name} (${(file.size / 1024 / 1024).toFixed(1)}MB)`;
                }
                if (filePreview) {
                    filePreview.classList.add('active');
                }
                if (submitBtn) {
                    submitBtn.disabled = false;
                }
                
                showModalAlert('success', 'File uploaded successfully! You can now submit your payment confirmation.');
            }
        }

        function removeFile() {
            uploadedFile = null;
            const filePreview = document.getElementById('file-preview');
            const fileInput = document.getElementById('payment-proof');
            const submitBtn = document.getElementById('submit-payment-btn');
            
            if (filePreview) filePreview.classList.remove('active');
            if (fileInput) fileInput.value = '';
            if (submitBtn) submitBtn.disabled = true;
            
            showModalAlert('error', 'File removed. Please upload a new payment confirmation.');
        }

        function submitPayment() {
            const submitBtn = document.getElementById('submit-payment-btn');
            
            if (!uploadedFile) {
                showModalAlert('error', 'Please upload payment confirmation screenshot.');
                return;
            }

            if (!selectedSpace) {
                showModalAlert('error', 'Please select a rental space.');
                return;
            }

            // Show loading state
            submitBtn.innerHTML = '<div class="loading"></div> Processing...';
            submitBtn.disabled = true;

            // Simulate payment processing
            setTimeout(() => {
                const totalAmount = calculateTotalAmount();
                const newPayment = {
                    id: Date.now(),
                    date: new Date().toISOString().split('T')[0],
                    space: selectedSpace.title,
                    description: `Monthly Payment - ${new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' })}`,
                    amount: totalAmount,
                    reference: generateReference(),
                    status: 'pending'
                };

                paymentHistory.unshift(newPayment);
                loadPaymentHistory();
                
                showModalAlert('success', 'Payment confirmation submitted successfully! Your payment is now under review and will be processed within 24 hours.');
                
                // Reset button
                submitBtn.innerHTML = '<i class="fas fa-check"></i> Submitted Successfully!';
                
                setTimeout(() => {
                    submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Payment Confirmation';
                    closePaymentModal();
                }, 2500);
                
            }, 1500);
        }

        function calculateTotalAmount() {
            if (!selectedSpace) return 0;
            
            const baseRent = selectedSpace.monthlyRent;
            const utilities = Math.floor(Math.random() * 1000) + 2000; // Random utilities
            const water = Math.floor(Math.random() * 300) + 600;
            const maintenance = 500;
            
            return baseRent + utilities + water + maintenance;
        }

        function generateReference() {
            const prefix = Math.random() > 0.5 ? 'GC' : 'BDO';
            const number = Math.floor(Math.random() * 900000000) + 100000000;
            return `${prefix}${number}`;
        }

        function showModalAlert(type, message) {
            const successAlert = document.getElementById('modal-success-alert');
            const errorAlert = document.getElementById('modal-error-alert');
            
            // Hide both alerts first
            if (successAlert) successAlert.classList.remove('active');
            if (errorAlert) errorAlert.classList.remove('active');
            
            // Show appropriate alert
            const alert = document.getElementById(`modal-${type}-alert`);
            if (alert) {
                alert.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-triangle'}"></i> ${message}`;
                alert.classList.add('active');
                
                setTimeout(() => {
                    alert.classList.remove('active');
                }, type === 'success' ? 8000 : 5000);
            }
        }

        function showAlert(type, message) {
            // Create temporary alert for main page
            const alertDiv = document.createElement('div');
            alertDiv.className = `alert ${type} active`;
            alertDiv.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-triangle'}"></i> ${message}`;
            alertDiv.style.position = 'fixed';
            alertDiv.style.top = '20px';
            alertDiv.style.right = '20px';
            alertDiv.style.zIndex = '1001';
            alertDiv.style.minWidth = '300px';
            
            document.body.appendChild(alertDiv);
            
            setTimeout(() => {
                alertDiv.remove();
            }, 4000);
        }

        function copyToClipboard(text) {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(text).then(() => {
                    showAlert('success', 'Copied to clipboard!');
                }).catch(() => {
                    fallbackCopyTextToClipboard(text);
                });
            } else {
                fallbackCopyTextToClipboard(text);
            }
        }

        function fallbackCopyTextToClipboard(text) {
            try {
                const textArea = document.createElement('textarea');
                textArea.value = text;
                textArea.style.position = 'fixed';
                textArea.style.left = '-999999px';
                textArea.style.top = '-999999px';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                
                const successful = document.execCommand('copy');
                document.body.removeChild(textArea);
                
                if (successful) {
                    showAlert('success', 'Copied to clipboard!');
                } else {
                    showAlert('error', 'Failed to copy to clipboard');
                }
            } catch (err) {
                console.error('Fallback copy failed:', err);
                showAlert('error', 'Copy not supported in this browser');
            }
        }

        function formatDate(dateString) {
            try {
                const date = new Date(dateString);
                
                // Check if date is valid
                if (isNaN(date.getTime())) {
                    return dateString; // Return original string if invalid
                }
                
                const today = new Date();
                const diffTime = today - date;
                const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                
                if (diffDays === 0) return 'Today';
                if (diffDays === 1) return 'Yesterday';
                if (diffDays < 7 && diffDays > 0) return `${diffDays} days ago`;
                if (diffDays < 0 && diffDays > -7) return `In ${Math.abs(diffDays)} days`;
                
                return date.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short', 
                    day: 'numeric'
                });
            } catch (error) {
                console.error('Date formatting error:', error);
                return dateString;
            }
        }

        function getStatusIcon(status) {
            const icons = {
                'paid': '✅',
                'pending': '⏳',
                'overdue': '❌'
            };
            return icons[status] || '📄';
        }

        // Remove duplicate event listeners and consolidate
        document.addEventListener('DOMContentLoaded', function() {
            // Add notification for upcoming due dates
            setTimeout(() => {
                const upcomingDue = rentedSpaces.filter(space => {
                    const daysUntilDue = Math.ceil((new Date(space.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
                    return daysUntilDue <= 7 && daysUntilDue > 0;
                });
                
                if (upcomingDue.length > 0) {
                    showAlert('error', `⚠️ ${upcomingDue.length} payment(s) due within 7 days!`);
                }
            }, 2000);
        });

        // Add auto-refresh for payment status (simulate real-time updates)
        setInterval(() => {
            // Randomly update a pending payment to paid (simulation)
            const pendingPayments = paymentHistory.filter(p => p.status === 'pending');
            if (pendingPayments.length > 0 && Math.random() > 0.95) {
                const randomPending = pendingPayments[Math.floor(Math.random() * pendingPayments.length)];
                randomPending.status = 'paid';
                loadPaymentHistory();
                showAlert('success', `Payment ${randomPending.reference} has been confirmed!`);
            }
        }, 10000); // Check every 10 seconds