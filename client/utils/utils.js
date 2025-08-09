/**
 * Shared utility functions for the application.
 * This module contains functions that can be used across different parts of the application.
 */


function formatTime(timeString) {
  if (!timeString) return null;

  // Handle both HH:MM and HH:MM:SS formats
  const timeParts = timeString.split(":");
  if (timeParts.length >= 2) {
    const hours = parseInt(timeParts[0]);
    const minutes = timeParts[1];
    const ampm = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes} ${ampm}`;
  }
  return timeString;
}


function formatCurrency(amount) {
  if (!amount || amount === 0) return null;

  // Convert to number if it's a string
  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;

  if (isNaN(numAmount)) return null;

  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numAmount);
}


function formatStatus(status) {
  if (!status)
    return '<span class="status-badge status-pending">Pending</span>';

  const statusLower = status.toLowerCase().replace(/[^a-z_]/g, "");
  const statusClass = `status-${statusLower}`;

  const statusMap = {
    pending: "Pending",
    assigned: "Assigned",
    inprogress: "In Progress",
    in_progress: "In Progress",
    completed: "Completed",
    cancelled: "Cancelled",
    canceled: "Cancelled",
  };

  const displayText =
    statusMap[statusLower] ||
    status.charAt(0).toUpperCase() + status.slice(1).replace("_", " ");

  return displayText; 
}


function formatPriority(priority) {
  if (!priority) return "Medium";

  const priorityLower = priority.toLowerCase();
  const displayText = priority.charAt(0).toUpperCase() + priority.slice(1);

  return displayText; // Return just the text
}

// Add function for request type
function formatRequestType(type) {
  if (!type) return "General";

  const displayText = type.charAt(0).toUpperCase() + type.slice(1);

  return displayText; // Return just the text
}


// Helper function to format dates
function formatDate(dateString) {
  if (!dateString) return null;
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatDateTime(dateString) {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatAttachments(attachments) {
  if (!attachments) return "";

  const attachmentsList = attachments.split(",");
  return attachmentsList
    .map((attachment) => {
      const fileName = attachment.trim().split("/").pop();
      return `<a href="${attachment.trim()}" target="_blank" class="attachment-link">${fileName}</a>`;
    })
    .join(", ");
}


if (typeof module !== "undefined" && module.exports) {
  // Export functions for Node.js
  module.exports = {
    formatTime,
    formatStatus,
    formatCurrency,
    formatPriority,
    formatRequestType,
    formatDate,
    formatDateTime,
    formatAttachments,
  };
} else {
  // Attach to global window object for browser usage
  window.AppUtils = {
    formatTime,
    formatStatus,
    formatPriority,
    formatRequestType,
    formatCurrency,
    formatDate,
    formatDateTime,
    formatAttachments,
  };
}