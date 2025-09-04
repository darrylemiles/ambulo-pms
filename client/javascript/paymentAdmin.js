      // Sample data for demonstration
        const samplePayments = [
            {
                id: 1,
                date: '2025-01-15',
                tenant: 'Maria Santos',
                space: 'Unit 201-A',
                amount: '₱25,000.00',
                reference: 'REF-2025-001',
                status: 'pending',
                hasProof: true
            },
            {
                id: 2,
                date: '2025-01-14',
                tenant: 'Juan Dela Cruz',
                space: 'Unit 305-B',
                amount: '₱18,500.00',
                reference: 'REF-2025-002',
                status: 'paid',
                hasProof: true
            },
            {
                id: 3,
                date: '2025-01-10',
                tenant: 'Ana Rodriguez',
                space: 'Unit 102-C',
                amount: '₱22,000.00',
                reference: 'REF-2025-003',
                status: 'overdue',
                hasProof: false
            }
        ];

        // Toggle dropdown menu
        document.querySelector('.profile').addEventListener('click', function() {
            const dropdown = document.querySelector('.dropdown-menu');
            dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', function(event) {
            const dropdown = document.querySelector('.dropdown-menu');
            const profile = document.querySelector('.profile');
            if (!profile.contains(event.target)) {
                dropdown.style.display = 'none';
            }
        });

        // Modal functions
        function openModal(modalId) {
            const modal = document.getElementById(modalId);
            modal.classList.add('active');
            document.body.classList.add('modal-open');
        }

        function closeModal(modalId) {
            const modal = document.getElementById(modalId);
            modal.classList.remove('active');
            document.body.classList.remove('modal-open');
        }

        // Close modal when clicking outside
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', function(e) {
                if (e.target === modal) {
                    closeModal(modal.id);
                }
            });
        });

        // Payment management functions
        function filterPayments() {
            // Implementation for filtering payments
            console.log('Filtering payments...');
        }

        function viewProof(proofImage) {
            // Create a simple image viewer
            const modal = document.createElement('div');
            modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 999999;
                cursor: pointer;
            `;
            
            const img = document.createElement('img');
            img.src = `https://via.placeholder.com/800x600/3b82f6/ffffff?text=Payment+Proof+Image`;
            img.style.cssText = `
                max-width: 90%;
                max-height: 90%;
                border-radius: 12px;
                box-shadow: 0 8px 40px rgba(0,0,0,0.4);
            `;
            
            modal.appendChild(img);
            document.body.appendChild(modal);
            document.body.classList.add('modal-open');
            
            modal.addEventListener('click', function() {
                document.body.removeChild(modal);
                document.body.classList.remove('modal-open');
            });
        }

        function reviewPayment(paymentId) {
            openModal('review-modal');
        }

        function approvePayment(paymentId) {
            showAlert('Payment approved successfully!', 'success');
            // Update payment status in the table
            updatePaymentStatus(paymentId, 'paid');
        }

        function rejectPayment(paymentId) {
            if (confirm('Are you sure you want to reject this payment? This action cannot be undone.')) {
                showAlert('Payment rejected.', 'error');
                // Implementation for rejecting payment
            }
        }

        function generateReceipt(paymentId) {
            openModal('receipt-modal');
        }

        function generateAndSendReceipt() {
            const receiptNumber = document.getElementById('receipt-number').value;
            showAlert(`Receipt ${receiptNumber} generated and sent successfully!`, 'success');
            setTimeout(() => {
                closeModal('receipt-modal');
            }, 2000);
        }

        function downloadReceipt() {
            // Simulate PDF download
            const link = document.createElement('a');
            link.href = '#';
            link.download = 'receipt-RCP-2025-001.pdf';
            link.click();
            showAlert('Receipt downloaded successfully!', 'success');
        }

        function sendReminder(paymentId) {
            showAlert('Reminder sent to tenant successfully!', 'success');
        }

        function contactTenant(paymentId) {
            showAlert('Contacting tenant...', 'success');
        }

        function editPayment(paymentId) {
            showAlert('Opening payment editor...', 'success');
        }

        // Helper functions
        function showAlert(message, type) {
            // Create and show alert
            const alert = document.createElement('div');
            alert.className = `alert ${type} active`;
            alert.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-triangle'}"></i> ${message}`;
            
            // Insert at top of body
            document.body.insertBefore(alert, document.body.firstChild);
            
            // Remove after 3 seconds
            setTimeout(() => {
                alert.remove();
            }, 3000);
        }

        function updatePaymentStatus(paymentId, newStatus) {
            // Find and update the row in the table
            const rows = document.querySelectorAll('#payments-tbody tr');
            rows.forEach(row => {
                if (row.dataset.paymentId === paymentId) {
                    const statusCell = row.querySelector('.status-badge');
                    statusCell.className = `status-badge ${newStatus}`;
                    statusCell.textContent = newStatus.charAt(0).toUpperCase() + newStatus.slice(1);
                }
            });
            
            // Update statistics
            updateStatistics();
        }

        function updateStatistics() {
            // Count current statuses and update stats cards
            const rows = document.querySelectorAll('#payments-tbody tr');
            let pending = 0, paid = 0, overdue = 0;
            
            rows.forEach(row => {
                const badge = row.querySelector('.status-badge');
                if (badge) {
                    if (badge.classList.contains('pending')) pending++;
                    else if (badge.classList.contains('paid')) paid++;
                    else if (badge.classList.contains('overdue')) overdue++;
                }
            });
            
            document.getElementById('total-payments').textContent = rows.length;
            document.getElementById('pending-payments').textContent = pending;
            document.getElementById('paid-payments').textContent = paid;
            document.getElementById('overdue-payments').textContent = overdue;
        }

        // Initialize the page
        document.addEventListener('DOMContentLoaded', function() {
            // Set default date values
            const today = new Date();
            const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
            
            document.getElementById('date-from').value = weekAgo.toISOString().split('T')[0];
            document.getElementById('date-to').value = today.toISOString().split('T')[0];
            
            // Initialize receipt date
            document.getElementById('receipt-date').value = today.toISOString().split('T')[0];
        });