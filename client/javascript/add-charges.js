        let chargeCounter = 0;
        let currentMode = 'single';
        
        // Sample tenant data
        const tenants = [
            {id: 1, name: 'Maria Santos', unit: 'Unit 201-A', email: 'maria.santos@email.com', phone: '+63 917 123 4567'},
            {id: 2, name: 'Juan Dela Cruz', unit: 'Unit 305-B', email: 'juan.delacruz@email.com', phone: '+63 918 234 5678'},
            {id: 3, name: 'Ana Rodriguez', unit: 'Unit 102-C', email: 'ana.rodriguez@email.com', phone: '+63 919 345 6789'},
            {id: 4, name: 'Carlos Mendoza', unit: 'Unit 404-D', email: 'carlos.mendoza@email.com', phone: '+63 920 456 7890'},
            {id: 5, name: 'Lisa Garcia', unit: 'Unit 501-E', email: 'lisa.garcia@email.com', phone: '+63 921 567 8901'},
            {id: 6, name: 'Mike Johnson', unit: 'Unit 603-F', email: 'mike.johnson@email.com', phone: '+63 922 678 9012'},
            {id: 7, name: 'Sarah Lee', unit: 'Unit 702-G', email: 'sarah.lee@email.com', phone: '+63 923 789 0123'},
            {id: 8, name: 'David Brown', unit: 'Unit 805-H', email: 'david.brown@email.com', phone: '+63 924 890 1234'}
        ];

        // Initialize form on page load
        document.addEventListener('DOMContentLoaded', function() {
            setDefaultDates();
            addNewCharge();
            document.getElementById('multiple-charges-form').addEventListener('submit', handleFormSubmit);
        });

        // Toggle between single and multiple charge modes
        function toggleMode(mode) {
            currentMode = mode;
            const modeButtons = document.querySelectorAll('.mode-btn');
            const bulkActions = document.getElementById('bulk-actions');
            const addChargeContainer = document.getElementById('add-charge-container');
            const chargesSummary = document.getElementById('charges-summary');
            const submitText = document.getElementById('submit-text');

            // Update active button
            modeButtons.forEach(btn => {
                btn.classList.remove('active');
                if ((mode === 'single' && btn.textContent.includes('Single')) || 
                    (mode === 'multiple' && btn.textContent.includes('Multiple'))) {
                    btn.classList.add('active');
                }
            });

            if (mode === 'multiple') {
                bulkActions.style.display = 'block';
                addChargeContainer.style.display = 'flex';
                chargesSummary.style.display = 'block';
                submitText.textContent = 'Add All Charges';
                
                // Add more charges if only one exists
                if (chargeCounter === 1) {
                    addNewCharge();
                }
            } else {
                bulkActions.style.display = 'none';
                addChargeContainer.style.display = 'none';
                chargesSummary.style.display = 'none';
                submitText.textContent = 'Add Charge';
                
                // Remove extra charges, keep only one
                const chargesList = document.getElementById('charges-list');
                const chargeItems = chargesList.querySelectorAll('.charge-item');
                for (let i = 1; i < chargeItems.length; i++) {
                    chargeItems[i].remove();
                }
                chargeCounter = 1;
            }
            
            updateSummary();
        }

        // Set default dates
        function setDefaultDates() {
            const today = new Date();
            const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 5);
            
            document.getElementById('bulk-charge-date').value = today.toISOString().split('T')[0];
            document.getElementById('bulk-due-date').value = nextMonth.toISOString().split('T')[0];
        }

        // Add new charge item
        function addNewCharge() {
            chargeCounter++;
            const chargesList = document.getElementById('charges-list');
            
            const chargeItem = document.createElement('div');
            chargeItem.className = 'charge-item';
            chargeItem.id = `charge-${chargeCounter}`;
            
            chargeItem.innerHTML = `
                <div class="charge-item-header">
                    <span class="charge-number">Charge #${chargeCounter}</span>
                    <div class="charge-actions">
                        <button type="button" class="duplicate-charge-btn" onclick="duplicateCharge(${chargeCounter})">
                            <i class="fas fa-copy"></i> Duplicate
                        </button>
                        <button type="button" class="remove-charge-btn" onclick="removeCharge(${chargeCounter})">
                            <i class="fas fa-times"></i> Remove
                        </button>
                    </div>
                </div>
                
                <div class="charge-fields">
                    <div class="field-group">
                        <label class="field-label required">Tenant</label>
                        <select class="field-select" name="tenant_${chargeCounter}" required onchange="updateSummary()">
                            <option value="">Choose a tenant...</option>
                            ${tenants.map(tenant => `
                                <option value="${tenant.id}" data-unit="${tenant.unit}" data-email="${tenant.email}" data-phone="${tenant.phone}">
                                    ${tenant.name}
                                </option>
                            `).join('')}
                        </select>
                    </div>
                    
                    <div class="field-group">
                        <label class="field-label required">Charge Type</label>
                        <select class="field-select" name="charge_type_${chargeCounter}" required onchange="updateSummary()">
                            <option value="">Select charge type...</option>
                            <option value="rent">Monthly Rent</option>
                            <option value="utilities">Utilities</option>
                            <option value="maintenance">Maintenance Fee</option>
                            <option value="parking">Parking Fee</option>
                            <option value="late_fee">Late Payment Fee</option>
                            <option value="security_deposit">Security Deposit</option>
                            <option value="cleaning">Cleaning Fee</option>
                            <option value="internet">Internet Fee</option>
                            <option value="cable_tv">Cable TV</option>
                            <option value="association_dues">Association Dues</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                    
                    <div class="field-group">
                        <label class="field-label required">Amount</label>
                        <input type="number" class="field-input" name="amount_${chargeCounter}" step="0.01" min="0" 
                               placeholder="0.00" required oninput="updateSummary()">
                    </div>
                    
                    <div class="field-group">
                        <label class="field-label required">Due Date</label>
                        <input type="date" class="field-input" name="due_date_${chargeCounter}" required>
                    </div>
                    
                    <div class="field-group">
                        <label class="field-label required">Charge Date</label>
                        <input type="date" class="field-input" name="charge_date_${chargeCounter}" required>
                    </div>
                    
                    <div class="field-group">
                        <label class="field-label">Description</label>
                        <textarea class="field-textarea" name="description_${chargeCounter}" 
                                  placeholder="Enter charge description (optional)..."></textarea>
                    </div>
                    
                    <div class="field-group">
                        <label class="field-label">
                            <input type="checkbox" name="is_recurring_${chargeCounter}" onchange="toggleRecurringOptions(${chargeCounter}); updateSummary();" style="margin-right: 8px;">
                            Recurring Charge
                        </label>
                    </div>
                    
                    <div class="field-group recurring-options" id="recurring-${chargeCounter}" style="display: none;">
                        <label class="field-label">Frequency</label>
                        <select class="field-select" name="recurring_frequency_${chargeCounter}">
                            <option value="monthly">Monthly</option>
                            <option value="quarterly">Quarterly</option>
                            <option value="semi-annually">Semi-Annually</option>
                            <option value="annually">Annually</option>
                        </select>
                    </div>
                </div>
            `;
            
            chargesList.appendChild(chargeItem);
            
            // Set default dates for the new charge
            const today = new Date();
            const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 5);
            
            chargeItem.querySelector(`input[name="charge_date_${chargeCounter}"]`).value = today.toISOString().split('T')[0];
            chargeItem.querySelector(`input[name="due_date_${chargeCounter}"]`).value = nextMonth.toISOString().split('T')[0];
            
            updateSummary();
            
            // Animate the new charge item
            chargeItem.style.opacity = '0';
            chargeItem.style.transform = 'translateY(20px)';
            setTimeout(() => {
                chargeItem.style.transition = 'all 0.3s ease';
                chargeItem.style.opacity = '1';
                chargeItem.style.transform = 'translateY(0)';
            }, 10);
        }

        // Remove charge item
        function removeCharge(id) {
            if (chargeCounter <= 1) {
                showAlert('You must have at least one charge.', 'error');
                return;
            }
            
            if (confirm('Are you sure you want to remove this charge?')) {
                const chargeItem = document.getElementById(`charge-${id}`);
                if (chargeItem) {
                    chargeItem.style.transition = 'all 0.3s ease';
                    chargeItem.style.opacity = '0';
                    chargeItem.style.transform = 'translateX(-100%)';
                    
                    setTimeout(() => {
                        chargeItem.remove();
                        renumberCharges();
                        updateSummary();
                    }, 300);
                }
            }
        }

        // Duplicate charge item
        function duplicateCharge(id) {
            const sourceCharge = document.getElementById(`charge-${id}`);
            if (!sourceCharge) return;
            
            // Get all field values from source charge
            const sourceData = {};
            const sourceFields = sourceCharge.querySelectorAll('input, select, textarea');
            sourceFields.forEach(field => {
                if (field.type === 'checkbox') {
                    sourceData[field.name] = field.checked;
                } else {
                    sourceData[field.name] = field.value;
                }
            });
            
            // Create new charge
            addNewCharge();
            
            // Populate new charge with source data (excluding ID-specific fields)
            const newCharge = document.getElementById(`charge-${chargeCounter}`);
            const newFields = newCharge.querySelectorAll('input, select, textarea');
            
            newFields.forEach(field => {
                const fieldBaseName = field.name.replace(/_\d+$/, '');
                const sourceFieldName = Object.keys(sourceData).find(key => 
                    key.replace(/_\d+$/, '') === fieldBaseName
                );
                
                if (sourceFieldName && sourceData[sourceFieldName] !== undefined) {
                    if (field.type === 'checkbox') {
                        field.checked = sourceData[sourceFieldName];
                        if (field.checked && fieldBaseName === 'is_recurring') {
                            toggleRecurringOptions(chargeCounter);
                        }
                    } else {
                        field.value = sourceData[sourceFieldName];
                    }
                }
            });
            
            updateSummary();
            showAlert('Charge duplicated successfully!', 'success');
        }

        // Renumber charges after removal
        function renumberCharges() {
            const chargeItems = document.querySelectorAll('.charge-item');
            chargeItems.forEach((item, index) => {
                const newNumber = index + 1;
                const chargeNumber = item.querySelector('.charge-number');
                if (chargeNumber) {
                    chargeNumber.textContent = `Charge #${newNumber}`;
                }
            });
            chargeCounter = chargeItems.length;
        }

        // Toggle recurring options for specific charge
        function toggleRecurringOptions(id) {
            const checkbox = document.querySelector(`input[name="is_recurring_${id}"]`);
            const recurringOptions = document.getElementById(`recurring-${id}`);
            
            if (checkbox && recurringOptions) {
                recurringOptions.style.display = checkbox.checked ? 'block' : 'none';
            }
        }

        // Apply bulk settings to all charges
        function applyBulkSettings() {
            const bulkDueDate = document.getElementById('bulk-due-date').value;
            const bulkChargeDate = document.getElementById('bulk-charge-date').value;
            const bulkChargeType = document.getElementById('bulk-charge-type').value;
            const bulkAmount = document.getElementById('bulk-amount').value;
            
            let appliedCount = 0;
            
            document.querySelectorAll('.charge-item').forEach(item => {
                if (bulkDueDate) {
                    const dueDateField = item.querySelector('input[name^="due_date_"]');
                    if (dueDateField) {
                        dueDateField.value = bulkDueDate;
                        appliedCount++;
                    }
                }
                
                if (bulkChargeDate) {
                    const chargeDateField = item.querySelector('input[name^="charge_date_"]');
                    if (chargeDateField) chargeDateField.value = bulkChargeDate;
                }
                
                if (bulkChargeType) {
                    const chargeTypeField = item.querySelector('select[name^="charge_type_"]');
                    if (chargeTypeField) chargeTypeField.value = bulkChargeType;
                }
                
                if (bulkAmount) {
                    const amountField = item.querySelector('input[name^="amount_"]');
                    if (amountField) amountField.value = bulkAmount;
                }
            });
            
            updateSummary();
            showAlert(`Bulk settings applied to ${Math.ceil(appliedCount / 4)} charges!`, 'success');
        }

        // Update summary statistics
        function updateSummary() {
            const chargeItems = document.querySelectorAll('.charge-item');
            let totalAmount = 0;
            let uniqueTenants = new Set();
            let recurringCount = 0;
            
            chargeItems.forEach(item => {
                const amountField = item.querySelector('input[name^="amount_"]');
                const tenantField = item.querySelector('select[name^="tenant_"]');
                const recurringField = item.querySelector('input[name^="is_recurring_"]');
                
                if (amountField && amountField.value) {
                    totalAmount += parseFloat(amountField.value) || 0;
                }
                
                if (tenantField && tenantField.value) {
                    uniqueTenants.add(tenantField.value);
                }
                
                if (recurringField && recurringField.checked) {
                    recurringCount++;
                }
            });
            
            document.getElementById('total-charges').textContent = chargeItems.length;
            document.getElementById('total-amount').textContent = `₱${totalAmount.toLocaleString('en-PH', {minimumFractionDigits: 2})}`;
            document.getElementById('unique-tenants').textContent = uniqueTenants.size;
            document.getElementById('recurring-charges').textContent = recurringCount;
        }

        // Reset all charges
        function resetAllCharges() {
            if (confirm('Are you sure you want to reset all charges? This will remove all entered data.')) {
                const chargesList = document.getElementById('charges-list');
                chargesList.innerHTML = '';
                chargeCounter = 0;
                addNewCharge();
                updateSummary();
                showAlert('All charges have been reset.', 'success');
            }
        }

        // Preview all charges
        function previewAllCharges() {
            const chargeItems = document.querySelectorAll('.charge-item');
            let isValid = true;
            let previewData = [];
            
            chargeItems.forEach((item, index) => {
                const tenantField = item.querySelector('select[name^="tenant_"]');
                const chargeTypeField = item.querySelector('select[name^="charge_type_"]');
                const amountField = item.querySelector('input[name^="amount_"]');
                const dueDateField = item.querySelector('input[name^="due_date_"]');
                const chargeDateField = item.querySelector('input[name^="charge_date_"]');
                
                if (!tenantField.value || !chargeTypeField.value || !amountField.value || 
                    !dueDateField.value || !chargeDateField.value) {
                    isValid = false;
                    return;
                }
                
                const selectedTenant = tenants.find(t => t.id == tenantField.value);
                previewData.push({
                    index: index + 1,
                    tenant: selectedTenant ? selectedTenant.name : 'Unknown',
                    unit: selectedTenant ? selectedTenant.unit : 'Unknown',
                    chargeType: chargeTypeField.options[chargeTypeField.selectedIndex].text,
                    amount: parseFloat(amountField.value),
                    dueDate: new Date(dueDateField.value).toLocaleDateString('en-PH'),
                    chargeDate: new Date(chargeDateField.value).toLocaleDateString('en-PH'),
                    recurring: item.querySelector('input[name^="is_recurring_"]').checked
                });
            });
            
            if (!isValid) {
                showAlert('Please fill in all required fields before previewing.', 'error');
                return;
            }
            
            // Create preview modal
            const modal = document.createElement('div');
            modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.8);
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
            `;
            
            const content = document.createElement('div');
            content.style.cssText = `
                background: white;
                border-radius: 16px;
                max-width: 900px;
                max-height: 80vh;
                overflow-y: auto;
                padding: 30px;
                position: relative;
            `;
            
            content.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;">
                    <h2 style="margin: 0; color: #1f2937; font-size: 24px; font-weight: 700;">
                        <i class="fas fa-eye" style="margin-right: 10px; color: #3b82f6;"></i>
                        Charges Preview
                    </h2>
                    <button onclick="this.closest('.modal').remove()" style="background: #ef4444; color: white; border: none; padding: 8px 12px; border-radius: 8px; cursor: pointer;">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <div style="display: grid; gap: 15px;">
                    ${previewData.map(charge => `
                        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px;">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                                <span style="background: #3b82f6; color: white; padding: 6px 12px; border-radius: 6px; font-weight: 600; font-size: 14px;">
                                    Charge #${charge.index}
                                </span>
                                <span style="color: ${charge.recurring ? '#10b981' : '#6b7280'}; font-weight: 600; font-size: 12px; text-transform: uppercase;">
                                    ${charge.recurring ? 'Recurring' : 'One-time'}
                                </span>
                            </div>
                            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; font-size: 14px;">
                                <div><strong>Tenant:</strong> ${charge.tenant}</div>
                                <div><strong>Unit:</strong> ${charge.unit}</div>
                                <div><strong>Type:</strong> ${charge.chargeType}</div>
                                <div><strong>Amount:</strong> ₱${charge.amount.toLocaleString('en-PH', {minimumFractionDigits: 2})}</div>
                                <div><strong>Due Date:</strong> ${charge.dueDate}</div>
                                <div><strong>Charge Date:</strong> ${charge.chargeDate}</div>
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <div style="margin-top: 25px; padding: 20px; background: linear-gradient(135deg, #f0f9ff, #e0f2fe); border-radius: 12px; text-align: center;">
                    <h3 style="margin: 0 0 10px 0; color: #1e40af;">Total Summary</h3>
                    <div style="font-size: 24px; font-weight: 700; color: #1f2937;">
                        ${previewData.length} Charges • ₱${previewData.reduce((sum, charge) => sum + charge.amount, 0).toLocaleString('en-PH', {minimumFractionDigits: 2})}
                    </div>
                </div>
            `;
            
            modal.className = 'modal';
            modal.appendChild(content);
            document.body.appendChild(modal);
        }

        // Handle form submission
        function handleFormSubmit(e) {
            e.preventDefault();
            
            const chargeItems = document.querySelectorAll('.charge-item');
            let allChargesData = [];
            let isValid = true;
            
            chargeItems.forEach((item, index) => {
                const formData = {};
                const fields = item.querySelectorAll('input, select, textarea');
                
                fields.forEach(field => {
                    if (field.type === 'checkbox') {
                        formData[field.name] = field.checked;
                    } else {
                        formData[field.name] = field.value;
                    }
                    
                    // Basic validation
                    if (field.required && !field.value) {
                        isValid = false;
                        field.style.borderColor = '#ef4444';
                    } else {
                        field.style.borderColor = '';
                    }
                });
                
                allChargesData.push(formData);
            });
            
            if (!isValid) {
                showAlert('Please fill in all required fields.', 'error');
                return;
            }
            
            // Show loading state
            const submitBtn = document.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<span class="spinner"></span> Adding Charges...';
            submitBtn.disabled = true;
            
            // Simulate API call
            setTimeout(() => {
                console.log('All Charges Data:', allChargesData);
                
                showAlert(`Successfully added ${chargeItems.length} charge${chargeItems.length > 1 ? 's' : ''}!`, 'success');
                
                // Reset button
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                
                // Ask user what to do next
                setTimeout(() => {
                    const message = `${chargeItems.length} charge${chargeItems.length > 1 ? 's' : ''} added successfully! What would you like to do next?`;
                    if (confirm(message + '\n\nClick OK to add more charges, or Cancel to go back.')) {
                        resetAllCharges();
                    } else {
                        window.history.back();
                    }
                }, 1500);
            }, 2000);
        }

        // Show alert messages
        function showAlert(message, type) {
            const existingAlerts = document.querySelectorAll('.alert-message');
            existingAlerts.forEach(alert => alert.remove());
            
            const alert = document.createElement('div');
            alert.className = `alert-message alert-${type}`;
            alert.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-triangle'}"></i> ${message}`;
            
            document.body.appendChild(alert);
            
            setTimeout(() => {
                if (alert.parentNode) {
                    alert.style.animation = 'slideOutRight 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)';
                    setTimeout(() => alert.remove(), 300);
                }
            }, 4000);
        }