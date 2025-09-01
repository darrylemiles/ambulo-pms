        // Initialize the form
        function initializeForm() {
            generateAboutImageUploads();
            setupImageHandlers();
            setupTabSwitching();
            setupAutoSave();
        }

        // Setup tab switching functionality
        function setupTabSwitching() {
            const tabBtns = document.querySelectorAll('.tab-button');
            const tabContents = document.querySelectorAll('.tab-content');

            tabBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    const targetTab = btn.getAttribute('data-tab');
                    
                    // Update active tab button
                    tabBtns.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    
                    // Update active tab content
                    tabContents.forEach(content => {
                        content.classList.remove('active');
                        if (content.id === `${targetTab}-section`) {
                            content.classList.add('active');
                        }
                    });
                });
            });
        }

        // Generate about image uploads
        function generateAboutImageUploads() {
            const grid = document.getElementById('aboutImagesGrid');
            grid.innerHTML = '';

            for (let i = 1; i <= 4; i++) {
                const imageContainer = document.createElement('div');
                imageContainer.className = 'image-upload-container';
                imageContainer.innerHTML = `
                    <div class="form-group">
                        <label class="form-label">About Image ${i}</label>
                        <div class="image-upload" id="aboutImageUpload${i}" onclick="document.getElementById('aboutImage${i}').click()">
                            <div class="upload-placeholder">
                                <i class="fas fa-image"></i>
                                <p>Upload image ${i}</p>
                                <small>Recommended size: 800x600px</small>
                            </div>
                        </div>
                        <input type="file" id="aboutImage${i}" accept="image/*" style="display: none;">
                        <div id="aboutImage${i}Container" style="display: none;">
                            <img id="aboutImage${i}Current" class="current-image" alt="About Image ${i}">
                            <div class="image-actions">
                                <button type="button" class="btn btn-danger" onclick="removeAboutImage(${i})">
                                    <i class="fas fa-trash"></i>
                                    Remove
                                </button>
                            </div>
                        </div>
                    </div>
                `;
                grid.appendChild(imageContainer);
            }
        }

        // Setup image handlers
        function setupImageHandlers() {
            // Hero image
            document.getElementById('heroImageInput').addEventListener('change', function(e) {
                handleImageUpload(e, 'hero');
            });

            // About images
            for (let i = 1; i <= 4; i++) {
                document.getElementById(`aboutImage${i}`).addEventListener('change', function(e) {
                    handleImageUpload(e, 'about', i);
                });
            }
        }

        // Setup auto-save functionality
        function setupAutoSave() {
            const inputs = document.querySelectorAll('.form-input');
            inputs.forEach(input => {
                input.addEventListener('input', debounce(() => {
                    showAutoSaveIndicator();
                }, 1000));
            });
        }

        // Debounce function for auto-save
        function debounce(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        }

        // Handle image upload
        function handleImageUpload(event, type, index = null) {
            const file = event.target.files[0];
            if (file) {
                // Validate file size (5MB max)
                if (file.size > 5 * 1024 * 1024) {
                    showNotification('File size too large. Please choose an image under 5MB.', 'error');
                    return;
                }

                // Validate file type
                if (!file.type.startsWith('image/')) {
                    showNotification('Please select a valid image file.', 'error');
                    return;
                }

                const reader = new FileReader();
                reader.onload = function(e) {
                    let uploadDiv, containerId, currentImageId;
                    
                    if (type === 'hero') {
                        uploadDiv = document.getElementById('heroImageUpload');
                        containerId = 'heroImageContainer';
                        currentImageId = 'heroCurrentImage';
                    } else if (type === 'about') {
                        uploadDiv = document.getElementById(`aboutImageUpload${index}`);
                        containerId = `aboutImage${index}Container`;
                        currentImageId = `aboutImage${index}Current`;
                    }
                    
                    document.getElementById(currentImageId).src = e.target.result;
                    document.getElementById(containerId).style.display = 'block';
                    uploadDiv.style.display = 'none';
                    
                    showNotification(`${type === 'hero' ? 'Hero' : `About image ${index}`} uploaded successfully!`, 'success');
                };
                reader.readAsDataURL(file);
            }
        }

        // Remove image functions
        function removeHeroImage() {
            document.getElementById('heroImageContainer').style.display = 'none';
            document.getElementById('heroImageUpload').style.display = 'block';
            document.getElementById('heroImageInput').value = '';
            showNotification('Hero image removed', 'success');
        }

        function removeAboutImage(index) {
            document.getElementById(`aboutImage${index}Container`).style.display = 'none';
            document.getElementById(`aboutImageUpload${index}`).style.display = 'block';
            document.getElementById(`aboutImage${index}`).value = '';
            showNotification(`About image ${index} removed`, 'success');
        }

        // Save data
        function saveData() {
            const data = collectFormData();
            console.log('Saved data:', data);
            
            // Simulate saving process
            const saveBtn = document.querySelector('.btn-success');
            const originalText = saveBtn.innerHTML;
            saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
            saveBtn.disabled = true;
            
            setTimeout(() => {
                saveBtn.innerHTML = originalText;
                saveBtn.disabled = false;
                showNotification('All changes saved successfully!', 'success');
            }, 1500);
        }

        // Export data
        function exportData() {
            const data = collectFormData();
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `ambulo-properties-content-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            showNotification('Content data exported successfully!', 'success');
        }

        // Preview data
        function previewData() {
            const data = collectFormData();
            showNotification('Preview feature coming soon! Data logged to console.', 'info');
            console.log('Preview data:', data);
        }

        // Reset form
        function resetForm() {
            const confirmed = confirm('Are you sure you want to reset all content to defaults? This action cannot be undone.');
            if (confirmed) {
                const resetBtn = document.querySelector('.btn-danger');
                const originalText = resetBtn.innerHTML;
                resetBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Resetting...';
                resetBtn.disabled = true;
                
                setTimeout(() => {
                    location.reload();
                }, 1000);
            }
        }

        // Collect all form data
        function collectFormData() {
            const data = {
                hero: {
                    title: document.getElementById('heroTitle').value,
                    brandName: document.getElementById('brandName').value,
                    subtitle: document.getElementById('heroSubtitle').value,
                    primaryBtnText: document.getElementById('primaryBtnText').value,
                    secondaryBtnText: document.getElementById('secondaryBtnText').value,
                    backgroundImage: document.getElementById('heroCurrentImage').src || null
                },
                location: {
                    title: document.getElementById('locationTitle').value,
                    description: document.getElementById('locationDesc').value,
                    buttonText: document.getElementById('locationBtnText').value,
                    address: document.getElementById('locationAddress').value
                },
                about: {
                    title: document.getElementById('aboutTitle').value,
                    subtitle: document.getElementById('aboutSubtitle').value,
                    paragraph1: document.getElementById('aboutPara1').value,
                    paragraph2: document.getElementById('aboutPara2').value,
                    paragraph3: document.getElementById('aboutPara3').value,
                    images: []
                },
                contact: {
                    title: document.getElementById('contactTitle').value,
                    formTitle: document.getElementById('contactFormTitle').value,
                    infoTitle: document.getElementById('contactInfoTitle').value,
                    email: document.getElementById('contactEmail').value,
                    phone: document.getElementById('contactPhone').value,
                    address: document.getElementById('contactAddress').value,
                    businessHours: document.getElementById('businessHours').value,
                    footerText: document.getElementById('contactFooterText').value
                },
                timestamp: new Date().toISOString()
            };

            // Collect about images
            for (let i = 1; i <= 4; i++) {
                const imageEl = document.getElementById(`aboutImage${i}Current`);
                data.about.images.push(imageEl && imageEl.src && imageEl.src !== window.location.href ? imageEl.src : null);
            }

            return data;
        }

        // Show notification
        function showNotification(message, type = 'success') {
            const notification = document.getElementById('notification');
            notification.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-triangle' : 'info-circle'}"></i> ${message}`;
            notification.className = `notification ${type} show`;
            
            setTimeout(() => {
                notification.classList.remove('show');
            }, 4000);
        }

        // Show auto-save indicator
        function showAutoSaveIndicator() {
            const indicator = document.getElementById('autoSaveIndicator');
            indicator.classList.add('show');
            
            setTimeout(() => {
                indicator.classList.remove('show');
            }, 2000);
        }

        // Initialize when page loads
        document.addEventListener('DOMContentLoaded', initializeForm);

        // Navigation function
        function goBack() {
            // Prevent default link behavior and add smooth transition
            event.preventDefault();
            
            // You can customize this to your needs:
            // Option 1: Go back in browser history
            // window.history.back();
            
            // Option 2: Go to specific URL (uncomment the line below)
            // window.location.href = '/contentManagement.html';
            
            // Option 3: Show confirmation if there are unsaved changes
            const hasUnsavedChanges = checkForUnsavedChanges();
            if (hasUnsavedChanges) {
                const confirmed = confirm('You have unsaved changes. Are you sure you want to leave?');
                if (confirmed) {
                    window.history.back();
                }
            } else {
                window.history.back();
            }
        }

        // Check for unsaved changes (basic implementation)
        function checkForUnsavedChanges() {
            // This is a simple implementation - you can make it more sophisticated
            // by comparing current form values with saved values
            const inputs = document.querySelectorAll('.form-input');
            let hasChanges = false;
            
            // Simple check - in a real app you'd compare with saved data
            inputs.forEach(input => {
                if (input.value !== input.defaultValue) {
                    hasChanges = true;
                }
            });
            
            return hasChanges;
        }