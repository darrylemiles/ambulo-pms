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

export default formatStatus;