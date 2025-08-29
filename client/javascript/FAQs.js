        let faqIdCounter = 4; // Start from 4 since we have 3 existing FAQs
        let currentEditingId = null;

        function toggleFAQ(element) {
            const faqItem = element.closest('.faq-item');
            const isOpen = faqItem.classList.contains('open');
            
            // Close all other FAQ items
            document.querySelectorAll('.faq-item').forEach(item => {
                item.classList.remove('open');
            });
            
            // Toggle current item
            if (!isOpen) {
                faqItem.classList.add('open');
            }
        }

        function addFAQ() {
            currentEditingId = null;
            document.getElementById('modalTitle').textContent = 'Add New FAQ';
            document.getElementById('faqQuestion').value = '';
            document.getElementById('faqAnswer').value = '';
            document.getElementById('editingFAQId').value = '';
            document.getElementById('saveFAQBtn').innerHTML = '<i class="fas fa-save"></i> Save FAQ';
            showModal('faqModal');
        }

        function editFAQ(id) {
            const faqItem = document.querySelector(`[data-id="${id}"]`);
            if (!faqItem) return;

            const question = faqItem.querySelector('.faq-question h4').textContent;
            const answer = faqItem.querySelector('.faq-answer p').textContent;

            currentEditingId = id;
            document.getElementById('modalTitle').textContent = 'Edit FAQ';
            document.getElementById('faqQuestion').value = question;
            document.getElementById('faqAnswer').value = answer;
            document.getElementById('editingFAQId').value = id;
            document.getElementById('saveFAQBtn').innerHTML = '<i class="fas fa-save"></i> Update FAQ';
            showModal('faqModal');
        }

        function saveFAQ() {
            const question = document.getElementById('faqQuestion').value.trim();
            const answer = document.getElementById('faqAnswer').value.trim();
            
            if (!question || !answer) {
                showNotification('Please fill in both question and answer fields.', 'error');
                return;
            }

            if (currentEditingId) {
                // Update existing FAQ
                updateExistingFAQ(currentEditingId, question, answer);
                showNotification('FAQ updated successfully!', 'success');
            } else {
                // Create new FAQ
                createNewFAQ(question, answer);
                showNotification('New FAQ added successfully!', 'success');
                updateFAQCounter();
            }

            closeFAQModal();
            triggerAutoSave();
        }

        function updateExistingFAQ(id, question, answer) {
            const faqItem = document.querySelector(`[data-id="${id}"]`);
            if (faqItem) {
                faqItem.querySelector('.faq-question h4').textContent = question;
                faqItem.querySelector('.faq-answer p').textContent = answer;
            }
        }

        function createNewFAQ(question, answer) {
            const faqHtml = `
                <div class="faq-item" data-id="${faqIdCounter}" style="opacity: 0; transform: translateY(20px);">
                    <div class="faq-question" onclick="toggleFAQ(this)">
                        <h4>${escapeHtml(question)}</h4>
                        <span class="faq-icon">
                            <i class="fas fa-chevron-down"></i>
                        </span>
                    </div>
                    <div class="faq-answer">
                        <p>${escapeHtml(answer)}</p>
                        <div class="action-buttons">
                            <button class="btn btn-primary" onclick="editFAQ(${faqIdCounter})">
                                <i class="fas fa-edit"></i>
                                Edit
                            </button>
                            <button class="btn btn-danger" onclick="deleteFAQ(${faqIdCounter}, this)">
                                <i class="fas fa-trash"></i>
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            `;
            
            const container = document.getElementById('faq-list');
            container.insertAdjacentHTML('beforeend', faqHtml);
            
            // Animate the new item
            setTimeout(() => {
                const newItem = container.lastElementChild;
                newItem.style.opacity = '1';
                newItem.style.transform = 'translateY(0)';
                newItem.style.transition = 'all 0.4s ease';
            }, 100);
            
            faqIdCounter++;
        }

        function deleteFAQ(id, element) {
            if (confirm('Are you sure you want to delete this FAQ? This action cannot be undone.')) {
                const faqItem = element.closest('.faq-item');
                if (faqItem) {
                    faqItem.style.transform = 'translateX(-100%)';
                    faqItem.style.opacity = '0';
                    setTimeout(() => {
                        faqItem.remove();
                        updateFAQCounter();
                        showNotification('FAQ deleted successfully!', 'success');
                        triggerAutoSave();
                    }, 300);
                }
            }
        }

        function updateFAQCounter() {
            const count = document.querySelectorAll('.faq-item').length;
            document.getElementById('faqCountBadge').textContent = count;
        }

        function filterFAQs() {
            const searchTerm = document.getElementById('faqSearchInput').value.toLowerCase();
            const faqItems = document.querySelectorAll('.faq-item');
            
            faqItems.forEach(item => {
                const question = item.querySelector('.faq-question h4').textContent.toLowerCase();
                const answer = item.querySelector('.faq-answer p').textContent.toLowerCase();
                
                if (question.includes(searchTerm) || answer.includes(searchTerm)) {
                    item.style.display = 'block';
                    item.style.animation = 'slideInFAQ 0.3s ease';
                } else {
                    item.style.display = 'none';
                }
            });
        }

        function saveFAQContent() {
            const faqData = {
                title: document.getElementById('faq-title').value,
                description: document.getElementById('faq-desc').value,
                faqs: []
            };
            
            // Collect all FAQ data
            document.querySelectorAll('.faq-item').forEach(item => {
                const id = item.getAttribute('data-id');
                const question = item.querySelector('.faq-question h4').textContent;
                const answer = item.querySelector('.faq-answer p').textContent;
                
                faqData.faqs.push({
                    id: id,
                    question: question,
                    answer: answer
                });
            });
            
            // Simulate API call
            showButtonLoading('saveFAQContent');
            setTimeout(() => {
                hideButtonLoading('saveFAQContent');
                showNotification('All FAQ content saved successfully!', 'success');
                console.log('Saving FAQ data:', faqData);
            }, 1500);
        }

        function previewFAQ() {
            generatePreview();
            showModal('previewModal');
        }

        function generatePreview() {
            const title = document.getElementById('faq-title').value || 'Frequently Asked Questions';
            const description = document.getElementById('faq-desc').value || 'Find answers to common questions';
            
            let previewHTML = `
                <div style="text-align: center; margin-bottom: 40px;">
                    <h2 style="font-size: 32px; font-weight: 700; color: #1e293b; margin-bottom: 16px;">${escapeHtml(title)}</h2>
                    <p style="font-size: 16px; color: #64748b; line-height: 1.6;">${escapeHtml(description)}</p>
                </div>
                <div style="display: flex; flex-direction: column; gap: 20px;">
            `;
            
            document.querySelectorAll('.faq-item').forEach(item => {
                const question = item.querySelector('.faq-question h4').textContent;
                const answer = item.querySelector('.faq-answer p').textContent;
                
                previewHTML += `
                    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px;">
                        <h4 style="font-size: 18px; font-weight: 600; color: #1e293b; margin-bottom: 12px;">${escapeHtml(question)}</h4>
                        <p style="font-size: 15px; color: #64748b; line-height: 1.6; margin: 0;">${escapeHtml(answer)}</p>
                    </div>
                `;
            });
            
            previewHTML += '</div>';
            document.getElementById('previewContent').innerHTML = previewHTML;
        }

        function exportFAQ() {
            const faqData = {
                title: document.getElementById('faq-title').value,
                description: document.getElementById('faq-desc').value,
                faqs: [],
                exportDate: new Date().toISOString()
            };
            
            document.querySelectorAll('.faq-item').forEach(item => {
                const id = item.getAttribute('data-id');
                const question = item.querySelector('.faq-question h4').textContent;
                const answer = item.querySelector('.faq-answer p').textContent;
                
                faqData.faqs.push({
                    id: id,
                    question: question,
                    answer: answer
                });
            });
            
            const dataStr = JSON.stringify(faqData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = 'faq-content.json';
            link.click();
            
            showNotification('FAQ content exported successfully!', 'success');
        }

        function showModal(modalId) {
            const modal = document.getElementById(modalId);
            modal.classList.add('show');
            document.body.style.overflow = 'hidden';
        }

        function closeFAQModal() {
            hideModal('faqModal');
        }

        function closePreviewModal() {
            hideModal('previewModal');
        }

        function hideModal(modalId) {
            const modal = document.getElementById(modalId);
            modal.classList.remove('show');
            document.body.style.overflow = 'auto';
        }

        function goBack() {
            showNotification('Returning to dashboard...', 'info');
            // Simulate navigation
            setTimeout(() => {
                window.location.href = '#dashboard';
            }, 1000);
        }

        function showNotification(message, type = 'info') {
            const notification = document.createElement('div');
            notification.className = `notification ${type}`;
            notification.innerHTML = `
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-triangle' : 'info-circle'}"></i>
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
            }, 4500);
        }

        function showButtonLoading(buttonId) {
            const button = document.querySelector(`[onclick*="${buttonId}"]`);
            if (button) {
                button.disabled = true;
                button.style.opacity = '0.7';
                const originalHTML = button.innerHTML;
                button.innerHTML = `<div class="loading-spinner"></div> Saving...`;
                button.setAttribute('data-original-html', originalHTML);
            }
        }

        function hideButtonLoading(buttonId) {
            const button = document.querySelector(`[onclick*="${buttonId}"]`);
            if (button && button.hasAttribute('data-original-html')) {
                button.disabled = false;
                button.style.opacity = '1';
                button.innerHTML = button.getAttribute('data-original-html');
                button.removeAttribute('data-original-html');
            }
        }

        function triggerAutoSave() {
            const indicator = document.createElement('div');
            indicator.className = 'auto-save-indicator show';
            indicator.innerHTML = '<i class="fas fa-check"></i> Auto-saved';
            
            document.body.appendChild(indicator);
            
            setTimeout(() => {
                indicator.classList.remove('show');
                setTimeout(() => {
                    if (indicator.parentNode) {
                        indicator.parentNode.removeChild(indicator);
                    }
                }, 300);
            }, 2500);
        }

        function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

        // Auto-save functionality
        let autoSaveTimeout;
        const inputs = document.querySelectorAll('#faq-title, #faq-desc');
        inputs.forEach(input => {
            input.addEventListener('input', function() {
                clearTimeout(autoSaveTimeout);
                autoSaveTimeout = setTimeout(() => {
                    triggerAutoSave();
                }, 2000);
            });
        });

        // Close modal when clicking outside
        document.addEventListener('click', function(e) {
            if (e.target.classList.contains('modal-overlay')) {
                const modalId = e.target.id;
                hideModal(modalId);
            }
        });

        // Initialize
        document.addEventListener('DOMContentLoaded', function() {
            updateFAQCounter();
            
            // Add smooth scrolling for better UX
            document.documentElement.style.scrollBehavior = 'smooth';
            
            // Add keyboard shortcuts
            document.addEventListener('keydown', function(e) {
                if (e.ctrlKey || e.metaKey) {
                    if (e.key === 's') {
                        e.preventDefault();
                        saveFAQContent();
                    } else if (e.key === 'n') {
                        e.preventDefault();
                        addFAQ();
                    }
                }
                
                if (e.key === 'Escape') {
                    const openModals = document.querySelectorAll('.modal-overlay.show');
                    openModals.forEach(modal => {
                        hideModal(modal.id);
                    });
                }
            });
            
            // Show welcome message
            setTimeout(() => {
                showNotification('Welcome to FAQ Management! Use Ctrl+N to add new FAQ, Ctrl+S to save.', 'info');
            }, 1000);
        });