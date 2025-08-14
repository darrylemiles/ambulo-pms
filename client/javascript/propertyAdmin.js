let properties = [];
let filteredProperties = [];
let currentEditingId = null;
let uploadedImages = [];
let editUploadedImages = [];
let currentDetailImageIndex = 0;
let currentPropertyImages = [];

// Global state for form management
let isAddingProperty = false;
let inlineFormHandler = null;

let isEditingProperty = false;
let currentEditPropertyId = null;
let editInlineFormHandler = null;

// Image showcase management for edit form
let editShowcaseImages = [];
const MAX_SHOWCASE_IMAGES = 10;
let deletedShowcaseImages = [];

// API Configuration
const API_BASE_URL = "/api/v1/properties";

// Simplified Modal System
class SimpleModal {
  constructor(modalId) {
    this.modalId = modalId;
    this.modal = null;
    this.init();
  }

  init() {
    // Create modal if it doesn't exist
    if (!document.getElementById(this.modalId)) {
      this.createModal();
    } else {
      this.modal = document.getElementById(this.modalId);
    }
    this.setupEventListeners();
  }

  createModal() {
    const modalHTML = this.getModalHTML();
    document.body.insertAdjacentHTML("beforeend", modalHTML);
    this.modal = document.getElementById(this.modalId);
  }

  setupEventListeners() {
    // Close on overlay click
    this.modal.addEventListener("click", (e) => {
      if (e.target === this.modal) {
        this.close();
      }
    });

    // Close on close button click
    const closeBtn = this.modal.querySelector(".simple-close-btn");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => this.close());
    }

    // Close on Escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.isOpen()) {
        this.close();
      }
    });
  }

  show() {
    console.log("Showing modal:", this.modalId);
    this.modal.style.display = "flex";
    this.modal.style.position = "fixed";
    this.modal.style.top = "0";
    this.modal.style.left = "0";
    this.modal.style.width = "100vw";
    this.modal.style.height = "100vh";
    this.modal.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
    this.modal.style.justifyContent = "center";
    this.modal.style.alignItems = "center";
    this.modal.style.zIndex = "999999";
    this.modal.style.opacity = "0";

    // Force reflow
    this.modal.offsetHeight;

    // Animate in
    this.modal.style.transition = "opacity 0.3s ease";
    this.modal.style.opacity = "1";

    // Prevent body scroll
    document.body.style.overflow = "hidden";

    console.log("Modal should be visible now");
  }

  close() {
    console.log("Closing modal:", this.modalId);
    this.modal.style.opacity = "0";

    setTimeout(() => {
      this.modal.style.display = "none";
      document.body.style.overflow = "auto";
    }, 300);
  }

  isOpen() {
    return this.modal.style.display === "flex";
  }

  getModalHTML() {
    // This will be overridden by specific modal types
    return `
      <div id="${this.modalId}" class="simple-modal" style="display: none;">
        <div class="simple-modal-content">
          <div class="simple-modal-header">
            <h3>Modal</h3>
            <button class="simple-close-btn">&times;</button>
          </div>
          <div class="simple-modal-body">
            <p>Modal content goes here</p>
          </div>
        </div>
      </div>
    `;
  }
}

// Add Property Modal
class AddPropertyModal extends SimpleModal {
  constructor() {
    super("simpleAddModal");
    this.uploadedImage = null;
    this.imageUploadSetup = false;
    this.addresses = []; // Store extracted addresses
    this.addressesLoaded = false;
  }

  getModalHTML() {
    return `
      <div id="${this.modalId}" class="simple-modal" style="display: none;">
        <div class="simple-modal-content" style="max-width: 900px;">
          <div class="simple-modal-header">
            <h3>Add New Property</h3>
            <button class="simple-close-btn">&times;</button>
          </div>
          <div class="simple-modal-body">
            <form id="simpleAddPropertyForm">
              <!-- Display Image Upload Section (Topmost) -->
              <div class="simple-form-group full-width" style="margin-bottom: 30px;">
                <label style="font-size: 16px; font-weight: 700; color: #1a202c; margin-bottom: 15px;">Property Display Image</label>
                <div id="imageUploadContainer" class="image-upload-container" style="border: 2px dashed #cbd5e0; border-radius: 12px; padding: 30px; text-align: center; cursor: pointer; transition: all 0.3s ease; background: #f9fafb;">
                  <div id="uploadPrompt">
                    <div class="upload-icon" style="font-size: 48px; margin-bottom: 16px; color: #9ca3af;">
                      <i class="fas fa-cloud-upload-alt"></i>
                    </div>
                    <div class="upload-text" style="font-size: 16px; font-weight: 600; color: #374151; margin-bottom: 8px;">
                      Click to upload image
                    </div>
                    <div class="upload-hint" style="font-size: 14px; color: #6b7280;">
                      Supports: JPG/JPEG, PNG (Max: 5MB)
                    </div>
                  </div>
                  <div id="imagePreview" style="display: none;">
                    <img id="previewImage" style="max-width: 100%; max-height: 200px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);" />
                    <div style="margin-top: 15px;">
                      <button type="button" id="removeImageBtn" class="simple-btn simple-btn-secondary" style="padding: 8px 16px; font-size: 12px;">
                        <i class="fas fa-trash me-1"></i> Remove Image
                      </button>
                      <button type="button" id="changeImageBtn" class="simple-btn simple-btn-primary" style="padding: 8px 16px; font-size: 12px; margin-left: 10px;">
                        <i class="fas fa-sync-alt me-1"></i> Change Image
                      </button>
                    </div>
                  </div>
                </div>
                <input type="file" id="displayImageInput" name="display_image" accept="image/*" style="display: none;">
              </div>

              <div class="simple-form-grid">
                <div class="simple-form-group">
                  <label>Property Name *</label>
                  <input type="text" name="property_name" required>
                </div>
                <div class="simple-form-group">
                  <label>Floor Area (m²) *</label>
                  <input type="number" step="0.01" name="floor_area_sqm" required>
                </div>
                <div class="simple-form-group">
                  <label>Status *</label>
                  <select name="property_status" required>
                    <option value="Available">Available</option>
                    <option value="Occupied">Occupied</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </div>
                <div class="simple-form-group">
                  <label>Monthly Rent (₱) *</label>
                  <input type="number" step="0.01" name="base_rent" required>
                </div>
                <div class="simple-form-group">
                  <label>Property Taxes (Quarterly) *</label>
                  <input type="number" step="0.01" name="property_taxes_quarterly" required>
                </div>
                <div class="simple-form-group">
                  <label>Security Deposit (Months) *</label>
                  <input type="number" step="0.1" name="security_deposit_months" value="2" required>
                </div>
                <div class="simple-form-group">
                  <label>Minimum Lease Term (Months) *</label>
                  <input type="number" name="minimum_lease_term_months" value="24" required>
                </div>
                <div class="simple-form-group">
                  <label>Address</label>
                  <div class="address-container" style="position: relative;">
                    <select name="address_id" id="addressSelect" style="width: 100%; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; background: white; font-size: 14px;">
                      <option value="">Select an existing address (optional)</option>
                    </select>
                    <div id="addressLoadingSpinner" style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); display: none;">
                      <i class="fas fa-spinner fa-spin" style="color: #6b7280;"></i>
                    </div>
                  </div>
                  <div style="margin-top: 10px;">
                    <button type="button" id="addNewAddressBtn" class="simple-btn simple-btn-outline" style="padding: 6px 12px; font-size: 12px; border: 1px solid #d1d5db;">
                      <i class="fas fa-plus me-1"></i> Add New Address
                    </button>
                  </div>
                  
                  <!-- New Address Form (Initially Hidden) -->
                  <div id="newAddressForm" style="display: none; margin-top: 15px; padding: 15px; border: 1px solid #e5e7eb; border-radius: 6px; background: #f9fafb;">
                    <h6 style="margin: 0 0 15px 0; color: #374151; font-size: 14px; font-weight: 600;">Add New Address</h6>
                    
                    <!-- First Row: Street Address and Barangay -->
                    <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 10px; margin-bottom: 10px;">
                      <input type="text" id="newStreet" placeholder="Street Address *" style="padding: 6px 10px; border: 1px solid #d1d5db; border-radius: 4px; font-size: 13px;">
                      <input type="text" id="newBarangay" placeholder="Barangay" style="padding: 6px 10px; border: 1px solid #d1d5db; border-radius: 4px; font-size: 13px;">
                    </div>
                    
                    <!-- Second Row: City and Province -->
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
                      <input type="text" id="newCity" placeholder="City *" style="padding: 6px 10px; border: 1px solid #d1d5db; border-radius: 4px; font-size: 13px;">
                      <input type="text" id="newProvince" placeholder="Province" style="padding: 6px 10px; border: 1px solid #d1d5db; border-radius: 4px; font-size: 13px;">
                    </div>
                    
                    <!-- Third Row: Postal Code and Country -->
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
                      <input type="text" id="newPostalCode" placeholder="Postal Code" style="padding: 6px 10px; border: 1px solid #d1d5db; border-radius: 4px; font-size: 13px;">
                      <input type="text" id="newCountry" placeholder="Country" value="Philippines" style="padding: 6px 10px; border: 1px solid #d1d5db; border-radius: 4px; font-size: 13px;">
                    </div>
                    
                    <div style="display: flex; gap: 8px;">
                      <button type="button" id="saveNewAddressBtn" class="simple-btn simple-btn-primary" style="padding: 6px 12px; font-size: 12px;">
                        <i class="fas fa-save me-1"></i> Save & Use Address
                      </button>
                      <button type="button" id="cancelNewAddressBtn" class="simple-btn simple-btn-secondary" style="padding: 6px 12px; font-size: 12px;">
                        <i class="fas fa-times me-1"></i> Cancel
                      </button>
                    </div>
                    
                    <small style="color: #6b7280; font-size: 11px; margin-top: 8px; display: block;">
                      * Required fields. Address will be saved to database for future use.
                    </small>
                  </div>
                  
                  <small style="color: #6b7280; font-size: 12px; margin-top: 4px; display: block;">
                    Select from existing addresses or add a new one
                  </small>
                </div>
                <div class="simple-form-group full-width">
                  <label>Description</label>
                  <textarea name="description" placeholder="Property description, amenities, etc." style="min-height: 100px;"></textarea>
                </div>
              </div>
              <div class="simple-modal-footer">
                <button type="button" id="cancelAddBtn" class="simple-btn simple-btn-secondary">
                  <i class="fas fa-times me-1"></i> Cancel
                </button>
                <button type="submit" id="submitAddBtn" class="simple-btn simple-btn-primary">
                  <i class="fas fa-plus me-1"></i> Add Property
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;
  }

  async show() {
    super.show();
    // Only setup image upload once
    if (!this.imageUploadSetup) {
      this.setupImageUpload();
      this.imageUploadSetup = true;
    }

    // Extract and load addresses from existing properties
    this.extractAddressesFromProperties();

    this.resetForm();
    this.setupFormHandlers();
  }

  extractAddressesFromProperties() {
    console.log("Extracting addresses from existing properties...");
    const addressSelect = document.getElementById("addressSelect");

    if (!addressSelect) return;

    // Clear existing options except the first one
    addressSelect.innerHTML =
      '<option value="">Select an existing address (optional)</option>';

    // Extract unique addresses from existing properties
    const uniqueAddresses = new Map();

    properties.forEach((property) => {
      // Create a unique key for the address
      const addressKey = [
        property.street,
        property.barangay,
        property.city,
        property.province,
        property.country,
      ]
        .filter((part) => part && part.trim())
        .join("|");

      if (addressKey && !uniqueAddresses.has(addressKey)) {
        uniqueAddresses.set(addressKey, {
          address_id: property.address_id,
          street_address: property.street, // Map to street_address for consistency
          barangay: property.barangay,
          city: property.city,
          province: property.province,
          postal_code: property.postal_code,
          country: property.country,
          formatted: this.formatFullAddress({
            street_address: property.street,
            barangay: property.barangay,
            city: property.city,
            province: property.province,
            postal_code: property.postal_code,
            country: property.country,
          }),
        });
      }
    });

    // Populate the select with unique addresses
    uniqueAddresses.forEach((address) => {
      const option = document.createElement("option");
      option.value = address.address_id || "";
      option.textContent = address.formatted;
      option.dataset.addressData = JSON.stringify(address);
      addressSelect.appendChild(option);
    });

    console.log(
      `Found ${uniqueAddresses.size} unique addresses from existing properties`
    );

    // Setup address form handlers
    this.setupAddressHandlers();
  }

  setupAddressHandlers() {
    const addNewAddressBtn = document.getElementById("addNewAddressBtn");
    const newAddressForm = document.getElementById("newAddressForm");
    const saveNewAddressBtn = document.getElementById("saveNewAddressBtn");
    const cancelNewAddressBtn = document.getElementById("cancelNewAddressBtn");
    const addressSelect = document.getElementById("addressSelect");

    // Show/hide new address form
    addNewAddressBtn.addEventListener("click", () => {
      newAddressForm.style.display =
        newAddressForm.style.display === "none" ? "block" : "none";
      if (newAddressForm.style.display === "block") {
        addNewAddressBtn.innerHTML =
          '<i class="fas fa-minus me-1"></i> Cancel New Address';
      } else {
        addNewAddressBtn.innerHTML =
          '<i class="fas fa-plus me-1"></i> Add New Address';
      }
    });

    // Cancel new address
    cancelNewAddressBtn.addEventListener("click", () => {
      this.clearNewAddressForm();
      newAddressForm.style.display = "none";
      addNewAddressBtn.innerHTML =
        '<i class="fas fa-plus me-1"></i> Add New Address';
    });

    // Save new address
    saveNewAddressBtn.addEventListener("click", async () => {
      const newAddress = this.collectNewAddressData();
      if (this.validateNewAddress(newAddress)) {
        await this.saveAddressToDatabase(newAddress);
      }
    });

    // When an existing address is selected, clear new address form
    addressSelect.addEventListener("change", () => {
      if (addressSelect.value) {
        this.clearNewAddressForm();
        newAddressForm.style.display = "none";
        addNewAddressBtn.innerHTML =
          '<i class="fas fa-plus me-1"></i> Add New Address';
      }
    });
  }

  collectNewAddressData() {
    return {
      street: document.getElementById("newStreet").value.trim(),
      barangay: document.getElementById("newBarangay").value.trim(),
      city: document.getElementById("newCity").value.trim(),
      province: document.getElementById("newProvince").value.trim(),
      postal_code: document.getElementById("newPostalCode").value.trim(),
      country: document.getElementById("newCountry").value.trim(),
    };
  }

  validateNewAddress(address) {
    const requiredFields = ["street", "city"];
    const missingFields = requiredFields.filter((field) => !address[field]);

    if (missingFields.length > 0) {
      alert(
        `Please fill in the following required fields: ${missingFields
          .map((f) => f.replace("_", " "))
          .join(", ")}`
      );
      return false;
    }

    return true;
  }

  async saveAddressToDatabase(newAddress) {
    const saveBtn = document.getElementById("saveNewAddressBtn");
    const originalText = saveBtn.innerHTML;

    try {
      // Show loading state
      saveBtn.disabled = true;
      saveBtn.innerHTML = '<i class="fas fa-save me-1"></i> Prepare Address';

      console.log("Preparing new address for property creation:", newAddress);

      // Instead of saving to database, just add to select dropdown with a temporary ID
      const tempId = "temp_" + Date.now();
      const addressWithTempId = {
        ...newAddress,
        address_id: tempId,
        is_new: true, // Flag to indicate this is a new address
      };

      // Add to select dropdown
      this.addNewAddressToSelect(addressWithTempId, false);
      this.clearNewAddressForm();

      // Hide form
      const newAddressForm = document.getElementById("newAddressForm");
      const addNewAddressBtn = document.getElementById("addNewAddressBtn");
      newAddressForm.style.display = "none";
      addNewAddressBtn.innerHTML =
        '<i class="fas fa-plus me-1"></i> Add New Address';

      // Show success message
      this.showAddressSuccessMessage(
        "Address prepared! It will be saved when you create the property."
      );
    } catch (error) {
      console.error("Error preparing address:", error);
      alert(`Failed to prepare address: ${error.message}`);
    } finally {
      // Restore button state
      saveBtn.disabled = false;
      saveBtn.innerHTML = originalText;
    }
  }

  addNewAddressToSelect(newAddress, isFromDatabase = false) {
    const addressSelect = document.getElementById("addressSelect");
    const formatted = this.formatFullAddress(newAddress);

    // Create new option
    const option = document.createElement("option");
    option.value = newAddress.address_id || "new_address";

    if (newAddress.is_new) {
      option.textContent = `${formatted} (New - will be created)`;
    } else if (isFromDatabase) {
      option.textContent = `${formatted} (Saved)`;
    } else {
      option.textContent = formatted;
    }

    option.dataset.addressData = JSON.stringify(newAddress);
    option.selected = true;

    // Add to select
    addressSelect.appendChild(option);
  }

  clearNewAddressForm() {
    const streetInput = document.getElementById("newStreet");
    const barangayInput = document.getElementById("newBarangay");
    const cityInput = document.getElementById("newCity");
    const provinceInput = document.getElementById("newProvince");
    const postalInput = document.getElementById("newPostalCode");
    const countryInput = document.getElementById("newCountry");

    if (streetInput) streetInput.value = "";
    if (barangayInput) barangayInput.value = "";
    if (cityInput) cityInput.value = "";
    if (provinceInput) provinceInput.value = "";
    if (postalInput) postalInput.value = "";
    if (countryInput) countryInput.value = "Philippines"; // Reset to default
  }

  formatFullAddress(address) {
    const parts = [
      address.street_address || address.street,
      address.barangay,
      address.city,
      address.province,
      address.postal_code,
      address.country,
    ].filter((part) => part && part.trim());

    return parts.length > 0 ? parts.join(", ") : "Incomplete Address";
  }

  showAddressSuccessMessage(message) {
    const notification = document.createElement("div");
    notification.style.cssText = `
      position: fixed;
      top: 80px;
      right: 20px;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
      padding: 12px 16px;
      border-radius: 6px;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
      z-index: 1000001;
      font-family: 'Poppins', sans-serif;
      font-size: 14px;
      max-width: 300px;
      animation: slideIn 0.3s ease;
    `;
    notification.innerHTML = `<i class="fas fa-check-circle me-2"></i>${message}`;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  async handleSubmit(event) {
    const submitBtn = document.getElementById("submitAddBtn");
    const originalText = submitBtn.innerHTML;

    try {
      // Show loading state
      submitBtn.disabled = true;
      submitBtn.innerHTML =
        '<i class="fas fa-spinner fa-spin me-1"></i> Adding Property...';

      console.log("Add property form submitted");

      // Create FormData
      const formData = new FormData(event.target);

      // Handle address data
      const addressSelect = document.getElementById("addressSelect");
      if (addressSelect.value && addressSelect.value !== "") {
        // Check if this is a new address (starts with 'temp_')
        if (addressSelect.value.startsWith("temp_")) {
          // Get the address data from the selected option
          const selectedOption =
            addressSelect.options[addressSelect.selectedIndex];
          const addressData = JSON.parse(selectedOption.dataset.addressData);

          // Remove the temporary ID and is_new flag
          delete addressData.address_id;
          delete addressData.is_new;

          // Add all address fields to the form data
          Object.entries(addressData).forEach(([key, value]) => {
            if (value && value.trim()) {
              formData.append(key, value);
            }
          });

          // Remove the address_id since we're creating a new address
          formData.delete("address_id");

          console.log("Including new address data in property creation");
        } else {
          // Use existing address ID
          formData.set("address_id", addressSelect.value);
          console.log("Using existing address ID:", addressSelect.value);
        }
      } else {
        // No address selected, remove address_id if it exists
        formData.delete("address_id");
      }

      // Add the uploaded image if exists
      if (this.uploadedImage) {
        formData.set("display_image", this.uploadedImage);
      }

      // Log form data for debugging
      console.log("Form data being sent:");
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }

      const response = await fetch(API_BASE_URL + "/create-property", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Property created successfully:", result);

        // Show success message
        this.showSuccessMessage("Property added successfully!");

        // Close modal and reload properties
        this.close();
        await loadProperties();
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }
    } catch (error) {
      console.error("Error creating property:", error);
      this.showErrorMessage(
        error.message || "Failed to add property. Please try again."
      );
    } finally {
      // Restore button state
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }
  }

  setupImageUpload() {
    const uploadContainer = document.getElementById("imageUploadContainer");
    const fileInput = document.getElementById("displayImageInput");
    const uploadPrompt = document.getElementById("uploadPrompt");
    const imagePreview = document.getElementById("imagePreview");
    const previewImage = document.getElementById("previewImage");
    const removeImageBtn = document.getElementById("removeImageBtn");
    const changeImageBtn = document.getElementById("changeImageBtn");

    // Create bound functions to avoid duplicate listeners
    this.handleContainerClick = (e) => {
      if (e.target === uploadContainer || e.target.closest("#uploadPrompt")) {
        fileInput.click();
      }
    };

    this.handleDragOver = (e) => {
      e.preventDefault();
      uploadContainer.style.borderColor = "#3b82f6";
      uploadContainer.style.background = "#eff6ff";
    };

    this.handleDragLeave = (e) => {
      e.preventDefault();
      uploadContainer.style.borderColor = "#cbd5e0";
      uploadContainer.style.background = "#f9fafb";
    };

    this.handleDrop = (e) => {
      e.preventDefault();
      uploadContainer.style.borderColor = "#cbd5e0";
      uploadContainer.style.background = "#f9fafb";

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        this.handleImageFile(files[0]);
      }
    };

    this.handleFileInputChange = (e) => {
      if (e.target.files.length > 0) {
        this.handleImageFile(e.target.files[0]);
      }
    };

    this.handleRemoveImage = () => {
      this.removeImage();
    };

    this.handleChangeImage = () => {
      fileInput.click();
    };

    // Add event listeners (only once)
    uploadContainer.addEventListener("click", this.handleContainerClick);
    uploadContainer.addEventListener("dragover", this.handleDragOver);
    uploadContainer.addEventListener("dragleave", this.handleDragLeave);
    uploadContainer.addEventListener("drop", this.handleDrop);
    fileInput.addEventListener("change", this.handleFileInputChange);
    removeImageBtn.addEventListener("click", this.handleRemoveImage);
    changeImageBtn.addEventListener("click", this.handleChangeImage);
  }

  handleImageFile(file) {
    // Validate file type
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
    if (!validTypes.includes(file.type)) {
      alert("Please select a valid image file (JPG, PNG, GIF)");
      return;
    }

    // Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      alert("Image size must be less than 5MB");
      return;
    }

    this.uploadedImage = file;

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const previewImage = document.getElementById("previewImage");
      const uploadPrompt = document.getElementById("uploadPrompt");
      const imagePreview = document.getElementById("imagePreview");

      previewImage.src = e.target.result;
      uploadPrompt.style.display = "none";
      imagePreview.style.display = "block";
    };
    reader.readAsDataURL(file);
  }

  removeImage() {
    this.uploadedImage = null;
    const fileInput = document.getElementById("displayImageInput");
    const uploadPrompt = document.getElementById("uploadPrompt");
    const imagePreview = document.getElementById("imagePreview");

    fileInput.value = "";
    uploadPrompt.style.display = "block";
    imagePreview.style.display = "none";
  }

  resetForm() {
    const form = document.getElementById("simpleAddPropertyForm");
    if (form) {
      form.reset();
    }
    this.removeImage();

    // Reset address select to default
    const addressSelect = document.getElementById("addressSelect");
    if (addressSelect) {
      addressSelect.value = "";
    }

    // Hide new address form
    const newAddressForm = document.getElementById("newAddressForm");
    const addNewAddressBtn = document.getElementById("addNewAddressBtn");
    if (newAddressForm) {
      newAddressForm.style.display = "none";
    }
    if (addNewAddressBtn) {
      addNewAddressBtn.innerHTML =
        '<i class="fas fa-plus me-1"></i> Add New Address';
    }
    this.clearNewAddressForm();
  }

  setupFormHandlers() {
    const form = document.getElementById("simpleAddPropertyForm");
    const cancelBtn = document.getElementById("cancelAddBtn");
    const submitBtn = document.getElementById("submitAddBtn");

    // Remove existing form handler to avoid duplicates
    form.onsubmit = null;

    // Cancel button functionality
    cancelBtn.onclick = () => {
      if (
        confirm(
          "Are you sure you want to cancel? All entered data will be lost."
        )
      ) {
        this.close();
      }
    };

    // Form submission
    form.onsubmit = async (e) => {
      e.preventDefault();
      await this.handleSubmit(e);
    };
  }

  showSuccessMessage(message) {
    // Create a temporary success notification
    const notification = document.createElement("div");
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
      padding: 15px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
      z-index: 1000000;
      font-family: 'Poppins', sans-serif;
      font-weight: 600;
      animation: slideIn 0.3s ease;
    `;
    notification.innerHTML = `<i class="fas fa-check-circle me-2"></i>${message}`;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  showErrorMessage(message) {
    // Create a temporary error notification
    const notification = document.createElement("div");
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
      color: white;
      padding: 15px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
      z-index: 1000000;
      font-family: 'Poppins', sans-serif;
      font-weight: 600;
      animation: slideIn 0.3s ease;
    `;
    notification.innerHTML = `<i class="fas fa-exclamation-circle me-2"></i>${message}`;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, 5000);
  }

  close() {
    super.close();
    this.resetForm();
  }

  // Clean up event listeners when modal is destroyed
  destroy() {
    if (this.imageUploadSetup) {
      const uploadContainer = document.getElementById("imageUploadContainer");
      const fileInput = document.getElementById("displayImageInput");
      const removeImageBtn = document.getElementById("removeImageBtn");
      const changeImageBtn = document.getElementById("changeImageBtn");

      // Remove all event listeners
      if (uploadContainer) {
        uploadContainer.removeEventListener("click", this.handleContainerClick);
        uploadContainer.removeEventListener("dragover", this.handleDragOver);
        uploadContainer.removeEventListener("dragleave", this.handleDragLeave);
        uploadContainer.removeEventListener("drop", this.handleDrop);
      }
      if (fileInput) {
        fileInput.removeEventListener("change", this.handleFileInputChange);
      }
      if (removeImageBtn) {
        removeImageBtn.removeEventListener("click", this.handleRemoveImage);
      }
      if (changeImageBtn) {
        changeImageBtn.removeEventListener("click", this.handleChangeImage);
      }

      this.imageUploadSetup = false;
    }
    super.destroy && super.destroy();
  }
}

class EditPropertyModal extends SimpleModal {
  constructor() {
    super("simpleEditModal");
    this.currentProperty = null;
  }

  getModalHTML() {
    return `
      <div id="${this.modalId}" class="simple-modal" style="display: none;">
        <div class="simple-modal-content">
          <div class="simple-modal-header">
            <h3>Edit Property</h3>
            <button class="simple-close-btn">&times;</button>
          </div>
          <div class="simple-modal-body">
            <form id="simpleEditPropertyForm">
              <div class="simple-form-grid">
                <div class="simple-form-group">
                  <label>Property Name *</label>
                  <input type="text" name="property_name" id="simpleEditPropertyName" required>
                </div>
                <div class="simple-form-group">
                  <label>Floor Area (m²) *</label>
                  <input type="number" step="0.01" name="floor_area_sqm" id="simpleEditFloorArea" required>
                </div>
                <div class="simple-form-group">
                  <label>Status *</label>
                  <select name="property_status" id="simpleEditStatus" required>
                    <option value="Available">Available</option>
                    <option value="Occupied">Occupied</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </div>
                <div class="simple-form-group">
                  <label>Monthly Rent (₱) *</label>
                  <input type="number" step="0.01" name="base_rent" id="simpleEditBaseRent" required>
                </div>
                <div class="simple-form-group">
                  <label>Property Taxes (Quarterly) *</label>
                  <input type="number" step="0.01" name="property_taxes_quarterly" id="simpleEditPropertyTaxes" required>
                </div>
                <div class="simple-form-group">
                  <label>Security Deposit (Months) *</label>
                  <input type="number" step="0.1" name="security_deposit_months" id="simpleEditSecurityDeposit" required>
                </div>
                <div class="simple-form-group">
                  <label>Minimum Lease Term (Months) *</label>
                  <input type="number" name="minimum_lease_term_months" id="simpleEditLeaseTerm" required>
                </div>
                <div class="simple-form-group">
                  <label>Address ID</label>
                  <input type="text" name="address_id" id="simpleEditAddressId" placeholder="Select Address">
                </div>
                <div class="simple-form-group full-width">
                  <label>Description</label>
                  <textarea name="description" id="simpleEditDescription" placeholder="Property description, amenities, etc."></textarea>
                </div>
              </div>
              <div class="simple-modal-footer">
                <button type="button" id="cancelEditBtn" class="simple-btn simple-btn-secondary">
                  <i class="fas fa-times me-1"></i> Cancel
                </button>
                <button type="submit" id="submitEditBtn" class="simple-btn simple-btn-primary">
                  <i class="fas fa-save me-1"></i> Update Property
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    `;
  }

  show(property) {
    this.currentProperty = property;
    super.show();
    this.populateForm(property);
    this.setupFormHandlers();
  }

  setupFormHandlers() {
    const form = document.getElementById("simpleEditPropertyForm");
    const cancelBtn = document.getElementById("cancelEditBtn");

    // Cancel button functionality
    cancelBtn.addEventListener("click", () => {
      if (
        confirm("Are you sure you want to cancel? All changes will be lost.")
      ) {
        this.close();
      }
    });

    // Form submission
    form.onsubmit = async (e) => {
      e.preventDefault();
      await this.handleSubmit(e);
    };
  }

  populateForm(property) {
    const fields = {
      simpleEditPropertyName: property.property_name,
      simpleEditFloorArea: property.floor_area_sqm,
      simpleEditStatus: mapStatusToBackend(property.status),
      simpleEditBaseRent: property.base_rent,
      simpleEditPropertyTaxes: property.property_taxes_quarterly,
      simpleEditSecurityDeposit: property.security_deposit_months,
      simpleEditLeaseTerm: property.minimum_lease_term_months,
      simpleEditAddressId: property.address_id || "",
      simpleEditDescription: property.description,
    };

    Object.entries(fields).forEach(([fieldId, value]) => {
      const field = document.getElementById(fieldId);
      if (field) {
        field.value = value || "";
      }
    });
  }

  async handleSubmit(event) {
    const submitBtn = document.getElementById("submitEditBtn");
    const originalText = submitBtn.innerHTML;

    try {
      // Show loading state
      submitBtn.disabled = true;
      submitBtn.innerHTML =
        '<i class="fas fa-spinner fa-spin me-1"></i> Updating...';

      console.log("Edit property form submitted");
      const formData = new FormData(event.target);

      const response = await fetch(
        `${API_BASE_URL}/${this.currentProperty.id}`,
        {
          method: "PATCH",
          body: formData,
        }
      );

      if (response.ok) {
        const result = await response.json();
        console.log("Property updated:", result);

        // Show success message
        this.showSuccessMessage("Property updated successfully!");

        this.close();
        await loadProperties();
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }
    } catch (error) {
      console.error("Error updating property:", error);
      this.showErrorMessage(
        error.message || "Failed to update property. Please try again."
      );
    } finally {
      // Restore button state
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }
  }

  showSuccessMessage(message) {
    // Create a temporary success notification
    const notification = document.createElement("div");
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
      padding: 15px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
      z-index: 1000000;
      font-family: 'Poppins', sans-serif;
      font-weight: 600;
    `;
    notification.innerHTML = `<i class="fas fa-check-circle me-2"></i>${message}`;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  showErrorMessage(message) {
    // Create a temporary error notification
    const notification = document.createElement("div");
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
      color: white;
      padding: 15px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
      z-index: 1000000;
      font-family: 'Poppins', sans-serif;
      font-weight: 600;
    `;
    notification.innerHTML = `<i class="fas fa-exclamation-circle me-2"></i>${message}`;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, 5000);
  }
}

// Details Modal
class DetailsModal extends SimpleModal {
  constructor() {
    super("simpleDetailsModal");
  }

  getModalHTML() {
    return `
      <div id="${this.modalId}" class="simple-modal" style="display: none;">
        <div class="simple-modal-content" style="max-width: 1000px; width: 95vw;">
          <div class="simple-modal-header">
            <h3 id="simpleDetailsTitle">Property Details</h3>
            <button class="simple-close-btn">&times;</button>
          </div>
          <div class="simple-modal-body">
            <div id="simpleDetailsContent">
              <!-- Content will be populated dynamically -->
            </div>
          </div>
        </div>
      </div>
    `;
  }

  show(property) {
    super.show();
    this.populateDetails(property);
  }

  populateDetails(property) {
    const titleElement = document.getElementById("simpleDetailsTitle");
    const contentElement = document.getElementById("simpleDetailsContent");

    if (titleElement) {
      titleElement.textContent = property.property_name;
    }

    if (contentElement) {
      contentElement.innerHTML = `
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
          <div>
            <h4 style="color: #374151; margin-bottom: 15px;">Property Information</h4>
            <div style="background: #f9fafb; padding: 20px; border-radius: 8px;">
              <div style="margin-bottom: 10px;"><strong>Name:</strong> ${
                property.property_name
              }</div>
              <div style="margin-bottom: 10px;"><strong>Location:</strong> ${
                property.location
              }</div>
              <div style="margin-bottom: 10px;"><strong>Floor Area:</strong> ${
                property.floor_area_sqm
              } m²</div>
              <div style="margin-bottom: 10px;"><strong>Status:</strong> <span style="color: ${this.getStatusColor(
                property.status
              )};">${
        property.status.charAt(0).toUpperCase() + property.status.slice(1)
      }</span></div>
              <div><strong>Property ID:</strong> ${property.id}</div>
            </div>
          </div>
          <div>
            <h4 style="color: #374151; margin-bottom: 15px;">Financial Details</h4>
            <div style="background: #f0fdf4; padding: 20px; border-radius: 8px;">
              <div style="margin-bottom: 10px;"><strong>Monthly Rent:</strong> ₱${property.base_rent.toLocaleString()}</div>
              <div style="margin-bottom: 10px;"><strong>Quarterly Tax:</strong> ₱${property.property_taxes_quarterly.toLocaleString()}</div>
              <div style="margin-bottom: 10px;"><strong>Security Deposit:</strong> ${
                property.security_deposit_months
              } months</div>
              <div><strong>Minimum Lease:</strong> ${
                property.minimum_lease_term_months
              } months</div>
            </div>
          </div>
        </div>
        <div>
          <h4 style="color: #374151; margin-bottom: 15px;">Description</h4>
          <div style="background: #fefce8; padding: 20px; border-radius: 8px;">
            ${property.description || "No description available."}
          </div>
        </div>
      `;
    }
  }

  getStatusColor(status) {
    const colors = {
      available: "#10b981",
      occupied: "#f59e0b",
      maintenance: "#ef4444",
    };
    return colors[status] || "#6b7280";
  }
}

// Initialize modals
let addPropertyModal, editPropertyModal, detailsModal;

// Initialize the application
document.addEventListener("DOMContentLoaded", function () {
  console.log("DOM loaded, initializing...");
  loadProperties();
  setupEventListeners();
});

// Load properties from backend
async function loadProperties() {
  try {
    showLoadingState();

    const response = await fetch(API_BASE_URL, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log("Properties loaded:", result);

    if (result.properties) {
      properties = result.properties.map(transformPropertyData);
      filteredProperties = [...properties];
      renderProperties();
      hideLoadingState();
    } else {
      throw new Error("Invalid response format");
    }
  } catch (error) {
    console.error("Error loading properties:", error);
    showErrorState();
  }
}

// Transform backend property data to frontend format
// Replace the transformPropertyData function:

function transformPropertyData(backendProperty) {
  return {
    id: backendProperty.property_id,
    property_name: backendProperty.property_name || "Unnamed Property",
    location: formatAddress(backendProperty),
    status: mapPropertyStatus(backendProperty.property_status),
    base_rent: backendProperty.base_rent || 0,
    floor_area_sqm: backendProperty.floor_area_sqm || 0,
    description: backendProperty.description || "",
    display_image: backendProperty.display_image,
    property_pictures: backendProperty.property_pictures || [],
    property_taxes_quarterly: backendProperty.property_taxes_quarterly || 0,
    security_deposit_months: backendProperty.security_deposit_months || 2,
    minimum_lease_term_months: backendProperty.minimum_lease_term_months || 24,
    address_id: backendProperty.address_id,
    // Include individual address fields for extraction
    street: backendProperty.street,
    barangay: backendProperty.barangay,
    city: backendProperty.city,
    province: backendProperty.province,
    postal_code: backendProperty.postal_code,
    country: backendProperty.country,
    created_at: backendProperty.created_at,
    updated_at: backendProperty.updated_at,
  };
}

// Format address from backend data
function formatAddress(property) {
  const parts = [
    property.street,
    property.barangay,
    property.city,
    property.province,
    property.country,
  ].filter((part) => part && part.trim());

  return parts.length > 0 ? parts.join(", ") : "Address not available";
}

// Map backend property status to frontend status
function mapPropertyStatus(backendStatus) {
  const statusMap = {
    Available: "available",
    Occupied: "occupied",
    Maintenance: "maintenance",
    "Under Maintenance": "maintenance",
  };
  return statusMap[backendStatus] || "available";
}

// Map frontend status to backend status
function mapStatusToBackend(frontendStatus) {
  const statusMap = {
    available: "Available",
    occupied: "Occupied",
    maintenance: "Maintenance",
  };
  return statusMap[frontendStatus] || "Available";
}

function setupEventListeners() {
  // Search functionality
  document
    .getElementById("searchInput")
    .addEventListener("input", function (e) {
      searchProperties(e.target.value);
    });

  // Profile dropdown
  document
    .getElementById("profileBtnIcon")
    .addEventListener("click", function (e) {
      e.stopPropagation();
      const dropdown = document.getElementById("dropdownMenu");
      dropdown.style.display =
        dropdown.style.display === "block" ? "none" : "block";
    });

  // Close dropdown when clicking outside
  document.addEventListener("click", function () {
    document.getElementById("dropdownMenu").style.display = "none";
    closeAllDropdowns();
  });
}

function renderProperties() {
  console.log("Rendering properties:", filteredProperties.length);
  const grid = document.getElementById("propertiesGrid");

  if (!grid) {
    console.error("Properties grid element not found!");
    return;
  }

  if (filteredProperties.length === 0) {
    grid.innerHTML = `
            <div class="col-12">
                <div class="text-center py-5">
                    <i class="fas fa-home fa-3x text-muted mb-3"></i>
                    <h5 class="text-muted">No properties found</h5>
                    <p class="text-muted">Try adjusting your search criteria or add a new property.</p>
                </div>
            </div>
        `;
    return;
  }

  grid.innerHTML = filteredProperties
    .map(
      (property) => `
        <div class="property-card-wrapper">
            <div class="property-card h-100" data-id="${property.id}">
                <!-- Property Image Section -->
                <div class="property-image-container">
                    <div class="property-image ${
                      getPropertyImageSrc(property) ? "" : "no-image"
                    }">
                        ${
                          getPropertyImageSrc(property)
                            ? `<img src="${getPropertyImageSrc(
                                property
                              )}" alt="${
                                property.property_name
                              }" class="img-fluid">`
                            : `
                                <div class="no-image-placeholder">
                                    <i class="fas fa-image fa-2x text-muted mb-2"></i>
                                    <small class="text-muted">No Image Available</small>
                                </div>
                            `
                        }
                        <div class="image-overlay">
                            <button class="btn-image-action" onclick="openEditModal('${
                              property.id
                            }')" title="Edit Property">
                                <i class="fas fa-edit"></i>
                            </button>
                        </div>
                    </div>
                    <div class="status-badge-container">
                        <span class="status-badge status-${property.status}">
                            <i class="fas ${getStatusIcon(
                              property.status
                            )} me-1"></i>
                            ${
                              property.status.charAt(0).toUpperCase() +
                              property.status.slice(1)
                            }
                        </span>
                    </div>
                </div>
                
                <!-- Property Info Section -->
                <div class="property-card-body">
                    <!-- Header Section -->
                    <div class="property-header-section">
                        <h5 class="property-title">${
                          property.property_name
                        }</h5>
                        <p class="property-location">
                            <i class="fas fa-map-marker-alt text-muted me-1"></i>
                            ${property.location}
                        </p>
                    </div>
                    
                    <!-- Price Section -->
                    <div class="property-price-section">
                        <div class="price-main">₱${property.base_rent.toLocaleString()}</div>
                        <div class="price-label">per month</div>
                    </div>
                    
                    <!-- Key Details Grid -->
                    <div class="property-details-grid">
                        <div class="detail-card">
                            <div class="detail-icon">
                                <i class="fas fa-ruler-combined"></i>
                            </div>
                            <div class="detail-content">
                                <div class="detail-value">${
                                  property.floor_area_sqm
                                }</div>
                                <div class="detail-label">m² Area</div>
                            </div>
                        </div>
                        
                        <div class="detail-card">
                            <div class="detail-icon">
                                <i class="fas fa-calendar-alt"></i>
                            </div>
                            <div class="detail-content">
                                <div class="detail-value">${
                                  property.minimum_lease_term_months
                                }</div>
                                <div class="detail-label">Months Lease</div>
                            </div>
                        </div>
                        
                        <div class="detail-card">
                            <div class="detail-icon">
                                <i class="fas fa-shield-alt"></i>
                            </div>
                            <div class="detail-content">
                                <div class="detail-value">${
                                  property.security_deposit_months
                                } MONTHS</div>
                                <div class="detail-label">Security Deposit</div>
                            </div>
                        </div>
                        
                        <div class="detail-card">
                            <div class="detail-icon">
                                <i class="fas fa-file-invoice-dollar"></i>
                            </div>
                            <div class="detail-content">
                                <div class="detail-value">₱${property.property_taxes_quarterly.toLocaleString()}</div>
                                <div class="detail-label">Quarterly Tax</div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Actions Section -->
                    <div class="property-actions">
                        <button class="btn btn-outline-primary btn-sm flex-fill" onclick="showPropertyDetails('${
                          property.id
                        }')">
                            <i class="fas fa-eye me-1"></i>
                            View Details
                        </button>
                        <button class="btn btn-primary btn-sm flex-fill" onclick="openEditModal('${
                          property.id
                        }')">
                            <i class="fas fa-edit me-1"></i>
                            Edit
                        </button>
                        <button class="btn btn-outline-danger btn-sm" onclick="removeProperty('${
                          property.id
                        }')" title="Remove Property">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `
    )
    .join("");

  console.log("Properties rendered successfully");
}

// Helper function to get status icon
function getStatusIcon(status) {
  const iconMap = {
    available: "fa-check-circle",
    occupied: "fa-user",
    maintenance: "fa-tools",
  };
  return iconMap[status] || "fa-circle";
}

// Get property image source
function getPropertyImageSrc(property) {
  if (property.display_image) {
    return property.display_image;
  }
  if (property.property_pictures && property.property_pictures.length > 0) {
    return property.property_pictures[0].image_url;
  }
  return null;
}

// Show loading state
function showLoadingState() {
  const grid = document.getElementById("propertiesGrid");
  grid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 50px;">
                    <div style="font-size: 18px; color: #666; margin-bottom: 10px;">Loading properties...</div>
                    <div style="width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #4a90e2; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto;"></div>
                </div>
            `;
}

// Show error state
function showErrorState() {
  const grid = document.getElementById("propertiesGrid");
  grid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 50px; color: #dc2626;">
                    <div style="font-size: 18px; margin-bottom: 15px;">Failed to load properties</div>
                    <button onclick="loadProperties()" style="background: #4a90e2; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer;">
                        Retry
                    </button>
                </div>
            `;
}

// Hide loading state
function hideLoadingState() {
  // Properties will be rendered by renderProperties()
}

function openAddModal() {
  showAddPropertyForm();
}

function closeAddModal() {
  hideAddPropertyForm();
}

// Update openEditModal to use inline form instead
function openEditModal(id) {
  console.log("openEditModal called with id:", id);
  const property = properties.find((p) => p.id === id);
  if (!property) {
    console.error("Property not found:", id);
    return;
  }

  // Use inline form instead of modal
  showEditPropertyForm(id);
}


function closeEditModal() {
  hideEditPropertyForm();
}


function showPropertyDetails(id) {
  console.log("showPropertyDetails called with id:", id);
  const property = properties.find((p) => p.id === id);
  if (!property) {
    console.error("Property not found:", id);
    return;
  }

  if (!detailsModal) {
    detailsModal = new DetailsModal();
  }
  detailsModal.show(property);
}

function closeDetailsModal() {
  if (detailsModal) {
    detailsModal.close();
  }
}

async function removeProperty(id) {
  if (!confirm("Are you sure you want to remove this property?")) {
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: "DELETE",
    });

    if (response.ok) {
      loadProperties(); // Reload properties
      alert("Property removed successfully!");
    } else {
      throw new Error("Failed to delete property");
    }
  } catch (error) {
    console.error("Error deleting property:", error);
    alert("Failed to remove property. Please try again.");
  }
}

// Search and filter functions
async function searchProperties(query) {
  if (!query.trim()) {
    loadProperties();
    return;
  }

  try {
    const response = await fetch(
      `${API_BASE_URL}?search=${encodeURIComponent(query)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      }
    );

    if (response.ok) {
      const result = await response.json();
      if (result.properties) {
        properties = result.properties.map(transformPropertyData);
        filteredProperties = [...properties];
        renderProperties();
      }
    } else {
      // Fallback to client-side filtering
      const searchTerm = query.toLowerCase();
      filteredProperties = properties.filter(
        (property) =>
          property.property_name.toLowerCase().includes(searchTerm) ||
          property.location.toLowerCase().includes(searchTerm) ||
          property.description.toLowerCase().includes(searchTerm)
      );
      renderProperties();
    }
  } catch (error) {
    console.error("Search error:", error);
    // Fallback to client-side filtering
    const searchTerm = query.toLowerCase();
    filteredProperties = properties.filter(
      (property) =>
        property.property_name.toLowerCase().includes(searchTerm) ||
        property.location.toLowerCase().includes(searchTerm) ||
        property.description.toLowerCase().includes(searchTerm)
    );
    renderProperties();
  }
}

function toggleDropdown(dropdownId) {
  event.stopPropagation();
  closeAllDropdowns();
  const dropdown = document.getElementById(dropdownId);
  dropdown.classList.toggle("show");
}

function closeAllDropdowns() {
  document
    .querySelectorAll(".property-dropdown-content")
    .forEach((dropdown) => {
      dropdown.classList.remove("show");
    });
}

async function filterByStatus(status) {
  try {
    let url = API_BASE_URL;
    if (status !== "all") {
      const backendStatus = mapStatusToBackend(status);
      url += `?property_status=${encodeURIComponent(backendStatus)}`;
    }

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (response.ok) {
      const result = await response.json();
      if (result.properties) {
        properties = result.properties.map(transformPropertyData);
        filteredProperties = [...properties];
        renderProperties();
      }
    } else {
      // Fallback to client-side filtering
      if (status === "all") {
        filteredProperties = [...properties];
      } else {
        filteredProperties = properties.filter(
          (property) => property.status === status
        );
      }
      renderProperties();
    }
  } catch (error) {
    console.error("Filter error:", error);
    // Fallback to client-side filtering
    if (status === "all") {
      filteredProperties = [...properties];
    } else {
      filteredProperties = properties.filter(
        (property) => property.status === status
      );
    }
    renderProperties();
  }
  closeAllDropdowns();
}


// Navigation functions
function showAddPropertyForm() {
  isAddingProperty = true;
  updateBreadcrumb();
  showFormContainer();
  setupInlineForm();
}

// Update the hideAddPropertyForm function to ensure proper reset
function hideAddPropertyForm() {
  if (confirm('Are you sure you want to cancel? All entered data will be lost.')) {
    isAddingProperty = false;
    updateBreadcrumb();
    showPropertiesGrid();
    resetInlineForm();
    
    // Ensure proper visibility reset
    const addPropertyBtn = document.querySelector('.new-ticket-btn');
    const propertyControls = document.getElementById('propertyControls');
    
    if (addPropertyBtn) addPropertyBtn.style.display = 'flex';
    if (propertyControls) propertyControls.style.display = 'flex';
  }
}

function updateBreadcrumb() {
  const breadcrumbNav = document.getElementById('breadcrumbNav');
  const propertyControls = document.getElementById('propertyControls');
  const addPropertyBtn = document.querySelector('.new-ticket-btn');
  
  if (isAddingProperty) {
    breadcrumbNav.innerHTML = `
      <li class="breadcrumb-item">
        <a href="#" onclick="hideAddPropertyForm()">
          <i class="fas fa-home me-2"></i>Properties
        </a>
      </li>
      <li class="breadcrumb-item active" aria-current="page">
        <i class="fas fa-plus me-2"></i>Add New Property
      </li>
    `;
    propertyControls.style.display = 'none';
    addPropertyBtn.style.display = 'none';
  } else if (isEditingProperty) {
    const property = properties.find(p => p.id === currentEditPropertyId);
    const propertyName = property ? property.property_name : 'Property';
    
    breadcrumbNav.innerHTML = `
      <li class="breadcrumb-item">
        <a href="#" onclick="hideEditPropertyForm()">
          <i class="fas fa-home me-2"></i>Properties
        </a>
      </li>
      <li class="breadcrumb-item active" aria-current="page">
        <i class="fas fa-edit me-2"></i>Edit ${propertyName}
      </li>
    `;
    propertyControls.style.display = 'none';
    addPropertyBtn.style.display = 'none';
  } else {
    breadcrumbNav.innerHTML = `
      <li class="breadcrumb-item active" aria-current="page">
        <i class="fas fa-home me-2"></i>Properties
      </li>
    `;
    propertyControls.style.display = 'flex';
    addPropertyBtn.style.display = 'flex';
  }
}

// Add new functions for edit form management
function showEditPropertyForm(propertyId) {
  isEditingProperty = true;
  currentEditPropertyId = propertyId;
  updateBreadcrumb();
  showEditFormContainer();
  setupEditInlineForm();
  populateEditForm(propertyId);
}

function hideEditPropertyForm() {
  if (confirm('Are you sure you want to cancel? All changes will be lost.')) {
    isEditingProperty = false;
    currentEditPropertyId = null;
    updateBreadcrumb();
    showPropertiesGrid();
    resetEditInlineForm();
    
    // Ensure proper visibility reset
    const addPropertyBtn = document.querySelector('.new-ticket-btn');
    const propertyControls = document.getElementById('propertyControls');
    
    if (addPropertyBtn) addPropertyBtn.style.display = 'flex';
    if (propertyControls) propertyControls.style.display = 'flex';
  }
}

function showEditFormContainer() {
  document.getElementById('propertiesGrid').style.display = 'none';
  document.getElementById('addPropertyFormContainer').style.display = 'none';
  document.getElementById('editPropertyFormContainer').style.display = 'block';
  
  // Ensure Add Property button is hidden
  const addPropertyBtn = document.querySelector('.new-ticket-btn');
  if (addPropertyBtn) {
    addPropertyBtn.style.display = 'none';
  }
}

function showFormContainer() {
  document.getElementById('propertiesGrid').style.display = 'none';
  document.getElementById('addPropertyFormContainer').style.display = 'block';
  
  // Ensure Add Property button is hidden
  const addPropertyBtn = document.querySelector('.new-ticket-btn');
  if (addPropertyBtn) {
    addPropertyBtn.style.display = 'none';
  }
}

function showPropertiesGrid() {
  document.getElementById('addPropertyFormContainer').style.display = 'none';
  document.getElementById('propertiesGrid').style.display = 'grid';
  
  // Show Add Property button
  const addPropertyBtn = document.querySelector('.new-ticket-btn');
  if (addPropertyBtn) {
    addPropertyBtn.style.display = 'flex';
  }
}


function showPropertiesGrid() {
  document.getElementById('addPropertyFormContainer').style.display = 'none';
  document.getElementById('editPropertyFormContainer').style.display = 'none';
  document.getElementById('propertiesGrid').style.display = 'grid';
  
  // Show Add Property button
  const addPropertyBtn = document.querySelector('.new-ticket-btn');
  if (addPropertyBtn) {
    addPropertyBtn.style.display = 'flex';
  }
}


function setupEditImageShowcase() {
    const showcaseContainer = document.getElementById('editImageShowcaseContainer');
    const uploadPrompt = document.getElementById('editShowcaseUploadPrompt');
    const fileInput = document.getElementById('editShowcaseImageInput');
    const addMoreBtn = document.getElementById('editAddMoreImagesBtn');

    // Click handlers
    uploadPrompt.addEventListener('click', () => {
        if (editShowcaseImages.length < MAX_SHOWCASE_IMAGES) {
            fileInput.click();
        }
    });

    addMoreBtn.addEventListener('click', () => {
        if (editShowcaseImages.length < MAX_SHOWCASE_IMAGES) {
            fileInput.click();
        }
    });

    // File input change handler
    fileInput.addEventListener('change', handleEditShowcaseImageFiles);

    // Drag and drop
    showcaseContainer.addEventListener('dragover', (e) => {
        e.preventDefault();
        showcaseContainer.style.borderColor = '#f59e0b';
        showcaseContainer.style.background = '#fffbeb';
    });

    showcaseContainer.addEventListener('dragleave', (e) => {
        e.preventDefault();
        showcaseContainer.style.borderColor = '#cbd5e0';
        showcaseContainer.style.background = '#f9fafb';
    });

    showcaseContainer.addEventListener('drop', (e) => {
        e.preventDefault();
        showcaseContainer.style.borderColor = '#cbd5e0';
        showcaseContainer.style.background = '#f9fafb';
        
        const files = Array.from(e.dataTransfer.files);
        const imageFiles = files.filter(file => file.type.startsWith('image/'));
        
        if (imageFiles.length > 0) {
            handleEditShowcaseImageFiles({ target: { files: imageFiles } });
        }
    });
}

function handleEditShowcaseImageFiles(event) {
    const files = Array.from(event.target.files);
    const remainingSlots = MAX_SHOWCASE_IMAGES - editShowcaseImages.length;
    
    if (files.length > remainingSlots) {
        showInlineErrorMessage(`You can only add ${remainingSlots} more images. Maximum ${MAX_SHOWCASE_IMAGES} images allowed.`);
        return;
    }

    files.forEach(file => {
        if (validateEditShowcaseImage(file)) {
            addEditShowcaseImage(file);
        }
    });

    // Clear the input
    event.target.value = '';
}

function validateEditShowcaseImage(file) {
    // Check file type
    if (!file.type.startsWith('image/')) {
        showInlineErrorMessage(`${file.name} is not a valid image file.`);
        return false;
    }

    // Check file size (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
        showInlineErrorMessage(`${file.name} is too large. Maximum file size is 5MB.`);
        return false;
    }

    // Check if we've reached the limit
    if (editShowcaseImages.length >= MAX_SHOWCASE_IMAGES) {
        showInlineErrorMessage(`Maximum ${MAX_SHOWCASE_IMAGES} images allowed.`);
        return false;
    }

    return true;
}

function addEditShowcaseImage(file, existingData = null) {
    const imageId = Date.now() + Math.random();
    const imageData = {
        id: imageId,
        file: file,
        description: existingData?.image_desc || '',
        isExisting: !!existingData,
        existingId: existingData?.id || null
    };

    editShowcaseImages.push(imageData);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
        imageData.dataUrl = e.target.result;
        renderEditShowcasePreview();
    };
    reader.readAsDataURL(file);
}


function loadExistingShowcaseImages(property) {
    editShowcaseImages = [];
    
    if (property.property_pictures && property.property_pictures.length > 0) {
        property.property_pictures.forEach((picture, index) => {
            // Create a mock file object for existing images
            const mockFile = new File([''], `existing-image-${index}.jpg`, { type: 'image/jpeg' });
            
            const imageData = {
                id: Date.now() + index, // Local ID for frontend tracking
                file: mockFile,
                description: picture.image_desc || '',
                isExisting: true,
                existingId: picture.id, // This should be the actual database ID
                dataUrl: picture.image_url
            };
            
            // Debug log to check the ID
            console.log('Loading existing image:', {
                id: picture.id,
                imageId: picture.image_id,
                url: picture.image_url
            });
            
            editShowcaseImages.push(imageData);
        });
    }
    
    renderEditShowcasePreview();
}

function renderEditShowcasePreview() {
    const previewGrid = document.getElementById('editShowcasePreviewGrid');
    const uploadPrompt = document.getElementById('editShowcaseUploadPrompt');
    const addMoreSection = document.getElementById('editShowcaseAddMore');
    const currentCount = document.getElementById('editCurrentImageCount');

    // Update count
    if (currentCount) {
        currentCount.textContent = editShowcaseImages.length;
    }

    if (editShowcaseImages.length === 0) {
        uploadPrompt.style.display = 'block';
        addMoreSection.style.display = 'none';
        previewGrid.innerHTML = '';
        previewGrid.className = 'showcase-preview-grid';
        return;
    }

    uploadPrompt.style.display = 'none';
    addMoreSection.style.display = editShowcaseImages.length < MAX_SHOWCASE_IMAGES ? 'flex' : 'none';

    // Update grid class based on count
    previewGrid.className = `showcase-preview-grid count-${editShowcaseImages.length}`;

    // Render images
    previewGrid.innerHTML = editShowcaseImages.map((imageData, index) => `
        <div class="showcase-image-card ${imageData.isNew ? 'new' : ''}" data-image-id="${imageData.id}">
            <div class="showcase-image-number">${index + 1}</div>
            <img src="${imageData.dataUrl}" class="showcase-image-preview" alt="Showcase image ${index + 1}">
            <div class="showcase-image-info">
                <textarea 
                    class="showcase-image-description" 
                    placeholder="Add a description for this image..."
                    data-image-id="${imageData.id}"
                >${imageData.description}</textarea>
                <div class="showcase-image-actions">
                    <button type="button" class="showcase-remove-btn" onclick="removeEditShowcaseImage('${imageData.id}')">
                        <i class="fas fa-trash"></i> Remove
                    </button>
                </div>
            </div>
        </div>
    `).join('');

    // Add event listeners for description changes
    previewGrid.querySelectorAll('.showcase-image-description').forEach(textarea => {
        textarea.addEventListener('input', (e) => {
            const imageId = e.target.dataset.imageId;
            const imageData = editShowcaseImages.find(img => img.id == imageId);
            if (imageData) {
                imageData.description = e.target.value;
            }
        });
    });

    // Remove new class after animation
    setTimeout(() => {
        previewGrid.querySelectorAll('.showcase-image-card.new').forEach(card => {
            card.classList.remove('new');
        });
    }, 300);
}


function removeEditShowcaseImage(imageId) {
    const imageToRemove = editShowcaseImages.find(img => img.id == imageId);
    
    if (imageToRemove && imageToRemove.isExisting && imageToRemove.existingId) {
        
        const validId = parseInt(imageToRemove.existingId);
        if (!isNaN(validId) && validId > 0) {
            deletedShowcaseImages.push(validId);
            console.log('Added image to deletion list:', validId);
        } else {
            console.warn('Invalid existing image ID:', imageToRemove.existingId);
        }
    }
    
    
    editShowcaseImages = editShowcaseImages.filter(img => img.id != imageId);
    renderEditShowcasePreview();
}


function getEditShowcaseImagesForSubmission() {
    const newImages = editShowcaseImages.filter(img => !img.isExisting);
    const updatedImages = editShowcaseImages.filter(img => img.isExisting && img.existingId);
    const deletedImages = deletedShowcaseImages.filter(id => id && id !== 'undefined' && !isNaN(id));
    
    console.log('Getting showcase data:', {
        totalImages: editShowcaseImages.length,
        newImages: newImages.length,
        updatedImages: updatedImages.length,
        deletedImages: deletedImages.length,
        deletedImageIds: deletedImages
    });
    
    return {
        newImages: newImages.map(imageData => ({
            file: imageData.file,
            description: imageData.description
        })),
        updatedImages: updatedImages.map(imageData => ({
            existingId: imageData.existingId,
            description: imageData.description
        })),
        deletedImages: deletedImages
    };
}




// Setup edit inline form
function setupEditInlineForm() {
    if (editInlineFormHandler) return; // Already setup
    
    // Setup image upload
    setupEditInlineImageUpload();
    
    // Setup image showcase
    setupEditImageShowcase();
    
    // Setup address handlers
    setupEditInlineAddressHandlers();
    
    // Setup real-time validation for edit form
    setupEditRealTimeValidation();
    
    // Setup form submission
    const form = document.getElementById('inlineEditPropertyForm');
    form.addEventListener('submit', handleEditInlineFormSubmit);
    
    // Load existing addresses
    loadEditInlineAddresses();
    
    editInlineFormHandler = true;
}


// Populate edit form with property data
function populateEditForm(propertyId) {
    // Clear deleted images list when starting to edit a property
    deletedShowcaseImages = [];
    
    const property = properties.find(p => p.id === propertyId);
    if (!property) {
        console.error('Property not found:', propertyId);
        return;
    }

    console.log('Populating edit form with property:', property);

    // Populate basic property fields
    const fieldMappings = {
        'editPropertyName': property.property_name,
        'editFloorArea': property.floor_area_sqm,
        'editPropertyStatus': mapStatusToBackend(property.status),
        'editBaseRent': property.base_rent,
        'editPropertyTaxes': property.property_taxes_quarterly,
        'editSecurityDeposit': property.security_deposit_months,
        'editLeaseTerm': property.minimum_lease_term_months,
        'editDescription': property.description || ''
    };

    // Populate each field
    Object.entries(fieldMappings).forEach(([fieldId, value]) => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.value = value || '';
            console.log(`Set ${fieldId} to:`, value);
        } else {
            console.warn(`Field ${fieldId} not found`);
        }
    });

    // Populate address field
    const addressSelect = document.getElementById('editInlineAddressSelect');
    if (addressSelect && property.address_id) {
        addressSelect.value = property.address_id;
        console.log('Set address to:', property.address_id);
    }

    // Set existing display image
    const uploadContainer = document.getElementById('editInlineImageUploadContainer');
    if (uploadContainer && uploadContainer.setExistingImage) {
        uploadContainer.setExistingImage(property.display_image);
        console.log('Set display image to:', property.display_image);
    }

    // Load existing showcase images
    loadExistingShowcaseImages(property);
    
    console.log('Edit form populated successfully');
}

// Update resetEditInlineForm to properly reset display image
function resetEditInlineForm() {
    const form = document.getElementById('inlineEditPropertyForm');
    if (form) {
        form.reset();
    }
    
    // Clear all validation errors
    clearAllEditErrors();
    
    // Reset display image upload
    const uploadContainer = document.getElementById('editInlineImageUploadContainer');
    if (uploadContainer && uploadContainer.reset) {
        uploadContainer.reset();
    }
    
    // Reset showcase images
    editShowcaseImages = [];
    deletedShowcaseImages = [];
    renderEditShowcasePreview();
    
    // Reset address form
    clearEditInlineAddressForm();
    const newAddressForm = document.getElementById('editInlineNewAddressForm');
    const addNewAddressBtn = document.getElementById('editInlineAddNewAddressBtn');
    if (newAddressForm) newAddressForm.style.display = 'none';
    if (addNewAddressBtn) addNewAddressBtn.innerHTML = '<i class="fas fa-plus me-1"></i> Add New Address';
}

function validateImage(file) {
    // Check file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
        showInlineErrorMessage(`${file.name} is not a valid image file (JPG, PNG, GIF)`);
        return false;
    }

    // Check file size (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
        showInlineErrorMessage(`${file.name} is too large. Maximum file size is 5MB`);
        return false;
    }

    return true;
}


// Setup edit image upload
function setupEditInlineImageUpload() {
    const uploadContainer = document.getElementById('editInlineImageUploadContainer');
    const uploadPrompt = document.getElementById('editInlineUploadPrompt');
    const imagePreview = document.getElementById('editInlineImagePreview');
    const previewImage = document.getElementById('editInlinePreviewImage');
    const fileInput = document.getElementById('editInlineDisplayImageInput');
    const removeBtn = document.getElementById('editInlineRemoveImageBtn');
    const changeBtn = document.getElementById('editInlineChangeImageBtn');

    if (!uploadContainer || !uploadPrompt || !imagePreview || !previewImage || !fileInput) {
        console.warn('Edit inline image upload elements not found');
        return;
    }

    let uploadedFile = null;
    let shouldRemoveExistingImage = false; // Flag to track if existing image should be removed

    // Click handlers
    uploadPrompt.addEventListener('click', () => {
        fileInput.click();
    });

    if (changeBtn) {
        changeBtn.addEventListener('click', () => {
            fileInput.click();
        });
    }

    if (removeBtn) {
        removeBtn.addEventListener('click', () => {
            // Clear uploaded file
            uploadedFile = null;
            fileInput.value = '';
            
            // Mark existing image for removal
            shouldRemoveExistingImage = true;
            
            // Hide preview and show upload prompt
            imagePreview.style.display = 'none';
            uploadPrompt.style.display = 'block';
            
            console.log('Display image marked for removal');
        });
    }

    // File input change handler
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            // Reset removal flag when new image is selected
            shouldRemoveExistingImage = false;
            
            if (validateImage(file)) {
                uploadedFile = file;
                
                const reader = new FileReader();
                reader.onload = (e) => {
                    previewImage.src = e.target.result;
                    uploadPrompt.style.display = 'none';
                    imagePreview.style.display = 'block';
                };
                reader.readAsDataURL(file);
            }
        }
    });

    // Expose functions for form submission
    uploadContainer.getUploadedImage = () => uploadedFile;
    uploadContainer.shouldRemoveImage = () => shouldRemoveExistingImage;
    
    // Function to reset the upload container
    uploadContainer.reset = () => {
        uploadedFile = null;
        shouldRemoveExistingImage = false;
        fileInput.value = '';
        imagePreview.style.display = 'none';
        uploadPrompt.style.display = 'block';
    };
    
    // Function to set existing image for editing
    uploadContainer.setExistingImage = (imageUrl) => {
        if (imageUrl) {
            shouldRemoveExistingImage = false;
            previewImage.src = imageUrl;
            uploadPrompt.style.display = 'none';
            imagePreview.style.display = 'block';
        } else {
            uploadPrompt.style.display = 'block';
            imagePreview.style.display = 'none';
        }
    };
}
function setupEditInlineImageUpload() {
    const uploadContainer = document.getElementById('editInlineImageUploadContainer');
    const uploadPrompt = document.getElementById('editInlineUploadPrompt');
    const imagePreview = document.getElementById('editInlineImagePreview');
    const previewImage = document.getElementById('editInlinePreviewImage');
    const fileInput = document.getElementById('editInlineDisplayImageInput');
    const removeBtn = document.getElementById('editInlineRemoveImageBtn');
    const changeBtn = document.getElementById('editInlineChangeImageBtn');

    if (!uploadContainer || !uploadPrompt || !imagePreview || !previewImage || !fileInput) {
        console.warn('Edit inline image upload elements not found');
        return;
    }

    let uploadedFile = null;
    let shouldRemoveExistingImage = false; // Flag to track if existing image should be removed

    // Click handlers
    uploadPrompt.addEventListener('click', () => {
        fileInput.click();
    });

    if (changeBtn) {
        changeBtn.addEventListener('click', () => {
            fileInput.click();
        });
    }

    if (removeBtn) {
        removeBtn.addEventListener('click', () => {
            // Clear uploaded file
            uploadedFile = null;
            fileInput.value = '';
            
            // Mark existing image for removal
            shouldRemoveExistingImage = true;
            
            // Hide preview and show upload prompt
            imagePreview.style.display = 'none';
            uploadPrompt.style.display = 'block';
            
            console.log('Display image marked for removal');
        });
    }

    // Drag and drop handlers
    uploadContainer.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadContainer.style.borderColor = '#3b82f6';
        uploadContainer.style.background = '#eff6ff';
    });

    uploadContainer.addEventListener('dragleave', (e) => {
        e.preventDefault();
        uploadContainer.style.borderColor = '#cbd5e0';
        uploadContainer.style.background = '#f9fafb';
    });

    uploadContainer.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadContainer.style.borderColor = '#cbd5e0';
        uploadContainer.style.background = '#f9fafb';
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleEditImageFile(files[0]);
        }
    });

    // File input change handler
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            handleEditImageFile(file);
        }
    });

    // Function to handle image file processing
    function handleEditImageFile(file) {
        console.log('Processing edit image file:', file.name);
        
        // Reset removal flag when new image is selected
        shouldRemoveExistingImage = false;
        
        if (validateImage(file)) {
            uploadedFile = file;
            
            const reader = new FileReader();
            reader.onload = (e) => {
                console.log('Image loaded, updating preview');
                previewImage.src = e.target.result;
                uploadPrompt.style.display = 'none';
                imagePreview.style.display = 'block';
            };
            reader.onerror = (e) => {
                console.error('Error reading file:', e);
                showInlineErrorMessage('Error reading image file');
            };
            reader.readAsDataURL(file);
        } else {
            // Clear the input if validation fails
            fileInput.value = '';
            uploadedFile = null;
        }
    }

    // Expose functions for form submission
    uploadContainer.getUploadedImage = () => uploadedFile;
    uploadContainer.shouldRemoveImage = () => shouldRemoveExistingImage;
    
    // Function to reset the upload container
    uploadContainer.reset = () => {
        uploadedFile = null;
        shouldRemoveExistingImage = false;
        fileInput.value = '';
        imagePreview.style.display = 'none';
        uploadPrompt.style.display = 'block';
        console.log('Edit image upload container reset');
    };
    
    // Function to set existing image for editing
    uploadContainer.setExistingImage = (imageUrl) => {
        console.log('Setting existing image:', imageUrl);
        if (imageUrl) {
            shouldRemoveExistingImage = false;
            uploadedFile = null; // Clear any uploaded file
            previewImage.src = imageUrl;
            uploadPrompt.style.display = 'none';
            imagePreview.style.display = 'block';
        } else {
            uploadPrompt.style.display = 'block';
            imagePreview.style.display = 'none';
        }
    };

    console.log('Edit inline image upload setup completed');
}


// Setup edit address handlers (similar to add form)
function setupEditInlineAddressHandlers() {
  const addNewAddressBtn = document.getElementById('editInlineAddNewAddressBtn');
  const newAddressForm = document.getElementById('editInlineNewAddressForm');
  const saveNewAddressBtn = document.getElementById('editInlineSaveNewAddressBtn');
  const cancelNewAddressBtn = document.getElementById('editInlineCancelNewAddressBtn');
  const addressSelect = document.getElementById('editInlineAddressSelect');

  // Show/hide new address form
  addNewAddressBtn.addEventListener('click', () => {
    const isVisible = newAddressForm.style.display !== 'none';
    newAddressForm.style.display = isVisible ? 'none' : 'block';
    addNewAddressBtn.innerHTML = isVisible ? 
      '<i class="fas fa-plus me-1"></i> Add New Address' : 
      '<i class="fas fa-minus me-1"></i> Cancel New Address';
  });

  // Cancel new address
  cancelNewAddressBtn.addEventListener('click', () => {
    clearEditInlineAddressForm();
    newAddressForm.style.display = 'none';
    addNewAddressBtn.innerHTML = '<i class="fas fa-plus me-1"></i> Add New Address';
  });

  // Save new address
  saveNewAddressBtn.addEventListener('click', () => {
    const newAddress = collectEditInlineAddressData();
    if (validateEditInlineAddress(newAddress)) {
      addEditInlineAddressToSelect(newAddress);
      clearEditInlineAddressForm();
      newAddressForm.style.display = 'none';
      addNewAddressBtn.innerHTML = '<i class="fas fa-plus me-1"></i> Add New Address';
      showInlineSuccessMessage('Address prepared! It will be saved when you update the property.');
    }
  });

  // When existing address is selected, clear new address form
  addressSelect.addEventListener('change', () => {
    if (addressSelect.value) {
      clearEditInlineAddressForm();
      newAddressForm.style.display = 'none';
      addNewAddressBtn.innerHTML = '<i class="fas fa-plus me-1"></i> Add New Address';
    }
  });
}

// Helper functions for edit address handling
function collectEditInlineAddressData() {
  return {
    street: document.getElementById('editInlineNewStreet').value.trim(),
    barangay: document.getElementById('editInlineNewBarangay').value.trim(),
    city: document.getElementById('editInlineNewCity').value.trim(),
    province: document.getElementById('editInlineNewProvince').value.trim(),
    postal_code: document.getElementById('editInlineNewPostalCode').value.trim(),
    country: document.getElementById('editInlineNewCountry').value.trim()
  };
}

function validateEditInlineAddress(address) {
  const requiredFields = ['street', 'city'];
  const missingFields = requiredFields.filter(field => !address[field]);
  
  if (missingFields.length > 0) {
    alert(`Please fill in the following required fields: ${missingFields.join(', ')}`);
    return false;
  }
  
  return true;
}

function addEditInlineAddressToSelect(newAddress) {
  const addressSelect = document.getElementById('editInlineAddressSelect');
  const tempId = 'temp_' + Date.now();
  
  const addressWithTempId = {
    ...newAddress,
    address_id: tempId,
    is_new: true
  };

  const formatted = [
    newAddress.street,
    newAddress.barangay,
    newAddress.city,
    newAddress.province,
    newAddress.country
  ].filter(part => part && part.trim()).join(', ');

  const option = document.createElement('option');
  option.value = tempId;
  option.textContent = `${formatted} (New - will be created)`;
  option.dataset.addressData = JSON.stringify(addressWithTempId);
  option.selected = true;
  
  addressSelect.appendChild(option);
}

function clearEditInlineAddressForm() {
  document.getElementById('editInlineNewStreet').value = '';
  document.getElementById('editInlineNewBarangay').value = '';
  document.getElementById('editInlineNewCity').value = '';
  document.getElementById('editInlineNewProvince').value = '';
  document.getElementById('editInlineNewPostalCode').value = '';
  document.getElementById('editInlineNewCountry').value = 'Philippines';
}

function loadEditInlineAddresses() {
  const addressSelect = document.getElementById('editInlineAddressSelect');
  addressSelect.innerHTML = '<option value="">Select an existing address (optional)</option>';

  // Extract unique addresses from existing properties
  const uniqueAddresses = new Map();
  
  properties.forEach(property => {
    const addressKey = [
      property.street,
      property.barangay,
      property.city,
      property.province,
      property.country
    ].filter(part => part && part.trim()).join('|');

    if (addressKey && !uniqueAddresses.has(addressKey)) {
      uniqueAddresses.set(addressKey, {
        address_id: property.address_id,
        formatted: [
          property.street,
          property.barangay,
          property.city,
          property.province,
          property.country
        ].filter(part => part && part.trim()).join(', ')
      });
    }
  });

  uniqueAddresses.forEach(address => {
    const option = document.createElement('option');
    option.value = address.address_id || '';
    option.textContent = address.formatted;
    addressSelect.appendChild(option);
  });
}


async function handleEditInlineFormSubmit(event) {
    event.preventDefault();
    
    // Validate form before submission
    if (!validateEditForm()) {
        const submitBtn = document.getElementById('editInlineSubmitBtn');
        submitBtn.style.animation = 'shake 0.5s ease-in-out';
        setTimeout(() => {
            submitBtn.style.animation = '';
        }, 500);
        
        showInlineErrorMessage('Please fix the validation errors before submitting.');
        return;
    }
    
    const submitBtn = document.getElementById('editInlineSubmitBtn');
    const originalText = submitBtn.innerHTML;
    
    try {
        // Show loading state
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i> Updating Property...';

        // Create FormData
        const formData = new FormData(event.target);
        
        // Handle address data (existing logic)
        const addressSelect = document.getElementById('editInlineAddressSelect');
        if (addressSelect.value && addressSelect.value !== '') {
            if (addressSelect.value.startsWith('temp_')) {
                // New address
                const selectedOption = addressSelect.options[addressSelect.selectedIndex];
                const addressData = JSON.parse(selectedOption.dataset.addressData);
                
                // Remove temp data
                delete addressData.address_id;
                delete addressData.is_new;
                
                // Add address fields to form data
                Object.entries(addressData).forEach(([key, value]) => {
                    if (value && value.trim()) {
                        formData.append(key, value);
                    }
                });
                
                formData.delete('address_id');
            } else {
                // Existing address
                formData.set('address_id', addressSelect.value);
            }
        } else {
            formData.delete('address_id');
        }
        
        // Handle display image
        const uploadContainer = document.getElementById('editInlineImageUploadContainer');
        const uploadedImage = uploadContainer.getUploadedImage();
        const shouldRemoveImage = uploadContainer.shouldRemoveImage();
        
        if (uploadedImage) {
            // New image uploaded
            formData.set('display_image', uploadedImage);
        } else if (shouldRemoveImage) {
            // Mark existing image for removal
            formData.set('remove_display_image', 'true');
        }

        console.log('Display image handling:', {
            hasNewImage: !!uploadedImage,
            shouldRemove: shouldRemoveImage
        });

        // Add showcase images data with validation
        const showcaseData = getEditShowcaseImagesForSubmission();
        
        console.log('Showcase data being sent:', showcaseData);
        
        // Add new images
        if (showcaseData.newImages && showcaseData.newImages.length > 0) {
            showcaseData.newImages.forEach((imageData) => {
                formData.append('showcase_images', imageData.file);
                formData.append('showcase_descriptions', imageData.description);
            });
        }
        
        // Add updated existing images - only if we have valid IDs
        if (showcaseData.updatedImages && showcaseData.updatedImages.length > 0) {
            showcaseData.updatedImages.forEach((imageData) => {
                const validId = parseInt(imageData.existingId);
                if (!isNaN(validId) && validId > 0) {
                    formData.append('existing_image_ids', validId);
                    formData.append('existing_descriptions', imageData.description);
                } else {
                    console.warn('Skipping invalid existing image ID:', imageData.existingId);
                }
            });
        }
        
        // Add deleted images - only valid numeric IDs
        if (showcaseData.deletedImages && showcaseData.deletedImages.length > 0) {
            showcaseData.deletedImages.forEach((deletedId) => {
                const validId = parseInt(deletedId);
                if (!isNaN(validId) && validId > 0) {
                    formData.append('deleted_image_ids', validId);
                } else {
                    console.warn('Skipping invalid deleted image ID:', deletedId);
                }
            });
        }

        // Debug: Log what's being sent
        console.log('Form data entries being sent:');
        for (let [key, value] of formData.entries()) {
            if (key.includes('image') || key.includes('description')) {
                console.log(key, typeof value === 'object' ? '[File Object]' : value);
            } else {
                console.log(key, value);
            }
        }

        const response = await fetch(`${API_BASE_URL}/${currentEditPropertyId}`, {
            method: "PATCH",
            body: formData,
        });

        if (response.ok) {
            const result = await response.json();
            console.log("Property updated successfully:", result);
            
            showInlineSuccessMessage("Property updated successfully!");
            
            // Navigate directly to properties list without confirmation
            setTimeout(() => {
                navigateToPropertiesListDirectly();
                loadProperties();
            }, 1500);
            
        } else {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `Server error: ${response.status}`);
        }
    } catch (error) {
        console.error("Error updating property:", error);
        showInlineErrorMessage(error.message || "Failed to update property. Please try again.");
    } finally {
        // Restore button state
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }
}


// Inline form setup
function setupInlineForm() {
  if (inlineFormHandler) return; // Already setup
  
  // Setup image upload
  setupInlineImageUpload();
  
  // Setup address handlers
  setupInlineAddressHandlers();
  
  // Setup form submission
  const form = document.getElementById('inlineAddPropertyForm');
  form.addEventListener('submit', handleInlineFormSubmit);
  
  // Load existing addresses
  loadInlineAddresses();
  
  inlineFormHandler = true;
}

function setupInlineImageUpload() {
  const uploadContainer = document.getElementById('inlineImageUploadContainer');
  const fileInput = document.getElementById('inlineDisplayImageInput');
  const uploadPrompt = document.getElementById('inlineUploadPrompt');
  const imagePreview = document.getElementById('inlineImagePreview');
  const previewImage = document.getElementById('inlinePreviewImage');
  const removeImageBtn = document.getElementById('inlineRemoveImageBtn');
  const changeImageBtn = document.getElementById('inlineChangeImageBtn');

  let uploadedImage = null;

  // Click to upload
  uploadContainer.addEventListener('click', (e) => {
    if (e.target === uploadContainer || e.target.closest('#inlineUploadPrompt')) {
      fileInput.click();
    }
  });

  // Drag and drop
  uploadContainer.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadContainer.style.borderColor = '#3b82f6';
    uploadContainer.style.background = '#eff6ff';
  });

  uploadContainer.addEventListener('dragleave', (e) => {
    e.preventDefault();
    uploadContainer.style.borderColor = '#cbd5e0';
    uploadContainer.style.background = '#f9fafb';
  });

  uploadContainer.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadContainer.style.borderColor = '#cbd5e0';
    uploadContainer.style.background = '#f9fafb';
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleInlineImageFile(files[0]);
    }
  });

  // File input change
  fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      handleInlineImageFile(e.target.files[0]);
    }
  });

  // Remove image
  removeImageBtn.addEventListener('click', () => {
    uploadedImage = null;
    fileInput.value = '';
    uploadPrompt.style.display = 'block';
    imagePreview.style.display = 'none';
  });

  // Change image
  changeImageBtn.addEventListener('click', () => {
    fileInput.click();
  });

  function handleInlineImageFile(file) {
    // Use the shared validateImage function
    if (validateImage(file)) {
      uploadedImage = file;

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        previewImage.src = e.target.result;
        uploadPrompt.style.display = 'none';
        imagePreview.style.display = 'block';
      };
      reader.readAsDataURL(file);
    } else {
      // Clear the input if validation fails
      fileInput.value = '';
      uploadedImage = null;
    }
  }

  // Store reference for form submission
  uploadContainer.getUploadedImage = () => uploadedImage;
}


function setupInlineAddressHandlers() {
  const addNewAddressBtn = document.getElementById('inlineAddNewAddressBtn');
  const newAddressForm = document.getElementById('inlineNewAddressForm');
  const saveNewAddressBtn = document.getElementById('inlineSaveNewAddressBtn');
  const cancelNewAddressBtn = document.getElementById('inlineCancelNewAddressBtn');
  const addressSelect = document.getElementById('inlineAddressSelect');

  // Show/hide new address form
  addNewAddressBtn.addEventListener('click', () => {
    const isVisible = newAddressForm.style.display !== 'none';
    newAddressForm.style.display = isVisible ? 'none' : 'block';
    addNewAddressBtn.innerHTML = isVisible ? 
      '<i class="fas fa-plus me-1"></i> Add New Address' : 
      '<i class="fas fa-minus me-1"></i> Cancel New Address';
  });

  // Cancel new address
  cancelNewAddressBtn.addEventListener('click', () => {
    clearInlineAddressForm();
    newAddressForm.style.display = 'none';
    addNewAddressBtn.innerHTML = '<i class="fas fa-plus me-1"></i> Add New Address';
  });

  // Save new address
  saveNewAddressBtn.addEventListener('click', () => {
    const newAddress = collectInlineAddressData();
    if (validateInlineAddress(newAddress)) {
      addInlineAddressToSelect(newAddress);
      clearInlineAddressForm();
      newAddressForm.style.display = 'none';
      addNewAddressBtn.innerHTML = '<i class="fas fa-plus me-1"></i> Add New Address';
      showInlineSuccessMessage('Address prepared! It will be saved when you create the property.');
    }
  });

  // When existing address is selected, clear new address form
  addressSelect.addEventListener('change', () => {
    if (addressSelect.value) {
      clearInlineAddressForm();
      newAddressForm.style.display = 'none';
      addNewAddressBtn.innerHTML = '<i class="fas fa-plus me-1"></i> Add New Address';
    }
  });
}

function collectInlineAddressData() {
  return {
    street: document.getElementById('inlineNewStreet').value.trim(),
    barangay: document.getElementById('inlineNewBarangay').value.trim(),
    city: document.getElementById('inlineNewCity').value.trim(),
    province: document.getElementById('inlineNewProvince').value.trim(),
    postal_code: document.getElementById('inlineNewPostalCode').value.trim(),
    country: document.getElementById('inlineNewCountry').value.trim()
  };
}

function validateInlineAddress(address) {
  const requiredFields = ['street', 'city'];
  const missingFields = requiredFields.filter(field => !address[field]);
  
  if (missingFields.length > 0) {
    alert(`Please fill in the following required fields: ${missingFields.join(', ')}`);
    return false;
  }
  
  return true;
}

function addInlineAddressToSelect(newAddress) {
  const addressSelect = document.getElementById('inlineAddressSelect');
  const tempId = 'temp_' + Date.now();
  
  const addressWithTempId = {
    ...newAddress,
    address_id: tempId,
    is_new: true
  };

  const formatted = [
    newAddress.street,
    newAddress.barangay,
    newAddress.city,
    newAddress.province,
    newAddress.country
  ].filter(part => part && part.trim()).join(', ');

  const option = document.createElement('option');
  option.value = tempId;
  option.textContent = `${formatted} (New - will be created)`;
  option.dataset.addressData = JSON.stringify(addressWithTempId);
  option.selected = true;
  
  addressSelect.appendChild(option);
}

function clearInlineAddressForm() {
  document.getElementById('inlineNewStreet').value = '';
  document.getElementById('inlineNewBarangay').value = '';
  document.getElementById('inlineNewCity').value = '';
  document.getElementById('inlineNewProvince').value = '';
  document.getElementById('inlineNewPostalCode').value = '';
  document.getElementById('inlineNewCountry').value = 'Philippines';
}

function loadInlineAddresses() {
  const addressSelect = document.getElementById('inlineAddressSelect');
  addressSelect.innerHTML = '<option value="">Select an existing address (optional)</option>';

  // Extract unique addresses from existing properties
  const uniqueAddresses = new Map();
  
  properties.forEach(property => {
    const addressKey = [
      property.street,
      property.barangay,
      property.city,
      property.province,
      property.country
    ].filter(part => part && part.trim()).join('|');

    if (addressKey && !uniqueAddresses.has(addressKey)) {
      uniqueAddresses.set(addressKey, {
        address_id: property.address_id,
        formatted: [
          property.street,
          property.barangay,
          property.city,
          property.province,
          property.country
        ].filter(part => part && part.trim()).join(', ')
      });
    }
  });

  uniqueAddresses.forEach(address => {
    const option = document.createElement('option');
    option.value = address.address_id || '';
    option.textContent = address.formatted;
    addressSelect.appendChild(option);
  });
}

async function handleInlineFormSubmit(event) {
  event.preventDefault();
  
  // Validate form before submission
  if (!validateForm()) {
    // Show shake animation on submit button
    const submitBtn = document.getElementById('inlineSubmitBtn');
    submitBtn.style.animation = 'shake 0.5s ease-in-out';
    setTimeout(() => {
      submitBtn.style.animation = '';
    }, 500);
    
    showInlineErrorMessage('Please fix the validation errors before submitting.');
    return;
  }
  
  const submitBtn = document.getElementById('inlineSubmitBtn');
  const originalText = submitBtn.innerHTML;
  
  try {
    // Show loading state
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i> Adding Property...';

    // Create FormData
    const formData = new FormData(event.target);
    
    // Handle address data
    const addressSelect = document.getElementById('inlineAddressSelect');
    if (addressSelect.value && addressSelect.value !== '') {
      if (addressSelect.value.startsWith('temp_')) {
        // New address
        const selectedOption = addressSelect.options[addressSelect.selectedIndex];
        const addressData = JSON.parse(selectedOption.dataset.addressData);
        
        // Remove temp data
        delete addressData.address_id;
        delete addressData.is_new;
        
        // Add address fields to form data
        Object.entries(addressData).forEach(([key, value]) => {
          if (value && value.trim()) {
            formData.append(key, value);
          }
        });
        
        formData.delete('address_id');
      } else {
        // Existing address
        formData.set('address_id', addressSelect.value);
      }
    } else {
      formData.delete('address_id');
    }
    
    // Add uploaded image
    const uploadContainer = document.getElementById('inlineImageUploadContainer');
    const uploadedImage = uploadContainer.getUploadedImage();
    if (uploadedImage) {
      formData.set('display_image', uploadedImage);
    }

    const response = await fetch(API_BASE_URL + "/create-property", {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      const result = await response.json();
      
      showInlineSuccessMessage("Property added successfully!");
      
      // Navigate directly to properties list without confirmation
      setTimeout(() => {
        navigateToPropertiesListDirectly(); // New function to avoid confirmation dialog
        loadProperties();
      }, 1500);
      
    } else {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Server error: ${response.status}`);
    }
  } catch (error) {
    console.error("Error creating property:", error);
    showInlineErrorMessage(error.message || "Failed to add property. Please try again.");
  } finally {
    // Restore button state
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalText;
  }
}

// Add this new function to navigate without confirmation
function navigateToPropertiesListDirectly() {
  // Set state to indicate we're no longer adding a property
  isAddingProperty = false;
  
  // Update breadcrumb without confirmation
  updateBreadcrumb();
  
  // Show properties grid and hide form
  showPropertiesGrid();
  
  // Reset form silently
  resetInlineFormSilently();
  
  // Ensure proper visibility reset
  const addPropertyBtn = document.querySelector('.new-ticket-btn');
  const propertyControls = document.getElementById('propertyControls');
  
  if (addPropertyBtn) addPropertyBtn.style.display = 'flex';
  if (propertyControls) propertyControls.style.display = 'flex';
}

// Add this new function to reset form without user interaction
function resetInlineFormSilently() {
  const form = document.getElementById('inlineAddPropertyForm');
  if (form) {
    form.reset();
  }
  
  // Clear all validation errors
  clearAllErrors();
  
  // Reset image upload
  const uploadContainer = document.getElementById('inlineImageUploadContainer');
  const uploadPrompt = document.getElementById('inlineUploadPrompt');
  const imagePreview = document.getElementById('inlineImagePreview');
  const fileInput = document.getElementById('inlineDisplayImageInput');
  
  if (fileInput) fileInput.value = '';
  if (uploadPrompt) uploadPrompt.style.display = 'block';
  if (imagePreview) imagePreview.style.display = 'none';
  
  // Reset address form
  clearInlineAddressForm();
  const newAddressForm = document.getElementById('inlineNewAddressForm');
  const addNewAddressBtn = document.getElementById('inlineAddNewAddressBtn');
  if (newAddressForm) newAddressForm.style.display = 'none';
  if (addNewAddressBtn) addNewAddressBtn.innerHTML = '<i class="fas fa-plus me-1"></i> Add New Address';
}







// Update the setupInlineForm function to include validation setup
function setupInlineForm() {
  if (inlineFormHandler) return; // Already setup
  
  // Setup image upload
  setupInlineImageUpload();
  
  // Setup address handlers
  setupInlineAddressHandlers();
  
  // Setup real-time validation
  setupRealTimeValidation();
  
  // Setup form submission
  const form = document.getElementById('inlineAddPropertyForm');
  form.addEventListener('submit', handleInlineFormSubmit);
  
  // Load existing addresses
  loadInlineAddresses();
  
  inlineFormHandler = true;
}

// Update resetInlineForm to clear validation errors
function resetInlineForm() {
  const form = document.getElementById('inlineAddPropertyForm');
  if (form) {
    form.reset();
  }
  
  // Clear all validation errors
  clearAllErrors();
  
  // Reset image upload
  const uploadContainer = document.getElementById('inlineImageUploadContainer');
  const uploadPrompt = document.getElementById('inlineUploadPrompt');
  const imagePreview = document.getElementById('inlineImagePreview');
  const fileInput = document.getElementById('inlineDisplayImageInput');
  
  if (fileInput) fileInput.value = '';
  if (uploadPrompt) uploadPrompt.style.display = 'block';
  if (imagePreview) imagePreview.style.display = 'none';
  
  // Reset address form
  clearInlineAddressForm();
  const newAddressForm = document.getElementById('inlineNewAddressForm');
  const addNewAddressBtn = document.getElementById('inlineAddNewAddressBtn');
  if (newAddressForm) newAddressForm.style.display = 'none';
  if (addNewAddressBtn) addNewAddressBtn.innerHTML = '<i class="fas fa-plus me-1"></i> Add New Address';
}

function showInlineSuccessMessage(message) {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    color: white;
    padding: 15px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
    z-index: 1000000;
    font-family: 'Poppins', sans-serif;
    font-weight: 600;
    animation: slideIn 0.3s ease;
  `;
  notification.innerHTML = `<i class="fas fa-check-circle me-2"></i>${message}`;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, 3000);
}

function showInlineErrorMessage(message) {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
    color: white;
    padding: 15px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
    z-index: 1000000;
    font-family: 'Poppins', sans-serif;
    font-weight: 600;
    animation: slideIn 0.3s ease;
  `;
  notification.innerHTML = `<i class="fas fa-exclamation-circle me-2"></i>${message}`;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, 5000);
}


// Form validation configuration
const VALIDATION_RULES = {
  propertyName: {
    id: 'propertyName',
    errorId: 'propertyNameError',
    required: true,
    message: 'Property name is required'
  },
  floorArea: {
    id: 'floorArea',
    errorId: 'floorAreaError',
    required: true,
    min: 0.01,
    message: 'Floor area must be greater than 0'
  },
  propertyStatus: {
    id: 'propertyStatus',
    errorId: 'propertyStatusError',
    required: true,
    message: 'Property status is required'
  },
  baseRent: {
    id: 'baseRent',
    errorId: 'baseRentError',
    required: true,
    min: 0,
    message: 'Monthly rent must be greater than or equal to 0'
  },
  propertyTaxes: {
    id: 'propertyTaxes',
    errorId: 'propertyTaxesError',
    required: true,
    min: 0,
    message: 'Property taxes must be greater than or equal to 0'
  },
  securityDeposit: {
    id: 'securityDeposit',
    errorId: 'securityDepositError',
    required: true,
    min: 0,
    message: 'Security deposit must be greater than or equal to 0'
  },
  leaseTerm: {
    id: 'leaseTerm',
    errorId: 'leaseTermError',
    required: true,
    min: 1,
    message: 'Minimum lease term must be at least 1 month'
  }
};

// Add validation for edit form
const EDIT_VALIDATION_RULES = {
  editPropertyName: {
    id: 'editPropertyName',
    errorId: 'editPropertyNameError',
    required: true,
    message: 'Property name is required'
  },
  editFloorArea: {
    id: 'editFloorArea',
    errorId: 'editFloorAreaError',
    required: true,
    min: 0.01,
    message: 'Floor area must be greater than 0'
  },
  editPropertyStatus: {
    id: 'editPropertyStatus',
    errorId: 'editPropertyStatusError',
    required: true,
    message: 'Property status is required'
  },
  editBaseRent: {
    id: 'editBaseRent',
    errorId: 'editBaseRentError',
    required: true,
    min: 0,
    message: 'Monthly rent must be greater than or equal to 0'
  },
  editPropertyTaxes: {
    id: 'editPropertyTaxes',
    errorId: 'editPropertyTaxesError',
    required: true,
    min: 0,
    message: 'Property taxes must be greater than or equal to 0'
  },
  editSecurityDeposit: {
    id: 'editSecurityDeposit',
    errorId: 'editSecurityDepositError',
    required: true,
    min: 0,
    message: 'Security deposit must be greater than or equal to 0'
  },
  editLeaseTerm: {
    id: 'editLeaseTerm',
    errorId: 'editLeaseTermError',
    required: true,
    min: 1,
    message: 'Minimum lease term must be at least 1 month'
  }
};


// Validation functions
function validateField(fieldConfig) {
  const field = document.getElementById(fieldConfig.id);
  const errorElement = document.getElementById(fieldConfig.errorId);
  const value = field.value.trim();
  
  // Clear previous error state
  clearFieldError(field, errorElement);
  
  // Check if required field is empty
  if (fieldConfig.required && !value) {
    showFieldError(field, errorElement, fieldConfig.message);
    return false;
  }
  
  // Check minimum value for numeric fields
  if (fieldConfig.min !== undefined && value) {
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue < fieldConfig.min) {
      showFieldError(field, errorElement, fieldConfig.message);
      return false;
    }
  }
  
  // If validation passes, show success state
  showFieldSuccess(field);
  return true;
}

function showFieldError(field, errorElement, message) {
  field.classList.add('error');
  field.classList.remove('success');
  errorElement.innerHTML = `<i class="fas fa-exclamation-circle"></i>${message}`;
  errorElement.classList.add('show');
  
  // Add pulse animation to label
  const label = field.closest('.form-group').querySelector('label');
  if (label) {
    label.classList.add('required-highlight');
    setTimeout(() => label.classList.remove('required-highlight'), 500);
  }
}

function showFieldSuccess(field) {
  field.classList.remove('error');
  field.classList.add('success');
}

function clearFieldError(field, errorElement) {
  field.classList.remove('error', 'success');
  errorElement.classList.remove('show');
  errorElement.innerHTML = '';
}

function clearAllErrors() {
  Object.values(VALIDATION_RULES).forEach(fieldConfig => {
    const field = document.getElementById(fieldConfig.id);
    const errorElement = document.getElementById(fieldConfig.errorId);
    if (field && errorElement) {
      clearFieldError(field, errorElement);
    }
  });
  
  // Hide validation summary
  const validationSummary = document.getElementById('validationSummary');
  if (validationSummary) {
    validationSummary.classList.remove('show');
  }
}

function validateForm() {
  clearAllErrors();
  
  const errors = [];
  let isValid = true;
  
  // Validate each field
  Object.entries(VALIDATION_RULES).forEach(([fieldName, fieldConfig]) => {
    if (!validateField(fieldConfig)) {
      errors.push(fieldConfig.message);
      isValid = false;
    }
  });
  
  // Show validation summary if there are errors
  if (errors.length > 0) {
    showValidationSummary(errors);
    
    // Scroll to first error
    const firstErrorField = document.querySelector('.form-group input.error, .form-group select.error');
    if (firstErrorField) {
      firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      firstErrorField.focus();
    }
  }
  
  return isValid;
}

function showValidationSummary(errors) {
  // Create validation summary if it doesn't exist
  let validationSummary = document.getElementById('validationSummary');
  if (!validationSummary) {
    validationSummary = document.createElement('div');
    validationSummary.id = 'validationSummary';
    validationSummary.className = 'validation-summary';
    
    // Insert at the beginning of the first form section
    const firstFormSection = document.querySelector('.form-section');
    firstFormSection.insertBefore(validationSummary, firstFormSection.firstChild);
  }
  
  const errorList = errors.map(error => `<li>${error}</li>`).join('');
  validationSummary.innerHTML = `
    <h5><i class="fas fa-exclamation-triangle me-2"></i>Please fix the following errors:</h5>
    <ul>${errorList}</ul>
  `;
  
  validationSummary.classList.add('show');
  validationSummary.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Real-time validation
function setupRealTimeValidation() {
  Object.values(VALIDATION_RULES).forEach(fieldConfig => {
    const field = document.getElementById(fieldConfig.id);
    if (field) {
      // Validate on blur (when user leaves the field)
      field.addEventListener('blur', () => {
        validateField(fieldConfig);
      });
      
      // Clear error on input (when user starts typing)
      field.addEventListener('input', () => {
        if (field.classList.contains('error')) {
          const errorElement = document.getElementById(fieldConfig.errorId);
          clearFieldError(field, errorElement);
          
          // Hide validation summary if all errors are cleared
          const remainingErrors = document.querySelectorAll('.error-message.show');
          if (remainingErrors.length === 0) {
            const validationSummary = document.getElementById('validationSummary');
            if (validationSummary) {
              validationSummary.classList.remove('show');
            }
          }
        }
      });
    }
  });
}

function validateEditForm() {
  clearAllEditErrors();
  
  const errors = [];
  let isValid = true;
  
  // Validate each field
  Object.entries(EDIT_VALIDATION_RULES).forEach(([fieldName, fieldConfig]) => {
    if (!validateField(fieldConfig)) {
      errors.push(fieldConfig.message);
      isValid = false;
    }
  });
  
  // Show validation summary if there are errors
  if (errors.length > 0) {
    showEditValidationSummary(errors);
    
    // Scroll to first error
    const firstErrorField = document.querySelector('#editPropertyFormContainer .form-group input.error, #editPropertyFormContainer .form-group select.error');
    if (firstErrorField) {
      firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      firstErrorField.focus();
    }
  }
  
  return isValid;
}

function clearAllEditErrors() {
  Object.values(EDIT_VALIDATION_RULES).forEach(fieldConfig => {
    const field = document.getElementById(fieldConfig.id);
    const errorElement = document.getElementById(fieldConfig.errorId);
    if (field && errorElement) {
      clearFieldError(field, errorElement);
    }
  });
  
  // Hide validation summary
  const validationSummary = document.getElementById('editValidationSummary');
  if (validationSummary) {
    validationSummary.classList.remove('show');
  }
}

function showEditValidationSummary(errors) {
  // Create validation summary if it doesn't exist
  let validationSummary = document.getElementById('editValidationSummary');
  if (!validationSummary) {
    validationSummary = document.createElement('div');
    validationSummary.id = 'editValidationSummary';
    validationSummary.className = 'validation-summary';
    
    // Insert at the beginning of the first form section in edit form
    const firstFormSection = document.querySelector('#editPropertyFormContainer .form-section');
    firstFormSection.insertBefore(validationSummary, firstFormSection.firstChild);
  }
  
  const errorList = errors.map(error => `<li>${error}</li>`).join('');
  validationSummary.innerHTML = `
    <h5><i class="fas fa-exclamation-triangle me-2"></i>Please fix the following errors:</h5>
    <ul>${errorList}</ul>
  `;
  
  validationSummary.classList.add('show');
  validationSummary.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function setupEditRealTimeValidation() {
  Object.values(EDIT_VALIDATION_RULES).forEach(fieldConfig => {
    const field = document.getElementById(fieldConfig.id);
    if (field) {
      // Validate on blur (when user leaves the field)
      field.addEventListener('blur', () => {
        validateField(fieldConfig);
      });
      
      // Clear error on input (when user starts typing)
      field.addEventListener('input', () => {
        if (field.classList.contains('error')) {
          const errorElement = document.getElementById(fieldConfig.errorId);
          clearFieldError(field, errorElement);
          
          // Hide validation summary if all errors are cleared
          const remainingErrors = document.querySelectorAll('#editPropertyFormContainer .error-message.show');
          if (remainingErrors.length === 0) {
            const validationSummary = document.getElementById('editValidationSummary');
            if (validationSummary) {
              validationSummary.classList.remove('show');
            }
          }
        }
      });
    }
  });
}


function resetEditInlineForm() {
    const form = document.getElementById('inlineEditPropertyForm');
    if (form) {
        form.reset();
    }
    
    // Clear all validation errors
    clearAllEditErrors();
    
    // Reset display image upload
    const uploadContainer = document.getElementById('editInlineImageUploadContainer');
    const uploadPrompt = document.getElementById('editInlineUploadPrompt');
    const imagePreview = document.getElementById('editInlineImagePreview');
    const fileInput = document.getElementById('editInlineDisplayImageInput');
    
    if (fileInput) fileInput.value = '';
    if (uploadPrompt) uploadPrompt.style.display = 'block';
    if (imagePreview) imagePreview.style.display = 'none';
    
    // Reset showcase images
    editShowcaseImages = [];
    deletedShowcaseImages = []; // Clear deleted images list
    renderEditShowcasePreview();
    
    // Reset address form
    clearEditInlineAddressForm();
    const newAddressForm = document.getElementById('editInlineNewAddressForm');
    const addNewAddressBtn = document.getElementById('editInlineAddNewAddressBtn');
    if (newAddressForm) newAddressForm.style.display = 'none';
    if (addNewAddressBtn) addNewAddressBtn.innerHTML = '<i class="fas fa-plus me-1"></i> Add New Address';
}



// Update navigateToPropertiesListDirectly to handle edit state
function navigateToPropertiesListDirectly() {
  // Reset all states
  isAddingProperty = false;
  isEditingProperty = false;
  currentEditPropertyId = null;
  
  // Update breadcrumb without confirmation
  updateBreadcrumb();
  
  // Show properties grid and hide forms
  showPropertiesGrid();
  
  // Reset forms silently
  resetInlineFormSilently();
  resetEditInlineForm();
  
  // Ensure proper visibility reset
  const addPropertyBtn = document.querySelector('.new-ticket-btn');
  const propertyControls = document.getElementById('propertyControls');
  
  if (addPropertyBtn) addPropertyBtn.style.display = 'flex';
  if (propertyControls) propertyControls.style.display = 'flex';
}



// Make functions globally available
window.openAddModal = openAddModal;
window.closeAddModal = closeAddModal;
window.openEditModal = openEditModal;
window.closeEditModal = closeEditModal;
window.showPropertyDetails = showPropertyDetails;
window.closeDetailsModal = closeDetailsModal;
// Make sure the functions are globally available
window.showAddPropertyForm = showAddPropertyForm;
window.hideAddPropertyForm = hideAddPropertyForm;
window.showEditPropertyForm = showEditPropertyForm;
window.hideEditPropertyForm = hideEditPropertyForm;

// Add CSS animation for loading spinner
const style = document.createElement("style");
style.textContent = `
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
document.head.appendChild(style);
