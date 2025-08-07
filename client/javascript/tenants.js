        const tenants = [
            { id: 1, name: 'Kei Lebron', phone: '(+63) 906 5959', unit: 'Unit 1, 101' },
            { id: 2, name: 'Joshua Deputo', phone: '', unit: 'Unit 1, 102' },
            { id: 3, name: 'Jerson Matuguina', phone: '(+63) 999 4 543', unit: 'Unit 2, 101' },
            { id: 4, name: 'Analiza Buena', phone: '(+63) 929 4 9503', unit: 'Unit 2, 102' }
        ];

        let selectedTenants = new Set([1]);
        let currentView = 'grid';

        function toggleView(viewType) {
            const buttons = document.querySelectorAll('.view-btn');
            const gridView = document.getElementById('gridView');
            const listView = document.getElementById('listView');
            
            buttons.forEach(btn => btn.classList.remove('active'));
            document.querySelector(`[data-view="${viewType}"]`).classList.add('active');
            
            if (viewType === 'list') {
                gridView.style.display = 'none';
                listView.style.display = 'flex';
                currentView = 'list';
            } else {
                gridView.style.display = 'grid';
                listView.style.display = 'none';
                currentView = 'grid';
            }
        }

        function setupEventListeners() {
            // Grid view listeners
            const tenantCards = document.querySelectorAll('.tenant-card');
            const checkboxes = document.querySelectorAll('.tenant-card .checkbox');

            tenantCards.forEach((card) => {
                card.addEventListener('click', function(e) {
                    if (e.target.type === 'checkbox') return;
                    
                    const checkbox = card.querySelector('.checkbox');
                    const tenantId = parseInt(card.dataset.tenant);
                    
                    if (selectedTenants.has(tenantId)) {
                        selectedTenants.delete(tenantId);
                        card.classList.remove('selected');
                        checkbox.checked = false;
                    } else {
                        selectedTenants.add(tenantId);
                        card.classList.add('selected');
                        checkbox.checked = true;
                    }
                    
                    syncListView(tenantId);
                    updateSelectAllButton();
                });
            });

            checkboxes.forEach((checkbox) => {
                checkbox.addEventListener('change', function() {
                    const card = checkbox.closest('.tenant-card');
                    const tenantId = parseInt(card.dataset.tenant);
                    
                    if (checkbox.checked) {
                        selectedTenants.add(tenantId);
                        card.classList.add('selected');
                    } else {
                        selectedTenants.delete(tenantId);
                        card.classList.remove('selected');
                    }
                    
                    syncListView(tenantId);
                    updateSelectAllButton();
                });
            });

            // List view listeners
            const listItems = document.querySelectorAll('.tenant-list-item');
            const listCheckboxes = document.querySelectorAll('.tenant-list-item .list-checkbox');

            listItems.forEach((item) => {
                item.addEventListener('click', function(e) {
                    if (e.target.type === 'checkbox') return;
                    
                    const checkbox = item.querySelector('.list-checkbox');
                    const tenantId = parseInt(item.dataset.tenant);
                    
                    if (selectedTenants.has(tenantId)) {
                        selectedTenants.delete(tenantId);
                        item.classList.remove('selected');
                        checkbox.checked = false;
                    } else {
                        selectedTenants.add(tenantId);
                        item.classList.add('selected');
                        checkbox.checked = true;
                    }
                    
                    syncGridView(tenantId);
                    updateSelectAllButton();
                });
            });

            listCheckboxes.forEach((checkbox) => {
                checkbox.addEventListener('change', function() {
                    const item = checkbox.closest('.tenant-list-item');
                    const tenantId = parseInt(item.dataset.tenant);
                    
                    if (checkbox.checked) {
                        selectedTenants.add(tenantId);
                        item.classList.add('selected');
                    } else {
                        selectedTenants.delete(tenantId);
                        item.classList.remove('selected');
                    }
                    
                    syncGridView(tenantId);
                    updateSelectAllButton();
                });
            });
        }

        function syncListView(tenantId) {
            const listItem = document.querySelector(`.tenant-list-item[data-tenant="${tenantId}"]`);
            const listCheckbox = listItem.querySelector('.list-checkbox');
            
            if (selectedTenants.has(tenantId)) {
                listItem.classList.add('selected');
                listCheckbox.checked = true;
            } else {
                listItem.classList.remove('selected');
                listCheckbox.checked = false;
            }
        }

        function syncGridView(tenantId) {
            const gridCard = document.querySelector(`.tenant-card[data-tenant="${tenantId}"]`);
            const gridCheckbox = gridCard.querySelector('.checkbox');
            
            if (selectedTenants.has(tenantId)) {
                gridCard.classList.add('selected');
                gridCheckbox.checked = true;
            } else {
                gridCard.classList.remove('selected');
                gridCheckbox.checked = false;
            }
        }

        function updateSelectAllButton() {
            const selectAllCheckbox = document.getElementById('selectAllCheckbox');
            const totalTenants = tenants.length;
            
            if (selectedTenants.size === totalTenants) {
                selectAllCheckbox.checked = true;
                selectAllCheckbox.indeterminate = false;
            } else if (selectedTenants.size > 0) {
                selectAllCheckbox.checked = false;
                selectAllCheckbox.indeterminate = true;
            } else {
                selectAllCheckbox.checked = false;
                selectAllCheckbox.indeterminate = false;
            }
        }

        function createAccount() {
            alert('Create Account functionality would be implemented here');
        }

        function selectAll() {
            const selectAllCheckbox = document.getElementById('selectAllCheckbox');
            const allCards = document.querySelectorAll('.tenant-card');
            const allItems = document.querySelectorAll('.tenant-list-item');
            const allGridCheckboxes = document.querySelectorAll('.tenant-card .checkbox');
            const allListCheckboxes = document.querySelectorAll('.tenant-list-item .list-checkbox');
            
            if (selectAllCheckbox.checked || selectedTenants.size === tenants.length) {
                // Deselect all
                selectedTenants.clear();
                allCards.forEach(card => card.classList.remove('selected'));
                allItems.forEach(item => item.classList.remove('selected'));
                allGridCheckboxes.forEach(checkbox => checkbox.checked = false);
                allListCheckboxes.forEach(checkbox => checkbox.checked = false);
                selectAllCheckbox.checked = false;
            } else {
                // Select all
                selectedTenants.clear();
                tenants.forEach(tenant => selectedTenants.add(tenant.id));
                allCards.forEach(card => card.classList.add('selected'));
                allItems.forEach(item => item.classList.add('selected'));
                allGridCheckboxes.forEach(checkbox => checkbox.checked = true);
                allListCheckboxes.forEach(checkbox => checkbox.checked = true);
                selectAllCheckbox.checked = true;
            }
            selectAllCheckbox.indeterminate = false;
        }

        // Initialize
        document.addEventListener('DOMContentLoaded', function() {
            setupEventListeners();
            updateSelectAllButton();
        });

                let currentStep = 1;

        function openCreateAccountModal() {
            document.getElementById('createAccountModal').classList.add('active');
            document.body.style.overflow = 'hidden';
            resetModal();
        }

        function closeCreateAccountModal() {
            document.getElementById('createAccountModal').classList.remove('active');
            document.body.style.overflow = 'auto';
            resetModal();
        }

        function resetModal() {
            currentStep = 1;
            updateStepDisplay();
            document.getElementById('createAccountForm').reset();
            
            // Reset profile picture preview
            const profilePreview = document.querySelector('.profile-preview');
            profilePreview.innerHTML = '<div class="profile-preview-icon">👤+</div>';
        }

        function updateStepDisplay() {
            // Update step indicators
            for (let i = 1; i <= 3; i++) {
                const step = document.getElementById(`step${i}`);
                const connector = document.getElementById(`connector${i}`);
                const formStep = document.getElementById(`formStep${i}`);
                
                if (i < currentStep) {
                    step.className = 'step completed';
                    if (connector) connector.className = 'step-connector completed';
                } else if (i === currentStep) {
                    step.className = 'step active';
                    if (connector) connector.className = 'step-connector';
                } else {
                    step.className = 'step inactive';
                    if (connector) connector.className = 'step-connector';
                }
                
                // Show/hide form steps
                if (i === currentStep) {
                    formStep.classList.add('active');
                } else {
                    formStep.classList.remove('active');
                }
            }
            
            // Update buttons
            const prevBtn = document.getElementById('prevBtn');
            const nextBtn = document.getElementById('nextBtn');
            const confirmBtn = document.getElementById('confirmBtn');
            
            prevBtn.style.display = currentStep === 1 ? 'none' : 'block';
            
            if (currentStep === 3) {
                nextBtn.style.display = 'none';
                confirmBtn.style.display = 'block';
            } else {
                nextBtn.style.display = 'block';
                confirmBtn.style.display = 'none';
            }
        }

        function nextStep() {
            if (validateCurrentStep() && currentStep < 3) {
                currentStep++;
                updateStepDisplay();
            }
        }

        function previousStep() {
            if (currentStep > 1) {
                currentStep--;
                updateStepDisplay();
            }
        }

        function validateCurrentStep() {
            const currentFormStep = document.getElementById(`formStep${currentStep}`);
            const requiredFields = currentFormStep.querySelectorAll('input[required]');
            
            for (let field of requiredFields) {
                if (!field.value.trim()) {
                    field.focus();
                    field.style.borderColor = '#dc3545';
                    setTimeout(() => {
                        field.style.borderColor = '#e1e8ed';
                    }, 3000);
                    return false;
                }
            }

            // Additional validation for step 3 (password confirmation)
            if (currentStep === 3) {
                const password = document.getElementById('defaultPassword').value;
                const confirmPassword = document.getElementById('confirmPassword').value;
                const agreeTerms = document.getElementById('agreeTerms').checked;
                
                if (password !== confirmPassword) {
                    alert('Passwords do not match!');
                    document.getElementById('confirmPassword').focus();
                    return false;
                }
                
                if (!agreeTerms) {
                    alert('Please agree to the terms and privacy policies');
                    return false;
                }
            }
            
            return true;
        }

        function confirmAccount() {
            if (validateCurrentStep()) {
                // Collect form data
                const formData = new FormData(document.getElementById('createAccountForm'));
                const accountData = {};
                
                for (let [key, value] of formData.entries()) {
                    accountData[key] = value;
                }
                
                // Show success message
                alert('Tenant account created successfully!');
                console.log('New tenant data:', accountData);
                
                // Close modal
                closeCreateAccountModal();
                
            }
        }

        function togglePassword(fieldId) {
            const field = document.getElementById(fieldId);
            const toggle = field.nextElementSibling;
            
            if (field.type === 'password') {
                field.type = 'text';
                toggle.textContent = '🙈';
            } else {
                field.type = 'password';
                toggle.textContent = '👁️';
            }
        }

        // Handle file uploads
        document.getElementById('documentUpload').addEventListener('change', function(e) {
            const files = e.target.files;
            const uploadArea = e.target.parentElement;
            
            if (files.length > 0) {
                uploadArea.querySelector('.upload-text').innerHTML = 
                    `<strong>${files.length} file(s) selected</strong><br>
                     ${Array.from(files).map(f => f.name).join(', ')}`;
            }
        });

        document.getElementById('profileUpload').addEventListener('change', function(e) {
            const file = e.target.files[0];
            const preview = document.querySelector('.profile-preview');
            
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    preview.innerHTML = `<img src="${e.target.result}" alt="Profile Preview">`;
                };
                reader.readAsDataURL(file);
            }
        });

        // Close modal when clicking outside
        document.getElementById('createAccountModal').addEventListener('click', function(e) {
            if (e.target === this) {
                closeCreateAccountModal();
            }
        });

        // Handle keyboard navigation
        document.addEventListener('keydown', function(e) {
            const modal = document.getElementById('createAccountModal');
            if (modal.classList.contains('active')) {
                if (e.key === 'Escape') {
                    closeCreateAccountModal();
                }
            }
        });

        // Form validation helpers
        function validateEmail(email) {
            const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return re.test(email);
        }

        function formatPhoneNumber(input) {
            // Auto-format phone number as user types
            input.addEventListener('input', function(e) {
                let value = e.target.value.replace(/\D/g, '');
                if (value.startsWith('63')) {
                    value = '+' + value;
                } else if (!value.startsWith('+63')) {
                    value = '+63' + value;
                }
                e.target.value = value;
            });
        }

        // Initialize phone number formatting
        document.addEventListener('DOMContentLoaded', function() {
            const phoneInputs = document.querySelectorAll('input[type="tel"]');
            phoneInputs.forEach(formatPhoneNumber);
        });

        // Auto-save form data to prevent loss (using sessionStorage since localStorage is not available)
        function autoSaveFormData() {
            const formData = new FormData(document.getElementById('createAccountForm'));
            const data = {};
            for (let [key, value] of formData.entries()) {
                if (typeof value === 'string') {
                    data[key] = value;
                }
            }
            try {
                sessionStorage.setItem('tenantFormData', JSON.stringify(data));
            } catch (e) {
                // Handle case where sessionStorage might not be available
                console.log('Could not save form data');
            }
        }

        function loadSavedFormData() {
            try {
                const savedData = sessionStorage.getItem('tenantFormData');
                if (savedData) {
                    const data = JSON.parse(savedData);
                    Object.keys(data).forEach(key => {
                        const field = document.querySelector(`[name="${key}"]`);
                        if (field && field.type !== 'file') {
                            field.value = data[key];
                        }
                    });
                }
            } catch (e) {
                console.log('Could not load saved form data');
            }
        }

        // Clear saved data when form is submitted
        function clearSavedFormData() {
            try {
                sessionStorage.removeItem('tenantFormData');
            } catch (e) {
                console.log('Could not clear saved form data');
            }
        }

        // Auto-save every 30 seconds
        setInterval(autoSaveFormData, 30000);

        // Load saved data when modal opens
        document.getElementById('createAccountModal').addEventListener('transitionend', function(e) {
            if (this.classList.contains('active')) {
                loadSavedFormData();
            }
        });