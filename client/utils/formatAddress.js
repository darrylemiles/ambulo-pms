function formatAddress(property, forSelect = false) {
  if (!property)
    return forSelect
      ? { line1: "Select an address", line2: "" }
      : "Address not available";

  if (forSelect) {
    // First line: building, street, barangay
    const line1 = [property.building_name, property.street, property.barangay]
      .filter(Boolean)
      .join(", ");

    // Second line: city, province, country
    const line2 = [property.city, property.province, property.country]
      .filter(Boolean)
      .join(", ");

    return { line1: line1 || "", line2: line2 || "" };
  } else {
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
}
export default formatAddress;