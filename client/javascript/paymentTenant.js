        // Payment history storage (using in-memory storage for Claude artifacts)
        let paymentHistory = [];

        // Initialize the page
        document.addEventListener('DOMContentLoaded', function() {
            // Set today's date as default
            const today = new Date().toISOString().split('T')[0];
            const paymentDateInput = document.getElementById('payment-date');
            if (paymentDateInput) {
                paymentDateInput.value = today;
            }
            
            // Load and display payment history
            loadPaymentHistory();
            
            // Initialize form event listeners
            initializeEventListeners();
        });

        function initializeEventListeners() {
            // Form submission
            const paymentForm = document.getElementById('payment-form');
            if (paymentForm) {
                paymentForm.addEventListener('submit', handleFormSubmission);
            }

            // Auto-fill amount based on payment type
            const paymentTypeSelect = document.getElementById('payment-type');
            if (paymentTypeSelect) {
                paymentTypeSelect.addEventListener('change', handlePaymentTypeChange);
            }
        }

        // Form submission handler
        function handleFormSubmission(e) {
            e.preventDefault();
            
            // Get form data with null checks
            const paymentType = document.getElementById('payment-type');
            const amount = document.getElementById('amount');
            const referenceNumber = document.getElementById('reference-number');
            const paymentDate = document.getElementById('payment-date');
            const notes = document.getElementById('notes');
            
            if (!paymentType || !amount || !referenceNumber || !paymentDate) {
                showAlert('error', 'Required form fields not found.');
                return;
            }

            const formData = {
                id: Date.now(),
                date: paymentDate.value,
                type: paymentType.value,
                amount: parseFloat(amount.value) || 0,
                reference: referenceNumber.value.trim(),
                notes: notes ? notes.value.trim() : '',
                status: 'pending',
                timestamp: new Date().toLocaleString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                })
            };

            // Validation
            if (!formData.type || !formData.amount || !formData.reference || !formData.date) {
                showAlert('error', '❌ Please fill in all required fields.');
                return;
            }

            if (formData.amount <= 0) {
                showAlert('error', '❌ Please enter a valid amount greater than 0.');
                return;
            }

            if (formData.reference.length < 6) {
                showAlert('error', '❌ Please enter a valid GCash reference number (minimum 6 characters).');
                return;
            }

            // Check for duplicate reference numbers
            const isDuplicate = paymentHistory.some(payment => 
                payment.reference.toLowerCase() === formData.reference.toLowerCase()
            );
            
            if (isDuplicate) {
                showAlert('error', '❌ This reference number has already been used. Please check your GCash transaction.');
                return;
            }

            // Add to payment history
            paymentHistory.unshift(formData);
            
            // Update the table
            loadPaymentHistory();
            
            // Show success message
            showAlert('success', `✅ Payment information recorded successfully! Reference #${formData.reference} - Keep this for your records.`);
            
            // Reset form
            e.target.reset();
            if (paymentDate) {
                paymentDate.value = new Date().toISOString().split('T')[0];
            }
            
            // Scroll to payment history
            setTimeout(() => {
                const historySection = document.getElementById('history-section');
                if (historySection) {
                    historySection.scrollIntoView({ 
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }, 1000);
        }

        // Load and display payment history
        function loadPaymentHistory() {
            const tbody = document.getElementById('payment-tbody');
            if (!tbody) return;
            
            if (paymentHistory.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="6" style="text-align: center; padding: 60px 20px; color: #6c757d; font-style: italic;">
                            <div style="font-size: 48px; margin-bottom: 20px; opacity: 0.5;">📋</div>
                            <div style="font-size: 18px; margin-bottom: 10px; font-weight: 600;">No payment records found</div>
                            <div style="font-size: 14px;">Submit your first payment to see history here.</div>
                        </td>
                    </tr>
                `;
                return;
            }

            tbody.innerHTML = paymentHistory.map((payment, index) => `
                <tr style="animation: fadeInUp 0.3s ease ${index * 0.1}s both;">
                    <td>
                        <strong>${formatDate(payment.date)}</strong><br>
                        <small style="color: #6b7280;">${payment.timestamp}</small>
                    </td>
                    <td>
                        <div style="font-weight: 600;">${formatPaymentType(payment.type)}</div>
                    </td>
                    <td>
                        <div style="font-weight: 700; color: #059669; font-size: 16px;">
                            ₱${payment.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </div>
                    </td>
                    <td>
                        <code style="background: rgba(102, 126, 234, 0.1); padding: 4px 8px; border-radius: 6px; font-size: 12px;">
                            ${escapeHtml(payment.reference)}
                        </code>
                    </td>
                    <td>
                        <span class="status ${payment.status}">
                            ${getStatusIcon(payment.status)} ${payment.status}
                        </span>
                    </td>
                    <td>${payment.notes ? escapeHtml(payment.notes) : '<em style="color: #9ca3af;">No notes</em>'}</td>
                </tr>
            `).join('');
        }

        // Helper functions
        function formatDate(dateString) {
            try {
                const date = new Date(dateString);
                const options = { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric',
                    weekday: 'short'
                };
                return date.toLocaleDateString('en-US', options);
            } catch (error) {
                return dateString;
            }
        }

        function formatPaymentType(type) {
            const typeMap = {
                'monthly-rent': '🏠 Monthly Rent',
                'utilities': '⚡ Utilities',
                'maintenance': '🔧 Maintenance',
                'deposit': '💰 Security Deposit',
                'other': '📝 Other'
            };
            return typeMap[type] || type.split('-').map(word => 
                word.charAt(0).toUpperCase() + word.slice(1)
            ).join(' ');
        }

        function getStatusIcon(status) {
            const icons = {
                'paid': '✅',
                'pending': '⏳',
                'overdue': '❌'
            };
            return icons[status] || '📋';
        }

        function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

        function showAlert(type, message) {
            // Hide all alerts first
            const alerts = document.querySelectorAll('.alert');
            alerts.forEach(alert => {
                alert.style.display = 'none';
            });
            
            // Show the specified alert
            const alert = document.getElementById(type + '-alert');
            if (alert) {
                if (message) {
                    alert.innerHTML = message;
                }
                alert.style.display = 'block';
                
                // Auto-hide after 5 seconds
                setTimeout(() => {
                    alert.style.display = 'none';
                }, 5000);
            }
        }

        // Auto-fill amount based on payment type
        function handlePaymentTypeChange(e) {
            const amountField = document.getElementById('amount');
            if (!amountField) return;
            
            const amounts = {
                'monthly-rent': 15000,
                'utilities': 2500,
                'maintenance': 1000,
                'deposit': 15000
            };
            
            if (amounts[e.target.value]) {
                amountField.value = amounts[e.target.value];
                // Add a subtle animation to show the field has been updated
                amountField.style.background = 'rgba(102, 126, 234, 0.1)';
                setTimeout(() => {
                    amountField.style.background = '';
                }, 1000);
            } else {
                amountField.value = '';
            }
        }

        // Add CSS animation for new payment rows
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeInUp {
                from {
                    opacity: 0;
                    transform: translateY(20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
        `;
        document.head.appendChild(style);

    document.addEventListener("DOMContentLoaded", function() {
    const paymentType = document.getElementById("payment-type");
    const amountInput = document.getElementById("amount");

    // Auto-fill rent amount
    paymentType.addEventListener("change", function() {
      if (this.value === "rent") {
        amountInput.value = 15000; // Auto-fill ₱15,000
      } else {
        amountInput.value = ""; // Clear if not rent
      }
    });
  });