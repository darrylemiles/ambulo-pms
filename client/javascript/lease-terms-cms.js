        // Default lease terms data
        let leaseTerms = [
            {
                id: 1,
                setting_key: 'security_deposit_months',
                setting_value: '1',
                data_type: 'number',
                description: 'Default security deposit required (in months)'
            },
            {
                id: 2,
                setting_key: 'advance_payment_months',
                setting_value: '2',
                data_type: 'number',
                description: 'Default advance rent payment required (in months)'
            },
            {
                id: 3,
                setting_key: 'payment_frequency',
                setting_value: 'Monthly',
                data_type: 'text',
                description: 'Default payment frequency'
            },
            {
                id: 4,
                setting_key: 'lease_term_months',
                setting_value: '24',
                data_type: 'number',
                description: 'Minimum lease terms'
            },
            {
                id: 5,
                setting_key: 'quarterly_tax_percentage',
                setting_value: '3',
                data_type: 'percentage',
                description: 'Default quarterly tax'
            },
            {
                id: 6,
                setting_key: 'late_fee_percentage',
                setting_value: '10',
                data_type: 'percentage',
                description: 'Late payment fee percentage'
            },
            {
                id: 7,
                setting_key: 'grace_period_days',
                setting_value: '10',
                data_type: 'number',
                description: 'Number of days grace period before late fee applies'
            },
            {
                id: 8,
                setting_key: 'auto_termination_after_months',
                setting_value: '2',
                data_type: 'number',
                description: 'Months of non-payment before termination'
            },
            {
                id: 9,
                setting_key: 'termination_trigger_days',
                setting_value: '61',
                data_type: 'number',
                description: 'Contract auto-termination [days] after 2 month nonpayment'
            },
            {
                id: 10,
                setting_key: 'advance_payment_forfeited_on_cancel',
                setting_value: 'true',
                data_type: 'boolean',
                description: 'Advance payment forfeited if tenant cancelled'
            },
            {
                id: 11,
                setting_key: 'is_security_deposit_refundable',
                setting_value: 'true',
                data_type: 'boolean',
                description: 'If security deposits can be refunded'
            },
            {
                id: 12,
                setting_key: 'notice_before_cancel_days',
                setting_value: '30',
                data_type: 'number',
                description: 'Notice period required before cancellation'
            },
            {
                id: 13,
                setting_key: 'notice_before_renewal_days',
                setting_value: '30',
                data_type: 'number',
                description: 'Notice period required before renewal'
            },
            {
                id: 14,
                setting_key: 'rent_increase_on_renewal',
                setting_value: '10',
                data_type: 'percentage',
                description: 'Rent increase percentage at end of lease term'
            }
        ];

        let editingId = null;
        let deleteId = null;

        // Initialize the application
        document.addEventListener('DOMContentLoaded', function() {
            renderLeaseTermsTable();
        });

        // Render all lease terms as a table
        function renderLeaseTermsTable() {
            const container = document.getElementById('lease-terms-container');
            
            if (leaseTerms.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-file-contract"></i>
                        <h3>No Lease Terms Configured</h3>
                        <p>Get started by adding your first lease term setting.</p>
                        <button class="btn btn-primary" onclick="addNewLeaseTerm()">
                            <i class="fas fa-plus"></i>
                            Add First Lease Term
                        </button>
                    </div>
                `;
                return;
            }

            container.innerHTML = `
                <div class="table-container">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>Setting Key</th>
                                <th>Value</th>
                                <th>Type</th>
                                <th>Description</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${leaseTerms.map(term => `
                                <tr>
                                    <td>
                                        <div class="setting-key">${formatSettingKey(term.setting_key)}</div>
                                        <div style="font-size: 12px; color: #64748b; margin-top: 2px;">${term.setting_key}</div>
                                    </td>
                                    <td>
                                        <span class="setting-value">${formatValue(term.setting_value, term.data_type)}</span>
                                    </td>
                                    <td>
                                        <span class="data-type-badge data-type-${term.data_type}">${term.data_type}</span>
                                    </td>
                                    <td class="description-cell">${term.description}</td>
                                    <td class="actions-cell">
                                        <button class="btn btn-primary btn-small" onclick="editLeaseTerm(${term.id})">
                                            <i class="fas fa-edit"></i>
                                            Edit
                                        </button>
                                        <button class="btn btn-danger btn-small" onclick="deleteLeaseTerm(${term.id})">
                                            <i class="fas fa-trash"></i>
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        }

        // Format setting key for display
        function formatSettingKey(key) {
            return key.replace(/_/g, ' ')
                     .replace(/\b\w/g, l => l.toUpperCase());
        }

        // Format value based on data type
        function formatValue(value, dataType) {
            switch(dataType) {
                case 'percentage':
                    return value + '%';
                case 'boolean':
                    return value === 'true' ? 'Yes' : 'No';
                case 'number':
                    return parseInt(value).toLocaleString();
                default:
                    return value;
            }
        }

        // Switch between tabs
        function switchTab(tabName) {
            // Remove active class from all tabs
            document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
            
            // Add active class to selected tab
            document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
            document.getElementById(`${tabName}-tab`).classList.add('active');
        }

        // Add new lease term
        function addNewLeaseTerm() {
            editingId = null;
            document.getElementById('modal-title').textContent = 'Add New Lease Term';
            document.getElementById('lease-term-form').reset();
            clearFormErrors();
            document.getElementById('lease-term-modal').classList.add('show');
        }

        // Edit lease term
        function editLeaseTerm(id) {
            const term = leaseTerms.find(t => t.id === id);
            if (!term) return;

            editingId = id;
            document.getElementById('modal-title').textContent = 'Edit Lease Term';
            document.getElementById('setting_key').value = term.setting_key;
            document.getElementById('setting_value').value = term.setting_value;
            document.getElementById('data_type').value = term.data_type;
            document.getElementById('description').value = term.description;
            clearFormErrors();
            document.getElementById('lease-term-modal').classList.add('show');
        }

        // Delete lease term
        function deleteLeaseTerm(id) {
            deleteId = id;
            document.getElementById('delete-modal').classList.add('show');
        }

        // Confirm delete
        function confirmDelete() {
            if (deleteId) {
                leaseTerms = leaseTerms.filter(term => term.id !== deleteId);
                renderLeaseTermsTable();
                closeDeleteModal();
                showNotification('Lease term deleted successfully!', 'success');
                deleteId = null;
            }
        }

        // Close modals
        function closeModal() {
            document.getElementById('lease-term-modal').classList.remove('show');
            clearFormErrors();
        }

        function closeDeleteModal() {
            document.getElementById('delete-modal').classList.remove('show');
            deleteId = null;
        }

        // Clear form errors
        function clearFormErrors() {
            document.querySelectorAll('.field-error').forEach(error => error.textContent = '');
            document.querySelectorAll('.form-input').forEach(input => input.classList.remove('error'));
        }

        // Validate form
        function validateForm() {
            let isValid = true;
            clearFormErrors();

            const settingKey = document.getElementById('setting_key').value.trim();
            const settingValue = document.getElementById('setting_value').value.trim();
            const description = document.getElementById('description').value.trim();

            if (!settingKey) {
                document.getElementById('setting_key_error').textContent = 'Setting key is required';
                document.getElementById('setting_key').classList.add('error');
                isValid = false;
            } else if (!/^[a-z_]+$/.test(settingKey)) {
                document.getElementById('setting_key_error').textContent = 'Setting key must contain only lowercase letters and underscores';
                document.getElementById('setting_key').classList.add('error');
                isValid = false;
            } else {
                // Check for duplicate setting key (except when editing)
                const existingTerm = leaseTerms.find(term => term.setting_key === settingKey && term.id !== editingId);
                if (existingTerm) {
                    document.getElementById('setting_key_error').textContent = 'Setting key already exists';
                    document.getElementById('setting_key').classList.add('error');
                    isValid = false;
                }
            }

            if (!settingValue) {
                document.getElementById('setting_value_error').textContent = 'Setting value is required';
                document.getElementById('setting_value').classList.add('error');
                isValid = false;
            }

            if (!description) {
                document.getElementById('description_error').textContent = 'Description is required';
                document.getElementById('description').classList.add('error');
                isValid = false;
            }

            return isValid;
        }

        // Handle form submission
        document.getElementById('lease-term-form').addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (!validateForm()) {
                return;
            }

            const formData = {
                setting_key: document.getElementById('setting_key').value.trim(),
                setting_value: document.getElementById('setting_value').value.trim(),
                data_type: document.getElementById('data_type').value,
                description: document.getElementById('description').value.trim()
            };

            if (editingId) {
                // Update existing term
                const index = leaseTerms.findIndex(term => term.id === editingId);
                if (index !== -1) {
                    leaseTerms[index] = { ...leaseTerms[index], ...formData };
                    showNotification('Lease term updated successfully!', 'success');
                }
            } else {
                // Add new term
                const newId = Math.max(...leaseTerms.map(t => t.id), 0) + 1;
                leaseTerms.push({ id: newId, ...formData });
                showNotification('Lease term added successfully!', 'success');
            }

            renderLeaseTermsTable();
            closeModal();
        });

        // Show notification
        function showNotification(message, type) {
            const notification = document.createElement('div');
            notification.className = `notification ${type}`;
            notification.innerHTML = `
                <i class="fas fa-${type === 'success' ? 'check' : 'exclamation-triangle'}"></i>
                ${message}
            `;
            
            document.body.appendChild(notification);
            
            setTimeout(() => notification.classList.add('show'), 100);
            
            setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => notification.remove(), 400);
            }, 3000);
        }

        // Go back function
        function goBack() {
            if (window.history.length > 1) {
                window.history.back();
            } else {
                window.location.href = '/contentManagement.html';
            }
        }

        // Close modals when clicking outside
        document.addEventListener('click', function(e) {
            if (e.target.classList.contains('modal')) {
                if (e.target.id === 'lease-term-modal') {
                    closeModal();
                } else if (e.target.id === 'delete-modal') {
                    closeDeleteModal();
                }
            }
        });

        // Close modals with Escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeModal();
                closeDeleteModal();
            }
        });