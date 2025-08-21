// Format address from backend data
function formatAddress(property) {
  const parts = [
    property.building_name,
    property.street,
    property.barangay,
    property.city,
    property.province,
    property.country,
  ].filter((part) => part && part.trim());

  return parts.length > 0 ? parts.join(", ") : "Address not available";
}

export default formatAddress;