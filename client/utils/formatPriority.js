function formatPriority(priority) {
  if (!priority) return "Medium";

  const priorityLower = priority.toLowerCase();
  const displayText = priority.charAt(0).toUpperCase() + priority.slice(1);

  return displayText; 
}

export default formatPriority;