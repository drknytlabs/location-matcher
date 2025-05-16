const apiUrl = "/match-location";
const status = document.getElementById("status");
const result = document.getElementById("match-result");
const manual = document.getElementById("manual-search");

const input = document.getElementById("address-input");
const list = document.getElementById("autocomplete-list");
const searchBtn = document.getElementById("address-search-btn");
const subdivisionColors = {
  "Meadowbrook Forest": "green",
  "Meadowbrook Hills #1": "blue",
  "Meadowbrook Hills #2": "purple",
  "Meadowbrook Hills #3": "red",
  "Meadowbrook Hills #4": "orange",
  "Meadowbrook Hills": "darkblue",
  "Meadowbrook Woods": "darkgreen"
};

function getColorIcon(color) {
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`,
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
}
function addPropertyMarker({ lat, lng, address, subdivision }) {
  if (!lat || !lng) return;

  const colorKey = subdivisionColors[subdivision] || 'gray'; // fallback
  const marker = L.marker([lat, lng], {
    icon: getColorIcon(colorKey)
  }).addTo(map);

  marker.bindPopup(`<strong>${address}</strong><br>${subdivision}`);
}
// ==========================
// GEOLOCATION MATCH ON LOAD
// ==========================
async function getCurrentPosition() {
  return new Promise((resolve, reject) =>
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    })
  );
}

async function tryGeolocation() {
  try {
    const pos = await getCurrentPosition();
    const lat = pos.coords.latitude;
    const lng = pos.coords.longitude;

    status.textContent = `📍 Location found. Matching...`;

    const res = await fetch(`${apiUrl}?lat=${lat}&lng=${lng}`);
    const data = await res.json();

    if (data.match) {
      showMatchResult(data.match);
      status.textContent = `✅ Address matched!`;
    } else {
      throw new Error("No match");
    }
  } catch (err) {
    console.warn("Geolocation failed or no match:", err);
    status.textContent = "⚠️ Could not detect a match. Search manually.";
    manual?.classList.remove("hidden");
  }
}

tryGeolocation();

// ==========================
// AUTOCOMPLETE SEARCH LOGIC
// ==========================
async function searchAddresses(query) {
  const res = await fetch(`/search-addresses?query=${encodeURIComponent(query)}`);
  return await res.json();
}

function showMatches(matches) {
  list.innerHTML = matches.map(match => `
    <li class="autocomplete-item" data-address="${match.address}">
      ${match.address} — ${match.resident}
    </li>
  `).join('');
}

input?.addEventListener("input", async () => {
  const query = input.value.trim();
  if (!query) {
    list.innerHTML = '';
    return;
  }

  const matches = await searchAddresses(query);
  showMatches(matches);
});

input?.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    handleSearchSubmit();
  }
});

searchBtn?.addEventListener("click", handleSearchSubmit);

list?.addEventListener("click", (e) => {
  const item = e.target.closest(".autocomplete-item");
  if (!item) return;

  input.value = item.dataset.address;
  handleSearchSubmit();
});

async function handleSearchSubmit() {
  const query = input.value.trim();
  if (!query) return;

  const matches = await searchAddresses(query);
  if (matches.length === 0) {
    alert("No address match found.");
    return;
  }

  showMatchResult(matches[0]);
  list.innerHTML = '';
}

// ==========================
// RESULT DISPLAY SHARED FUNC
// ==========================
function showMatchResult(match) {
  document.getElementById("match-address").textContent = match.address;
  document.getElementById("match-resident").textContent = match.resident;
  const isLikelyOwner = match.all_owners?.toLowerCase().includes(match.resident?.toLowerCase());
  const nameWarning = document.getElementById("not-your-name");

  if (!isLikelyOwner) {
  nameWarning.classList.remove("hidden");
} else {
  nameWarning.classList.add("hidden");
}
  const filePath = `/pdfs/${match.deed}`;

  const link = document.getElementById("deed-link");
  link.href = filePath;
  link.style.display = 'inline-block';

  document.getElementById("deed-pdf").src = filePath;
  document.getElementById("download-deed").href = filePath;
  document.getElementById("download-deed").download = `${match.deed}`;
  document.getElementById("deed-pdf-viewer")?.classList.remove("hidden");

  // Populate home facts
  document.getElementById("match-owners").textContent = match.all_owners || 'N/A';
  document.getElementById("fact-subdivision").textContent = match.subdivision || 'N/A';
  document.getElementById("fact-year-built").textContent = match.year_built || 'N/A';
  document.getElementById("fact-bedrooms").textContent = match.bedrooms || 'N/A';
  document.getElementById("fact-baths").textContent = match.baths || 'N/A';
  document.getElementById("fact-lot-size").textContent = match.lot_size_sqft || 'N/A';
  document.getElementById("fact-zoning").textContent = match.zoning || 'N/A';
  document.getElementById("fact-property-type").textContent = match.property_type || 'N/A';
  document.getElementById("fact-garage").textContent = match.garage_type || 'N/A';
  document.getElementById("fact-fireplace").textContent = match.fireplace || 'N/A';
  document.getElementById("fact-pool").textContent = match.pool || 'N/A';
  document.getElementById("fact-stories").textContent = match.stories || 'N/A';
  document.getElementById("fact-acreage").textContent = match.acreage ? `${parseFloat(match.acreage).toFixed(2)} acres` : 'N/A';
  document.getElementById("fact-purchase-date").textContent = match.purchase_date || 'N/A';


  document.getElementById("match-result").classList.remove("hidden");
  document.getElementById("home-facts")?.classList.remove("hidden");
}

function formatCurrency(val) {
  const num = parseFloat(val);
  return isNaN(num) ? 'N/A' : `$${num.toLocaleString()}`;
}
document.getElementById("download-pdf-btn").classList.remove("hidden");

document.getElementById("download-pdf-btn")?.addEventListener("click", () => {
  const element = document.createElement("div");
  element.innerHTML = `
    <h2>🏡 Property Report</h2>
    <p><strong>Address:</strong> ${match.address}</p>
    <p><strong>Resident:</strong> ${match.resident}</p>
    <p><strong>All Owners:</strong> ${match.all_owners}</p>
    <p><strong>Subdivision:</strong> ${match.subdivision}</p>
    <p><strong>Year Built:</strong> ${match.year_built}</p>
    <p><strong>Bedrooms:</strong> ${match.bedrooms}</p>
    <p><strong>Baths:</strong> ${match.baths}</p>
    <p><strong>Lot Size:</strong> ${match.lot_size_sqft}</p>
    <p><strong>Zoning:</strong> ${match.zoning}</p>
    <p><strong>Garage:</strong> ${match.garage_type}</p>
    <p><strong>Pool:</strong> ${match.pool}</p>
    <p><strong>Fireplace:</strong> ${match.fireplace}</p>
    <p><strong>Stories:</strong> ${match.stories}</p>
    <p><strong>Acreage:</strong> ${match.acreage}</p>
    <p><strong>Purchase Date:</strong> ${match.purchase_date}</p>
  `;

  html2pdf()
    .set({ margin: 0.5, filename: `${match.address}_home_facts.pdf` })
    .from(element)
    .save();
});
// Initialize the map
const map = L.map('map').setView([42.441, -83.424], 15); // Adjust zoom & center to your neighborhood

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Sample: Add marker manually (replace this with dynamic loading)
function addPropertyMarker({ lat, lng, address, subdivision }) {
  if (!lat || !lng) return;

  const marker = L.marker([lat, lng]).addTo(map);
  marker.bindPopup(`<strong>${address}</strong><br>${subdivision}`);
}
// Example: Add a marker for the matched property
const matchedProperty = {
  lat: 42.441,
  lng: -83.424,
  address: "123 Main St",
  subdivision: "Downtown"
};
addPropertyMarker(matchedProperty);
