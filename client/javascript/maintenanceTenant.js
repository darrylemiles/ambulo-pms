        class TenantMaintenancePortal {
            constructor() {
                this.requests = this.loadRequests();
                this.history = this.loadHistory();
                this.filteredHistory = [...this.history];
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

                // History filters
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

            loadRequests() {
                // Sample data - in a real app this would come from a database
                return [
                    {
                        id: 'REQ-2024-001',
                        tenantName: 'John Smith',
                        unitNumber: '3B',
                        category: 'plumbing',
                        priority: 'high',
                        description: 'Kitchen sink is completely blocked and water is backing up into the dishwasher.',
                        status: 'progress',
                        submittedDate: '2024-08-20',
                        phone: '(555) 123-4567',
                        assignedTechnician: 'Mike Johnson',
                        estimatedCompletion: '2024-08-26'
                    },
                    {
                        id: 'REQ-2024-002',
                        tenantName: 'Sarah Davis',
                        unitNumber: '1A',
                        category: 'electrical',
                        priority: 'medium',
                        description: 'Living room outlet not working, tried resetting breaker.',
                        status: 'pending',
                        submittedDate: '2024-08-22',
                        phone: '(555) 987-6543'
                    }
                ];
            }

            loadHistory() {
                // Sample historical data
                return [
                    {
                        id: 'REQ-2024-050',
                        tenantName: 'Emily Johnson',
                        unitNumber: '2C',
                        category: 'hvac',
                        priority: 'low',
                        description: 'Air conditioning unit making unusual noise during operation.',
                        status: 'completed',
                        submittedDate: '2024-07-15',
                        completedDate: '2024-07-18',
                        phone: '(555) 456-7890',
                        assignedTechnician: 'David Wilson',
                        resolution: 'Cleaned and lubricated fan motor. Replaced worn belt. System now operating normally.',
                        cost: 125.00,
                        rating: 5
                    },
                    {
                        id: 'REQ-2024-049',
                        tenantName: 'Michael Brown',
                        unitNumber: '4A',
                        category: 'plumbing',
                        priority: 'high',
                        description: 'Bathroom toilet continuously running and won\'t stop filling.',
                        status: 'completed',
                        submittedDate: '2024-07-10',
                        completedDate: '2024-07-12',
                        phone: '(555) 234-5678',
                        assignedTechnician: 'Lisa Chen',
                        resolution: 'Replaced faulty flapper valve and adjusted chain length. Toilet now functioning properly.',
                        cost: 85.00,
                        rating: 4
                    },
                    {
                        id: 'REQ-2024-048',
                        tenantName: 'Jennifer Wilson',
                        unitNumber: '1B',
                        category: 'appliance',
                        priority: 'medium',
                        description: 'Refrigerator not cooling properly, freezer section working fine.',
                        status: 'completed',
                        submittedDate: '2024-06-28',
                        completedDate: '2024-07-02',
                        phone: '(555) 345-6789',
                        assignedTechnician: 'Robert Martinez',
                        resolution: 'Diagnosed faulty evaporator fan motor. Replaced motor and cleaned coils. Refrigerator cooling restored.',
                        cost: 275.00,
                        rating: 5
                    }
                ];
            }

            handleSubmit(e) {
                e.preventDefault();
                
                // Clear previous errors
                this.clearErrors();

                // Get form data
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
                        <div class="empty-state">
                            <div class="empty-state-icon">📋</div>
                            <p>No active requests at this time</p>
                        </div>
                    `;
                    return;
                }

                requestsList.innerHTML = this.requests.map(request => `
                    <div class="request-item">
                        <div class="request-header">
                            <div class="request-id">${request.id}</div>
                            <div class="status-badge status-${request.status}">
                                ${request.status === 'pending' ? 'Pending Review' : 
                                  request.status === 'progress' ? 'In Progress' : 
                                  'Completed'}
                            </div>
                        </div>
                        
                        <div class="request-details">
                            <div class="request-category">${this.getCategoryLabel(request.category)}</div>
                            <div class="request-description">${request.description}</div>
                        </div>
                        
                        <div class="request-meta">
                            <div class="request-meta-item">
                                <span><i class="fa-solid fa-calendar"></i></span>
                                <span>Submitted: ${this.formatDate(request.submittedDate)}</span>
                            </div>
                            <div class="priority-badge priority-${request.priority}">
                                ${request.priority.toUpperCase()} PRIORITY
                            </div>
                        </div>
                        
                        ${request.assignedTechnician ? `
                            <div class="request-meta">
                                <div class="request-meta-item">
                                    <span><i class="fa-solid fa-user"></i></span>
                                    <span>Assigned to: ${request.assignedTechnician}</span>
                                </div>
                                ${request.estimatedCompletion ? `
                                    <div class="request-meta-item">
                                        <span><i class="fa-solid fa-bullseye"></i></span>
                                        <span>Est. completion: ${this.formatDate(request.estimatedCompletion)}</span>
                                    </div>
                                ` : ''}
                            </div>
                        ` : ''}
                    </div>
                `).join('');
            }

            displayHistory() {
                const historyList = document.getElementById('historyList');
                if (!historyList) return;

                if (this.filteredHistory.length === 0) {
                    historyList.innerHTML = `
                        <div class="empty-state">
                            <div class="empty-state-icon">📚</div>
                            <p>No history records match your current filters</p>
                        </div>
                    `;
                    return;
                }

                historyList.innerHTML = this.filteredHistory.map(item => `
                    <div class="history-item ${item.status}">
                        <div class="history-header">
                            <div class="request-id">${item.id}</div>
                            <div class="history-dates">
                                <div>Submitted: ${this.formatDate(item.submittedDate)}</div>
                                <div>Completed: ${this.formatDate(item.completedDate)}</div>
                            </div>
                        </div>
                        
                        <div class="history-content">
                            <div class="history-category">${this.getCategoryLabel(item.category)}</div>
                            <div class="history-description">${item.description}</div>
                            
                            ${item.resolution ? `
                                <div class="resolution-text">
                                    <strong>Resolution:</strong> ${item.resolution}
                                </div>
                            ` : ''}
                        </div>
                        
                        <div class="history-footer">
                            <div class="footer-left">
                                <div class="technician-info"><i class="fa-solid fa-user"></i> ${item.assignedTechnician}</div>
                                ${item.cost ? `<div class="cost-info"><i class="fa-solid fa-dollar-sign"></i> Cost: ${item.cost.toFixed(2)}</div>` : ''}
                            </div>
                            <div class="footer-right">
                                <div class="priority-badge priority-${item.priority}">
                                    ${item.priority.toUpperCase()}
                                </div>
                                ${item.rating ? `
                                    <div class="rating-stars">
                                        ${'⭐'.repeat(item.rating)}
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                `).join('');
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