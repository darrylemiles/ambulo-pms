function formatDate(dateString, includeTime = false) {
  if (!dateString) return includeTime ? "N/A" : null;
  
  const date = new Date(dateString);
  
  if (includeTime) {
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } else {
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }
}

export default formatDate;