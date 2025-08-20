        // Global state for document management
        let currentView = 'list';
        let currentPath = '';
        let currentTab = 'tenants';
        let fileSystem = {
            tenants: {},
            contracts: {},
            templates: {}
        };
        let searchTerm = '';
        let selectedTenant = 'Tenant Name';
        let selectedType = 'All Types';
        let selectedModified = 'Any time';
        let contextItem = null;
        let selectedFiles = [];
        let selectedAttachments = [];

        // Initialize document management when DOM is loaded
        document.addEventListener('DOMContentLoaded', function() {
            setupDocumentManagement();
            setupProfileDropdown();
        });

        function setupProfileDropdown() {
            const profileBtn = document.getElementById('profileBtnIcon');
            const dropdownMenu = document.getElementById('dropdownMenu');

            if (profileBtn && dropdownMenu) {
                profileBtn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    dropdownMenu.classList.toggle('show');
                });

                document.addEventListener('click', function(e) {
                    if (!profileBtn.contains(e.target)) {
                        dropdownMenu.classList.remove('show');
                    }
                });
            }
        }

        function setupDocumentManagement() {
            setupEventListeners();
            renderItems();
            addSampleData();
        }

        function addSampleData() {
            // Add sample data for tenants tab
            fileSystem.tenants['Tenant_A_Documents'] = {
                type: 'folder',
                name: 'Tenant A Documents',
                created: new Date('2024-01-15'),
                path: 'Tenant_A_Documents',
                parentPath: ''
            };

            fileSystem.tenants['Tenant_B_Documents'] = {
                type: 'folder',
                name: 'Tenant B Documents',
                created: new Date('2024-02-10'),
                path: 'Tenant_B_Documents',
                parentPath: ''
            };

            fileSystem.tenants['lease_agreement.pdf'] = {
                type: 'file',
                name: 'lease_agreement.pdf',
                size: 245760,
                created: new Date('2024-03-05'),
                path: 'lease_agreement.pdf',
                parentPath: ''
            };

            // Add sample contracts
            fileSystem.contracts['rental_contract_2024.pdf'] = {
                type: 'file',
                name: 'rental_contract_2024.pdf',
                size: 512000,
                created: new Date('2024-01-20'),
                path: 'rental_contract_2024.pdf',
                parentPath: ''
            };

            fileSystem.contracts['maintenance_agreement.pdf'] = {
                type: 'file',
                name: 'maintenance_agreement.pdf',
                size: 389120,
                created: new Date('2024-02-15'),
                path: 'maintenance_agreement.pdf',
                parentPath: ''
            };

            // Add sample templates
            fileSystem.templates['lease_template.docx'] = {
                type: 'file',
                name: 'lease_template.docx',
                size: 156672,
                created: new Date('2024-01-10'),
                path: 'lease_template.docx',
                parentPath: ''
            };

            fileSystem.templates['notice_template.docx'] = {
                type: 'file',
                name: 'notice_template.docx',
                size: 98304,
                created: new Date('2024-02-05'),
                path: 'notice_template.docx',
                parentPath: ''
            };

            renderItems();
        }

        function switchTab(tabName) {
            currentTab = tabName;
            
            // Update tab buttons
            document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
            document.getElementById(tabName + 'Tab').classList.add('active');
            
            // Update tab content
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
            document.getElementById(tabName + 'Content').classList.add('active');
            
            // Reset current path when switching tabs
            currentPath = '';
            renderBreadcrumb();
            renderItems();
        }

        function setupEventListeners() {
            // File input changes
            const fileInput = document.getElementById('fileInput');
            const attachmentInput = document.getElementById('attachmentInput');
            
            if (fileInput) fileInput.addEventListener('change', handleFileSelect);
            if (attachmentInput) attachmentInput.addEventListener('change', handleAttachmentSelect);

            // Drag and drop
            const dropZone = document.getElementById('dropZone');
            if (dropZone) {
                dropZone.addEventListener('dragover', handleDragOver);
                dropZone.addEventListener('dragleave', handleDragLeave);
                dropZone.addEventListener('drop', handleDrop);
            }

            const attachmentDropZone = document.getElementById('attachmentDropZone');
            if (attachmentDropZone) {
                attachmentDropZone.addEventListener('dragover', handleAttachmentDragOver);
                attachmentDropZone.addEventListener('dragleave', handleAttachmentDragLeave);
                attachmentDropZone.addEventListener('drop', handleAttachmentDrop);
            }

            // Enter key handlers
            const folderNameInput = document.getElementById('folderName');
            
            if (folderNameInput) {
                folderNameInput.addEventListener('keypress', function(e) {
                    if (e.key === 'Enter') createFolder();
                });
            }

            // Click outside handlers
            window.addEventListener('click', function(e) {
                if (e.target.classList.contains('modal')) {
                    closeModal(e.target.id);
                }
                
                if (!e.target.closest('.dropdown') && !e.target.closest('.btn-add')) {
                    document.querySelectorAll('.dropdown-content, .add-dropdown-content').forEach(dropdown => {
                        dropdown.style.display = 'none';
                    });
                }
            });
        }

        function toggleAddMenu() {
            const menu = document.getElementById('addMenu');
            if (!menu) return;
            
            const isVisible = menu.style.display === 'block';
            
            // Close all dropdowns
            document.querySelectorAll('.dropdown-content, .add-dropdown-content').forEach(d => {
                d.style.display = 'none';
            });
            
            if (!isVisible) {
                menu.style.display = 'block';
            }
        }

        function toggleDropdown(dropdownId) {
            const dropdown = document.getElementById(dropdownId);
            if (!dropdown) return;
            
            const isVisible = dropdown.style.display === 'block';
            
            // Close all dropdowns
            document.querySelectorAll('.dropdown-content, .add-dropdown-content').forEach(d => {
                d.style.display = 'none';
            });
            
            if (!isVisible) {
                dropdown.style.display = 'block';
            }
        }

        function selectTenant(tenant) {
            selectedTenant = tenant;
            const button = document.querySelector('#tenantDropdown').parentElement.querySelector('.dropdown-button span');
            if (button) button.textContent = tenant;
            document.getElementById('tenantDropdown').style.display = 'none';
            renderItems();
        }

        function selectType(type) {
            selectedType = type;
            const button = document.querySelector('#typeDropdown').parentElement.querySelector('.dropdown-button span');
            if (button) button.textContent = type;
            document.getElementById('typeDropdown').style.display = 'none';
            renderItems();
        }

        function selectModified(modified) {
            selectedModified = modified;
            const button = document.querySelector('#modifiedDropdown').parentElement.querySelector('.dropdown-button span');
            if (button) button.textContent = modified;
            document.getElementById('modifiedDropdown').style.display = 'none';
            renderItems();
        }

        function switchView(view) {
            currentView = view;
            
            const listBtn = document.getElementById('listBtn');
            const gridBtn = document.getElementById('gridBtn');
            
            if (listBtn) listBtn.classList.remove('active');
            if (gridBtn) gridBtn.classList.remove('active');
            
            const activeBtn = document.getElementById(view + 'Btn');
            if (activeBtn) activeBtn.classList.add('active');

            const container = document.getElementById('itemsContainer');
            if (container) {
                container.className = view === 'list' ? 'items-container list-view' : 'items-container grid-view';
            }
            
            renderItems();
        }

        function showNewFolderModal() {
            const addMenu = document.getElementById('addMenu');
            const folderModal = document.getElementById('folderModal');
            const folderNameInput = document.getElementById('folderName');
            
            if (addMenu) addMenu.style.display = 'none';
            if (folderModal) folderModal.style.display = 'block';
            if (folderNameInput) folderNameInput.focus();
        }

        function showUploadModal() {
            const addMenu = document.getElementById('addMenu');
            const uploadModal = document.getElementById('uploadModal');
            
            if (addMenu) addMenu.style.display = 'none';
            if (uploadModal) uploadModal.style.display = 'block';
            selectedFiles = [];
            updateSelectedFilesDisplay();
        }

        function showAttachmentModal() {
            const addMenu = document.getElementById('addMenu');
            const attachmentModal = document.getElementById('attachmentModal');
            
            if (addMenu) addMenu.style.display = 'none';
            if (attachmentModal) attachmentModal.style.display = 'block';
            selectedAttachments = [];
            updateSelectedAttachmentsDisplay();
        }

        function closeModal(modalId) {
            const modal = document.getElementById(modalId);
            if (!modal) return;
            
            modal.style.display = 'none';
            
            switch(modalId) {
                case 'folderModal':
                    const folderNameInput = document.getElementById('folderName');
                    if (folderNameInput) folderNameInput.value = '';
                    break;
                case 'uploadModal':
                    const fileInput = document.getElementById('fileInput');
                    if (fileInput) fileInput.value = '';
                    selectedFiles = [];
                    updateSelectedFilesDisplay();
                    break;
                case 'attachmentModal':
                    const attachmentInput = document.getElementById('attachmentInput');
                    if (attachmentInput) attachmentInput.value = '';
                    selectedAttachments = [];
                    updateSelectedAttachmentsDisplay();
                    break;
            }
        }

        function createFolder() {
            const folderNameInput = document.getElementById('folderName');
            if (!folderNameInput) return;
            
            const folderName = folderNameInput.value.trim();
            if (!folderName) return;

            const folderPath = currentPath ? `${currentPath}/${folderName}` : folderName;
            
            if (fileSystem[currentTab][folderPath]) {
                alert('Folder already exists!');
                return;
            }

            fileSystem[currentTab][folderPath] = {
                type: 'folder',
                name: folderName,
                created: new Date(),
                path: folderPath,
                parentPath: currentPath
            };

            closeModal('folderModal');
            renderItems();
        }

        function getFileType(fileName) {
            const extension = fileName.toLowerCase().split('.').pop();
            switch (extension) {
                case 'pdf':
                    return { icon: '<i class="fa-solid fa-file-pdf"></i>', class: 'pdf-icon', type: 'document' };
                case 'jpg':
                case 'jpeg':
                case 'png':
                case 'gif':
                case 'svg':
                    return { icon: '<i class="fa-solid fa-image"></i>', class: 'image-icon', type: 'image' };
                case 'doc':
                case 'docx':
                    return { icon: '<i class="fa-solid fa-file-word"></i>', class: 'doc-icon', type: 'document' };
                case 'xls':
                case 'xlsx':
                    return { icon: '<i class="fa-solid fa-file-excel"></i>', class: 'doc-icon', type: 'document' };
                case 'txt':
                    return { icon: '<i class="fa-solid fa-file-text"></i>', class: 'file-icon', type: 'document' };
                default:
                    return { icon: '<i class="fa-solid fa-file"></i>', class: 'file-icon', type: 'other' };
            }
        }

        function formatFileSize(bytes) {
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        }

        function handleFileSelect(event) {
            const files = Array.from(event.target.files);
            selectedFiles = [...selectedFiles, ...files];
            updateSelectedFilesDisplay();
        }

        function handleAttachmentSelect(event) {
            const files = Array.from(event.target.files);
            selectedAttachments = [...selectedAttachments, ...files];
            updateSelectedAttachmentsDisplay();
        }

        function updateSelectedFilesDisplay() {
            const container = document.getElementById('selectedFiles');
            if (!container) return;
            
            if (selectedFiles.length === 0) {
                container.innerHTML = '';
                return;
            }

            let html = '';
            selectedFiles.forEach((file, index) => {
                html += `
                    <div class="selected-file" style="display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; background: #f8fafc; border-radius: 6px; margin-bottom: 8px; font-size: 14px;">
                        <span style="flex: 1; margin-right: 12px;">${file.name} (${formatFileSize(file.size)})</span>
                        <button class="remove-file" onclick="removeFile(${index})" style="background: none; border: none; color: #ef4444; cursor: pointer; padding: 2px 6px; border-radius: 3px; font-size: 12px;">✕</button>
                    </div>
                `;
            });
            container.innerHTML = html;
        }

        function updateSelectedAttachmentsDisplay() {
            const container = document.getElementById('selectedAttachments');
            if (!container) return;
            
            if (selectedAttachments.length === 0) {
                container.innerHTML = '';
                return;
            }

            let html = '';
            selectedAttachments.forEach((file, index) => {
                html += `
                    <div class="selected-file" style="display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; background: #f8fafc; border-radius: 6px; margin-bottom: 8px; font-size: 14px;">
                        <span style="flex: 1; margin-right: 12px;">${file.name} (${formatFileSize(file.size)})</span>
                        <button class="remove-file" onclick="removeAttachment(${index})" style="background: none; border: none; color: #ef4444; cursor: pointer; padding: 2px 6px; border-radius: 3px; font-size: 12px;">✕</button>
                    </div>
                `;
            });
            container.innerHTML = html;
        }

        function removeFile(index) {
            selectedFiles.splice(index, 1);
            updateSelectedFilesDisplay();
        }

        function removeAttachment(index) {
            selectedAttachments.splice(index, 1);
            updateSelectedAttachmentsDisplay();
        }

        // Drag and drop handlers
        function handleDragOver(event) {
            event.preventDefault();
            const dropZone = document.getElementById('dropZone');
            if (dropZone) dropZone.style.borderColor = '#3b82f6';
        }

        function handleDragLeave(event) {
            event.preventDefault();
            const dropZone = document.getElementById('dropZone');
            if (dropZone) dropZone.style.borderColor = '#d1d5db';
        }

        function handleDrop(event) {
            event.preventDefault();
            const dropZone = document.getElementById('dropZone');
            if (dropZone) dropZone.style.borderColor = '#d1d5db';
            const files = Array.from(event.dataTransfer.files);
            selectedFiles = [...selectedFiles, ...files];
            updateSelectedFilesDisplay();
        }

        function handleAttachmentDragOver(event) {
            event.preventDefault();
            const attachmentDropZone = document.getElementById('attachmentDropZone');
            if (attachmentDropZone) attachmentDropZone.style.borderColor = '#3b82f6';
        }

        function handleAttachmentDragLeave(event) {
            event.preventDefault();
            const attachmentDropZone = document.getElementById('attachmentDropZone');
            if (attachmentDropZone) attachmentDropZone.style.borderColor = '#d1d5db';
        }

        function handleAttachmentDrop(event) {
            event.preventDefault();
            const attachmentDropZone = document.getElementById('attachmentDropZone');
            if (attachmentDropZone) attachmentDropZone.style.borderColor = '#d1d5db';
            const files = Array.from(event.dataTransfer.files);
            selectedAttachments = [...selectedAttachments, ...files];
            updateSelectedAttachmentsDisplay();
        }

        function uploadFiles() {
            if (selectedFiles.length === 0) return;

            selectedFiles.forEach(file => {
                const filePath = currentPath ? `${currentPath}/${file.name}` : file.name;
                
                if (fileSystem[currentTab][filePath]) {
                    if (!confirm(`File "${file.name}" already exists. Replace it?`)) {
                        return;
                    }
                }
                
                fileSystem[currentTab][filePath] = {
                    type: 'file',
                    name: file.name,
                    size: file.size,
                    lastModified: new Date(file.lastModified),
                    created: new Date(),
                    path: filePath,
                    parentPath: currentPath,
                    file: file
                };
            });

            closeModal('uploadModal');
            renderItems();
        }

        function attachFiles() {
            if (selectedAttachments.length === 0) return;

            selectedAttachments.forEach(file => {
                const timestamp = new Date().toISOString().slice(0, 16).replace('T', '_').replace(':', '-');
                const attachmentName = `attachment_${timestamp}_${file.name}`;
                const filePath = currentPath ? `${currentPath}/${attachmentName}` : attachmentName;
                
                fileSystem[currentTab][filePath] = {
                    type: 'file',
                    name: attachmentName,
                    size: file.size,
                    lastModified: new Date(file.lastModified),
                    created: new Date(),
                    path: filePath,
                    parentPath: currentPath,
                    file: file,
                    isAttachment: true
                };
            });

            closeModal('attachmentModal');
            renderItems();
        }

        function navigateToFolder(path) {
            currentPath = path;
            renderBreadcrumb();
            renderItems();
        }

        function renderBreadcrumb() {
            const breadcrumb = document.getElementById('breadcrumb');
            if (!breadcrumb) return;
            
            const tabNames = {
                'tenants': 'Tenants Documents',
                'contracts': 'Contracts', 
                'templates': 'Templates'
            };
            
            let html = `<span class="breadcrumb-item" onclick="navigateToFolder('')">${tabNames[currentTab]}</span>`;
            
            if (currentPath) {
                const pathParts = currentPath.split('/');
                let buildPath = '';
                
                pathParts.forEach((part, index) => {
                    buildPath += (index > 0 ? '/' : '') + part;
                    html += ` <span>></span> <span class="breadcrumb-item" onclick="navigateToFolder('${buildPath}')">${part}</span>`;
                });
            }
            
            breadcrumb.innerHTML = html;
        }

        function renderItems() {
            const container = document.getElementById('itemsContainer');
            if (!container) return;
            
            let items = Object.values(fileSystem[currentTab]).filter(item => {
                if (item.parentPath !== currentPath) return false;
                
                if (selectedType !== 'All Types') {
                    if (selectedType === 'Folders' && item.type !== 'folder') return false;
                    if (selectedType === 'Documents' && (item.type !== 'file' || !['pdf', 'doc', 'docx', 'txt', 'xls', 'xlsx'].includes(item.name.toLowerCase().split('.').pop()))) return false;
                    if (selectedType === 'Images' && (item.type !== 'file' || !['jpg', 'jpeg', 'png', 'gif', 'svg'].includes(item.name.toLowerCase().split('.').pop()))) return false;
                }
                
                return true;
            });

            if (items.length === 0) {
                const emptyMessages = {
                    'tenants': { icon: 'fa-users', title: 'No tenant documents yet', desc: 'Upload tenant-related documents to get started' },
                    'contracts': { icon: 'fa-file-contract', title: 'No contracts yet', desc: 'Upload contract documents to get started' },
                    'templates': { icon: 'fa-file-lines', title: 'No templates yet', desc: 'Upload document templates to get started' }
                };
                
                const message = emptyMessages[currentTab];
                container.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-icon"><i class="fa-solid ${message.icon}"></i></div>
                        <h3>${message.title}</h3>
                        <p>${message.desc}</p>
                    </div>
                `;
                return;
            }

            items.sort((a, b) => {
                if (a.type !== b.type) {
                    return a.type === 'folder' ? -1 : 1;
                }
                return a.name.localeCompare(b.name);
            });

            let html = '';

            items.forEach(item => {
                const isFolder = item.type === 'folder';
                const fileType = isFolder ? { icon: '<i class="fa-solid fa-folder"></i>', class: 'folder-icon', type: 'folder' } : getFileType(item.name);
                const dateStr = item.created.toLocaleDateString();
                const sizeStr = isFolder ? '—' : formatFileSize(item.size);
                const clickAction = isFolder ? `navigateToFolder('${item.path}')` : `openFile('${item.path}')`;
                const attachmentIndicator = item.isAttachment ? ' 📎' : '';

                html += `
                    <div class="list-item" onclick="${clickAction}">
                        <div class="item-icon ${fileType.class}">${fileType.icon}</div>
                        <div class="item-info">
                            <div class="item-name">${item.name}${attachmentIndicator}</div>
                            <div class="item-meta">Modified: ${dateStr}</div>
                        </div>
                        <div class="item-size">${sizeStr}</div>
                    </div>
                `;
            });

            container.innerHTML = html;
        }

        function openFile(filePath) {
            const file = fileSystem[currentTab][filePath];
            if (file && file.file) {
                const url = URL.createObjectURL(file.file);
                window.open(url, '_blank');
                setTimeout(() => URL.revokeObjectURL(url), 1000);
            } else {
                alert('File cannot be opened - this is a sample file');
            }
        }