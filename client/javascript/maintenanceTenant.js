import formatDate from '../utils/formatDate.js';
    class TenantMaintenancePortal {
            constructor() {
                this.requests = [];
                this.history = [];
                this.filteredHistory = [];
                this.initLiveData();
            }

            async initLiveData() {
                let user = null;
                try {
                    user = JSON.parse(localStorage.getItem('user'));
                } catch (e) {}
                const userId = user && user.user_id ? user.user_id : null;
                if (!userId) {
                    this.requests = this.loadRequests();
                    this.history = this.loadHistory();
                    this.filteredHistory = [...this.history];
                    this.init();
                    return;
                }

                try {
                    const res = await fetch(`/api/v1/tickets/users/${userId}`);
                    const result = await res.json();
                    if (res.ok && result.tickets) {
                        this.requests = result.tickets.filter(t => t.ticket_status !== 'COMPLETED' && t.ticket_status !== 'CANCELLED');
                        this.history = result.tickets.filter(t => t.ticket_status === 'COMPLETED');
                        this.filteredHistory = [...this.history];
                    } else {
                        this.requests = this.loadRequests();
                        this.history = this.loadHistory();
                        this.filteredHistory = [...this.history];
                    }
                } catch (err) {
                    this.requests = this.loadRequests();
                    this.history = this.loadHistory();
                    this.filteredHistory = [...this.history];
                }
                this.init();
            }

            init() {
                this.bindEvents();
                this.displayOverview();
                this.displayRequests();
                this.displayHistory();
            }

            bindEvents() {
                const form = document.getElementById('maintenanceForm');
                if (form) {
                    form.addEventListener('submit', (e) => this.handleSubmit(e));
                }

                const fileInput = document.getElementById('photos');
                if (fileInput) {
                    fileInput.addEventListener('change', (e) => this.handleFileUpload(e));
                }

                const historySearch = document.getElementById('historySearch');
                const statusFilter = document.getElementById('statusFilter');
                const categoryFilter = document.getElementById('categoryFilter');
                const dateFrom = document.getElementById('dateFrom');
                const dateTo = document.getElementById('dateTo');

                if (historySearch) historySearch.addEventListener('input', () => this.filterHistory());
                if (statusFilter) statusFilter.addEventListener('change', () => this.filterHistory());
                if (categoryFilter) categoryFilter.addEventListener('change', () => this.filterHistory());
                if (dateFrom) dateFrom.addEventListener('change', () => this.filterHistory());
                if (dateTo) dateTo.addEventListener('change', () => this.filterHistory());
            }

            handleSubmit(e) {
                e.preventDefault();
                
                this.clearErrors();

                const formData = new FormData(e.target);
                const data = {
                    tenantName: formData.get('tenantName') || document.getElementById('tenantName').value,
                    unitNumber: formData.get('unitNumber') || document.getElementById('unitNumber').value,
                    contactPhone: formData.get('contactPhone') || document.getElementById('contactPhone').value,
                    category: formData.get('category') || document.getElementById('category').value,
                    priority: formData.get('priority') || document.querySelector('input[name="priority"]:checked')?.value,
                    description: formData.get('description') || document.getElementById('description').value
                };

                // Validate form
                if (!this.validateForm(data)) {
                    return;
                }

                // Generate request ID
                const requestId = `REQ-${new Date().getFullYear()}-${String(this.requests.length + 51).padStart(3, '0')}`;
                
                // Create new request
                const newRequest = {
                    id: requestId,
                    ...data,
                    status: 'pending',
                    submittedDate: new Date().toISOString().split('T')[0],
                    phone: data.contactPhone
                };

                // Add to requests array
                this.requests.unshift(newRequest);
                this.saveRequests();

                // Show success message
                this.showSuccessMessage(requestId);
                
                // Reset form
                e.target.reset();
                
                // Refresh displays
                this.displayOverview();
                this.displayRequests();
            }

            validateForm(data) {
                let isValid = true;

                // Validate required fields
                if (!data.tenantName?.trim()) {
                    this.showError('tenantNameError', 'Tenant name is required');
                    isValid = false;
                }

                if (!data.unitNumber?.trim()) {
                    this.showError('unitNumberError', 'Unit number is required');
                    isValid = false;
                }

                if (!data.contactPhone?.trim()) {
                    this.showError('contactPhoneError', 'Contact phone is required');
                    isValid = false;
                } else if (!/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/.test(data.contactPhone)) {
                    this.showError('contactPhoneError', 'Please enter a valid phone number');
                    isValid = false;
                }

                if (!data.category) {
                    this.showError('categoryError', 'Please select a service category');
                    isValid = false;
                }

                if (!data.priority) {
                    this.showError('priorityError', 'Please select a priority level');
                    isValid = false;
                }

                if (!data.description?.trim()) {
                    this.showError('descriptionError', 'Description is required');
                    isValid = false;
                } else if (data.description.trim().length < 10) {
                    this.showError('descriptionError', 'Please provide a more detailed description (minimum 10 characters)');
                    isValid = false;
                }

                return isValid;
            }

            showError(elementId, message) {
                const errorElement = document.getElementById(elementId);
                if (errorElement) {
                    errorElement.textContent = message;
                }
            }

            clearErrors() {
                const errorElements = document.querySelectorAll('.error-message');
                errorElements.forEach(el => el.textContent = '');
            }

            showSuccessMessage(requestId) {
                const successMessage = document.getElementById('successMessage');
                const requestIdSpan = document.getElementById('requestId');
                
                if (successMessage && requestIdSpan) {
                    requestIdSpan.textContent = requestId;
                    successMessage.style.display = 'block';
                    
                    // Hide after 10 seconds
                    setTimeout(() => {
                        successMessage.style.display = 'none';
                    }, 10000);

                    // Scroll to success message
                    successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }

            handleFileUpload(e) {
                const files = e.target.files;
                const label = e.target.nextElementSibling;
                
                if (files.length > 0) {
                    const fileText = files.length === 1 ? 
                        `📎 ${files[0].name}` : 
                        `📎 ${files.length} files selected`;
                    label.innerHTML = fileText;
                } else {
                    label.innerHTML = '<span><i class="fa-solid fa-paperclip"></i></span><span>Click to upload photos (optional)</span>';
                }
            }

            displayOverview() {
                const overviewGrid = document.getElementById('overviewGrid');
                if (!overviewGrid) return;

                const totalRequests = this.requests.length + this.history.length;
                const activeRequests = this.requests.filter(r => r.status !== 'completed' && r.status !== 'cancelled').length;
                const completedRequests = this.history.filter(r => r.status === 'completed').length;
                const avgRating = this.history.length > 0 ? 
                    (this.history.reduce((sum, r) => sum + (r.rating || 0), 0) / this.history.filter(r => r.rating).length).toFixed(1) : 
                    'N/A';

                overviewGrid.innerHTML = `
                    <div class="overview-card total">
                        <div class="overview-header">
                            <div class="overview-icon"></div>
                        </div>
                        <div class="overview-number">${totalRequests}</div>
                        <div class="overview-label">Total Requests</div>
                        <div class="overview-description">All-time maintenance requests submitted</div>
                    </div>
                    
                    <div class="overview-card active">
                        <div class="overview-header">
                            <div class="overview-icon"></div>
                        </div>
                        <div class="overview-number">${activeRequests}</div>
                        <div class="overview-label">Active Requests</div>
                        <div class="overview-description">Currently pending or in progress</div>
                    </div>
                    
                    <div class="overview-card completed">
                        <div class="overview-header">
                            <div class="overview-icon"></div>
                        </div>
                        <div class="overview-number">${completedRequests}</div>
                        <div class="overview-label">Completed</div>
                        <div class="overview-description">Successfully resolved requests</div>
                    </div>
                    
                    <div class="overview-card rating">
                        <div class="overview-header">
                            <div class="overview-icon"></div>
                        </div>
                        <div class="overview-number">${avgRating}</div>
                        <div class="overview-label">Avg Rating</div>
                        <div class="overview-description">Service satisfaction score</div>
                    </div>
                `;
            }

            displayRequests() {
                const requestsList = document.getElementById('requestsList');
                if (!requestsList) return;

                if (this.requests.length === 0) {
                    requestsList.innerHTML = `
                        <div class="empty-state" style="text-align:center;padding:2rem;">
                            <div class="empty-state-icon" style="font-size:3rem;color:#3b82f6;margin-bottom:0.5rem;">
                                <i class="fa-solid fa-clipboard-list"></i>
                            </div>
                            <p style="font-size:1.2rem;color:#555;">No active requests at this time</p>
                            <div style="margin-top:0.5rem;color:#888;font-size:1rem;">
                                <i class="fa-solid fa-circle-info"></i> You have no pending or in-progress maintenance requests.
                            </div>
                        </div>
                    `;
                    return;
                }

                requestsList.innerHTML = this.requests.map(request => {
                    const id = request.ticket_id || request.id || '';
                    const title = request.ticket_title || request.title || '';
                    const propertyName = request.property_name || request.propertyName || '';
                    const status = (request.ticket_status || request.status || '').toLowerCase();
                    const category = request.request_type || request.category || '';
                    const priority = request.priority || '';
                    const description = request.description || '';
                    const submittedDate = request.created_at || request.submittedDate || '';
                    const startTime = request.start_datetime || request.startTime || '';
                    const assignedTechnician = request.assigned_to || request.assignedTechnician || '';
                    const estimatedCompletion = request.end_datetime || request.estimatedCompletion || '';

                    return `
                        <div class="request-item active-request-item">
                            <div class="request-header">
                                <div class="request-id"><strong>Ticket ID:</strong> ${id}</div>
                                <div class="status-badge status-${status}">
                                    ${status === 'pending' ? 'Pending Review' :
                                      status === 'assigned' ? 'Assigned' :
                                      status === 'in_progress' ? 'In Progress' :
                                      status === 'completed' ? 'Completed' :
                                      status.charAt(0).toUpperCase() + status.slice(1)}
                                </div>
                            </div>
                            <div class="request-content">
                                ${title ? `<div class="ticket-title"><h3>${title}</h3></div>` : ''}
                                <div class="property-name"><i class='fa-solid fa-building'></i> ${propertyName ? propertyName : 'N/A'}</div>
                                <div class="request-category">${this.getCategoryLabel(category)}</div>
                                <div class="request-description">${description}</div>
                            </div>
                            <div class="request-meta">
                                <div class="request-meta-item">
                                    <span><i class="fa-solid fa-calendar"></i></span>
                                    <span>Submitted: ${this.formatDate(submittedDate)}</span>
                                </div>
                                <div class="request-meta-item">
                                    <span><i class="fa-solid fa-clock"></i></span>
                                    <span>Start Time: ${startTime ? formatDate(startTime, true) : 'Not scheduled'}</span>
                                </div>
                                <div class="priority-badge priority-${priority}">
                                    ${priority ? priority.toUpperCase() + ' PRIORITY' : ''}
                                </div>
                            </div>
                            ${assignedTechnician ? `
                                <div class="request-meta">
                                    <div class="request-meta-item">
                                        <span><i class="fa-solid fa-user"></i></span>
                                        <span>Assigned to: ${assignedTechnician}</span>
                                    </div>
                                    ${estimatedCompletion ? `
                                        <div class="request-meta-item">
                                            <span><i class="fa-solid fa-bullseye"></i></span>
                                            <span>Est. completion: ${formatDate(estimatedCompletion, true)}</span>
                                        </div>
                                    ` : ''}
                                </div>
                            ` : ''}
                        </div>
                    `;
                }).join('');
            }

            displayHistory() {
                const historyList = document.getElementById('historyList');
                if (!historyList) return;

                if (this.filteredHistory.length === 0) {
                    historyList.innerHTML = `
                        <div class="empty-state" style="text-align:center;padding:2rem;">
                            <div class="empty-state-icon" style="font-size:3rem;color:#059669;margin-bottom:0.5rem;">
                                <i class="fa-solid fa-book-open"></i>
                            </div>
                            <p style="font-size:1.2rem;color:#555;">No history records match your current filters</p>
                            <div style="margin-top:0.5rem;color:#888;font-size:1rem;">
                                <i class="fa-solid fa-circle-info"></i> Try adjusting your filters or check back later.
                            </div>
                        </div>
                    `;
                    return;
                }

                historyList.innerHTML = this.filteredHistory.map(item => {
                    const id = item.ticket_id || item.id || '';
                    const title = item.ticket_title || item.title || '';
                    const propertyName = item.property_name || item.propertyName || '';
                    const status = (item.ticket_status || item.status || '').toLowerCase();
                    const category = item.request_type || item.category || '';
                    const priority = item.priority || '';
                    const description = item.description || '';
                    const submittedDate = item.created_at || item.submittedDate || '';
                    const completedDate = item.end_datetime || item.completedDate || '';
                    const assignedTechnician = item.assigned_to || item.assignedTechnician || '';
                    const resolution = item.notes || item.resolution || '';
                    const cost = item.maintenance_cost || item.cost || '';
                    const rating = item.rating || '';

                    return `
                        <div class="history-item ${status}">
                            <div class="history-header">
                                <div class="request-id"><strong>Ticket ID:</strong> ${id}</div>
                                <div class="history-dates">
                                    <div>Submitted: ${formatDate(submittedDate, true)}</div>
                                    <div>Completed: ${formatDate(completedDate, true)}</div>
                                </div>
                            </div>
                            <div class="history-content">
                                ${title ? `<div class="ticket-title"><h3>${title}</h3></div>` : ''}
                                <div class="property-name"><i class='fa-solid fa-building'></i> ${propertyName ? propertyName : 'N/A'}</div>
                                <div class="history-category">${this.getCategoryLabel(category)}</div>
                                <div class="history-description">${description}</div>
                                ${resolution ? `
                                    <div class="resolution-text">
                                        <strong>Resolution:</strong> ${resolution}
                                    </div>
                                ` : ''}
                            </div>
                            <div class="history-footer">
                                <div class="footer-left">
                                    <div class="technician-info"><i class="fa-solid fa-user"></i> ${assignedTechnician}</div>
                                    ${cost ? `<div class="cost-info"><i class="fa-solid fa-dollar-sign"></i> Cost: ${parseFloat(cost).toFixed(2)}</div>` : ''}
                                </div>
                                <div class="footer-right">
                                    <div class="priority-badge priority-${priority}">
                                        ${priority ? priority.toUpperCase() : ''}
                                    </div>
                                    ${rating ? `
                                        <div class="rating-stars">
                                            ${'⭐'.repeat(rating)}
                                        </div>
                                    ` : ''}
                                </div>
                            </div>
                        </div>
                    `;
                }).join('');
            }

            filterHistory() {
                const searchTerm = document.getElementById('historySearch')?.value.toLowerCase() || '';
                const statusFilter = document.getElementById('statusFilter')?.value || '';
                const categoryFilter = document.getElementById('categoryFilter')?.value || '';
                const dateFrom = document.getElementById('dateFrom')?.value || '';
                const dateTo = document.getElementById('dateTo')?.value || '';

                this.filteredHistory = this.history.filter(item => {
                    // Text search
                    const matchesSearch = !searchTerm || 
                        item.id.toLowerCase().includes(searchTerm) ||
                        item.description.toLowerCase().includes(searchTerm) ||
                        item.category.toLowerCase().includes(searchTerm) ||
                        (item.resolution && item.resolution.toLowerCase().includes(searchTerm));

                    // Status filter
                    const matchesStatus = !statusFilter || item.status === statusFilter;

                    // Category filter
                    const matchesCategory = !categoryFilter || item.category === categoryFilter;

                    // Date range filter
                    let matchesDateRange = true;
                    if (dateFrom && item.completedDate) {
                        matchesDateRange = matchesDateRange && item.completedDate >= dateFrom;
                    }
                    if (dateTo && item.completedDate) {
                        matchesDateRange = matchesDateRange && item.completedDate <= dateTo;
                    }

                    return matchesSearch && matchesStatus && matchesCategory && matchesDateRange;
                });

                this.displayHistory();
            }

            getCategoryLabel(category) {
                const labels = {
                    'plumbing': 'Plumbing Services',
                    'electrical': 'Electrical Services',
                    'hvac': 'HVAC & Climate Control',
                    'appliance': 'Appliance Repair',
                    'structural': 'Structural & Building',
                    'security': 'Security Systems',
                    'other': 'Other Services'
                };
                return labels[category] || category;
            }

            formatDate(dateString) {
                if (!dateString) return '';
                const date = new Date(dateString);
                return date.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                });
            }

            saveRequests() {
                // In a real application, this would save to a database
                console.log('Saving requests:', this.requests);
            }
        }

        // Initialize the portal when the page loads
        document.addEventListener('DOMContentLoaded', () => {
            new TenantMaintenancePortal();
        });