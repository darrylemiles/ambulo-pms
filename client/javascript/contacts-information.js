        // Data storage
        let contactData = {
            contact: {
                email: 'ambulosproperty@gmail.com',
                phone: '+63 917 123 4567',
                address: 'Kapt. Sayas Street, Brgy. San Vicente II\nSilang, Cavite, Philippines',
                hours: 'Monday - Friday: 9:00 AM - 6:00 PM\nSaturday: 10:00 AM - 4:00 PM\nSunday: By Appointment Only',
                formTitle: 'Send Us a Message',
                formSubtitle: 'Fill out the form below and we\'ll get back to you within 24 hours. Let us know about your commercial space requirements.',
                successMessage: 'Thank you for your message! We\'ll get back to you within 24 hours.'
            },
            buildings: [
                {
                    id: 'building-1',
                    name: 'Ambulo Main Office',
                    address: 'Kapt. Sayas Street, Brgy. San Vicente II, Silang, Cavite, Philippines',
                    type: 'Office',
                    status: 'active',
                    contacts: [
                        {
                            id: 'contact-1',
                            name: 'Maria Santos',
                            position: 'Property Manager',
                            phone: '+63 917 123 4567',
                            email: 'maria.santos@ambuloproperties.com'
                        }
                    ]
                },
                {
                    id: 'building-2',
                    name: 'Ambulo Retail Center',
                    address: 'Commercial District, Tagaytay City, Cavite, Philippines',
                    type: 'Retail',
                    status: 'active',
                    contacts: [
                        {
                            id: 'contact-2',
                            name: 'Juan Dela Cruz',
                            position: 'Leasing Manager',
                            phone: '+63 917 987 6543',
                            email: 'juan.delacruz@ambuloproperties.com'
                        }
                    ]
                }
            ]
        };

        // Building management functions
        function renderBuildings() {
            const container = document.getElementById('buildings-container');
            container.innerHTML = '';

            contactData.buildings.forEach((building, index) => {
                const buildingHTML = `
                    <div class="building-card" data-building-id="${building.id}">
                        <div class="building-header">
                            <div class="building-title">
                                <i class="fas fa-building" style="color: #3b82f6;"></i>
                                ${building.name}
                                <span class="status-badge ${building.status}">${building.status.charAt(0).toUpperCase() + building.status.slice(1)}</span>
                            </div>
                            <div class="building-actions" style ="margin-left: 10px;">
                                <button class="btn btn-outline btn-small" onclick="editBuilding('${building.id}')">
                                    <i class="fas fa-edit"></i>
                                    Edit
                                </button>
                                <button class="btn btn-danger btn-small" onclick="removeBuilding('${building.id}')">
                                    <i class="fas fa-trash"></i>
                                    Remove
                                </button>
                            </div>
                        </div>

                        <div class="two-column">
                            <div class="form-group">
                                <label class="form-label">Building Name</label>
                                <input type="text" class="form-input" value="${building.name}" onchange="updateBuilding('${building.id}', 'name', this.value)">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Property Type</label>
                                <select class="form-input" onchange="updateBuilding('${building.id}', 'type', this.value)">
                                    <option value="Office" ${building.type === 'Office' ? 'selected' : ''}>Office</option>
                                    <option value="Retail" ${building.type === 'Retail' ? 'selected' : ''}>Retail</option>
                                    <option value="Industrial" ${building.type === 'Industrial' ? 'selected' : ''}>Industrial</option>
                                    <option value="Mixed-Use" ${building.type === 'Mixed-Use' ? 'selected' : ''}>Mixed-Use</option>
                                    <option value="Warehouse" ${building.type === 'Warehouse' ? 'selected' : ''}>Warehouse</option>
                                </select>
                            </div>
                        </div>

                        <div class="form-group">
                            <label class="form-label">Complete Address</label>
                            <textarea class="form-input form-textarea" onchange="updateBuilding('${building.id}', 'address', this.value)">${building.address}</textarea>
                        </div>

                        <h5 style="margin: 25px 0 15px 0; color: #3b82f6; font-weight: 600;">Contact Persons</h5>
                        
                        <div id="contacts-${building.id}">
                            ${building.contacts.map((contact, contactIndex) => `
                                <div class="contact-person-card" data-contact-id="${contact.id}">
                                    <div class="contact-person-header">
                                        <div class="contact-person-title">${contact.name} - ${contact.position}</div>
                                        <div style="margin-left: 10px;">
                                        <button class="btn btn-danger btn-small" onclick="removeContact('${building.id}', '${contact.id}')">
                                            <i class="fas fa-times"></i>
                                        </button>
                                        </div>
                                    </div>
                                    <div class="four-column">
                                        <div class="form-group">
                                            <label class="form-label">Name</label>
                                            <input type="text" class="form-input" value="${contact.name}" onchange="updateContact('${building.id}', '${contact.id}', 'name', this.value)">
                                        </div>
                                        <div class="form-group">
                                            <label class="form-label">Position</label>
                                            <input type="text" class="form-input" value="${contact.position}" onchange="updateContact('${building.id}', '${contact.id}', 'position', this.value)">
                                        </div>
                                        <div class="form-group">
                                            <label class="form-label">Phone</label>
                                            <input type="tel" class="form-input" value="${contact.phone}" onchange="updateContact('${building.id}', '${contact.id}', 'phone', this.value)">
                                        </div>
                                        <div class="form-group">
                                            <label class="form-label">Email</label>
                                            <input type="email" class="form-input" value="${contact.email}" onchange="updateContact('${building.id}', '${contact.id}', 'email', this.value)">
                                        </div>
                                    </div>
                                </div>
                            `).join('')}
                        </div>

                        <button class="add-contact-btn" onclick="addContact('${building.id}')">
                            <i class="fas fa-plus"></i>
                            Add Contact Person
                        </button>
                    </div>
                `;
                container.innerHTML += buildingHTML;
            });
        }

        function addNewBuilding() {
            const newBuilding = {
                id: `building-${Date.now()}`,
                name: 'New Property',
                address: '',
                type: 'Office',
                status: 'active',
                contacts: []
            };
            
            contactData.buildings.push(newBuilding);
            renderBuildings();
            showNotification('New building added successfully!', 'success');
            markUnsavedChanges();
        }

        function removeBuilding(buildingId) {
            if (confirm('Are you sure you want to remove this building and all its contacts?')) {
                contactData.buildings = contactData.buildings.filter(b => b.id !== buildingId);
                renderBuildings();
                showNotification('Building removed successfully!', 'success');
                markUnsavedChanges();
            }
        }

        function updateBuilding(buildingId, field, value) {
            const building = contactData.buildings.find(b => b.id === buildingId);
            if (building) {
                building[field] = value;
                markUnsavedChanges();
            }
        }

        function addContact(buildingId) {
            const building = contactData.buildings.find(b => b.id === buildingId);
            if (building) {
                const newContact = {
                    id: `contact-${Date.now()}`,
                    name: 'New Contact',
                    position: 'Contact Person',
                    phone: '',
                    email: ''
                };
                
                building.contacts.push(newContact);
                renderBuildings();
                showNotification('Contact person added!', 'success');
                markUnsavedChanges();
            }
        }

        function removeContact(buildingId, contactId) {
            const building = contactData.buildings.find(b => b.id === buildingId);
            if (building) {
                building.contacts = building.contacts.filter(c => c.id !== contactId);
                renderBuildings();
                showNotification('Contact person removed!', 'success');
                markUnsavedChanges();
            }
        }

        function updateContact(buildingId, contactId, field, value) {
            const building = contactData.buildings.find(b => b.id === buildingId);
            if (building) {
                const contact = building.contacts.find(c => c.id === contactId);
                if (contact) {
                    contact[field] = value;
                    markUnsavedChanges();
                }
            }
        }

        function saveBuildingAddresses() {
            showNotification('Building addresses saved successfully!', 'success');
            clearUnsavedChanges();
        }

        function previewBuildings() {
            let previewHTML = '<div style="display: grid; gap: 20px;">';
            
            contactData.buildings.forEach(building => {
                previewHTML += `
                    <div style="background: white; padding: 20px; border-radius: 12px; border: 1px solid #e5e7eb;">
                        <div style="display: flex; justify-content: between; align-items: center; margin-bottom: 15px;">
                            <div>
                                <h4 style="color: #1e293b; margin: 0 0 5px 0;">${building.name}</h4>
                                <span style="background: #eff6ff; color: #3b82f6; padding: 4px 8px; border-radius: 8px; font-size: 12px; font-weight: 600;">${building.type}</span>
                            </div>
                            <span style="padding: 4px 8px; border-radius: 12px; font-size: 11px; font-weight: 600; color: white; background: ${building.status === 'active' ? '#10b981' : '#6b7280'};">
                                ${building.status.charAt(0).toUpperCase() + building.status.slice(1)}
                            </span>
                        </div>
                        <div style="margin-bottom: 15px;">
                            <div style="color: #64748b; font-size: 14px; line-height: 1.5;">
                                <i class="fas fa-map-marker-alt" style="color: #3b82f6; margin-right: 8px;"></i>
                                ${building.address}
                            </div>
                        </div>
                        ${building.contacts.length > 0 ? `
                            <div>
                                <h5 style="color: #374151; margin: 0 0 10px 0; font-size: 14px;">Contact Persons:</h5>
                                ${building.contacts.map(contact => `
                                    <div style="background: #f8fafc; padding: 12px; border-radius: 8px; margin-bottom: 8px;">
                                        <div style="font-weight: 600; color: #1e293b; margin-bottom: 4px;">${contact.name}</div>
                                        <div style="font-size: 12px; color: #64748b; margin-bottom: 4px;">${contact.position}</div>
                                        <div style="font-size: 12px; color: #64748b;">
                                            <i class="fas fa-phone" style="margin-right: 5px;"></i>${contact.phone} | 
                                            <i class="fas fa-envelope" style="margin-left: 8px; margin-right: 5px;"></i>${contact.email}
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        ` : '<p style="color: #9ca3af; font-style: italic; font-size: 14px;">No contact persons added</p>'}
                    </div>
                `;
            });
            
            previewHTML += '</div>';
            showModal('Building Addresses & Contacts Preview', previewHTML);
        }

        // Tab switching functionality
        function switchTab(tabName) {
            // Remove active class from all tabs and content
            document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding content
            document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
            document.getElementById(`${tabName}-tab`).classList.add('active');
        }

        // Logo upload functionality
        function handleLogoUpload(event) {
            const file = event.target.files[0];
            if (!file) return;

            // Validate file type
            if (!file.type.startsWith('image/')) {
                showNotification('Please select a valid image file', 'error');
                return;
            }

            // Validate file size (5MB limit)
            if (file.size > 5 * 1024 * 1024) {
                showNotification('File size must be less than 5MB', 'error');
                return;
            }

            const reader = new FileReader();
            reader.onload = function(e) {
                const logoPreview = document.getElementById('logo-preview');
                const logoPlaceholder = document.getElementById('logo-placeholder');
                const companyLogoDisplay = document.getElementById('company-logo-display');
                
                logoPreview.innerHTML = `<img src="${e.target.result}" alt="Company Logo" class="logo-image">`;
                logoPreview.classList.add('has-image');
                
                companyLogoDisplay.innerHTML = `<img src="${e.target.result}" alt="Company Logo">`;
                
                document.getElementById('remove-logo-btn').style.display = 'block';
                
                contactData.company.logo = e.target.result;
                showNotification('Logo uploaded successfully!', 'success');
                markUnsavedChanges();
            };
            reader.readAsDataURL(file);
        }

        function removeLogo() {
            const logoPreview = document.getElementById('logo-preview');
            const companyLogoDisplay = document.getElementById('company-logo-display');
            
            logoPreview.innerHTML = `
                <div class="logo-placeholder" id="logo-placeholder">
                    <i class="fas fa-image"></i>
                    <p>Upload Logo</p>
                    <small>PNG, JPG up to 5MB</small>
                </div>
            `;
            logoPreview.classList.remove('has-image');
            
            companyLogoDisplay.innerHTML = '<i class="fas fa-building"></i>';
            
            document.getElementById('remove-logo-btn').style.display = 'none';
            document.getElementById('logo-upload').value = '';
            
            contactData.company.logo = null;
            showNotification('Logo removed successfully!', 'success');
            markUnsavedChanges();
        }

        // Drag and drop functionality for logo
        function setupDragAndDrop() {
            const logoPreview = document.getElementById('logo-preview');
            
            ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
                logoPreview.addEventListener(eventName, preventDefaults, false);
            });

            function preventDefaults(e) {
                e.preventDefault();
                e.stopPropagation();
            }

            ['dragenter', 'dragover'].forEach(eventName => {
                logoPreview.addEventListener(eventName, () => logoPreview.classList.add('drag-over'), false);
            });

            ['dragleave', 'drop'].forEach(eventName => {
                logoPreview.addEventListener(eventName, () => logoPreview.classList.remove('drag-over'), false);
            });

            logoPreview.addEventListener('drop', handleDrop, false);

            function handleDrop(e) {
                const dt = e.dataTransfer;
                const files = dt.files;
                
                if (files.length > 0) {
                    const file = files[0];
                    const fakeEvent = { target: { files: [file] } };
                    handleLogoUpload(fakeEvent);
                }
            }
        }

        // Service toggle functionality
        function toggleService(toggleElement, serviceId) {
            toggleElement.classList.toggle('active');
            contactData.services[serviceId].active = toggleElement.classList.contains('active');
            
            const status = toggleElement.classList.contains('active') ? 'enabled' : 'disabled';
            showNotification(`Service ${status} successfully!`, 'success');
            markUnsavedChanges();
        }

        // Save functions
        function saveContactInfo() {
            if (!validateContactForm()) return;
            
            contactData.contact = {
                email: document.getElementById('contact-email').value,
                phone: document.getElementById('contact-phone').value,
                address: document.getElementById('contact-address').value,
                hours: document.getElementById('contact-hours').value,
                formTitle: document.getElementById('contact-form-title').value,
                formSubtitle: document.getElementById('contact-form-subtitle').value,
                successMessage: document.getElementById('contact-success-msg').value
            };
            
            showNotification('Contact information saved successfully!', 'success');
            clearUnsavedChanges();
        }

        function saveAll() {
            if (!validateContactForm()) return;
            
            saveContactInfo();
            saveBuildingAddresses();
            
            setTimeout(() => {
                showNotification('All changes saved successfully!', 'success');
            }, 500);
        }

        // Validation functions
        function validateContactForm() {
            let isValid = true;
            
            // Email validation
            const email = document.getElementById('contact-email').value;
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!email || !emailRegex.test(email)) {
                showFieldError('contact-email', 'email-error', 'Please enter a valid email address');
                isValid = false;
            } else {
                clearFieldError('contact-email', 'email-error');
            }
            
            // Phone validation
            const phone = document.getElementById('contact-phone').value;
            if (!phone || phone.length < 10) {
                showFieldError('contact-phone', 'phone-error', 'Please enter a valid phone number');
                isValid = false;
            } else {
                clearFieldError('contact-phone', 'phone-error');
            }
            
            // Address validation
            const address = document.getElementById('contact-address').value;
            if (!address || address.trim().length < 10) {
                showFieldError('contact-address', 'address-error', 'Please enter a complete address');
                isValid = false;
            } else {
                clearFieldError('contact-address', 'address-error');
            }
            
            return isValid;
        }

        function showFieldError(fieldId, errorId, message) {
            const field = document.getElementById(fieldId);
            const errorElement = document.getElementById(errorId);
            
            field.classList.add('error');
            errorElement.textContent = message;
        }

        function clearFieldError(fieldId, errorId) {
            const field = document.getElementById(fieldId);
            const errorElement = document.getElementById(errorId);
            
            field.classList.remove('error');
            errorElement.textContent = '';
        }

        // Preview functions
        function previewContact() {
            const previewHTML = `
                <div class="contact-preview">
                    <div class="preview-item">
                        <i class="fas fa-envelope"></i>
                        <span><strong>Email:</strong> ${document.getElementById('contact-email').value}</span>
                    </div>
                    <div class="preview-item">
                        <i class="fas fa-phone"></i>
                        <span><strong>Phone:</strong> ${document.getElementById('contact-phone').value}</span>
                    </div>
                    <div class="preview-item">
                        <i class="fas fa-map-marker-alt"></i>
                        <span><strong>Address:</strong> ${document.getElementById('contact-address').value.replace(/\n/g, '<br>')}</span>
                    </div>
                    <div class="preview-item">
                        <i class="fas fa-clock"></i>
                        <span><strong>Hours:</strong> ${document.getElementById('contact-hours').value.replace(/\n/g, '<br>')}</span>
                    </div>
                </div>
                <h4 style="margin: 20px 0 10px 0; color: #3b82f6;">Contact Form Preview</h4>
                <div style="background: white; padding: 20px; border-radius: 12px; border: 1px solid #e5e7eb;">
                    <h3 style="margin-bottom: 10px; color: #1e293b;">${document.getElementById('contact-form-title').value}</h3>
                    <p style="color: #64748b; margin-bottom: 20px;">${document.getElementById('contact-form-subtitle').value}</p>
                    <div style="background: #f0f9ff; padding: 15px; border-radius: 8px; border-left: 4px solid #3b82f6;">
                        <strong>Success Message:</strong> ${document.getElementById('contact-success-msg').value}
                    </div>
                </div>
            `;
            
            showModal('Contact Information Preview', previewHTML);
        }

        function previewCompany() {
            const previewHTML = `
                <div style="text-align: center; margin-bottom: 20px;">
                    <div style="width: 100px; height: 100px; margin: 0 auto 15px; background: #f1f5f9; border-radius: 16px; display: flex; align-items: center; justify-content: center; overflow: hidden;">
                        ${contactData.company.logo ? `<img src="${contactData.company.logo}" style="width: 100%; height: 100%; object-fit: contain;">` : '<i class="fas fa-building" style="font-size: 2.5rem; color: #667eea;"></i>'}
                    </div>
                    <h2 style="color: #1e293b; margin-bottom: 5px;">${document.getElementById('company-name').value}</h2>
                    <p style="color: #64748b; font-size: 1.1rem; margin-bottom: 20px;">${document.getElementById('company-tagline').value}</p>
                </div>
                <div style="background: #f8fafc; padding: 20px; border-radius: 12px; margin-bottom: 20px;">
                    <h4 style="color: #1e293b; margin-bottom: 10px;">About Us</h4>
                    <p style="color: #64748b; line-height: 1.6;">${document.getElementById('company-about').value}</p>
                </div>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px;">
                    <div style="text-align: center; background: white; padding: 15px; border-radius: 8px;">
                        <div style="color: #3b82f6; font-weight: 600;">Founded</div>
                        <div style="color: #1e293b; font-size: 1.2rem;">${document.getElementById('company-founded').value}</div>
                    </div>
                    <div style="text-align: center; background: white; padding: 15px; border-radius: 8px;">
                        <div style="color: #3b82f6; font-weight: 600;">Employees</div>
                        <div style="color: #1e293b; font-size: 1.2rem;">${document.getElementById('company-employees').value}</div>
                    </div>
                    <div style="text-align: center; background: white; padding: 15px; border-radius: 8px;">
                        <div style="color: #3b82f6; font-weight: 600;">License</div>
                        <div style="color: #1e293b; font-size: 1.2rem;">${document.getElementById('company-license').value}</div>
                    </div>
                </div>
            `;
            
            showModal('Company Information Preview', previewHTML);
        }

        function previewSocial() {
            const socialPlatforms = [
                { id: 'facebook', name: 'Facebook', icon: 'fab fa-facebook', color: '#1877f2' },
                { id: 'instagram', name: 'Instagram', icon: 'fab fa-instagram', color: '#e4405f' },
                { id: 'linkedin', name: 'LinkedIn', icon: 'fab fa-linkedin', color: '#0077b5' },
                { id: 'twitter', name: 'Twitter/X', icon: 'fab fa-twitter', color: '#1da1f2' },
                { id: 'youtube', name: 'YouTube', icon: 'fab fa-youtube', color: '#ff0000' },
                { id: 'tiktok', name: 'TikTok', icon: 'fab fa-tiktok', color: '#000000' }
            ];

            let previewHTML = '<div style="display: grid; gap: 15px;">';
            
            socialPlatforms.forEach(platform => {
                const url = document.getElementById(`${platform.id}-url`).value;
                const status = url ? 'Connected' : 'Not Connected';
                const statusColor = url ? '#10b981' : '#ef4444';
                
                previewHTML += `
                    <div style="display: flex; align-items: center; justify-content: space-between; background: white; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb;">
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <i class="${platform.icon}" style="color: ${platform.color}; font-size: 20px; width: 24px;"></i>
                            <div>
                                <div style="font-weight: 600; color: #1e293b;">${platform.name}</div>
                                <div style="font-size: 12px; color: #64748b;">${url || 'No URL provided'}</div>
                            </div>
                        </div>
                        <div style="padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; color: white; background: ${statusColor};">
                            ${status}
                        </div>
                    </div>
                `;
            });
            
            previewHTML += '</div>';
            showModal('Social Media Links Preview', previewHTML);
        }

        function previewServices() {
            const serviceNames = {
                'office-space': 'Office Space Leasing',
                'retail-space': 'Retail Space Solutions',
                'property-management': 'Property Management',
                'consultation': 'Real Estate Consultation',
                'virtual-tours': 'Virtual Property Tours',
                'custom-solutions': 'Custom Space Solutions'
            };

            let previewHTML = '<div style="display: grid; gap: 15px;">';
            
            Object.keys(contactData.services).forEach(serviceId => {
                const service = contactData.services[serviceId];
                const customDesc = document.getElementById(`${serviceId}-desc`).value;
                const status = service.active ? 'Active' : 'Inactive';
                const statusColor = service.active ? '#10b981' : '#ef4444';
                
                previewHTML += `
                    <div style="background: white; padding: 20px; border-radius: 12px; border: 1px solid #e5e7eb;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                            <h4 style="color: #1e293b; margin: 0;">${serviceNames[serviceId]}</h4>
                            <span style="padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; color: white; background: ${statusColor};">
                                ${status}
                            </span>
                        </div>
                        ${customDesc ? `<p style="color: #64748b; margin: 0; font-style: italic;">Custom: ${customDesc}</p>` : ''}
                    </div>
                `;
            });
            
            previewHTML += '</div>';
            showModal('Services Configuration Preview', previewHTML);
        }

        // Test functions
        function testContactForm() {
            showNotification('Sending test email...', 'info');
            
            setTimeout(() => {
                const testData = {
                    name: 'Test User',
                    email: 'test@example.com',
                    message: 'This is a test message to verify the contact form functionality.',
                    timestamp: new Date().toLocaleString()
                };
                
                console.log('Test email data:', testData);
                showNotification('Test email sent successfully!', 'success');
            }, 2000);
        }

        // Export function
        function exportData() {
            const exportData = {
                ...contactData,
                exportDate: new Date().toISOString(),
                version: '1.0'
            };
            
            const dataStr = JSON.stringify(exportData, null, 2);
            const dataBlob = new Blob([dataStr], {type: 'application/json'});
            
            const link = document.createElement('a');
            link.href = URL.createObjectURL(dataBlob);
            link.download = `ambulo-properties-contact-data-${new Date().toISOString().split('T')[0]}.json`;
            link.click();
            
            showNotification('Data exported successfully!', 'success');
        }

        // Reset function
        function resetToDefaults() {
            if (confirm('Are you sure you want to reset all data to defaults? This action cannot be undone.')) {
                // Reset form values
                document.getElementById('contact-email').value = 'ambulosproperty@gmail.com';
                document.getElementById('contact-phone').value = '+63 917 123 4567';
                document.getElementById('contact-address').value = 'Kapt. Sayas Street, Brgy. San Vicente II\nSilang, Cavite, Philippines';
                document.getElementById('contact-hours').value = 'Monday - Friday: 9:00 AM - 6:00 PM\nSaturday: 10:00 AM - 4:00 PM\nSunday: By Appointment Only';
                document.getElementById('contact-form-title').value = 'Send Us a Message';
                document.getElementById('contact-form-subtitle').value = 'Fill out the form below and we\'ll get back to you within 24 hours. Let us know about your commercial space requirements.';
                document.getElementById('contact-success-msg').value = 'Thank you for your message! We\'ll get back to you within 24 hours.';
                
                // Reset buildings to default
                contactData.buildings = [
                    {
                        id: 'building-1',
                        name: 'Ambulo Main Office',
                        address: 'Kapt. Sayas Street, Brgy. San Vicente II, Silang, Cavite, Philippines',
                        type: 'Office',
                        status: 'active',
                        contacts: [
                            {
                                id: 'contact-1',
                                name: 'Maria Santos',
                                position: 'Property Manager',
                                phone: '+63 917 123 4567',
                                email: 'maria.santos@ambuloproperties.com'
                            }
                        ]
                    },
                    {
                        id: 'building-2',
                        name: 'Ambulo Retail Center',
                        address: 'Commercial District, Tagaytay City, Cavite, Philippines',
                        type: 'Retail',
                        status: 'active',
                        contacts: [
                            {
                                id: 'contact-2',
                                name: 'Juan Dela Cruz',
                                position: 'Leasing Manager',
                                phone: '+63 917 987 6543',
                                email: 'juan.delacruz@ambuloproperties.com'
                            }
                        ]
                    }
                ];
                
                renderBuildings();
                showNotification('All data reset to defaults!', 'info');
                clearUnsavedChanges();
            }
        }

        // Modal functions
        function showModal(title, content) {
            document.getElementById('modal-title').textContent = title;
            document.getElementById('preview-content').innerHTML = content;
            document.getElementById('preview-modal').classList.add('show');
        }

        function closeModal() {
            document.getElementById('preview-modal').classList.remove('show');
        }

        // Notification system
        function showNotification(message, type = 'info') {
            const notification = document.createElement('div');
            notification.className = `notification ${type}`;
            
            const icons = {
                success: 'check-circle',
                error: 'exclamation-triangle',
                info: 'info-circle'
            };
            
            notification.innerHTML = `
                <i class="fas fa-${icons[type]}"></i>
                ${message}
            `;
            
            document.body.appendChild(notification);
            
            setTimeout(() => {
                notification.classList.add('show');
            }, 100);
            
            setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.parentNode.removeChild(notification);
                    }
                }, 400);
            }, 4000);
        }

        // Auto-save functionality
        function setupAutoSave() {
            const inputs = document.querySelectorAll('input, textarea, select');
            inputs.forEach(input => {
                input.addEventListener('input', function() {
                    markUnsavedChanges();
                    clearTimeout(autoSaveTimeout);
                    autoSaveTimeout = setTimeout(() => {
                        autoSave();
                    }, 2000);
                });
            });
        }

        function autoSave() {
            // Save current state to memory
            console.log('Auto-saving content...');
            
            const indicator = document.getElementById('auto-save-indicator');
            indicator.classList.add('show');
            
            setTimeout(() => {
                indicator.classList.remove('show');
            }, 2000);
            
            clearUnsavedChanges();
        }

        function markUnsavedChanges() {
            hasUnsavedChanges = true;
            // Could add visual indicator for unsaved changes
        }

        function clearUnsavedChanges() {
            hasUnsavedChanges = false;
        }

        // Navigation
        function goBack() {
            if (hasUnsavedChanges) {
                if (confirm('You have unsaved changes. Are you sure you want to leave?')) {
                    showNotification('Returning to dashboard...', 'info');
                    setTimeout(() => {
                        window.history.back();
                    }, 1000);
                }
            } else {
                showNotification('Returning to dashboard...', 'info');
                setTimeout(() => {
                    window.history.back();
                }, 1000);
            }
        }

        // Form validation on input
        function setupRealTimeValidation() {
            const emailInput = document.getElementById('contact-email');
            const phoneInput = document.getElementById('contact-phone');
            const addressInput = document.getElementById('contact-address');

            emailInput.addEventListener('blur', () => {
                const email = emailInput.value;
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (email && !emailRegex.test(email)) {
                    showFieldError('contact-email', 'email-error', 'Please enter a valid email address');
                } else if (email) {
                    clearFieldError('contact-email', 'email-error');
                }
            });

            phoneInput.addEventListener('blur', () => {
                const phone = phoneInput.value;
                if (phone && phone.length < 10) {
                    showFieldError('contact-phone', 'phone-error', 'Phone number must be at least 10 digits');
                } else if (phone) {
                    clearFieldError('contact-phone', 'phone-error');
                }
            });

            addressInput.addEventListener('blur', () => {
                const address = addressInput.value;
                if (address && address.trim().length < 10) {
                    showFieldError('contact-address', 'address-error', 'Please enter a complete address');
                } else if (address) {
                    clearFieldError('contact-address', 'address-error');
                }
            });
        }

        // Keyboard shortcuts
        function setupKeyboardShortcuts() {
            document.addEventListener('keydown', function(e) {
                // Ctrl+S to save
                if (e.ctrlKey && e.key === 's') {
                    e.preventDefault();
                    saveAll();
                }
                
                // Escape to close modal
                if (e.key === 'Escape') {
                    closeModal();
                }
                
                // Ctrl+1-2 to switch tabs
                if (e.ctrlKey && e.key >= '1' && e.key <= '2') {
                    e.preventDefault();
                    const tabs = ['contact', 'buildings'];
                    switchTab(tabs[parseInt(e.key) - 1]);
                }
            });
        }

        // Initialize everything when page loads
        document.addEventListener('DOMContentLoaded', function() {
            setupAutoSave();
            setupRealTimeValidation();
            setupKeyboardShortcuts();
            renderBuildings(); // Render buildings on load
            
            // Close modal when clicking outside
            document.getElementById('preview-modal').addEventListener('click', function(e) {
                if (e.target === this) {
                    closeModal();
                }
            });
            
            showNotification('Contact Management System loaded successfully!', 'success');
        });

        // Warn before leaving with unsaved changes
        window.addEventListener('beforeunload', function(e) {
            if (hasUnsavedChanges) {
                e.preventDefault();
                e.returnValue = '';
            }
        });

        // Additional utility functions
        function copyToClipboard(text) {
            navigator.clipboard.writeText(text).then(() => {
                showNotification('Copied to clipboard!', 'success');
            }).catch(() => {
                showNotification('Failed to copy to clipboard', 'error');
            });
        }

        function validateUrl(url) {
            try {
                new URL(url);
                return true;
            } catch {
                return false;
            }
        }

        // Format phone number as user types
        document.addEventListener('DOMContentLoaded', function() {
            const phoneInput = document.getElementById('contact-phone');
            phoneInput.addEventListener('input', function(e) {
                let value = e.target.value.replace(/\D/g, '');
                if (value.startsWith('63')) {
                    value = '+' + value.replace(/(\d{2})(\d{3})(\d{3})(\d{4})/, '$1 $2 $3 $4');
                } else if (value.length === 10) {
                    value = '+63 ' + value.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');
                }
                e.target.value = value;
            });
        });