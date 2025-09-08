let currentImageIndex = 0;
let images = [];

document.addEventListener("DOMContentLoaded", () => {
  fetch("/components/navbar.html")
    .then((res) => res.text())
    .then((data) => {
      document.getElementById("navbar-placeholder").innerHTML = data;
      setupNavbarFeatures();
    });

  setupPropertyDetails();
});

function setupNavbarFeatures() {
  const navbar =
    document.querySelector("header") || document.getElementById("navbar");

  const revealElements = document.querySelectorAll(".reveal-element");

  const revealOnScroll = () => {
    revealElements.forEach((element) => {
      const elementTop = element.getBoundingClientRect().top;
      const elementVisible = 150;

      if (elementTop < window.innerHeight - elementVisible) {
        element.classList.add("revealed");
      }
    });
  };

  const handleScroll = () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    if (scrollTop > 50) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }

    revealOnScroll();
  };

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute("href"));
      if (target) {
        const offsetTop = target.offsetTop - 80;
        window.scrollTo({
          top: offsetTop,
          behavior: "smooth",
        });
      }
    });
  });

  window.addEventListener("scroll", handleScroll);
  window.addEventListener("load", revealOnScroll);
  revealOnScroll();
}

async function setupPropertyDetails() {
  const urlParams = new URLSearchParams(window.location.search);
  const propertyId = urlParams.get("property_id") || urlParams.get("id");
  if (!propertyId) return;

  try {
    const res = await fetch(`/api/v1/properties/${propertyId}`);
    const result = await res.json();
    const property = result.property;
    if (!property) return;

    const nameSection = document.getElementById("propertyNameSection");
    if (nameSection) {
      nameSection.innerHTML = `
        <h1 class="property-name-emphasized">${
          property.property_name || "Property Space"
        }</h1>
      `;
    }

    const descCard = document.getElementById("propertyDescCard");
    if (descCard) {
      descCard.innerHTML = `
        <div class="property-desc-card">
          ${property.description || "<em>No description available.</em>"}
        </div>
      `;
    }

    images =
      property.property_pictures && property.property_pictures.length
        ? property.property_pictures.map((pic) => pic.image_url)
        : [property.display_image].filter(Boolean);

    const mainImage = document.getElementById("mainImage");
    if (mainImage && images[0]) mainImage.src = images[0];

    const thumbnailRow = document.querySelector(".thumbnail-row");
    if (thumbnailRow) {
      thumbnailRow.innerHTML = images
        .map(
          (img, idx) => `
        <img class="thumbnail${
          idx === 0 ? " active" : ""
        }" src="${img}" alt="Property Image ${
            idx + 1
          }" onclick="setMainImage(this, ${idx})">
      `
        )
        .join("");
    }

    const specs = [
      {
        label: "Address",
        value: property.address
          ? [
              property.address.street,
              property.address.city,
              property.address.province,
              property.address.country,
            ]
              .filter(Boolean)
              .join(", ")
          : "",
      },
      {
        label: "Floor Area",
        value: property.floor_area_sqm
          ? `${property.floor_area_sqm} sqm`
          : "N/A",
      },
      {
        label: "Minimum Lease Term",
        value: property.minimum_lease_term_months
          ? `${property.minimum_lease_term_months} Months`
          : "N/A",
      },
      {
        label: "Rent",
        value: property.base_rent
          ? `₱${Number(property.base_rent).toLocaleString()}/mo`
          : "N/A",
      },
    ];

    const specsHtml = specs
      .map(
        (spec) => `
      <div class="spec-row">
        <span class="spec-label">${spec.label}:</span>
        <span class="spec-value">${spec.value}</span>
      </div>
    `
      )
      .join("");

    const specsSection = document.querySelector(
      ".property-details .details-left .section-content"
    );
    if (specsSection) specsSection.innerHTML = specsHtml;

    const priceMain = document.querySelector(".price-main");
    if (priceMain)
      priceMain.textContent = property.base_rent
        ? `₱${Number(property.base_rent).toLocaleString()}`
        : "N/A";

    const depositInfo = document.querySelector(".deposit-info");
    if (depositInfo) {
      depositInfo.innerHTML = property.security_deposit_months
        ? `<strong>Security Deposit:</strong> ₱ ${Number(
            property.base_rent * property.security_deposit_months
          ).toLocaleString()}<br>
           <small>Refundable upon lease termination, subject to property condition assessment.</small>`
        : "";
    }

    const statusSection = document.querySelector(
      ".details-right .section-content"
    );
    if (statusSection) {
      statusSection.innerHTML = `
        <div class="spec-row">
          <span class="spec-label">Occupancy:</span>
          <span class="spec-value"><span class="availability-status ${
            property.property_status === "Available" ? "available" : "occupied"
          }">${property.property_status}</span></span>
        </div>
        <div class="spec-row">
          <span class="spec-label">Last Updated:</span>
          <span class="spec-value">${
            property.updated_at
              ? new Date(property.updated_at).toLocaleDateString()
              : "N/A"
          }</span>
        </div>
      `;
    }
  } catch (err) {
    console.error("Failed to load property details:", err);
  }
}

function setMainImage(thumbnail, index) {
  const mainImageElement = document.getElementById("mainImage");
  if (mainImageElement && images[index]) {
    mainImageElement.src = images[index];

    document.querySelectorAll(".thumbnail").forEach((thumb) => {
      thumb.classList.remove("active");
    });
    thumbnail.classList.add("active");

    currentImageIndex = index;
  }
}

function changeImage(direction) {
  currentImageIndex += direction;

  if (currentImageIndex >= images.length) {
    currentImageIndex = 0;
  }
  if (currentImageIndex < 0) {
    currentImageIndex = images.length - 1;
  }

  const mainImageElement = document.getElementById("mainImage");
  if (mainImageElement && images[currentImageIndex]) {
    mainImageElement.src = images[currentImageIndex];

    document.querySelectorAll(".thumbnail").forEach((thumb, index) => {
      thumb.classList.toggle("active", index === currentImageIndex);
    });
  }
}

function revealOnScroll() {
  const reveals = document.querySelectorAll(".reveal-element");
  const windowHeight = window.innerHeight;
  const elementVisible = 150;

  reveals.forEach((element) => {
    const elementTop = element.getBoundingClientRect().top;

    if (elementTop < windowHeight - elementVisible) {
      element.classList.add("revealed");
    }
  });
}

function updateImageGallery(newImages) {
  images.length = 0;
  images.push(...newImages);

  const thumbnails = document.querySelectorAll(".thumbnail");
  thumbnails.forEach((thumbnail, index) => {
    if (newImages[index]) {
      thumbnail.src = newImages[index].replace("w=1000", "w=200");
      thumbnail.onclick = () => setMainImage(thumbnail, index);
    }
  });

  currentImageIndex = 0;
  const mainImage = document.getElementById("mainImage");
  if (mainImage && newImages[0]) {
    mainImage.src = newImages[0];
  }
}

window.changeImage = changeImage;
window.setMainImage = setMainImage;
