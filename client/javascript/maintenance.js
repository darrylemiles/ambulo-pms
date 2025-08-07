// Global variables
let tickets = [];
let allTickets = [];
let currentlyExpandedTicket = null;

let minDate = null;
let maxDate = null;
let currentFromDate = null;
let currentToDate = null;

// Global variables for tenant data
let tenantsList = [];
let filteredTenants = [];
let selectedTenantIndex = -1;

document.addEventListener('DOMContentLoaded', function() {
    const profileBtn = document.getElementById('profileBtnIcon');
    const dropdownMenu = document.getElementById('dropdownMenu');

    if (profileBtn && dropdownMenu) {
        profileBtn.addEventListener('click', function() {
            dropdownMenu.style.display = dropdownMenu.style.display === 'block' ? 'none' : 'block';
        });

        document.addEventListener('click', function(event) {
            if (!profileBtn.contains(event.target) && !dropdownMenu.contains(event.target)) {
                dropdownMenu.style.display = 'none';
            }
        });
    }

    loadTickets();

    setInterval(checkAndUpdateTicketStatuses, 1 * 60 * 1000); // Check every minute
    setTimeout(checkAndUpdateTicketStatuses, 2000); // Initial check after 2 seconds

    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', filterTickets);
    }

    initializeDatePickers();

    initializeFileUpload();
    initializeModal();

    handleSidebarToggle();
    
    // If you have a sidebar toggle button, add event listener
    const sidebarToggle = document.querySelector('.mobile-menu-btn') || 
                         document.querySelector('.sidebar-toggle') ||
                         document.querySelector('[data-sidebar-toggle]');
    
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function() {
            const mainContent = document.getElementById('mainContent');
            const isExpanded = mainContent.classList.contains('expanded');
            
            if (isExpanded) {
                mainContent.classList.remove('expanded');
            } else {
                mainContent.classList.add('expanded');
            }
        });
    }

    // Auto-detect sidebar state on load
    const sidebar = document.querySelector('.sidebar') || 
                   document.querySelector('#sidebar') ||
                   document.querySelector('[data-sidebar]');
    
    if (sidebar) {
        const sidebarRect = sidebar.getBoundingClientRect();
        const isVisible = sidebarRect.width > 0 && window.getComputedStyle(sidebar).visibility !== 'hidden';
        
        const mainContent = document.getElementById('mainContent');
        if (!isVisible) {
            mainContent.classList.add('expanded');
        }
    }
});

// Initialize date pickers with restrictions
function initializeDatePickers() {
    const fromDateInput = document.getElementById('fromDate');
    const toDateInput = document.getElementById('toDate');

    if (fromDateInput && toDateInput) {
        // Add event listeners for date changes
        fromDateInput.addEventListener('change', function() {
            currentFromDate = this.value;
            updateToDateRestrictions();
            filterTicketsByDateRange();
        });

        toDateInput.addEventListener('change', function() {
            currentToDate = this.value;
            updateFromDateRestrictions();
            filterTicketsByDateRange();
        });
    }
}

// Update date restrictions based on available ticket data
function updateDateRestrictions() {
    if (allTickets.length === 0) return;

    const createdDates = allTickets.map(ticket => {
        const createdDate = new Date(ticket.created_at);
        return createdDate;
    }).filter(date => !isNaN(date)); 

    const endDates = allTickets.map(ticket => {
        if (ticket.end_date) {
            const endDate = new Date(ticket.end_date);
            return endDate;
        }
        return null;
    }).filter(date => date !== null && !isNaN(date)); 
    if (createdDates.length === 0) return;

    // Minimum date from created_at (earliest ticket creation)
    minDate = new Date(Math.min(...createdDates));
    
    // Maximum date from end_date (latest ticket end date)
    // If no end_dates exist, fall back to latest created_at
    if (endDates.length > 0) {
        maxDate = new Date(Math.max(...endDates));
    } else {
        // Fallback to latest created_at if no end_dates are available
        maxDate = new Date(Math.max(...createdDates));
        console.log('No end_dates found, using latest created_at as maxDate');
    }

    // Format dates for input restrictions (YYYY-MM-DD)
    const minDateStr = minDate.toISOString().split('T')[0];
    const maxDateStr = maxDate.toISOString().split('T')[0];

    const fromDateInput = document.getElementById('fromDate');
    const toDateInput = document.getElementById('toDate');

    if (fromDateInput && toDateInput) {
        // Set restrictions
        fromDateInput.min = minDateStr;
        fromDateInput.max = maxDateStr;
        toDateInput.min = minDateStr;
        toDateInput.max = maxDateStr;

        // Set default values if not already set
        if (!currentFromDate) {
            currentFromDate = minDateStr;
            fromDateInput.value = minDateStr;
        }
        
        if (!currentToDate) {
            currentToDate = maxDateStr;
            toDateInput.value = maxDateStr;
        }

        // Log for debugging
        console.log(`Date restrictions set:`);
        console.log(`- From date range: ${minDateStr} (earliest created_at)`);
        console.log(`- To date range: ${maxDateStr} (latest ${endDates.length > 0 ? 'end_date' : 'created_at (fallback)'})`);
        console.log(`- Available tickets with end_date: ${endDates.length}/${allTickets.length}`);
    }
}

// Update "To" date restrictions based on "From" date selection
function updateToDateRestrictions() {
    const toDateInput = document.getElementById('toDate');
    if (toDateInput && currentFromDate) {
        // "To" date cannot be earlier than "From" date
        toDateInput.min = currentFromDate;
        
        // If current "To" date is earlier than "From" date, update it
        if (currentToDate && currentToDate < currentFromDate) {
            currentToDate = currentFromDate;
            toDateInput.value = currentFromDate;
        }
    }
}

// Update "From" date restrictions based on "To" date selection
function updateFromDateRestrictions() {
    const fromDateInput = document.getElementById('fromDate');
    if (fromDateInput && currentToDate) {
        // "From" date cannot be later than "To" date
        fromDateInput.max = currentToDate;
        
        // If current "From" date is later than "To" date, update it
        if (currentFromDate && currentFromDate > currentToDate) {
            currentFromDate = currentToDate;
            fromDateInput.value = currentToDate;
        }
    }
}

// Filter tickets based on date range
function filterTicketsByDateRange() {
    let filteredTickets = allTickets;

    // Apply search filter first if there's a search term
    const searchInput = document.getElementById('searchInput');
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    
    if (searchTerm) {
        filteredTickets = filteredTickets.filter(ticket => {
            return ticket.ticket_id?.toLowerCase().includes(searchTerm) ||
                   ticket.ticket_title?.toLowerCase().includes(searchTerm) ||
                   ticket.description?.toLowerCase().includes(searchTerm) ||
                   ticket.assigned_to?.toLowerCase().includes(searchTerm) ||
                   ticket.user_id?.toLowerCase().includes(searchTerm) ||
                   ticket.requested_by_name?.toLowerCase().includes(searchTerm) ||
                   ticket.requested_by_email?.toLowerCase().includes(searchTerm) ||
                   ticket.ticket_status?.toLowerCase().includes(searchTerm) ||
                   ticket.priority?.toLowerCase().includes(searchTerm) ||
                   ticket.request_type?.toLowerCase().includes(searchTerm);
        });
    }

    // Apply date range filter
    if (currentFromDate && currentToDate) {
        const fromDate = new Date(currentFromDate);
        const toDate = new Date(currentToDate);

        toDate.setHours(23, 59, 59, 999);

        filteredTickets = filteredTickets.filter(ticket => {
            const ticketCreatedDate = new Date(ticket.created_at);
            const ticketEndDate = ticket.end_date ? new Date(ticket.end_date) : null;
            
            const createdInRange = ticketCreatedDate >= fromDate && ticketCreatedDate <= toDate;
            const endInRange = ticketEndDate && (ticketEndDate >= fromDate && ticketEndDate <= toDate);
            const spansRange = ticketCreatedDate <= fromDate && ticketEndDate && ticketEndDate >= toDate;
            
            return createdInRange || endInRange || spansRange;
        });
    }

    tickets = filteredTickets;
    renderTickets();
    updateFilterStatus();
}

// Update filter status display
function updateFilterStatus() {
    const fromDateInput = document.getElementById('fromDate');
    const toDateInput = document.getElementById('toDate');
    
    if (fromDateInput && toDateInput && currentFromDate && currentToDate) {
        const fromDate = new Date(currentFromDate);
        const toDate = new Date(currentToDate);
        
        const fromFormatted = fromDate.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
        
        const toFormatted = toDate.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });

        // Update the display values
        console.log(`Filtering tickets from ${fromFormatted} to ${toFormatted}`);
        console.log(`Showing ${tickets.length} of ${allTickets.length} tickets`);
        
        // Show tickets that are created, end, or span within the date range
        const activeTickets = tickets.filter(t => t.ticket_status !== 'completed').length;
        console.log(`Active tickets in range: ${activeTickets}`);
    }
}

// Update the existing filterTickets function to work with date filtering
function filterTickets() {
    filterTicketsByDateRange();
}

// Update the loadTickets function to set up date restrictions
async function loadTickets() {
    try {
        const response = await fetch('/api/v1/tickets', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include'
        });

        if (response.ok) {
            const data = await response.json();
            allTickets = data.tickets || [];
            tickets = allTickets;
            
            // Set up date restrictions after loading tickets
            updateDateRestrictions();
            
            renderTickets();
        } else {
            console.error('Failed to load tickets:', response.statusText);
            renderTickets();
        }
    } catch (error) {
        console.error('Error loading tickets:', error);
        renderTickets();
    }
}

function clearFilters() {
    const searchInput = document.getElementById('searchInput');
    const fromDateInput = document.getElementById('fromDate');
    const toDateInput = document.getElementById('toDate');
    
    if (searchInput) {
        searchInput.value = '';
    }

    if (fromDateInput && toDateInput && minDate && maxDate) {
        const minDateStr = minDate.toISOString().split('T')[0];
        const maxDateStr = maxDate.toISOString().split('T')[0];
        
        currentFromDate = minDateStr;
        currentToDate = maxDateStr;
        
        fromDateInput.value = minDateStr;
        toDateInput.value = maxDateStr;
        
        fromDateInput.min = minDateStr;
        fromDateInput.max = maxDateStr;
        toDateInput.min = minDateStr;
        toDateInput.max = maxDateStr;
    }
    
    tickets = allTickets;
    renderTickets();
}

// Add a function to get readable date range for display
function getDateRangeDisplay() {
    if (!currentFromDate || !currentToDate) return '';
    
    const fromDate = new Date(currentFromDate);
    const toDate = new Date(currentToDate);
    
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    const fromFormatted = fromDate.toLocaleDateString('en-US', options);
    const toFormatted = toDate.toLocaleDateString('en-US', options);
    
    return `${fromFormatted} - ${toFormatted}`;
}


function renderTickets() {
    const container = document.getElementById('ticketsContainer');
    if (!container) return;
    
    if (tickets.length === 0) {
        container.innerHTML = '<div class="no-tickets">No tickets found</div>';
        return;
    }
    
    const ticketRows = tickets.map(ticket => {
        const statusClass = ticket.ticket_status ? 
            `status-${ticket.ticket_status.toLowerCase().replace(/[^a-z_]/g, '')}` : 
            'status-pending';
            
        const priorityClass = ticket.priority ? 
            `priority-${ticket.priority.toLowerCase()}` : 
            'priority-medium';
            
        // Check if status is PENDING to show assign button
        const isPending = ticket.ticket_status && ticket.ticket_status.toUpperCase() === 'PENDING';
        
        return `
        <div class="ticket-item" data-ticket-id="${ticket.ticket_id}">
            <!-- Main row - ensure exact column alignment -->
            <div class="ticket-row">
                <span class="status-badge ${statusClass}">${formatStatus(ticket.ticket_status)}</span>
                <span class="ticket-title">${ticket.ticket_title || 'N/A'}</span>
                <span>${ticket.unit_no || 'N/A'}</span>
                <span class="status-badge ${priorityClass}">${formatPriority(ticket.priority)}</span>
                <span>${formatRequestType(ticket.request_type)}</span>
                <span>${formatDate(ticket.start_date) || 'Not set'}</span>
                <span>${formatDate(ticket.end_date) || 'Not set'}</span>
                
                <!-- Action buttons - Only show assign button if status is PENDING -->
                <div class="row-actions">
                    <button class="action-btn action-btn-edit" onclick="editTicket('${ticket.ticket_id}'); event.stopPropagation();" title="Edit">
                        ✏️
                    </button>
                    ${isPending ? `
                    <button class="action-btn action-btn-assign" onclick="assignTicket('${ticket.ticket_id}'); event.stopPropagation();" title="Assign">
                        👤
                    </button>
                    ` : ''}
                    <button class="action-btn action-btn-delete" onclick="deleteTicket('${ticket.ticket_id}'); event.stopPropagation();" title="Delete">
                        🗑️
                    </button>
                </div>
                
                <!-- Expand button -->
                <button class="expand-btn" onclick="toggleTicketDetails('${ticket.ticket_id}')" title="Expand Details">
                    <span class="expand-icon">▼</span>
                </button>
            </div>
            
            <!-- Expanded details with updated layout -->
            <div class="ticket-details" id="details-${ticket.ticket_id}">
                <div class="details-grid">
                    <!-- Basic Information -->
                    <div class="detail-item">
                        <strong>Ticket ID</strong>
                        <span>${ticket.ticket_id}</span>
                    </div>
                    <div class="detail-item">
                        <strong>Current Status</strong>
                        <span class="status-badge ${statusClass}">${formatStatus(ticket.ticket_status)}</span>
                    </div>
                    
                    <!-- Contact Information -->
                    <div class="detail-item">
                        <strong>Requested By</strong>
                        <span title="${ticket.requested_by_email || ''}">${ticket.requested_by_name || ticket.user_id || 'Unknown'}</span>
                    </div>
                    <div class="detail-item">
                        <strong>Assigned To</strong>
                        <span>${ticket.assigned_to || 'Unassigned'}</span>
                    </div>
                    
                    <!-- Schedule Information -->
                    <div class="detail-item">
                        <strong>Start Time</strong>
                        <span>${formatTime(ticket.start_time) || 'Not scheduled'}</span>
                    </div>
                    <div class="detail-item">
                        <strong>End Time</strong>
                        <span>${formatTime(ticket.end_time) || 'Not scheduled'}</span>
                    </div>
                    
                    <!-- Cost Information -->
                    <div class="detail-item">
                        <strong>Maintenance Cost</strong>
                        <span class="cost-display">${formatCurrency(ticket.maintenance_costs) || 'Not estimated'}</span>
                    </div>
                    <div class="detail-item">
                        <strong>Priority Level</strong>
                        <span class="status-badge ${priorityClass}">${formatPriority(ticket.priority)}</span>
                    </div>
                    
                    ${ticket.description ? `
                    <div class="detail-item full-width">
                        <strong>Description</strong>
                        <span>${ticket.description}</span>
                    </div>` : ''}
                    
                    ${ticket.notes ? `
                    <div class="detail-item full-width">
                        <strong>Additional Notes</strong>
                        <div class="notes-content">${ticket.notes}</div>
                    </div>` : ''}
                    
                    ${ticket.attachments ? `
                    <div class="detail-item full-width">
                        <strong>Attachments</strong>
                        <div class="attachments-list">
                            ${formatAttachments(ticket.attachments)}
                        </div>
                    </div>` : ''}
                </div>
                
                <!-- Date information as simple text below attachments -->
                <div class="ticket-dates-info">
                    <div class="date-info-item">
                        <span class="date-label">Created:</span>
                        <span class="date-value">${formatDateTime(ticket.created_at)}</span>
                    </div>
                    <div class="date-info-item">
                        <span class="date-label">Last Updated:</span>
                        <span class="date-value">${formatDateTime(ticket.updated_at)}</span>
                    </div>
                </div>
            </div>
        </div>
    `;
    }).join('');

    container.innerHTML = ticketRows;
    currentlyExpandedTicket = null;
}

// Add helper functions for formatting new fields
function formatTime(timeString) {
    if (!timeString) return null;
    
    // Handle both HH:MM and HH:MM:SS formats
    const timeParts = timeString.split(':');
    if (timeParts.length >= 2) {
        const hours = parseInt(timeParts[0]);
        const minutes = timeParts[1];
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours % 12 || 12;
        return `${displayHours}:${minutes} ${ampm}`;
    }
    return timeString;
}

function formatCurrency(amount) {
    if (!amount || amount === 0) return null;
    
    // Convert to number if it's a string
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    
    if (isNaN(numAmount)) return null;
    
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(numAmount);
}

function toggleTicketDetails(ticketId) {
    const details = document.getElementById(`details-${ticketId}`);
    const ticketItem = document.querySelector(`[data-ticket-id="${ticketId}"]`);
    const expandIcon = ticketItem.querySelector('.expand-icon');
    
    // Close currently expanded ticket if it's different
    if (currentlyExpandedTicket && currentlyExpandedTicket !== ticketId) {
        const currentDetails = document.getElementById(`details-${currentlyExpandedTicket}`);
        const currentTicketItem = document.querySelector(`[data-ticket-id="${currentlyExpandedTicket}"]`);
        const currentExpandIcon = currentTicketItem.querySelector('.expand-icon');
        
        // Collapse the currently expanded ticket
        currentDetails.classList.remove('expanded');
        currentExpandIcon.textContent = '▼';
        currentTicketItem.classList.remove('expanded');
        
        setTimeout(() => {
            expandTicket(ticketId, details, ticketItem, expandIcon);
        }, 100);
    } else {
        // No other ticket is expanded, or clicking the same ticket
        if (details.classList.contains('expanded')) {
            // Collapse this ticket
            details.classList.remove('expanded');
            expandIcon.textContent = '▼';
            ticketItem.classList.remove('expanded');
            currentlyExpandedTicket = null;
        } else {
            // Expand this ticket
            expandTicket(ticketId, details, ticketItem, expandIcon);
        }
    }
}

function expandTicket(ticketId, details, ticketItem, expandIcon) {
    details.classList.add('expanded');
    expandIcon.textContent = '▲';
    ticketItem.classList.add('expanded');
    currentlyExpandedTicket = ticketId;
    
    // Smooth scroll to the expanded content
    setTimeout(() => {
        details.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'nearest' 
        });
    }, 200);
}


function formatStatus(status) {
    if (!status) return '<span class="status-badge status-pending">Pending</span>';
    
    const statusLower = status.toLowerCase().replace(/[^a-z_]/g, '');
    const statusClass = `status-${statusLower}`;
    
    const statusMap = {
        'pending': 'Pending',
        'assigned': 'Assigned',
        'inprogress': 'In Progress',
        'in_progress': 'In Progress', 
        'completed': 'Completed',
        'cancelled': 'Cancelled',
        'canceled': 'Cancelled'
    };
    
    const displayText = statusMap[statusLower] || status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
    
    return displayText; // Return just the text, not wrapped in span since you already wrap it in renderTickets
}

// Add a similar function for priority (keep only this one)
function formatPriority(priority) {
    if (!priority) return 'Medium';
    
    const priorityLower = priority.toLowerCase();
    const displayText = priority.charAt(0).toUpperCase() + priority.slice(1);
    
    return displayText; // Return just the text
}

// Add function for request type
function formatRequestType(type) {
    if (!type) return 'General';
    
    const displayText = type.charAt(0).toUpperCase() + type.slice(1);
    
    return displayText; // Return just the text
}

// Add a function to periodically check and update ticket statuses
async function checkAndUpdateTicketStatuses() {
    try {
        const response = await fetch('/api/v1/tickets/update-ticket-statuses', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include'
        });
        
        if (response.ok) {
            console.log('Ticket statuses updated successfully');
            // Reload tickets to show updated statuses
            await loadTickets();
        }
    } catch (error) {
        console.error('Error updating ticket statuses:', error);
    }
}


function formatPriority(priority) {
    if (!priority) return 'Medium';
    return priority.charAt(0).toUpperCase() + priority.slice(1);
}

// Helper function to format dates
function formatDate(dateString) {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function formatDateTime(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function formatAttachments(attachments) {
    if (!attachments) return '';
    
    const attachmentsList = attachments.split(',');
    return attachmentsList.map(attachment => {
        const fileName = attachment.trim().split('/').pop();
        return `<a href="${attachment.trim()}" target="_blank" class="attachment-link">${fileName}</a>`;
    }).join(', ');
}

// Filter tickets based on search
function filterTickets() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;
    
    const searchTerm = searchInput.value.toLowerCase();

    if (searchTerm === '') {
        tickets = allTickets;
    } else {
        tickets = allTickets.filter(ticket => {
            return ticket.ticket_id?.toLowerCase().includes(searchTerm) ||
                   ticket.ticket_title?.toLowerCase().includes(searchTerm) ||
                   ticket.description?.toLowerCase().includes(searchTerm) ||
                   ticket.assigned_to?.toLowerCase().includes(searchTerm) ||
                   ticket.user_id?.toLowerCase().includes(searchTerm) ||
                   ticket.requested_by_name?.toLowerCase().includes(searchTerm) ||
                   ticket.requested_by_email?.toLowerCase().includes(searchTerm) ||
                   ticket.ticket_status?.toLowerCase().includes(searchTerm) ||
                   ticket.priority?.toLowerCase().includes(searchTerm) ||
                   ticket.request_type?.toLowerCase().includes(searchTerm);
        });
    }

    renderTickets();
}

// Clear search filters
function clearFilters() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.value = '';
        tickets = allTickets;
        renderTickets();
    }
}

function editTicket(ticketId) {
    event.stopPropagation();
    console.log(`Editing ticket: ${ticketId}`);
    alert(`Edit functionality for ticket ${ticketId} will be implemented here.`);
}

// Alternative implementation with a custom modal instead of prompt:

function showDeleteConfirmationModal(ticket) {
    const modalHtml = `
        <div class="delete-confirmation-modal" id="deleteModal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>⚠️ Confirm Deletion</h3>
                </div>
                <div class="modal-body">
                    <p>Are you sure you want to permanently delete this ticket?</p>
                    <div class="ticket-info">
                        <strong>Ticket ID:</strong> ${ticket.ticket_id}<br>
                        <strong>Title:</strong> ${ticket.ticket_title}<br>
                        <strong>Unit:</strong> ${ticket.unit_no}<br>
                        <strong>Status:</strong> ${formatStatus(ticket.ticket_status)}
                    </div>
                    <p class="warning-text">⚠️ This action cannot be undone!</p>
                </div>
                <div class="modal-actions">
                    <button type="button" class="btn-cancel" onclick="closeDeleteModal()">Cancel</button>
                    <button type="button" class="btn-danger" onclick="confirmDelete('${ticket.ticket_id}')">Delete Ticket</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

function closeDeleteModal() {
    const modal = document.getElementById('deleteModal');
    if (modal) {
        modal.remove();
    }
}

async function confirmDelete(ticketId) {
    closeDeleteModal();
    
    try {
        // Find the ticket to get its details
        const ticket = allTickets.find(t => t.ticket_id === ticketId);
        
        if (!ticket) {
            alert('Ticket not found');
            return;
        }
        
        console.log(`Deleting ticket: ${ticketId}`);
        
        const response = await fetch(`/api/v1/tickets/${ticketId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include'
        });
        
        const result = await response.json();
        
        if (response.ok) {
            alert(`✅ Ticket deleted successfully!\n\nTicket "${ticket.ticket_title}" has been permanently removed.`);
            
            // Remove from local arrays
            allTickets = allTickets.filter(t => t.ticket_id !== ticketId);
            tickets = tickets.filter(t => t.ticket_id !== ticketId);
            
            // Refresh the display
            renderTickets();
            
            // If the deleted ticket was expanded, reset the tracking
            if (currentlyExpandedTicket === ticketId) {
                currentlyExpandedTicket = null;
            }
            
            console.log(`Successfully deleted ticket: ${ticketId}`);
            
        } else {
            throw new Error(result.message || 'Failed to delete ticket');
        }
        
    } catch (error) {
        console.error('Error deleting ticket:', error);
        
        let errorMessage = 'Failed to delete ticket';
        
        if (error.message.includes('permission') || error.message.includes('authorized')) {
            errorMessage = 'You do not have permission to delete this ticket';
        } else if (error.message.includes('not found')) {
            errorMessage = 'Ticket not found or already deleted';
        } else if (error.message.includes('completed')) {
            errorMessage = 'Cannot delete completed tickets';
        } else {
            errorMessage = error.message || 'An unexpected error occurred';
        }
        
        alert(`❌ Error: ${errorMessage}\n\nPlease try again or contact support if the problem persists.`);
    }
}

// Also update the deleteTicket function to use the modal instead of prompt
async function deleteTicket(ticketId) {
    event.stopPropagation();
    
    try {
        // Find the ticket to get its details for the modal
        const ticket = allTickets.find(t => t.ticket_id === ticketId);
        
        if (!ticket) {
            alert('Ticket not found');
            return;
        }
        
        // Show the delete confirmation modal
        showDeleteConfirmationModal(ticket);
        
    } catch (error) {
        console.error('Error preparing delete confirmation:', error);
        alert('Error preparing delete confirmation. Please try again.');
    }
}
function assignTicket(ticketId) {
    event.stopPropagation();
    // TODO: Implement assign functionality - open modal to select assignee
    console.log(`Assigning ticket: ${ticketId}`);
    alert(`Assignment functionality for ticket ${ticketId} will be implemented here.`);
}

async function openNewTicketModal() {
    const modal = document.getElementById('newTicketModal');
    modal.classList.add('active');
    
    // Load tenants for autocomplete
    await loadTenants();
    
    const today = new Date().toISOString().split('T')[0];
    const startDateInput = document.getElementById('startDate');
    if (startDateInput) {
        startDateInput.min = today;
        startDateInput.value = today;
        startDateInput.removeEventListener('change', toggleTimeFields);
        startDateInput.addEventListener('change', toggleTimeFields);
        toggleTimeFields();
    }
    
    document.getElementById('newTicketForm').reset();
    resetFileUploadDisplay();
    
    const requestedByInput = document.getElementById('requestedBy');
    if (requestedByInput) {
        requestedByInput.value = '';
        requestedByInput.removeAttribute('data-tenant-id');
        requestedByInput.removeAttribute('data-tenant-email');
    }
    hideDropdown();
    
    if (startDateInput) {
        startDateInput.value = today;
        toggleTimeFields();
    }
}

function closeNewTicketModal() {
    const modal = document.getElementById('newTicketModal');
    modal.classList.remove('active');
    
    // Reset form
    document.getElementById('newTicketForm').reset();
    resetFileUploadDisplay();
}

function resetFileUploadDisplay() {
    const attachmentsArea = document.querySelector('.attachments-area span');
    if (attachmentsArea) {
        attachmentsArea.textContent = '📎 Click here to upload files or drag and drop';
        attachmentsArea.style.color = '#6b7280';
    }
}

// Update the toggleTimeFields function for smoother transition
function toggleTimeFields() {
    const startDateInput = document.getElementById('startDate');
    const startTimeGroup = document.getElementById('startTimeGroup');
    
    if (startDateInput.value) {
        startTimeGroup.style.display = 'flex';
        startTimeGroup.classList.add('visible');
        // Small delay to ensure smooth transition
        setTimeout(() => {
            startTimeGroup.style.opacity = '1';
        }, 10);
    } else {
        hideTimeFields();
    }
}

// Update hideTimeFields function
function hideTimeFields() {
    const startTimeGroup = document.getElementById('startTimeGroup');
    const startTimeInput = document.getElementById('startTime');
    
    if (startTimeGroup) {
        startTimeGroup.style.opacity = '0';
        startTimeGroup.classList.remove('visible');
        // Hide after transition
        setTimeout(() => {
            startTimeGroup.style.display = 'none';
        }, 300);
    }
    if (startTimeInput) startTimeInput.value = '';
}


// Update the form validation function to remove end_time and cost validation
function validateTicketForm(data) {
    const errors = [];
    
    if (!data.unit_no) errors.push('• Unit Number is required');
    if (!data.ticket_title) errors.push('• Ticket Title is required');
    if (!data.request_type) errors.push('• Request Type is required');
    if (!data.description) errors.push('• Description is required');
    if (!data.priority) errors.push('• Priority is required');
    if (!data.start_date) errors.push('• Start Date is required');
    
    // Validate start date is not in the past
    if (data.start_date) {
        const selectedDate = new Date(data.start_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (selectedDate < today) {
            errors.push('• Start Date cannot be in the past');
        }
    }
    
    // Validate unit number format (optional - adjust regex as needed)
    if (data.unit_no && !/^[A-Z]?\d+[A-Z]?$/i.test(data.unit_no.replace(/\s/g, ''))) {
        errors.push('• Unit Number should be in format like A101, B205, or 123');
    }
    
    return errors;
}

// Enhanced file upload functionality
function initializeFileUpload() {
    const fileInput = document.getElementById('fileInput');
    const attachmentsArea = document.querySelector('.attachments-area');
    
    if (!fileInput || !attachmentsArea) return;

    // File input change handler
    fileInput.addEventListener('change', function(e) {
        handleFileSelection(e.target.files);
    });

    // Drag and drop functionality
    attachmentsArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        this.style.borderColor = '#3b82f6';
        this.style.backgroundColor = '#f0f9ff';
    });

    attachmentsArea.addEventListener('dragleave', function(e) {
        e.preventDefault();
        this.style.borderColor = '#d1d5db';
        this.style.backgroundColor = '#fafafa';
    });

    attachmentsArea.addEventListener('drop', function(e) {
        e.preventDefault();
        this.style.borderColor = '#d1d5db';
        this.style.backgroundColor = '#fafafa';
        
        const files = e.dataTransfer.files;
        handleFileSelection(files);
        
        // Update file input
        fileInput.files = files;
    });
}

function handleFileSelection(files) {
    const attachmentsArea = document.querySelector('.attachments-area span');
    const maxSize = 10 * 1024 * 1024; // 10MB
    const validTypes = ['image/', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    
    if (!files || files.length === 0) {
        resetFileUploadDisplay();
        return;
    }
    
    let validFiles = 0;
    let fileNames = [];
    let errors = [];
    
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Check file size
        if (file.size > maxSize) {
            errors.push(`${file.name} is too large (max 10MB)`);
            continue;
        }
        
        // Check file type
        const isValidType = validTypes.some(type => file.type.startsWith(type));
        if (!isValidType) {
            errors.push(`${file.name} is not a supported file type`);
            continue;
        }
        
        validFiles++;
        fileNames.push(file.name);
    }
    
    if (errors.length > 0) {
        alert('Some files were not added:\n\n' + errors.join('\n'));
    }
    
    if (validFiles > 0) {
        const displayText = validFiles === 1 
            ? `📎 ${fileNames[0]}` 
            : `📎 ${validFiles} files selected: ${fileNames.join(', ')}`;
        
        attachmentsArea.textContent = displayText;
        attachmentsArea.style.color = '#374151';
    } else {
        resetFileUploadDisplay();
    }
}



// Load tenants when modal opens
async function loadTenants() {
    try {
        const response = await fetch('/api/v1/users?role=TENANT', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include'
        });

        if (response.ok) {
            const data = await response.json();
            tenantsList = data.users || [];
            console.log(`Loaded ${tenantsList.length} tenants for autocomplete`);
        } else {
            console.error('Failed to load tenants:', response.statusText);
            tenantsList = [];
        }
    } catch (error) {
        console.error('Error loading tenants:', error);
        tenantsList = [];
    }
}

// Initialize autocomplete functionality
function initializeAutocomplete() {
    const requestedByInput = document.getElementById('requestedBy');
    const dropdown = document.getElementById('requestedByDropdown');
    
    if (!requestedByInput || !dropdown) return;

    // Input event for filtering
    requestedByInput.addEventListener('input', function(e) {
        const query = e.target.value.toLowerCase().trim();
        
        if (query.length < 1) {
            hideDropdown();
            return;
        }
        
        filterTenants(query);
        showDropdown();
    });

    // Focus event to show dropdown if there's a value
    requestedByInput.addEventListener('focus', function(e) {
        const query = e.target.value.toLowerCase().trim();
        if (query.length >= 1) {
            filterTenants(query);
            showDropdown();
        }
    });

    // Blur event to hide dropdown (with delay for clicking)
    requestedByInput.addEventListener('blur', function(e) {
        setTimeout(() => {
            hideDropdown();
        }, 200);
    });

    // Keyboard navigation
    requestedByInput.addEventListener('keydown', function(e) {
        if (!dropdown.classList.contains('show')) return;

        const items = dropdown.querySelectorAll('.autocomplete-item');
        
        switch(e.key) {
            case 'ArrowDown':
                e.preventDefault();
                selectedTenantIndex = Math.min(selectedTenantIndex + 1, items.length - 1);
                updateHighlight(items);
                break;
                
            case 'ArrowUp':
                e.preventDefault();
                selectedTenantIndex = Math.max(selectedTenantIndex - 1, -1);
                updateHighlight(items);
                break;
                
            case 'Enter':
                e.preventDefault();
                if (selectedTenantIndex >= 0 && items[selectedTenantIndex]) {
                    selectTenant(filteredTenants[selectedTenantIndex]);
                }
                break;
                
            case 'Escape':
                hideDropdown();
                break;
        }
    });

    // Click outside to close
    document.addEventListener('click', function(e) {
        if (!requestedByInput.contains(e.target) && !dropdown.contains(e.target)) {
            hideDropdown();
        }
    });
}

// Filter tenants based on search query
function filterTenants(query) {
    filteredTenants = tenantsList.filter(tenant => {
        const name = (tenant.first_name + ' ' + tenant.last_name).toLowerCase();
        const email = tenant.email.toLowerCase();
        const unit = tenant.unit_no ? tenant.unit_no.toLowerCase() : '';
        
        return name.includes(query) || 
               email.includes(query) || 
               unit.includes(query);
    });
    
    selectedTenantIndex = -1;
    renderDropdown();
}

// Render dropdown with filtered results
function renderDropdown() {
    const dropdown = document.getElementById('requestedByDropdown');
    
    if (filteredTenants.length === 0) {
        dropdown.innerHTML = '<div class="autocomplete-no-results">No tenants found</div>';
        return;
    }
    
    const html = filteredTenants.map((tenant, index) => `
        <div class="autocomplete-item" 
             data-index="${index}"
             onclick="selectTenant(filteredTenants[${index}])">
            <div class="tenant-name">${tenant.first_name} ${tenant.last_name}</div>
            <div class="tenant-email">${tenant.email}</div>
            ${tenant.unit_no ? `<div class="tenant-unit">Unit: ${tenant.unit_no}</div>` : ''}
        </div>
    `).join('');
    
    dropdown.innerHTML = html;
}

// Update keyboard highlight
function updateHighlight(items) {
    items.forEach((item, index) => {
        item.classList.toggle('highlighted', index === selectedTenantIndex);
    });
}

// Select a tenant
function selectTenant(tenant) {
    const requestedByInput = document.getElementById('requestedBy');
    const displayName = `${tenant.first_name} ${tenant.last_name}`;
    
    requestedByInput.value = displayName;
    requestedByInput.setAttribute('data-tenant-id', tenant.user_id);
    requestedByInput.setAttribute('data-tenant-email', tenant.email);
    
    hideDropdown();
}

// Show dropdown
function showDropdown() {
    const dropdown = document.getElementById('requestedByDropdown');
    dropdown.classList.add('show');
}

// Hide dropdown
function hideDropdown() {
    const dropdown = document.getElementById('requestedByDropdown');
    dropdown.classList.remove('show');
    selectedTenantIndex = -1;
}



// Keep ONLY this version of submitNewTicket (the more complete one)
async function submitNewTicket(event) {
    event.preventDefault();
    
    const form = document.getElementById('newTicketForm');
    const submitBtn = document.querySelector('.btn-submit');
    
    // Get form values
    const formData = new FormData(form);
    const requestedByInput = document.getElementById('requestedBy');
    
    const ticketData = {
        unit_no: formData.get('unit_no').trim(),
        ticket_title: formData.get('ticket_title').trim(),
        request_type: formData.get('request_type'),
        description: formData.get('description').trim(),
        priority: formData.get('priority'),
        start_date: formData.get('start_date'),
        start_time: formData.get('start_time') || null,
        assigned_to: formData.get('assigned_to')?.trim() || null,
        notes: formData.get('notes')?.trim() || null
    };

    // Handle requested_by field
    if (requestedByInput && requestedByInput.value.trim()) {
        const tenantId = requestedByInput.getAttribute('data-tenant-id');
        if (tenantId) {
            ticketData.user_id = tenantId;
        }
    }

    // Client-side validation
    const validationErrors = validateTicketForm(ticketData);
    if (validationErrors.length > 0) {
        alert('Please fix the following errors:\n\n' + validationErrors.join('\n'));
        return;
    }

    // Build confirmation message
    let requestedByInfo = '';
    if (requestedByInput && requestedByInput.value.trim()) {
        requestedByInfo = `\nRequested By: ${requestedByInput.value.trim()}`;
    } else {
        requestedByInfo = '\nRequested By: Current User (default)';
    }

    const timeInfo = ticketData.start_time ? 
        `\nStart Time: ${formatTime(ticketData.start_time)}` : '';

    const confirmMessage = `Please confirm the ticket details:

Unit Number: ${ticketData.unit_no}
Title: ${ticketData.ticket_title}
Type: ${ticketData.request_type}
Priority: ${ticketData.priority}${requestedByInfo}
Start Date: ${new Date(ticketData.start_date).toLocaleDateString()}${timeInfo}
${ticketData.assigned_to ? `Assigned To: ${ticketData.assigned_to}` : 'Assignment: Auto-assign'}

Do you want to create this ticket?`;

    if (!confirm(confirmMessage)) {
        return;
    }

    // Disable submit button during submission
    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating Ticket...';

    try {
        const submitData = new FormData();
        
        Object.keys(ticketData).forEach(key => {
            if (ticketData[key] !== null && ticketData[key] !== undefined) {
                submitData.append(key, ticketData[key]);
            }
        });

        const fileInput = document.getElementById('fileInput');
        if (fileInput.files && fileInput.files.length > 0) {
            for (let i = 0; i < fileInput.files.length; i++) {
                const file = fileInput.files[i];
                
                if (file.size > 10 * 1024 * 1024) {
                    alert(`File "${file.name}" is too large. Maximum size is 10MB.`);
                    return;
                }
                
                submitData.append('attachments', file);
            }
        }

        console.log('Submitting ticket with data:', Object.fromEntries(submitData));

        const response = await fetch('/api/v1/tickets/create-ticket', {
            method: 'POST',
            body: submitData,
            credentials: 'include'
        });

        const result = await response.json();

        if (response.ok) {
            const timeDisplay = ticketData.start_time ? ` at ${formatTime(ticketData.start_time)}` : '';
            const requesterDisplay = requestedByInput && requestedByInput.value.trim() ? 
                ` (Requested by: ${requestedByInput.value.trim()})` : '';
            
            alert(`✅ Ticket created successfully!\n\nTicket ID: ${result.ticket_id}\nStatus: New\nScheduled: ${new Date(ticketData.start_date).toLocaleDateString()}${timeDisplay}${requesterDisplay}`);
            closeNewTicketModal();
            
            await loadTickets();
        } else {
            throw new Error(result.message || 'Failed to create ticket');
        }
    } catch (error) {
        console.error('Error creating ticket:', error);
        alert(`❌ Error creating ticket: ${error.message}\n\nPlease try again or contact support if the problem persists.`);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Create Ticket';
    }
}

function initializeModal() {
    const modal = document.getElementById('newTicketModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeNewTicketModal();
            }
        });
    }

    const newTicketForm = document.getElementById('newTicketForm');
    if (newTicketForm) {
        newTicketForm.addEventListener('submit', submitNewTicket);
    }
    
    initializeFileUpload();
    initializeAutocomplete();
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
            closeNewTicketModal();
        }
    });
}

