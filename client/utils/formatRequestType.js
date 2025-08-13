function formatRequestType(type) {
  if (!type) return "General";

  const displayText = type.charAt(0).toUpperCase() + type.slice(1);

  return displayText; 
}


export default formatRequestType;