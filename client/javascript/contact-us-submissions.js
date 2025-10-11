        import fetchCompanyDetails from '../api/loadCompanyInfo.js';

        let submissions = [];
        const API_BASE_URL = '/api/v1';

        async function loadDynamicCompanyInfo() {
            try {
                const company = await fetchCompanyDetails();
                if (!company) return;

                if (company.company_name) {
                    document.title = 'Contact Submissions';
                }

                try {
                    const icons = document.querySelectorAll('link[rel~="icon"]');
                    if (icons && icons.length) {
                        icons.forEach(link => {
                            
                            if (company.icon_logo_url) link.href = company.icon_logo_url;
                            else if (company.alt_logo_url) link.href = company.alt_logo_url;
                        });
                    } else {
                        
                        const link = document.createElement('link');
                        link.rel = 'icon';
                        link.type = 'image/png';
                        link.href = company.icon_logo_url || company.alt_logo_url || '/assets/favicon/favicon-32x32.png';
                        document.head.appendChild(link);
                    }
                } catch (e) {
                    console.warn('Failed to set favicon', e);
                }

                
                try {
                    const logoContainer = document.getElementById('companyLogo');
                    if (logoContainer && company.logoHtml) {
                        logoContainer.innerHTML = company.logoHtml;
                    }
                } catch (e) {
                    
                }
            } catch (err) {
                console.warn('Could not load company details:', err);
            }
        }

        
        
        var currentPage = 1;
        var pageLimit = 10;
        var totalItems = 0;
        
        var serverStats = null;

        async function fetchSubmissions(page = 1) {
            try {
                currentPage = page || 1;

                
                const search = document.getElementById('searchInput') ? document.getElementById('searchInput').value.trim() : '';
                const status = document.getElementById('statusFilter') ? document.getElementById('statusFilter').value : '';
                const type = document.getElementById('typeFilter') ? document.getElementById('typeFilter').value : '';

                const params = new URLSearchParams();
                params.set('page', String(currentPage));
                params.set('limit', String(pageLimit));
                if (search) params.set('search', search);
                if (status) params.set('status', status);
                if (type) params.set('type', type);

                const url = `${API_BASE_URL}/contact-us?${params.toString()}`;
                const res = await fetch(url);
                if (!res.ok) throw new Error('Failed to fetch submissions');
                const data = await res.json();

                
                serverStats = data.stats || data.totals || data.counts || null;

                
                submissions = Array.isArray(data.submissions) ? data.submissions : (Array.isArray(data) ? data : (data.submissions || []));
                totalItems = typeof data.total === 'number' ? data.total : (data.totalCount || submissions.length);
                pageLimit = typeof data.limit === 'number' ? data.limit : pageLimit;

                filteredSubmissions = [...submissions];
                updateStats();
                loadSubmissions();
                renderPagination();
            } catch (err) {
                showNotification('Error loading submissions: ' + err.message, 'error');
                submissions = [];
                filteredSubmissions = [];
                totalItems = 0;
                updateStats();
                loadSubmissions();
                renderPagination();
            }
        }
        var currentSubmission = null;
        var currentSort = { column: null, direction: 'asc' };
        var filteredSubmissions = [...submissions];

        var emailTemplates = {
            "product-support": {
                subject: "Re: Product Inquiry - Detailed Information",
                message: "Dear [Customer Name],\n\nThank you for your interest in our premium subscription plans. I'm happy to provide you with the detailed information you requested.\n\nOur premium plans include:\n- Advanced features and functionality\n- Priority customer support\n- Extended storage options\n- Enterprise-level security\n\nFor detailed pricing and bulk discount information, I've attached our pricing guide. I'd also be happy to schedule a call to discuss your specific needs and how we can best serve your organization.\n\nPlease let me know if you have any questions or would like to proceed with a consultation.\n\nBest regards,\n[Your Name]\nCustomer Success Team"
            },
            "technical-support": {
                subject: "Re: Technical Issue - Resolution Steps",
                message: "Dear [Customer Name],\n\nThank you for contacting our technical support team. I understand you're experiencing issues, and I'm here to help resolve this for you.\n\nBased on your description, here are the steps we recommend:\n\n1. Clear your browser cache and cookies\n2. Try logging in using an incognito/private browsing window\n3. Ensure you're using the correct login URL\n4. Check if caps lock is enabled when entering your password\n\nIf these steps don't resolve the issue, please don't hesitate to reach out. We can also schedule a screen-sharing session to work through this together.\n\nOur technical team is available Monday-Friday 9AM-6PM EST for additional support.\n\nBest regards,\n[Your Name]\nTechnical Support Team"
            },
            "billing": {
                subject: "Re: Billing Question - Account Review",
                message: "Dear [Customer Name],\n\nThank you for reaching out regarding your billing inquiry. I've reviewed your account and can see the charges you're referring to.\n\nI've identified the duplicate charge and have initiated a refund for the incorrect billing. You should see the refund processed within 3-5 business days. I've also added a credit to your account as an apology for the inconvenience.\n\nI've reviewed your billing settings to prevent this from happening again. If you have any additional questions about your account or billing, please don't hesitate to contact us.\n\nBest regards,\n[Your Name]\nBilling Support Team"
            },
            "general": {
                subject: "Re: Your Inquiry - We're Here to Help",
                message: "Dear [Customer Name],\n\nThank you for contacting us and for your suggestion about adding a dark mode option. We really appreciate feedback from users like you!\n\nI'm pleased to let you know that dark mode is actually on our development roadmap for the next quarter. Your feedback helps us prioritize features that matter most to our users.\n\nI'll make sure to add you to our beta testing list so you can try out the dark mode feature before it's officially released.\n\nWe value your feedback and are always looking for ways to improve our service. If you have any additional questions or suggestions, please don't hesitate to contact us.\n\nBest regards,\n[Your Name]\nCustomer Service Team"
            }
        };

        function showNotification(message, type = 'success') {
            var notification = document.getElementById('notification');
            var notificationText = document.getElementById('notificationText');
            
            notificationText.textContent = message;
            
            if (type === 'error') {
                notification.style.background = 'linear-gradient(135deg, var(--error-color) 0%, #dc2626 100%)';
            } else {
                notification.style.background = 'linear-gradient(135deg, var(--success-color) 0%, #059669 100%)';
            }
            
            notification.classList.add('show');
            
            setTimeout(function() {
                notification.classList.remove('show');
            }, 4000);
        }

        function updateStats() {
            
            var pageTotal = submissions.length;
            var pagePending = submissions.filter(function(s) {
                var status = (s.status || '').toLowerCase();
                return status === 'pending' || status === 'pending response' || status === 'new';
            }).length;
            var pageResponded = submissions.filter(function(s) {
                var status = (s.status || '').toLowerCase();
                return status === 'responded' || status === 'replied' || status === 'resolved';
            }).length;
            var pageResponseRate = pageTotal > 0 ? Math.round((pageResponded / pageTotal) * 100) : 0;

            
            document.getElementById('totalCount').textContent = pageTotal;
            document.getElementById('pendingCount').textContent = pagePending;
            document.getElementById('respondedCount').textContent = pageResponded;
            document.getElementById('responseRate').textContent = pageResponseRate + '%';

            
            if (serverStats && (typeof serverStats.total === 'number' || typeof serverStats.pending === 'number' || typeof serverStats.responded === 'number')) {
                var sTotal = serverStats.total || totalItems || pageTotal;
                var sPending = serverStats.pending || serverStats.pendingCount || (serverStats.statusCounts && serverStats.statusCounts.pending) || pagePending;
                var sResponded = serverStats.responded || serverStats.replied || serverStats.respondedCount || (serverStats.statusCounts && serverStats.statusCounts.responded) || pageResponded;
                document.getElementById('totalCount').textContent = sTotal;
                document.getElementById('pendingCount').textContent = sPending;
                document.getElementById('respondedCount').textContent = sResponded;
                var sRate = sTotal > 0 ? Math.round((sResponded / sTotal) * 100) : 0;
                document.getElementById('responseRate').textContent = sRate + '%';
                return;
            }

            
            var total = typeof totalItems === 'number' && totalItems >= 0 ? totalItems : pageTotal;
            if (!total || total <= pageTotal) {
                
                return;
            }

            (async function fetchAggregatedCounts() {
                try {
                    const perPage = 1000; 
                    const pages = Math.max(1, Math.ceil(total / perPage));

                    var aggPending = 0;
                    var aggResponded = 0;

                    for (let p = 1; p <= pages; p++) {
                        const params = new URLSearchParams();
                        params.set('page', String(p));
                        params.set('limit', String(perPage));
                        const url = `${API_BASE_URL}/contact-us?${params.toString()}`;
                        const res = await fetch(url);
                        if (!res.ok) throw new Error('Failed to fetch page ' + p + ' for aggregated stats');
                        const data = await res.json();
                        const rows = Array.isArray(data.submissions) ? data.submissions : (Array.isArray(data) ? data : (data.submissions || []));
                        rows.forEach(function(s) {
                            const st = (s.status || '').toLowerCase();
                            if (st === 'pending' || st === 'pending response' || st === 'new') aggPending++;
                            else if (st === 'responded' || st === 'replied' || st === 'resolved') aggResponded++;
                        });
                    }

                    
                    var finalTotal = total;
                    document.getElementById('totalCount').textContent = finalTotal;
                    document.getElementById('pendingCount').textContent = aggPending;
                    document.getElementById('respondedCount').textContent = aggResponded;
                    var finalRate = finalTotal > 0 ? Math.round((aggResponded / finalTotal) * 100) : 0;
                    document.getElementById('responseRate').textContent = finalRate + '%';
                } catch (err) {
                    console.warn('Aggregated stats load failed:', err);
                }
            })();
        }

        function clearFilters() {
            document.getElementById('searchInput').value = '';
            document.getElementById('statusFilter').value = '';
            document.getElementById('typeFilter').value = '';
            filterSubmissions();
            showNotification('Filters cleared successfully!');
        }

        function filterSubmissions() {
            var searchTerm = document.getElementById('searchInput').value.toLowerCase();
            var statusFilter = document.getElementById('statusFilter').value;
            var typeFilter = document.getElementById('typeFilter').value;

            filteredSubmissions = submissions.filter(function(submission) {
                
                var fullName = ((submission.first_name || '') + ' ' + (submission.last_name || '')).toLowerCase();
                var matchesSearch = !searchTerm || 
                    fullName.includes(searchTerm) ||
                    (submission.email || '').toLowerCase().includes(searchTerm) ||
                    (submission.subject || '').toLowerCase().includes(searchTerm) ||
                    (submission.message || '').toLowerCase().includes(searchTerm);
                    
                var matchesStatus = !statusFilter || submission.status === statusFilter;
                var matchesType = !typeFilter || submission.type === typeFilter;
                
                return matchesSearch && matchesStatus && matchesType;
            });

            loadSubmissions();
        }

        function sortTable(column) {
            var direction = currentSort.column === column && currentSort.direction === 'asc' ? 'desc' : 'asc';
            currentSort = { column: column, direction: direction };

            
            document.querySelectorAll('th').forEach(function(th) {
                th.classList.remove('sort-asc', 'sort-desc');
            });
            document.querySelector('th[onclick="sortTable(\'' + column + '\')"]').classList.add('sort-' + direction);

            filteredSubmissions.sort(function(a, b) {
                var aVal = a[column];
                var bVal = b[column];
                
                if (column === 'date') {
                    aVal = new Date(aVal);
                    bVal = new Date(bVal);
                }
                
                if (aVal < bVal) return direction === 'asc' ? -1 : 1;
                if (aVal > bVal) return direction === 'asc' ? 1 : -1;
                return 0;
            });

            loadSubmissions();
        }

        function loadSubmissions() {
            var tbody = document.querySelector('#submissionsTable tbody');
            var noResults = document.getElementById('noResults');
            tbody.innerHTML = '';

            if (filteredSubmissions.length === 0) {
                noResults.style.display = 'block';
                return;
            } else {
                noResults.style.display = 'none';
            }

            filteredSubmissions.forEach(function(submission, index) {
                var row = tbody.insertRow();
                
                var fullName = (submission.first_name || '') + (submission.last_name ? ' ' + submission.last_name : '');
                
                var formattedDate = submission.submitted_at ? new Date(submission.submitted_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                }) : '';
                
                var subject = submission.subject ? (submission.subject.length > 40 ? submission.subject.substring(0, 40) + '...' : submission.subject) : '';
                
                var statusText = submission.status ? submission.status.charAt(0).toUpperCase() + submission.status.slice(1) : '';
                var statusClass = submission.status ? 'status-' + submission.status.toLowerCase().replace(' ', '-') : '';
                
                var startIndex = Math.max(0, (Number(currentPage || 1) - 1) * Number(pageLimit || 10));
                row.innerHTML =
                    '<td>' + (startIndex + index + 1) + '</td>' +
                    '<td><strong>' + fullName + '</strong></td>' +
                    '<td>' + (submission.email || '') + '</td>' +
                    '<td>' + subject + '</td>' +
                    '<td>' + formattedDate + '</td>' +
                    '<td><span class="status-badge ' + statusClass + '">' + statusText + '</span></td>' +
                    '<td><button class="view-btn" onclick="openModal(' + submission.id + ')"><i class="fas fa-eye"></i> View</button></td>';
            });
        }

        function renderPagination() {
            const container = document.getElementById('pagination');
            if (!container) return;

            container.innerHTML = '';
            const totalPages = Math.max(1, Math.ceil((totalItems || 0) / pageLimit));

            const prev = document.createElement('button');
            prev.textContent = '‹ Prev';
            prev.className = 'btn';
            prev.disabled = currentPage <= 1;
            prev.onclick = () => changePage(currentPage - 1);
            container.appendChild(prev);

            
            const maxButtons = 7;
            let start = Math.max(1, currentPage - Math.floor(maxButtons / 2));
            let end = Math.min(totalPages, start + maxButtons - 1);
            if (end - start < maxButtons - 1) start = Math.max(1, end - maxButtons + 1);

            for (let p = start; p <= end; p++) {
                const btn = document.createElement('button');
                btn.textContent = String(p);
                btn.className = 'btn';
                if (p === currentPage) {
                    btn.disabled = true;
                    btn.style.fontWeight = '700';
                } else {
                    btn.onclick = (() => changePage(p));
                }
                container.appendChild(btn);
            }

            const next = document.createElement('button');
            next.textContent = 'Next ›';
            next.className = 'btn';
            next.disabled = currentPage >= totalPages;
            next.onclick = () => changePage(currentPage + 1);
            container.appendChild(next);
        }

        function changePage(page) {
            if (page < 1) page = 1;
            const totalPages = Math.max(1, Math.ceil((totalItems || 0) / pageLimit));
            if (page > totalPages) page = totalPages;
            fetchSubmissions(page);
        }

        function openModal(id) {
            currentSubmission = submissions.find(function(s) { return s.id === id; });
            if (!currentSubmission) return;

            
            var fullName = (currentSubmission.first_name || '') + (currentSubmission.last_name ? ' ' + currentSubmission.last_name : '');
            document.getElementById('modalName').textContent = fullName;
            document.getElementById('modalEmail').textContent = currentSubmission.email || '';
            document.getElementById('modalSubject').textContent = currentSubmission.subject || '';
            document.getElementById('modalType').textContent = currentSubmission.type || '';
            document.getElementById('modalDate').textContent = currentSubmission.submitted_at ? new Date(currentSubmission.submitted_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }) : '';
            document.getElementById('modalId').textContent = '#' + currentSubmission.id;
            document.getElementById('modalMessage').textContent = currentSubmission.message || '';
            document.getElementById('statusSelect').value = currentSubmission.status || '';

            document.getElementById('replySubject').value = 'Re: ' + (currentSubmission.subject || '');
            document.getElementById('templateSelect').value = '';
            document.getElementById('replyMessage').value = '';
            document.getElementById('templateInfo').style.display = 'none';

            document.getElementById('submissionModal').classList.add('show');
        }

        function closeModal() {
            document.getElementById('submissionModal').classList.remove('show');
            currentSubmission = null;
        }

        function updateStatus() {
            if (!currentSubmission) return;
            
            var newStatus = document.getElementById('statusSelect').value;
            var oldStatus = currentSubmission.status;
            currentSubmission.status = newStatus;
            
            
            var submissionIndex = submissions.findIndex(function(s) { return s.id === currentSubmission.id; });
            if (submissionIndex !== -1) {
                submissions[submissionIndex].status = newStatus;
                filterSubmissions(); 
                updateStats();
                
                if (oldStatus !== newStatus) {
                    showNotification('Status updated successfully!');
                }
            }
        }

        function loadTemplate() {
            var templateSelect = document.getElementById('templateSelect');
            var selectedTemplate = templateSelect.value;
            var replyMessage = document.getElementById('replyMessage');
            var replySubject = document.getElementById('replySubject');
            var templateInfo = document.getElementById('templateInfo');

            if (selectedTemplate && emailTemplates[selectedTemplate]) {
                var template = emailTemplates[selectedTemplate];
                var fullName = (currentSubmission.first_name || '') + (currentSubmission.last_name ? ' ' + currentSubmission.last_name : '');
                replySubject.value = template.subject;
                replyMessage.value = template.message.replace('[Customer Name]', fullName);
                templateInfo.style.display = 'block';
            } else if (selectedTemplate === 'custom') {
                replySubject.value = 'Re: ' + (currentSubmission.subject || '');
                replyMessage.value = '';
                templateInfo.style.display = 'none';
            } else {
                templateInfo.style.display = 'none';
            }
        }

        function sendResponse() {
            var subject = document.getElementById('replySubject').value.trim();
            var message = document.getElementById('replyMessage').value.trim();
            var sendBtn = document.querySelector('.send-btn');

            if (!subject || !message) {
                showNotification('Please fill in both subject and message before sending.', 'error');
                return;
            }

            
            sendBtn.disabled = true;
            sendBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>Sending...';

            
            setTimeout(function() {
                showNotification('Email sent successfully to ' + currentSubmission.email + '!');

                
                if (currentSubmission.status === 'Pending Response') {
                    currentSubmission.status = 'Responded';
                    document.getElementById('statusSelect').value = 'Responded';
                    
                    var submissionIndex = submissions.findIndex(function(s) { return s.id === currentSubmission.id; });
                    if (submissionIndex !== -1) {
                        submissions[submissionIndex].status = 'Responded';
                        filterSubmissions();
                        updateStats();
                    }
                }

                
                document.getElementById('replySubject').value = 'Re: ' + (currentSubmission.subject || '');
                document.getElementById('replyMessage').value = '';
                document.getElementById('templateSelect').value = '';
                document.getElementById('templateInfo').style.display = 'none';

                
                sendBtn.disabled = false;
                sendBtn.innerHTML = '<i class="fas fa-paper-plane"></i>Send Response';
            }, 2000);
        }

        
        document.getElementById('submissionModal').addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal();
            }
        });

        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeModal();
            }
        });

        
        var draftTimer;
        document.getElementById('replyMessage').addEventListener('input', function() {
            clearTimeout(draftTimer);
            draftTimer = setTimeout(function() {
                console.log('Draft saved automatically');
            }, 2000);
        });

        
        function init() {
            
            loadDynamicCompanyInfo();
            fetchSubmissions();
            
        }

        init();

        window.openModal = openModal;   
        window.closeModal = closeModal;
        window.filterSubmissions = filterSubmissions;
        window.clearFilters = clearFilters;
        window.sortTable = sortTable;
        window.updateStatus = updateStatus;