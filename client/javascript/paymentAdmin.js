import fetchCompanyDetails from "../api/loadCompanyInfo.js";

async function setDynamicInfo() {
  const company = await fetchCompanyDetails();
  if (!company) return;

  const favicon = document.querySelector('link[rel="icon"]');
  if (favicon && company.icon_logo_url) {
    favicon.href = company.icon_logo_url;
  }

  document.title = company.company_name
    ? `Manage Payment - ${company.company_name}`
    : "Manage Payment";
}

document.addEventListener("DOMContentLoaded", () => {
  setDynamicInfo();
});

// Enhanced data structure combining both systems
const leasesData = [
    {
        id: 'lease-1',
        tenant: 'Maria Santos',
        unit: 'Unit 201-A',
        period: 'Jan 2025 - Dec 2025',
        email: 'maria.santos@email.com',
        phone: '+63 917 123 4567',
        paymentHistory: [
            {
                id: 'pay-1',
                chargeId: 25,
                amount: 2800,
                paymentDate: '2025-01-08',
                paymentMethod: 'gcash',
                reference: 'GC-2025-0108-001',
                description: 'Electricity - November 2024',
                type: 'utility',
                processedBy: 'Admin User',
                notes: 'Payment processed successfully via GCash'
            },
            {
                id: 'pay-2',
                chargeId: 26,
                amount: 25000,
                paymentDate: '2025-01-05',
                paymentMethod: 'cash',
                reference: 'CSH-2025-0105-002',
                description: 'Monthly Rent - December 2024',
                type: 'rent',
                processedBy: 'Admin User',
                notes: 'Cash payment received on time'
            }
        ],
        charges: [
            { 
                id: 1, 
                type: 'rent', 
                description: 'Monthly Rent - January 2025', 
                amount: 25000, 
                dueDate: '2025-01-05', 
                status: 'overdue',
                createdDate: '2024-12-28',
                notes: 'Monthly rental payment for Unit 201-A for January 2025. Payment is now overdue.'
            },
            { 
                id: 2, 
                type: 'utility', 
                description: 'Electricity - December 2024', 
                amount: 3200, 
                dueDate: '2025-01-15', 
                status: 'due-soon',
                createdDate: '2024-12-30',
                notes: 'Electricity consumption for December 2024 - 420 kWh usage. Due soon.'
            },
            { 
                id: 3, 
                type: 'maintenance', 
                description: 'AC Unit Repair', 
                amount: 4500, 
                dueDate: '2025-01-20', 
                status: 'pending',
                createdDate: '2025-01-02',
                notes: 'Emergency repair of AC unit in living room. Parts and labor included.'
            },
            { 
                id: 4, 
                type: 'penalty', 
                description: 'Late Payment Fee - December Rent', 
                amount: 500, 
                dueDate: '2025-01-05', 
                status: 'overdue',
                createdDate: '2024-12-20',
                notes: 'Late payment penalty for December rent (5 days overdue). 2.5% penalty rate.'
            }
        ]
    },
    {
        id: 'lease-2',
        tenant: 'Juan Dela Cruz',
        unit: 'Unit 305-B',
        period: 'Mar 2024 - Feb 2025',
        email: 'juan.delacruz@email.com',
        phone: '+63 918 234 5678',
        paymentHistory: [
            {
                id: 'pay-5',
                chargeId: 5,
                amount: 18500,
                paymentDate: '2025-01-03',
                paymentMethod: 'cash',
                reference: 'CSH-2025-0103-005',
                description: 'Monthly Rent - January 2025',
                type: 'rent',
                processedBy: 'Admin User',
                notes: 'Cash payment received on time'
            },
            {
                id: 'pay-6',
                chargeId: 27,
                amount: 2400,
                paymentDate: '2025-01-10',
                paymentMethod: 'gcash',
                reference: 'GC-2025-0110-006',
                description: 'Water Bill - December 2024',
                type: 'utility',
                processedBy: 'System Auto',
                notes: 'GCash payment processed successfully'
            }
        ],
        charges: [
            { 
                id: 6, 
                type: 'utility', 
                description: 'Electricity - December 2024', 
                amount: 2800, 
                dueDate: '2025-01-18', 
                status: 'due-soon',
                createdDate: '2024-12-30',
                notes: 'Electricity consumption for December 2024 - 380 kWh usage. Due soon.'
            },
            { 
                id: 7, 
                type: 'rent', 
                description: 'Monthly Rent - February 2025', 
                amount: 18500, 
                dueDate: '2025-02-05', 
                status: 'pending',
                createdDate: '2025-01-28',
                notes: 'Monthly rental payment for Unit 305-B for February 2025.'
            }
        ]
    },
    {
        id: 'lease-3',
        tenant: 'Elena Fernandez',
        unit: 'Unit 501-E',
        period: 'Nov 2024 - Oct 2025',
        email: 'elena.fernandez@email.com',
        phone: '+63 921 567 8901',
        paymentHistory: [
            {
                id: 'pay-13',
                chargeId: 22,
                amount: 32000,
                paymentDate: '2025-01-02',
                paymentMethod: 'gcash',
                reference: 'GC-2025-0102-013',
                description: 'Monthly Rent - January 2025',
                type: 'rent',
                processedBy: 'System Auto',
                notes: 'GCash payment received early'
            },
            {
                id: 'pay-14',
                chargeId: 28,
                amount: 1200,
                paymentDate: '2025-01-08',
                paymentMethod: 'cash',
                reference: 'CSH-2025-0108-014',
                description: 'Plumbing Repair - Kitchen Sink',
                type: 'maintenance',
                processedBy: 'Admin User',
                notes: 'Emergency plumbing repair completed and paid in cash'
            }
        ],
        charges: [
            { 
                id: 23, 
                type: 'utility', 
                description: 'Electricity - December 2024', 
                amount: 4500, 
                dueDate: '2025-01-12', 
                status: 'overdue',
                createdDate: '2024-12-30',
                notes: 'Electricity consumption for December 2024 - 550 kWh usage. Payment is overdue.'
            },
            { 
                id: 24, 
                type: 'maintenance', 
                description: 'Elevator Maintenance Fee', 
                amount: 800, 
                dueDate: '2025-01-25', 
                status: 'pending',
                createdDate: '2025-01-05',
                notes: 'Monthly elevator maintenance fee for penthouse access.'
            }
        ]
    },
    {
        id: 'lease-4',
        tenant: 'Robert Chen',
        unit: 'Unit 102-C',
        period: 'Jun 2024 - May 2025',
        email: 'robert.chen@email.com',
        phone: '+63 922 678 9012',
        paymentHistory: [
            {
                id: 'pay-15',
                chargeId: 29,
                amount: 22000,
                paymentDate: '2024-12-28',
                paymentMethod: 'gcash',
                reference: 'GC-2024-1228-015',
                description: 'Monthly Rent - December 2024',
                type: 'rent',
                processedBy: 'Admin User',
                notes: 'GCash payment received early for end of year'
            }
        ],
        charges: [
            { 
                id: 8, 
                type: 'rent', 
                description: 'Monthly Rent - January 2025', 
                amount: 22000, 
                dueDate: '2025-01-03', 
                status: 'overdue',
                createdDate: '2024-12-28',
                notes: 'Monthly rental payment for Unit 102-C. Payment is significantly overdue.'
            },
            { 
                id: 9, 
                type: 'utility', 
                description: 'Water Bill - December 2024', 
                amount: 800, 
                dueDate: '2025-01-16', 
                status: 'due-soon',
                createdDate: '2024-12-30',
                notes: 'Water consumption for December 2024. Due soon.'
            },
            { 
                id: 10, 
                type: 'penalty', 
                description: 'Late Payment Fee - January Rent', 
                amount: 1100, 
                dueDate: '2025-01-10', 
                status: 'overdue',
                createdDate: '2025-01-05',
                notes: 'Late payment penalty for January rent (5% penalty rate applied).'
            }
        ]
    }
];

// Global variables
let filteredCharges = [];
let filteredPayments = [];
let filteredData = [...leasesData];
let editingChargeId = null;
let currentPaymentCharge = null;
let currentViewingCharge = null;
let chargeToDelete = null;
let currentPaymentFilter = 'all';
let currentEditingCharge = null;

// Initialize charges and payments arrays for backward compatibility
let charges = [];
let payments = [];

// Populate backward compatibility arrays
function syncDataArrays() {
    charges = [];
    payments = [];
    
    leasesData.forEach(lease => {
        lease.charges.forEach(charge => {
            if (charge.status !== 'paid') {
                charges.push({
                    ...charge,
                    tenant: lease.tenant,
                    email: lease.email,
                    unit: lease.unit
                });
            }
        });
        
        if (lease.paymentHistory) {
            lease.paymentHistory.forEach(payment => {
                payments.push({
                    ...payment,
                    tenant: lease.tenant,
                    email: lease.email,
                    unit: lease.unit
                });
            });
        }
    });
    
    filteredCharges = [...charges];
    filteredPayments = [...payments];
}

// Utility Functions
function formatCurrency(amount) {
    return `₱${amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}`;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-PH', {
        year: 'numeric',
        month: 'short',
        day: '2-digit'
    });
}

function getDaysUntilDue(dueDate) {
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}

// Enhanced status determination with explicit status handling
function getChargeStatus(charge) {
    // Use explicit status first if provided
    if (charge.status === 'paid') return 'paid';
    if (charge.status === 'overdue') return 'overdue';
    if (charge.status === 'due-soon') return 'due-soon';
    if (charge.status === 'pending') return 'pending';
    
    // Fallback to date-based calculation
    const daysUntilDue = getDaysUntilDue(charge.dueDate);
    
    if (daysUntilDue < 0) return 'overdue';
    if (daysUntilDue <= 3) return 'due-soon';
    return 'pending';
}

// Helper function to determine status based on due date
function getChargeStatusByDate(dueDate) {
    const daysUntilDue = getDaysUntilDue(dueDate);
    
    if (daysUntilDue < 0) return 'overdue';
    if (daysUntilDue <= 3) return 'due-soon';
    return 'pending';
}

function getStatusDisplay(charge) {
    const status = getChargeStatus(charge);
    const daysUntilDue = getDaysUntilDue(charge.dueDate);
    
    switch (status) {
        case 'overdue':
            return `<span class="status-indicator overdue">
                <i class="fas fa-exclamation-triangle"></i> ${Math.abs(daysUntilDue)} days overdue
            </span>`;
        case 'due-soon':
            return `<span class="status-indicator due-soon">
                <i class="fas fa-clock"></i> Due in ${daysUntilDue} days
            </span>`;
        case 'paid':
            return `<span class="status-indicator paid">
                <i class="fas fa-check-circle"></i> Paid
            </span>`;
        case 'pending':
            return `<span class="status-indicator pending">
                <i class="fas fa-clock"></i> Due in ${daysUntilDue} days
            </span>`;
        default:
            return `<span class="status-indicator pending">
                <i class="fas fa-clock"></i> Pending
            </span>`;
    }
}

// Add enhanced button styles
function injectEnhancedButtonStyles() {
    if (document.getElementById('enhanced-modal-styles')) return;
    
    const styleSheet = document.createElement('style');
    styleSheet.id = 'enhanced-modal-styles';
    styleSheet.textContent = `
        .modal-actions {
            display: flex;
            gap: 12px;
            justify-content: flex-end;
            align-items: center;
            margin-top: 24px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
        }

        .modal-actions button {
            padding: 12px 24px;
            border: none;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
            min-width: 100px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            font-family: system-ui, -apple-system, sans-serif;
        }

        .btn-primary {
            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
            color: white;
            box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2);
        }

        .btn-primary:hover {
            background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
            box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
            transform: translateY(-1px);
        }

        .btn-secondary {
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            color: #475569;
            border: 1px solid #cbd5e1;
            box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
        }

        .btn-secondary:hover {
            background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
            color: #334155;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            transform: translateY(-1px);
        }

        .btn-success {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            box-shadow: 0 2px 4px rgba(16, 185, 129, 0.2);
        }

        .btn-success:hover {
            background: linear-gradient(135deg, #059669 0%, #047857 100%);
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
            transform: translateY(-1px);
        }

        .btn-danger {
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
            color: white;
            box-shadow: 0 2px 4px rgba(239, 68, 68, 0.2);
        }

        .btn-danger:hover {
            background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
            box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
            transform: translateY(-1px);
        }
    `;
    
    document.head.appendChild(styleSheet);
}

function generateReference(method) {
    const prefixes = {
        'cash': 'CSH',
        'gcash': 'GC'
    };
    
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    
    return `${prefixes[method] || 'PAY'}-${dateStr.slice(0, 4)}-${dateStr.slice(4, 8)}-${random}`;
}

function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function getCurrentMonth() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

// Alert System
function showAlert(message, type = 'info') {
    const alertColors = {
        success: '#10b981',
        error: '#ef4444', 
        warning: '#f59e0b',
        info: '#3b82f6'
    };

    const alertIcons = {
        success: 'check-circle',
        error: 'exclamation-triangle',
        warning: 'exclamation-circle',
        info: 'info-circle'
    };

    const existingAlerts = document.querySelectorAll('.alert-notification');
    existingAlerts.forEach(alert => alert.remove());

    const alert = document.createElement('div');
    alert.className = 'alert-notification';
    alert.style.background = alertColors[type];
    alert.innerHTML = `
        <i class="fas fa-${alertIcons[type]}"></i>
        ${message}
    `;

    document.body.appendChild(alert);

    setTimeout(() => {
        if (alert.parentNode) {
            alert.style.animation = 'slideOutRight 0.3s ease forwards';
            setTimeout(() => alert.remove(), 300);
        }
    }, 4000);
}

// Statistics calculation
function updateStatistics() {
    syncDataArrays();
    
    const totalCharges = charges.length;
    const overdueCharges = charges.filter(c => getChargeStatus(c) === 'overdue').length;
    const dueSoonCharges = charges.filter(c => getChargeStatus(c) === 'due-soon').length;
    const totalChargesAmount = charges.reduce((sum, c) => sum + c.amount, 0);
    
    const totalPayments = payments.length;
    const totalPaidAmount = payments.reduce((sum, p) => sum + p.amount, 0);
    
    // Update main statistics
    const totalElement = document.getElementById('total-charges');
    const overdueElement = document.getElementById('overdue-charges');
    const paidElement = document.getElementById('paid-charges');
    const amountElement = document.getElementById('total-amount');
    
    if (totalElement) totalElement.textContent = totalCharges;
    if (overdueElement) overdueElement.textContent = overdueCharges;
    if (paidElement) paidElement.textContent = totalPayments;
    if (amountElement) amountElement.textContent = formatCurrency(totalChargesAmount);
    
    // Update section stats for charges table
    const activeCharges = charges.filter(c => c.status !== 'paid').length;
    const chargesTotalStat = document.getElementById('charges-total-stat');
    const chargesOverdueStat = document.getElementById('charges-overdue-stat');
    const chargesActiveStat = document.getElementById('charges-active-stat');
    
    if (chargesTotalStat) chargesTotalStat.textContent = `${totalCharges} Total`;
    if (chargesOverdueStat) chargesOverdueStat.textContent = `${overdueCharges} Overdue`;
    if (chargesActiveStat) chargesActiveStat.textContent = `${dueSoonCharges} Due Soon`;
    
    // Update payment stats
    const currentMonth = new Date().toISOString().slice(0, 7);
    const monthlyPayments = payments.filter(p => p.paymentDate.startsWith(currentMonth));
    const monthlyAmount = monthlyPayments.reduce((sum, p) => sum + p.amount, 0);
    
    const paymentsCountStat = document.getElementById('payments-count-stat');
    const paymentsAmountStat = document.getElementById('payments-amount-stat');
    const paymentsMonthStat = document.getElementById('payments-month-stat');
    
    if (paymentsCountStat) paymentsCountStat.textContent = `${totalPayments} Payments`;
    if (paymentsAmountStat) paymentsAmountStat.textContent = `${formatCurrency(totalPaidAmount)} Collected`;
    if (paymentsMonthStat) paymentsMonthStat.textContent = `This Month: ${formatCurrency(monthlyAmount)}`;
}

// Find functions
function findChargeById(chargeId) {
    for (let lease of leasesData) {
        const charge = lease.charges.find(charge => charge.id === chargeId);
        if (charge) return charge;
    }
    return null;
}

function findLeaseByChargeId(chargeId) {
    return leasesData.find(lease => 
        lease.charges.some(charge => charge.id === chargeId)
    );
}

function findPaymentById(paymentId) {
    for (let lease of leasesData) {
        if (lease.paymentHistory) {
            const payment = lease.paymentHistory.find(payment => payment.id === paymentId);
            if (payment) return payment;
        }
    }
    return null;
}

function findLeaseByPaymentId(paymentId) {
    return leasesData.find(lease => 
        lease.paymentHistory && lease.paymentHistory.some(payment => payment.id === paymentId)
    );
}

// Add New Charge Function
function addNewCharge() {
    // Reset form
    const form = document.getElementById('addChargeForm');
    if (form) form.reset();
    
    // Set default due date to next month
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const defaultDueDate = nextMonth.toISOString().split('T')[0];
    
    const dueDateField = document.getElementById('addChargeDueDate');
    if (dueDateField) dueDateField.value = defaultDueDate;
    
    createModalsAndDialogs();
    openModal('addChargeModal');
}

// Handle Add Charge Submission
function handleAddChargeSubmission(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const chargeData = {
        tenant: formData.get('tenant').trim(),
        unit: formData.get('unit').trim(),
        type: formData.get('type'),
        description: formData.get('description').trim(),
        amount: parseFloat(formData.get('amount')),
        dueDate: formData.get('dueDate'),
        notes: formData.get('notes').trim(),
        createdDate: new Date().toISOString().split('T')[0],
        status: 'pending'
    };
    
    // Validation
    if (!chargeData.tenant || !chargeData.unit) {
        showAlert('Tenant name and unit are required', 'error');
        return;
    }
    
    if (!chargeData.description) {
        showAlert('Description is required', 'error');
        return;
    }
    
    if (chargeData.amount <= 0) {
        showAlert('Amount must be greater than zero', 'error');
        return;
    }
    
    if (!chargeData.dueDate) {
        showAlert('Due date is required', 'error');
        return;
    }
    
    // Find or create lease
    let lease = leasesData.find(l => 
        l.tenant.toLowerCase() === chargeData.tenant.toLowerCase() && 
        l.unit.toLowerCase() === chargeData.unit.toLowerCase()
    );
    
    if (!lease) {
        // Create new lease entry
        lease = {
            id: `lease-${Date.now()}`,
            tenant: chargeData.tenant,
            unit: chargeData.unit,
            period: 'New Lease',
            email: 'contact@property.com',
            phone: 'Not provided',
            paymentHistory: [],
            charges: []
        };
        leasesData.push(lease);
    }
    
    // Create new charge
    const newCharge = {
        id: Date.now(),
        type: chargeData.type,
        description: chargeData.description,
        amount: chargeData.amount,
        dueDate: chargeData.dueDate,
        status: getChargeStatusByDate(chargeData.dueDate),
        createdDate: chargeData.createdDate,
        notes: chargeData.notes || `Charge created on ${formatDate(chargeData.createdDate)}`
    };
    
    lease.charges.push(newCharge);
    
    syncDataArrays();
    filteredCharges = [...charges];
    updateStatistics();
    renderChargesTable();
    closeModal('addChargeModal');
    
    showAlert(`New charge of ${formatCurrency(chargeData.amount)} added successfully!`, 'success');
}

// Edit Charge Function
function editCharge(id) {
    const charge = findChargeById(id);
    const lease = findLeaseByChargeId(id);
    
    if (!charge || !lease) {
        showAlert('Charge not found', 'error');
        return;
    }
    
    currentEditingCharge = charge;
    
    // Pre-fill the form with current charge data
    document.getElementById('editChargeId').value = charge.id;
    document.getElementById('editChargeType').value = charge.type;
    document.getElementById('editChargeDescription').value = charge.description;
    document.getElementById('editChargeAmount').value = charge.amount;
    document.getElementById('editChargeDueDate').value = charge.dueDate;
    document.getElementById('editChargeNotes').value = charge.notes || '';
    
    // Show tenant info for context
    document.getElementById('editChargeTenantInfo').textContent = `${lease.tenant} - ${lease.unit}`;
    
    createModalsAndDialogs();
    openModal('editChargeModal');
}

// Handle Edit Charge Submission
function handleEditChargeSubmission(event) {
    event.preventDefault();
    
    if (!currentEditingCharge) {
        showAlert('No charge selected for editing', 'error');
        return;
    }
    
    const formData = new FormData(event.target);
    const updatedData = {
        type: formData.get('type'),
        description: formData.get('description').trim(),
        amount: parseFloat(formData.get('amount')),
        dueDate: formData.get('dueDate'),
        notes: formData.get('notes').trim()
    };
    
    // Validation
    if (!updatedData.description) {
        showAlert('Description is required', 'error');
        return;
    }
    
    if (updatedData.amount <= 0) {
        showAlert('Amount must be greater than zero', 'error');
        return;
    }
    
    if (!updatedData.dueDate) {
        showAlert('Due date is required', 'error');
        return;
    }
    
    // Update the charge
    Object.assign(currentEditingCharge, updatedData);
    
    // Recalculate status based on new due date
    const newStatus = getChargeStatus(currentEditingCharge);
    currentEditingCharge.status = newStatus;
    
    syncDataArrays();
    filteredCharges = [...charges];
    updateStatistics();
    renderChargesTable();
    closeModal('editChargeModal');
    
    showAlert('Charge updated successfully!', 'success');
}

// Remove Charge Function
function removeCharge(id) {
    const charge = findChargeById(id);
    const lease = findLeaseByChargeId(id);
    
    if (!charge || !lease) {
        showAlert('Charge not found', 'error');
        return;
    }
    
    chargeToDelete = { charge, lease };
    
    // Fill delete confirmation details
    document.getElementById('deleteChargeTenant').textContent = lease.tenant;
    document.getElementById('deleteChargeUnit').textContent = lease.unit;
    document.getElementById('deleteChargeDescription').textContent = charge.description;
    document.getElementById('deleteChargeAmount').textContent = formatCurrency(charge.amount);
    document.getElementById('deleteChargeDueDate').textContent = formatDate(charge.dueDate);
    
    createModalsAndDialogs();
    openModal('deleteChargeModal');
}

// Handle Delete Charge Confirmation
function confirmDeleteCharge() {
    if (!chargeToDelete) {
        showAlert('No charge selected for deletion', 'error');
        return;
    }
    
    const { charge, lease } = chargeToDelete;
    
    // Remove charge from lease
    const chargeIndex = lease.charges.findIndex(c => c.id === charge.id);
    if (chargeIndex > -1) {
        lease.charges.splice(chargeIndex, 1);
    }
    
    // Remove related payments if any
    if (lease.paymentHistory) {
        lease.paymentHistory = lease.paymentHistory.filter(p => p.chargeId !== charge.id);
    }
    
    syncDataArrays();
    filteredCharges = [...charges];
    filteredPayments = [...payments];
    updateStatistics();
    renderChargesTable();
    renderPaymentsTable();
    closeModal('deleteChargeModal');
    
    showAlert('Charge deleted successfully!', 'success');
    chargeToDelete = null;
}

// Record payment function
function recordPayment(chargeId) {
    const charge = findChargeById(chargeId);
    const lease = findLeaseByChargeId(chargeId);
    
    if (!charge || !lease) {
        showAlert('Charge not found', 'error');
        return;
    }

    currentPaymentCharge = charge;
    document.getElementById('paymentChargeId').value = chargeId;
    document.getElementById('paymentAmount').value = charge.amount;
    document.getElementById('paymentDate').value = new Date().toISOString().split('T')[0];
    
    createModalsAndDialogs();
    openModal('paymentModal');
}

// Handle payment submission
function handlePaymentSubmission(event) {
    event.preventDefault();
    
    if (!currentPaymentCharge) {
        showAlert('No charge selected for payment', 'error');
        return;
    }
    
    const formData = new FormData(event.target);
    const paymentData = {
        amount: parseFloat(formData.get('amount')),
        paymentMethod: formData.get('method'),
        reference: formData.get('reference').trim(),
        paymentDate: formData.get('date'),
        notes: 'Payment recorded through admin interface'
    };
    
    // Validation
    if (paymentData.amount <= 0) {
        showAlert('Payment amount must be greater than zero', 'error');
        return;
    }
    
    if (!paymentData.paymentMethod) {
        showAlert('Please select a payment method', 'error');
        return;
    }
    
    // Generate reference if not provided
    if (!paymentData.reference) {
        paymentData.reference = generateReference(paymentData.paymentMethod);
    }
    
    const lease = findLeaseByChargeId(currentPaymentCharge.id);
    const charge = findChargeById(currentPaymentCharge.id);
    
    if (!lease || !charge) {
        showAlert('Charge or lease not found', 'error');
        return;
    }
    
    // Create new payment record
    const newPayment = {
        id: `pay-${Date.now()}`,
        chargeId: currentPaymentCharge.id,
        ...paymentData,
        description: currentPaymentCharge.description,
        type: currentPaymentCharge.type,
        processedBy: 'Admin User'
    };
    
    if (!lease.paymentHistory) {
        lease.paymentHistory = [];
    }
    
    lease.paymentHistory.unshift(newPayment);
    charge.status = 'paid';

    syncDataArrays();
    filteredCharges = [...charges];
    filteredPayments = [...payments];
    updateStatistics();
    renderChargesTable();
    renderPaymentsTable();
    closeModal('paymentModal');
    
    showAlert(`Payment of ${formatCurrency(paymentData.amount)} recorded successfully!`, 'success');
    currentPaymentCharge = null;
}

// View charge details function
function viewChargeDetails(chargeId) {
    const charge = findChargeById(chargeId);
    const lease = findLeaseByChargeId(chargeId);
    
    if (!charge || !lease) {
        showAlert('Charge not found', 'error');
        return;
    }
    
    currentViewingCharge = charge;
    
    // Fill charge details
    document.getElementById('viewChargeTenant').textContent = lease.tenant;
    document.getElementById('viewChargeUnit').textContent = lease.unit;
    document.getElementById('viewChargeType').textContent = capitalizeFirst(charge.type);
    document.getElementById('viewChargeDescription').textContent = charge.description;
    document.getElementById('viewChargeAmount').textContent = formatCurrency(charge.amount);
    document.getElementById('viewChargeDueDate').textContent = formatDate(charge.dueDate);
    document.getElementById('viewChargeCreatedDate').textContent = formatDate(charge.createdDate);
    document.getElementById('viewChargeStatus').innerHTML = getStatusDisplay(charge);
    document.getElementById('viewChargeNotes').textContent = charge.notes || 'No additional notes';
    
    // Show payment history for this charge
    const relatedPayments = lease.paymentHistory?.filter(p => p.chargeId === charge.id) || [];
    const paymentHistoryDiv = document.getElementById('viewChargePaymentHistory');
    
    if (relatedPayments.length > 0) {
        paymentHistoryDiv.innerHTML = relatedPayments.map(payment => `
            <div class="payment-history-item">
                <div class="payment-info">
                    <strong>${formatCurrency(payment.amount)}</strong>
                    <span class="payment-method">${capitalizeFirst(payment.paymentMethod)}</span>
                </div>
                <div class="payment-details">
                    <div>Date: ${formatDate(payment.paymentDate)}</div>
                    <div>Reference: ${payment.reference}</div>
                </div>
            </div>
        `).join('');
    } else {
        paymentHistoryDiv.innerHTML = '<p class="no-payments">No payments recorded for this charge</p>';
    }
    
    createModalsAndDialogs();
    openModal('viewChargeModal');
}

// Fixed filter functions with correct element IDs
function filterCharges() {
    const searchTerm = document.getElementById('charges-search')?.value.toLowerCase() || '';
    const typeFilter = document.getElementById('charges-type')?.value || '';
    const statusFilter = document.getElementById('charges-status')?.value || '';
    const dateFilter = document.getElementById('charges-date')?.value || '';
    
    filteredCharges = charges.filter(charge => {
        const matchesSearch = !searchTerm || 
            charge.tenant.toLowerCase().includes(searchTerm) ||
            charge.unit.toLowerCase().includes(searchTerm) ||
            charge.description.toLowerCase().includes(searchTerm);
            
        const matchesType = !typeFilter || charge.type === typeFilter;
        const matchesStatus = !statusFilter || getChargeStatus(charge) === statusFilter;
        const matchesDate = !dateFilter || charge.dueDate.startsWith(dateFilter);
        
        return matchesSearch && matchesType && matchesStatus && matchesDate;
    });
    
    renderChargesTable();
}

function filterPayments() {
    const searchTerm = document.getElementById('payments-search')?.value.toLowerCase() || '';
    const methodFilter = document.getElementById('payments-method')?.value || '';
    const typeFilter = document.getElementById('payments-type')?.value || '';
    const dateFilter = document.getElementById('payments-date')?.value || '';
    
    filteredPayments = payments.filter(payment => {
        const matchesSearch = !searchTerm ||
            payment.tenant.toLowerCase().includes(searchTerm) ||
            payment.unit.toLowerCase().includes(searchTerm) ||
            payment.description.toLowerCase().includes(searchTerm) ||
            payment.reference.toLowerCase().includes(searchTerm);
            
        const matchesMethod = !methodFilter || payment.paymentMethod === methodFilter;
        const matchesType = !typeFilter || payment.type === typeFilter;
        const matchesDate = !dateFilter || payment.paymentDate.startsWith(dateFilter);
        
        return matchesSearch && matchesMethod && matchesType && matchesDate;
    });
    
    renderPaymentsTable();
}

// Add reset functions
function resetChargesFilters() {
    const searchEl = document.getElementById('charges-search');
    const typeEl = document.getElementById('charges-type');
    const statusEl = document.getElementById('charges-status');
    const dateEl = document.getElementById('charges-date');
    
    if (searchEl) searchEl.value = '';
    if (typeEl) typeEl.value = '';
    if (statusEl) statusEl.value = '';
    if (dateEl) dateEl.value = '';
    
    filteredCharges = [...charges];
    renderChargesTable();
}

function resetPaymentsFilters() {
    const searchEl = document.getElementById('payments-search');
    const methodEl = document.getElementById('payments-method');
    const typeEl = document.getElementById('payments-type');
    const dateEl = document.getElementById('payments-date');
    
    if (searchEl) searchEl.value = '';
    if (methodEl) methodEl.value = '';
    if (typeEl) typeEl.value = '';
    if (dateEl) dateEl.value = '';
    
    filteredPayments = [...payments];
    renderPaymentsTable();
}

// Add click handlers for statistics cards
function filterByType(type) {
    const typeEl = document.getElementById('charges-type');
    if (typeEl) {
        typeEl.value = type === 'charges' ? '' : type;
        filterCharges();
    }
}

function filterByStatus(status) {
    const statusEl = document.getElementById('charges-status');
    if (statusEl) {
        statusEl.value = status;
        filterCharges();
    }
}

// Render Functions
function renderChargesTable() {
    const tbody = document.getElementById('charges-tbody');
    if (!tbody) return;
    
    if (filteredCharges.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="empty-state">
                    <div class="empty-state">
                        <i class="fas fa-inbox"></i>
                        <h3>No charges found</h3>
                        <p>Try adjusting your filters or add a new charge</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = filteredCharges.map(charge => `
        <tr class="charge-row ${getChargeStatus(charge)}">
            <td>
                <div class="tenant-info">
                    <strong>${charge.tenant}</strong>
                </div>
            </td>
            <td>
                <div class="unit-info">
                    <strong>${charge.unit}</strong>
                </div>
            </td>
            <td>
                <span class="badge ${charge.type}">${capitalizeFirst(charge.type)}</span>
            </td>
            <td class="charge-description">${charge.description}</td>
            <td class="charge-amount">${formatCurrency(charge.amount)}</td>
            <td class="due-date">${formatDate(charge.dueDate)}</td>
            <td class="status-cell">${getStatusDisplay(charge)}</td>
            <td class="actions-cell">
                <div class="action-buttons">
                    <button onclick="viewChargeDetails(${charge.id})" class="btn btn-sm btn-info" title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button onclick="editCharge(${charge.id})" class="btn btn-sm btn-warning" title="Edit">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="recordPayment(${charge.id})" class="btn btn-sm btn-success" title="Record Payment">
                        <i class="fas fa-credit-card"></i>
                    </button>
                    <button onclick="removeCharge(${charge.id})" class="btn btn-sm btn-danger" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function renderPaymentsTable() {
    const tbody = document.getElementById('payments-tbody');
    if (!tbody) return;
    
    if (filteredPayments.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="empty-state">
                    <div class="empty-state">
                        <i class="fas fa-inbox"></i>
                        <h3>No payments found</h3>
                        <p>No payment history available</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = filteredPayments.map(payment => `
        <tr class="payment-row">
            <td>
                <div class="tenant-info">
                    <strong>${payment.tenant}</strong>
                </div>
            </td>
            <td>
                <div class="unit-info">
                    <strong>${payment.unit}</strong>
                </div>
            </td>
            <td class="payment-date">${formatDate(payment.paymentDate)}</td>
            <td class="payment-description">${payment.description}</td>
            <td class="payment-amount">${formatCurrency(payment.amount)}</td>
            <td>
                <span class="payment-method">${capitalizeFirst(payment.paymentMethod)}</span>
            </td>
            <td>
                <code class="reference-code">${payment.reference}</code>
            </td>
            <td class="actions-cell">
                <div class="action-buttons">
                    <button onclick="viewPaymentDetails('${payment.id}')" class="btn btn-sm btn-info" title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button onclick="generateReceipt('${payment.id}')" class="btn btn-sm btn-success" title="View Receipt">
                        <i class="fas fa-receipt"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Generate Receipt Function
function generateReceipt(paymentId) {
    const payment = findPaymentById(paymentId);
    const lease = findLeaseByPaymentId(paymentId);
    
    if (!payment || !lease) {
        showAlert('Payment not found', 'error');
        return;
    }
    
    // Create receipt window
    const receiptWindow = window.open('', '_blank', 'width=800,height=600');
    const receiptHTML = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Payment Receipt - ${payment.reference}</title>
            <style>
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 40px 20px;
                    background: #f8f9fa;
                }
                .receipt {
                    background: white;
                    padding: 40px;
                    border-radius: 12px;
                    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                }
                .receipt-header {
                    text-align: center;
                    border-bottom: 2px solid #3b82f6;
                    padding-bottom: 20px;
                    margin-bottom: 30px;
                }
                .receipt-title {
                    color: #3b82f6;
                    font-size: 28px;
                    font-weight: bold;
                    margin: 0;
                }
                .receipt-subtitle {
                    color: #6b7280;
                    font-size: 14px;
                    margin: 5px 0 0 0;
                }
                .receipt-details {
                    display: grid;
                    gap: 15px;
                    margin-bottom: 30px;
                }
                .detail-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 10px 0;
                    border-bottom: 1px solid #e5e7eb;
                }
                .detail-label {
                    font-weight: 600;
                    color: #374151;
                }
                .detail-value {
                    color: #1f2937;
                }
                .amount-highlight {
                    font-size: 24px;
                    font-weight: bold;
                    color: #10b981;
                }
                .receipt-footer {
                    text-align: center;
                    margin-top: 40px;
                    padding-top: 20px;
                    border-top: 2px solid #e5e7eb;
                    color: #6b7280;
                    font-size: 12px;
                }
                .print-button {
                    background: #3b82f6;
                    color: white;
                    padding: 12px 24px;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 14px;
                    margin-top: 20px;
                }
                @media print {
                    body { background: white; padding: 0; }
                    .receipt { box-shadow: none; }
                    .print-button { display: none; }
                }
            </style>
        </head>
        <body>
            <div class="receipt">
                <div class="receipt-header">
                    <h1 class="receipt-title">PAYMENT RECEIPT</h1>
                    <p class="receipt-subtitle">Official Receipt for Payment</p>
                </div>
                
                <div class="receipt-details">
                    <div class="detail-row">
                        <span class="detail-label">Receipt #:</span>
                        <span class="detail-value">${payment.reference}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Payment Date:</span>
                        <span class="detail-value">${formatDate(payment.paymentDate)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Tenant:</span>
                        <span class="detail-value">${lease.tenant}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Unit:</span>
                        <span class="detail-value">${lease.unit}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Description:</span>
                        <span class="detail-value">${payment.description}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Payment Method:</span>
                        <span class="detail-value">${capitalizeFirst(payment.paymentMethod)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Amount:</span>
                        <span class="detail-value amount-highlight">${formatCurrency(payment.amount)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Processed By:</span>
                        <span class="detail-value">${payment.processedBy || 'System'}</span>
                    </div>
                </div>
                
                <div class="receipt-footer">
                    <p>This is an official receipt generated on ${new Date().toLocaleDateString()}</p>
                    <button class="print-button" onclick="window.print()">Print Receipt</button>
                </div>
            </div>
        </body>
        </html>
    `;
    
    receiptWindow.document.write(receiptHTML);
    receiptWindow.document.close();
}

// Modal Functions
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        // Focus on first input field
        const firstInput = modal.querySelector('input, textarea, select');
        if (firstInput) {
            setTimeout(() => firstInput.focus(), 100);
        }
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
    
    // Reset global variables
    if (modalId === 'paymentModal') {
        currentPaymentCharge = null;
    }
    if (modalId === 'viewChargeModal') {
        currentViewingCharge = null;
    }
    if (modalId === 'editChargeModal') {
        currentEditingCharge = null;
    }
    if (modalId === 'deleteChargeModal') {
        chargeToDelete = null;
    }
}

// Navigation Functions
function showSection(sectionName) {
    // Since we don't have multiple sections in this layout, just ensure data is loaded
    syncDataArrays();
    filteredCharges = [...charges];
    filteredPayments = [...payments];
    updateStatistics();
    renderChargesTable();
    renderPaymentsTable();
}

// Create Modals and Dialogs
function createModalsAndDialogs() {
    // Check if modals already exist
    if (document.getElementById('paymentModal')) return;

    injectEnhancedButtonStyles();

    const modalsHTML = `
        <!-- Payment Modal -->
        <div id="paymentModal" class="modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Record Payment</h3>
                    <span class="close" onclick="closeModal('paymentModal')">&times;</span>
                </div>
                <div class="modal-body">
                    <form id="paymentForm" onsubmit="handlePaymentSubmission(event)">
                        <input type="hidden" id="paymentChargeId" name="chargeId">
                        
                        <div class="form-group">
                            <label for="paymentAmount">Amount</label>
                            <input type="number" id="paymentAmount" name="amount" step="0.01" min="0" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="paymentMethod">Payment Method</label>
                            <select id="paymentMethod" name="method" required>
                                <option value="">Select method...</option>
                                <option value="cash">Cash</option>
                                <option value="gcash">GCash</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="paymentReference">Reference Number</label>
                            <input type="text" id="paymentReference" name="reference" placeholder="Leave blank for auto-generation">
                        </div>
                        
                        <div class="form-group">
                            <label for="paymentDate">Payment Date</label>
                            <input type="date" id="paymentDate" name="date" required>
                        </div>
                        
                        <div class="modal-actions">
                            <button type="button" class="btn-secondary" onclick="closeModal('paymentModal')">Cancel</button>
                            <button type="submit" class="btn-primary">Record Payment</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>

        <!-- Add Charge Modal -->
        <div id="addChargeModal" class="modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Add New Charge</h3>
                    <span class="close" onclick="closeModal('addChargeModal')">&times;</span>
                </div>
                <div class="modal-body">
                    <form id="addChargeForm" onsubmit="handleAddChargeSubmission(event)">
                        <div class="form-row">
                            <div class="form-group">
                                <label for="addChargeTenant">Tenant Name</label>
                                <input type="text" id="addChargeTenant" name="tenant" required>
                            </div>
                            
                            <div class="form-group">
                                <label for="addChargeUnit">Unit</label>
                                <input type="text" id="addChargeUnit" name="unit" required>
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="addChargeType">Type</label>
                                <select id="addChargeType" name="type" required>
                                    <option value="">Select type...</option>
                                    <option value="rent">Rent</option>
                                    <option value="utility">Utility</option>
                                    <option value="maintenance">Maintenance</option>
                                    <option value="penalty">Penalty</option>
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label for="addChargeAmount">Amount</label>
                                <input type="number" id="addChargeAmount" name="amount" step="0.01" min="0" required>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="addChargeDescription">Description</label>
                            <input type="text" id="addChargeDescription" name="description" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="addChargeDueDate">Due Date</label>
                            <input type="date" id="addChargeDueDate" name="dueDate" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="addChargeNotes">Notes</label>
                            <textarea id="addChargeNotes" name="notes" rows="3" placeholder="Optional notes..."></textarea>
                        </div>
                        
                        <div class="modal-actions">
                            <button type="button" class="btn-secondary" onclick="closeModal('addChargeModal')">Cancel</button>
                            <button type="submit" class="btn-primary">Add Charge</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>

        <!-- Edit Charge Modal -->
        <div id="editChargeModal" class="modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Edit Charge</h3>
                    <span class="close" onclick="closeModal('editChargeModal')">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="tenant-context">
                        <strong id="editChargeTenantInfo"></strong>
                    </div>
                    <form id="editChargeForm" onsubmit="handleEditChargeSubmission(event)">
                        <input type="hidden" id="editChargeId" name="chargeId">
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="editChargeType">Type</label>
                                <select id="editChargeType" name="type" required>
                                    <option value="rent">Rent</option>
                                    <option value="utility">Utility</option>
                                    <option value="maintenance">Maintenance</option>
                                    <option value="penalty">Penalty</option>
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label for="editChargeAmount">Amount</label>
                                <input type="number" id="editChargeAmount" name="amount" step="0.01" min="0" required>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="editChargeDescription">Description</label>
                            <input type="text" id="editChargeDescription" name="description" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="editChargeDueDate">Due Date</label>
                            <input type="date" id="editChargeDueDate" name="dueDate" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="editChargeNotes">Notes</label>
                            <textarea id="editChargeNotes" name="notes" rows="3"></textarea>
                        </div>
                        
                        <div class="modal-actions">
                            <button type="button" class="btn-secondary" onclick="closeModal('editChargeModal')">Cancel</button>
                            <button type="submit" class="btn-primary">Update Charge</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>

        <!-- View Charge Modal -->
        <div id="viewChargeModal" class="modal">
            <div class="modal-content modal-large">
                <div class="modal-header">
                    <h3>Charge Details</h3>
                    <span class="close" onclick="closeModal('viewChargeModal')">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="charge-details-grid">
                        <div class="detail-item">
                            <label>Tenant:</label>
                            <span id="viewChargeTenant"></span>
                        </div>
                        <div class="detail-item">
                            <label>Unit:</label>
                            <span id="viewChargeUnit"></span>
                        </div>
                        <div class="detail-item">
                            <label>Type:</label>
                            <span id="viewChargeType"></span>
                        </div>
                        <div class="detail-item">
                            <label>Amount:</label>
                            <span id="viewChargeAmount"></span>
                        </div>
                        <div class="detail-item">
                            <label>Due Date:</label>
                            <span id="viewChargeDueDate"></span>
                        </div>
                        <div class="detail-item">
                            <label>Created:</label>
                            <span id="viewChargeCreatedDate"></span>
                        </div>
                        <div class="detail-item">
                            <label>Status:</label>
                            <span id="viewChargeStatus"></span>
                        </div>
                        <div class="detail-item full-width">
                            <label>Description:</label>
                            <span id="viewChargeDescription"></span>
                        </div>
                        <div class="detail-item full-width">
                            <label>Notes:</label>
                            <span id="viewChargeNotes"></span>
                        </div>
                    </div>
                    
                    <div class="payment-history-section">
                        <h4>Payment History</h4>
                        <div id="viewChargePaymentHistory"></div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Delete Charge Modal -->
        <div id="deleteChargeModal" class="modal">
            <div class="modal-content modal-small">
                <div class="modal-header">
                    <h3>Delete Charge</h3>
                    <span class="close" onclick="closeModal('deleteChargeModal')">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="warning-message">
                        <i class="fas fa-exclamation-triangle"></i>
                        <p>Are you sure you want to delete this charge? This action cannot be undone.</p>
                    </div>
                    
                    <div class="charge-summary">
                        <div class="summary-item">
                            <label>Tenant:</label>
                            <span id="deleteChargeTenant"></span>
                        </div>
                        <div class="summary-item">
                            <label>Unit:</label>
                            <span id="deleteChargeUnit"></span>
                        </div>
                        <div class="summary-item">
                            <label>Description:</label>
                            <span id="deleteChargeDescription"></span>
                        </div>
                        <div class="summary-item">
                            <label>Amount:</label>
                            <span id="deleteChargeAmount"></span>
                        </div>
                        <div class="summary-item">
                            <label>Due Date:</label>
                            <span id="deleteChargeDueDate"></span>
                        </div>
                    </div>
                    
                    <div class="modal-actions">
                        <button type="button" class="btn-secondary" onclick="closeModal('deleteChargeModal')">Cancel</button>
                        <button type="button" class="btn-danger" onclick="confirmDeleteCharge()">Delete Charge</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalsHTML);
}

// Event Listeners and Initialization
function initializeEventListeners() {
    // Close modal when clicking outside
    window.onclick = function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    };
    
    // Keyboard shortcuts
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            // Close any open modal
            const openModals = document.querySelectorAll('.modal[style*="flex"]');
            openModals.forEach(modal => {
                modal.style.display = 'none';
            });
            document.body.style.overflow = 'auto';
        }
    });
    
    // Auto-generate reference number when payment method changes
    document.addEventListener('change', function(event) {
        if (event.target.id === 'paymentMethod') {
            const referenceField = document.getElementById('paymentReference');
            if (referenceField && !referenceField.value) {
                referenceField.placeholder = `Auto-generate ${event.target.value.toUpperCase()} reference`;
            }
        }
    });
}

// View Payment Details Function
// Enhanced View Payment Details Function
function viewPaymentDetails(paymentId) {
    const payment = findPaymentById(paymentId);
    const lease = findLeaseByPaymentId(paymentId);
    
    if (!payment || !lease) {
        showAlert('Payment not found', 'error');
        return;
    }
    
    // Find the related charge
    const relatedCharge = findChargeById(payment.chargeId);
    
    // Create and show payment details modal
    const modalHTML = `
        <div id="viewPaymentModal" class="modal" style="display: flex;">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Payment Details</h3>
                    <span class="close" onclick="closeModal('viewPaymentModal')">&times;</span>
                </div>
                <div class="modal-body">
                    <div class="payment-details-grid">
                        <div class="detail-item">
                            <label>Payment ID:</label>
                            <span>${payment.id}</span>
                        </div>
                        <div class="detail-item">
                            <label>Tenant:</label>
                            <span>${lease.tenant}</span>
                        </div>
                        <div class="detail-item">
                            <label>Unit:</label>
                            <span>${lease.unit}</span>
                        </div>
                        <div class="detail-item">
                            <label>Type:</label>
                            <span>${capitalizeFirst(payment.type)}</span>
                        </div>
                        <div class="detail-item">
                            <label>Amount:</label>
                            <span class="amount-highlight">${formatCurrency(payment.amount)}</span>
                        </div>
                        <div class="detail-item">
                            <label>Payment Date:</label>
                            <span>${formatDate(payment.paymentDate)}</span>
                        </div>
                        <div class="detail-item">
                            <label>Method:</label>
                            <span>${capitalizeFirst(payment.paymentMethod)}</span>
                        </div>
                        <div class="detail-item">
                            <label>Reference:</label>
                            <span>${payment.reference}</span>
                        </div>
                        <div class="detail-item">
                            <label>Processed By:</label>
                            <span>${payment.processedBy || 'System'}</span>
                        </div>
                        <div class="detail-item full-width">
                            <label>Description:</label>
                            <span>${payment.description}</span>
                        </div>
                        <div class="detail-item full-width">
                            <label>Notes:</label>
                            <span>${payment.notes || 'No additional notes'}</span>
                        </div>
                    </div>
                    
                    ${relatedCharge ? `
                        <div class="charge-info-section">
                            <h4>Related Charge Information</h4>
                            <div class="charge-info-item">
                                <label>Original Due Date:</label>
                                <span>${formatDate(relatedCharge.dueDate)}</span>
                            </div>
                            <div class="charge-info-item">
                                <label>Charge Status:</label>
                                <span>Paid</span>
                            </div>
                        </div>
                    ` : ''}
                    
                    <div class="modal-actions">
                        <button type="button" class="btn-secondary" onclick="closeModal('viewPaymentModal')">Close</button>
                        <button type="button" class="btn-success" onclick="generateReceipt('${payment.id}')">
                            <i class="fas fa-receipt"></i> View Receipt
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Remove existing modal if any
    const existingModal = document.getElementById('viewPaymentModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Add new modal to body
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// Additional CSS styles for modals
function injectPaymentModalStyles() {
    if (document.getElementById('payment-modal-styles')) return;
    
    const styleSheet = document.createElement('style');
    styleSheet.id = 'payment-modal-styles';
    styleSheet.textContent = `
        .modal {
            display: none;
            position: fixed;
            z-index: 9999;
            left: 0;
            top: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(5px);
            justify-content: center;
            align-items: center;
        }

        .modal-content {
            background: white;
            padding: 32px;
            border-radius: 16px;
            width: 90%;
            max-width: 600px;
            max-height: 80vh;
            overflow-y: auto;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }

        .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 24px;
            padding-bottom: 16px;
            border-bottom: 2px solid #f1f5f9;
        }

        .modal-title {
            font-size: 24px;
            font-weight: 700;
            color: #1f2937;
        }

        .close {
            color: #6b7280;
            font-size: 28px;
            font-weight: bold;
            cursor: pointer;
            line-height: 1;
        }

        .close:hover {
            color: #374151;
        }

        .form-group {
            margin-bottom: 20px;
        }

        .form-group label {
            display: block;
            margin-bottom: 8px;
            font-weight: 600;
            color: #374151;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
            width: 100%;
            padding: 12px 16px;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            font-size: 14px;
            transition: all 0.3s ease;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
            outline: none;
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .form-group textarea {
            resize: vertical;
            min-height: 100px;
        }

        .form-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
        }

        .form-row .form-group {
            margin-bottom: 16px;
        }

        @media (max-width: 768px) {
            .form-row {
                grid-template-columns: 1fr;
                gap: 0;
            }
        }

        .detail-item {
            display: flex;
            flex-direction: column;
            gap: 5px;
        }

        .detail-item.full-width {
            grid-column: 1 / -1;
        }

        .detail-item label {
            font-size: 12px;
            font-weight: 600;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .detail-item span {
            font-size: 14px;
            font-weight: 500;
            color: #374151;
            padding: 8px 12px;
            background: #f9fafb;
            border-radius: 6px;
            border: 1px solid #e5e7eb;
        }

        .tenant-context {
            background: #f3f4f6;
            padding: 12px;
            border-radius: 6px;
            margin-bottom: 20px;
            font-weight: 600;
            color: #374151;
        }

        .charge-details-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin-bottom: 25px;
        }

        @media (max-width: 768px) {
            .charge-details-grid {
                grid-template-columns: 1fr;
            }
        }

        .payment-history-section {
            margin-top: 25px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
        }

        .payment-history-section h4 {
            margin: 0 0 15px 0;
            color: #374151;
            font-size: 16px;
        }

        .payment-history-item {
            background: #f9fafb;
            padding: 12px;
            border-radius: 6px;
            margin-bottom: 8px;
            border-left: 3px solid #10b981;
        }

        .payment-info {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 4px;
        }

        .payment-details {
            font-size: 12px;
            color: #6b7280;
            display: flex;
            gap: 15px;
        }

        .no-payments {
            color: #6b7280;
            font-style: italic;
            text-align: center;
            padding: 20px;
        }

        .warning-message {
            background: #fef3c7;
            border: 1px solid #fbbf24;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 20px;
            display: flex;
            align-items: flex-start;
            gap: 10px;
        }

        .warning-message i {
            color: #f59e0b;
            margin-top: 2px;
        }

        .warning-message p {
            margin: 0;
            color: #92400e;
        }

        .charge-summary {
            background: #f9fafb;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }

        .summary-item {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #e5e7eb;
        }

        .summary-item:last-child {
            border-bottom: none;
        }

        .summary-item label {
            font-weight: 600;
            color: #374151;
        }

        /* Alert notifications */
        .alert-notification {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            padding: 12px 16px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            font-size: 14px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
            animation: slideInRight 0.3s ease;
            max-width: calc(100vw - 40px);
            display: flex;
            align-items: center;
            gap: 8px;
        }

        @keyframes slideInRight {
            from { opacity: 0; transform: translateX(100px); }
            to { opacity: 1; transform: translateX(0); }
        }

        @keyframes slideOutRight {
            from { opacity: 1; transform: translateX(0); }
            to { opacity: 0; transform: translateX(100px); }
        }
    `;
    
    document.head.appendChild(styleSheet);
}

// Export functions for global usage
window.showSection = showSection;
window.addNewCharge = addNewCharge;
window.editCharge = editCharge;
window.removeCharge = removeCharge;
window.recordPayment = recordPayment;
window.viewChargeDetails = viewChargeDetails;
window.filterCharges = filterCharges;
window.filterPayments = filterPayments;
window.resetChargesFilters = resetChargesFilters;
window.resetPaymentsFilters = resetPaymentsFilters;
window.filterByType = filterByType;
window.filterByStatus = filterByStatus;
window.closeModal = closeModal;
window.openModal = openModal;
window.handlePaymentSubmission = handlePaymentSubmission;
window.handleAddChargeSubmission = handleAddChargeSubmission;
window.handleEditChargeSubmission = handleEditChargeSubmission;
window.confirmDeleteCharge = confirmDeleteCharge;
window.viewPaymentDetails = viewPaymentDetails;
window.generateReceipt = generateReceipt;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing Payment Management System...');
    
    // Inject styles
    injectEnhancedButtonStyles();
    injectPaymentModalStyles();
    
    // Create modals
    createModalsAndDialogs();
    
    // Initialize data arrays
    syncDataArrays();
    
    // Set initial filtered arrays
    filteredCharges = [...charges];
    filteredPayments = [...payments];
    
    // Update statistics
    updateStatistics();
    
    // Render tables
    renderChargesTable();
    renderPaymentsTable();
    
    // Initialize event listeners
    initializeEventListeners();
    
    console.log('Payment Management System initialized successfully');
    console.log('Charges:', charges.length, 'Payments:', payments.length);
});