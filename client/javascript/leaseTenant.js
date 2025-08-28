        // Sample contract data
        const contracts = {
            'LC001': {
                title: 'Suburban Family Home - Contract LC001',
                property: '456 Oak Avenue, Alabang, Muntinlupa',
                terms: [
                    { label: 'Monthly Rent', value: '₱85,000' },
                    { label: 'Lease Duration', value: '12 months' },
                    { label: 'Security Deposit', value: '₱85,000' },
                    { label: 'Pet Policy', value: 'No pets allowed' },
                    { label: 'Utilities Included', value: 'Water, Trash' },
                    { label: 'Landlord', value: 'ABC Property Management' },
                    { label: 'Landlord Phone', value: '(02) 8123-4567' },
                    { label: 'Emergency Contact', value: '(02) 8123-4567' }
                ],
                payments: [
                    { date: 'Jan 1, 2025', amount: '₱85,000', status: 'paid' },
                    { date: 'Feb 1, 2025', amount: '₱85,000', status: 'paid' },
                    { date: 'Mar 1, 2025', amount: '₱85,000', status: 'paid' },
                    { date: 'Apr 1, 2025', amount: '₱85,000', status: 'paid' },
                    { date: 'May 1, 2025', amount: '₱85,000', status: 'paid' },
                    { date: 'Jun 1, 2025', amount: '₱85,000', status: 'paid' },
                    { date: 'Jul 1, 2025', amount: '₱85,000', status: 'paid' },
                    { date: 'Aug 1, 2025', amount: '₱85,000', status: 'paid' },
                    { date: 'Sep 1, 2025', amount: '₱85,000', status: 'paid' },
                    { date: 'Oct 1, 2025', amount: '₱85,000', status: 'paid' },
                    { date: 'Nov 1, 2025', amount: '₱85,000', status: 'paid' },
                    { date: 'Dec 1, 2025', amount: '₱85,000', status: 'pending' }
                ]
            },
            'LC002': {
                title: 'Luxury Downtown Apartment - Contract LC002',
                property: '123 Main Street, Suite 4B, Makati, Metro Manila',
                terms: [
                    { label: 'Monthly Rent', value: '₱110,000' },
                    { label: 'Lease Duration', value: '12 months' },
                    { label: 'Security Deposit', value: '₱110,000' },
                    { label: 'Pet Policy', value: 'Cats allowed with deposit' },
                    { label: 'Utilities Included', value: 'None' },
                    { label: 'Landlord', value: 'XYZ Realty Group' },
                    { label: 'Landlord Phone', value: '(02) 8987-6543' },
                    { label: 'Emergency Contact', value: '(02) 8987-6543' }
                ],
                payments: [
                    { date: 'Mar 1, 2025', amount: '₱110,000', status: 'paid' },
                    { date: 'Apr 1, 2025', amount: '₱110,000', status: 'paid' },
                    { date: 'May 1, 2025', amount: '₱110,000', status: 'paid' },
                    { date: 'Jun 1, 2025', amount: '₱110,000', status: 'paid' },
                    { date: 'Jul 1, 2025', amount: '₱110,000', status: 'paid' },
                    { date: 'Aug 1, 2025', amount: '₱110,000', status: 'paid' },
                    { date: 'Sep 1, 2025', amount: '₱110,000', status: 'paid' },
                    { date: 'Oct 1, 2025', amount: '₱110,000', status: 'paid' },
                    { date: 'Nov 1, 2025', amount: '₱110,000', status: 'paid' },
                    { date: 'Dec 1, 2025', amount: '₱110,000', status: 'pending' },
                    { date: 'Jan 1, 2026', amount: '₱110,000', status: 'pending' },
                    { date: 'Feb 1, 2026', amount: '₱110,000', status: 'pending' }
                ]
            }
        };

        function viewContract(contractId) {
            const contract = contracts[contractId];
            if (!contract) return;

            const modal = document.getElementById('contractModal');
            const title = document.getElementById('contractModalTitle');
            const content = document.getElementById('contractContent');

            title.textContent = contract.title;
            
            let html = `<p style="margin-bottom: 2rem; color: #6b7280; font-size: 16px;"><strong>Property:</strong> ${contract.property}</p>`;
            
            contract.terms.forEach(term => {
                html += `
                    <div class="term-item">
                        <span class="term-label">${term.label}:</span>
                        <span class="term-value">${term.value}</span>
                    </div>
                `;
            });
            
            content.innerHTML = html;
            modal.style.display = 'block';
        }

        function viewPayments(contractId) {
            const contract = contracts[contractId];
            if (!contract) return;

            const modal = document.getElementById('paymentModal');
            const title = document.getElementById('paymentModalTitle');
            const content = document.getElementById('paymentContent');

            title.textContent = `Payment Schedule - ${contractId}`;
            
            let html = '';
            contract.payments.forEach(payment => {
                const statusClass = payment.status === 'paid' ? 'payment-paid' : 'payment-pending';
                const statusText = payment.status === 'paid' ? 'Paid' : 'Pending';
                const itemClass = payment.status === 'paid' ? 'paid' : 'pending';
                
                html += `
                    <div class="payment-item ${itemClass}">
                        <div class="payment-date">${payment.date}</div>
                        <div class="payment-amount">${payment.amount}</div>
                        <div class="payment-status ${statusClass}">${statusText}</div>
                    </div>
                `;
            });
            
            content.innerHTML = html;
            modal.style.display = 'block';
        }

        function closeModal(modalId) {
            const modal = document.getElementById(modalId);
            modal.style.display = 'none';
        }

        // Close modal when clicking outside
        window.onclick = function(event) {
            const contractModal = document.getElementById('contractModal');
            const paymentModal = document.getElementById('paymentModal');
            
            if (event.target === contractModal) {
                contractModal.style.display = 'none';
            }
            if (event.target === paymentModal) {
                paymentModal.style.display = 'none';
            }
        }

        // Close modal with Escape key
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape') {
                const modals = document.querySelectorAll('.modal');
                modals.forEach(modal => {
                    if (modal.style.display === 'block') {
                        modal.style.display = 'none';
                    }
                });
            }
        });

        // Add smooth scrolling for navigation links
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });