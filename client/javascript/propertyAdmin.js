        // Sample property data with enhanced images
        let properties = [
            {
                id: 1,
                unitNumber: "101",
                building: "Sunset Plaza",
                location: "Silang, Cavite",
                type: "Commercial",
                status: "available",
                price: 25000,
                size: 850,
                parking: 2,
                bathrooms: 2,
                bedrooms: 0,
                tenant: "",
                description: "Modern commercial space with excellent visibility and foot traffic. Perfect for retail or office use.",
                images: [
                    "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
                    "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
                    "https://images.unsplash.com/photo-1556020685-ae41abfc9365?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
                    "https://images.unsplash.com/photo-1571624436279-b272aff752b5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                ]
            },
            {
                id: 2,
                unitNumber: "203",
                building: "Garden Heights",
                location: "Tagaytay, Cavite",
                type: "Residential",
                status: "occupied",
                price: 35000,
                size: 1200,
                parking: 1,
                bathrooms: 2,
                bedrooms: 3,
                tenant: "Maria Santos",
                description: "Spacious 3-bedroom residential unit with garden view and modern amenities.",
                images: [
                    "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
                    "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
                    "https://images.unsplash.com/photo-1556020685-ae41abfc9365?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                ]
            },
            {
                id: 3,
                unitNumber: "505",
                building: "Business Center",
                location: "Manila",
                type: "Office",
                status: "maintenance",
                price: 45000,
                size: 950,
                parking: 1,
                bathrooms: 1,
                bedrooms: 0,
                tenant: "",
                description: "Professional office space undergoing renovation. Will be available next month.",
                images: [
                    "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80",
                    "https://images.unsplash.com/photo-1571624436279-b272aff752b5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                ]
            },
            {
                id: 4,
                unitNumber: "302",
                building: "City View Apartments",
                location: "Manila",
                type: "Residential",
                status: "available",
                price: 28000,
                size: 980,
                parking: 1,
                bathrooms: 2,
                bedrooms: 2,
                tenant: "",
                description: "Cozy 2-bedroom apartment with city skyline view. Fully furnished with modern appliances.",
                images: [
                    "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                ]
            }
        ];

        let filteredProperties = [...properties];
        let currentEditingId = null;
        let uploadedImages = [];
        let editUploadedImages = [];
        let currentDetailImageIndex = 0;
        let currentPropertyImages = [];

        // Initialize the application
        document.addEventListener('DOMContentLoaded', function() {
            renderProperties();
            setupEventListeners();
        });

        function setupEventListeners() {
            // Search functionality
            document.getElementById('searchInput').addEventListener('input', function(e) {
                searchProperties(e.target.value);
            });

            // Profile dropdown
            document.getElementById('profileBtnIcon').addEventListener('click', function(e) {
                e.stopPropagation();
                const dropdown = document.getElementById('dropdownMenu');
                dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
            });

            // Close dropdown when clicking outside
            document.addEventListener('click', function() {
                document.getElementById('dropdownMenu').style.display = 'none';
                closeAllDropdowns();
            });

            // Image upload drag and drop
            setupImageUpload();
        }

        function setupImageUpload() {
            const uploadContainer = document.querySelector('.image-upload-container');
            const editUploadContainer = document.querySelector('#editModal .image-upload-container');

            [uploadContainer, editUploadContainer].forEach(container => {
                if (container) {
                    container.addEventListener('dragover', function(e) {
                        e.preventDefault();
                        this.classList.add('dragover');
                    });

                    container.addEventListener('dragleave', function(e) {
                        e.preventDefault();
                        this.classList.remove('dragover');
                    });

                    container.addEventListener('drop', function(e) {
                        e.preventDefault();
                        this.classList.remove('dragover');
                        const files = e.dataTransfer.files;
                        if (container === uploadContainer) {
                            handleImageFiles(files, false);
                        } else {
                            handleImageFiles(files, true);
                        }
                    });
                }
            });
        }

        function renderProperties() {
            const grid = document.getElementById('propertiesGrid');
            
            if (filteredProperties.length === 0) {
                grid.innerHTML = '<div style="text-align: center; padding: 50px; color: #666;">No properties found matching your criteria.</div>';
                return;
            }

            grid.innerHTML = filteredProperties.map(property => `
                <div class="property-card" data-id="${property.id}">
                    <div class="property-image ${property.images && property.images.length > 0 ? '' : 'no-image'}">
                        ${property.images && property.images.length > 0 
                            ? `<img src="${property.images[0]}" alt="${property.unitNumber}">` 
                            : '<span>No Image Available</span>'
                        }
                        <div class="status-badge status-${property.status}">
                            ${property.status.charAt(0).toUpperCase() + property.status.slice(1)}
                    </div>
                        <button class="edit-icon" onclick="openEditModal(${property.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                    </div>
                    
                    <div class="property-info">
                        <div class="property-title">${property.building} - Unit ${property.unitNumber}</div>
                        <div class="property-subtitle">${property.location}</div>
                        <div class="property-price">₱${property.price.toLocaleString()}</div>
                        
                        <div class="property-details">
                            <div class="detail-item">
                                <span>Type:</span>
                                <span>${property.type}</span>
                            </div>
                            <div class="detail-item">
                                <span>Size:</span>
                                <span>${property.size} sq ft</span>
                            </div>
                            <div class="detail-item">
                                <span>Bedrooms:</span>
                                <span>${property.bedrooms || 'N/A'}</span>
                            </div>
                            <div class="detail-item">
                                <span>Bathrooms:</span>
                                <span>${property.bathrooms || 'N/A'}</span>
                            </div>
                            <div class="detail-item">
                                <span>Parking:</span>
                                <span>${property.parking || 0}</span>
                            </div>
                            <div class="detail-item">
                                <span>Tenant:</span>
                                <span>${property.tenant || 'Vacant'}</span>
                            </div>
                        </div>
                        
                        <div class="property-actions">
                            <button class="btn-update" onclick="openEditModal(${property.id})">Edit</button>
                            <button class="btn-remove" onclick="removeProperty(${property.id})">Remove</button>
                            <button class="btn-details" onclick="showPropertyDetails(${property.id})">View Details</button>
                        </div>
                    </div>
                </div>
            `).join('');
        }

        //Property Details Function
        function showPropertyDetails(id) {
            const property = properties.find(p => p.id === id);
            if (!property) return;
            
            // Set modal title
            document.getElementById('detailsTitle').textContent = `${property.building} - Unit ${property.unitNumber}`;
            
            // Set up images for gallery
            currentPropertyImages = property.images && property.images.length > 0 
                ? property.images 
                : ["https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"];
            
            currentDetailImageIndex = 0;
            updateDetailGallery();
            
            // Populate specifications
            const specificationsContent = document.getElementById('specificationsContent');
            specificationsContent.innerHTML = `
                <div class="spec-row">
                    <span class="spec-label">Address:</span>
                    <span class="spec-value">${property.location}</span>
                </div>
                <div class="spec-row">
                    <span class="spec-label">Unit Number:</span>
                    <span class="spec-value">${property.unitNumber}</span>
                </div>
                <div class="spec-row">
                    <span class="spec-label">Building:</span>
                    <span class="spec-value">${property.building}</span>
                </div>
                <div class="spec-row">
                    <span class="spec-label">Property Type:</span>
                    <span class="spec-value">${property.type}</span>
                </div>
                <div class="spec-row">
                    <span class="spec-label">Bathrooms:</span>
                    <span class="spec-value">${property.bathrooms || 'N/A'}</span>
                </div>
                <div class="spec-row">
                    <span class="spec-label">Bedrooms:</span>
                    <span class="spec-value">${property.bedrooms || 'N/A'}</span>
                </div>
                <div class="spec-row">
                    <span class="spec-label">Square Feet:</span>
                    <span class="spec-value">${property.size.toLocaleString()} sq ft</span>
                </div>
                <div class="spec-row">
                    <span class="spec-label">Parking Spaces:</span>
                    <span class="spec-value">${property.parking || 0}</span>
                </div>
                <div class="spec-row">
                    <span class="spec-label">Current Tenant:</span>
                    <span class="spec-value">${property.tenant || 'Vacant'}</span>
                </div>
                <div class="spec-row">
                    <span class="spec-label">Property ID:</span>
                    <span class="spec-value">PROP-${property.id.toString().padStart(4, '0')}</span>
                </div>
            `;
            
            // Update price and status
            document.getElementById('detailPrice').textContent = `₱${property.price.toLocaleString()}`;
            document.getElementById('detailDeposit').textContent = `₱${(property.price * 1.2).toLocaleString()}`;
            
            const statusElement = document.getElementById('detailStatus');
            statusElement.textContent = property.status.charAt(0).toUpperCase() + property.status.slice(1);
            statusElement.className = `availability-status ${property.status}`;
            
            // Show modal
            document.getElementById('detailsModal').classList.add('show');
        }

        function updateDetailGallery() {
            const mainImage = document.getElementById('detailMainImage');
            const thumbnailsContainer = document.getElementById('detailThumbnails');
            
            // Update main image
            mainImage.src = currentPropertyImages[currentDetailImageIndex];
            
            // Update thumbnails
            thumbnailsContainer.innerHTML = currentPropertyImages.map((image, index) => `
                <img class="thumbnail ${index === currentDetailImageIndex ? 'active' : ''}" 
                     src="${image}" 
                     alt="Property Image ${index + 1}" 
                     onclick="setDetailMainImage(${index})">
            `).join('');
        }

        function changeDetailImage(direction) {
            currentDetailImageIndex += direction;
            
            if (currentDetailImageIndex >= currentPropertyImages.length) {
                currentDetailImageIndex = 0;
            } else if (currentDetailImageIndex < 0) {
                currentDetailImageIndex = currentPropertyImages.length - 1;
            }
            
            updateDetailGallery();
        }

        function setDetailMainImage(index) {
            currentDetailImageIndex = index;
            updateDetailGallery();
        }

        function closeDetailsModal() {
            document.getElementById('detailsModal').classList.remove('show');
        }

        // Modal functions
        function openAddModal() {
            document.getElementById('addModal').classList.add('show');
            uploadedImages = [];
            document.getElementById('imagePreviewContainer').innerHTML = '';
        }

        function closeAddModal() {
            document.getElementById('addModal').classList.remove('show');
            document.getElementById('addPropertyForm').reset();
            uploadedImages = [];
            document.getElementById('imagePreviewContainer').innerHTML = '';
        }

        function openEditModal(id) {
            const property = properties.find(p => p.id === id);
            if (!property) return;

            currentEditingId = id;
            editUploadedImages = [...(property.images || [])];

            // Populate form fields
            document.getElementById('editUnitNumber').value = property.unitNumber;
            document.getElementById('editBuilding').value = property.building;
            document.getElementById('editLocation').value = property.location;
            document.getElementById('editType').value = property.type;
            document.getElementById('editStatus').value = property.status;
            document.getElementById('editPrice').value = property.price;
            document.getElementById('editSize').value = property.size;
            document.getElementById('editParking').value = property.parking || 0;
            document.getElementById('editBathrooms').value = property.bathrooms || 0;
            document.getElementById('editBedrooms').value = property.bedrooms || 0;
            document.getElementById('editTenant').value = property.tenant || '';
            document.getElementById('editDescription').value = property.description || '';

            // Display existing images
            updateImagePreview(editUploadedImages, 'editImagePreviewContainer', true);

            document.getElementById('editModal').classList.add('show');
        }

        function closeEditModal() {
            document.getElementById('editModal').classList.remove('show');
            document.getElementById('editPropertyForm').reset();
            currentEditingId = null;
            editUploadedImages = [];
            document.getElementById('editImagePreviewContainer').innerHTML = '';
        }

        // Form submission functions
        function addProperty(event) {
            event.preventDefault();
            
            const formData = new FormData(event.target);
            const newProperty = {
                id: Math.max(...properties.map(p => p.id)) + 1,
                unitNumber: formData.get('unitNumber'),
                building: formData.get('building'),
                location: formData.get('location'),
                type: formData.get('type'),
                status: formData.get('status'),
                price: parseInt(formData.get('price')),
                size: parseInt(formData.get('size')),
                parking: parseInt(formData.get('parking')) || 0,
                bathrooms: parseInt(formData.get('bathrooms')) || 0,
                bedrooms: parseInt(formData.get('bedrooms')) || 0,
                tenant: formData.get('tenant') || '',
                description: formData.get('description') || '',
                images: [...uploadedImages]
            };

            properties.push(newProperty);
            filteredProperties = [...properties];
            renderProperties();
            closeAddModal();
            
            alert('Property added successfully!');
        }

        function updateProperty(event) {
            event.preventDefault();
            
            const formData = new FormData(event.target);
            const propertyIndex = properties.findIndex(p => p.id === currentEditingId);
            
            if (propertyIndex === -1) return;

            properties[propertyIndex] = {
                ...properties[propertyIndex],
                unitNumber: formData.get('unitNumber'),
                building: formData.get('building'),
                location: formData.get('location'),
                type: formData.get('type'),
                status: formData.get('status'),
                price: parseInt(formData.get('price')),
                size: parseInt(formData.get('size')),
                parking: parseInt(formData.get('parking')) || 0,
                bathrooms: parseInt(formData.get('bathrooms')) || 0,
                bedrooms: parseInt(formData.get('bedrooms')) || 0,
                tenant: formData.get('tenant') || '',
                description: formData.get('description') || '',
                images: [...editUploadedImages]
            };

            filteredProperties = [...properties];
            renderProperties();
            closeEditModal();
            
            alert('Property updated successfully!');
        }

        function removeProperty(id) {
            if (confirm('Are you sure you want to remove this property?')) {
                properties = properties.filter(p => p.id !== id);
                filteredProperties = [...properties];
                renderProperties();
                alert('Property removed successfully!');
            }
        }

        // Image handling functions
        function handleImageUpload(event) {
            handleImageFiles(event.target.files, false);
        }

        function handleEditImageUpload(event) {
            handleImageFiles(event.target.files, true);
        }

        function handleImageFiles(files, isEdit) {
            const maxFiles = 10;
            const maxSize = 5 * 1024 * 1024; // 5MB
            
            const currentImages = isEdit ? editUploadedImages : uploadedImages;
            const remainingSlots = maxFiles - currentImages.length;

            if (remainingSlots <= 0) {
                alert('Maximum 10 images allowed per property.');
                return;
            }

            const filesToProcess = Array.from(files).slice(0, remainingSlots);

            filesToProcess.forEach(file => {
                if (file.size > maxSize) {
                    alert(`File ${file.name} is too large. Maximum size is 5MB.`);
                    return;
                }

                if (!file.type.startsWith('image/')) {
                    alert(`File ${file.name} is not an image.`);
                    return;
                }

                const reader = new FileReader();
                reader.onload = function(e) {
                    if (isEdit) {
                        editUploadedImages.push(e.target.result);
                        updateImagePreview(editUploadedImages, 'editImagePreviewContainer', true);
                    } else {
                        uploadedImages.push(e.target.result);
                        updateImagePreview(uploadedImages, 'imagePreviewContainer', false);
                    }
                };
                reader.readAsDataURL(file);
            });
        }

        function updateImagePreview(images, containerId, isEdit) {
            const container = document.getElementById(containerId);
            container.innerHTML = images.map((image, index) => `
                <div class="image-preview">
                    <img src="${image}" alt="Preview ${index + 1}">
                    <button type="button" class="remove-image" onclick="removeImage(${index}, ${isEdit})">×</button>
                </div>
            `).join('');
        }

        function removeImage(index, isEdit) {
            if (isEdit) {
                editUploadedImages.splice(index, 1);
                updateImagePreview(editUploadedImages, 'editImagePreviewContainer', true);
            } else {
                uploadedImages.splice(index, 1);
                updateImagePreview(uploadedImages, 'imagePreviewContainer', false);
            }
        }

        // Search and filter functions
        function searchProperties(query) {
            if (!query.trim()) {
                filteredProperties = [...properties];
            } else {
                const searchTerm = query.toLowerCase();
                filteredProperties = properties.filter(property => 
                    property.unitNumber.toLowerCase().includes(searchTerm) ||
                    property.building.toLowerCase().includes(searchTerm) ||
                    property.location.toLowerCase().includes(searchTerm) ||
                    property.type.toLowerCase().includes(searchTerm) ||
                    (property.tenant && property.tenant.toLowerCase().includes(searchTerm))
                );
            }
            renderProperties();
        }

        function toggleDropdown(dropdownId) {
            event.stopPropagation();
            closeAllDropdowns();
            const dropdown = document.getElementById(dropdownId);
            dropdown.classList.toggle('show');
        }

        function closeAllDropdowns() {
            document.querySelectorAll('.property-dropdown-content').forEach(dropdown => {
                dropdown.classList.remove('show');
            });
        }

        function filterByStatus(status) {
            if (status === 'all') {
                filteredProperties = [...properties];
            } else {
                filteredProperties = properties.filter(property => property.status === status);
            }
            renderProperties();
            closeAllDropdowns();
        }

        function filterByType(type) {
            if (type === 'all') {
                filteredProperties = [...properties];
            } else {
                const typeMap = {
                    'office': 'Commercial',
                    'retail': 'Residential', 
                    'residential': 'Office'
                };
                const actualType = typeMap[type] || type;
                filteredProperties = properties.filter(property => property.type === actualType);
            }
            renderProperties();
            closeAllDropdowns();
        }

        function filterByLocation(location) {
            if (location === 'all') {
                filteredProperties = [...properties];
            } else {
                const locationMap = {
                    'silang': 'Silang, Cavite',
                    'tagaytay': 'Tagaytay, Cavite',
                };
                const actualLocation = locationMap[location] || location;
                filteredProperties = properties.filter(property => 
                    property.location.toLowerCase().includes(actualLocation.toLowerCase())
                );
            }
            renderProperties();
            closeAllDropdowns();
        }

        // Close modals when clicking outside
        document.addEventListener('click', function(event) {
            if (event.target.classList.contains('modal-overlay')) {
                event.target.classList.remove('show');
            }
        });