
// Profile dropdown functionality
document.addEventListener('DOMContentLoaded', function() {
    const profileBtn = document.getElementById('profileBtnIcon');
    const dropdownMenu = document.getElementById('dropdownMenu');

    if (profileBtn && dropdownMenu) {
        profileBtn.addEventListener('click', function() {
            dropdownMenu.style.display = dropdownMenu.style.display === 'block' ? 'none' : 'block';
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', function(event) {
            if (!profileBtn.contains(event.target) && !dropdownMenu.contains(event.target)) {
                dropdownMenu.style.display = 'none';
            }
        });
    }

    // Initialize tickets when page loads
    renderTickets();
});

// Maintenance Ticketing System
let ticketCounter = 7;
let tickets = [
    {
        id: 'AMBL-00001',
        status: 'new',
        title: 'Broken Switch',
        description: '',
        priority: 'urgent',
        requestType: 'Problem',
        assignedTo: 'Rei Buena',
        requestedBy: 'Henzel Maluto',
        buildingNo: 'Unit 101, 001'
    },
    {
        id: 'AMBL-00002',
        status: 'open',
        title: 'Broken Switch',
        description: '',
        priority: 'high',
        requestType: 'Request',
        assignedTo: 'Rei Buena',
        requestedBy: 'Henzel Maluto',
        buildingNo: 'Unit 101, 001'
    },
    {
        id: 'AMBL-00003',
        status: 'pending',
        title: 'Broken Switch',
        description: '',
        priority: 'medium',
        requestType: 'Incident',
        assignedTo: 'Rei Buena',
        requestedBy: 'Henzel Maluto',
        buildingNo: 'Unit 101, 001'
    },
    {
        id: 'AMBL-00004',
        status: 'closed',
        title: 'Broken Switch',
        description: '',
        priority: 'low',
        requestType: 'Problem',
        assignedTo: 'Rei Buena',
        requestedBy: 'Henzel Maluto',
        buildingNo: 'Unit 101, 001'
    },
    {
        id: 'AMBL-00005',
        status: 'resolved',
        title: 'Broken Switch',
        description: '',
        priority: 'low',
        requestType: 'Problem',
        assignedTo: 'Rei Buena',
        requestedBy: 'Henzel Maluto',
        buildingNo: 'Unit 101, 001'
    },
    {
        id: 'AMBL-00006',
        status: 'reopen',
        title: 'Broken Switch',
        description: '',
        priority: 'low',
        requestType: 'Incident',
        assignedTo: 'Rei Buena',
        requestedBy: 'Henzel Maluto',
        buildingNo: 'Unit 101, 001'
    }
];

function openNewTicketModal() {
    document.getElementById('newTicketModal').classList.add('active');
}

function closeNewTicketModal() {
    document.getElementById('newTicketModal').classList.remove('active');
    document.getElementById('newTicketForm').reset();
    
    // Reset attachments area
    const attachmentsArea = document.querySelector('.attachments-area span');
    if (attachmentsArea) {
        attachmentsArea.textContent = '/Add Files or Drop Files Here';
        attachmentsArea.style.color = '#9ca3af';
    }
}

function clearFilters() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.value = '';
        filterTickets();
    }
}

function viewTicket(ticketId) {
    alert(`Viewing ticket: ${ticketId}`);
}

function submitNewTicket() {
    const ticketData = {
        tenantEmail: document.getElementById('tenantEmail').value,
        title: document.getElementById('ticketTitle').value,
        description: document.getElementById('ticketDescription').value,
        priority: document.getElementById('ticketPriority').value,
        requestType: document.getElementById('requestType').value,
        requestedBy: document.getElementById('requestedBy').value,
        buildingNo: document.getElementById('buildingNo').value
    };

    // Validate required fields
    if (!ticketData.tenantEmail || !ticketData.title || !ticketData.description || 
        !ticketData.priority || !ticketData.requestType || !ticketData.requestedBy || 
        !ticketData.buildingNo) {
        alert('Please fill in all required fields');
        return;
    }

    createTicket(ticketData);
}

function createTicket(ticketData) {
    const ticketId = `AMBL-${String(ticketCounter).padStart(5, '0')}`;
    ticketCounter++;

    const newTicket = {
        id: ticketId,
        status: 'new',
        title: ticketData.title,
        description: ticketData.description,
        priority: ticketData.priority,
        requestType: ticketData.requestType,
        assignedTo: 'Rei Buena', // Default assignee
        requestedBy: ticketData.requestedBy,
        buildingNo: ticketData.buildingNo
    };

    tickets.unshift(newTicket);
    renderTickets();
    closeNewTicketModal();
    alert(`Ticket ${ticketId} created successfully!`);
}

function renderTickets() {
    const container = document.getElementById('ticketsContainer');
    if (!container) return;
    
    const ticketRows = tickets.map(ticket => `
        <div class="ticket-row" onclick="viewTicket('${ticket.id}')">
            <a href="#" class="ticket-id">${ticket.id}</a>
            <span class="status-badge status-${ticket.status}">${ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}</span>
            <span>${ticket.title}</span>
            <span>${ticket.description}</span>
            <span class="priority-${ticket.priority}">${ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}</span>
            <span>${ticket.requestType}</span>
            <span>${ticket.assignedTo}</span>
            <span>${ticket.requestedBy}</span>
            <span>${ticket.buildingNo}</span>
        </div>
    `).join('');

    const emptyRows = Array(5).fill('<div class="empty-rows"></div>').join('');
    
    container.innerHTML = ticketRows + emptyRows;
}

function filterTickets() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;
    
    const searchTerm = searchInput.value.toLowerCase();

    const filteredTickets = tickets.filter(ticket => {
        return searchTerm === '' || 
            ticket.id.toLowerCase().includes(searchTerm) ||
            ticket.title.toLowerCase().includes(searchTerm) ||
            ticket.description.toLowerCase().includes(searchTerm) ||
            ticket.assignedTo.toLowerCase().includes(searchTerm) ||
            ticket.requestedBy.toLowerCase().includes(searchTerm) ||
            ticket.status.toLowerCase().includes(searchTerm) ||
            ticket.priority.toLowerCase().includes(searchTerm) ||
            ticket.requestType.toLowerCase().includes(searchTerm);
    });

    const container = document.getElementById('ticketsContainer');
    if (!container) return;
    
    const ticketRows = filteredTickets.map(ticket => `
        <div class="ticket-row" onclick="viewTicket('${ticket.id}')">
            <a href="#" class="ticket-id">${ticket.id}</a>
            <span class="status-badge status-${ticket.status}">${ticket.status.charAt(0).toUpperCase() + ticket.status.slice(1)}</span>
            <span>${ticket.title}</span>
            <span>${ticket.description}</span>
            <span class="priority-${ticket.priority}">${ticket.priority.charAt(0).toUpperCase() + ticket.priority.slice(1)}</span>
            <span>${ticket.requestType}</span>
            <span>${ticket.assignedTo}</span>
            <span>${ticket.requestedBy}</span>
            <span>${ticket.buildingNo}</span>
        </div>
    `).join('');

    const emptyRows = Array(5).fill('<div class="empty-rows"></div>').join('');
    
    container.innerHTML = ticketRows + emptyRows;
}

document.addEventListener('DOMContentLoaded', function() {
    // Search functionality
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', filterTickets);
    }

    // File upload functionality
    const fileInput = document.getElementById('fileInput');
    if (fileInput) {
        fileInput.addEventListener('change', function(e) {
            const files = e.target.files;
            const attachmentsArea = document.querySelector('.attachments-area span');
            
            if (attachmentsArea) {
                if (files.length > 0) {
                    const fileNames = Array.from(files).map(file => file.name).join(', ');
                    attachmentsArea.textContent = `${files.length} file(s) selected: ${fileNames}`;
                    attachmentsArea.style.color = '#374151';
                } else {
                    attachmentsArea.textContent = '/Add Files or Drop Files Here';
                    attachmentsArea.style.color = '#9ca3af';
                }
            }
        });
    }

    // Drag and drop functionality
    const attachmentsArea = document.querySelector('.attachments-area');
    if (attachmentsArea) {
        attachmentsArea.addEventListener('dragover', function(e) {
            e.preventDefault();
            this.style.borderColor = '#3b82f6';
            this.style.background = '#f8fafc';
        });

        attachmentsArea.addEventListener('dragleave', function(e) {
            e.preventDefault();
            this.style.borderColor = '#d1d5db';
            this.style.background = 'white';
        });

        attachmentsArea.addEventListener('drop', function(e) {
            e.preventDefault();
            this.style.borderColor = '#d1d5db';
            this.style.background = 'white';
            
            const files = e.dataTransfer.files;
            const fileInput = document.getElementById('fileInput');
            if (fileInput) {
                fileInput.files = files;

                const event = new Event('change', { bubbles: true });
                fileInput.dispatchEvent(event);
            }
        });
    }

    // Close modal when clicking outside
    const modal = document.getElementById('newTicketModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeNewTicketModal();
            }
        });
    }

    // Prevent form submission on enter key in modal
    const newTicketForm = document.getElementById('newTicketForm');
    if (newTicketForm) {
        newTicketForm.addEventListener('submit', function(e) {
            e.preventDefault();
            submitNewTicket();
        });
    }
});