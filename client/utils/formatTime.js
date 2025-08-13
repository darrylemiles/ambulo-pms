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

export default formatTime;